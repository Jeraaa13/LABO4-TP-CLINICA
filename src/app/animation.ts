// animations.ts
import {
  trigger,
  transition,
  style,
  query,
  animate,
  group,
} from '@angular/animations';

export const slideAndFadeAnimation = trigger('routeAnimations', [
  // Animación desde abajo hacia arriba (para páginas principales)
  transition('home => *, login => *, register => *', [
    query(
      ':enter, :leave',
      [
        style({
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
        }),
      ],
      { optional: true }
    ),
    query(
      ':enter',
      [
        style({
          transform: 'translateY(100%)',
          opacity: 0,
        }),
      ],
      { optional: true }
    ),
    group([
      query(
        ':leave',
        [
          animate(
            '600ms cubic-bezier(0.4, 0, 0.2, 1)',
            style({
              transform: 'translateY(-100%)',
              opacity: 0,
            })
          ),
        ],
        { optional: true }
      ),
      query(
        ':enter',
        [
          animate(
            '600ms cubic-bezier(0.4, 0, 0.2, 1)',
            style({
              transform: 'translateY(0%)',
              opacity: 1,
            })
          ),
        ],
        { optional: true }
      ),
    ]),
  ]),
  // Animación de fade con slide lateral (para secciones internas)
  transition('* => *', [
    query(
      ':enter, :leave',
      [
        style({
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
        }),
      ],
      { optional: true }
    ),
    query(
      ':enter',
      [
        style({
          transform: 'translateX(100%)',
          opacity: 0,
        }),
      ],
      { optional: true }
    ),
    group([
      query(
        ':leave',
        [
          animate(
            '500ms ease-out',
            style({
              transform: 'translateX(-30%)',
              opacity: 0,
            })
          ),
        ],
        { optional: true }
      ),
      query(
        ':enter',
        [
          animate(
            '500ms ease-in',
            style({
              transform: 'translateX(0%)',
              opacity: 1,
            })
          ),
        ],
        { optional: true }
      ),
    ]),
  ]),
]);
