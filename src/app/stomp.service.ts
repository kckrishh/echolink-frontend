import { Injectable } from '@angular/core';
import { Client, StompSubscription } from '@stomp/stompjs';
import { BehaviorSubject, filter, take } from 'rxjs';
import { AuthService } from './auth/auth.service';

@Injectable({ providedIn: 'root' })
export class StompService {
  private client: Client;
  private stompConnected = new BehaviorSubject<any>(false);
  stompConnected$ = this.stompConnected.asObservable();

  constructor(private authService: AuthService) {
    const token = authService.getAccessToken();
    this.client = new Client({
      brokerURL: 'ws://localhost:8080/ws',
      reconnectDelay: 5000,
      beforeConnect: () => {
        const token = this.authService.getAccessToken();
        if (token) {
          this.client.connectHeaders = { Authorization: `Bearer ${token}` };
        }
      },
    });

    this.client.onConnect = () => {
      this.stompConnected.next(true);
      console.log('STOMP connected');
    };

    this.client.onWebSocketClose = () => {
      console.log('WS closed');
    };

    this.client.onStompError = (frame) => {
      console.log('Broker error', frame);
    };
  }
  connectWhenReady(): void {
    // ✅ wait until token exists, then connect once
    this.authService.loggedIn$
      .pipe(
        filter((t): t is string => !!t),
        take(1),
      )
      .subscribe(() => {
        if (!this.client.active) this.client.activate();
      });
  }

  subscribe(destination: string, callback: any): StompSubscription {
    return this.client.subscribe(destination, callback);
  }

  publish(destination: string, body: any): void {
    this.client.publish({ destination, body: JSON.stringify(body) });
  }

  subscribeForTypingIndicator(
    destination: string,
    callback: any,
  ): StompSubscription {
    return this.client.subscribe(destination, callback);
  }

  publishForTypeIndicator(destination: string, body: any): void {
    return this.client.publish({ destination, body: JSON.stringify(body) });
  }

  subscribeForSeenIndicator(
    destination: string,
    callback: any,
  ): StompSubscription {
    return this.client.subscribe(destination, callback);
  }
}
