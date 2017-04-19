import { HomePage } from '../home/home';
import { SpeakerDetails } from '../speakerDetails/speakerDetails.component';
import { ISession, ISpeaker, IUserData } from '../../models';
import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

@Component({
  selector: 'session-details',
  templateUrl: 'sessionDetails.html'
})
export class SessionDetails {

  private session : ISession;
  private speaker : ISpeaker;
  private homePage: HomePage;

  constructor(public navCtrl: NavController, public navParams: NavParams) {
    this.session = navParams.get('session');
    this.speaker = navParams.get('speaker');
    this.homePage = navParams.get('parent');
  }

  public openSpeakerDetails(speaker:ISpeaker){
    this.navCtrl.push(SpeakerDetails,{speaker:speaker})    
  }

  public markAsFavorite(session: ISession) {
    this.homePage.markAsFavorite(session);
  }

}
