import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  standalone: true,
  name: 'capitalizar',
})
export class CapitalizarPipe implements PipeTransform {
  transform(value: string): string {
    return value.replace(/\b\w/g, (char) => char.toUpperCase());
  }
}
