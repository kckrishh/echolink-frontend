import {
  AfterViewChecked,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MessageService } from '../service/message.service';
import { ConversationService } from '../service/conversation.service';
import { StompService } from '../../stomp.service';
import { IMessage } from '@stomp/stompjs';
import { filter, take } from 'rxjs';
import { AuthService } from '../../auth/auth.service';

type WsEvent<T> = {
  eventType: 'DM_MESSAGE' | 'DM_REQUEST';
  data: T;
};

type MessageDto = {
  messageId: number;
  conversationId: number;
  content: string;
  senderId: number;
  senderUsername: string;
  senderAvatar: string;
  createdAt?: string;
};

@Component({
  selector: 'app-chat-main',
  templateUrl: './chat-main.component.html',
  styleUrl: './chat-main.component.css',
})
export class ChatMainComponent implements OnInit, AfterViewChecked {
  protected conversationId: String | null = null;
  protected messages: any = null;
  protected clickedConvo: any = null;
  protected me: any;
  protected myId = 1;
  @ViewChild('messageContainer') messageContainer!: ElementRef;
  messageText: string = '';

  constructor(
    private route: ActivatedRoute,
    private messageService: MessageService,
    private conversationService: ConversationService,
    private stompService: StompService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.conversationId = params['conversationId'];
      if (this.conversationId) {
        this.getMessages();
        this.getClickedConvo();

        this.conversationService.markAsRead(this.conversationId).subscribe({
          next: () => {
            this.conversationService.loadConversations().subscribe();
          },
        });
      }
    });
    this.stompService.connectWhenReady();
    this.stompService.stompConnected$
      .pipe(
        filter((val) => val),
        take(1)
      )
      .subscribe(() => {
        this.subscribeForMessage();
      });

    this.authService.me$.subscribe({
      next: (res) => {
        console.log(res);
        this.me = res;
      },
    });
  }
  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  getMessages() {
    this.messageService.getMessages(this.conversationId).subscribe({
      next: (value: any) => {
        this.messages = value;
      },
    });
  }

  getClickedConvo() {
    this.conversationService
      .getSingleConversation(this.conversationId)
      .subscribe({
        next: (value: any) => {
          this.clickedConvo = value;
        },
      });
  }

  scrollToBottom() {
    if (this.messageContainer?.nativeElement) {
      this.messageContainer.nativeElement.scrollTop =
        this.messageContainer.nativeElement.scrollHeight;
    }
  }

  sendMessage() {
    if (this.messageText) {
      this.stompService.publish('/app/chat.sendMessage', {
        targetUsername: this.clickedConvo.otherUsername,
        text: this.messageText,
      });
    }
  }

  subscribeForMessage() {
    this.stompService.subscribe('/user/queue/messages', (message: IMessage) => {
      const payload = JSON.parse(message.body) as WsEvent<MessageDto>;
      const msg = payload.data;
      if (String(msg.conversationId) === String(this.conversationId)) {
        this.messages.push(msg);
        this.messageText = '';
        console.log(message.body);

        this.conversationService.markAsRead(this.conversationId).subscribe({
          next: () => this.conversationService.loadConversations().subscribe(),
        });
      }
      console.log(message);
      if (payload.eventType === 'DM_REQUEST') {
        this.conversationService.loadPendingConversations().subscribe();
        this.conversationService.loadConversations().subscribe();
      } else {
        this.conversationService.loadConversations().subscribe();
        this.conversationService.loadPendingConversations().subscribe();
      }
    });
  }

  acceptRequest(clickedConvo: any) {}
  ignoreRequest(clickedConvo: any) {}
}
