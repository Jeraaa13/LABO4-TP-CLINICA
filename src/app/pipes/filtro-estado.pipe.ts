import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  standalone: true,
  name: 'filtroEstado',
})
export class FiltroEstadoPipe implements PipeTransform {
  transform(turnos: any[], estado: string): any[] {
    if (!turnos || !estado) {
      return turnos;
    }
    return turnos.filter((turno) => turno.estado === estado);
  }
}
