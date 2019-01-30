import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { TimelineComponent } from './timeline/timeline.component';
import { D3Service } from 'd3-ng2-service';
@NgModule({
  declarations: [
    AppComponent,
    TimelineComponent
  ],
  imports: [
    BrowserModule
  ],
  exports:[
    TimelineComponent
  ],
  providers: [D3Service],
  bootstrap: [AppComponent]
})
export class AppModule { }
