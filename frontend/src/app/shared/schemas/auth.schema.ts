import {
  apply,
  email,
  maxLength,
  minLength,
  pattern,
  required,
  schema,
  validate,
} from '@angular/forms/signals';
import { LoginPayload, ResetPasswordPayload, SignupPayload } from '../../models/user.model';

export const PHONE_PATTERN = /^\+?[0-9]{10,15}$/;

const emailSchema = schema<string>((path) => {
  required(path, { message: 'Email is required' });
  email(path, { message: 'Please enter a valid email' });
});

const newPasswordSchema = schema<string>((path) => {
  required(path, { message: 'Password is required' });
  minLength(path, 6, { message: 'Password must be at least 6 characters' });
  maxLength(path, 15, { message: 'Password must not exceed 15 characters' });
});

const passwordPairSchema = schema<ResetPasswordPayload>((path) => {
  apply(path.password, newPasswordSchema);
  required(path.confirmPassword, { message: 'Please confirm your password' });
  minLength(path.confirmPassword, 6, { message: 'Confirm password must be at least 6 characters' });

  maxLength(path.confirmPassword, 15, {
    message: 'Confirm password must not exceed 15 characters',
  });
  validate(path.confirmPassword, ({ value, valueOf }) =>
    value() && value() !== valueOf(path.password)
      ? { kind: 'passwordMismatch', message: 'Passwords do not match' }
      : null,
  );
});

export const loginSchema = schema<LoginPayload>((path) => {
  apply(path.email, emailSchema);
  required(path.password, { message: 'Password is required' });
});

export const signupSchema = schema<SignupPayload>((path) => {
  required(path.name, { message: 'Name is required' });
  apply(path.email, emailSchema);
  required(path.phone, { message: 'Phone number is required' });
  pattern(path.phone, PHONE_PATTERN, {
    message: 'Phone number must be 10–15 digits (optional leading +)',
  });
  apply(path, passwordPairSchema);
});

export const forgotPasswordSchema = schema<{ email: string }>((path) => {
  apply(path.email, emailSchema);
});

export const resetPasswordSchema = passwordPairSchema;
