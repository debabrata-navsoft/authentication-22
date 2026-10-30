import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { form } from '@angular/forms/signals';
import { SignupPayload } from '../../models/user.model';
import { loginSchema, resetPasswordSchema, signupSchema } from './auth.schema';

const messages = (field: () => { errors: () => { message?: string }[] }) =>
  field()
    .errors()
    .map((e) => e.message);

describe('auth schemas', () => {
  const validSignup: SignupPayload = {
    name: 'Test User',
    email: 'test@example.com',
    phone: '+919876543210',
    password: 'secret1',
    confirmPassword: 'secret1',
  };

  const createSignupForm = (overrides: Partial<SignupPayload> = {}) =>
    TestBed.runInInjectionContext(() =>
      form(signal({ ...validSignup, ...overrides }), signupSchema),
    );

  it('accepts a valid signup', () => {
    expect(createSignupForm()().valid()).toBe(true);
  });

  it('requires every signup field', () => {
    const f = createSignupForm({
      name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
    });
    expect(messages(f.name)).toContain('Name is required');
    expect(messages(f.email)).toContain('Email is required');
    expect(messages(f.phone)).toContain('Phone number is required');
    expect(messages(f.password)).toContain('Password is required');
    expect(messages(f.confirmPassword)).toContain('Please confirm your password');
  });

  it('validates email, phone and password length', () => {
    const f = createSignupForm({ email: 'not-an-email', phone: '12345', password: 'abc' });
    expect(messages(f.email)).toContain('Please enter a valid email');
    expect(messages(f.phone)).toContain('Phone number must be 10–15 digits (optional leading +)');
    expect(messages(f.password)).toContain('Password must be at least 6 characters');
  });

  it('flags mismatched passwords and re-validates when password changes', () => {
    const f = createSignupForm({ confirmPassword: 'different' });
    expect(messages(f.confirmPassword)).toContain('Passwords do not match');

    f.password().value.set('different');
    expect(f.confirmPassword().valid()).toBe(true);
  });

  it('uses the same password rules for reset password', () => {
    const f = TestBed.runInInjectionContext(() =>
      form(signal({ password: 'secret1', confirmPassword: 'secret2' }), resetPasswordSchema),
    );
    expect(messages(f.confirmPassword)).toContain('Passwords do not match');
  });

  it('requires email and password to log in', () => {
    const f = TestBed.runInInjectionContext(() =>
      form(signal({ email: '', password: '' }), loginSchema),
    );
    expect(f().valid()).toBe(false);
    expect(messages(f.password)).toContain('Password is required');
  });
});
