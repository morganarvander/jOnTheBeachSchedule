import { webClientId } from '../app/firebaseConfig';
import { LoginComponent } from '../pages/login/login.component';
import { Inject } from '@angular/core';
import { FirebaseApp } from 'angularfire2/tokens';
import { NavController, Platform } from 'ionic-angular';
import { Observable, Subject } from 'rxjs/Rx';
import { Injectable } from '@angular/core';
import { AngularFireAuth, FirebaseAuthState, AngularFire } from 'angularfire2';
import { GooglePlus } from '@ionic-native/google-plus';
import { Facebook } from '@ionic-native/facebook';
import { Storage } from '@ionic/storage';
import firebase from 'firebase'; //needed for the GoogleAuthProvider

@Injectable()
export class AuthService {
  userProfile: any;
  private authState: FirebaseAuthState;

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
          return Observable.throw("no login provider");
        }
      });
  }

  trySilentGoogleLogin(): Observable<any> {
    return Observable
      .fromPromise(new GooglePlus().login({ 'webClientId': webClientId }))
      .switchMap((userData) => {
        var provider = firebase.auth.GoogleAuthProvider.credential(userData.idToken);
        return this.performCredentialLogin(provider);
      });
  }

  trySilentFacebookLogin(): Observable<any> {
    var subject = new Subject();
    var facebook = new Facebook();
    facebook.getLoginStatus().then(currentLoginResponse => {
      if (currentLoginResponse.authResponse && currentLoginResponse.authResponse.accessToken) {
        let facebookCredential = firebase.auth.FacebookAuthProvider
          .credential(currentLoginResponse.authResponse.accessToken);
        this.performCredentialLogin(facebookCredential).subscribe((a) => subject.next(a), e => subject.error(e));
      }
    });
    return subject;
  }

  performCredentialLogin(credentials): Observable<any> {
    var subject = new Subject();
    firebase.auth().signInWithCredential(credentials) // Not a real promise, custom firebase promise
      .then((success) => {
        this.userProfile = success;
        subject.next(this.userProfile);
      })
      .catch((error) => {
        console.log("Firebase login failure: " + JSON.stringify(error));
        subject.error(error);
      });
    return subject;
  }

  signInWithFacebook(): Observable<any> {
    var facebook = new Facebook();
    return Observable
      .fromPromise(facebook.getLoginStatus())
      .switchMap(currentLoginResponse => {
        if (currentLoginResponse.authResponse && currentLoginResponse.authResponse.accessToken) {
          let facebookCredential = firebase.auth.FacebookAuthProvider
            .credential(currentLoginResponse.authResponse.accessToken);
          return this.performCredentialLogin(facebookCredential);
        }
        else {
          return Observable
            .fromPromise(facebook.login([]))
            .switchMap(response => {
              this.storage.set('loginProvider', 'facebook');
              const facebookCredential = firebase.auth.FacebookAuthProvider
                .credential(response.authResponse.accessToken);
              return this.performCredentialLogin(facebookCredential);
            })
        }
      });
  }

  signInWithGoogle(): Observable<any> {

    return Observable
      .fromPromise(new GooglePlus().login({ 'webClientId': webClientId }))
      .switchMap((userData) => {
        this.storage.set('loginProvider', 'google');
        var provider = firebase.auth.GoogleAuthProvider.credential(userData.idToken);
        return this.performCredentialLogin(provider);
      });
  }

  signOut(): void {
    this.auth$.logout();
    new GooglePlus().logout();
    new Facebook().logout();
  }

}