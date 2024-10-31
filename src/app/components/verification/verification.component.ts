import { Component } from '@angular/core';
import { Auth, sendEmailVerification } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-verification',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="verification-container">
      <h2>Verificación de Email</h2>
      <p>Te hemos enviado un email de verificación a tu correo.</p>
      <p>Por favor, verifica tu email antes de iniciar sesión.</p>

      <div class="actions">
        <button (click)="reenviarEmail()" [disabled]="isLoading">
          {{ isLoading ? 'Enviando...' : 'Reenviar email de verificación' }}
        </button>
        <button (click)="irAlLogin()">Ir al login</button>
      </div>

      <p *ngIf="errorMessage" class="error-message">{{ errorMessage }}</p>
    </div>
  `,
  styles: [
    `
      .verification-container {
        max-width: 400px;
        margin: 50px auto;
        padding: 20px;
        text-align: center;
      }
      .actions {
        display: flex;
        flex-direction: column;
        gap: 10px;
        margin-top: 20px;
      }
      button {
        padding: 10px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
      }
      button:disabled {
        opacity: 0.7;
        cursor: not-allowed;
      }
      .error-message {
        color: red;
        margin-top: 10px;
      }
    `,
  ],
})
export class VerificationComponent {
  isLoading = false;
  errorMessage = '';

  constructor(private auth: Auth, private router: Router) {}

  async reenviarEmail() {
    try {
      this.isLoading = true;
      this.errorMessage = '';
      const user = this.auth.currentUser;

      if (user) {
        await sendEmailVerification(user);
        alert('Email de verificación reenviado');
      } else {
        this.errorMessage = 'No hay usuario activo';
      }
    } catch (error: any) {
      this.errorMessage = error.message || 'Error al reenviar el email';
    } finally {
      this.isLoading = false;
    }
  }

  irAlLogin() {
    this.router.navigate(['/login']);
  }
}
