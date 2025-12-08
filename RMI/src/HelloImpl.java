/*
* Creamos la implementación es decir,
* una clase que contenga ña lógica del objeto remoto
* */

import java.rmi.*;
import java.rmi.server.*;


public class HelloImpl extends UnicastRemoteObject implements Hello {
    public HelloImpl() throws RemoteException {

    }
    //implementar el metodo remoto
    public String getGreeting() throws RemoteException {
        return "Hola, los saludo desde el servidor RMI sefuro xd";
    }
}
