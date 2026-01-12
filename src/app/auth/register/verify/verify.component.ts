import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RegisterService } from '../../register.service';

@Component({
  selector: 'app-verify',
  templateUrl: './verify.component.html',
  styleUrl: './verify.component.css',
})
export class VerifyComponent implements OnInit {
  verifyForm!: FormGroup;

  email!: string;

  loading = false;
  apiError: string | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private registerService: RegisterService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.email = params['email'];

      if (!this.email) {
        this.router.navigate(['/auth/register']);
      }
    });

    this.verifyForm = this.fb.group({
      code: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  onSubmit(): void {
    this.apiError = null;

    if (this.verifyForm.invalid) {
      this.verifyForm.markAllAsTouched();
      return;
    }

    this.loading = true;

    const code = this.verifyForm.value.code.trim();

    this.registerService.verifyEmail(this.email, code).subscribe({
      next: () => {
        this.loading = false;

        this.router.navigate(['/auth/complete-profile'], {
          queryParams: { email: this.email },
        });
      },
      error: (err) => {
        this.loading = false;

        this.apiError =
          err?.error?.message ||
          err?.error ||
          'Invalid or expired verification code';
      },
    });
  }

  resendCode(): void {
    if (this.loading) return;

    this.loading = true;
    this.apiError = null;

    this.registerService
      .registerStart(this.email, 'TEMP') // ⚠️ read note below
      .subscribe({
        next: () => {
          this.loading = false;
        },
        error: (err) => {
          this.loading = false;
          this.apiError =
            err?.error?.message ||
            err?.error ||
            'Failed to resend verification code';
        },
      });
  }
}
