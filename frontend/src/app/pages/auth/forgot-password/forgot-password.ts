import { Component, inject, signal } from '@angular/core';
import { form, submit } from '@angular/forms/signals';
import { RouterLink } from '@angular/router';
import { LucideDynamicIcon } from '@lucide/angular';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { InputField } from '../../../shared/components/input-field/input-field';
import { forgotPasswordSchema } from '../../../shared/schemas/auth.schema';
import { getErrorMessage } from '../../../shared/utils/http-error';

@Component({
  imports: [RouterLink, InputField, LucideDynamicIcon],
  selector: 'app-forgot-password',
  styleUrl: './forgot-password.css',
  templateUrl: './forgot-password.html',
})
export class ForgotPassword {
  private readonly authService = inject(AuthService);

  private readonly model = signal({ email: '' });
  protected readonly form = form(this.model, forgotPasswordSchema);
  protected readonly successMessage = signal<string | null>(null);

  protected readonly errorMessage = signal<string | null>(null);

  protected onSubmit(event: Event): void {
    event.preventDefault();
    this.errorMessage.set(null);
    this.successMessage.set(null);

    submit(this.form, {
      action: async () => {
        try {
          const res = await firstValueFrom(this.authService.forgotPassword(this.model().email));
          this.successMessage.set(res.message);
        } catch (error) {
          this.errorMessage.set(getErrorMessage(error));
        }
        return undefined;
      },
      onInvalid: (field) => field().markAsTouched(),
    });
  }
}
