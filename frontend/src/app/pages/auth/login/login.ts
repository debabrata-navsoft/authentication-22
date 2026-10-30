import { Component, inject, signal } from '@angular/core';
import { form, submit } from '@angular/forms/signals';
import { Router, RouterLink } from '@angular/router';
import { LucideDynamicIcon } from '@lucide/angular';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { LoginPayload } from '../../../models/user.model';
import { InputField } from '../../../shared/components/input-field/input-field';
import { loginSchema } from '../../../shared/schemas/auth.schema';
import { getErrorMessage } from '../../../shared/utils/http-error';

@Component({
  imports: [RouterLink, InputField, LucideDynamicIcon],
  selector: 'app-login',
  styleUrl: './login.css',
  templateUrl: './login.html',
})
export class Login {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  private readonly model = signal<LoginPayload>({ email: '', password: '' });
  protected readonly form = form(this.model, loginSchema);

  protected readonly errorMessage = signal<string | null>(null);

  protected onSubmit(event: Event): void {
    event.preventDefault();
    this.errorMessage.set(null);

    submit(this.form, {
      action: async () => {
        try {
          await firstValueFrom(this.authService.login(this.model()));
          await this.router.navigateByUrl('/dashboard');
        } catch (error) {
          this.errorMessage.set(getErrorMessage(error));
        }
        return undefined;
      },
      onInvalid: (field) => field().markAsTouched(),
    });
  }
}
