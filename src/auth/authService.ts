import { FbObservable } from '../fbObservable';
import { webClientId } from '../app/firebaseConfig';
import { LoginComponent } from '../pages/login/login.component';
import { Inject } from '@angular/core';
import { FirebaseApp } from 'angularfire2/tokens';
import { NavController, Platform } from 'ionic-angular';
import { Observable, Subject } from 'rxjs/Rx';
import { Injectable, EventEmitter } from '@angular/core';
import { AngularFireAuth, FirebaseAuthState, AngularFire } from 'angularfire2';
import { GooglePlus } from '@ionic-native/google-plus';
import { Facebook } from '@ionic-native/facebook';
import { Storage } from '@ionic/storage';
import firebase from 'firebase'; //needed for the GoogleAuthProvider

@Injectable()
export class AuthService {
  userProfile: any;
  private authState: FirebaseAuthState;
  private googlePlus:GooglePlus = new GooglePlus();
  private facebook: Facebook = new Facebook();

  public onSignOut = new EventEmitter<any>();

  public currentUserInfo: { email: string, photoUrl: string, displayName: string, provider: string, uid:string };

  constructor(
    public auth$: AngularFireAuth,
    private af: AngularFire,
    private storage: Storage,
    @Inject(FirebaseApp) private firebase: any,
    private platform: Platform) {
    auth$.subscribe((state: FirebaseAuthState) => {
      this.authState = state;
    });
  }

  trySilentLogin(): Observable<any> {    
    var result = new Subject();
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
          return FbObservable.fromPromise(firebase.auth().signInAnonymously());
        }
      });
  }

  trySilentGoogleLogin(): Observable<any> {
    return Observable
      .fromPromise(this.googlePlus.login({ 'webClientId': webClientId }))
      .switchMap((userData) => {
        console.log("Made google plus login with " + userData.idToken);
        var provider = firebase.auth.GoogleAuthProvider.credential(userData.idToken);
        return this.performCredentialLogin(provider, 'google');
      });
  }

  trySilentFacebookLogin(): Observable<any> {
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

  performCredentialLogin(credentials, provider: string): Observable<any> {    
    return FbObservable.fromPromise(firebase.auth().signInWithCredential(credentials)).do(userInfo => {
      console.log("Performed credential login", userInfo);
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