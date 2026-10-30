import { Component, inject, signal } from '@angular/core';
import { form, submit } from '@angular/forms/signals';
import { Router, RouterLink } from '@angular/router';
import { LucideDynamicIcon } from '@lucide/angular';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { SignupPayload } from '../../../models/user.model';
import { InputField } from '../../../shared/components/input-field/input-field';
import { signupSchema } from '../../../shared/schemas/auth.schema';
import { getErrorMessage } from '../../../shared/utils/http-error';

@Component({
  imports: [RouterLink, InputField, LucideDynamicIcon],
  selector: 'app-signup',
  styleUrl: './signup.css',
  templateUrl: './signup.html',
})
export class Signup {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  private readonly model = signal<SignupPayload>({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  protected readonly form = form(this.model, signupSchema);

  protected readonly errorMessage = signal<string | null>(null);

  protected onSubmit(event: Event): void {
    event.preventDefault();
    this.errorMessage.set(null);

    submit(this.form, {
      action: async () => {
        try {
          await firstValueFrom(this.authService.signup(this.model()));
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
