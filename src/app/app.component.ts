import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  datas: number[];
  option: any;
  constructor(){
    this.datas = [];
    this.option = "";
  }
}
