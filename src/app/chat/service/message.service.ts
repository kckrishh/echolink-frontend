import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MessageService {
  baseUrl = 'https://api.echolink.live/dm';

  constructor(private http: HttpClient) {}

  messages = new BehaviorSubject<any>(null);
  messages$ = this.messages.asObservable();

  getMessages(conversationId: any) {
    return this.http.get(`${this.baseUrl}/${conversationId}/messages`).pipe(
      tap((res) => {
        this.messages.next(res);
      }),
    );
  }

  sendMessage(messageRequest: any) {
    return this.http.post(`${this.baseUrl}/sendMessage`, messageRequest);
  }
}
