import { Injectable } from '@angular/core';
import {
  Firestore,
  collectionData,
  collection,
  query,
  where,
  setDoc,
  addDoc,
  orderBy,
  limit,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { getDocs } from '@angular/fire/firestore';
import { doc, getDoc, updateDoc } from '@angular/fire/firestore';
import Swal from 'sweetalert2';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HistoriaClinicaService } from './historia-clinica.service';
import {
  HistoriaClinica,
  HistoriaClinicaDocumento,
  RegistroHistoriaClinica,
} from '../models/historiaClinica.model';

@Injectable({
  providedIn: 'root',
})
export class TurnosService {
  constructor(
    private firestore: Firestore,
    private snackBar: MatSnackBar,
    private historiaClinicaService: HistoriaClinicaService
  ) {}

  obtenerTurnosPaciente(pacienteId: string): Observable<any[]> {
    const turnosRef = collection(this.firestore, 'turnos');
    const q = query(turnosRef, where('paciente', '==', pacienteId));
    return collectionData(q, { idField: 'id' }) as Observable<any[]>;
  }

  async obtenerEspecialistaPorId(especialistaId: string): Promise<any> {
    console.log('Especialista ID => ', especialistaId);
    const especialistaRef = doc(this.firestore, 'users', especialistaId);
    const especialistaSnapshot = await getDoc(especialistaRef);

    return especialistaSnapshot.exists() ? especialistaSnapshot.data() : null;
  }

