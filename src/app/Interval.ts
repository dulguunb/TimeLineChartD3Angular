import {SingleData} from './SingleData';
export class Interval extends SingleData{
    from : Date;
    to:    Date;
    constructor(customClass = "",label=""){
        super(customClass,label);
    }
}