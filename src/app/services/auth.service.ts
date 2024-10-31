import { Injectable } from '@angular/core';
import { Auth, User, onAuthStateChanged, signOut } from '@angular/fire/auth';
import { Firestore, collection, addDoc } from '@angular/fire/firestore';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private userSubject = new BehaviorSubject<User | null>(null);
  user$ = this.userSubject.asObservable();

  constructor(private auth: Auth, private firestore: Firestore) {
    onAuthStateChanged(this.auth, (user) => {
      this.userSubject.next(user);
      this.logAuthStateChange(user);
    });
  }

  isAuthenticated(): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      this.user$.subscribe((user) => {
        resolve(!!user);
      });
    });
  }

  getUser(): Promise<User | null> {
    return new Promise<User | null>((resolve) => {
      this.user$.subscribe((user) => {
        resolve(user);
      });
    });
  }

  logout(): Promise<void> {
    return signOut(this.auth);
  }

  private async logAuthStateChange(user: User | null) {
    const logsRef = collection(this.firestore, 'logs');
    await addDoc(logsRef, {
      email: user ? user.email : 'Guest',
      fechaIngreso: new Date(),
    });
  }
}
