import { Component, OnInit,Input ,ElementRef} from '@angular/core';
import { D3Service, D3, Selection } from 'd3-ng2-service';
import {TimeLineData} from '../TimeLineData';
import { Option } from '../Option';
import { Point } from '../Point';
import { Interval } from '../Interval';
import { VerticalLine } from '../VerticalLine';
import { SingleData } from '../SingleData';
@Component({
  selector: 'app-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.css']
})
export class TimelineComponent implements OnInit {
  @Input()
  public data : TimeLineData[];
  @Input()
  public options : Option;
  private svg : any;
  private d3;
  private el;
  constructor(d3Service:D3Service,el:ElementRef) {
    this.d3 = d3Service.getD3();
    this.svg = this.d3.select("#mySvg");
    this.el = el;
  }
  ngOnInit() {
    console.log(this.data);
    let allElements = this.data.reduce(
      (agg, e) =>
       agg.concat(e.data), []
    );
    let element = this.el.nativeElement.children[0].children[0];
    let minDt = this.d3.min(allElements, this.getPointMinDt);
    let maxDt = this.d3.max(allElements, this.getPointMaxDt);

    let elementWidth =  this.options.width  || element.clientWidth;
    let elementHeight = this.options.height || element.clientHeight;
  }
  getPointMinDt(p:SingleData){
    if(p instanceof Point) return p.at;
    if(p instanceof Interval) return p.from;
  }
  getPointMaxDt(p: SingleData){
    if(p instanceof Point) return p.at;
    if(p instanceof Interval) return p.to;
  }
}
