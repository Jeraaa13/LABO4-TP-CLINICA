# Clínica OnLine - Sistema de Gestión

## Descripción

La Clínica OnLine es un centro de salud con múltiples especialidades y servicios. El sistema permite gestionar turnos, pacientes, especialistas y administradores, todo desde una interfaz web accesible para cada tipo de usuario (Paciente, Especialista, Administrador).

## Requerimientos

La clínica cuenta con:

- 6 consultorios.
- 2 laboratorios físicos.
- Sala de espera general.
- Horario de atención: Lunes a Viernes de 8:00 a 19:00 y Sábados de 8:00 a 14:00.

### Sprint 1: Registro, Login y Gestión de Usuarios

**Pantalla de Bienvenida**

![Pantalla de Bienvenida](public/bienvenida.png)

En la página de bienvenida, los usuarios tienen acceso al login y registro del sistema. Desde aquí pueden acceder a sus perfiles de Paciente, Especialista o Administrador.

**Registro de Usuarios**

- **Pacientes**: Nombre, Apellido, Edad, DNI, Obra Social, Mail, Password y 2 imágenes de perfil.
- **Especialistas**: Nombre, Apellido, Edad, DNI, Especialidad, Mail, Password y Imagen de perfil.

**Login**

- Los Especialistas sólo pueden ingresar si su cuenta fue aprobada por un Administrador.
- Los Pacientes deben verificar su mail para ingresar al sistema.

**Gestión de Usuarios (Administrador)**

![Gestión de Usuarios](public/gestion_usuarios.png)

El Administrador puede ver y modificar los datos de los usuarios, habilitar o deshabilitar cuentas, y generar nuevos usuarios (incluyendo administradores).

### Sprint 2: Gestión de Turnos

**Mis Turnos - Paciente**

![Mis Turnos Paciente](public/mis_turnos_paciente.png)

Los pacientes pueden consultar sus turnos, cancelarlos (si no se han realizado), ver reseñas, completar encuestas o calificar la atención del especialista.

**Mis Turnos - Especialista**

![Mis Turnos Especialista](public/mis_turnos_especialista.png)

Los especialistas pueden gestionar los turnos asignados, aceptarlos, rechazarlos, cancelarlos o finalizar los mismos.

**Turnos - Administrador**

![Turnos Administrador](public/turnos_administrador.png)

Los administradores tienen acceso a todos los turnos de la clínica y pueden cancelarlos si no se han realizado, aceptarlos o rechazarlos.

**Solicitar Turno**

![Solicitar Turno](public/solicitar_turno.png)

Los pacientes y administradores pueden solicitar nuevos turnos seleccionando especialidad, especialista, fecha y horario.

**Mi Perfil**

![Mi Perfil](public/mi_perfil.png)

Cada usuario puede visualizar y editar su perfil, con su nombre, imagen y otros datos.

### Sprint 3: Historia Clínica

**Historia Clínica - Paciente**

![Historia Clínica Paciente](public/historia_clinica_paciente.png)

Los pacientes pueden consultar su historia clínica, la cual es cargada por los especialistas luego de cada consulta.

**Usuarios - Administrador**

![Usuarios Administrador](public/usuarios_administrador.png)

El Administrador tiene acceso completo a los datos de los pacientes y especialistas, y puede gestionar la historia clínica de los pacientes.

### Sprint 4: Informes y Estadísticas

**Log de Ingresos**

![Log de Ingresos](public/log_ingresos.png)

El Administrador puede consultar un log detallado con los ingresos al sistema, indicando el usuario y la fecha de acceso.

**Estadísticas de Turnos**

![Estadísticas de Turnos](public/estadisticas_turnos.png)

El Administrador puede consultar las estadísticas de los turnos, como la cantidad de turnos por especialidad, día, y por especialista.

## Funcionalidades Requeridas

- **Captcha** en el registro de usuarios.
- **Filtros avanzados** para búsqueda de turnos y datos de pacientes.
- **Descarga de Informes** en formato Excel o PDF.

## Requerimientos Técnicos

- La aplicación está desarrollada con Angular y Firebase.
- Utiliza Firestore para el almacenamiento de datos.
- El diseño es responsive y accesible desde dispositivos móviles.
