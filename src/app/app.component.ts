import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth.service';
import { User } from './models/user.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  title = 'tp-clinica';
  user: User | null = null;
  isAdmin: boolean = false;
  isEspecialista: boolean = false;
  isPaciente: boolean = false;

  constructor(public authService: AuthService, private router: Router) {}

  ngOnInit() {
    this.authService.user$.subscribe((user) => {
      this.updateUserStatus(user);
    });
  }

  private updateUserStatus(user: User | null): void {
    this.user = user;
    console.log('USER => ', user); // Verifica que ahora tenga los datos de Firestore
    this.isAdmin = user?.tipo === 'admin';
    this.isEspecialista = user?.tipo === 'especialista';
    this.isPaciente = user?.tipo === 'paciente';
    console.log(
      'Admin: ',
      this.isAdmin,
      'Especialista: ',
      this.isEspecialista,
      'Paciente: ',
      this.isPaciente
    );
  }

  logout() {
    this.authService.logout().then(() => {
      this.router.navigate(['/login']);
    });
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }
}
