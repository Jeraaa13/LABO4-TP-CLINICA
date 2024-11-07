import { Injectable } from '@angular/core';
import {
  Firestore,
  collectionData,
  collection,
  query,
  where,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { getDocs } from '@angular/fire/firestore';
import { doc, getDoc, updateDoc } from '@angular/fire/firestore';

interface Turno {
  pacienteId: string;
  especialidad: string;
  especialistaId: string;
  fecha: Date;
  estado: string;
  comentarioCancelacion?: string;
  resenaEspecialista?: string;
  encuesta?: string;
  calificacionPaciente?: string;
}

@Injectable({
  providedIn: 'root',
})
export class TurnosService {
  constructor(private firestore: Firestore) {}

  obtenerTurnosPaciente(pacienteId: string): Observable<any[]> {
    const turnosRef = collection(this.firestore, 'turnos');
    const q = query(turnosRef, where('paciente', '==', pacienteId));
    return collectionData(q, { idField: 'id' }) as Observable<any[]>;
  }

  async obtenerEspecialistaPorId(especialistaId: string): Promise<any | null> {
    console.log('especialista id => ', especialistaId);
    const especialistaRef = doc(
      this.firestore,
      'especialistas',
      especialistaId
    );
    const especialistaSnapshot = await getDoc(especialistaRef);
    return especialistaSnapshot.exists() ? especialistaSnapshot.data() : null;
  }

  async obtenerUidPacientePorEmail(email: string): Promise<string | null> {
    console.log('Buscando paciente con email: ', email);
    const pacientesRef = collection(this.firestore, 'pacientes');
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

  obtenerTurnosEspecialista(especialistaId: string): Observable<any[]> {
    const turnosRef = collection(this.firestore, 'turnos');
    const q = query(turnosRef, where('especialista', '==', especialistaId));
    return collectionData(q, { idField: 'id' }) as Observable<any[]>;
  }

  async cancelarTurno(turnoId: string, comentario: string) {
    const turnoRef = doc(this.firestore, `turnos/${turnoId}`);
    await updateDoc(turnoRef, {
      estado: 'cancelado',
      comentarioCancelacion: comentario,
    });
  }

  async guardarEncuesta(turnoId: string, encuesta: string) {
    const turnoRef = doc(this.firestore, `turnos/${turnoId}`);
    await updateDoc(turnoRef, { encuesta });
  }

  async calificarAtencion(turnoId: string, calificacion: string) {
    const turnoRef = doc(this.firestore, `turnos/${turnoId}`);
    await updateDoc(turnoRef, { calificacionPaciente: calificacion });
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
}
