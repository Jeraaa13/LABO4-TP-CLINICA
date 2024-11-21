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
  setDoc,
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
  especialidades?: string[];
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
  templateUrl: 'admin-users.component.html',
  styleUrls: ['admin-users.component.css'],
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
      const usersRef = collection(this.firestore, 'users');
      const q = query(usersRef, where('tipo', '==', 'especialista'));
      const querySnapshot = await getDocs(q);

      this.especialistas = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          uid: data['uid'] || '',
          nombre: data['nombre'] || '',
          apellido: data['apellido'] || '',
          edad: data['edad'] || 0,
          dni: data['dni'] || 0,
          mail: data['mail'] || '',
          tipo: 'especialista' as const,
          especialidades: data['especialidades'] || [],
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
      const usersRef = collection(this.firestore, 'users');
      const q = query(usersRef, where('uid', '==', user.uid));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const docRef = doc(this.firestore, 'users', querySnapshot.docs[0].id);
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
      const usersRef = collection(this.firestore, 'users');
      const q = query(usersRef, where('uid', '==', user.uid));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const docRef = doc(this.firestore, 'users', querySnapshot.docs[0].id);
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
      const userCredential = await createUserWithEmailAndPassword(
        this.auth,
        this.adminForm.value.mail,
        this.adminForm.value.password
      );

      let imagenPerfil = '';
      if (this.selectedFile) {
        imagenPerfil = await this.uploadImage(
          this.selectedFile,
          `admins/${userCredential.user.uid}/profile`
        );
      }

      const adminDocRef = doc(this.firestore, 'users', userCredential.user.uid);
      await setDoc(adminDocRef, {
        ...this.adminForm.value,
        uid: userCredential.user.uid,
        tipo: 'admin',
        imagenPerfil,
        emailVerified: true,
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
