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
import {
  Firestore,
  collection,
  addDoc,
  getDocs,
  setDoc,
  doc,
} from '@angular/fire/firestore';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

interface FormData {
  nombre: string;
  apellido: string;
  edad: number;
  dni: number;
  mail: string;
  password: string;
  obraSocial: string;
  especialidades: string[];
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
  imports: [FormsModule, CommonModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent {
  formData: FormData = {
    nombre: '',
    apellido: '',
    edad: 0,
    dni: 0,
    mail: '',
    password: '',
    obraSocial: '',
    especialidades: [],
    especialidadCustom: '',
    verificado: false,
    habilitado: false,
  };
  availableEspecialidades: string[] = [
    'Cardiología',
    'Dermatología',
    'Pediatría',
    'Traumatología',
    'Oftalmología',
  ];
  showCustomEspecialidad: boolean = false;
  formOpcion: string = '';
  errorMessage: string = '';
  isLoading: boolean = false;
  selectedFiles: { [key: number]: File } = {};
  customEspecialidad: string = '';

  constructor(
    private auth: Auth,
    private router: Router,
    private storage: Storage,
    private firestore: Firestore
  ) {}

  elegirOpcion(opcion: string) {
    this.formOpcion = opcion;
    this.formData = {
      nombre: '',
      apellido: '',
      edad: 0,
      dni: 0,
      mail: '',
      password: '',
      obraSocial: '',
      especialidades: [],
      especialidadCustom: '',
      verificado: false,
      habilitado: false,
    };
    this.showCustomEspecialidad = false;
  }

  toggleEspecialidad(especialidad: string) {
    const index = this.formData.especialidades.indexOf(especialidad);
    if (index > -1) {
      // Si ya está seleccionado, eliminarlo
      this.formData.especialidades.splice(index, 1);
    } else {
      // Si no está seleccionado, agregarlo
      this.formData.especialidades.push(especialidad);
    }
  }

  onCustomEspecialidadChange(event: any) {
    this.customEspecialidad = event.target.value;
  }

  addCustomEspecialidad() {
    if (
      this.customEspecialidad &&
      !this.formData.especialidades.includes(this.customEspecialidad)
    ) {
      this.formData.especialidades.push(this.customEspecialidad);
      const especialidadesCollection = collection(
        this.firestore,
        'especialidades'
      );
      const customEspecialidadDoc = doc(
        especialidadesCollection,
        this.customEspecialidad
      );
      setDoc(
        customEspecialidadDoc,
        { nombre: this.customEspecialidad },
        { merge: true }
      );
      this.customEspecialidad = ''; // Reiniciar campo de entrada
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
      if (this.formData.especialidades.length === 0) {
        this.errorMessage = 'Por favor seleccione al menos una especialidad';
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
      await this.auth.signOut();

      // Enviar email de verificación
      await sendEmailVerification(userCredential.user);

      const userId = userCredential.user.uid;
      let userData = { ...this.formData };

      // Manejar las imágenes como antes...
      if (this.formOpcion === 'paciente') {
        if (this.selectedFiles[1] && this.selectedFiles[2]) {
          userData.imagenPerfil1 = await this.uploadImage(
            this.selectedFiles[1],
            `users/${userId}/profile1`
          );
          userData.imagenPerfil2 = await this.uploadImage(
            this.selectedFiles[2],
            `users/${userId}/profile2`
          );
        } else {
          throw new Error('Por favor suba las dos imágenes de perfil');
        }
      } else if (this.formOpcion === 'especialista') {
        if (this.selectedFiles[1]) {
          userData.imagenPerfil = await this.uploadImage(
            this.selectedFiles[1],
            `users/${userId}/profile`
          );
        } else {
          throw new Error('Por favor suba la imagen de perfil');
        }
      }

      // Guardar especialidades personalizadas en Firestore si hay alguna
      if (this.formOpcion === 'especialista') {
        const especialidadesCollection = collection(
          this.firestore,
          'especialidades'
        );

        for (let especialidad of this.formData.especialidades) {
          // Verifica si la especialidad ya está en Firestore para evitar duplicados
          const especialidadDoc = doc(especialidadesCollection, especialidad);
          await setDoc(
            especialidadDoc,
            { nombre: especialidad },
            { merge: true }
          );
        }
      }

      // Guardar datos del usuario en Firestore
      const userCollection = collection(this.firestore, 'users');

      await addDoc(userCollection, {
        ...userData,
        tipo: this.formOpcion,
        uid: userId,
        emailVerified: false,
        isApproved: this.formOpcion === 'paciente' ? true : false,
        createdAt: new Date(),
      });

      sessionStorage.setItem('unverifiedEmail', this.formData.mail);
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

  async addSpecialidadesToFirestore(especialidades: string[]) {
    const especialidadesCollection = collection(
      this.firestore,
      'especialidades'
    );
    const existingEspecialidadesSnapshot = await getDocs(
      especialidadesCollection
    );

    const existingEspecialidades = existingEspecialidadesSnapshot.docs.map(
      (doc) => doc.data()['nombre']
    );

    const newEspecialidades = especialidades.filter(
      (esp) => !existingEspecialidades.includes(esp)
    );

    for (const especialidad of newEspecialidades) {
      await addDoc(especialidadesCollection, { nombre: especialidad });
    }
  }

  onFileSelected(event: any, fileNumber: number) {
    if (event.target.files && event.target.files[0]) {
      this.selectedFiles[fileNumber] = event.target.files[0];
    }
  }

  navigateToLogin() {
    this.router.navigate(['/login']);
  }
}
