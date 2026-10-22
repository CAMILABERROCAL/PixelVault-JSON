package com.utp.videojuegos.repository;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.utp.videojuegos.model.ShopData.*;
import com.utp.videojuegos.model.Videojuego;
import org.springframework.stereotype.Component;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import jakarta.annotation.PreDestroy;
import java.nio.file.*;
import java.nio.channels.*;
import java.io.IOException;
import java.util.function.Function;

@Component
public class JsonStore {
 private final ObjectMapper mapper;
 private final Path path;
 private final FileChannel channel;
 private final FileLock lock;
 private State state;
 public JsonStore(ObjectMapper mapper, PasswordEncoder encoder,
   @Value("${app.data-dir}") String directory,
   @Value("${app.admin-email}") String email,
   @Value("${app.admin-password}") String password) throws IOException {
  this.mapper=mapper; Path dir=Path.of(directory).toAbsolutePath(); Files.createDirectories(dir);
  path=dir.resolve("tienda.json"); channel=FileChannel.open(dir.resolve("tienda.lock"), StandardOpenOption.CREATE, StandardOpenOption.WRITE);
  lock=channel.tryLock();
  if(lock==null) {channel.close();throw new IOException("La carpeta de datos ya esta en uso por otra instancia.");}
  try {
   if(Files.exists(path)) {
    state=mapper.readValue(path.toFile(), State.class);
    if(state==null || state.version!=1 || state.videojuegos==null || state.usuarios==null || state.pedidos==null)
     throw new IOException("Archivo JSON incompatible. Conserve el archivo y revise su contenido.");
   } else {
    if(password.length()<12) throw new IOException("La clave inicial del administrador debe tener al menos 12 caracteres.");
    state=new State();
    state.usuarios.add(new Account(1,"Administrador","PixelVault",email.trim().toLowerCase(java.util.Locale.ROOT),encoder.encode(password),"ADMIN"));
    state.videojuegos.add(game(1,"The Legend of Zelda: Tears of the Kingdom","Aventura","Nintendo Switch",219.90,12,"/img/zelda.jpg","Explora Hyrule y descubre una aventura entre el cielo y la tierra."));
    state.videojuegos.add(game(2,"EA Sports FC 24","Deportes","PlayStation",159.90,20,"/img/ea-sports.jpg","Lleva tu equipo a la victoria. Vive la emoción del fútbol."));
    state.videojuegos.add(game(3,"God of War Ragnarök","Acción","PlayStation",199.90,8,"/img/god-of-war.jpg","Acompaña a Kratos y Atreus en su viaje por los nueve reinos."));
    save(state);
   }
  } catch(IOException|RuntimeException ex) { lock.release(); channel.close(); throw ex; }
 }
 private Videojuego game(long id,String title,String genre,String platform,double price,int stock,String image,String description) {
  Videojuego g=new Videojuego(id,title,genre,price,stock,image);g.setPlataforma(platform);g.setDescripcion(description);return g;
 }
 private State copy() {return mapper.convertValue(state, State.class);}
 public synchronized <T> T read(Function<State,T> operation) {return operation.apply(copy());}
 public synchronized <T> T update(Function<State,T> operation) {
  State next=copy(); T result=operation.apply(next);
  try {save(next);} catch(IOException e) {throw new IllegalStateException("No se pudieron guardar los datos. No se aplico la operacion.",e);}
  state=next;return result;
 }
 private void save(State next) throws IOException {
  Path temp=Files.createTempFile(path.getParent(),"tienda-",".tmp");
  try {
   byte[] bytes=mapper.writerWithDefaultPrettyPrinter().writeValueAsBytes(next);
   try(FileChannel out=FileChannel.open(temp,StandardOpenOption.WRITE)) {java.nio.ByteBuffer buffer=java.nio.ByteBuffer.wrap(bytes);while(buffer.hasRemaining())out.write(buffer);out.force(true);}
   // Fail instead of risking a partially written state on filesystems without atomic moves.
   Files.move(temp,path,StandardCopyOption.ATOMIC_MOVE,StandardCopyOption.REPLACE_EXISTING);
  } finally {Files.deleteIfExists(temp);}
 }
 @PreDestroy public void close() throws IOException {if(lock.isValid())lock.release();channel.close();}
}
