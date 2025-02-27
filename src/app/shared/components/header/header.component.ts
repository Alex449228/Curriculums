import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {

  @Input() title!: string;
  @Input() isInMenu = false;
  @Input() isInModal = false;
  @Input() showBackButton = false; 
  @Output() backAction = new EventEmitter<void>(); 

  isMenuOpen = false;

  constructor() {}

  ngOnInit() {}

  closeModal() {
    this.backAction.emit();
  }

  goBack() {
    this.backAction.emit();
  }
}
