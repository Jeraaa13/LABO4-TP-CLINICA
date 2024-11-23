import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { HistoriaClinicaDocumento } from '../../models/historiaClinica.model';
import { HistoriaClinicaService } from '../../services/historia-clinica.service';
import { CommonModule } from '@angular/common';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [
    CommonModule,
    MatExpansionModule,
    MatCardModule,
    MatChipsModule,
    MatIconModule,
    MatButtonModule,
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

  exportUserDataToExcel(historia: HistoriaClinicaDocumento): void {
    const exportData = historia.registros.map((registro) => ({
      pacienteId: historia.pacienteId,
      turnoId: registro.turnoId,
      especialistaId: registro.especialistaId,
      fecha: registro.fecha.toLocaleDateString(),
      // Datos médicos
      altura: registro.datosFijos.altura,
      peso: registro.datosFijos.peso,
      temperatura: registro.datosFijos.temperatura,
      presion: registro.datosFijos.presion,
      // Datos adicionales y reseña
      resena: registro.resena || 'N/A',
      datosAdicionales: registro.datosAdicionales
        ? registro.datosAdicionales
            .map((dato) => `${dato.clave}: ${dato.valor}`)
            .join('; ')
        : 'N/A',
    }));

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `${historia.pacienteId}`);

    XLSX.writeFile(wb, `historia-clinica-${historia.pacienteId}.xlsx`);
  }

  exportToExcel(): void {
    const exportData = this.historiasClinicas.flatMap((historia) =>
      historia.registros.map((registro) => ({
        pacienteId: historia.pacienteId,
        turnoId: registro.turnoId,
        especialistaId: registro.especialistaId,
        altura: registro.datosFijos.altura,
        peso: registro.datosFijos.peso,
        temperatura: registro.datosFijos.temperatura,
        presion: registro.datosFijos.presion,
        resena: registro.resena || 'N/A',
        fecha: registro.fecha.toLocaleDateString(),
        datosAdicionales: registro.datosAdicionales
          ? registro.datosAdicionales
              .map((dato) => `${dato.clave}: ${dato.valor}`)
              .join('; ')
          : 'N/A',
      }))
    );

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Usuarios');

    XLSX.writeFile(wb, 'usuarios.xlsx');
  }
}
