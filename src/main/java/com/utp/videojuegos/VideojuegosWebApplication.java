package com.utp.videojuegos;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

// Punto de entrada principal de la aplicacion Spring Boot y arranque de servicios del catalogo
@SpringBootApplication
public class VideojuegosWebApplication {

    public static void main(String[] args) {
        SpringApplication.run(VideojuegosWebApplication.class, args);
    }

    @Bean
    CommandLineRunner mostrarUrl(@Value("${server.port:8081}") String puerto) {
        return args -> {
            System.out.println("\n==================================================");
            System.out.println(" PixelVault corriendo en:");
            System.out.println(" Catálogo:   http://localhost:" + puerto + "/index.html");
            System.out.println(" Administrar: http://localhost:" + puerto + "/admin.html");
            System.out.println("==================================================\n");
        };
    }   

}
