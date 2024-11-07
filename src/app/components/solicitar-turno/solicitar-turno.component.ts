import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Firestore, collection, addDoc } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { getDocs, query, where } from '@angular/fire/firestore';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-solicitar-turno',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './solicitar-turno.component.html',
  styleUrls: ['./solicitar-turno.component.css'],
})
export class SolicitarTurnoComponent implements OnInit {
  turnoForm: FormGroup;
  especialidades: string[] = [];
  especialistas: any[] = [];
  fechasDisponibles: Date[] = [];
  fechaSeleccionada: Date | null = null;
  especialidadSeleccionada: string | null = null;

  constructor(
    private fb: FormBuilder,
    private firestore: Firestore,
    private auth: Auth,
    private snackBar: MatSnackBar
  ) {
    this.turnoForm = this.fb.group({
      especialidades: ['', Validators.required],
      especialista: ['', Validators.required],
      fecha: ['', Validators.required],
      paciente: [''],
      estado: [''],
    });
  }

  ngOnInit() {
    this.cargarEspecialidades();
  }

  async solicitarTurno() {
    console.log('Solicitud de turno iniciada');
    if (this.turnoForm.valid) {
      const turnoData = {
        ...this.turnoForm.value,
        estado: 'Pendiente',
      };
      const user = this.auth.currentUser;

      if (user) {
        turnoData.paciente = user.uid;

        try {
          const turnosRef = collection(this.firestore, 'turnos');
          await addDoc(turnosRef, turnoData);
          this.mostrarMensajeExito('Turno solicitado con éxito');

          this.turnoForm.reset();
          this.fechaSeleccionada = null;
          this.especialistas = [];
          this.fechasDisponibles = [];
        } catch (error) {
          this.mostrarMensajeError('Error al solicitar turno');
          console.error('Error al solicitar turno:', error);
        }
      }
    }
  }

  cargarEspecialidades() {
    const especialidadesRef = collection(this.firestore, 'especialidades');
    getDocs(especialidadesRef).then((snapshot) => {
      this.especialidades = snapshot.docs.map((doc) => doc.data()['nombre']);
    });
  }

  cargarEspecialistas(especialidad: string) {
    const usersRef = collection(this.firestore, 'users');
    const q = query(
      usersRef,
      where('especialidades', 'array-contains', especialidad),
      where('tipo', '==', 'especialista')
    );
    console.log(especialidad);
    getDocs(q)
      .then((snapshot) => {
        this.especialistas = snapshot.docs.map((doc) => ({
          id: doc.id,
          nombre: doc.data()['nombre'],
          apellido: doc.data()['apellido'],
          disponibilidad: doc.data()['disponibilidad'],
        }));
        console.log('Especialistas cargados:', this.especialistas);
      })
      .catch((error) => {
        console.error('Error al cargar especialistas:', error);
      });
  }

  generarFechasDisponibles(especialista: any) {
    if (Array.isArray(this.fechasDisponibles)) {
      const fechas: Date[] = [];
      const hoy = new Date();
      for (let i = 0; i < 15; i++) {
        const nuevaFecha = new Date(hoy);
        nuevaFecha.setDate(hoy.getDate() + i);

        // Verificamos que la disponibilidad esté definida y sea un array
        if (Array.isArray(especialista.disponibilidad)) {
          especialista.disponibilidad.forEach((horario: string) => {
            const [hora, minuto] = horario.split(':').map(Number);
            const fechaHora = new Date(nuevaFecha);
            fechaHora.setHours(hora, minuto, 0, 0);
            fechas.push(fechaHora);
          });
        } else {
          console.error(
            'La disponibilidad del especialista no está definida o no es un array'
          );
        }
      }
      this.fechasDisponibles = fechas;
    } else {
      console.error('Fechas disponibles no definidas o no es un array');
    }
  }

  seleccionarEspecialidad(especialidad: string) {
    this.especialidadSeleccionada = especialidad;
    this.turnoForm.patchValue({ especialidades: especialidad });
    this.cargarEspecialistas(especialidad);
    this.turnoForm.get('especialista')?.reset();
    this.turnoForm.get('fecha')?.reset();
    this.fechaSeleccionada = null;
  }

  seleccionarEspecialista(especialista: any) {
    this.turnoForm.patchValue({ especialista: especialista.id });
    this.turnoForm.get('especialista')?.setValue(especialista.id);
    this.generarFechasDisponibles(especialista);
    this.turnoForm.get('fecha')?.reset();
    this.fechaSeleccionada = null;
  }

  seleccionarFecha(fecha: Date) {
    this.fechaSeleccionada = fecha;
    this.turnoForm.patchValue({ fecha });
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
