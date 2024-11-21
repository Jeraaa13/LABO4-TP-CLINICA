import { Component, OnInit } from '@angular/core';
import { TurnosService } from '../../services/turnos.service';
import { AuthService } from '../../services/auth.service';
import { CardTurnoComponent } from '../dialogs/card-turno/card-turno.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { doc, Firestore, updateDoc } from '@angular/fire/firestore';

@Component({
  selector: 'app-turnos-especialista',
  standalone: true,
  imports: [CommonModule, FormsModule, CardTurnoComponent],
  templateUrl: './turnos-especialista.component.html',
  styleUrls: ['./turnos-especialista.component.css'],
})
export class TurnosEspecialistaComponent implements OnInit {
  turnos: any[] = [];
  turnosFiltrados: any[] = [];
  especialidadFiltro = '';
  pacienteFiltro = '';

  constructor(
    private turnosService: TurnosService,
    private authService: AuthService
  ) {}

  async ngOnInit() {
    const user = await this.authService.getUser();
    if (user) {
      this.cargarTurnosEspecialista(user.uid);
    }
  }

  private async cargarTurnosEspecialista(id: string) {
    this.turnosService
      .obtenerTurnosEspecialista(id)
      .subscribe(async (turnos) => {
        const turnosConNombrePaciente = [];

        for (const turno of turnos) {
          const nombrePaciente = await this.turnosService.obtenerNombrePaciente(
            turno.paciente
          );

          console.log(turno);

          turnosConNombrePaciente.push({
            id: turno.id,
            pacienteId: turno.paciente,
            especialidad: turno.especialidad,
            fecha: turno.fecha.toDate(),
            estado: turno.estado,
            especialista: nombrePaciente,
            especialistaId: turno.especialista,
            resena: turno.resena,
            encuesta: turno.encuesta,
            calificacion: turno.calificacion,
            comentarioCancelacion: turno.comentarioCancelacion || null,
          });
        }

        this.turnos = turnosConNombrePaciente;
        this.aplicarFiltros();
      });
  }

  filtrarPorEspecialidad(especialidad: string) {
    this.especialidadFiltro = especialidad;
    this.aplicarFiltros();
  }

  filtrarPorPaciente(paciente: string) {
    this.pacienteFiltro = paciente;
    this.aplicarFiltros();
  }

  limpiarFiltros() {
    this.especialidadFiltro = '';
    this.pacienteFiltro = '';
    this.aplicarFiltros();
  }

  aplicarFiltros() {
    this.turnosFiltrados = this.turnos.filter((turno) => {
      const cumpleEspecialidad =
        !this.especialidadFiltro ||
        turno.especialidad
          .toLowerCase()
          .includes(this.especialidadFiltro.toLowerCase());

      const cumplePaciente =
        !this.pacienteFiltro ||
        turno.paciente
          .toLowerCase()
          .includes(this.pacienteFiltro.toLowerCase());

      return cumpleEspecialidad && cumplePaciente;
    });
  }

  onEspecialidadInput(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    this.filtrarPorEspecialidad(inputElement.value);
  }

  onPacienteInput(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    this.filtrarPorPaciente(inputElement.value);
  }
}
