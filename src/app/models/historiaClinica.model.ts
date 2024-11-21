export interface HistoriaClinica {
  id?: string;
  turnoId: string;
  pacienteId: string;
  especialistaId: string;
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
  datosFijos: DatosFijos;
  datosAdicionales?: DatoAdicional[];
  resena?: string;
  fecha: Date;
}

export interface HistoriaClinicaDocumento {
  pacienteId: string;
  registros: RegistroHistoriaClinica[];
}

export interface Turno {
  id: string;
  estado: string;
  pacienteId: string;
  especialistaId: string;
  resena?: string;
}
