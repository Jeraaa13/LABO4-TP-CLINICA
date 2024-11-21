import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { HistoriaClinicaDocumento } from '../../models/historiaClinica.model';
import { HistoriaClinicaService } from '../../services/historia-clinica.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [
    CommonModule,
    MatExpansionModule,
    MatCardModule,
    MatChipsModule,
    MatIconModule,
  ],
  templateUrl: './usuarios.component.html',
  styleUrl: './usuarios.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class UsuariosComponent implements OnInit {
  historiasClinicas: HistoriaClinicaDocumento[] = [];
  cargando: boolean = true;

  constructor(private historiaClinicaService: HistoriaClinicaService) {}

  async ngOnInit() {
    try {
      this.historiasClinicas =
        await this.historiaClinicaService.cargarHistoriasClinicas();
    } catch (error) {
      console.error('Error en la carga de historias clínicas:', error);
    } finally {
      this.cargando = false;
    }
  }
}
