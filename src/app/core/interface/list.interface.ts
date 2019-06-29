export interface List {
  id: number;
  title: string;
  listSort: number;
  cards: Array<Card>;
}

export interface Card {
  title: number;
  id?: number;
  cardTitle: string;
  description: string | null;
  comments: Array<Comment>;
  cardSort: number;
}

export interface Comment {
  id: number;
  comment: string;
  card: number;
}
