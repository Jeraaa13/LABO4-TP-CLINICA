import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-historia-clinica-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
  ],
  template: `
    <h2 mat-dialog-title>Cargar Historia Clínica</h2>
    <mat-dialog-content>
      <div class="grid grid-cols-2 gap-4">
        <mat-form-field>
          <mat-label>Altura (cm)</mat-label>
          <input matInput type="number" [(ngModel)]="altura" required />
        </mat-form-field>

        <mat-form-field>
          <mat-label>Peso (kg)</mat-label>
          <input matInput type="number" [(ngModel)]="peso" required />
        </mat-form-field>

        <mat-form-field>
          <mat-label>Temperatura (°C)</mat-label>
          <input matInput type="number" [(ngModel)]="temperatura" required />
        </mat-form-field>

        <mat-form-field>
          <mat-label>Presión</mat-label>
          <input matInput type="text" [(ngModel)]="presion" required />
        </mat-form-field>
      </div>

      <div *ngFor="let dato of datosAdicionales; let i = index" class="mb-2">
        <div class="flex space-x-2">
          <mat-form-field class="flex-grow">
            <mat-label>Clave</mat-label>
            <input matInput [(ngModel)]="dato.clave" />
          </mat-form-field>
          <mat-form-field class="flex-grow">
            <mat-label>Valor</mat-label>
            <input matInput [(ngModel)]="dato.valor" />
          </mat-form-field>
          <button
            mat-icon-button
            color="warn"
            (click)="eliminarDatoAdicional(i)"
          >
            🗑️
          </button>
        </div>
      </div>

      <button
        *ngIf="datosAdicionales.length < 3"
        mat-raised-button
        color="primary"
        (click)="agregarDatoAdicional()"
      >
        Agregar Dato Adicional
      </button>

      <mat-form-field class="w-full mt-4">
        <mat-label>Reseña / Diagnóstico</mat-label>
        <textarea matInput [(ngModel)]="resena" required></textarea>
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions>
      <button mat-button (click)="cancelar()">Cancelar</button>
      <button
        mat-raised-button
        color="primary"
        (click)="guardar()"
        [disabled]="!esFormularioValido()"
      >
        Guardar
      </button>
    </mat-dialog-actions>
  `,
})
export class HistoriaClinicaModalComponent {
  altura: number = 0;
  peso: number = 0;
  temperatura: number = 0;
  presion: string = '';
  resena: string = '';
  datosAdicionales: Array<{ clave: string; valor: string }> = [];

  constructor(
    public dialogRef: MatDialogRef<HistoriaClinicaModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  agregarDatoAdicional() {
    if (this.datosAdicionales.length < 3) {
      this.datosAdicionales.push({ clave: '', valor: '' });
    }
  }

  eliminarDatoAdicional(index: number) {
    this.datosAdicionales.splice(index, 1);
  }

  esFormularioValido(): boolean {
    return !!(
      this.altura &&
      this.peso &&
      this.temperatura &&
      this.presion &&
      this.resena
    );
  }

  guardar() {
    if (this.esFormularioValido()) {
      this.dialogRef.close({
        altura: this.altura,
        peso: this.peso,
        temperatura: this.temperatura,
        presion: this.presion,
        resena: this.resena,
        datosAdicionales: this.datosAdicionales.filter(
          (dato) => dato.clave && dato.valor
        ),
      });
    }
  }

  cancelar() {
    this.dialogRef.close();
  }
}
