import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { TurnosService } from '../../../services/turnos.service';
import { FormsModule } from '@angular/forms';
import { doc, Firestore, updateDoc } from '@angular/fire/firestore';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { HistoriaClinicaModalComponent } from '../historia-clinica-modal/historia-clinica-modal.component';
import { HistoriaClinicaService } from '../../../services/historia-clinica.service';
import { FormatoFechaPipe } from '../../../pipes/formato-fecha.pipe';
import { CapitalizarPipe } from '../../../pipes/capitalizar.pipe';

@Component({
  selector: 'app-card-turno',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    FormatoFechaPipe,
    CapitalizarPipe,
  ],
  templateUrl: './card-turno.component.html',
  styleUrl: './card-turno.component.css',
})
export class CardTurnoComponent implements OnInit {
  mostrarFormularioCalificacion: boolean = false;
  comentario: string = '';
  calificacion: string = '';

  @Input() tipo: string = 'paciente';
  @Input() turno: any;

  especialista: string = '';
  paciente: string = '';
  especialidad: string = '';
  fecha: Date = new Date();
  estado: string = '';
  resena: string = '';
  encuesta: any = null;

  constructor(
    public turnosService: TurnosService,
    private snackBar: MatSnackBar,
    private firestore: Firestore,
    private dialog: MatDialog,
    private historiaClinicaService: HistoriaClinicaService
  ) {}

  ngOnInit() {
    if (this.turno.id) {
      this.obtenerCalificacion(this.turno.id);
    }
  }

  obtenerCalificacion(turnoId: string) {
    this.turnosService
      .verCalificacion(turnoId)
      .then((data) => {
        this.calificacion = data.calificacion || 'No calificada';
        this.comentario = data.comentario || 'No hay comentario';
        this.turno.calificado = !!data.calificacion;
      })
      .catch((error) => {
        console.error('Error al obtener la calificación', error);
      });
  }

  get estadoClases() {
    return {
      'bg-yellow-100': this.turno.estado === 'pendiente',
      'bg-green-100': this.turno.estado === 'realizado',
      'bg-red-100': this.turno.estado === 'cancelado',
    };
  }

  async rechazarTurno(turno: any) {
    if (['aceptado', 'realizado', 'cancelado'].includes(turno.estado)) {
      return;
    }

    const comentario = await this.mostrarComentarioRechazo();
    if (comentario) {
      const turnoRef = doc(this.firestore, 'turnos', turno.id);
      try {
        await updateDoc(turnoRef, {
          estado: 'rechazado',
          comentarioRechazo: comentario,
        });
        turno.estado = 'rechazado';
        turno.comentarioRechazo = comentario;
        this.snackBar.open('Turno rechazado con éxito', 'Cerrar', {
          duration: 3000,
        });
      } catch (error) {
        this.snackBar.open('Error al rechazar el turno', 'Cerrar', {
          duration: 3000,
        });
      }
    }
  }

  async aceptarTurno(turno: any) {
    if (['realizado', 'cancelado', 'rechazado'].includes(turno.estado)) {
      return;
    }

    const turnoRef = doc(this.firestore, 'turnos', turno.id);
    try {
      await updateDoc(turnoRef, {
        estado: 'aceptado',
      });
      turno.estado = 'aceptado';
      this.snackBar.open('Turno aceptado con éxito', 'Cerrar', {
        duration: 3000,
      });
    } catch (error) {
      this.snackBar.open('Error al aceptar el turno', 'Cerrar', {
        duration: 3000,
      });
    }
  }

  async cancelarTurno(turno: any) {
    if (['realizado', 'cancelado', 'rechazado'].includes(turno.estado)) {
      return;
    }

    const comentario = await this.mostrarComentarioCancelacion();
    if (comentario) {
      const turnoRef = doc(this.firestore, 'turnos', turno.id);
      try {
        await updateDoc(turnoRef, {
          estado: 'cancelado',
          comentarioCancelacion: comentario,
        });
        turno.estado = 'cancelado';
        turno.comentarioCancelacion = comentario;
        this.snackBar.open('Turno cancelado con éxito', 'Cerrar', {
          duration: 3000,
        });
      } catch (error) {
        this.snackBar.open('Error al cancelar el turno', 'Cerrar', {
          duration: 3000,
        });
      }
    }
  }

