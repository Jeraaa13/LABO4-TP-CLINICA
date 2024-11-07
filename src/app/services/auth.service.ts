import { Injectable } from '@angular/core';
import { Auth, User as FirebaseUser } from '@angular/fire/auth';
import {
  Firestore,
  collection,
  query,
  where,
  getDocs,
} from '@angular/fire/firestore';
import { from, Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  user$: Observable<User | null>;

  constructor(private auth: Auth, private firestore: Firestore) {
    // Observe the auth state and fetch user data from Firestore if a user is logged in
    this.user$ = new Observable<User | null>((observer) => {
      this.auth.onAuthStateChanged(async (firebaseUser) => {
        if (firebaseUser) {
          // Create a Firestore query to retrieve the user data based on UID
          const usersRef = collection(this.firestore, 'users');
          const q = query(usersRef, where('uid', '==', firebaseUser.uid));
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            const userData = querySnapshot.docs[0].data();

            // Construct the custom user object
            const customUser: User = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              tipo: userData['tipo'] || null,
              apellido: userData['apellido'],
              createAt: userData['createAt'],
              dni: userData['dni'],
              edad: userData['edad'],
              emailVerified: userData['emailVerified'],
              imagenPerfil: userData['imagenPerfil'],
              nombre: userData['nombre'],
              password: userData['password'],
              especialidades: userData['especialidades'],
              isApproved: userData['isApproved'],
              obraSocial: userData['obraSocial'],
              habilitado: userData['habilitado'],
              imagenPerfil1: userData['imagenPerfil1'],
              imagenPerfil2: userData['imagenPerfil2'],
              verificado: userData['verificado'],
            };

            observer.next(customUser);
          } else {
            observer.next(null); // No user document found
          }
        } else {
          observer.next(null); // No user logged in
        }
      });
    });
  }

  async getUser(): Promise<User | null> {
    return new Promise<User | null>((resolve) => {
      this.user$.subscribe((user) => resolve(user));
    });
  }

  getUserRole(): Observable<string | null> {
    return this.user$.pipe(map((user) => user?.tipo || null));
  }

  esPaciente(): Observable<boolean> {
    return this.getUserRole().pipe(map((tipo) => tipo === 'paciente'));
  }

  esEspecialista(): Observable<boolean> {
    return this.getUserRole().pipe(map((tipo) => tipo === 'especialista'));
  }

  esAdmin(): Observable<boolean> {
    return this.getUserRole().pipe(map((tipo) => tipo === 'admin'));
  }

  logout(): Promise<void> {
    return this.auth.signOut();
  }
}
