/*
* Arquitectura cliente-servidor
* */

import java.rmi.*;

public class HelloServer {
    private static final String host = "localhost";

    public static void main(String[] args) throws Exception {
        //creamos una referencia el objetos de implementacion
        HelloImpl temp = new HelloImpl();

        //debemoa creae la url del objeto rmi
        String rmiObjectname= "rmi://"+host+"/hello";

        //para registrar el objeto
        Naming.rebind(rmiObjectname, temp);
        System.out.println("Registro completo del servidor. listo para empezar");
    }
}
