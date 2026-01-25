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
import { filter, take, forkJoin } from 'rxjs';
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
  private messageSound = new Audio('message-sound.wav');
  isMessageSeen = false;
  loading = false;
  isMobile!: boolean;

  constructor(
    private route: ActivatedRoute,
    private messageService: MessageService,
    private conversationService: ConversationService,
    private stompService: StompService,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    this.isMobile = window.innerWidth < 768;

    window.addEventListener('resize', () => {
      this.isMobile = window.innerWidth < 768;
    });

    this.route.queryParams.subscribe((params) => {
      this.conversationId = params['conversationId'];
      if (!this.conversationId) return;

      this.loading = true;
      forkJoin({
        messages: this.messageService.getMessages(this.conversationId),
        convo: this.conversationService.getSingleConversation(
          this.conversationId,
        ),
      }).subscribe({
        next: ({ messages, convo }) => {
          this.messages = messages;
          this.clickedConvo = convo;

          this.conversationService.markAsRead(this.conversationId).subscribe({
            next: () => {
              this.conversationService.loadConversations().subscribe();
            },
          });
          this.loading = false;
        },
        error: (error) => {
          console.log(error);
          this.loading = false;
        },
      });
    });

    this.stompService.connectWhenReady();
    this.stompService.stompConnected$
      .pipe(
        filter((val) => val),
        take(1),
      )
      .subscribe(() => {
        this.subscribeForMessage();
        this.subscribeForTypingIndicator();
        this.subscribeForSeenIndicator();
      });

    this.authService.me$.subscribe({
      next: (res) => {
        this.me = res;
      },
    });
  }
  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  scrollToBottom() {
    if (this.messageContainer?.nativeElement) {
      if (!this.isMobile) {
        this.messageContainer.nativeElement.scrollTop =
          this.messageContainer.nativeElement.scrollHeight;
      } else {
        this.messageContainer.nativeElement.scrollTop =
          this.messageContainer.nativeElement.scrollHeight + 30;
      }
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
      if (msg.senderId !== this.me.id) {
        this.messageSound.volume = 0.4;
        this.messageSound.currentTime = 0;
        this.messageSound.play().catch(() => {});
      }

      if (msg.senderId === this.me.id) {
        this.isMessageSeen = false;
      }
      if (String(msg.conversationId) === String(this.conversationId)) {
        this.messages.push(msg);
        this.messageText = '';

        this.conversationService.markAsRead(this.conversationId).subscribe({
          next: () => this.conversationService.loadConversations().subscribe(),
        });
      }
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

  isOtherTyping = false;
  typingTimeout: any = null;
  hasSentTypingTrue = false;
  onTyping() {
    if (!this.conversationId) return;

    if (!this.hasSentTypingTrue) {
      this.hasSentTypingTrue = true;

      this.stompService.publishForTypeIndicator('/app/chat.typing', {
        conversationId: this.conversationId,
        typing: true,
      });
    }

    clearTimeout(this.typingTimeout);

    this.typingTimeout = setTimeout(() => {
      this.hasSentTypingTrue = false;
      this.stompService.publishForTypeIndicator('/app/chat.typing', {
        conversationId: this.conversationId,
        typing: false,
      });
    }, 1000);
  }

  subscribeForTypingIndicator() {
    this.stompService.subscribeForTypingIndicator(
      '/user/queue/typing',
      (message: IMessage) => {
        const resp = JSON.parse(message.body);
        console.log(resp);

        if (String(resp.data.conversationId) === String(this.conversationId)) {
          this.isOtherTyping = resp.data.typing;
        }
      },
    );
  }

  subscribeForSeenIndicator() {
    this.stompService.subscribeForSeenIndicator(
      '/user/queue/seen',
      (message: IMessage) => {
        const evt = JSON.parse(message.body);

        if (
          evt.eventType === 'DM_SEEN' &&
          String(evt.data.conversationId) === String(this.conversationId)
        ) {
          this.isMessageSeen = true;
        }
      },
    );
  }

  goBack() {
    this.conversationService.backToList();
  }
}
