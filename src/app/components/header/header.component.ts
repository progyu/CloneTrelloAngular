import { Component, OnInit, Renderer2, Input, Output, EventEmitter } from '@angular/core';
import { BgColors } from 'src/app/core/type/bg-color';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  @Input() colors: BgColors[];
  @Input() colorBoolean: boolean;
  @Output() changeBgColor = new EventEmitter();
  @Output() bgColorState = new EventEmitter();
}
