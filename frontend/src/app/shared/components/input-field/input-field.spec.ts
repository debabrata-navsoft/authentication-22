import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideLucideIcons } from '@lucide/angular';
import { APP_ICONS } from '../../data/icons.data';
import { form, required } from '@angular/forms/signals';
import { InputField } from './input-field';

describe('InputField', () => {
  let fixture: ComponentFixture<InputField>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InputField],
      providers: [provideLucideIcons(...APP_ICONS)],
    }).compileComponents();

    const field = TestBed.runInInjectionContext(() =>
      form(signal(''), (path) => required(path, { message: 'Email is required' })),
    );

    fixture = TestBed.createComponent(InputField);
    fixture.componentRef.setInput('label', 'Email');
    fixture.componentRef.setInput('field', field);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should show the error message only after the field is touched', async () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.error')).toBeNull();

    el.querySelector('input')!.dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    await fixture.whenStable();

    expect(el.querySelector('.error')?.textContent).toContain('Email is required');
  });
});
