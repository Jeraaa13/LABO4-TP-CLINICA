import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
  Auth,
  signInWithEmailAndPassword,
  sendEmailVerification,
} from '@angular/fire/auth';
import {
  Firestore,
  collection,
  query,
  where,
  getDocs,
  addDoc,
} from '@angular/fire/firestore';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterOutlet } from '@angular/router';

interface UserData {
  tipo: 'paciente' | 'especialista' | 'admin';
  isApproved?: boolean;
  email: string;
  uid: string;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterOutlet, RouterLink, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  errorMessage: string = '';
  isLoading: boolean = false;
  readonly ADMIN_EMAIL = 'admin@admin.com';

  constructor(
    private auth: Auth,
    private router: Router,
    private firestore: Firestore
  ) {}

  async getUserData(uid: string): Promise<UserData | null> {
    // Verificar si es admin primero
    if (this.auth.currentUser?.email === this.ADMIN_EMAIL) {
      return {
        tipo: 'admin',
        email: this.ADMIN_EMAIL,
        uid: uid,
      };
    }

    // Buscar en pacientes
    let q = query(
      collection(this.firestore, 'pacientes'),
      where('uid', '==', uid)
    );
    let querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const userData = querySnapshot.docs[0].data() as UserData;
      return { ...userData, tipo: 'paciente' };
    }

    // Buscar en especialistas
    q = query(
      collection(this.firestore, 'especialistas'),
      where('uid', '==', uid)
    );
    querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const userData = querySnapshot.docs[0].data() as UserData;
      return { ...userData, tipo: 'especialista' };
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

      // Si es admin, permitir acceso directo
      if (user.email === this.ADMIN_EMAIL) {
        await this.registrarLog({
          email: this.ADMIN_EMAIL,
          tipo: 'admin',
          uid: user.uid,
        });
        this.router.navigate(['/admin/users']);
        return;
      }

      // Para otros usuarios, verificar email
      if (!user.emailVerified) {
        this.errorMessage =
          'Por favor verifica tu email antes de iniciar sesión.';
        await sendEmailVerification(user);
        this.router.navigate(['/verificacion']);
        await this.auth.signOut();
        return;
      }

      // Obtener datos del usuario
      const userData = await this.getUserData(user.uid);

      if (!userData) {
        this.errorMessage = 'No se encontraron datos del usuario.';
        await this.auth.signOut();
        return;
      }

      // Verificar aprobación para especialistas
      if (userData.tipo === 'especialista' && !userData.isApproved) {
        this.errorMessage =
          'Tu cuenta está pendiente de aprobación por un administrador.';
        await this.auth.signOut();
        return;
      }

      await this.registrarLog(userData);
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
