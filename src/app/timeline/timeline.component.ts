import { Component, OnInit,Input } from '@angular/core';
import * as d3 from 'd3';
import {TimeLineData} from '../TimeLineData';
@Component({
  selector: 'app-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.css']
})
export class TimelineComponent implements OnInit {
  @Input()
  public data : TimeLineData[];
  @Input()
  public option : any;
  private element : any;
  constructor() {
    this.element = d3.select("#mySvg");
    let allElements = this.data.reduce((agg, e) => agg.concat(e.data), []);
    console.log(allElements);
  }
  ngOnInit() {
  }

}
