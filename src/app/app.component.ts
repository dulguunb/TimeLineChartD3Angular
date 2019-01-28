import { Component } from '@angular/core';
import {TimeLineData} from './TimeLineData';
import { SingleData } from './SingleData';
import { Interval } from './Interval';
import {Point} from './Point';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  datas: TimeLineData[];
  option: any;
  constructor(){
    let data:SingleData[];
      data = [
      new Interval("",'Label 1',new Date(2016, 5, 15),new Date(2016, 7, 1)),
      new Interval("",'Label 2',new Date(2016, 8, 1),new Date(2016, 9, 12))];
    
      this.datas = [
        new TimeLineData("group1",data)
      ];
    this.option = "";
  }
}
