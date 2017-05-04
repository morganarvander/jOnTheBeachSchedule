import { ContactPage } from '../contact/contact.component';
import { Subscribable } from 'rxjs/Observable';
import { ArrayObservable } from 'rxjs/observable/ArrayObservable';
import { Observable, Subscription } from 'rxjs/Rx';
import { FirebaseAuthState } from 'angularfire2/auth';
import { LoginComponent } from '../login/login.component';
import { SpeakerDetails } from '../speakerDetails/speakerDetails.component';
import { ViewChild } from '@angular/core';
import { SessionDetails } from '../sessionDetails/sessionDetails';
import { parseTime, parseTimeInterval } from '../../utils';
import { ISession, ISpeaker, IUserData } from '../../models';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Content, Loading, LoadingController, NavController, ToastController } from 'ionic-angular';
import { AngularFire } from "angularfire2";
import { from } from 'linq';
import { AppInsightsService, SeverityLevel } from "ng2-appinsights";

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage implements OnDestroy, OnInit {

  private sessions: {
    date: string,
    sessions: {
      time: string,
      sessions: ISession[]
    }[]
  }[];

  private currentSessions: {
    time: string,
    sessions: ISession[]
  }[];

  @ViewChild(Content)
  private content: Content;

  private _sessionDay = "18th";
  private _showAll: boolean = true;
  private speakers: ISpeaker[] = [];
  private allSessions: ISession[];
  private userData: IUserData;
  private loading: Loading;

  private afSubscriptions: Subscription[] = [];

  constructor(
    public navCtrl: NavController,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private appinsightsService: AppInsightsService,
    private af: AngularFire) {

  }

  ngOnInit(): void {
    try {
      this.loading = this.loadingController.create({
        content: 'Loading sessions...'
      });
      this.loading.present();
      this.afSubscriptions.push(this.af.auth.subscribe((state) => {
        if (state == null) { return;}
        this.userData = { uid: state.uid, favoriteSessions: []};
        this.logToAppInsights("HomeController.init", { uid: state.uid });
        this.startDataSubscriptions();
      }));
    } catch (err) {
      this.handleError(err);
    }
  }

  ngOnDestroy(): void {
    this.afSubscriptions.forEach(subscription => {
      subscription.unsubscribe();
    });
  }

  private logToAppInsights(title: string, data: any) {
    this.appinsightsService.trackEvent( title, data );
    this.appinsightsService.flush();
  }

  private startDataSubscriptions() {
    this.afSubscriptions.push(this.fetchUserData());
    this.afSubscriptions.push(this.fetchSessions());
    this.afSubscriptions.push(this.fetchSpeakers());
  }

  /* PROPERTY sessionDay */
  set sessionDay(value: string) {
    this._sessionDay = value;
    this.filterSessionsByDay();
    this.content.scrollToTop();
  }

  get sessionDay(): string {
    return this._sessionDay;
  }

  /* PROPERTY showAll */
  get showAll(): boolean {
    return this._showAll;
  }
  set showAll(value: boolean) {
    //filter the sessions and rebuild the session grouping
    this._showAll = value;
    this.sessions = this.buildSessions(this.showAll ? this.allSessions : this.allSessions.filter(a => a.favorite));
    this.filterSessionsByDay();
  }

  private handleError(error: any) {
    this.appinsightsService.trackException(
      new Error(error),
      'handleError',
      SeverityLevel.Error
    );

    this.toastController.create({
      message: 'Error occured ' + error,
      duration: 1500
    }).present();
  }

  /* Parses a datestring like 08:00-09:00 into two separate Date objects */
  private extractTimeParts(sessions: ISession[]) {
    sessions.forEach((session) => {
      var timeParts = session.time.split("-");
      session.startTime = parseTime(timeParts[0]);
      session.endTime = parseTime(timeParts[1]);
    });
  }

  /* Filters the session by day in order to present one day at a time */
  private filterSessionsByDay() {
    this.currentSessions = this.sessions.filter(a => a.date === this._sessionDay)[0].sessions;
  }

  /* Groups all sessions into a structure based on DAY->TIMEINTERVAL->SESSIONS */
  private buildSessions(sessions: ISession[]) {
    var daySessions = from(sessions).groupBy(a => a.date, (session) => session, (key, group) => {
      return {
        date: key,
        sessions: group.groupBy(a => a.time, a => a, (key, group) => {
          return {
            time: key,
            sessions: group.orderBy(a => a.startTime).toArray()
          }
        }).orderBy(a => parseTimeInterval(a.time)).toArray()
      }
    });
    return daySessions.toArray();
  }

  /* Retrives all speakers from server */
  private fetchSpeakers(): Subscription {
    return this.af.database.list("speakers").subscribe((speakers) => {
      for (let speaker of speakers) {
        this.speakers[speaker.speakerId] = speaker;
      }
    });
  }

  /* Retrives all sessions from server */
  private fetchSessions(): Subscription {
    return this.af.database.list("sessions").subscribe((sessions: ISession[]) => {
      this.extractTimeParts(sessions);
      this.allSessions = sessions;
      this.sessions = this.buildSessions(sessions);
      this.sessionDay = this._sessionDay;
      this.setupFavorites();
      this.loading.dismiss();
    });
  }

  /* Retrives the userdata (i.e favorite sessions), for the current user */
  private fetchUserData(): Subscription {
    return this.af.database.object('users/' + this.userData.uid).subscribe((userData) => {
      if (userData.$exists()) {
        this.userData = userData;
        this.setupFavorites();
      }
    }, this.handleError);
  }

  /* Sets the favorite flag according to the users choice */
  private setupFavorites() {
    if (!this.userData || !this.allSessions) {
      return;
    }
    this.allSessions
      .filter(a => this.userData.favoriteSessions.some(f => f == a.sessionId))
      .forEach(session => session.favorite = true);
  }

  /* Marks a session as a favorite and updates the server accordingly */
  public markAsFavorite(session: ISession) {
    session.favorite = !session.favorite;
    this.userData.favoriteSessions = this.allSessions.filter(a => a.favorite).map(a => a.sessionId);
    this.af.database.object('users/' + this.userData.uid).set(this.userData);
  }

  public openSessionDetails(session: ISession) {
    this.navCtrl.push(SessionDetails, {
      session: session,
      speaker: this.speakers[session.speakerId],
      parent: this
    })
  }

  public openSpeakerDetails(speaker: ISpeaker) {
    this.navCtrl.push(SpeakerDetails, { speaker: speaker })
  }

  public signout() {
    this.navCtrl.setRoot(LoginComponent, { signout: true });
  }

  openSchedule(){
    this.navCtrl.setRoot(HomePage);
  }

  openContact(){
    this.navCtrl.push(ContactPage);
  }
}
