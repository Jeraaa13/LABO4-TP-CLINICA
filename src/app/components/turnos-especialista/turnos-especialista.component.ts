import { Component, OnInit } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TurnosService } from '../../services/turnos.service';
import { Auth } from '@angular/fire/auth';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-turnos-especialista',
  standalone: true,
  imports: [FormsModule, CommonModule, ReactiveFormsModule],
  templateUrl: './turnos-especialista.component.html',
  styleUrls: ['./turnos-especialista.component.css'],
})
export class TurnosEspecialistaComponent implements OnInit {
  turnos: any[] = [];
  filtroControl = new FormControl('');
  especialistaId: string | null = null;

  constructor(private turnosService: TurnosService, private auth: Auth) {}

  ngOnInit() {
    const user = this.auth.currentUser;
    if (user) {
      this.especialistaId = user.uid;
      this.cargarTurnos();
    }
  }

  cargarTurnos() {
    if (this.especialistaId) {
      this.turnosService
        .obtenerTurnosEspecialista(this.especialistaId)
        .subscribe((turnos) => {
          this.turnos = turnos;
        });
    }
  }

  get turnosFiltrados() {
    const filtro = this.filtroControl.value?.toLowerCase() || '';
    return this.turnos.filter(
      (turno) =>
        turno.especialidad.toLowerCase().includes(filtro) ||
        turno.pacienteNombre.toLowerCase().includes(filtro)
    );
  }

  cancelarTurno(turnoId: string) {
    const comentario = prompt('Ingrese el motivo de la cancelación:');
    if (comentario) {
      this.turnosService.actualizarEstadoTurno(
        turnoId,
        'Cancelado',
        comentario
      );
    }
  }

  rechazarTurno(turnoId: string) {
    const comentario = prompt('Ingrese el motivo del rechazo:');
    if (comentario) {
      this.turnosService.actualizarEstadoTurno(
        turnoId,
        'Rechazado',
        comentario
      );
    }
  }

  verResena(turno: any) {
    alert(`Reseña: ${turno.resena}`);
  }

  aceptarTurno(turnoId: string) {
    this.turnosService.actualizarEstadoTurno(turnoId, 'Aceptado');
  }

  finalizarTurno(turnoId: string) {
    const reseña = prompt('Ingrese una reseña o comentario del diagnóstico:');
    if (reseña) {
      this.turnosService.actualizarEstadoTurno(turnoId, 'Realizado', reseña);
    }
  }
}
