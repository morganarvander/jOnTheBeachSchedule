import { AuthService } from '../../auth/authService';
import { HomePage } from '../home/home';
import { SpeakerDetails } from '../speakerDetails/speakerDetails.component';
import { ISession, ISpeaker } from '../../models';
import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { FirebaseHandler } from "../../firebaseHandler";

@Component({
  selector: 'session-details',
  templateUrl: 'sessionDetails.html'
})
export class SessionDetails {

  private session : ISession;
  private speaker : ISpeaker;
  private homePage: HomePage;
  private customerRating = 0;
  private commentText : string = "";
  private comments:any[] = [];

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    public fireBaseHandler : FirebaseHandler ,
    private authService : AuthService
  ) {
    this.session = navParams.get('session');
    this.speaker = navParams.get('speaker');
    this.homePage = navParams.get('parent');
    this.fireBaseHandler.getRatings(this.session.sessionId).subscribe(a=>{
      let customerRating = a.find(a=>this.authService.currentUserInfo && a.uid===this.authService.currentUserInfo.uid);
      if (customerRating){
        this.customerRating = customerRating.rating;
      }
    });    
    this.fireBaseHandler.getComments(this.session.sessionId).subscribe(comments=>{
      console.log(comments);
      this.comments = comments;
    });
  }

  public openSpeakerDetails(speaker:ISpeaker){
    if(speaker){
      this.navCtrl.push(SpeakerDetails,{speaker:speaker})    
    }
  }

  public markAsFavorite(session: ISession) {
    this.homePage.markAsFavorite(session);
  }

  public addComment(){    
    this.fireBaseHandler.addComment(this.commentText, this.session);
    this.commentText = "";
  }

  public rate(rating:number){
    if ((!this.authService.currentUserInfo) || this.authService.currentUserInfo.anonymous){
      this.customerRating = 0;
      this.homePage.promptForLogin();
    }
    else{
      this.fireBaseHandler.rateSession(this.session,rating,this.authService.currentUserInfo.uid);
    }
  }

}
