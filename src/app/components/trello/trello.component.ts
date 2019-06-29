import { Component, OnInit, Renderer2 } from '@angular/core';
import { BgColors } from 'src/app/core/type/bg-color';
import { HttpClient } from '@angular/common/http';
import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem
} from '@angular/cdk/drag-drop';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';

import { environment } from 'src/environments/environment';

import { DialogContentComponent } from '../dialog-content/dialog-content.component';

import { List, Card } from 'src/app/core/interface/list.interface';

@Component({
  selector: 'app-trello',
  templateUrl: './trello.component.html',
  styleUrls: ['./trello.component.css']
})
export class TrelloComponent implements OnInit {
  appUrl: string = environment.appUrl;
  lists: List[];
  colorBoolean = false;
  colors: BgColors[] = ['#0079BF', '#D29034', '#4BBF6B', '#B03642'];
  addListOpen = true;
  verticalContainerHeight = 0;
  verticalBoxHeight = 0;

  constructor(
    private renderer: Renderer2,
    private http: HttpClient,
    public dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.getBgColor();
    this.getLists();
  }

  getBgColor() {
    this.http
      .get(this.appUrl + 'backgroundcolors/1')
      .subscribe(backColor =>
        this.renderer.setStyle(
          document.body,
          'background-color',
          backColor['background_color']
        )
      );
  }

  changeBgColor(color: BgColors) {
    this.colorBoolean = !this.colorBoolean;
    this.http
      .patch(this.appUrl + 'backgroundcolors/1', { background_color: color })
      .subscribe(backColor =>
        this.renderer.setStyle(
          document.body,
          'background-color',
          backColor['background_color']
        )
      );
  }

