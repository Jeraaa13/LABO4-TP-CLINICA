export interface Turno {
  id: string;
  fecha: Date;
  especialidad: string;
  especialista: string;
  especialistaId: string;
  especialistaNombre: string;
  pacienteId: string;
  estado: 'pendiente' | 'realizado' | 'cancelado';
  comentarioCancelacion?: string;
  resena?: string;
  calificacion?: number;
  encuestaCompletada?: boolean;
}
