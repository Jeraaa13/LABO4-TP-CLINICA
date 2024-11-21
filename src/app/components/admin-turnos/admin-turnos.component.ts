import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  Firestore,
  collectionData,
  collection,
  doc,
  updateDoc,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { CardTurnoComponent } from '../dialogs/card-turno/card-turno.component';
import { TurnosService } from '../../services/turnos.service';

@Component({
  selector: 'app-admin-turnos',
  standalone: true,
  imports: [CommonModule, FormsModule, CardTurnoComponent],
  templateUrl: './admin-turnos.component.html',
  styleUrls: ['./admin-turnos.component.css'],
})
export class AdminTurnosComponent implements OnInit {
  turnos$!: Observable<any[]>;
  turnos: any[] = [];
  especialidadesUnicas: string[] = [];
  especialistasUnicos: string[] = [];
  especialidadFiltro: string = '';
  especialistaFiltro: string = '';
  turnosFiltrados: any[] = [];
  turnoSeleccionado: any = null;
  comentarioCancelacion: string = '';

  constructor(
    private firestore: Firestore,
    private turnosService: TurnosService
  ) {}

  ngOnInit() {
    this.cargarTurnos();
  }

  async cargarTurnos() {
    this.turnosService.obtenerTurnos().subscribe(async (turnos) => {
      this.turnos = await Promise.all(
        turnos.map(async (turno) => {
          const especialista =
            await this.turnosService.obtenerEspecialistaPorId(
              turno.especialista
            );

          console.log('TURNOS => ', turnos);

          return {
            id: turno.id,
            especialista: especialista
              ? `${especialista.nombre} ${especialista.apellido}`
              : 'Especialista no encontrado',
            especialidad: turno.especialidad,
            fecha: turno.fecha.toDate(),
            estado: turno.estado,
            resena: turno.resena,
            encuesta: turno.encuesta,
            calificacion: turno.calificacion,
            paciente: turno.paciente,
            comentarioCancelacion: turno.comentarioCancelacion || null,
          };
        })
      );

      this.actualizarFiltros();
      this.aplicarFiltros();
    });
  }

  private actualizarFiltros() {
    this.especialidadesUnicas = Array.from(
      new Set(this.turnos.map((t) => t.especialidad))
    );
    this.especialistasUnicos = Array.from(
      new Set(this.turnos.map((t) => `${t.especialista}`))
    );
  }

  filtrarPorEspecialidad(especialidad: string) {
    this.especialidadFiltro =
      this.especialidadFiltro === especialidad ? '' : especialidad;
    this.aplicarFiltros();
  }

  filtrarPorEspecialista(especialista: string) {
    this.especialistaFiltro =
      this.especialistaFiltro === especialista ? '' : especialista;
    this.aplicarFiltros();
  }

  limpiarFiltros() {
    this.especialidadFiltro = '';
    this.especialistaFiltro = '';
    this.aplicarFiltros();
  }

  aplicarFiltros() {
    this.turnosFiltrados = this.turnos.filter((turno) => {
      const cumpleEspecialidad =
        !this.especialidadFiltro ||
        turno.especialidad
          .toLowerCase()
          .includes(this.especialidadFiltro.toLowerCase());

      const cumpleEspecialista =
        !this.especialistaFiltro ||
        turno.especialista
          .toLowerCase()
          .includes(this.especialistaFiltro.toLowerCase());

      return cumpleEspecialidad && cumpleEspecialista;
    });
  }

  puedeCancelar(turno: any): boolean {
    return (
      turno.estado !== 'Aceptado' &&
      turno.estado !== 'Realizado' &&
      turno.estado !== 'Rechazado'
    );
  }

  abrirModalCancelacion(turno: any) {
    this.turnoSeleccionado = turno;
  }

  cerrarModalCancelacion() {
    this.turnoSeleccionado = null;
    this.comentarioCancelacion = '';
  }

  async cancelarTurno() {
    if (!this.turnoSeleccionado) return;

    try {
      const turnoRef = doc(this.firestore, 'turnos', this.turnoSeleccionado.id);
      await updateDoc(turnoRef, {
        estado: 'Cancelado',
        comentarioCancelacion: this.comentarioCancelacion,
      });

      this.cerrarModalCancelacion();
    } catch (error) {
      console.error('Error cancelando turno:', error);
    }
  }
}
