import { Component, OnInit } from '@angular/core';
import { Me } from '../../../../interfaces/me';
import { AuthService } from '../../../../auth/auth.service';
import { Route, Router } from '@angular/router';

@Component({
  selector: 'app-my-profile',
  templateUrl: './my-profile.component.html',
  styleUrl: './my-profile.component.css',
})
export class MyProfileComponent implements OnInit {
  email: string = '';
  username: string = '';

  showChangePassword = false;
  showChangeUsername = false;
  showChangeAvatar = false;

  avatarGroups: any = [
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

  // ===== SELECTED AVATAR =====
  selectedAvatar: {
    style: string;
    seed: string;
  } | null = null;

  me: Me | null = null;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.authService.getMe().subscribe((next: Me | null) => {
      this.me = next;
    });
  }

  // ===== SELECT AVATAR =====
  selectAvatar(style: string, seed: string): void {
    this.selectedAvatar = { style, seed };
  }

  // ===== SAVE AVATAR =====
  saveAvatar(style: string, seed: string): void {
    let newUrl = this.getAvatarUrl(style, seed);
    this.authService.changeProfile(newUrl).subscribe((next) => {
      this.router.navigate(['/profile']);
    });
  }

  // ===== HELPER FOR IMAGE URL (optional but clean) =====
  getAvatarUrl(style: string, seed: string): string {
    return `https://api.dicebear.com/9.x/${style}/svg?seed=${seed}`;
  }

  toggleShowChangePassword(event: Event) {
    event.stopPropagation();
    this.showChangePassword = !this.showChangePassword;
  }
  toggleShowChangeUsername(event: Event) {
    event.stopPropagation();
    this.showChangeUsername = !this.showChangeUsername;
  }
}
