import { Component, OnInit } from '@angular/core';
import { StompService } from './stomp.service';
import { AuthService } from './auth/auth.service';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  showNavbar = true;
  isChat!: boolean;

  constructor(
    private stompService: StompService,
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.authService.initSession().subscribe();
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        const route = this.router.routerState.root.firstChild;
        this.showNavbar = !route?.snapshot.data['hideNavbar'];
        if (this.router.url.includes('chat')) {
          this.isChat = true;
        }
      });
  }
}
