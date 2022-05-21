import { animate, AnimationStyleMetadata, AnimationTriggerMetadata, state, style, transition, trigger } from '@angular/animations';

const animationShowStyle: AnimationStyleMetadata = style({
    opacity: 1,
    transform: "translate3d(0px, 0px, 0px) scale3d(1, 1, 1) rotateX(0deg) rotateY(0deg) rotateZ(0deg) skew(0deg, 0deg)",
    'transform-style': "preserve-3d"
});

const slideInAnimation: AnimationStyleMetadata = style({
    opacity: 0,
    transform: "translate3d(-15px, 0px, 0px) scale3d(1, 1, 1) rotateX(0deg) rotateY(0deg) rotateZ(0deg) skew(0deg, 0deg)",
    'transform-style': "preserve-3d"
});

export const animationsArray: AnimationTriggerMetadata[] = [
    trigger('slide-in', [
        state('show', animationShowStyle),
        state('hide', slideInAnimation),
        transition('show => hide', animate('300ms ease-out')),
        transition('hide => show', animate('300ms ease-out'))
    ])
];
