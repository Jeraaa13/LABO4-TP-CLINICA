# Clinica OnLine (Clinic Management System)

Health clinic management system with multiple specialties and services. Manages appointments,
patients, specialists and admins through a web interface tailored to each user role (Patient,
Specialist, Admin).

## Stack

Angular, Firebase (Auth + Firestore), responsive design.

## Context

The clinic has:

- 6 consulting rooms
- 2 physical labs
- A general waiting room
- Hours: Monday to Friday 8:00-19:00, Saturdays 8:00-14:00

## Sprint 1: Registration, login and user management

**Welcome screen**

![Welcome screen](public/fotosReadme/bienvenida.png)

From the welcome page, users can log in or register, then access their Patient, Specialist or
Admin profile.

**User registration**

- **Patients:** first name, last name, age, national ID, health insurance, email, password, and
  2 profile pictures.
- **Specialists:** first name, last name, age, national ID, specialty, email, password, and a
  profile picture.

**Login**

- Specialists can only log in once their account is approved by an Admin.
- Patients must verify their email before logging in.

**User management (Admin)**

![User management](public/fotosReadme/gestion_usuarios.png)

Admins can view and edit user data, enable/disable accounts, and create new users (including
other admins).

## Sprint 2: Appointment management

**My appointments - Patient**

![Patient appointments](public/fotosReadme/mis_turnos_paciente.png)

Patients can check their appointments, cancel them (if not yet completed), view reviews, fill
out surveys, or rate the specialist's care.

**My appointments - Specialist**

![Specialist appointments](public/fotosReadme/mis_turnos_especialista.png)

Specialists can manage their assigned appointments: accept, reject, cancel, or mark them as
completed.

**Appointments - Admin**

![Admin appointments](public/fotosReadme/turnos_administrador.png)

Admins can see every appointment in the clinic and cancel, accept, or reject any that haven't
happened yet.

**Requesting an appointment**

![Request appointment](public/fotosReadme/solicitar_turno.png)

Patients and admins can request new appointments by choosing a specialty, specialist, date and
time slot.

**My profile**

![My profile](public/fotosReadme/mi_perfil.png)

Every user can view and edit their profile: name, picture, and other details.

## Sprint 3: Medical records

**Medical record - Patient**

![Patient medical record](public/fotosReadme/historia_clinica_paciente.png)

Patients can view their medical record, which specialists fill in after each appointment.

**Users - Admin**

![Admin user records](public/fotosReadme/usuarios_administrador.png)

Admins have full access to patient and specialist data and can manage patients' medical records.

## Sprint 4: Reports and stats

**Access log**

![Access log](public/fotosReadme/log_ingresos.png)

Admins can view a detailed log of system logins, with user and access date.

**Appointment stats**

![Appointment stats](public/fotosReadme/estadisticas_turnos.png)

Admins can view appointment stats: counts by specialty, day, and specialist.

## Other features

- Captcha on user registration
- Advanced filters for appointment and patient search
- Report export as Excel or PDF
