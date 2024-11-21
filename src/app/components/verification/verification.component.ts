import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  Auth,
  sendEmailVerification,
  signInWithEmailAndPassword,
} from '@angular/fire/auth';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-verification',
  standalone: true,
  templateUrl: 'verification.component.html',
  styleUrl: 'verification.component.css',
  imports: [CommonModule],
})
export class VerificationComponent {
  isLoading = false;
  errorMessage = '';

  constructor(
    private auth: Auth,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  async reenviarEmail() {
    try {
      this.isLoading = true;
      this.errorMessage = '';

      let user = this.auth.currentUser;

      const storedEmail = sessionStorage.getItem('unverifiedEmail');
      console.log('Retrieved stored email:', storedEmail);

      if (!user) {
        console.log('No active user; using session-stored email.');
        if (storedEmail) {
          const password = await Swal.fire({
            title: 'Ingresa tu contraseña',
            input: 'password',
            inputAttributes: {
              autocapitalize: 'off',
              autocomplete: 'new-password',
            },
            inputPlaceholder: 'Escribe tu contraseña',
            showCancelButton: true,
            confirmButtonText: 'Aceptar',
            cancelButtonText: 'Cancelar',
            preConfirm: (value) => {
              if (!value) {
                Swal.showValidationMessage('Por favor ingresa una contraseña');
              }
              return value;
            },
          });

          if (password.isConfirmed) {
            const enteredPassword = password.value;

            const userCredential = await signInWithEmailAndPassword(
              this.auth,
              storedEmail,
              enteredPassword
            );
            user = userCredential.user;
            this.auth.signOut();
          } else {
            this.mostrarMensajeError('Reautenticación cancelada.');
            return;
          }
        } else {
          this.mostrarMensajeError(
            'No hay usuario activo y no se encontró email almacenado.'
          );
          return;
        }
      }

      if (user) {
        await sendEmailVerification(user);
        this.mostrarMensajeExito('Email de verificación reenviado');
      } else {
        this.mostrarMensajeError('No hay usuario activo');
      }
    } catch (error: any) {
      this.mostrarMensajeError(error.message || 'Error al reenviar el email');
    } finally {
      this.isLoading = false;
    }
  }

  irAlLogin() {
    this.router.navigate(['/login']);
  }

  mostrarMensajeExito(mensaje: string) {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 3000,
      panelClass: ['success-snackbar'],
    });
  }

  mostrarMensajeError(mensaje: string) {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 3000,
      panelClass: ['error-snackbar'],
    });
  }
}
