package com.utp.videojuegos.controller;
import com.utp.videojuegos.repository.JsonStore;
import com.utp.videojuegos.model.Videojuego;
import com.utp.videojuegos.model.ShopData.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.*;

@RestController
public class ShopController {
 private final JsonStore store; private final PasswordEncoder encoder;
 public ShopController(JsonStore store,PasswordEncoder encoder){this.store=store;this.encoder=encoder;}
 public record Registration(@NotBlank @Size(max=100) String nombre,@NotBlank @Size(max=100) String apellido,@NotBlank @Email @Size(max=150) String correo,@NotBlank @Size(min=8,max=64) String password){}
 public record Item(@NotNull @Positive Long videojuegoId,@Min(1) @Max(99) int cantidad){}
 public record Checkout(@NotEmpty @Size(max=50) List<@NotNull @Valid Item> items,@NotBlank String metodo,@NotBlank String resultado,@NotBlank @Size(max=64) String clave){}
 public record Product(@NotBlank @Size(max=150) String titulo,@Size(max=3000) String descripcion,@NotBlank @Size(max=80) String genero,@NotBlank @Size(max=80) String plataforma,@DecimalMin("0.00") @DecimalMax("99999.99") @Digits(integer=5,fraction=2) BigDecimal precio,@NotNull @Min(0) @Max(100000) Integer stock,@Size(max=500) String imagenUrl,@NotNull Boolean activo){}
 @GetMapping("/api/csrf") public Map<String,String> csrf(CsrfToken t){return Map.of("token",t.getToken(),"headerName",t.getHeaderName(),"parameterName",t.getParameterName());}
 @GetMapping("/api/me") public Map<String,Object> me(Authentication auth) {
  if(auth==null)return Map.of("autenticado",false);
  return store.read(s -> s.usuarios.stream().filter(u->u.correo().equals(auth.getName())).findFirst().<Map<String,Object>>map(u->Map.of("autenticado",true,"nombre",u.nombre(),"correo",u.correo(),"rol",u.rol())).orElse(Map.of("autenticado",false)));
 }
 @PostMapping("/api/auth/registro") @ResponseStatus(HttpStatus.CREATED)
 public Map<String,String> register(@Valid @RequestBody Registration r) {
  String email=r.correo().trim().toLowerCase(Locale.ROOT);
  if(r.nombre().trim().isEmpty()||r.apellido().trim().isEmpty())throw bad("Completa tu nombre y apellido.");
  if(r.password().getBytes(java.nio.charset.StandardCharsets.UTF_8).length>72)throw bad("La contraseña es demasiado larga para BCrypt.");
  String hash=encoder.encode(r.password());
  return store.update(s->{
   if(s.usuarios.stream().anyMatch(u->u.correo().equals(email)))throw new ResponseStatusException(HttpStatus.CONFLICT,"El correo ya está registrado.");
   long id=s.usuarios.stream().mapToLong(Account::id).max().orElse(0)+1;
   s.usuarios.add(new Account(id,r.nombre().trim(),r.apellido().trim(),email,hash,"CLIENTE"));
   return Map.of("mensaje","Cuenta creada. Ya puedes iniciar sesión.");
  });
 }
 @GetMapping("/api/videojuegos") public List<Videojuego> games(Authentication auth) {
  boolean admin=auth!=null&&auth.getAuthorities().stream().anyMatch(a->a.getAuthority().equals("ROLE_ADMIN"));
  return store.read(s->s.videojuegos.stream().filter(g->admin||Boolean.TRUE.equals(g.getActivo())).toList());
 }
 @GetMapping("/api/videojuegos/{id}") public Videojuego game(@PathVariable Long id,Authentication auth){
  return games(auth).stream().filter(g->g.getId().equals(id)).findFirst().orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Videojuego no encontrado."));
 }
 private Videojuego product(Long id,Product p) {
  String image=p.imagenUrl()==null?"":p.imagenUrl().trim();
  if(!image.isEmpty()&&!image.startsWith("/img/")&&!image.startsWith("https://"))throw bad("La imagen debe ser una URL https o una ruta /img/.");
  Videojuego g=new Videojuego();g.setId(id);g.setTitulo(p.titulo().trim());g.setDescripcion(p.descripcion()==null?"":p.descripcion().trim());g.setGenero(p.genero().trim());g.setPlataforma(p.plataforma().trim());g.setPrecio(p.precio()==null?BigDecimal.ZERO:p.precio());g.setStock(p.stock());g.setImagenUrl(image);g.setActivo(p.activo());return g;
 }
 @PostMapping("/api/videojuegos") @ResponseStatus(HttpStatus.CREATED) public Videojuego add(@Valid @RequestBody Product p){return store.update(s->{Videojuego g=product(s.nextGameId++,p);s.videojuegos.add(g);return g;});}
 @PutMapping("/api/videojuegos/{id}") public Videojuego edit(@PathVariable Long id,@Valid @RequestBody Product p){return store.update(s->{int i=-1;for(int n=0;n<s.videojuegos.size();n++)if(s.videojuegos.get(n).getId().equals(id))i=n;if(i<0)throw new ResponseStatusException(HttpStatus.NOT_FOUND,"Videojuego no encontrado.");Videojuego g=product(id,p);s.videojuegos.set(i,g);return g;});}
 @DeleteMapping("/api/videojuegos/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) public void delete(@PathVariable Long id){store.update(s->{if(s.prestamos.stream().anyMatch(l->!"DEVUELTO".equals(l.estado())&&l.items().stream().anyMatch(i->i.videojuegoId()==id)))throw new ResponseStatusException(HttpStatus.CONFLICT,"No puedes eliminar un libro con préstamos pendientes. Puedes ocultarlo.");if(!s.videojuegos.removeIf(g->g.getId().equals(id)))throw new ResponseStatusException(HttpStatus.NOT_FOUND,"Videojuego no encontrado.");return true;});}
 @PostMapping("/api/pedidos") public Order checkout(@Valid @RequestBody Checkout c,Authentication auth) {
  if(!Set.of("TARJETA_DEMO","YAPE_DEMO").contains(c.metodo()))throw bad("Método de pago no admitido.");
  if(!Set.of("APROBADO","RECHAZADO").contains(c.resultado()))throw bad("Resultado de simulación no válido.");
  try{UUID.fromString(c.clave());}catch(IllegalArgumentException e){throw bad("Identificador de pago no válido.");}
  return store.update(s->{
   Optional<Order> previous=s.pedidos.stream().filter(o->o.usuario().equals(auth.getName())&&o.clave().equals(c.clave())).findFirst();
   if(previous.isPresent())return previous.get();
   Map<Long,Integer> amounts=new LinkedHashMap<>();
   for(Item i:c.items())amounts.merge(i.videojuegoId(),i.cantidad(),Integer::sum);
   List<Line> lines=new ArrayList<>();BigDecimal total=BigDecimal.ZERO;
   for(var entry:amounts.entrySet()){
    if(entry.getValue()>99)throw bad("Máximo 99 unidades por videojuego.");
    Videojuego g=s.videojuegos.stream().filter(v->v.getId().equals(entry.getKey())&&Boolean.TRUE.equals(v.getActivo())).findFirst().orElseThrow(()->new ResponseStatusException(HttpStatus.CONFLICT,"Un videojuego ya no está disponible. Actualiza el carrito."));
    if(g.getStock()<entry.getValue())throw new ResponseStatusException(HttpStatus.CONFLICT,"Stock insuficiente para "+g.getTitulo()+".");
    lines.add(new Line(g.getId(),g.getTitulo(),g.getPrecio(),entry.getValue()));total=total.add(g.getPrecio().multiply(BigDecimal.valueOf(entry.getValue())));
   }
   if(c.resultado().equals("RECHAZADO"))throw new ResponseStatusException(HttpStatus.PAYMENT_REQUIRED,"Pago simulado rechazado. No se cobró ni se descontó stock.");
   for(Videojuego g:s.videojuegos)if(amounts.containsKey(g.getId()))g.setStock(g.getStock()-amounts.get(g.getId()));
   Order order=new Order(UUID.randomUUID().toString(),auth.getName(),Instant.now().toString(),c.metodo(),"PAGADO_DEMO",total,c.clave(),List.copyOf(lines));s.pedidos.add(order);return order;
  });
 }
 @GetMapping("/api/pedidos") public List<Order> orders(Authentication auth){return store.read(s->s.pedidos.stream().filter(o->o.usuario().equals(auth.getName())).sorted(Comparator.comparing(Order::fecha).reversed()).toList());}
 @GetMapping("/api/admin/pedidos") public List<Order> allOrders(){return store.read(s->s.pedidos.stream().sorted(Comparator.comparing(Order::fecha).reversed()).toList());}
 @PostMapping("/api/pedidos/{id}/devolver") public Order devolver(@PathVariable String id,Authentication auth){
  return store.update(s->{
   int i=-1;
   for(int n=0;n<s.pedidos.size();n++){Order o=s.pedidos.get(n);if(o.id().equals(id)&&o.usuario().equals(auth.getName()))i=n;}
   if(i<0)throw new ResponseStatusException(HttpStatus.NOT_FOUND,"Pedido no encontrado.");
   Order o=s.pedidos.get(i);
   if("DEVUELTO".equals(o.estado()))throw new ResponseStatusException(HttpStatus.CONFLICT,"Este pedido ya fue devuelto.");
   for(Line l:o.items())for(Videojuego g:s.videojuegos)if(g.getId().equals(l.videojuegoId()))g.setStock(g.getStock()+l.cantidad());
   Order devuelto=new Order(o.id(),o.usuario(),o.fecha(),o.metodo(),"DEVUELTO",o.total(),o.clave(),o.items());
   s.pedidos.set(i,devuelto);return devuelto;
  });
 }
 private ResponseStatusException bad(String text){return new ResponseStatusException(HttpStatus.BAD_REQUEST,text);}
}

