import { IUserData } from '../models';
import { FbObservable } from '../fbObservable';
import { webClientId } from '../app/firebaseConfig';
import { Inject } from '@angular/core';
import { FirebaseApp } from 'angularfire2/tokens';
import { Platform } from 'ionic-angular';
import { Observable } from 'rxjs/Rx';
import { Injectable, EventEmitter } from '@angular/core';
import { AngularFireAuth, FirebaseAuthState, AngularFire } from 'angularfire2';
import { GooglePlus } from '@ionic-native/google-plus';
import { Facebook } from '@ionic-native/facebook';
import { Storage } from '@ionic/storage';
import firebase from 'firebase'; //needed for the GoogleAuthProvider

@Injectable()
export class AuthService {
  userProfile: any;
  private googlePlus:GooglePlus = new GooglePlus();
  private facebook: Facebook = new Facebook();

  public onSignOut = new EventEmitter<any>();

  public currentUserInfo: { email: string, photoUrl: string, displayName: string, provider: string, uid:string, anonymous : boolean };

  constructor(
    private storage: Storage,
    private platform: Platform) {
  }

  trySilentLogin(): Observable<IUserData> {    
    return Observable
      .fromPromise(this.storage.get('loginProvider'))
      .switchMap((loginProvider) => {
        if (loginProvider === 'google') {
          return this.trySilentGoogleLogin();
        }
        else if (loginProvider === 'facebook') {
          return this.trySilentFacebookLogin();
        }
        else {          
          return Observable.of({
            favoriteSessions :[],
            uid : "-1",
            anonymous : true,
          } as IUserData);
         // return FbObservable.fromPromise(firebase.auth().signInAnonymously());
        }
      });
  }

  trySilentGoogleLogin(): Observable<IUserData> {
    return Observable
      .fromPromise(this.googlePlus.login({ 'webClientId': webClientId }))
      .switchMap((userData) => {
        var provider = firebase.auth.GoogleAuthProvider.credential(userData.idToken);
        return this.performCredentialLogin(provider, 'google');
      });
  }

  trySilentFacebookLogin(): Observable<IUserData> {
    return Observable.fromPromise(this.facebook.getLoginStatus())
      .switchMap(currentLoginResponse => {
        if (currentLoginResponse.authResponse && currentLoginResponse.authResponse.accessToken) {
          let facebookCredential = firebase.auth.FacebookAuthProvider
            .credential(currentLoginResponse.authResponse.accessToken);
          return this.performCredentialLogin(facebookCredential, 'facebook');
        }
        else {
          Observable.throw("Silent FB login failed")
        }
      });
  }

  performCredentialLogin(credentials, provider: string): Observable<IUserData> {    
    return FbObservable.fromPromise(firebase.auth().signInWithCredential(credentials)).do(userInfo => {
      this.currentUserInfo = userInfo;
      this.currentUserInfo.provider = provider;
    });
  }

  signInWithFacebook(): Observable<any> {
    return Observable
      .fromPromise(this.facebook.getLoginStatus())
      .switchMap(currentLoginResponse => {
        if (currentLoginResponse.authResponse && currentLoginResponse.authResponse.accessToken) {
          let facebookCredential = firebase.auth.FacebookAuthProvider
            .credential(currentLoginResponse.authResponse.accessToken);
          return this.performCredentialLogin(facebookCredential, 'facebook');
        }
        else {
          return Observable
            .fromPromise(this.facebook.login([]))
            .switchMap(response => {
              this.storage.set('loginProvider', 'facebook');
              const facebookCredential = firebase.auth.FacebookAuthProvider
                .credential(response.authResponse.accessToken);
              return this.performCredentialLogin(facebookCredential, 'facebook');
            })
        }
      });
  }

  signInWithGoogle(): Observable<any> {
    if (this.platform.is('core')) {
      return FbObservable.fromPromise(firebase.auth().signInWithPopup(new firebase.auth.GoogleAuthProvider()));
    }
    return Observable
      .fromPromise(this.googlePlus.login({ 'webClientId': webClientId }))
      .switchMap((userData) => {
        this.storage.set('loginProvider', 'google');
        var provider = firebase.auth.GoogleAuthProvider.credential(userData.idToken);
        return this.performCredentialLogin(provider, 'google');
      });
  }

  signOut(): Observable<any> {
    if (this.currentUserInfo.provider==='google'){      
      return Observable.from(this.googlePlus.logout()).do(()=>this.clearInfo());
    }
    else if (this.currentUserInfo.provider==='facebook'){
      return Observable.from(this.facebook.logout()).do(()=>this.clearInfo());
    }
    else{
      return Observable.of(null);
    }
  }

  private clearInfo(){
    this.storage.remove('loginProvider');
    this.currentUserInfo = null;
    this.onSignOut.emit();
  }

}