package com.utp.videojuegos.controller;
import java.util.Map;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.converter.HttpMessageNotReadableException;
@RestControllerAdvice
public class ApiErrors {
 @ExceptionHandler(ResponseStatusException.class) ResponseEntity<?> status(ResponseStatusException e){return ResponseEntity.status(e.getStatusCode()).body(Map.of("mensaje",e.getReason()==null?"Solicitud no válida.":e.getReason()));}
 @ExceptionHandler(MethodArgumentNotValidException.class) ResponseEntity<?> validation(MethodArgumentNotValidException e){String message=e.getBindingResult().getFieldErrors().stream().map(f->f.getField()+": "+f.getDefaultMessage()).findFirst().orElse("Datos incompletos.");return ResponseEntity.badRequest().body(Map.of("mensaje",message));}
 @ExceptionHandler({HttpMessageNotReadableException.class,org.springframework.web.method.annotation.MethodArgumentTypeMismatchException.class}) ResponseEntity<?> malformed(Exception e){return ResponseEntity.badRequest().body(Map.of("mensaje","Revisa el formato de los datos enviados."));}
 @ExceptionHandler(IllegalStateException.class) ResponseEntity<?> storage(IllegalStateException e){org.slf4j.LoggerFactory.getLogger(ApiErrors.class).error("Fallo de almacenamiento",e);return ResponseEntity.status(500).body(Map.of("mensaje","No se pudieron guardar los datos. Conserva tu carrito y vuelve a intentarlo."));}
}
