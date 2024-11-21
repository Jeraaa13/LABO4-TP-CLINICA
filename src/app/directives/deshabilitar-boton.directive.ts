import { Directive, Input, ElementRef, Renderer2 } from '@angular/core';

@Directive({
  standalone: true,
  selector: '[appDeshabilitarBoton]',
})
export class DeshabilitarBotonDirective {
  @Input() set appDeshabilitarBoton(condicion: boolean) {
    if (condicion) {
      this.renderer.setAttribute(this.el.nativeElement, 'disabled', 'true');
    } else {
      this.renderer.removeAttribute(this.el.nativeElement, 'disabled');
    }
  }

  constructor(private el: ElementRef, private renderer: Renderer2) {}
}
