import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import {
  HistoriaClinicaDocumento,
  RegistroHistoriaClinica,
} from '../../models/historiaClinica.model';
import { HistoriaClinicaService } from '../../services/historia-clinica.service';
import { TurnosService } from '../../services/turnos.service';
import { Auth } from '@angular/fire/auth';
import { HistoriaClinicaModalComponent } from '../dialogs/paciente-historia-clinica-modal/paciente-historia-clinica-modal.component';

@Component({
  selector: 'app-pacientes',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatExpansionModule,
    MatChipsModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatButtonModule,
  ],
  templateUrl: './pacientes.component.html',
  styleUrl: './pacientes.component.css',
})
export class PacientesComponent implements OnInit {
  pacientesAtendidos: any[] = [];
  cargando: boolean = true;
  historiaClinicaSeleccionada: HistoriaClinicaDocumento | null = null;

  constructor(
    private historiaClinicaService: HistoriaClinicaService,
    private turnosService: TurnosService,
    private auth: Auth,
    private dialog: MatDialog
  ) {}

  async ngOnInit() {
    this.auth.onAuthStateChanged(async (user) => {
      if (user) {
        const especialistaId = user.uid;

        try {
          if (especialistaId) {
            const pacientes =
              await this.historiaClinicaService.obtenerPacientesAtendidosPorEspecialista(
                especialistaId
              );

            // Obtener los turnos y nombre para cada paciente
            const pacientesConTurnos = await Promise.all(
              pacientes.map(async (paciente) => {
                const [turnos, nombrePaciente] = await Promise.all([
                  this.turnosService.obtenerUltimosTresTurnosPorPaciente(
                    paciente.pacienteId
                  ),
                  this.turnosService.obtenerNombrePaciente(paciente.pacienteId),
                ]);

                return {
                  ...paciente,
                  turnos: turnos,
                  nombre: nombrePaciente, // Agregamos el nombre del paciente
                };
              })
            );

            this.pacientesAtendidos = pacientesConTurnos;
            console.log(
              'Pacientes con turnos y nombres:',
              this.pacientesAtendidos
            );
          } else {
            console.error('No se pudo obtener el ID del especialista');
          }
        } catch (error) {
          console.error('Error al cargar pacientes atendidos:', error);
        } finally {
          this.cargando = false;
        }
      }
    });
  }

  async verHistoriaClinica(pacienteId: string, nombrePaciente: string) {
    try {
      const historiaClinica =
        await this.historiaClinicaService.cargarHistoriaClinicaPorPaciente(
          pacienteId
        );

      this.dialog.open(HistoriaClinicaModalComponent, {
        width: '800px',
        maxHeight: '90vh',
        data: {
          nombre: nombrePaciente,
          historiaClinica: historiaClinica,
        },
      });
    } catch (error) {
      console.error('Error al cargar historia clínica:', error);
    }
  }
}
