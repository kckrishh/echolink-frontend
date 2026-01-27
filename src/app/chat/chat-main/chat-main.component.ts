import {
  AfterViewChecked,
  Component,
  ElementRef,
  NgZone,
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
import { MessageDto } from '../../interfaces/MessageDto';

type WsEvent<T> = {
  eventType: 'DM_MESSAGE' | 'DM_REQUEST';
  data: T;
};

type ReactionType = 'LIKE' | 'LAUGH' | 'SAD' | 'ANGRY' | 'FIRE';

@Component({
  selector: 'app-chat-main',
  templateUrl: './chat-main.component.html',
  styleUrl: './chat-main.component.css',
})
export class ChatMainComponent implements OnInit, AfterViewChecked {
  protected conversationId: String | null = null;
  protected messages!: MessageDto[];
  protected clickedConvo: any = null;
  protected me: any;
  protected myId = 1;
  @ViewChild('messageContainer') messageContainer!: ElementRef;
  messageText: string = '';
  private messageSound = new Audio('message-sound.wav');
  isMessageSeen = false;
  loading = false;

  constructor(
    private route: ActivatedRoute,
    private messageService: MessageService,
    private conversationService: ConversationService,
    private stompService: StompService,
    private authService: AuthService,
    private ngZone: NgZone,
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
        this.subscribeForReaction();
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

  isMobile!: boolean;

  goBack() {
    this.conversationService.backToList();
  }

  activeReactionMessageId: number | null = null;
  private pressTimer: any = null;

  reactionEmoji(type: ReactionType | null): string {
    switch (type) {
      case 'LIKE':
        return '👍';
      case 'LAUGH':
        return '😂';
      case 'SAD':
        return '😢';
      case 'ANGRY':
        return '😡';
      case 'FIRE':
        return '🔥';
      default:
        return '';
    }
  }

  openReactionPicker(message: MessageDto, event: MouseEvent) {
    event.stopPropagation();
    this.activeReactionMessageId = message.messageId;
  }

  onMsgPressStart(message: MessageDto) {
    // long press only on mobile
    if (!this.isMobile) return;

    this.pressTimer = setTimeout(() => {
      this.activeReactionMessageId = message.messageId;
    }, 420); // tweak 350-500ms
  }

  onMsgPressEnd() {
    if (this.pressTimer) clearTimeout(this.pressTimer);
    this.pressTimer = null;
  }

  react(message: MessageDto, type: ReactionType, event: Event) {
    // close picker instantly

    console.log('react button clicked');
    event?.stopPropagation();
    this.activeReactionMessageId = null;

    const payload = {
      messageId: message.messageId,
      type: type,
    };

    // send to backend
    this.stompService.publishForReaction('/app/chat.reaction', payload);
  }

  subscribeForReaction() {
    this.stompService.subscribeForReaction(
      '/user/queue/reaction',
      (message: IMessage) => {
        console.log('RAW WS REACTION FRAME: ', message.body);
        const evt = JSON.parse(message.body);
        console.log('PARSED EVT:', evt);
        console.log('CURRENT CONVO:', this.conversationId);

        if (
          evt.eventType === 'DM_REACTION' &&
          String(evt.data.conversationId) === String(this.conversationId)
        ) {
          console.log('MATCHES THIS CHAT');
          console.log('APPLUING REACTION UPDATE NOW');
          this.ngZone.run(() => {
            const msgIndex = this.messages.findIndex(
              (m) => m.messageId === evt.messageId,
            );
            if (msgIndex === -1) return;

            const msg = this.messages[msgIndex];
            const reactions = msg.reactions ? [...msg.reactions] : [];

            const rIndex = reactions.findIndex(
              (r) => r.reactedById === evt.reactedById,
            );

            if (evt.action === 'REMOVED') {
              if (rIndex !== -1) reactions.splice(rIndex, 1);
            } else {
              const newReaction = {
                type: evt.type as ReactionType,
                reactedById: evt.reactedById,
              };
              if (rIndex === -1) reactions.push(newReaction);
              else reactions[rIndex] = newReaction;
            }

            this.messages[msgIndex] = { ...msg, reactions };
            this.messages = [...this.messages]; // ✅ THIS is the hammer
          });
        }
      },
    );
  }
}
