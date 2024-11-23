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
import { RecaptchaModule, RecaptchaFormsModule } from 'ng-recaptcha';
import { firebaseConfig } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';

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
  imports: [
    FormsModule,
    CommonModule,
    ReactiveFormsModule,
    RecaptchaFormsModule,
    RecaptchaModule,
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent implements OnInit {
  recaptchaSiteKey: string;

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
  recaptchaResponse: string | null = '';

  constructor(
    private router: Router,
    private storage: Storage,
    private firestore: Firestore,
    private fb: FormBuilder,
    private http: HttpClient
  ) {
    this.recaptchaSiteKey = firebaseConfig.recaptchaSiteKey;
  }

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
      recaptcha: ['', Validators.required],
    });

    this.pacienteForm = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      edad: [0, Validators.required],
      dni: [0, Validators.required],
      mail: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      obraSocial: ['', Validators.required],
      recaptcha: ['', Validators.required],
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

  onCaptchaResolved(captchaResponse: string | null) {
    this.http
      .post('http://localhost:3000/verify-recaptcha', {
        token: captchaResponse,
      })
      .subscribe({
        next: (response) => {
          console.log('Captcha verificado exitosamente');
        },
        error: (err) => {
          console.error('Error en la verificación: ', err);
        },
      });
  }

  async verifyRecaptcha(token: string): Promise<boolean | undefined> {
    try {
      const functionUrl =
        'https://your-project-id.cloudfunctions.net/verifyRecaptcha';

      const response = await this.http
        .post<{ success: boolean; score: number }>(functionUrl, { token })
        .toPromise();

      // Puedes ajustar los criterios de validación
      return response?.success && (response.score || 0) > 0.5;
    } catch (error) {
      console.error('Error verificando reCAPTCHA:', error);
      return false;
    }
  }

  async register() {
    try {
      // Primero, valida el reCAPTCHA
      if (!this.recaptchaResponse) {
        this.errorMessage = 'Por favor, complete la verificación de reCAPTCHA';
        return;
      }

      // Verifica el token de reCAPTCHA
      const recaptchaVerified = await this.verifyRecaptcha(
        this.recaptchaResponse
      );
      if (!recaptchaVerified) {
        this.errorMessage = 'Verificación de reCAPTCHA fallida';
        return;
      }

      this.isLoading = true;
      this.errorMessage = '';

      // Resto de tu lógica de registro existente...
      const formValue =
        this.formOpcion === 'especialista'
          ? this.especialistaForm.value
          : this.pacienteForm.value;

      this.formData = {
        ...this.formData,
        ...formValue,
      };

      // Continúa con el resto de tu método register() existente
      // ...
    } catch (error: any) {
      // Manejo de errores existente
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
