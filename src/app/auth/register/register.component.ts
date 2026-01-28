import { Component } from '@angular/core';
import { RegisterService } from '../register.service';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';

function passwordMatchValidator(
  control: AbstractControl,
): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirm = control.get('confirmPassword')?.value;

  if (!password || !confirm) return null;

  return password === confirm ? null : { passwordMismatch: true };
}

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {
  registerForm: FormGroup;
  loading = false;
  apiError: string | null = null;
  policyOpen = false;
  activePolicy: 'terms' | 'privacy' = 'terms';

  constructor(
    private registerService: RegisterService,
    private fb: FormBuilder,
    private router: Router,
  ) {
    this.registerForm = this.fb.group(
      {
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]],
        terms: [false, Validators.requiredTrue],
      },
      { Validators: passwordMatchValidator },
    );
  }

  openPolicy(which: 'terms' | 'privacy') {
    this.activePolicy = which;
    this.policyOpen = true;
  }

  closePolicy() {
    this.policyOpen = false;
  }
  onSubmit() {
    this.apiError = null;
    if (this.loading) return;

    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    const email = this.registerForm.value.email.trim().toLowerCase();
    const password = this.registerForm.value.password;

    this.loading = true;

    this.registerService.registerStart(email, password).subscribe({
      next: () => {
        this.loading = false;

        // send them to verify screen (keep email so they don't retype)
        this.router.navigate(['/auth/verify'], { queryParams: { email } });
      },
      error: (err) => {
        this.loading = false;

        // basic backend error extraction
        this.apiError =
          err?.error?.message ||
          err?.error ||
          'Something went wrong. Please try again.';
      },
    });
  }
}
