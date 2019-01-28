import {SingleData} from './SingleData';
export class Interval extends SingleData{
    from : Date;
    to:    Date;
    constructor(customClass = "",label="",from:Date,to:Date){
        super(customClass,label);
        this.from = from;
        this.to = to;
    }
}