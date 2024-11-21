import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  Firestore,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  doc,
  getDoc,
} from '@angular/fire/firestore';
import { Storage, ref, getDownloadURL } from '@angular/fire/storage';
import { Auth } from '@angular/fire/auth';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { FormatoFechaPipe } from '../../pipes/formato-fecha.pipe';

interface Especialista {
  id: string;
  nombre: string;
  apellido: string;
  especialidades: string[];
  imagenPerfil?: string;
}

interface Paciente {
  id: string;
  nombre: string;
  apellido: string;
  imagenPerfil?: string;
}

interface FechaDisponible {
  fecha: Date;
  horarios: HorarioDisponible[];
}

interface HorarioDisponible {
  hora: string;
  disponible: boolean;
}

interface Horario {
  especialidad: string;
  dia: string;
  horaInicio: string;
  horaFin: string;
}

@Component({
  selector: 'app-solicitar-turno',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, FormatoFechaPipe],
  templateUrl: './solicitar-turno.component.html',
  styleUrls: ['./solicitar-turno.component.css'],
})
export class SolicitarTurnoComponent implements OnInit {
  turnoForm: FormGroup;
  especialidades: string[] = [];
  especialistas: Especialista[] = [];
  especialistasOriginales: Especialista[] = [];
  pacientes: Paciente[] = [];
  pacientesOriginales: Paciente[] = [];

  paso: 'especialidades' | 'especialistas' | 'fechas' = 'especialidades';

  especialidadSeleccionada: string | null = null;
  especialistaSeleccionado: Especialista | null = null;
  pacienteSeleccionado: Paciente | null = null;
  fechaSeleccionada: Date | null = null;

  fechasDisponibles: FechaDisponible[] = [];
  horariosDisponibles: HorarioDisponible[] = [];
  turnosOcupados: Map<string, Set<string>> = new Map();

  esAdmin: boolean = false;

