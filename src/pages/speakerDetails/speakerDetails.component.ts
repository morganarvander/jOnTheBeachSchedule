import { ISpeaker } from '../../models';
import { NavParams } from 'ionic-angular';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-speakerDetails',
  templateUrl: './speakerDetails.component.html'
})
export class SpeakerDetails implements OnInit {

  private speaker : ISpeaker;
  
  constructor(public navParams: NavParams) { 
    this.speaker = navParams.get('speaker');
  }

  ngOnInit() {
  }

}