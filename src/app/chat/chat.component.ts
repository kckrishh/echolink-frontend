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
      .subscribe(() => this.closeDrawers());

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

  openLeftDrawer() {
    this.leftDrawerRender = true;
    requestAnimationFrame(() => (this.leftDrawerOpen = true));
  }

  closeLeftDrawer() {
    this.leftDrawerOpen = false;
    setTimeout(() => (this.leftDrawerRender = false), 250);
  }

  openRightDrawer() {
    if (!this.isGroup) return;
    this.rightDrawerRender = true;
    requestAnimationFrame(() => (this.rightDrawerOpen = true));
  }

  closeRightDrawer() {
    this.rightDrawerOpen = false;
    setTimeout(() => (this.rightDrawerRender = false), 250);
  }

  closeDrawers() {
    if (this.leftDrawerRender) this.closeLeftDrawer();
    if (this.rightDrawerRender) this.closeRightDrawer();
  }
}
