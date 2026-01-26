import { ReactionsDto } from './ReactionsDto';

export interface MessageDto {
  messageId: number;
  conversationId: number;
  content: string;
  senderId: number;
  senderUsername: string;
  senderAvatar: string;
  createdAt?: string;
  reactions: ReactionsDto[];
}
