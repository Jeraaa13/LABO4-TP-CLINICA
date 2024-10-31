import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, RouterOutlet, CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  constructor(private router: Router) {}

  games = [
    {
      title: 'Ahorcado',
      description: 'Adivina la palabra antes de que se complete el dibujo',
      imgUrl: '/games/AHORCADO-TITULO.png',
      route: '/ahorcado',
    },
    {
      title: 'Mayor o Menor',
      description: 'Adivina si la siguiente carta será mayor o menor',
      imgUrl: '/games/mayormenor.png',
      route: '/mayor-menor',
    },
    {
      title: 'Preguntados',
      description: 'Pon a prueba tus conocimientos generales',
      imgUrl: '/games/preguntados.png',
      route: '/preguntados',
    },
    {
      title: 'Buscaminas',
      description: 'Debes despejar el campo minado sin detonar ninguna mina',
      imgUrl: '/games/buscaminas.png',
      route: '/buscaminas',
    },
  ];

  irAJuego(route: string) {
    this.router.navigate([route]);
  }
}
