import { FirebaseHandler } from '../../firebaseHandler';
import { Logger } from '../../logger';
import { SessionBuilder } from './sessionBuilder';
import { ContactPage } from '../contact/contact.component';
import { LoginComponent } from '../login/login.component';
import { SpeakerDetails } from '../speakerDetails/speakerDetails.component';
import { ViewChild } from '@angular/core';
import { SessionDetails } from '../sessionDetails/sessionDetails';
import { ISession, ISpeaker, ITimeSessions, IDateSessions } from '../../models';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Content, Loading, LoadingController, NavController, ToastController, AlertController } from 'ionic-angular';
import { AngularFire } from "angularfire2";
import { AuthService } from "../../auth/authService";
import { SessionBuilderV2 } from "./sessionBuilder.v2";

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage implements OnDestroy, OnInit {
  sessionSubscription: any;
  speakerSubscription: any;
  sessionBuildSubscription: any;

  @ViewChild(Content)
  private content: Content;

  private _sessionDay = "2017-05-17";
  private _showAll: boolean = true;
  private loading: Loading;
  private sessionBuilder: SessionBuilderV2;

  private currentSessions: ITimeSessions[] = [];
  private allSpeakers: ISpeaker[] = [];

  constructor(
    public navCtrl: NavController,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private authService: AuthService,
    private alertCtrl: AlertController,
    private firebaseHandler: FirebaseHandler,

    private logger: Logger,
    af: AngularFire) {    
    this.sessionBuilder = new SessionBuilderV2((session) => this._sessionDay == session.date || this.showAll || session.favorite, this.firebaseHandler);
  }

  ngOnInit(): void {
    try {
      this.sessionBuildSubscription = this.sessionBuilder.onSessionsBuilt.subscribe((sessions: IDateSessions[]) => {
        if (!sessions || sessions.length === 0) {
          return;
        }
        this.currentSessions = sessions.filter(a => a.date == this._sessionDay)[0].sessions;
        this.logger.log("sessions was built", this.currentSessions);
      });

      this.speakerSubscription = this.firebaseHandler.onSpeakers.subscribe(speakers => {
        if (speakers) {
          this.allSpeakers = speakers;
          this.logger.log("Got speakers", this.allSpeakers);
        }
      });

      if (!this.firebaseHandler.isInitialized) {
        this.loading = this.loadingController.create({
          content: 'Loading sessions...'
        });
        this.loading.present();
      }
      this.sessionSubscription = this.firebaseHandler.onSessions.subscribe(a => {
        if (this.loading) {
          this.loading.dismiss().catch(a =>{ this.logger.log("dismiss failure", a); this.loading = undefined});
        }
        else {
          console.log("loading null");
        }
      });
      this.firebaseHandler.fireAway();
    } catch (err) {
      this.handleError(err);
    }
  }

  ngOnDestroy(): void {
    this.sessionBuildSubscription.unsubscribe();
    this.sessionSubscription.unsubscribe();
    this.speakerSubscription.unsubscribe();
    this.sessionBuildSubscription = undefined
  }

  /* PROPERTY sessionDay */
  set sessionDay(value: string) {
    this._sessionDay = value;
    this.sessionBuilder.buildSessions();
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
    this.sessionBuilder.buildSessions();
  }

  private handleError(error: any) {
    this.logger.logError(error);
    this.toastController.create({
      message: 'Error occured ' + error,
      duration: 1500
    }).present();
  }

  /* Marks a session as a favorite and updates the server accordingly */
  public markAsFavorite(session: ISession) {
    if (!this.authService.currentUserInfo) {
      this.promptForLogin();
    }
    else {
      var userData = this.sessionBuilder.markAsFavorite(session);
      this.firebaseHandler.markAsFavorite(userData);
    }
  }

  promptForLogin() {
    let prompt = this.alertCtrl.create({
      title: 'Login',
      message: "You need to login in order to mark the session as favorites",
      inputs: [],
      buttons: [
        {
          text: 'Cancel',
          handler: data => {
          }
        },
        {
          text: 'Login',
          handler: data => {
            this.navCtrl.setRoot(LoginComponent);
          }
        }
      ]
    });
    prompt.present();
  }

  public openSessionDetails(session: ISession) {
    this.navCtrl.push(SessionDetails, {
      session: session,
      speaker: this.allSpeakers[session.speakerId],
      parent: this
    })
  }

  public openSpeakerDetails(speaker: ISpeaker) {
    this.navCtrl.push(SpeakerDetails, { speaker: speaker })
  }

  openSchedule() {
    this.navCtrl.setRoot(HomePage);
  }

  openContact() {
    this.navCtrl.push(ContactPage);
  }
}
