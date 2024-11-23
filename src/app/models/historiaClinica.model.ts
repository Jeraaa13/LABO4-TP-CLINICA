export interface HistoriaClinica {
  pacienteId: string;
  datosFijos: {
    altura: number;
    peso: number;
    temperatura: number;
    presion: string;
  };
  datosAdicionales: Array<{
    clave: string;
    valor: string;
  }>;
  fechaCreacion: Date;
}

export interface DatosFijos {
  altura: number;
  peso: number;
  temperatura: number;
  presion: string;
}

export interface DatoAdicional {
  clave: string;
  valor: string;
}

export interface RegistroHistoriaClinica {
  turnoId: string;
  especialistaId: string;
  especialidad: string;
  datosFijos: DatosFijos;
  datosAdicionales?: DatoAdicional[];
  resena?: string;
  fecha: any;
}

export interface HistoriaClinicaDocumento {
  pacienteId: string;
  registros: RegistroHistoriaClinica[];
}

export interface HistoriaClinicaDocumentoExtendido
  extends HistoriaClinicaDocumento {
  fotoUrl: string;
  turnosRecientes: RegistroHistoriaClinica[];
}
