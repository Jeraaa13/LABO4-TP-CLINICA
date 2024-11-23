import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MatDialogModule,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { FormatoFechaPipe } from '../../../pipes/formato-fecha.pipe';

@Component({
  selector: 'app-historia-clinica-modal',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatCardModule,
    MatDividerModule,
    FormatoFechaPipe,
  ],
  template: `
    <h2 mat-dialog-title>Historia Clínica de {{ data.nombre }}</h2>

    <mat-dialog-content class="mat-typography">
      <div
        *ngFor="let registro of data.historiaClinica.registros; let i = index"
        class="registro-container"
      >
        <mat-card class="registro-card">
          <mat-card-header>
            <mat-card-title>Registro #{{ i + 1 }}</mat-card-title>
          </mat-card-header>

          <mat-card-content>
            <div class="datos-fijos">
              <h3>Datos Fijos</h3>
              <h6>
                <strong>Fecha del registro:</strong>
                {{ registro.fecha | formatoFecha }}
              </h6>
              <h6>
                <strong>Comentario:</strong>
                {{ registro.resena }}
              </h6>
              <p>
                <strong>Altura:</strong> {{ registro.datosFijos.altura }} cm
              </p>
              <p><strong>Peso:</strong> {{ registro.datosFijos.peso }} kg</p>
              <p>
                <strong>Presion:</strong> {{ registro.datosFijos.presion }} kg
              </p>
              <p>
                <strong>Temperatura:</strong>
                {{ registro.datosFijos.temperatura }} kg
              </p>
            </div>

            <!-- Datos Adicionales -->
            <div
              *ngIf="registro.datosAdicionales?.length"
              class="datos-adicionales"
            >
              <h3>Datos Adicionales</h3>
              <div
                *ngFor="let dato of registro.datosAdicionales"
                class="dato-adicional"
              >
                <p>
                  <strong>{{ dato.clave }}:</strong> {{ dato.valor }}
                </p>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cerrar</button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      .registro-container {
        margin-bottom: 20px;
      }

      .registro-card {
        margin-bottom: 16px;
      }

      .datos-fijos,
      .datos-adicionales {
        margin: 16px 0;
      }

      .dato-adicional {
        margin: 8px 0;
      }

      mat-dialog-content {
        max-height: 70vh;
        padding: 20px;
      }
    `,
  ],
})
export class HistoriaClinicaModalComponent {
  constructor(
    public dialogRef: MatDialogRef<HistoriaClinicaModalComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      nombre: string;
      historiaClinica: any;
    }
  ) {}
}
