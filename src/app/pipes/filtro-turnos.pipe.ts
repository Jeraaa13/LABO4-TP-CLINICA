import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filtroTurnos',
  standalone: true,
})
export class FiltroTurnosPipe implements PipeTransform {
  transform(
    turnos: any[],
    especialidadFiltro: string,
    especialistaFiltro: string
  ): any[] {
    if (!turnos) return [];

    return turnos.filter((turno) => {
      const especialidadMatch =
        especialidadFiltro && turno.especialidad
          ? turno.especialidad
              .toLowerCase()
              .indexOf(especialidadFiltro.toLowerCase()) !== -1
          : true;

      const especialistaMatch =
        especialistaFiltro && turno.especialistaNombre
          ? turno.especialistaNombre
              .toLowerCase()
              .indexOf(especialistaFiltro.toLowerCase()) !== -1
          : true;

      return especialidadMatch && especialistaMatch;
    });
  }
}
