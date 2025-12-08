import java.net.MalformedURLException;
import java.rmi.*;

public class HelloClient {
    private static String host = "localhost";

    public static void main(String[] args) {
        //instalar SM
        if(System.getSecurityManager() == null) {
            System.setSecurityManager(new SecurityManager());
        }

        try{
            Hello greeting = (Hello) Naming.lookup("rmi://"+host+"/hello");

            //invocar al objeto como si fuese local
            System.out.println("Mensaje recibido: "+ greeting.getGreeting());
        }catch(NotBoundException | MalformedURLException | RemoteException conEx){
            System.out.println("No se puede conectar con el servidor");
        }catch(Exception e){
            e.printStackTrace();
            System.exit(1);
        }
    }
}
