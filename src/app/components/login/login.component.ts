import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
  Auth,
  signInWithEmailAndPassword,
  sendEmailVerification,
  user,
} from '@angular/fire/auth';
import {
  Firestore,
  collection,
  query,
  where,
  getDocs,
  addDoc,
} from '@angular/fire/firestore';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { LoadingComponent } from '../loading/loading.component';

interface UserData {
  tipo: 'paciente' | 'especialista' | 'admin';
  isApproved?: boolean;
  email: string;
  uid: string;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, LoadingComponent],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  errorMessage: string = '';
  isLoading: boolean = false;

  constructor(
    private auth: Auth,
    private router: Router,
    private firestore: Firestore
  ) {}

  async getUserData(uid: string): Promise<UserData | null> {
    const q = query(
      collection(this.firestore, 'users'),
      where('uid', '==', uid)
    );
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const userData = querySnapshot.docs[0].data() as UserData;
      return userData;
    }

    return null;
  }

  async login() {
    try {
      this.isLoading = true;
      this.errorMessage = '';

      const userCredential = await signInWithEmailAndPassword(
        this.auth,
        this.email,
        this.password
      );

      const user = userCredential.user;
      if (!user.emailVerified) {
        this.errorMessage =
          'Por favor verifica tu email antes de iniciar sesión.';
        await sendEmailVerification(user);
        this.router.navigate(['/verificacion']);
        await this.auth.signOut();
        return;
      }

      const userData = await this.getUserData(user.uid);

      if (!userData) {
        this.errorMessage = 'No se encontraron datos del usuario.';
        await this.auth.signOut();
        return;
      }

      if (userData.tipo === 'admin') {
        this.router.navigate(['/admin/users']);
        return;
      }

      if (userData.tipo === 'especialista' && !userData.isApproved) {
        this.errorMessage =
          'Tu cuenta está pendiente de aprobación por un administrador.';
        await this.auth.signOut();
        return;
      }

      this.registrarLog(userData);

      this.router.navigate(['/home']);
    } catch (error: any) {
      console.error('Login error', error);
      if (error.code === 'auth/invalid-credential') {
        this.errorMessage = 'Email o contraseña incorrectos.';
      } else {
        this.errorMessage =
          'Error al iniciar sesión. Por favor intente nuevamente.';
      }
    } finally {
      this.isLoading = false;
    }
  }

  private async registrarLog(userData: UserData) {
    try {
      const logRef = collection(this.firestore, 'logs');
      await addDoc(logRef, {
        usuarioId: userData.uid,
        email: userData.email,
        fechaIngreso: new Date(),
        tipo: userData.tipo,
      });
    } catch (error) {
      console.error('Error registrando log:', error);
    }
  }

  loginRapido(email: string, password: string) {
    this.email = email;
    this.password = password;
    this.login();
  }

  navigateToRegister() {
    this.router.navigate(['/register']);
  }
}
