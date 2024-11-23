import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filtrarPorEspecialidad',
  standalone: true,
})
export class FiltrarPorEspecialidadPipe implements PipeTransform {
  transform(registros: any[] | undefined, especialidad: string | null): any[] {
    if (!registros || !especialidad) {
      return registros || [];
    }
    return registros.filter(
      (registro) => registro.especialidad === especialidad
    );
  }
}
