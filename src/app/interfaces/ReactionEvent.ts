export interface ReactionEventDto {
  conversationId: number;
  messageId: number;
  type: 'LIKE' | 'LAUGH' | 'SAD' | 'ANGRY' | 'FIRE' | null; // null if removed
  reactedById: number;
  action: 'ADDED' | 'REMOVED' | 'CHANGED';
}
