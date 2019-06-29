import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatToolbarModule } from '@angular/material/toolbar';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { TrelloComponent } from './components/trello/trello.component';
import { HeaderComponent } from './components/header/header.component';
import { DialogContentComponent } from './components/dialog-content/dialog-content.component';
import { CardService } from './core/service/card.service';

import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@NgModule({
  declarations: [
    AppComponent,
    TrelloComponent,
    HeaderComponent,
    DialogContentComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MatToolbarModule,
    DragDropModule,
    MatCardModule,
    MatDialogModule,
    MatSnackBarModule,
    HttpClientModule,
    MatProgressSpinnerModule
  ],
  entryComponents: [TrelloComponent, DialogContentComponent],
  providers: [CardService],
  bootstrap: [AppComponent]
})
export class AppModule {}
