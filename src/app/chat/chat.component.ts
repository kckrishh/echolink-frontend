// chat.component.ts
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { ConversationService } from './service/conversation.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css',
})
export class ChatComponent implements OnInit {
  isGroup = false;
  isMobile = false;

  mobileView: 'list' | 'chat' = 'list';

  private navSub!: Subscription;
  private viewSub!: Subscription;

  constructor(
    private router: Router,
    private conversationService: ConversationService,
    private route: ActivatedRoute,
  ) {
    this.viewSub = this.conversationService.mobileView$.subscribe((view) => {
      this.mobileView = view;
    });
  }

  ngOnInit(): void {
    this.isMobile = window.innerWidth < 768;

    window.addEventListener('resize', () => {
      this.isMobile = window.innerWidth < 768;
    });

    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        if (this.router.url.includes('dm') && this.isMobile) {
          this.conversationService.backToList();
        } else {
          this.conversationService.enterChatOnMobile;
        }
      });
  }
}
