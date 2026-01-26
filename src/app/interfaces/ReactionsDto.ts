export interface ReactionsDto {
  type: 'LIKE' | 'LAUGH' | 'SAD' | 'ANGRY' | 'FIRE';
  reactedById: number;
}
