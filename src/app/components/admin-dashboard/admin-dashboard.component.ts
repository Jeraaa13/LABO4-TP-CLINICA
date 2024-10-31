import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  Firestore,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
} from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { Router } from '@angular/router';

interface Especialista {
  id: string;
  nombre: string;
  apellido: string;
  especialidad: string;
  mail: string;
  isApproved: boolean;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="admin-dashboard">
      <h2>Panel de Administración</h2>

      <div class="especialistas-section">
        <h3>Especialistas Pendientes de Aprobación</h3>

        <div *ngIf="isLoading" class="loading">Cargando especialistas...</div>

        <div *ngIf="!isLoading && especialistas.length === 0" class="no-data">
          No hay especialistas pendientes de aprobación.
        </div>

        <table *ngIf="!isLoading && especialistas.length > 0">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Apellido</th>
              <th>Especialidad</th>
              <th>Email</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let especialista of especialistas">
              <td>{{ especialista.nombre }}</td>
              <td>{{ especialista.apellido }}</td>
              <td>{{ especialista.especialidad }}</td>
              <td>{{ especialista.mail }}</td>
              <td>{{ especialista.isApproved ? 'Aprobado' : 'Pendiente' }}</td>
              <td>
                <button
                  *ngIf="!especialista.isApproved"
                  (click)="aprobarEspecialista(especialista.id)"
                  class="approve-btn"
                >
                  Aprobar
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [
    `
      .admin-dashboard {
        margin-top: 20px;
        padding: 20px;
      }

      table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 20px;
      }

      th,
      td {
        padding: 12px;
        text-align: left;
        border-bottom: 1px solid #ddd;
      }

      .approve-btn {
        background-color: #4caf50;
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 4px;
        cursor: pointer;
      }

      .approve-btn:hover {
        background-color: #45a049;
      }

      .loading,
      .no-data {
        padding: 20px;
        text-align: center;
      }
    `,
  ],
})
export class AdminDashboardComponent implements OnInit {
  especialistas: Especialista[] = [];
  isLoading = false;

  constructor(
    private firestore: Firestore,
    private auth: Auth,
    private router: Router
  ) {}

  async ngOnInit() {
    // Verificar si el usuario actual es admin
    const user = this.auth.currentUser;
    if (!user || user.email !== 'admin@admin.com') {
      this.router.navigate(['/login']);
      return;
    }

    await this.cargarEspecialistas();
  }

  async cargarEspecialistas() {
    try {
      this.isLoading = true;
      const especialistasRef = collection(this.firestore, 'especialistas');
      const querySnapshot = await getDocs(especialistasRef);

      this.especialistas = querySnapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          } as Especialista)
      );
    } catch (error) {
      console.error('Error al cargar especialistas:', error);
    } finally {
      this.isLoading = false;
    }
  }

  async aprobarEspecialista(id: string) {
    try {
      const especialistaRef = doc(this.firestore, 'especialistas', id);
      await updateDoc(especialistaRef, {
        isApproved: true,
      });

      // Recargar la lista
      await this.cargarEspecialistas();
    } catch (error) {
      console.error('Error al aprobar especialista:', error);
    }
  }
}
