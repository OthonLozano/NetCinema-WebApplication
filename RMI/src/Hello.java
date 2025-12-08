
/*
* RMI: REMOTE-METHON-INVOCATION
*
* PUERTO DEAFULT 1099
*
* Establecer un contrato RMI, esta clase contrato debe ser
* pública y extender java.rmi.remote
* */

import java.rmi.*;


public interface Hello extends Remote{
    public String getGreeting() throws RemoteException;
}
