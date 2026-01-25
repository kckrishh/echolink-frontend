import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ConversationService } from '../../service/conversation.service';

@Component({
  selector: 'app-dm',
  templateUrl: './dm.component.html',
  styleUrl: './dm.component.css',
})
export class DmComponent implements OnInit {
  activeTab = 'messages';
  conversations$: any;
  pendingConversations$: any;

  constructor(
    private router: Router,
    private conversationService: ConversationService,
  ) {}

  ngOnInit(): void {
    this.conversations$ = this.conversationService.conversations$;
    this.pendingConversations$ = this.conversationService.pendingConversations$;
    this.getConversations();
    this.getPendingConversations();
  }

  openChat(convo: any) {
    this.conversationService.sendConvo(convo);
    this.router.navigate(['/chat/dm'], {
      queryParams: { conversationId: convo.conversationId },
    });
    this.conversationService.enterChatOnMobile();
  }

  getConversations() {
    this.conversationService.loadConversations().subscribe();
  }

  getPendingConversations() {
    this.conversationService.loadPendingConversations().subscribe();
  }

  ignoreRequest(convo: any) {}

  acceptRequest(convo: any) {}
}
function next(value: any): void {
  throw new Error('Function not implemented.');
}
