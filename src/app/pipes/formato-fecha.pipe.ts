import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  standalone: true,
  name: 'formatoFecha',
})
export class FormatoFechaPipe implements PipeTransform {
  transform(value: any, ...args: unknown[]): string {
    if (value instanceof Date) {
      return value.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    }
    return value;
  }
}
