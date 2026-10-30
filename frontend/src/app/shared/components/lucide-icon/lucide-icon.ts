import { Component, input } from '@angular/core';
import { LucideDynamicIcon } from '@lucide/angular';

@Component({
  imports: [LucideDynamicIcon],
  selector: 'lucide-icon',
  template: '<svg [lucideIcon]="name()" [size]="size()" aria-hidden="true"></svg>',
})
export class AppLucideIcon {
  readonly name = input.required<string>();
  readonly size = input(24);
}
