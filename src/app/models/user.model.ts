export interface User {
  apellido: string;
  createAt: Date;
  dni: number;
  edad: number;
  emailVerified: boolean;
  imagenPerfil: string;
  email: string | null;
  nombre: string;
  password: string;
  tipo: 'admin' | 'especialista' | 'paciente';
  uid: string;
  especialidades: string[];
  isApproved: boolean;
  obraSocial: string;
  habilitado: string;
  imagenPerfil1: string;
  imagenPerfil2: string;
  verificado: string;
}
