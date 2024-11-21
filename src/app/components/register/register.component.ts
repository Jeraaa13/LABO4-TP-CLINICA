import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
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
import {
  FormBuilder,
  FormGroup,
  FormArray,
  Validators,
  FormsModule,
  ReactiveFormsModule,
  FormControl,
} from '@angular/forms';
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
export class RegisterComponent implements OnInit {
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

  formOpcion: 'especialista' | 'paciente' | '' = '';
  availableEspecialidades: string[] = [''];
  showCustomEspecialidad: boolean = false;
  errorMessage: string = '';
  isLoading: boolean = false;
  selectedFiles: { [key: number]: File } = {};
  customEspecialidad: string = '';
  especialistaForm!: FormGroup;
  pacienteForm!: FormGroup;

  constructor(
    private auth: Auth,
    private router: Router,
    private storage: Storage,
    private firestore: Firestore,
    private fb: FormBuilder
  ) {}

  get customEspecialidades(): FormArray {
    return this.especialistaForm.get('customEspecialidades') as FormArray;
  }

  ngOnInit(): void {
    this.initializeForms();
    this.cargarEspecialidades();
  }

  private initializeForms() {
    this.especialistaForm = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      edad: [0, Validators.required],
      dni: [0, Validators.required],
      mail: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      customEspecialidades: this.fb.array([]),
    });

    this.pacienteForm = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      edad: [0, Validators.required],
      dni: [0, Validators.required],
      mail: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      obraSocial: ['', Validators.required],
    });
  }
  async cargarEspecialidades() {
    try {
      const especialidadesCollection = collection(
        this.firestore,
        'especialidades'
      );
      const especialidadesSnapshot = await getDocs(especialidadesCollection);
      this.availableEspecialidades = especialidadesSnapshot.docs.map(
        (doc) => doc.data()['nombre']
      );
    } catch (error) {
      console.error('Error al cargar especialidades:', error);
    }
  }

  toggleEspecialidad(especialidad: string) {
    const index = this.formData.especialidades.indexOf(especialidad);
    if (index > -1) {
      this.formData.especialidades.splice(index, 1);
    } else {
      this.formData.especialidades.push(especialidad);
    }
  }

  addCustomEspecialidad() {
    if (
      this.customEspecialidad &&
      !this.formData.especialidades.includes(this.customEspecialidad)
    ) {
      const control = this.createEspecialidadField();
      control.setValue(this.customEspecialidad);
      this.customEspecialidades.push(control);

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

      this.customEspecialidad = '';
    }
  }

  addEspecialidadField() {
    this.customEspecialidades.push(this.createEspecialidadField());
  }

  elegirOpcion(opcion: 'especialista' | 'paciente') {
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

    if (opcion === 'especialista') {
      this.especialistaForm.reset();
    } else {
      this.pacienteForm.reset();
    }
  }

  onCustomEspecialidadChange(event: any) {
    this.customEspecialidad = event.target.value;
  }

  async addCustomEspecialidades() {
    for (let especialidadControl of this.customEspecialidades.controls) {
      const especialidad = especialidadControl.value;
      if (
        especialidad &&
        !this.formData.especialidades.includes(especialidad)
      ) {
        this.formData.especialidades.push(especialidad);

        try {
          const especialidadesCollection = collection(
            this.firestore,
            'especialidades'
          );
          const especialidadDoc = doc(
            especialidadesCollection,
            especialidad.toLowerCase()
          );
          await setDoc(
            especialidadDoc,
            { nombre: especialidad },
            { merge: true }
          );
        } catch (error) {
          console.error('Error al agregar especialidad personalizada:', error);
        }
      }
    }
    this.customEspecialidades.clear();
    this.customEspecialidades.push(this.createEspecialidadField());
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

  createEspecialidadField(): FormControl {
    return this.fb.control('', Validators.required);
  }

  async register() {
    console.log('hola');
    try {
      this.isLoading = true;
      this.errorMessage = '';

      const formValue =
        this.formOpcion === 'especialista'
          ? this.especialistaForm.value
          : this.pacienteForm.value;

      this.formData = {
        ...this.formData,
        ...formValue,
      };

      const customEspecialidadesValues = this.customEspecialidades.value.filter(
        (esp: string) => esp.trim() !== ''
      );

      await this.addCustomEspecialidades();

      console.log('hola');

      const userCredential = await createUserWithEmailAndPassword(
        this.auth,
        this.formData.mail,
        this.formData.password
      );
      await this.auth.signOut();

      await sendEmailVerification(userCredential.user);

      const userId = userCredential.user.uid;
      let userData = { ...this.formData };

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

      if (this.formOpcion === 'especialista') {
        const especialidadesCollection = collection(
          this.firestore,
          'especialidades'
        );

        for (const especialidad of customEspecialidadesValues) {
          if (!this.formData.especialidades.includes(especialidad)) {
            this.formData.especialidades.push(especialidad);
          }
        }
      }

      const userDocRef = doc(this.firestore, 'users', userId);

      await setDoc(userDocRef, {
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