  constructor(
    private fb: FormBuilder,
    private firestore: Firestore,
    private storage: Storage,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {
    this.turnoForm = this.fb.group({
      especialidad: ['', Validators.required],
      especialista: ['', Validators.required],
      fecha: ['', Validators.required],
      horario: ['', Validators.required],
      paciente: [
        this.esAdmin ? '' : this.authService.user$,
        Validators.required,
      ],
      estado: ['pendiente'],
    });
  }

  ngOnInit() {
    this.authService.user$.subscribe((user) => {
      if (user) {
        this.esAdmin = user.tipo === 'admin';

        if (this.esAdmin) {
          this.cargarPacientes();
        }

        this.turnoForm.patchValue({
          paciente: this.esAdmin ? '' : user?.uid,
        });
      }

      this.cargarEspecialistas();
      this.paso = 'especialistas';
    });
  }

  async cargarPacientes() {
    const usersRef = collection(this.firestore, 'users');
    const q = query(usersRef, where('tipo', '==', 'paciente'));
    const snapshot = await getDocs(q);

    this.pacientes = await Promise.all(
      snapshot.docs.map(async (docSnap) => {
        const pacienteData = docSnap.data();

        let imagenUrl = '';
        if (pacienteData['imagenPerfil1']) {
          try {
            const imageRef = ref(this.storage, pacienteData['imagenPerfil1']);
            imagenUrl = await getDownloadURL(imageRef);
          } catch (error) {
            console.error('Error cargando imagen de paciente:', error);
            imagenUrl = '/assets/default-paciente.png';
          }
        } else {
          imagenUrl = '/assets/default-paciente.png';
        }

        return {
          id: docSnap.id,
          nombre: pacienteData['nombre'],
          apellido: pacienteData['apellido'],
          imagenPerfil: imagenUrl,
        };
      })
    );

    this.pacientesOriginales = [...this.pacientes];
  }

  async cargarEspecialidades() {
    const especialidadesRef = collection(this.firestore, 'especialidades');
    const snapshot = await getDocs(especialidadesRef);

    this.especialidades = snapshot.docs.map((doc) => doc.data()['nombre']);
  }

  async cargarEspecialistas() {
    const usersRef = collection(this.firestore, 'users');
    const q = query(usersRef, where('tipo', '==', 'especialista'));
    const snapshot = await getDocs(q);

    this.especialistas = await Promise.all(
      snapshot.docs.map(async (docSnap) => {
        const especialistaData = docSnap.data();

        let imagenUrl = '';
        if (especialistaData['imagenPerfil']) {
          try {
            const imageRef = ref(
              this.storage,
              especialistaData['imagenPerfil']
            );
            imagenUrl = await getDownloadURL(imageRef);
          } catch (error) {
            console.error('Error cargando imagen de especialista:', error);
            imagenUrl = '/assets/default-especialista.png';
          }
        } else {
          imagenUrl = '/assets/default-especialista.png';
        }

        return {
          id: docSnap.id,
          nombre: especialistaData['nombre'],
          apellido: especialistaData['apellido'],
          especialidades: especialistaData['especialidades'] || [],
          imagenPerfil: imagenUrl,
        };
      })
    );

    this.especialistasOriginales = [...this.especialistas];
  }

  getEspecialidadImagenUrl(especialidad: string): string {
    const especialidadNormalizada = especialidad
      .toLowerCase()
      .replace(/\s+/g, '-');

    const imageUrl = `public/especialidades/${especialidadNormalizada}.png`;

    return imageUrl;
  }

  async seleccionarEspecialidad(especialidad: string) {
    this.especialidadSeleccionada = especialidad;
    this.paso = 'fechas';
    await this.generarFechasDisponibles(this.especialistaSeleccionado!);
    this.turnoForm.patchValue({
      especialidad: especialidad,
    });
  }

  handleImageError(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    if (imgElement) {
      imgElement.src = 'public/especialidades/especialidad.png';
    }
  }

  async seleccionarEspecialista(especialista: Especialista) {
    this.especialistaSeleccionado = especialista;
    this.especialidades = especialista.especialidades || [];
    this.paso = 'especialidades';

    this.turnoForm.patchValue({
      especialista: especialista.id,
    });
  }

  async seleccionarPaciente(paciente: Paciente) {
    this.pacienteSeleccionado = paciente;
    this.turnoForm.patchValue({ paciente: paciente.id });
  }

  async generarFechasDisponibles(especialista: Especialista) {
    const especialistaDocRef = doc(this.firestore, 'users', especialista.id);
    const especialistaDoc = await getDoc(especialistaDocRef);
    const horarios: Horario[] = especialistaDoc.exists()
      ? especialistaDoc.data()?.['horarios'] || []
      : [];

    await this.cargarTurnosOcupados(especialista.id);

    this.fechasDisponibles = [];
    const hoy = new Date();

    for (let i = 0; i < 15; i++) {
      const fecha = new Date(hoy);
      fecha.setDate(hoy.getDate() + i);
      const diaSemana = fecha
        .toLocaleDateString('es-ES', { weekday: 'long' })
        .toLowerCase();

      const horariosDelDia = horarios.filter(
        (h) =>
          h.dia.toLowerCase() === diaSemana &&
          h.especialidad === this.especialidadSeleccionada
      );

      if (horariosDelDia.length > 0) {
        const horariosDisponibles: HorarioDisponible[] =
          this.generarHorariosDisponibles(
            fecha,
            horariosDelDia,
            this.turnosOcupados
          );

        if (horariosDisponibles.length > 0) {
          this.fechasDisponibles.push({
            fecha: fecha,
            horarios: horariosDisponibles,
          });
        }
      }
    }
  }

  generarHorariosDisponibles(
    fecha: Date,
    horariosDelDia: Horario[],
    turnosOcupados: Map<string, Set<string>>
  ): HorarioDisponible[] {
    const horariosDisponibles: HorarioDisponible[] = [];
    const fechaStr = this.formatearFecha(fecha);
    const turnosOcupadosDelDia = turnosOcupados.get(fechaStr) || new Set();

    horariosDelDia.forEach((horario) => {
      const [horaInicio, minInicio] = horario.horaInicio.split(':');
      const [horaFin, minFin] = horario.horaFin.split(':');

      let hora = new Date(fecha);
      hora.setHours(parseInt(horaInicio), parseInt(minInicio));

      const fin = new Date(fecha);
      fin.setHours(parseInt(horaFin), parseInt(minFin));

      while (hora < fin) {
        const horarioStr = hora.toLocaleTimeString('es-ES', {
          hour: '2-digit',
          minute: '2-digit',
        });

        horariosDisponibles.push({
          hora: horarioStr,
          disponible: !turnosOcupadosDelDia.has(horarioStr),
        });

        hora.setMinutes(hora.getMinutes() + 30);
      }
    });

    return horariosDisponibles;
  }

  async cargarTurnosOcupados(especialistaId: string) {
    const turnosRef = collection(this.firestore, 'turnos');
    const hoy = new Date();
    const enDosSemanas = new Date();
    enDosSemanas.setDate(hoy.getDate() + 15);

    const q = query(
      turnosRef,
      where('especialista', '==', especialistaId),
      where('estado', 'in', ['pendiente', 'Aceptado']),
      where('fecha', '>=', hoy),
      where('fecha', '<=', enDosSemanas)
    );

    const snapshot = await getDocs(q);

    this.turnosOcupados.clear();

    snapshot.docs.forEach((doc) => {
      const turno = doc.data();
      const fecha = this.formatearFecha(turno['fecha'].toDate());
      const horario = turno['horario'];

      if (!this.turnosOcupados.has(fecha)) {
        this.turnosOcupados.set(fecha, new Set());
      }
      this.turnosOcupados.get(fecha)?.add(horario);
    });
  }

  formatearFecha(fecha: Date): string {
    return fecha.toISOString().split('T')[0];
  }

  seleccionarFecha(fechaDisponible: FechaDisponible) {
    this.fechaSeleccionada = fechaDisponible.fecha;
    this.horariosDisponibles = fechaDisponible.horarios;
    this.turnoForm.patchValue({
      fecha: fechaDisponible.fecha,
      horario: '',
    });
  }

  async seleccionarHorario(horario: HorarioDisponible) {
    if (horario.disponible) {
      this.turnoForm.patchValue({ horario: horario.hora });
    }
  }

  async solicitarTurno() {
    if (this.esAdmin && !this.pacienteSeleccionado) {
      return;
    }

    if (this.turnoForm.valid) {
      try {
        const turnoData = {
          ...this.turnoForm.value,
          fechaCreacion: new Date(),
        };

        const turnosRef = collection(this.firestore, 'turnos');
        await addDoc(turnosRef, turnoData);

        this.mostrarMensajeExito('Turno solicitado con éxito');
        this.resetSeleccion();

        this.router.navigate(['/turnos-pacientes']);
      } catch (error) {
        this.mostrarMensajeError('Error al solicitar turno');
        console.error('Error:', error);
      }
    }
  }

  resetSeleccion() {
    if (this.paso === 'especialidades') {
      this.paso = 'especialistas';
      this.especialistaSeleccionado = null;
    } else if (this.paso === 'fechas') {
      this.paso = 'especialidades';
      this.especialidadSeleccionada = null;
    }
  }

  mostrarMensajeExito(mensaje: string) {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 3000,
      panelClass: ['success-snackbar'],
    });
  }

  mostrarMensajeError(mensaje: string) {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 3000,
      panelClass: ['error-snackbar'],
    });
  }
}
