package com.utp.videojuegos.model;


import java.math.BigDecimal;


public class Videojuego {


    private Long id;

    private String titulo;

    private String descripcion;

    private String genero;

    private String plataforma;

    private BigDecimal precio;

    private Integer stock;

    private String imagenUrl;

    private Boolean activo = true;

    public Videojuego() {
    }

    public Videojuego(Long id, String titulo, String genero,
                      Double precio, Integer stock, String imagenUrl) {
        this.id = id;
        this.titulo = titulo;
        this.genero = genero;
        this.precio = precio == null ? null : BigDecimal.valueOf(precio);
        this.stock = stock;
        this.imagenUrl = imagenUrl;
        this.plataforma = "PC";
        this.activo = true;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitulo() {
        return titulo;
    }

    public void setTitulo(String titulo) {
        this.titulo = titulo;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public String getGenero() {
        return genero;
    }

    public void setGenero(String genero) {
        this.genero = genero;
    }

    public String getPlataforma() {
        return plataforma;
    }

    public void setPlataforma(String plataforma) {
        this.plataforma = plataforma;
    }

    public BigDecimal getPrecio() {
        return precio;
    }

    public void setPrecio(BigDecimal precio) {
        this.precio = precio;
    }

    public Integer getStock() {
        return stock;
    }

    public void setStock(Integer stock) {
        this.stock = stock;
    }

    public String getImagenUrl() {
        return imagenUrl;
    }

    public void setImagenUrl(String imagenUrl) {
        this.imagenUrl = imagenUrl;
    }

    public Boolean getActivo() {
        return activo;
    }

    public void setActivo(Boolean activo) {
        this.activo = activo;
    }
}