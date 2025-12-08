/*
* Dentro de rmi debemos trabajar con la seguridad
* Establecer ´politicas estrictas en el proyecto
*
* */

import java.rmi.*;
import java.security.*;


public class SecurityManager extends RMISecurityManager{
    //checar permisos
    public void checkPermission(Permission permission) throws SecurityException {
        //solo se imprime la comprobación
        System.out.println("Security check permission: " + permission.toString());
    }
}
