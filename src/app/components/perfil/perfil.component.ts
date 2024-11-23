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
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FiltrarPorEspecialidadPipe } from '../../pipes/filtrar-por-especialidad.pipe';

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
    FiltrarPorEspecialidadPipe,
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
  especialidades: string[] = [];
  especialidadSeleccionada: string | null = null;

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
        this.cargarEspecialidades(this.userData.uid);
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

  async cargarEspecialidades(pacienteId: string): Promise<void> {
    try {
      // Get reference to historias-clinicas collection
      const historiasClinicasRef = collection(
        this.firestore,
        'historias-clinicas'
      );

      const q = query(
        historiasClinicasRef,
        where('pacienteId', '==', pacienteId)
      );

      const querySnapshot = await getDocs(q);
      const especialidadesSet = new Set<string>();
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data['registros'] && Array.isArray(data['registros'])) {
          data['registros'].forEach((registro: any) => {
            if (registro.especialidad) {
              especialidadesSet.add(registro.especialidad);
            }
          });
        }
      });

      this.especialidades = Array.from(especialidadesSet);

      console.log('Especialidades encontradas:', this.especialidades);
    } catch (error) {
      console.error('Error al cargar especialidades:', error);
      this.mostrarMensaje('Error al cargar las especialidades');
    }
  }

  // Filtra registros por especialidad seleccionada
  filtrarPorEspecialidad() {
    if (!this.historia || !this.especialidadSeleccionada) {
      this.mostrarMensaje('Por favor seleccione una especialidad');
      return;
    }

    try {
      // Filtrar los registros por la especialidad seleccionada
      const registrosFiltrados = this.historia.registros.filter(
        (registro) => registro.especialidad === this.especialidadSeleccionada
      );

      if (registrosFiltrados.length === 0) {
        this.mostrarMensaje(
          'No hay registros para la especialidad seleccionada'
        );
        return;
      }

      // Crear una copia temporal de la historia clínica con los registros filtrados
      const historiaFiltrada = {
        ...this.historia,
        registros: registrosFiltrados,
      };

      // Guardar la historia original
      const historiaOriginal = this.historia;

      // Asignar temporalmente la historia filtrada
      this.historia = historiaFiltrada;

      // Exportar el PDF
      console.log(
        'Exportando PDF para especialidad:',
        this.especialidadSeleccionada
      );

      // Restaurar la historia original
      this.historia = historiaOriginal;
    } catch (error) {
      console.error('Error al filtrar registros:', error);
      this.mostrarMensaje('Error al filtrar los registros');
    }
  }

  exportarHistoriaClinicaPDF(especialidadSeleccionada?: string | null) {
    if (!this.historia || !this.userData) {
      this.mostrarMensaje('No hay datos para exportar');
      return;
    }

    // Filtrar registros por especialidad si se seleccionó una
    const registrosFiltrados = especialidadSeleccionada
      ? this.historia.registros.filter(
          (registro) => registro.especialidad === especialidadSeleccionada
        )
      : this.historia.registros;

    if (registrosFiltrados.length === 0) {
      this.mostrarMensaje(
        'No hay registros disponibles para la especialidad seleccionada'
      );
      return;
    }

    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;

      // Agregar logo
      const logoUrl = 'public/favicon.png'; // Ajusta según tu proyecto
      doc.addImage(logoUrl, 'PNG', 15, 10, 30, 30);

      // Título y fecha
      doc.setFontSize(20);
      doc.text('Historia Clínica', pageWidth / 2, 25, { align: 'center' });

      doc.setFontSize(12);
      const fechaEmision = new Date().toLocaleDateString();
      doc.text(`Fecha de emisión: ${fechaEmision}`, pageWidth - 15, 35, {
        align: 'right',
      });

      // Datos del paciente
      doc.setFontSize(14);
      doc.text('Datos del Paciente', 15, 50);
      doc.setFontSize(12);
      doc.text(
        `Nombre: ${this.userData.nombre} ${this.userData.apellido}`,
        15,
        60
      );
      doc.text(`DNI: ${this.userData.dni}`, 15, 70);
      doc.text(`Edad: ${this.userData.edad} años`, 15, 80);
      if (this.userData.obraSocial) {
        doc.text(`Obra Social: ${this.userData.obraSocial}`, 15, 90);
      }

      // Título para registros médicos y especialidad
      doc.setFontSize(14);
      doc.text(
        `Registros Médicos ${
          especialidadSeleccionada ? `- ${especialidadSeleccionada}` : ''
        }`,
        15,
        105
      );

      // Registros médicos
      const registrosData = registrosFiltrados.map((registro) => {
        const fecha = registro.fecha.toDate().toLocaleDateString();
        const datosAdicionales = registro.datosAdicionales
          ? registro.datosAdicionales
              .map((dato) => `${dato.clave}: ${dato.valor}`)
              .join('\n')
          : 'N/A';

        return [
          fecha,
          `${registro.datosFijos.altura} cm`,
          `${registro.datosFijos.peso} kg`,
          `${registro.datosFijos.temperatura} °C`,
          registro.datosFijos.presion,
          datosAdicionales,
          registro.resena || 'N/A',
        ];
      });

      autoTable(doc, {
        head: [
          [
            'Fecha',
            'Altura',
            'Peso',
            'Temperatura',
            'Presión',
            'Datos Adicionales',
            'Reseña',
          ],
        ],
        body: registrosData,
        startY: 110,
        styles: { fontSize: 10 },
        headStyles: { fillColor: [66, 139, 202] },
        alternateRowStyles: { fillColor: [240, 240, 240] },
        margin: { top: 10 },
      });

      // Pie de página
      const pageCount = (doc as any).internal.pages.length - 1;
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.text(
          `Página ${i} de ${pageCount}`,
          pageWidth / 2,
          doc.internal.pageSize.height - 10,
          { align: 'center' }
        );
        doc.text(
          'Clínica Online - Documento Confidencial',
          15,
          doc.internal.pageSize.height - 10
        );
      }

      // Generar el PDF con nombre personalizado
      const especialidadFileName = especialidadSeleccionada
        ? `-${especialidadSeleccionada}`
        : '';
      const fileName = `historia-clinica-${this.userData.apellido}-${fechaEmision}${especialidadFileName}.pdf`;

      doc.save(fileName);
      this.mostrarMensaje(`PDF exportado correctamente: ${fileName}`);
    } catch (error) {
      console.error('Error al exportar PDF:', error);
      this.mostrarMensaje('Error al exportar el PDF');
    }
  }
}
