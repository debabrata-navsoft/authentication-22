import { Component, input } from '@angular/core';
import { LucideDynamicIcon } from '@lucide/angular';

@Component({
  imports: [LucideDynamicIcon],
  selector: 'lucide-icon',
  styles: ':host { display: inline-flex; flex: 0 0 auto; align-items: center; justify-content: center; line-height: 0; }',
  template: '<svg [lucideIcon]="name()" [size]="size()" aria-hidden="true"></svg>',
})
export class AppLucideIcon {
  readonly name = input.required<string>();
  readonly size = input(24);
}