  async obtenerUidPacientePorEmail(email: string): Promise<string | null> {
    console.log('Buscando paciente con email: ', email);
    const pacientesRef = collection(this.firestore, 'users');
    const q = query(pacientesRef, where('mail', '==', email));
    const querySnapshot = await getDocs(q);

    console.log(`Documentos encontrados: ${querySnapshot.size}`);

    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      console.log('Documento encontrado: ', doc.data());
      return doc.data()['uid'];
    }
    console.log('No se encontró ningún paciente');
    return null;
  }

  verResena(turno: any) {
    console.log(turno);
    if (turno.resena) {
      Swal.fire({
        title: 'Reseña del Turno',
        text: turno.resena,
        icon: 'info',
        confirmButtonText: 'Cerrar',
      });
    } else {
      this.snackBar.open('Este turno no tiene reseña', 'Cerrar', {
        duration: 3000,
      });
    }
  }

  obtenerTurnos(): Observable<any[]> {
    const turnosRef = collection(this.firestore, 'turnos');
    const q = query(turnosRef);
    return collectionData(q) as Observable<any[]>;
  }

  obtenerTurnosEspecialista(especialistaId: string): Observable<any[]> {
    console.log('especialista id => ', especialistaId);
    const turnosRef = collection(this.firestore, 'turnos');
    const q = query(turnosRef, where('especialista', '==', especialistaId));
    return collectionData(q, { idField: 'id' }) as Observable<any[]>;
  }

  async obtenerNombrePaciente(uid: string): Promise<string | null> {
    const pacienteRef = doc(this.firestore, 'users', uid);
    const pacienteDoc = await getDoc(pacienteRef);

    if (pacienteDoc.exists()) {
      const pacienteData = pacienteDoc.data();
      let nombre = pacienteData?.['nombre'] || null;
      let apellido = pacienteData?.['apellido'] || null;
      return nombre + ' ' + apellido;
    } else {
      return null;
    }
  }

  obtenerTodosLosTurnos(): Observable<any[]> {
    const turnosRef = collection(this.firestore, 'turnos');
    const q = query(turnosRef);
    return collectionData(q, { idField: 'id' }) as Observable<any[]>;
  }

  async cancelarTurno(turno: any) {
    const comentario = await this.mostrarCancelacionTurno();
    if (comentario) {
      const turnoRef = doc(this.firestore, 'turnos', turno.id);

      try {
        await updateDoc(turnoRef, {
          estado: 'cancelado',
          comentarioCancelacion: comentario,
        });

        turno.estado = 'cancelado';
        turno.comentarioCancelacion = comentario;

        console.log('Turno cancelado con éxito en Firestore');
      } catch (error) {
        console.error('Error al cancelar el turno:', error);
      }
    }
  }

  mostrarCancelacionTurno(): Promise<string | null> {
    return Swal.fire({
      title: 'Cancelar Turno',
      text: 'Ingrese el comentario de cancelación:',
      input: 'text',
      inputPlaceholder: 'Escribe aquí el motivo...',
      showCancelButton: true,
      confirmButtonText: 'Cancelar Turno',
      cancelButtonText: 'Volver',
      icon: 'warning',
    }).then((result) => {
      return result.isConfirmed ? result.value : null;
    });
  }

  guardarCalificacion(
    turnoId: string,
    comentario: string,
    calificacion: number
  ) {
    if (!comentario || calificacion < 1 || calificacion > 5) {
      Swal.fire({
        title: 'Error',
        text: 'Por favor, ingresa un comentario válido y una calificación entre 1 y 5.',
        icon: 'error',
        confirmButtonText: 'Cerrar',
      });
      return;
    }

    const turnoRef = doc(this.firestore, 'turnos', turnoId);

    setDoc(
      turnoRef,
      {
        comentarioAtencion: comentario,
        calificacionAtencion: calificacion,
        fechaCalificacion: new Date().toISOString(),
        calificado: true,
      },
      { merge: true }
    )
      .then(() => {
        Swal.fire({
          title: 'Calificación guardada',
          text: 'La calificación se completó correctamente.',
          icon: 'success',
          confirmButtonText: 'Cerrar',
        });
        console.log('Calificación guardada con éxito');
      })
      .catch((error) => {
        Swal.fire({
          title: 'Error',
          text: 'Hubo un problema al guardar la calificación.',
          icon: 'error',
          confirmButtonText: 'Cerrar',
        });
        console.error('Error al guardar la calificación:', error);
      });
  }

  verCalificacion(turnoId: string) {
    const turnoRef = doc(this.firestore, 'turnos', turnoId);

    return getDoc(turnoRef)
      .then((docSnapshot) => {
        if (docSnapshot.exists()) {
          const turnoData = docSnapshot.data();
          const calificacion = turnoData?.['calificacionAtencion'] || null;
          const comentario = turnoData?.['comentarioAtencion'] || null;

          return { calificacion, comentario };
        } else {
          throw new Error('El turno no existe');
        }
      })
      .catch((error) => {
        console.error('Error al obtener la calificación: ', error);
        throw error;
      });
  }

  calificarAtencion(turnoId: string, comentario: string, calificacion: number) {
    const turnoRef = doc(this.firestore, 'turnos', turnoId);

    setDoc(
      turnoRef,
      {
        comentarioAtencion: comentario,
        calificacionAtencion: calificacion,
        fechaCalificacion: new Date().toISOString(),
      },
      { merge: true }
    )
      .then(() => {
        Swal.fire({
          title: 'Calificación guardada',
          text: 'La calificación se completó correctamente.',
          icon: 'success',
          confirmButtonText: 'Cerrar',
        });
        console.log('Calificación guardada con éxito');
      })
      .catch((error) => {
        Swal.fire({
          title: 'Error',
          text: 'Hubo un problema al guardar la calificación.',
          icon: 'error',
          confirmButtonText: 'Cerrar',
        });
        console.error('Error al guardar la calificación:', error);
      });
  }

  actualizarEstadoTurno(
    turnoId: string,
    nuevoEstado: string,
    comentario?: string
  ) {
    const turnoRef = doc(this.firestore, `turnos/${turnoId}`);
    const data = { estado: nuevoEstado, ...(comentario && { comentario }) };
    return updateDoc(turnoRef, data);
  }

  verEncuesta(turno: any) {
    console.log(turno);
    if (turno.encuesta) {
      Swal.fire({
        title: 'Encuesta del Turno',
        text: turno.encuesta,
        icon: 'info',
        confirmButtonText: 'Cerrar',
      });
    } else {
      this.snackBar.open('Este turno no tiene encuesta', 'Cerrar', {
        duration: 3000,
      });
    }
  }

  mostrarEncuesta(): Promise<any | null> {
    return Swal.fire({
      title: 'Encuesta',
      text: 'Ingrese los datos de la encuesta:',
      input: 'text',
      inputPlaceholder: 'Escribe aquí...',
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      return result.isConfirmed ? result.value : null;
    });
  }

  completarEncuesta(turno: any) {
    this.mostrarEncuesta()
      .then((encuesta) => {
        if (encuesta) {
          this.guardarEncuesta(turno.id, encuesta);
        } else {
          console.log('Encuesta no completada');
        }
      })
      .catch((error) => {
        console.error('Error al solicitar encuesta:', error);
      });
  }

  guardarEncuesta(turnoId: string, encuesta: string) {
    const turnoRef = doc(this.firestore, 'turnos', turnoId);

    setDoc(
      turnoRef,
      {
        encuesta: encuesta,
        fechaEncuesta: new Date().toISOString(),
      },
      { merge: true }
    )
      .then(() => {
        Swal.fire({
          title: 'Encuesta guardada',
          text: 'La encuesta se completó correctamente.',
          icon: 'success',
          confirmButtonText: 'Cerrar',
        });
        console.log('Encuesta guardada con éxito');
      })
      .catch((error) => {
        Swal.fire({
          title: 'Error',
          text: 'Hubo un problema al guardar la encuesta.',
          icon: 'error',
          confirmButtonText: 'Cerrar',
        });
        console.error('Error al guardar la encuesta:', error);
      });
  }

  generarHorarios(dia: string, horaInicio: string, horaFin: string): string[] {
    const horarios: string[] = [];
    const inicio = new Date(`${dia}T${horaInicio}:00`);
    const fin = new Date(`${dia}T${horaFin}:00`);

    let actual = inicio;
    while (actual < fin) {
      horarios.push(actual.toISOString().slice(0, 16).replace('T', ' '));
      actual = new Date(actual.getTime() + 30 * 60 * 1000);
    }
    return horarios;
  }

  async guardarHistoriaClinica(historiaClinica: HistoriaClinica) {
    const historiaClinicaRef = collection(this.firestore, 'historias-clinicas');
    return await addDoc(historiaClinicaRef, {
      ...historiaClinica,
      fechaCreacion: new Date(),
    });
  }

  async obtenerUltimosTresTurnosPorPaciente(pacienteId: string) {
    try {
      const turnosRef = collection(this.firestore, 'turnos');

      const q = query(
        turnosRef,
        where('paciente', '==', pacienteId),
        orderBy('fecha', 'desc'),
        limit(3)
      );

      const querySnapshot = await getDocs(q);

      const turnos = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      return turnos;
    } catch (error) {
      console.error('Error al obtener los turnos:', error);
      throw error;
    }
  }

  async obtenerHistoriaClinicaParaTurno(turno: any): Promise<{
    datosFijos: any | null;
    datosAdicionales: any[];
  } | null> {
    try {
      const historiasClinicas: HistoriaClinicaDocumento[] =
        await this.historiaClinicaService.cargarHistoriasClinicas();

      const historiaClinica = historiasClinicas.find(
        (hc: HistoriaClinicaDocumento) =>
          hc.registros.some(
            (registro: RegistroHistoriaClinica) => registro.turnoId === turno.id
          )
      );

      if (historiaClinica) {
        const registroTurno = historiaClinica.registros.find(
          (registro: RegistroHistoriaClinica) => registro.turnoId === turno.id
        );

        return {
          datosFijos: registroTurno?.datosFijos || null,
          datosAdicionales: registroTurno?.datosAdicionales || [],
        };
      }

      return null;
    } catch (error) {
      console.error('Error al obtener historia clínica:', error);
      return null;
    }
  }
}
