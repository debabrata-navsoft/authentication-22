import { Component, inject, input, signal } from '@angular/core';
import { form, submit } from '@angular/forms/signals';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { ResetPasswordPayload } from '../../../models/user.model';
import { InputField } from '../../../shared/components/input-field/input-field';
import { AppLucideIcon } from '../../../shared/components/lucide-icon/lucide-icon';
import { resetPasswordSchema } from '../../../shared/schemas/auth.schema';
import { getErrorMessage } from '../../../shared/utils/http-error';

@Component({
  imports: [RouterLink, InputField, AppLucideIcon],
  selector: 'app-reset-password',
  styleUrl: './reset-password.css',
  templateUrl: './reset-password.html',
})
export class ResetPassword {
  private readonly authService = inject(AuthService);

  readonly token = input.required<string>();

  private readonly model = signal<ResetPasswordPayload>({ password: '', confirmPassword: '' });
  protected readonly form = form(this.model, resetPasswordSchema);
  protected readonly successMessage = signal<string | null>(null);

  protected readonly errorMessage = signal<string | null>(null);

  protected onSubmit(event: Event): void {
    event.preventDefault();
    this.errorMessage.set(null);

    submit(this.form, {
      action: async () => {
        try {
          const res = await firstValueFrom(
            this.authService.resetPassword(this.token(), this.model()),
          );
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
