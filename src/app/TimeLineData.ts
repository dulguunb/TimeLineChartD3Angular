import {SingleData} from './SingleData';
export class TimeLineData{
    label : String;
    data  : SingleData[];
    constructor(label:String,data:SingleData[]){
        this.label = label;
        this.data = data;
    }
}