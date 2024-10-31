import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
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
  query,
  where,
  getDocs,
  updateDoc,
  addDoc,
  doc,
} from '@angular/fire/firestore';

interface UserData {
  uid: string;
  nombre: string;
  apellido: string;
  edad: number;
  dni: number;
  mail: string;
  tipo: 'paciente' | 'especialista' | 'admin';
  obraSocial?: string;
  especialidad?: string;
  isApproved?: boolean;
  imagenPerfil?: string;
  imagenPerfil1?: string;
  imagenPerfil2?: string;
  emailVerified: boolean;
  createdAt: Date;
}

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="container mx-auto p-4">
      <h2 class="text-2xl font-bold mb-4">Administración de Usuarios</h2>

      <!-- Lista de Usuarios -->
      <div class="mb-8">
        <h3 class="text-xl mb-4">Especialistas Pendientes de Aprobación</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div *ngFor="let user of especialistas" class="border p-4 rounded">
            <img
              [src]="user.imagenPerfil"
              class="w-20 h-20 rounded-full mb-2"
              alt="Profile picture"
            />
            <p>
              <strong>Nombre:</strong> {{ user.nombre }} {{ user.apellido }}
            </p>
            <p><strong>Email:</strong> {{ user.mail }}</p>
            <p><strong>DNI:</strong> {{ user.dni }}</p>
            <p><strong>Especialidad:</strong> {{ user.especialidad }}</p>
            <p>
              <strong>Estado:</strong>
              {{ user.isApproved ? 'Aprobado' : 'Pendiente' }}
            </p>
            <div class="mt-2">
              <button
                *ngIf="!user.isApproved"
                (click)="aprobarEspecialista(user)"
                class="bg-green-500 text-white px-4 py-2 rounded mr-2"
              >
                Aprobar
              </button>
              <button
                *ngIf="user.isApproved"
                (click)="desaprobarEspecialista(user)"
                class="bg-red-500 text-white px-4 py-2 rounded"
              >
                Desaprobar
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Crear Nuevo Usuario Admin -->
      <div class="mt-8">
        <h3 class="text-xl mb-4">Crear Nuevo Administrador</h3>
        <form
          [formGroup]="adminForm"
          (ngSubmit)="crearAdmin()"
          class="max-w-lg"
        >
          <div class="grid grid-cols-1 gap-4">
            <div>
              <label class="block mb-2">Nombre</label>
              <input
                type="text"
                formControlName="nombre"
                class="w-full p-2 border rounded"
              />
            </div>

            <div>
              <label class="block mb-2">Apellido</label>
              <input
                type="text"
                formControlName="apellido"
                class="w-full p-2 border rounded"
              />
            </div>

            <div>
              <label class="block mb-2">Edad</label>
              <input
                type="number"
                formControlName="edad"
                class="w-full p-2 border rounded"
              />
            </div>

            <div>
              <label class="block mb-2">DNI</label>
              <input
                type="number"
                formControlName="dni"
                class="w-full p-2 border rounded"
              />
            </div>

            <div>
              <label class="block mb-2">Email</label>
              <input
                type="email"
                formControlName="mail"
                class="w-full p-2 border rounded"
              />
            </div>

            <div>
              <label class="block mb-2">Contraseña</label>
              <input
                type="password"
                formControlName="password"
                class="w-full p-2 border rounded"
              />
            </div>

            <div>
              <label class="block mb-2">Imagen de Perfil</label>
              <input
                type="file"
                (change)="onFileSelected($event)"
                accept="image/*"
                class="w-full"
              />
            </div>

            <div *ngIf="errorMessage" class="text-red-500 mb-4">
              {{ errorMessage }}
            </div>

            <button
              type="submit"
              [disabled]="adminForm.invalid || isLoading"
              class="bg-blue-500 text-white px-6 py-2 rounded"
            >
              {{ isLoading ? 'Creando...' : 'Crear Administrador' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
})
export class AdminUsersComponent implements OnInit {
  especialistas: UserData[] = [];
  adminForm: FormGroup;
  errorMessage: string = '';
  isLoading: boolean = false;
  selectedFile: File | null = null;

