// chat.component.ts
import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
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

  // open state (controls translate/opacity classes)
  leftDrawerOpen = false;
  rightDrawerOpen = false;

  // render state (keeps DOM alive long enough to animate out)
  leftDrawerRender = false;
  rightDrawerRender = false;

  private navSub: Subscription;

  constructor(
    private router: Router,
    private conversationService: ConversationService,
  ) {
    // ✅ closes drawers when you navigate (ex: clicking a convo)
    this.navSub = this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe(() => this.conversationService.enterChatOnMobile());

    this.conversationService.mobileView$.subscribe((view) => {
      this.mobileView = view;
    });
  }

  ngOnInit(): void {
    this.isMobile = window.innerWidth < 768;

    window.addEventListener('resize', () => {
      this.isMobile = window.innerWidth < 768;
    });
  }

  ngOnDestroy(): void {
    this.navSub.unsubscribe();
  }
}
