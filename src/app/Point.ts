import {SingleData} from './SingleData';
export class Point extends SingleData {
    at: Date
    constructor(customClass="",label="",at:Date){
        super(customClass,label);
        this.at = at;
    }
}