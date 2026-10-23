package com.utp.videojuegos;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.utp.videojuegos.model.ShopData.*;
import com.utp.videojuegos.repository.JsonStore;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import java.nio.file.*;
import java.time.*;
import java.util.*;
import java.util.concurrent.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.*;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest @AutoConfigureMockMvc
class LoanIntegrationTest {
 static final Path dir;
 static {try {dir=Files.createTempDirectory("aulalibro-test-");}catch(Exception e){throw new RuntimeException(e);}}
 @DynamicPropertySource static void properties(DynamicPropertyRegistry r){r.add("app.data-dir",()->dir.toString());}
 @Autowired MockMvc mvc; @Autowired JsonStore store; @Autowired ObjectMapper mapper;
 @BeforeEach void reset(){store.update(s->{s.prestamos.clear();s.videojuegos.forEach(b->b.setStock(10));return true;});}
 String payload(int n,String key){return "{\"items\":[{\"videojuegoId\":1,\"cantidad\":"+n+"}],\"clave\":\""+key+"\"}";}
 String borrow(int n,String key) throws Exception {
  return mvc.perform(post("/api/prestamos").with(user("reader")).with(csrf()).contentType("application/json").content(payload(n,key)))
   .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
 }
 @Test void sevenDaysAndIdempotentRequestPersistWithoutPrices() throws Exception {
  String key=UUID.randomUUID().toString();
  var first=mapper.readTree(borrow(2,key));
  var second=mapper.readTree(borrow(2,key));
  assertEquals(first.get("id"),second.get("id"));
  assertEquals(LocalDate.now(ZoneId.of("America/Lima")).plusDays(7).toString(),first.get("fechaLimite").asText());
  assertFalse(first.has("total"));assertFalse(first.get("items").get(0).has("precio"));
  assertEquals(8,(int)store.read(s->s.videojuegos.get(0).getStock()));
  var saved=mapper.readValue(dir.resolve("tienda.json").toFile(),State.class);
  assertEquals(1,saved.prestamos.size());
  mvc.perform(get("/api/prestamos").with(user("other"))).andExpect(jsonPath("$.length()").value(0));
  mvc.perform(post("/api/prestamos").with(user("reader")).with(csrf()).contentType("application/json").content(payload(3,key))).andExpect(status().isConflict());
 }
 @Test void returnOnlyByAdminRestoresStockOnce() throws Exception {
  String id=mapper.readTree(borrow(2,UUID.randomUUID().toString())).get("id").asText();
  String route="/api/admin/prestamos/"+id+"/devolucion";
  mvc.perform(post(route).with(user("reader")).with(csrf())).andExpect(status().isForbidden());
  for(int i=0;i<2;i++)mvc.perform(post(route).with(user("librarian").roles("ADMIN")).with(csrf()))
   .andExpect(status().isOk()).andExpect(jsonPath("$.estado").value("DEVUELTO")).andExpect(jsonPath("$.fechaDevolucion").isNotEmpty());
  assertEquals(10,(int)store.read(s->s.videojuegos.get(0).getStock()));
 }
 @Test void authCsrfAndValidation() throws Exception {
  String data=payload(1,UUID.randomUUID().toString());
  mvc.perform(post("/api/prestamos").with(csrf()).contentType("application/json").content(data)).andExpect(status().isUnauthorized());
  mvc.perform(post("/api/prestamos").with(user("reader")).contentType("application/json").content(data)).andExpect(status().isForbidden());
  mvc.perform(post("/api/prestamos").with(user("reader")).with(csrf()).contentType("application/json").content(payload(0,UUID.randomUUID().toString()))).andExpect(status().isBadRequest());
  mvc.perform(post("/api/prestamos").with(user("reader")).with(csrf()).contentType("application/json").content(payload(11,UUID.randomUUID().toString()))).andExpect(status().isConflict());
  assertEquals(0,(int)store.read(s->s.prestamos.size()));
  assertEquals(10,(int)store.read(s->s.videojuegos.get(0).getStock()));
 }
 @Test void activeBookCannotBeDeletedAndOverdueIsDerived() throws Exception {
  borrow(1,UUID.randomUUID().toString());
  mvc.perform(delete("/api/videojuegos/1").with(user("admin").roles("ADMIN")).with(csrf())).andExpect(status().isConflict());
  store.update(s->{Loan l=s.prestamos.get(0);s.prestamos.set(0,new Loan(l.id(),l.usuario(),l.fecha(),LocalDate.now(ZoneId.of("America/Lima")).minusDays(1).toString(),null,"ACTIVO",l.clave(),l.items()));return true;});
  mvc.perform(get("/api/prestamos").with(user("reader"))).andExpect(jsonPath("$[0].estado").value("VENCIDO"));
 }
 @Test void concurrentLoansCannotOversell() throws Exception {
  store.update(s->{s.videojuegos.get(0).setStock(1);return true;});
  ExecutorService pool=Executors.newFixedThreadPool(2);
  Callable<Integer> task=()->mvc.perform(post("/api/prestamos").with(user("reader")).with(csrf()).contentType("application/json").content(payload(1,UUID.randomUUID().toString()))).andReturn().getResponse().getStatus();
  try{var codes=new ArrayList<Integer>();for(var f:pool.invokeAll(List.of(task,task)))codes.add(f.get());Collections.sort(codes);assertEquals(List.of(200,409),codes);}finally{pool.shutdownNow();}
 }
 @Test void oldJsonLoadsWithEmptyLoansAndBookNeedsNoPrice() throws Exception {
  State old=mapper.readValue("{\"version\":1,\"pedidos\":[]}",State.class);
  assertNotNull(old.prestamos);assertTrue(old.prestamos.isEmpty());
  mvc.perform(post("/api/videojuegos").with(user("admin").roles("ADMIN")).with(csrf()).contentType("application/json")
   .content("{\"titulo\":\"Libro escolar\",\"genero\":\"Literatura\",\"plataforma\":\"Autor\",\"stock\":2,\"activo\":true}"))
   .andExpect(status().isCreated()).andExpect(jsonPath("$.precio").value(0));
 }
}
