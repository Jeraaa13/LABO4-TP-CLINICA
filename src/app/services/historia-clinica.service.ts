import { Injectable } from '@angular/core';
import {
  Firestore,
  addDoc,
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
  getDoc,
  Timestamp,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import {
  DatoAdicional,
  DatosFijos,
  HistoriaClinicaDocumento,
  RegistroHistoriaClinica,
} from '../models/historiaClinica.model';

@Injectable({
  providedIn: 'root',
})
export class HistoriaClinicaService {
  private historiaClinicaCollection: any;

  constructor(private firestore: Firestore) {
    this.historiaClinicaCollection = collection(
      this.firestore,
      'historias-clinicas'
    );
  }

  async cargarHistoriasClinicas(): Promise<HistoriaClinicaDocumento[]> {
    try {
      const historiaClinicaCollectionRef = collection(
        this.firestore,
        'historias-clinicas'
      );
      const q = query(historiaClinicaCollectionRef);
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return [];
      }

      const historiasClinicas: HistoriaClinicaDocumento[] =
        querySnapshot.docs.map((doc) => {
          const data = doc.data() as HistoriaClinicaDocumento;

          const registrosConvertidos: RegistroHistoriaClinica[] = (
            data.registros || []
          ).map((registro) => ({
            ...registro,
            fecha:
              registro.fecha instanceof Timestamp
                ? registro.fecha.toDate()
                : registro.fecha,
          }));

          return {
            pacienteId: data.pacienteId,
            registros: registrosConvertidos,
          };
        });

      return historiasClinicas;
    } catch (error) {
      console.error('Error al cargar las historias clínicas:', error);
      return [];
    }
  }

  async cargarHistoriaClinicaPorPaciente(
    pacienteId: string
  ): Promise<HistoriaClinicaDocumento | null> {
    try {
      const historiaClinicaCollectionRef = collection(
        this.firestore,
        'historias-clinicas'
      );
      const q = query(historiaClinicaCollectionRef);
      const querySnapshot = await getDocs(q);

      const historiaClinica = querySnapshot.docs
        .map((doc) => doc.data() as HistoriaClinicaDocumento)
        .find((hc) => hc.pacienteId === pacienteId);

      if (!historiaClinica) return null;

      const registrosConvertidos: RegistroHistoriaClinica[] = (
        historiaClinica.registros || []
      ).map((registro) => ({
        ...registro,
        fecha:
          registro.fecha instanceof Timestamp
            ? registro.fecha.toDate()
            : registro.fecha,
      }));

      return {
        pacienteId: historiaClinica.pacienteId,
        registros: registrosConvertidos,
      };
    } catch (error) {
      console.error('Error al cargar historia clínica por paciente:', error);
      return null;
    }
  }

  async obtenerPacientesAtendidosPorEspecialista(
    especialistaId: string
  ): Promise<HistoriaClinicaDocumento[]> {
    try {
      const historiaClinicaCollectionRef = collection(
        this.firestore,
        'historias-clinicas'
      );

      const querySnapshot = await getDocs(historiaClinicaCollectionRef);

      const historiasClinicasFiltradas: HistoriaClinicaDocumento[] =
        querySnapshot.docs
          .map((doc) => ({
            ...(doc.data() as HistoriaClinicaDocumento),
            id: doc.id,
          }))
          .filter((historiaClinica) =>
            historiaClinica.registros.some(
              (registro) => registro.especialistaId === especialistaId
            )
          )
          .map((historiaClinica) => ({
            ...historiaClinica,

            registros: historiaClinica.registros
              .filter((registro) => registro.especialistaId === especialistaId)
              .map((registro) => ({
                ...registro,
                fecha:
                  registro.fecha instanceof Timestamp
                    ? registro.fecha.toDate()
                    : registro.fecha,
              })),
          }));

      return historiasClinicasFiltradas;
    } catch (error) {
      console.error('Error al obtener pacientes atendidos:', error);
      return [];
    }
  }

  async agregarHistoriaClinica(
    pacienteId: string,
    nuevoRegistro: {
      turnoId: string;
      especialistaId: string;
      datosFijos: DatosFijos;
      datosAdicionales?: DatoAdicional[];
      resena?: string;
    }
  ) {
    try {
      const pacienteRef = doc(this.firestore, 'historias-clinicas', pacienteId);

      const pacienteSnap = await getDoc(pacienteRef);
      const documentoActual = pacienteSnap.exists()
        ? (pacienteSnap.data() as HistoriaClinicaDocumento)
        : { pacienteId, registros: [] };

      const registroCompleto: RegistroHistoriaClinica = {
        ...nuevoRegistro,
        fecha: new Date(),
      };

      const registrosActualizados = [
        ...documentoActual.registros,
        registroCompleto,
      ];

      console.log('', registrosActualizados);

      await setDoc(
        pacienteRef,
        {
          pacienteId,
          registros: registrosActualizados,
        },
        { merge: true }
      );

      console.log('asd');

      return true;
    } catch (error) {
      console.error('Error al guardar historia clínica:', error);
      return false;
    }
  }

  async obtenerHistoriaClinicaPaciente(
    pacienteId: string
  ): Promise<HistoriaClinicaDocumento> {
    try {
      const pacienteRef = doc(this.firestore, 'historias-clinicas', pacienteId);
      const pacienteSnap = await getDoc(pacienteRef);

      return pacienteSnap.exists()
        ? (pacienteSnap.data() as HistoriaClinicaDocumento)
        : { pacienteId, registros: [] };
    } catch (error) {
      console.error('Error al obtener historia clínica:', error);
      return { pacienteId, registros: [] };
    }
  }

  async filtrarHistoriasClinicas(filtro: string) {
    try {
      const querySnapshot = await getDocs(this.historiaClinicaCollection);

      return querySnapshot.docs
        .map((doc) => doc.data() as HistoriaClinicaDocumento)
        .filter((historiaClinica) => {
          if (!historiaClinica || !historiaClinica.registros) {
            return false;
          }

          return historiaClinica.registros.some((registro) => {
            if (!registro) {
              return false;
            }

            try {
              return JSON.stringify(registro)
                .toLowerCase()
                .includes(filtro.toLowerCase());
            } catch (error) {
              console.error('Error processing registro:', error);
              return false;
            }
          });
        });
    } catch (error) {
      console.error('Error al filtrar historias clínicas:', error);
      return [];
    }
  }
}
