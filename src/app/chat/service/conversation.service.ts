import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ConversationService {
  constructor(private http: HttpClient) {}
  baseUrl = 'http://localhost:8080/dm';

  private conversations = new BehaviorSubject<any>([]);
  conversations$ = this.conversations.asObservable();
  loadConversations() {
    return this.http.get(`${this.baseUrl}/conversations`).pipe(
      tap((res) => {
        this.conversations.next(res);
      })
    );
  }

  private pendingConversations = new BehaviorSubject<any>([]);
  pendingConversations$ = this.pendingConversations.asObservable();
  loadPendingConversations() {
    return this.http.get(`${this.baseUrl}/pendingConversations`).pipe(
      tap((res) => {
        this.pendingConversations.next(res);
      })
    );
  }

  private clickedConvo = new BehaviorSubject<any>(null);
  clickedConvo$ = this.clickedConvo.asObservable();
  sendConvo(convo: any) {
    this.clickedConvo.next(convo);
  }

  getSingleConversation(conversationId: any) {
    return this.http.get(
      `${this.baseUrl}/${conversationId}/getSingleConversation`
    );
  }

  markAsRead(conversationId: any) {
    return this.http.post(`${this.baseUrl}/${conversationId}/read`, {});
  }
}
