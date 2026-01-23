import { Component, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter, Subscription } from 'rxjs';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css',
})
export class ChatComponent implements OnDestroy {
  isGroup = false;

  leftDrawerOpen = false;
  rightDrawerOpen = false;

  leftDrawerRender = false;
  rightDrawerRender = false;

  private navSub: Subscription;

  constructor(private router: Router) {
    this.navSub = this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe(() => {
        // ✅ close drawers after any navigation (like clicking a convo)
        this.closeDrawers();
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
    // close both safely
    if (this.leftDrawerRender) this.closeLeftDrawer();
    if (this.rightDrawerRender) this.closeRightDrawer();
  }
}
