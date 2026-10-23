package com.utp.videojuegos;
import com.fasterxml.jackson.databind.*;
import com.utp.videojuegos.repository.JsonStore;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import java.nio.file.*;
import java.util.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.*;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest @AutoConfigureMockMvc
class PrestamosIntegrationTest {
    static final Path dir;
    static {try {dir=Files.createTempDirectory("prestamos-test-");}catch(Exception e){throw new RuntimeException(e);}}
    @DynamicPropertySource static void props(DynamicPropertyRegistry r){r.add("app.data-dir",()->dir.toString());}
    @Autowired MockMvc mvc; @Autowired ObjectMapper mapper; @Autowired JsonStore store;

    @BeforeEach void reset(){store.update(s->{s.pedidos.clear();s.videojuegos.forEach(g->g.setStock(12));return true;});}
    String prestamo(int cantidad){return "{\"items\":[{\"videojuegoId\":1,\"cantidad\":"+cantidad+"}],\"metodo\":\"TARJETA_DEMO\",\"resultado\":\"APROBADO\",\"clave\":\""+UUID.randomUUID()+"\"}";}
    int disponibles(){return store.read(s->s.videojuegos.get(0).getStock());}
    String prestar(String usuario,int cantidad) throws Exception {
        String json=mvc.perform(post("/api/pedidos").with(user(usuario)).with(csrf()).contentType("application/json").content(prestamo(cantidad))).andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        return mapper.readTree(json).get("id").asText();
    }

    @Test void prestarReduceLosEjemplaresDisponibles() throws Exception {
        prestar("alumno@example.com",2);
        assertEquals(10,disponibles());
    }
    @Test void noPermitePrestarSinDisponibilidad() throws Exception {
        store.update(s->{s.videojuegos.get(0).setStock(1);return true;});
        mvc.perform(post("/api/pedidos").with(user("alumno@example.com")).with(csrf()).contentType("application/json").content(prestamo(2))).andExpect(status().isConflict());
        assertEquals(1,disponibles());
        assertEquals(0,(int)store.read(s->s.pedidos.size()));
    }
    @Test void devolverReponeLosEjemplaresUnaSolaVez() throws Exception {
        String id=prestar("alumno@example.com",2);
        assertEquals(10,disponibles());
        mvc.perform(post("/api/pedidos/"+id+"/devolver").with(user("alumno@example.com")).with(csrf())).andExpect(status().isOk()).andExpect(jsonPath("$.estado").value("DEVUELTO"));
        assertEquals(12,disponibles());
        mvc.perform(post("/api/pedidos/"+id+"/devolver").with(user("alumno@example.com")).with(csrf())).andExpect(status().isConflict());
        assertEquals(12,disponibles());
    }
    @Test void soloElDuenoPuedeDevolver() throws Exception {
        String id=prestar("alumno@example.com",1);
        mvc.perform(post("/api/pedidos/"+id+"/devolver").with(user("otro@example.com")).with(csrf())).andExpect(status().isNotFound());
        assertEquals(11,disponibles());
    }
}
