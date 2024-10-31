import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from '@angular/fire/auth';
import {
  Storage,
  ref,
  uploadBytes,
  getDownloadURL,
} from '@angular/fire/storage';
import { Firestore, collection, addDoc } from '@angular/fire/firestore';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

interface FormData {
  nombre: string;
  apellido: string;
  edad: number;
  dni: number;
  mail: string;
  password: string;
  obraSocial: string;
  especialidad: string;
  especialidadCustom: string;
  verificado: boolean;
  habilitado: boolean;
  imagenPerfil?: string;
  imagenPerfil1?: string;
  imagenPerfil2?: string;
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {
  // Form data
  formData: FormData = {
    nombre: '',
    apellido: '',
    edad: 0,
    dni: 0,
    mail: '',
    password: '',
    obraSocial: '',
    especialidad: '',
    especialidadCustom: '',
    verificado: false,
    habilitado: false,
  };
  especialidades: string[] = [
    'Cardiología',
    'Dermatología',
    'Pediatría',
    'Traumatología',
    'Oftalmología',
  ];
  selectedEspecialidad: string = '';
  showCustomEspecialidad: boolean = false;
  formOpcion: string = '';
  errorMessage: string = '';
  isLoading: boolean = false;
  selectedFiles: { [key: number]: File } = {};

  constructor(
    private auth: Auth,
    private router: Router,
    private storage: Storage,
    private firestore: Firestore
  ) {}

  elegirOpcion(opcion: string) {
    this.formOpcion = opcion;
    // Reset form data
    this.formData = {
      nombre: '',
      apellido: '',
      edad: 0,
      dni: 0,
      mail: '',
      password: '',
      obraSocial: '',
      especialidad: '',
      especialidadCustom: '',
      verificado: false,
      habilitado: false,
    };
    this.selectedEspecialidad = '';
    this.showCustomEspecialidad = false;
  }

  onEspecialidadChange(event: any) {
    const value = event.target.value;
    this.selectedEspecialidad = value;
    this.showCustomEspecialidad = value === 'otra';
    this.formData.especialidad = value !== 'otra' ? value : '';
    if (value !== 'otra') {
      this.formData.especialidadCustom = '';
    }
  }

  onFileSelected(event: any, fileNumber: number) {
    if (event.target.files && event.target.files[0]) {
      this.selectedFiles[fileNumber] = event.target.files[0];
    }
  }

  async uploadImage(file: File, path: string): Promise<string> {
    const storageRef = ref(this.storage, path);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  }

  validateForm(): boolean {
    if (
      !this.formData.nombre ||
      !this.formData.apellido ||
      !this.formData.mail ||
      !this.formData.password
    ) {
      this.errorMessage = 'Por favor complete todos los campos obligatorios';
      return false;
    }

    if (this.formOpcion === 'especialista') {
      if (this.selectedEspecialidad === '') {
        this.errorMessage = 'Por favor seleccione una especialidad';
        return false;
      }
      if (
        this.selectedEspecialidad === 'otra' &&
        !this.formData.especialidadCustom
      ) {
        this.errorMessage = 'Por favor ingrese la nueva especialidad';
        return false;
      }
    }

    return true;
  }

  async register() {
    try {
      this.isLoading = true;
      this.errorMessage = '';

      if (!this.validateForm()) {
        this.isLoading = false;
        return;
      }

      // Crear usuario en Authentication
      const userCredential = await createUserWithEmailAndPassword(
        this.auth,
        this.formData.mail,
        this.formData.password
      );

      // Enviar email de verificación
      await sendEmailVerification(userCredential.user);

      // Subir imágenes
      const userId = userCredential.user.uid;
      let userData = { ...this.formData };

      // Establecer la especialidad correcta
      if (this.formOpcion === 'especialista') {
        userData.especialidad =
          this.selectedEspecialidad === 'otra'
            ? this.formData.especialidadCustom
            : this.formData.especialidad;
      }

      // Manejar las imágenes como antes...
      if (this.formOpcion === 'paciente') {
        if (this.selectedFiles[1] && this.selectedFiles[2]) {
          userData.imagenPerfil1 = await this.uploadImage(
            this.selectedFiles[1],
            `pacientes/${userId}/profile1`
          );
          userData.imagenPerfil2 = await this.uploadImage(
            this.selectedFiles[2],
            `pacientes/${userId}/profile2`
          );
        } else {
          throw new Error('Por favor suba las dos imágenes de perfil');
        }
      } else if (this.formOpcion === 'especialista') {
        if (this.selectedFiles[1]) {
          userData.imagenPerfil = await this.uploadImage(
            this.selectedFiles[1],
            `especialistas/${userId}/profile`
          );
        } else {
          throw new Error('Por favor suba la imagen de perfil');
        }
      }

      // Guardar datos en Firestore con campos adicionales
      const userCollection = collection(
        this.firestore,
        this.formOpcion === 'paciente' ? 'pacientes' : 'especialistas'
      );

      await addDoc(userCollection, {
        ...userData,
        tipo: this.formOpcion,
        uid: userId,
        emailVerified: false,
        isApproved: this.formOpcion === 'paciente' ? true : false, // Los especialistas necesitan aprobación
        createdAt: new Date(),
      });

      // Cerrar sesión después del registro para forzar la verificación
      await this.auth.signOut();

      this.router.navigate(['/verificacion']);
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        this.errorMessage = 'El correo ya está registrado.';
      } else {
        this.errorMessage = error.message || 'Hubo un error en el registro.';
      }
      console.error('Registro fallido', error);
    } finally {
      this.isLoading = false;
    }
  }

  navigateToLogin() {
    this.router.navigate(['/login']);
  }
}
