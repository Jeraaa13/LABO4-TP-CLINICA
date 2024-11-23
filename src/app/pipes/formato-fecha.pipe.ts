import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  standalone: true,
  name: 'formatoFecha',
})
export class FormatoFechaPipe implements PipeTransform {
  transform(value: any): string {
    if (value instanceof Date) {
      return value.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    }
    if (value?.toDate) {
      return value.toDate().toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    }
    return 'Fecha inválida';
  }
}
