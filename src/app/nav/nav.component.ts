import {
  ChangeDetectorRef,
  Component,
  HostListener,
  OnInit,
} from '@angular/core';
import { NgModel } from '@angular/forms';
import { SearchUserService } from './search-user.service';
import { Router } from '@angular/router';
import { ConversationService } from '../chat/service/conversation.service';
import { AuthService } from '../auth/auth.service';
import { Me } from '../interfaces/me';
import { filter, take, tap } from 'rxjs';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrl: './nav.component.css',
})
export class NavComponent implements OnInit {
  searchedUsername = '';
  searchedResult: any = null;
  username: string = '';
  showProfileDropDown: boolean = false;
  me: Me | null = null;

  constructor(
    private searchUserService: SearchUserService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private conversationService: ConversationService,
    protected authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.authService.loggedIn$
      .pipe(
        filter((val) => val),
        take(1),
      )
      .subscribe(() => {
        this.authService.getMe().subscribe({
          next: (res: Me | null) => {
            this.me = res;
          },
        });
      });
  }

  toggleShowProfileDropDown(event: Event) {
    event?.stopPropagation();
    this.showProfileDropDown = !this.showProfileDropDown;
  }

  searchUser() {
    if (this.searchedUsername) {
      this.searchUserService
        .searchUser(this.searchedUsername)
        .subscribe((next) => {
          this.searchedResult = next;
          this.cdr.detectChanges();
        });
    }
  }

  closeModal() {
    this.searchedResult = null;
    this.cdr.detectChanges();
  }

  openChat() {
    this.conversationService.sendConvo({
      otherUsername: this.searchedResult.username,
      status: this.searchedResult.status,
    });
    this.router.navigate(['/chat/dm'], {
      queryParams: {
        conversationId: this.searchedResult.conversationId,
        status: this.searchedResult.participantStatus,
      },
    });
    this.closeModal();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event?.target as HTMLElement;

    const clickedInside = target.closest('.profile-dropdown-container');

    if (!clickedInside && this.showProfileDropDown) {
      this.showProfileDropDown = false;
    }
  }
}
