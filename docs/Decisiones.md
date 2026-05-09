# Registro de Decisiones de Diseño y Presentación - Proyecto Licorera

En este documento se detallan las decisiones tomadas para que la interfaz de la licorera sea profesional, intuitiva y visualmente atractiva, comparando las ideas iniciales de la IA con mi criterio como desarrollador.

## 1. Paleta de Colores

- **Propuesta de la IA:** Sugirió colores genéricos como azul y blanco (estilo administrativo estándar).
- **Decisión:** Implementar una paleta de colores premium: fondo oscuro (Charcoal, #1A1A1B), detalles en dorado/ámbar para botones de acción (#C5A059) y blanco hueso para textos (#F5F5F1).
- **Por qué:** Una licorera vende productos que se asocian con estatus y celebración. Usar tonos oscuros con contrastes cálidos genera una experiencia sensorial superior y hace que los elementos resalten más, aplicando un toque de lujo.

## 2. Organización Visual

- **Propuesta de la IA:** Una lista vertical simple de productos con mucha información amontonada.
- **Decisión:** Optar por un diseño de cuadrícula con tarjetas limpias, usando mucho "espacio en blanco" o negativo entre elementos.
- **Por qué:** Siguiendo la idea de elegancia, un diseño saturado confunde al personal. Al usar tarjetas con bordes redondeados y sombras sutiles, la interfaz se siente moderna y organizada. Esto facilita que el usuario encuentre un producto rápidamente sin fatiga visual.

## 3. Estrategia de Persistencia (Datos ficticios vs Reales)

- **Propuesta de la IA:** Configurar una base de datos real o un servidor local (como Node.js) desde el principio.
- **Decisión:** Implementar una arquitectura de simulación con JSON local y una "capa de servicio" en JavaScript (`api.js` con `mockData`).
- **Por qué:** En etapa de diseño de interfaz y flujo, un archivo de datos simulados permite demostrar cómo se vería la licorera con inventario lleno. Esto posibilita probar la estética de los colores y la disposición de las tarjetas sin depender de una conexión externa, asegurando que la experiencia del usuario sea consistente desde el primer momento.

## 4. Mejora de Usabilidad y Enfoque UI

- Resaltado de botones clave (p.ej., `Nuevo Cliente` en sección clientes) para guiar la acción del usuario.
- Contrastes de texto y estados de hover para facilitar interacción y accesibilidad.
- Indicadores visuales en la navegación (tabs) para reforzar la sección activa.

---

### Nota final

Estas decisiones están documentadas para mantener coherencia de diseño entre el prototipo y cualquier futura fase de implementación con backend real. Si se avanza a producción, la arquitectura actual puede adaptarse a API real sin modificar el comportamiento de UI.
