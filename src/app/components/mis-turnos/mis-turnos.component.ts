import { Component, OnInit, Output } from '@angular/core';
import { TurnosService } from '../../services/turnos.service';
import { AuthService } from '../../services/auth.service';
import { CardTurnoComponent } from '../dialogs/card-turno/card-turno.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import {
  doc,
  Firestore,
  setDoc,
  Timestamp,
  updateDoc,
} from '@angular/fire/firestore';

@Component({
  selector: 'app-mis-turnos',
  standalone: true,
  imports: [CardTurnoComponent, CommonModule, FormsModule],
  templateUrl: './mis-turnos.component.html',
  styleUrls: ['./mis-turnos.component.scss'],
})
export class MisTurnosComponent implements OnInit {
  turnos: any[] = [];
  turnosFiltrados: any[] = [];
  pacienteId: string | null = null;
  especialidadFiltro = '';
  especialistaFiltro = '';
  comentarioCancelacion = '';
  turnoSeleccionado: any = null;
  especialidadesUnicas: string[] = [];
  especialistasUnicos: string[] = [];
  filtroGeneral = '';

  constructor(
    private turnosService: TurnosService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private firestore: Firestore
  ) {}

  async ngOnInit() {
    const user = await this.authService.getUser();
    if (user) {
      this.cargarTurnos(user.email!);
    }
  }

  private async cargarTurnos(email: string) {
    this.pacienteId = await this.turnosService.obtenerUidPacientePorEmail(
      email
    );

    if (this.pacienteId) {
      this.turnosService
        .obtenerTurnosPaciente(this.pacienteId)
        .subscribe(async (turnos) => {
          this.turnos = await Promise.all(
            turnos.map(async (turno) => {
              const especialista =
                await this.turnosService.obtenerEspecialistaPorId(
                  turno.especialista
                );
              const historiaClinica =
                await this.turnosService.obtenerHistoriaClinicaParaTurno(turno);

              return {
                ...turno,
                fecha:
                  turno.fecha instanceof Timestamp
                    ? turno.fecha.toDate()
                    : turno.fecha,
                especialistaId: especialista,
                especialista: especialista
                  ? `${especialista.nombre} ${especialista.apellido}`
                  : 'Especialista no encontrado',
                historiaClinica: historiaClinica,
              };
            })
          );

          this.actualizarFiltros();
          this.aplicarFiltros();
        });
    }
  }

  private actualizarFiltros() {
    this.especialidadesUnicas = Array.from(
      new Set(this.turnos.map((t) => t.especialidad))
    );
    this.especialistasUnicos = Array.from(
      new Set(
        this.turnos.map(
          (t) => `${t.nombreEspecialista} ${t.apellidoEspecialista}`
        )
      )
    );
  }

  verResena(turno: any) {
    console.log(turno);
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
    if (!this.filtroGeneral) {
      this.turnosFiltrados = this.turnos;
      return;
    }

    const filtroNormalizado = this.filtroGeneral.toLowerCase().trim();

    this.turnosFiltrados = this.turnos.filter((turno) => {
      // Campos básicos para búsqueda
      const camposBusqueda = [
        turno.especialidad,
        turno.especialista,
        turno.estado,
        turno.resena,
        turno.comentarioCancelacion,
      ];

      // Verificar coincidencia en campos básicos
      const coincidenciaBasica = camposBusqueda.some(
        (campo) =>
          campo && campo.toString().toLowerCase().includes(filtroNormalizado)
      );

      // Verificar coincidencia en historia clínica
      let coincidenciaHistoriaClinica = false;
      if (turno.historiaClinica) {
        // Buscar en datos fijos
        const datosFijos = turno.historiaClinica.datosFijos
          ? Object.values(turno.historiaClinica.datosFijos).some(
              (valor) =>
                valor &&
                valor.toString().toLowerCase().includes(filtroNormalizado)
            )
          : false;

        // Buscar en datos adicionales
        const datosAdicionales = (
          turno.historiaClinica.datosAdicionales || []
        ).some(
          (dato: any) =>
            dato.clave.toLowerCase().includes(filtroNormalizado) ||
            dato.valor.toString().toLowerCase().includes(filtroNormalizado)
        );

        coincidenciaHistoriaClinica = datosFijos || datosAdicionales;
      }

      return coincidenciaBasica || coincidenciaHistoriaClinica;
    });
  }
}
