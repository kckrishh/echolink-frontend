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
export class ChatComponent implements OnInit, OnDestroy {
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
    // ✅ closes drawers when you navigate (ex: clicking a convo)

    this.viewSub = this.conversationService.mobileView$.subscribe((view) => {
      this.mobileView = view;
    });
  }

  ngOnInit(): void {
    this.isMobile = window.innerWidth < 768;

    window.addEventListener('resize', () => {
      this.isMobile = window.innerWidth < 768;
    });

    if (this.isMobile) {
      this.conversationService.enterChatOnMobile();
    }

    if (this.router.url.includes('dm') && this.isMobile) {
      this.conversationService.backToList();
    } else {
      this.conversationService.enterChatOnMobile;
    }
  }

  private findConversationId(route: ActivatedRoute): string | null {
    let r: ActivatedRoute | null = route;
    while (r) {
      const id = r.snapshot.queryParamMap.get('conversationId');
      if (id) return id;
      r = r.firstChild;
    }
    return null;
  }

  ngOnDestroy(): void {
    this.navSub.unsubscribe();
    this.viewSub.unsubscribe();
  }
}
