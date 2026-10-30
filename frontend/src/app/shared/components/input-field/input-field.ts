import { Component, computed, input, signal } from '@angular/core';
import { FieldTree, FormField } from '@angular/forms/signals';
import { LucideDynamicIcon } from '@lucide/angular';

let nextId = 0;

@Component({
  imports: [FormField, LucideDynamicIcon],
  selector: 'app-input-field',
  styleUrl: './input-field.css',
  templateUrl: './input-field.html',
})
export class InputField {
  readonly label = input.required<string>();
  readonly field = input.required<FieldTree<string>>();
  readonly type = input<'text' | 'email' | 'password' | 'tel'>('text');
  readonly placeholder = input('');
  readonly autocomplete = input('off');
  readonly icon = input<string | null>(null);

  protected readonly id = `input-field-${nextId++}`;
  protected readonly showPassword = signal(false);
  protected readonly inputType = computed(() =>
    this.type() === 'password' && this.showPassword() ? 'text' : this.type(),
  );

  protected readonly errorMessage = computed(() => {
    const state = this.field()();
    if (!state.touched()) return null;
    const [error] = state.errors();
    return error ? (error.message ?? `${this.label()} is invalid`) : null;
  });
}