  async finalizarTurno() {
    if (this.turno.estado !== 'aceptado') {
      return;
    }

    try {
      const dialogRef = this.dialog.open(HistoriaClinicaModalComponent, {
        width: '500px',
        data: { turno: this.turno },
      });

      const resultado = await dialogRef.afterClosed().toPromise();

      console.log(this.turno);

      if (resultado) {
        await this.historiaClinicaService.agregarHistoriaClinica(
          this.turno.pacienteId,
          {
            turnoId: this.turno.id,
            especialistaId: this.turno.especialistaId,
            datosFijos: {
              altura: resultado.altura,
              peso: resultado.peso,
              temperatura: resultado.temperatura,
              presion: resultado.presion,
            },
            datosAdicionales: resultado.datosAdicionales,
            resena: resultado.resena,
          }
        );

        const turnoRef = doc(this.firestore, 'turnos', this.turno.id);
        await updateDoc(turnoRef, {
          estado: 'realizado',
          resena: resultado.resena,
        });

        this.turno.estado = 'realizado';
        this.turno.resena = resultado.resena;

        this.snackBar.open('Turno finalizado con historia clínica', 'Cerrar', {
          duration: 3000,
        });
      }
    } catch (error) {
      console.error('Error al finalizar turno:', error);
      this.snackBar.open('Error al finalizar el turno', 'Cerrar', {
        duration: 3000,
      });
    }
  }

  verResena(turno: any) {
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

  private async actualizarEstadoTurno(turno: any, historiaClinica: any) {
    const turnoRef = doc(this.firestore, 'turnos', turno.id);
    try {
      await updateDoc(turnoRef, {
        estado: 'realizado',
        resena: historiaClinica.resena,
      });

      await this.turnosService.guardarHistoriaClinica({
        turnoId: turno.id,
        pacienteId: turno.pacienteId,
        especialistaId: turno.especialistaId,
        datosFijos: {
          altura: historiaClinica.altura,
          peso: historiaClinica.peso,
          temperatura: historiaClinica.temperatura,
          presion: historiaClinica.presion,
        },
        datosAdicionales: historiaClinica.datosAdicionales || [],
        fechaCreacion: new Date(),
      });

      turno.estado = 'realizado';
      this.snackBar.open(
        'Turno finalizado con historia clínica guardada',
        'Cerrar',
        {
          duration: 3000,
        }
      );
    } catch (error) {
      this.snackBar.open('Error al finalizar el turno', 'Cerrar', {
        duration: 3000,
      });
    }
  }

  guardarCalificacion(
    turnoId: string,
    comentario: string,
    calificacion: string
  ) {
    const calificacionNumerica = Number(calificacion);

    if (!comentario || calificacionNumerica < 1 || calificacionNumerica > 5) {
      Swal.fire({
        title: 'Error',
        text: 'Por favor, ingresa un comentario válido y una calificación entre 1 y 5.',
        icon: 'error',
        confirmButtonText: 'Cerrar',
      });
      return;
    }

    this.turnosService.guardarCalificacion(
      turnoId,
      comentario,
      calificacionNumerica
    );

    this.mostrarFormularioCalificacion = false;
  }

  async mostrarComentarioFinalizacion(): Promise<string | null> {
    return Swal.fire({
      title: 'Finalizar Turno',
      text: 'Ingrese la reseña o comentario del diagnóstico y consulta:',
      input: 'textarea',
      showCancelButton: true,
      confirmButtonText: 'Finalizar Turno',
      cancelButtonText: 'Volver',
      icon: 'info',
    }).then((result) => (result.isConfirmed ? result.value : null));
  }

  async mostrarComentarioCancelacion(): Promise<string | null> {
    return Swal.fire({
      title: 'Cancelar Turno',
      text: 'Ingrese el comentario de cancelación:',
      input: 'text',
      showCancelButton: true,
      confirmButtonText: 'Cancelar Turno',
      cancelButtonText: 'Volver',
      icon: 'warning',
    }).then((result) => (result.isConfirmed ? result.value : null));
  }

  async mostrarComentarioRechazo(): Promise<string | null> {
    return Swal.fire({
      title: 'Rechazar Turno',
      text: 'Ingrese el comentario del rechazo:',
      input: 'text',
      showCancelButton: true,
      confirmButtonText: 'Rechazar Turno',
      cancelButtonText: 'Volver',
      icon: 'warning',
    }).then((result) => (result.isConfirmed ? result.value : null));
  }

  async mostrarCancelacionTurno(): Promise<string | null> {
    return Swal.fire({
      title: 'Cancelar Turno',
      text: 'Ingrese el comentario de cancelación:',
      input: 'text',
      showCancelButton: true,
      confirmButtonText: 'Cancelar Turno',
      cancelButtonText: 'Volver',
      icon: 'warning',
    }).then((result) => (result.isConfirmed ? result.value : null));
  }
}
