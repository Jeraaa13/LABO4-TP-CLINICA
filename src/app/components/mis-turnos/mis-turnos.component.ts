import { Component, OnInit } from '@angular/core';
import { TurnosService } from '../../services/turnos.service';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FiltroTurnosPipe } from '../../pipes/filtro-turnos.pipe';
import { Timestamp } from '@angular/fire/firestore';

@Component({
  selector: 'app-mis-turnos',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, FiltroTurnosPipe],
  templateUrl: './mis-turnos.component.html',
  styleUrls: ['./mis-turnos.component.scss'],
})
export class MisTurnosComponent implements OnInit {
  turnos: any[] = [];
  pacienteId: string | null = null;
  especialidadFiltro = '';
  especialistaFiltro = '';

  constructor(
    private turnosService: TurnosService,
    private authService: AuthService
  ) {}

  async ngOnInit() {
    const user = await this.authService.getUser();
    if (user) {
      const email = user.email!;
      this.pacienteId = await this.turnosService.obtenerUidPacientePorEmail(
        email
      );
      if (this.pacienteId) {
        this.turnosService
          .obtenerTurnosPaciente(this.pacienteId)
          .subscribe(async (turnos) => {
            this.turnos = await Promise.all(
              turnos.map(async (turno) => {
                const fecha =
                  turno.fecha instanceof Timestamp
                    ? turno.fecha.toDate()
                    : turno.fecha;
                const especialista =
                  await this.turnosService.obtenerEspecialistaPorId(
                    turno.especialista
                  );
                return {
                  ...turno,
                  fecha,
                  nombreEspecialista: especialista
                    ? especialista.nombre
                    : 'N/A',
                  apellidoEspecialista: especialista
                    ? especialista.apellido
                    : 'N/A',
                  especialidad: especialista
                    ? especialista.especialidad
                    : 'N/A',
                };
              })
            );
          });
      }
    } else {
      console.log('No hay usuario logueado');
    }
  }

  cancelarTurno(turno: any) {
    const comentario = prompt('Escribe el motivo de la cancelación:');
    if (comentario) {
      this.turnosService.cancelarTurno(turno.id, comentario).then(() => {
        turno.estado = 'Cancelado';
      });
    }
  }

  verResena(turno: any) {
    alert(`Reseña: ${turno.resena}`);
  }

  completarEncuesta(turno: any) {
    const encuesta = prompt('Escribe tu encuesta sobre la atención recibida:');
    if (encuesta) {
      this.turnosService.guardarEncuesta(turno.id, encuesta);
    }
  }

  calificarAtencion(turno: any) {
    const calificacion = prompt(
      'Escribe tu opinión sobre la atención del especialista:'
    );
    if (calificacion) {
      this.turnosService.calificarAtencion(turno.id, calificacion);
    }
  }
}