  constructor(
    private fb: FormBuilder,
    private auth: Auth,
    private storage: Storage,
    private firestore: Firestore
  ) {
    this.adminForm = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      edad: ['', [Validators.required, Validators.min(0)]],
      dni: ['', Validators.required],
      mail: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  ngOnInit() {
    this.cargarEspecialistas();
  }

  async cargarEspecialistas() {
    try {
      const especialistasRef = collection(this.firestore, 'especialistas');
      const querySnapshot = await getDocs(especialistasRef);

      this.especialistas = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        // Asegurarnos de que los datos cumplen con la interfaz UserData
        return {
          uid: data['uid'] || '',
          nombre: data['nombre'] || '',
          apellido: data['apellido'] || '',
          edad: data['edad'] || 0,
          dni: data['dni'] || 0,
          mail: data['mail'] || '',
          tipo: 'especialista' as const,
          especialidad: data['especialidad'] || '',
          isApproved: data['isApproved'] || false,
          imagenPerfil: data['imagenPerfil'] || '',
          emailVerified: data['emailVerified'] || false,
          createdAt: data['createdAt']?.toDate() || new Date(),
        } as UserData;
      });
    } catch (error) {
      console.error('Error cargando especialistas:', error);
    }
  }

  async aprobarEspecialista(user: UserData) {
    try {
      const especialistasRef = collection(this.firestore, 'especialistas');
      const q = query(especialistasRef, where('uid', '==', user.uid));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const docRef = doc(
          this.firestore,
          'especialistas',
          querySnapshot.docs[0].id
        );
        await updateDoc(docRef, {
          isApproved: true,
        });
        await this.cargarEspecialistas();
      }
    } catch (error) {
      console.error('Error aprobando especialista:', error);
    }
  }

  async desaprobarEspecialista(user: UserData) {
    try {
      const especialistasRef = collection(this.firestore, 'especialistas');
      const q = query(especialistasRef, where('uid', '==', user.uid));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const docRef = doc(
          this.firestore,
          'especialistas',
          querySnapshot.docs[0].id
        );
        await updateDoc(docRef, {
          isApproved: false,
        });
        await this.cargarEspecialistas();
      }
    } catch (error) {
      console.error('Error desaprobando especialista:', error);
    }
  }

  onFileSelected(event: any) {
    if (event.target.files && event.target.files[0]) {
      this.selectedFile = event.target.files[0];
    }
  }

  async uploadImage(file: File, path: string): Promise<string> {
    const storageRef = ref(this.storage, path);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  }

  async crearAdmin() {
    if (this.adminForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';

    try {
      // Crear usuario en Authentication
      const userCredential = await createUserWithEmailAndPassword(
        this.auth,
        this.adminForm.value.mail,
        this.adminForm.value.password
      );

      // Enviar email de verificación
      await sendEmailVerification(userCredential.user);

      let imagenPerfil = '';
      if (this.selectedFile) {
        imagenPerfil = await this.uploadImage(
          this.selectedFile,
          `admins/${userCredential.user.uid}/profile`
        );
      }

      // Crear documento en Firestore
      const adminCollection = collection(this.firestore, 'admins');
      await addDoc(adminCollection, {
        ...this.adminForm.value,
        uid: userCredential.user.uid,
        tipo: 'admin',
        imagenPerfil,
        emailVerified: false,
        createdAt: new Date(),
      });

      this.adminForm.reset();
      this.selectedFile = null;
      this.errorMessage = 'Administrador creado exitosamente';
    } catch (error: any) {
      console.error('Error creating admin:', error);
      this.errorMessage = error.message || 'Error al crear administrador';
    } finally {
      this.isLoading = false;
    }
  }
}
