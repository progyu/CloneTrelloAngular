import { Injectable } from '@angular/core';
import { Card } from '../interface/list.interface';

@Injectable({
  providedIn: 'root'
})
export class CardService {
  card: Card;
}
