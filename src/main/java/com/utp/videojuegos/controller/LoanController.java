package com.utp.videojuegos.controller;

import com.utp.videojuegos.model.ShopData.*;
import com.utp.videojuegos.controller.ShopController.Item;
import com.utp.videojuegos.model.Videojuego;
import com.utp.videojuegos.repository.JsonStore;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.time.*;
import java.util.*;

@RestController
public class LoanController {
 private static final ZoneId ZONE = ZoneId.of("America/Lima");
 private final JsonStore store;
 public LoanController(JsonStore store) { this.store = store; }
 public record Request(@NotEmpty @Size(max=50) List<@NotNull @Valid Item> items,
                       @NotBlank @Size(max=64) String clave) {}

 private Loan view(Loan loan) {
  String status = loan.estado();
  if ("ACTIVO".equals(status) && LocalDate.now(ZONE).isAfter(LocalDate.parse(loan.fechaLimite())))
   status = "VENCIDO";
  return new Loan(loan.id(), loan.usuario(), loan.fecha(), loan.fechaLimite(),
                  loan.fechaDevolucion(), status, loan.clave(), loan.items());
 }

 @PostMapping("/api/prestamos")
 public Loan borrow(@Valid @RequestBody Request request, Authentication auth) {
  try { UUID.fromString(request.clave()); }
  catch (IllegalArgumentException ex) { throw error(HttpStatus.BAD_REQUEST, "Identificador de solicitud no válido."); }
  return store.update(s -> {
   Map<Long,Integer> amounts = new LinkedHashMap<>();
   for (var item : request.items()) amounts.merge(item.videojuegoId(), item.cantidad(), Integer::sum);
   var previous = s.prestamos.stream().filter(l -> l.usuario().equals(auth.getName()) && l.clave().equals(request.clave())).findFirst();
   if (previous.isPresent()) {
    Map<Long,Integer> original = new LinkedHashMap<>();
    previous.get().items().forEach(i -> original.put(i.videojuegoId(), i.cantidad()));
    if (!original.equals(amounts)) throw error(HttpStatus.CONFLICT, "La solicitud ya se utilizó con otros libros.");
    return view(previous.get());
   }
   List<LoanLine> lines = new ArrayList<>();
   for (var entry : amounts.entrySet()) {
    if (entry.getValue() > 99) throw error(HttpStatus.BAD_REQUEST, "Máximo 99 ejemplares por título.");
    Videojuego book = s.videojuegos.stream()
      .filter(b -> b.getId().equals(entry.getKey()) && Boolean.TRUE.equals(b.getActivo()))
      .findFirst().orElseThrow(() -> error(HttpStatus.CONFLICT, "Un libro ya no está disponible."));
    if (book.getStock() < entry.getValue()) throw error(HttpStatus.CONFLICT, "Ejemplares insuficientes: " + book.getTitulo());
    lines.add(new LoanLine(book.getId(), book.getTitulo(), entry.getValue()));
   }
   s.videojuegos.forEach(b -> {
    if (amounts.containsKey(b.getId())) b.setStock(b.getStock() - amounts.get(b.getId()));
   });
   Loan loan = new Loan(UUID.randomUUID().toString(), auth.getName(), Instant.now().toString(),
       LocalDate.now(ZONE).plusDays(7).toString(), null, "ACTIVO", request.clave(), List.copyOf(lines));
   s.prestamos.add(loan);
   return loan;
  });
 }

 @GetMapping("/api/prestamos")
 public List<Loan> mine(Authentication auth) {
  return store.read(s -> s.prestamos.stream().filter(l -> l.usuario().equals(auth.getName()))
    .sorted(Comparator.comparing(Loan::fecha).reversed()).map(this::view).toList());
 }

 @GetMapping("/api/admin/prestamos")
 public List<Loan> all() {
  return store.read(s -> s.prestamos.stream().sorted(Comparator.comparing(Loan::fecha).reversed())
    .map(this::view).toList());
 }

 @PostMapping("/api/admin/prestamos/{id}/devolucion")
 public Loan giveBack(@PathVariable String id) {
  return store.update(s -> {
   int index = -1;
   for (int i=0; i<s.prestamos.size(); i++) if (s.prestamos.get(i).id().equals(id)) index=i;
   if (index < 0) throw error(HttpStatus.NOT_FOUND, "Préstamo no encontrado.");
   Loan loan = s.prestamos.get(index);
   if ("DEVUELTO".equals(loan.estado())) return loan;
   for (LoanLine line : loan.items()) {
    Videojuego book = s.videojuegos.stream().filter(b -> b.getId().equals(line.videojuegoId()))
      .findFirst().orElseThrow(() -> error(HttpStatus.CONFLICT, "Falta un libro del préstamo en el inventario."));
    book.setStock(Math.addExact(book.getStock(), line.cantidad()));
   }
   Loan returned = new Loan(loan.id(), loan.usuario(), loan.fecha(), loan.fechaLimite(),
       Instant.now().toString(), "DEVUELTO", loan.clave(), loan.items());
   s.prestamos.set(index, returned);
   return returned;
  });
 }
 private ResponseStatusException error(HttpStatus status, String message) {
  return new ResponseStatusException(status, message);
 }
}
