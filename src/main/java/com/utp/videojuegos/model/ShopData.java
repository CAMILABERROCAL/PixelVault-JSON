package com.utp.videojuegos.model;
import java.math.BigDecimal;
import java.util.*;
public class ShopData {
 public static class State {
  public int version = 1;
  public long nextGameId = 4;
  public List<Videojuego> videojuegos = new ArrayList<>();
  public List<Account> usuarios = new ArrayList<>();
  public List<Order> pedidos = new ArrayList<>();
 }
 public record Account(long id, String nombre, String apellido, String correo, String passwordHash, String rol) {}
 public record Order(String id, String usuario, String fecha, String metodo, String estado, BigDecimal total, String clave, List<Line> items) {}
 public record Line(long videojuegoId, String titulo, BigDecimal precio, int cantidad) {}
}
