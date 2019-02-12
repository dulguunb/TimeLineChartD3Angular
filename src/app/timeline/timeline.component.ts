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
  @Input()
  public verticalData: VerticalLine[];

  private d3: D3;
  private element: any;
  private el: ElementRef;
  private now: any;
  private static self;
  private x: any;
  private xAxis: any;
  private svg: any;
  private i = 0;
  private height: any;
  private width: any;
  private groupWidth: any;
  private new_scale: any;
  public customStatusColor: any;
  public customColors: any;
  private statuses: any;
  private verticalLines: any;
  private groupLabels: any;

  constructor(private d3Service: D3Service, el: ElementRef) {
    this.el = el;
  }
  ngOnChanges() {
    this.d3 = this.d3Service.getD3();
    console.log(this.data);
    let allElements = this.data.reduce(
      (agg, e) =>
        agg.concat(e.data), []
    );
    this.element = this.el.nativeElement.children[0].firstChild;
    // filtering array with the object that contains .data property 
    // allElements[]:SingleData. contains list of SingleData
    let minDt = this.d3.min(allElements, this.getPointMinDt);
    // maxDt is the same as the previous comment
    let maxDt = this.d3.max(allElements, this.getPointMaxDt);
    let elementWidth  = this.options.width  || this.element.clientWidth;
    let elementHeight = this.options.height || this.element.clientHeight;
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

    this.xAxis = this.d3.axisBottom(this.x)
      .scale(this.x)
      .tickSize(-height);

    let zoom = this.d3.zoom()
      .on('zoom', this.zoomed);

    this.svg = this.svg = this.d3.select("#mySvg")
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

    this.svg.append('rect')
      .attr('class', 'chart-bounds')
      .attr('x', groupWidth)
      .attr('y', 0)
      .attr('height', height)
      .attr('width', width - groupWidth)

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
      // if (this.d3.tip) {
      //   let tip = this.d3.tip().attr('class', 'd3-tip').html(this.options.tip);
      //   this.svg.call(tip);
      //   dots.on('mouseover', tip.show).on('mouseout', tip.hide)
      // } else {
      //   console.error('Please make sure you have d3.tip included as dependency (https://github.com/Caged/d3-tip)');
      // }
    }
    this.zoomed();

    if (this.options.enableLiveTimer) {
     //   setInterval(updateNowMarker, options.timerTickInterval);
    }

  }
  zoomed = () => {
    /*
    this.x() scalling function is only created at the constructor and no use at the
    zoomed() function when we define the zooming functionality.
    Thus we need to create a new_scale function that will keep track of the zooming
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    *(To Verify the comment above: you can replace all of the occurances of new_scale function
    with this.x() function and console.log(this.svg.select('.x.axis')) what you will see is that non-changed 
    values of width and height int the rect element) *  
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    */
    this.new_scale = this.d3.event.transform.rescaleX(this.x);
    // scaling x Axis items - which are the span of dates
    this.svg.select('.x.axis')
      .call(this.xAxis
        .scale(this.new_scale));
    //scaling intervals
    if (this.groupLabels) {
      this.groupLabels
        .attr('x1', d => { return this.new_scale(d.at) })
        .attr('x2', d => { return this.new_scale(d.at) });
    }
    // this scaling increases and decreases the WIDTH of the WP's with
    // relation of the .x-axis option.intervalMInWidth contains the number that can 
    // scale if you zoom a lot then the invterval will dissappear
    this.svg.selectAll('rect.interval')
      .attr('x', d => this.new_scale(d.from))
      .attr('width', d => Math.max(this.options.intervalMinWidth, this.new_scale(d.to) - this.new_scale(d.from)));
    // scaling dots
    this.svg.selectAll('circle.dot')
      .attr('cx', d => this.new_scale(d.at));
    /* scaling the texts that correpond to the interval (which are the WP's)
       the zooming and scaling functionality have to hold <text> element
       in relative terms with the intervals thus it has to also scale and/or zoom the texts
    */
    this.svg.selectAll('.interval-text')
      .attr('x', (d, i, n) => {
        // n[i] is refering to the DOM element
        // this in D3 refers to the DOM element but in Angular it refers to the Object itself    
        let positionData = this.getTextPositionData.call(this, d, n[i]);
        // keyword "this" is refering to the object. d is the datum. n[i] is the element
        if ((positionData.upToPosition - this.groupWidth - 10) < positionData.textWidth) {
          return positionData.upToPosition;
        } else if (positionData.xPosition < this.groupWidth && positionData.upToPosition > this.groupWidth) {
          return this.groupWidth;
        }
        return positionData.xPosition;
      }).attr('text-anchor', (d, i, n) => {
        let positionData = this.getTextPositionData.call(this, d, n[i]);
        /* keyword 'this' is refering to the object. d is the datum. 
           n[i] is the element 
        */
        if ((positionData.upToPosition - this.groupWidth - 10) < positionData.textWidth) {
          return 'end';
        }
        return 'start';
      }).attr('dx', (d, i, n) => {
        let positionData = this.getTextPositionData.call(this, d, n[i]);
        if ((positionData.upToPosition - this.groupWidth - 10) < positionData.textWidth) {
          return '-0.5em';
        }
        return '0.5em';
      });

  }
  getTextPositionData(d, element) {
    element.textSizeInPx = element.textSizeInPx || element.getComputedTextLength();
    var from = this.new_scale(d.from);
    var to = this.new_scale(d.to);
    return {
      xPosition: from,
      upToPosition: to,
      width: to - from,
      textWidth: element.textSizeInPx
    }
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
