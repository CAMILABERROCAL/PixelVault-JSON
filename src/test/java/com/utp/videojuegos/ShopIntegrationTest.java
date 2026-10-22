package com.utp.videojuegos;
import com.fasterxml.jackson.databind.*;
import com.utp.videojuegos.repository.JsonStore;
import com.utp.videojuegos.model.ShopData.*;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import java.nio.file.*;
import java.util.*;
import java.util.concurrent.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.*;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest @AutoConfigureMockMvc
class ShopIntegrationTest {
 static final Path dir;
 static {try {dir=Files.createTempDirectory("pixelvault-test-");}catch(Exception e){throw new RuntimeException(e);}}
 @DynamicPropertySource static void props(DynamicPropertyRegistry r){r.add("app.data-dir",()->dir.toString());}
 @Autowired MockMvc mvc; @Autowired ObjectMapper mapper; @Autowired JsonStore store;
 @BeforeEach void reset(){store.update(s->{s.pedidos.clear();s.videojuegos.forEach(g->g.setStock(12));s.usuarios.removeIf(u->!u.rol().equals("ADMIN"));return true;});}
 String body(int amount,String outcome,String key){return "{\"items\":[{\"videojuegoId\":1,\"cantidad\":"+amount+"}],\"metodo\":\"TARJETA_DEMO\",\"resultado\":\""+outcome+"\",\"clave\":\""+key+"\",\"total\":0.01}";}
 String key(){return UUID.randomUUID().toString();}
 @Test void guestCanBrowseButCannotPayOrAccessAdmin() throws Exception {
  mvc.perform(get("/index.html")).andExpect(status().isOk());
  mvc.perform(get("/carrito.html")).andExpect(status().isOk());
  mvc.perform(get("/api/videojuegos")).andExpect(status().isOk()).andExpect(jsonPath("$[0].titulo").exists());
  mvc.perform(get("/api/me")).andExpect(jsonPath("$.autenticado").value(false));
  mvc.perform(get("/admin.html")).andExpect(status().is3xxRedirection()).andExpect(redirectedUrl("/login.html?next=admin"));
  mvc.perform(get("/pago.html")).andExpect(redirectedUrl("/login.html?next=pagar"));
  mvc.perform(post("/api/pedidos").with(csrf()).contentType("application/json").content(body(1,"APROBADO",key()))).andExpect(status().isUnauthorized());
 }
 @Test void registrationHashesPasswordAndSessionLoginWorks() throws Exception {
  String data="{\"nombre\":\"Ana\",\"apellido\":\"Prueba\",\"correo\":\"ANA@example.com\",\"password\":\"Cliente123!\"}";
  mvc.perform(post("/api/auth/registro").with(csrf()).contentType("application/json").content(data)).andExpect(status().isCreated());
  Account account=store.read(s->s.usuarios.stream().filter(u->u.correo().equals("ana@example.com")).findFirst().orElseThrow());
  assertNotEquals("Cliente123!",account.passwordHash());assertTrue(new BCryptPasswordEncoder().matches("Cliente123!",account.passwordHash()));assertEquals("CLIENTE",account.rol());
  mvc.perform(post("/api/auth/registro").with(csrf()).contentType("application/json").content(data)).andExpect(status().isConflict());
  var result=mvc.perform(post("/procesar-login").with(csrf()).param("correo","ana@example.com").param("password","Cliente123!")).andExpect(status().isOk()).andReturn();
  var session=(MockHttpSession)result.getRequest().getSession(false);
  mvc.perform(get("/api/me").session(session)).andExpect(jsonPath("$.rol").value("CLIENTE")).andExpect(jsonPath("$.passwordHash").doesNotExist());
  mvc.perform(get("/api/admin/pedidos").session(session)).andExpect(status().isForbidden());
  mvc.perform(post("/logout").session(session).with(csrf())).andExpect(status().isNoContent());
 }
 @Test void csrfRequiredAndWrongLoginRejected() throws Exception {
  mvc.perform(post("/api/auth/registro").contentType("application/json").content("{}")).andExpect(status().isForbidden());
  mvc.perform(post("/procesar-login").with(csrf()).param("correo","admin@pixelvault.local").param("password","incorrecta")).andExpect(status().isUnauthorized());
 }
 @Test void adminLoginProtectsPanelAndCanEditStock() throws Exception {
  var result=mvc.perform(post("/procesar-login").with(csrf()).param("correo","admin@pixelvault.local").param("password","AdminDemo2026!")).andExpect(status().isOk()).andReturn();
  var session=(MockHttpSession)result.getRequest().getSession(false);
  mvc.perform(get("/admin.html").session(session)).andExpect(status().isOk());
  String p="{\"titulo\":\"Juego editado\",\"descripcion\":\"Demo\",\"genero\":\"Aventura\",\"plataforma\":\"PC\",\"precio\":10.50,\"stock\":7,\"activo\":true}";
  mvc.perform(put("/api/videojuegos/2").session(session).with(csrf()).contentType("application/json").content(p)).andExpect(status().isOk()).andExpect(jsonPath("$.stock").value(7));
  mvc.perform(put("/api/videojuegos/2").with(user("client").roles("CLIENTE")).with(csrf()).contentType("application/json").content(p)).andExpect(status().isForbidden());
  mvc.perform(put("/api/videojuegos/2").session(session).with(csrf()).contentType("application/json").content(p.replace("10.50","-1"))).andExpect(status().isBadRequest());
 }
 @Test void checkoutRecalculatesPriceAndDuplicateDoesNotChargeTwice() throws Exception {
  String key=key(),payload=body(2,"APROBADO",key);
  String first=mvc.perform(post("/api/pedidos").with(user("buyer@example.com")).with(csrf()).contentType("application/json").content(payload)).andExpect(status().isOk()).andExpect(jsonPath("$.total").value(439.80)).andReturn().getResponse().getContentAsString();
  String second=mvc.perform(post("/api/pedidos").with(user("buyer@example.com")).with(csrf()).contentType("application/json").content(payload)).andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
  assertEquals(mapper.readTree(first).get("id"),mapper.readTree(second).get("id"));
  assertEquals(10,(int)store.read(s->s.videojuegos.get(0).getStock()));assertEquals(1,(int)store.read(s->s.pedidos.size()));
  mvc.perform(get("/api/pedidos").with(user("different@example.com"))).andExpect(jsonPath("$.length()").value(0));
 }
 @Test void rejectionAndOversellLeaveStateUnchanged() throws Exception {
  String before=Files.readString(dir.resolve("tienda.json"));
  mvc.perform(post("/api/pedidos").with(user("buyer")).with(csrf()).contentType("application/json").content(body(1,"RECHAZADO",key()))).andExpect(status().isPaymentRequired());
  assertEquals(before,Files.readString(dir.resolve("tienda.json")));
  mvc.perform(post("/api/pedidos").with(user("buyer")).with(csrf()).contentType("application/json").content(body(20,"APROBADO",key()))).andExpect(status().isConflict());
  assertEquals(before,Files.readString(dir.resolve("tienda.json")));
 }
 @Test void concurrentCheckoutsCannotOversell() throws Exception {
  store.update(s->{s.videojuegos.get(0).setStock(1);return true;});
  ExecutorService pool=Executors.newFixedThreadPool(2);
  Callable<Integer> task=()->mvc.perform(post("/api/pedidos").with(user("buyer")).with(csrf()).contentType("application/json").content(body(1,"APROBADO",key()))).andReturn().getResponse().getStatus();
  try {var futures=pool.invokeAll(List.of(task,task));var codes=new ArrayList<Integer>();for(var f:futures)codes.add(f.get());Collections.sort(codes);assertEquals(List.of(200,409),codes);}finally{pool.shutdownNow();}
  assertEquals(0,(int)store.read(s->s.videojuegos.get(0).getStock()));assertEquals(1,(int)store.read(s->s.pedidos.size()));
 }
 @Test void invalidCheckoutDoesNotChangeState() throws Exception {
  mvc.perform(post("/api/pedidos").with(user("buyer")).with(csrf()).contentType("application/json").content(body(0,"APROBADO",key()))).andExpect(status().isBadRequest());
  mvc.perform(post("/api/pedidos").with(user("buyer")).with(csrf()).contentType("application/json").content("{\"items\":[],\"metodo\":\"TARJETA_DEMO\",\"resultado\":\"APROBADO\",\"clave\":\""+key()+"\"}")).andExpect(status().isBadRequest());
  mvc.perform(post("/api/pedidos").with(user("buyer")).with(csrf()).contentType("application/json").content("{\"items\":[null],\"metodo\":\"TARJETA_DEMO\",\"resultado\":\"APROBADO\",\"clave\":\""+key()+"\"}")).andExpect(status().isBadRequest());
  assertEquals(0,(int)store.read(s->s.pedidos.size()));
 }
 @Test void filePersistsAfterReopeningAndCorruptionIsNotOverwritten() throws Exception {
  Path isolated=Files.createTempDirectory("pv-persist-");
  JsonStore first=new JsonStore(mapper,new BCryptPasswordEncoder(),isolated.toString(),"admin@demo.local","LongPassword123!");
  first.update(s->{s.videojuegos.get(0).setStock(3);return true;});first.close();
  JsonStore reopened=new JsonStore(mapper,new BCryptPasswordEncoder(),isolated.toString(),"other@demo.local","OtherPassword123!");
  assertEquals(3,(int)reopened.read(s->s.videojuegos.get(0).getStock()));assertEquals("admin@demo.local",reopened.read(s->s.usuarios.get(0).correo()));reopened.close();
  Files.writeString(isolated.resolve("tienda.json"),"BROKEN");
  assertThrows(Exception.class,()->new JsonStore(mapper,new BCryptPasswordEncoder(),isolated.toString(),"admin@demo.local","LongPassword123!"));
  assertEquals("BROKEN",Files.readString(isolated.resolve("tienda.json")));
 }
}
