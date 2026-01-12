import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RegisterService } from '../../register.service';
// import { RegisterService } from '../register.service';

type AvatarGroup = { label: string; style: string; seeds: string[] };

@Component({
  selector: 'app-onboarding',
  templateUrl: './on-boarding.component.html',
  styleUrl: './on-boarding.component.css',
})
export class OnboardingComponent implements OnInit {
  form!: FormGroup;

  email = '';
  loading = false;
  apiError: string | null = null;

  selectedAvatarUrl: string | null = null;
  selectedKey: string | null = null;

  avatarGroups: AvatarGroup[] = [
    {
      label: 'Adventurer',
      style: 'adventurer',
      seeds: ['a1', 'a2', 'a3', 'a4', 'a5', 'a6', 'a7', 'a8', 'a9', 'a10'],
    },
    {
      label: 'Bottts',
      style: 'bottts',
      seeds: ['b1', 'b2', 'b3', 'b4', 'b5', 'b6', 'b7', 'b8', 'b9', 'b10'],
    },
    {
      label: 'Thumbs',
      style: 'thumbs',
      seeds: ['t1', 't2', 't3', 't4', 't5', 't6', 't7', 't8', 't9', 't10'],
    },
    {
      label: 'Pixel Art',
      style: 'pixel-art',
      seeds: ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8', 'p9', 'p10'],
    },
  ];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private registerService: RegisterService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      username: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(20),
        ],
      ],
      bio: ['', [Validators.maxLength(160)]],
    });

    this.route.queryParams.subscribe((p) => {
      const qpEmail = p['email'];
      this.email = (qpEmail || localStorage.getItem('pendingEmail') || '')
        .trim()
        .toLowerCase();

      if (!this.email) {
        this.router.navigate(['/auth/register']);
        return;
      }

      localStorage.setItem('pendingEmail', this.email);
    });

    const g = this.avatarGroups[0];
    this.selectAvatar(g.style, g.seeds[0]);
  }

  getAvatarUrl(style: string, seed: string): string {
    return `https://api.dicebear.com/9.x/${style}/svg?seed=${encodeURIComponent(
      seed
    )}`;
  }

  selectAvatar(style: string, seed: string): void {
    this.selectedKey = `${style}:${seed}`;
    this.selectedAvatarUrl = this.getAvatarUrl(style, seed);
  }

  randomizeAvatar(): void {
    const group =
      this.avatarGroups[Math.floor(Math.random() * this.avatarGroups.length)];
    const seed = group.seeds[Math.floor(Math.random() * group.seeds.length)];
    this.selectAvatar(group.style, seed);
  }

  onSubmit(): void {
    this.apiError = null;

    if (this.form.invalid || !this.selectedAvatarUrl) {
      this.form.markAllAsTouched();
      return;
    }

    const username = this.form.value.username.trim();

    this.loading = true;
    this.registerService
      .completeProfile(
        this.email,
        username,
        this.form.value.bio.trim(),
        this.selectedAvatarUrl
      )
      .subscribe({
        next: () => {
          this.loading = false;

          // cleanup
          localStorage.removeItem('pendingEmail');

          this.router.navigate(['/auth']);
        },
        error: (err) => {
          this.loading = false;
          this.apiError =
            err?.error?.message ||
            err?.error ||
            'Failed to complete onboarding. Please try again.';
        },
      });
  }
}
