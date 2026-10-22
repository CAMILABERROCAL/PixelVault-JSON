package com.utp.videojuegos.config;
import com.utp.videojuegos.repository.JsonStore;
import org.springframework.context.annotation.*;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.userdetails.*;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

// Configuración de seguridad Spring Security: autenticación BCrypt y control de accesos por roles
@Configuration
public class SecurityConfig {
 @Bean PasswordEncoder passwordEncoder() {return new BCryptPasswordEncoder();}
 @Bean UserDetailsService userDetailsService(JsonStore store) {
  return email -> store.read(s -> s.usuarios.stream().filter(u -> u.correo().equals(email.trim().toLowerCase(java.util.Locale.ROOT))).findFirst()
    .map(u -> User.withUsername(u.correo()).password(u.passwordHash()).roles(u.rol()).build())
    .orElseThrow(() -> new UsernameNotFoundException("Credenciales incorrectas")));
 }
 @Bean SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
  http.authorizeHttpRequests(a -> a
   .requestMatchers("/","/index.html","/login.html","/registro.html","/carrito.html","/css/**","/js/**","/img/**","/error","/api/csrf","/api/me").permitAll()
   .requestMatchers(HttpMethod.GET,"/api/videojuegos","/api/videojuegos/*").permitAll()
   .requestMatchers(HttpMethod.POST,"/api/auth/registro").permitAll()
   .requestMatchers("/admin.html","/api/admin/**","/api/videojuegos/**","/api/videojuegos").hasRole("ADMIN")
   .anyRequest().authenticated())
   .requestCache(c -> c.disable())
   .formLogin(f -> f.loginPage("/login.html").loginProcessingUrl("/procesar-login").usernameParameter("correo").passwordParameter("password")
     .successHandler((req,res,auth)->{res.setContentType("application/json;charset=UTF-8");res.getWriter().write("{\"ok\":true}");})
     .failureHandler((req,res,ex)->{res.setStatus(401);res.setContentType("application/json;charset=UTF-8");res.getWriter().write("{\"mensaje\":\"Correo o contraseña incorrectos.\"}");}).permitAll())
   .logout(l -> l.logoutUrl("/logout").logoutSuccessHandler((req,res,auth)->res.setStatus(204)))
   .exceptionHandling(e -> e.authenticationEntryPoint((req,res,ex)->{
     if(req.getRequestURI().startsWith("/api/")){res.setStatus(401);res.setContentType("application/json;charset=UTF-8");res.getWriter().write("{\"mensaje\":\"Inicia sesión para continuar.\"}");}
     else {String uri=req.getRequestURI();String next=uri.equals("/pago.html")?"pagar":uri.equals("/pedidos.html")?"pedidos":"admin";res.sendRedirect("/login.html?next="+next);}
   }).accessDeniedHandler((req,res,ex)->{
    res.setStatus(403);res.setContentType("application/json;charset=UTF-8");res.getWriter().write("{\"mensaje\":\"No tienes permiso o el token de seguridad venció. Recarga la página.\"}");
   }));
  return http.build();
 }
}
