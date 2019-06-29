import { Component, EventEmitter, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Card } from 'src/app/core/interface/list.interface';
import { CardService } from 'src/app/core/service/card.service';

@Component({
  selector: 'app-dialog-content',
  templateUrl: './dialog-content.component.html',
  styleUrls: ['./dialog-content.component.css']
})
export class DialogContentComponent implements OnInit {
  appUrl: string = environment.appUrl;
  updateData = {};
  updateData2 = {};
  onAdd = new EventEmitter();
  changeCardContent = new EventEmitter();

  descriptionState = true;
  valueTrue = false;
  flag = 0;

  constructor(
    public dialogRef: MatDialogRef<DialogContentComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { cardId: number },
    private http: HttpClient,
    public cardService: CardService
  ) {}

  ngOnInit() {
    this.getCards();
  }

  getCards() {
    this.http
      .get(`${this.appUrl}card/${this.data.cardId}/`)
      .subscribe((card: Card) => {
        console.log(card);
        this.cardService.card = { ...card, id: this.data.cardId };
      });
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  // sendData(
  //   cardContent: HTMLInputElement,
  //   inputComment: HTMLInputElement,
  //   cardId,
  //   wholeItem,
  //   TodoID,
  //   titleInput
  // ) {
  //   console.log(inputComment.value);
  //   this.updateData = {
  //     cardContent: cardContent.value,
  //     commentContent: inputComment.value,
  //     cardId: cardId.innerHTML,
  //     Item: wholeItem,
  //     TodosID: TodoID,
  //     title: titleInput.value
  //   };
  //   this.onAdd.emit(this.updateData);
  // }

  changeDescriptionState() {
    setTimeout(() => {
      this.descriptionState
        ? (this.descriptionState = false)
        : (this.descriptionState = true);
    }, 100);
  }

  changeContent(descriptionInput, cardID, wholeItem, TodoID) {
    this.updateData2 = {
      descriptionInput: descriptionInput.value,
      cardId: cardID,
      Item: wholeItem,
      TodosID: TodoID
    };
    this.changeCardContent.emit(this.updateData2);
  }

  typing(inputComment) {
    inputComment.value ? (this.valueTrue = true) : (this.valueTrue = false);
  }

  titleResize(textarea: HTMLTextAreaElement) {
    textarea.style.height = '1px';
    textarea.style.height = `${textarea.scrollHeight}px`;
  }

  clickDescriptionBtn(descriptionInput: HTMLTextAreaElement, cardId: number) {
    this.http
      .patch(`${this.appUrl}card/${cardId}/`, {
        description: descriptionInput.value
      })
      .subscribe(() => this.getCards());
  }

  changeTitle(titleInput: HTMLInputElement, cardId: number) {
    this.http
      .patch(`${this.appUrl}card/${cardId}/`, {
        cardTitle: titleInput.value
      })
      .subscribe(() => this.getCards());
  }

  addComment(inputComment: HTMLInputElement, cardId: number) {
    this.http
      .post(`${this.appUrl}comments/`, {
        comment: inputComment.value,
        card: cardId
      })
      .subscribe(() => this.getCards());
    inputComment.value = '';
  }

  activityEditSave(activityEdit: HTMLTextAreaElement, commentID: number) {
    this.http
      .patch(`${this.appUrl}comments/${commentID}/`, {
        comment: activityEdit.value
      })
      .subscribe(() => this.getCards());
    this.flag = 0;
  }

  activityEditDelete(commentID: number) {
    this.http
      .delete(`${this.appUrl}comments/${commentID}/`)
      .subscribe(() => this.getCards());
  }
}
