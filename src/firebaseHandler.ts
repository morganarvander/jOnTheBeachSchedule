import { Injectable } from '@angular/core';
import { FbObservable } from './fbObservable';
import { keyValuesToObject, parseTime } from './utils';
import { Observable, Subscription } from 'rxjs/Rx';
import { Logger } from './logger';
import { EventEmitter } from '@angular/core';
import { ISession, ISpeaker, IUserData, ISettings } from './models';
import { AuthService } from './auth/authService';
import { AngularFire } from "angularfire2";
import firebase from 'firebase';

@Injectable()
export class FirebaseHandler {

    private sessions: ISession[];
    private speakers: ISpeaker[];

    public settings: ISettings = { canComment: false, canRate: false };

    public onUserAuth = new EventEmitter<IUserData>();
    public onUserDeAuth = new EventEmitter<IUserData>();
    public onSessions = new EventEmitter<ISession[]>();
    public onSpeakers = new EventEmitter<ISpeaker[]>();

    constructor(
        private authService: AuthService,
        private logger: Logger,
        private af: AngularFire) {
        this.setupSubscriptions();
    }

    public get isInitialized(): boolean {
        return this.sessions && this.sessions.length > 0;
    }
    public fireAway() {
        if (this.sessions) {
            this.onSessions.emit(this.sessions);
        }
        if (this.speakers) {
            this.onSpeakers.emit(this.speakers);
        }
    }

    private setupSubscriptions() {
        this.subscribeToSettings();
        this.startAuthSubscription();
      //  this.subscribeToSessions();
        this.subscribeToSessionsV2();
        this.subscribeToSpeakers();
        this.subscribeToRatings();
        this.authService.onSignOut.subscribe(() => this.onUserDeAuth.emit({ uid: '', favoriteSessions: [], anonymous: true }));
    }

    private startAuthSubscription() {
        this.af.auth.subscribe((state) => {
            if (state == null) { return; }
            this.onUserAuth.emit({ uid: state.uid, favoriteSessions: [], anonymous: state.uid && state.uid.length > 3 });
            this.getUserData(state.uid).subscribe(data =>
                this.onUserAuth.emit(data)
            );
            this.logger.log("FireBase.auth", { uid: state.uid });
        });
    }

    /* Retrives all sessions from server */
    private subscribeToSessions(): Subscription {
        return this.af.database.list("sessions_v2").subscribe((sessions: ISession[]) => {
            //Pre-process sessions
            //this.extractTimeParts(sessions);
            this.sessions = sessions;
            if (sessions) {
                this.onSessions.emit(sessions);
            }
        });
    }

    
    /* Parses a datestring like 08:00-09:00 into two separate Date objects */
    private extractTimeParts(sessions: ISession[]) {
        sessions.forEach((session) => {
            var timeParts = session.time.split("-");
            session.startTime = parseTime(timeParts[0]);
            session.endTime = parseTime(timeParts[1]);
        });
    }

    /* Retrives all sessions from server */
    private subscribeToSessionsV2(): Subscription {
        return this.af.database.list("sessions_v2").subscribe((fbSessions) => {
            this.logger.log("got v2 sessions", fbSessions);

            //Pre-process sessions
            /*
            this.extractTimeParts(sessions);
            */
            this.sessions = [];
            fbSessions.forEach(sessions=>{
                this.sessions = [...this.sessions,...sessions];
                this.extractTimeParts(sessions);
            });      
            if (this.sessions) {
                this.onSessions.emit(this.sessions);
            }
            
        });
    }

    public subscribeOnUserAuth(callback) {
        this.onUserAuth.subscribe(callback,error=>console.log(error));
        if (this.authService.currentUserInfo) {
            this.getUserData(this.authService.currentUserInfo.uid).subscribe(data =>
                this.onUserAuth.emit(data)
            );
        }
    }

    /* Retrives the userdata (i.e favorite sessions), for the current user */
    public getUserData(uid): Observable<IUserData> {
        return FbObservable.fromPromise(firebase.database().ref("users/" + uid).once('value')).map(a => a.val());
    }

    private extractSmallImageUrl(speaker : ISpeaker){
        if (speaker.imageUrl && speaker.imageUrl.lastIndexOf("/")>0){
            speaker.smallImageUrl = speaker.imageUrl.substring(speaker.imageUrl.lastIndexOf("/"));
        }
    }

    /* Retrives all speakers from server */
    private subscribeToSpeakers(): Subscription {
        return this.af.database.list("speakers").subscribe((speakers : ISpeaker[]) => {
            var loadedSpeakers = [];
            for (let speaker of speakers) {
                loadedSpeakers[speaker.speakerId] = speaker;
                this.extractSmallImageUrl(speaker);
            }            
            this.onSpeakers.emit(loadedSpeakers);
            this.speakers = loadedSpeakers;
        });
    }

    private subscribeToSettings() {
        this.af.database.list("settings").subscribe((settings: any[]) => {
            this.settings = keyValuesToObject(settings);
        });
    }

    private subscribeToRatings() {
        this.af.database.list("ratings").subscribe((ratings: any[]) => {
            ratings.forEach(a => {
                let sessionId = a.$key;
                let session = this.sessions.find(a => a.sessionId === sessionId);
                if (session) {
                    let totalRating = 0;
                    let ratingCount = 0;
                    for (var prop in a) {
                        if (a.hasOwnProperty(prop)) {
                            totalRating += a[prop];
                            ratingCount++;
                        }
                    }
                    session.averageRating = totalRating / ratingCount;
                }
            });
        });
    }

    /* Marks a session as a favorite and updates the server accordingly */
    public markAsFavorite(userData: IUserData) {
        var starCountRef = firebase.database().ref('users/' + this.authService.currentUserInfo.uid);
        starCountRef.child("/favoriteSessions").set(userData.favoriteSessions).then(a => { }, b => { });
    }

    public addComment(comment: string, session: ISession) {
        var commentData = {
            comment: comment,
            userInfo : {
                uid: this.authService.currentUserInfo.uid,
                email : this.authService.currentUserInfo.email,
                photoUrl : this.authService.currentUserInfo.photoUrl,
                displayName : this.authService.currentUserInfo.displayName
            }
        }
        firebase.database().ref("comments/" + session.sessionId).push(commentData).then((a) => {
            this.logger.log("commentAdded", commentData);
        })
    }

    public getComments(sessionId: string): Observable<any[]> {
        return FbObservable.fromPromise(firebase.database().ref("comments/" + sessionId).once('value')).map(a=>a.val());
    }

    public getRatings(sessionId: string): Observable<{ uid: string, rating: number }[]> {
        return this.af.database.list("ratings/" + sessionId).
            map((ratings: { $key: string, $value: number }[]) => {
                return ratings.map(rating => { return { uid: rating.$key, rating: rating.$value } })
            }).
            take(1);
    }
    public rateSession(session: ISession, rating: number, uid: string) {
        firebase.database().ref("ratings/" + session.sessionId).child(uid).set(rating).then((a) => {
            this.logger.log("session rated", {
                session: session.sessionId,
                rating: rating
            });
        });
    }

}