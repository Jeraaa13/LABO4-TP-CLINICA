import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { HistoriaClinicaDocumento } from '../../models/historiaClinica.model';
import { HistoriaClinicaService } from '../../services/historia-clinica.service';
import { Auth } from '@angular/fire/auth';

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
  ],
  templateUrl: './pacientes.component.html',
  styleUrl: './pacientes.component.css',
})
export class PacientesComponent implements OnInit {
  pacientesAtendidos: HistoriaClinicaDocumento[] = [];
  cargando: boolean = true;

  constructor(
    private historiaClinicaService: HistoriaClinicaService,
    private auth: Auth
  ) {}

  async ngOnInit() {
    this.auth.onAuthStateChanged(async (user) => {
      if (user) {
        const especialistaId = user.uid;

        try {
          if (especialistaId) {
            this.pacientesAtendidos =
              await this.historiaClinicaService.obtenerPacientesAtendidosPorEspecialista(
                especialistaId
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
}
