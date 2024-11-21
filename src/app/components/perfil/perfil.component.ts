import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { Auth } from '@angular/fire/auth';
import {
  Firestore,
  doc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  queryEqual,
} from '@angular/fire/firestore';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import {
  HistoriaClinica,
  HistoriaClinicaDocumento,
} from '../../models/historiaClinica.model';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatChipsModule,
    MatIconModule,
  ],
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.css'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class PerfilComponent implements OnInit {
  userData: any = null;
  horariosForm: FormGroup;
  esEspecialista = false;
  diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  horasDisponibles = Array.from({ length: 13 }, (_, i) => `${i + 8}:00`);
  historia: HistoriaClinicaDocumento | null = null;

  constructor(
    private fb: FormBuilder,
    private auth: Auth,
    private firestore: Firestore,
    private snackBar: MatSnackBar
  ) {
    this.horariosForm = this.fb.group({
      horarios: this.fb.array([]),
    });

    this.auth.onAuthStateChanged((user) => {
      if (user) {
        this.cargarDatosUsuario(user.uid);
      }
    });
  }

  ngOnInit(): void {}

  get horarios(): FormArray {
    return this.horariosForm.get('horarios') as FormArray;
  }

  async cargarDatosUsuario(authUid: string) {
    try {
      const usersRef = collection(this.firestore, 'users');
      const q = query(usersRef, where('uid', '==', authUid));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        this.userData = userDoc.data();
        this.esEspecialista = this.userData.tipo === 'especialista';
        this.historia = await this.cargarHistoriaClinica(this.userData.uid);
        console.log('Datos del usuario:', this.userData);

        if (this.esEspecialista && this.userData.horarios) {
          this.cargarHorarios(this.userData.horarios);
        }
      } else {
        console.log('No se encontró el usuario');
        this.mostrarMensaje('Usuario no encontrado');
      }
    } catch (error) {
      console.error('Error al cargar datos del usuario:', error);
      this.mostrarMensaje('Error al cargar los datos del usuario');
    }
  }

  async cargarHistoriaClinica(uidPaciente: string): Promise<any | null> {
    try {
      const historiaClinicaCollectionRef = collection(
        this.firestore,
        'historias-clinicas'
      );
      const q = query(
        historiaClinicaCollectionRef,
        where('pacienteId', '==', uidPaciente)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const historiasClinicas: any[] = [];
        querySnapshot.forEach((doc) => {
          historiasClinicas.push({ id: doc.id, ...doc.data() });
        });
        return historiasClinicas[0];
      } else {
        console.log(
          'No se encontró la historia clínica para el paciente:',
          uidPaciente
        );
        return null;
      }
    } catch (error) {
      console.error('Error al cargar la historia clínica:', error);
      return null;
    }
  }

  cargarHorarios(horarios: any[]) {
    this.horarios.clear();
    horarios.forEach((horario) => {
      this.horarios.push(
        this.fb.group({
          especialidad: [horario.especialidad],
          dia: [horario.dia],
          horaInicio: [horario.horaInicio],
          horaFin: [horario.horaFin],
        })
      );
    });
  }

  agregarHorario() {
    this.horarios.push(
      this.fb.group({
        especialidad: [''],
        dia: [''],
        horaInicio: [''],
        horaFin: [''],
      })
    );
  }

  removerHorario(index: number) {
    this.horarios.removeAt(index);
  }

  async guardarHorarios() {
    if (!this.userData || !this.auth.currentUser) return;

    try {
      const usersRef = collection(this.firestore, 'users');
      const q = query(usersRef, where('uid', '==', this.auth.currentUser.uid));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        await updateDoc(userDoc.ref, {
          horarios: this.horariosForm.value.horarios,
        });
        this.mostrarMensaje('Horarios actualizados exitosamente');
      } else {
        this.mostrarMensaje('No se pudo encontrar el usuario para actualizar');
      }
    } catch (error) {
      console.error('Error al actualizar horarios:', error);
      this.mostrarMensaje('Error al actualizar los horarios');
    }
  }

  mostrarMensaje(mensaje: string) {
    this.snackBar.open(mensaje, 'Cerrar', { duration: 3000 });
  }
}
