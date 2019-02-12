import { Component, OnInit, Input, ElementRef, OnChanges } from '@angular/core';
import { D3Service, D3, Selection } from 'd3-ng2-service';
import { TimeLineData } from '../TimeLineData';
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
export class TimelineComponent implements OnChanges {
  @Input()
  public data: TimeLineData[];
  @Input()
  public options: Option;
  private svg: any;
  private d3;
  private el;
  private x:any;
  private xAxis:any;
  private now: any;
  constructor(d3Service: D3Service, el: ElementRef) {
    this.d3 = d3Service.getD3();
    this.el = el;
  }
  ngOnChanges() {
    console.log(this.data);
    let allElements = this.data.reduce(
      (agg, e) =>
        agg.concat(e.data), []
    );
    let element = this.el.nativeElement.children[0].children[0];
    // filtering array with the object that contains .data property 
    // allElements[]:SingleData. contains list of SingleData
    let minDt = this.d3.min(allElements, this.getPointMinDt);
    // maxDt is the same as the previous comment
    let maxDt = this.d3.max(allElements, this.getPointMaxDt);
    let elementWidth  = this.options.width  || element.clientWidth;
    let elementHeight = this.options.height || element.clientHeight;
    let margin = {
      top: 0,
      right: 0,
      bottom: 20,
      left: 0
    };

    let width  = elementWidth  - margin.left - margin.right;
    let height = elementHeight - margin.top  - margin.bottom;
    console.log(width , "  " , height);
    let groupWidth = (this.options.hideGroupLabels) ? 0 : 200;
    console.log(groupWidth);
    this.x = this.d3.scaleTime()
      .domain([minDt, maxDt])
      .range([groupWidth, width]);

    this.xAxis = this.d3.axisBottom()
      .scale(this.x)
      .tickSize(-height);

    let zoom = this.d3.zoom()
      .on('zoom', this.zoomed);

    this.svg = this.d3.select(element).append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
      .call(zoom);

    this.svg.append('defs')
      .append('clipPath')
      .attr('id', 'chart-content')
      .append('rect')
      .attr('x', groupWidth)
      .attr('y', 0)
      .attr('height', height)
      .attr('width', width - groupWidth)

    // this.svg.append('rect')
    //   .attr('class', 'chart-bounds')
    //   .attr('x', groupWidth)
    //   .attr('y', 0)
    //   .attr('height', height)
    //   .attr('width', width - groupWidth)

    this.svg.append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(0,' + height + ')')
      .call(this.xAxis);

    if (this.options.enableLiveTimer) {
      this.now = this.svg.append('line')
        .attr('clip-path', 'url(#chart-content)')
        .attr('class', 'vertical-marker now')
        .attr("y1", 0)
        .attr("y2", height);
    }

    let groupHeight = height / this.data.length;
    let groupSection = this.svg.selectAll('.group-section')
      .data(this.data)
      .enter()
      .append('line')
      .attr('class', 'group-section')
      .attr('x1', 0)
      .attr('x2', width)
      .attr('y1', (d, i) => {
        return groupHeight * (i + 1);
      })
      .attr('y2', (d, i) => {
        return groupHeight * (i + 1);
      });

    if (!this.options.hideGroupLabels) {
      let groupLabels = this.svg.selectAll('.group-label')
        .data(this.data)
        .enter()
        .append('text')
        .attr('class', 'group-label')
        .attr('x', 0)
        .attr('y', (d, i) => {
          return (groupHeight * i) + (groupHeight / 2) + 5.5;
        })
        .attr('dx', '0.5em')
        .text(d => d.label);

      let lineSection = this.svg.append('line')
          .attr('x1', groupWidth)
          .attr('x2', groupWidth)
          .attr('y1', 0)
          .attr('y2', height)
          .attr('stroke', 'red');
    }

    let groupIntervalItems = this.svg.selectAll('.group-interval-item')
      .data(this.data)
      .enter()
      .append('g')
      .attr('clip-path', 'url(#chart-content)')
      .attr('class', 'item')
      .attr('transform', (d, i) => `translate(0, ${groupHeight * i})`)
      .selectAll('.dot')
      .data(d => d.data.filter(_ => _ instanceof Interval))
      .enter();

    let intervalBarHeight = 0.8 * groupHeight;
    let intervalBarMargin = (groupHeight - intervalBarHeight) / 2;

    let intervals = groupIntervalItems
      .append('rect')
      .attr('class', this.withCustom('interval'))
      .attr('width', (d: Interval) => Math.max(this.options.intervalMinWidth, this.x(d.to) - this.x(d.from)))
      .attr('height', intervalBarHeight)
      .attr('y', intervalBarMargin)
      .attr('x', (d: Interval) => this.x(d.from));

    let intervalTexts = groupIntervalItems
      .append('text')
      .text(d => d.label)
      .attr('fill', 'white')
      .attr('class', this.withCustom('interval-text'))
      .attr('y', (groupHeight / 2) + 5)
      .attr('x', (d: Interval) => this.x(d.from));

    let groupDotItems = this.svg.selectAll('.group-dot-item')
      .data(this.data)
      .enter()
      .append('g')
      .attr('clip-path', 'url(#chart-content)')
      .attr('class', 'item')
      .attr('transform', (d, i) => `translate(0, ${groupHeight * i})`)
      .selectAll('.dot')
      .data(d => {
        return d.data.filter( _  => _ instanceof Point);
      })
      .enter();

    let dots = groupDotItems
      .append('circle')
      .attr('class', this.withCustom('dot'))
      .attr('cx', (d:Point) => this.x(d.at))
      .attr('cy', groupHeight / 2)
      .attr('r', 5);

    if (this.options.tip) {
      if (this.d3.tip) {
        let tip = this.d3.tip().attr('class', 'd3-tip').html(this.options.tip);
        this.svg.call(tip);
        dots.on('mouseover', tip.show).on('mouseout', tip.hide)
      } else {
        console.error('Please make sure you have d3.tip included as dependency (https://github.com/Caged/d3-tip)');
      }
    }
    this.zoomed();

    if (this.options.enableLiveTimer) {
     //   setInterval(updateNowMarker, options.timerTickInterval);
    }

  }
  zoomed(): void {

  }
  withCustom(defaultClass) {
    return d => d.customClass ? [d.customClass, defaultClass].join(' ') : defaultClass
  }
  getPointMinDt(p: SingleData) {
    if (p instanceof Point) return p.at;
    if (p instanceof Interval) return p.from;
  }
  getPointMaxDt(p: SingleData) {
    if (p instanceof Point) return p.at;
    if (p instanceof Interval) return p.to;
  }
}
