# App Licorera

## Integrantes

- Esteban Ramirez Caceres
- Santiago Escobar Velez
- David Santiago Valencia Echeverry

## Arquitectura 

El usuario en esta app en un administrador/empleado de una licorera, el cual puede realizar las siguientes acciones:
- Agregar un nuevo producto a la base de datos: Genera un post request que el backend recibe y almacena en la base de datos, al usuario se le muestra el nuevo producto creado.
- Editar un producto: Genera un put request que el backend recibe y actualiza *todo* el producto en la base de datos, al usuario se le muestra el producto actualizado.
- Eliminar un producto: Genera un delete request que el backend recibe y elimina el producto de la base de datos, al usuario se le muestra la lista con el producto eliminado.
- Modificar cantidad: Para que el usuario modifique la cantidad disponible de un producto, se genera un patch request, este solo afectará la propiedad "cantidad", el backend recibe el request y actualiza la cantidad del producto en la base de datos, al usuario se le muestra el producto con la cantidad actualizada.
- Ver productos: El usuario tendrá una interfaz donde vea todos los productos, además, tendrá un buscador. Ambos recolectan se recolectan de un get. La interfaz natural será un get para obtener todos los productos, que devuelve el backend. Por otro lado, el backend buscará las coincidencias de lo que se digite en el buscador con la información en la base de datos.
- Crear Venta: El usuario podrá crear una venta, para esto se genera un post request que el backend recibe y almacena en la base de datos de ventas, al usuario se le muestra la venta creada.
- Crear Cliente: Si un cliente compra por primera vez, se le pedirán datos personales. Genera un post request que el backend recibe y almacena en la base de datos de clientes, al usuario se le muestra el cliente creado.
- Consultar Clientes: Si el cliente es recurrente o ya ha comprado mínimo una vez, el usuario mediante su Identificación lo consultará. Genera un get request que el backend recibe y devuelve la información del cliente, al usuario se le muestra dicha información.