  horizontalDrop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.lists, event.previousIndex, event.currentIndex);
    this.lists = this.lists.map((list, listSort) => {
      if (list.listSort !== listSort) {
        this.http
          .patch(`${this.appUrl}title/${list.id}/`, {
            listSort
          })
          .subscribe();
      }
      return { ...list, listSort };
    });
  }

  verticalDrop(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
      this.lists = this.lists.map(list => {
        if (+event.container.id === list.id) {
          const cards = list.cards.map((card, cardSort) => {
            this.http
              .patch(`${this.appUrl}card/${card.id}/`, {
                cardSort
              })
              .subscribe();
            return { ...card, cardSort };
          });
          return { ...list, cards };
        } else {
          return list;
        }
      });
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
      this.lists = this.lists.map(list => {
        if (+event.previousContainer.id === list.id) {
          const cards = list.cards.map((card, cardSort) => {
            this.http
              .patch(`${this.appUrl}card/${card.id}/`, {
                cardSort
              })
              .subscribe();
            return { ...card, cardSort };
          });
          return { ...list, cards };
        } else if (+event.container.id === list.id) {
          const cards = list.cards.map((card, cardSort) => {
            this.http
              .patch(`${this.appUrl}card/${card.id}/`, {
                cardSort,
                title: event.container.id
              })
              .subscribe();
            return { ...card, cardSort };
          });
          return { ...list, cards };
        } else {
          return list;
        }
      });
    }
  }

  getLists() {
    this.http
      .get<List[]>('http://clonetrelloapi.jinukk.me/main/')
      .subscribe(lists => (this.lists = lists));
  }

  getConnectedList(): any[] {
    return this.lists.map(x => `${x.id}`);
  }

  generateListSort() {
    return this.lists.length
      ? Math.max(...this.lists.map(({ listSort }) => listSort)) + 1
      : 0;
  }

  addList(input: HTMLInputElement) {
    if (!input.value.trim()) {
      return;
    }
    this.http
      .post<List>(this.appUrl + 'title/', {
        title: input.value.trim(),
        listSort: this.generateListSort()
      })
      .subscribe(list => (this.lists = [...this.lists, list]));
    input.value = '';
  }

  // List 삭제
  removeList(listId: number) {
    this.http.delete(this.appUrl + `title/${listId}/`).subscribe(() => this.lists = this.lists.filter(({ id }) => listId !== id));
  }

  // 카드 생성
  addCardTitle(cardInput: HTMLTextAreaElement) {
    const value = cardInput.value.trim();
    if (!value) {
      return;
    }
    let newCardSort = 0;
    this.lists.forEach(list => {
      if (+cardInput.id === list.id) {
        newCardSort = list.cards.length ? Math.max(...list.cards.map(({ cardSort }) => cardSort)) + 1 : 0;
      }
    });
    this.http.post(`${this.appUrl}card/`, {
      title: +cardInput.id,
      cardSort: newCardSort,
      cardTitle: value
    }).subscribe((card: Card) => {
      this.lists = this.lists.map(list => {
        if (+cardInput.id === list.id) {
          return { ...list, cards: [ ...list.cards, card ]};
        } else {
          return list;
        }
      });
    });
  }

  // 카드 삭제
  removeCard(listId: number, removeCardId: number) {
    const removeCard = this.lists = this.lists.map(list => {
      if (listId === list.id) {
        const newCard = list.cards.filter(({ id }) => removeCardId !== id);
        return { ...list, cards: [...newCard] };
      } else {
        return list;
      }
    });
    this.http.delete(`${this.appUrl}card/${removeCardId}/`).subscribe(() => removeCard);
  }

  removeSnackBar(listId: number, removeCardId: number, card = false) {
    const snackBarRef = this.snackBar.open(
      'Are you sure you want to delete?',
      'Delete',
      {
        duration: 5000,
        verticalPosition: 'top'
      }
    );
    snackBarRef.onAction().subscribe(() => {
      if (card) {
        this.removeCard(listId, removeCardId);
      } else {
        this.removeList(listId);
      }
    });
  }

  titleResize(textarea: HTMLTextAreaElement) {
    textarea.style.height = '1px';
    textarea.style.height = `${textarea.scrollHeight}px`;
  }

  changeTitle(
    verticalListHeaderTarget: HTMLDivElement,
    textarea: HTMLTextAreaElement
  ) {
    verticalListHeaderTarget.classList.add('is-hidden');
    textarea.focus();
  }

  changeTitleEnd(elem: HTMLTextAreaElement, block: HTMLDivElement) {
    const title = elem.value.trim();
    if (!title) {
      return;
    }
    block.classList.remove('is-hidden');
    this.http.patch<List>(`${this.appUrl}title/${elem.id}/`, {
      title
    }).subscribe(() => this.lists = this.lists.map(list => list.id === +elem.id ? { ...list, title } : list));
  }

  verticalPlaceholderHeight(elem: HTMLDivElement) {
    this.verticalContainerHeight = elem.scrollHeight;
  }

  boxPlaceholderHeight(elem: HTMLDivElement) {
    this.verticalBoxHeight = elem.scrollHeight;
  }

  showAddCard(
    cardComposer: HTMLDivElement,
    addCardBtn: HTMLAnchorElement,
    textarea: HTMLTextAreaElement
  ) {
    cardComposer.classList.remove('is-hidden');
    addCardBtn.classList.add('is-hidden');
    textarea.focus();
  }

  hideAddCard(cardComposer: HTMLDivElement, addCardBtn: HTMLAnchorElement) {
    cardComposer.classList.add('is-hidden');
    addCardBtn.classList.remove('is-hidden');
  }

  getCard(cardId: number) {
    // this.http.get(`${this.appUrl}card/${cardId}`).subscribe((card: Card) => {

    this.openDialog(
      // card.description,
      // card.cardTitle,
      cardId
      // card.title,
      // card.comments
    );
    // });
  }

  openDialog(
    // description: string,
    // title: string,
    cardId: number
    // listId,
    // comments
  ) {
    const dialogRef = this.dialog.open(DialogContentComponent, {
      height: '800px',
      width: '570px',
      data: {
        // content: description,
        // title,
        cardId
        // listId,
        // comment: comments
      }
    });

    const sub = dialogRef.componentInstance.onAdd.subscribe((data: any) => {
      this.lists = this.lists.map(item => {
        if (item.id === data.listId) {
          const cards = item.cards.map(item2 => {
            if (item2.id === +data.id) {
              return { ...item2, cardContent: data.cardContent };
            } else {
              return item2;
            }
          });
          return { ...item, cards };
        } else {
          return item;
        }
      });
    });

    const adding = dialogRef.componentInstance.changeCardContent.subscribe(
      (data: any) => {
        this.lists = this.lists.map(item => {
          if (item.id === data.listId) {
            const cards = item.cards.map(item2 => {
              if (item2.id === +data.id) {
                return { ...item2, cardContent: data.descriptionInput };
              } else {
                return item2;
              }
            });
            return { ...item, cards };
          } else {
            return item;
          }
        });
      }
    );

    dialogRef.afterClosed().subscribe(() => {
      this.getLists();
    });
  }
}
