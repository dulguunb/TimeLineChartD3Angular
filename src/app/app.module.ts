import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { TimelineComponent } from './timeline/timeline.component';

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
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
