import { webClientId } from '../app/firebaseConfig';
import { LoginComponent } from '../pages/login/login.component';
import { Inject } from '@angular/core';
import { FirebaseApp } from 'angularfire2/tokens';
import { NavController, Platform } from 'ionic-angular';
import { Observable, Subject } from 'rxjs/Rx';
import { Injectable } from '@angular/core';
import { AuthProviders, AngularFireAuth, FirebaseAuthState, AuthMethods, AngularFire } from 'angularfire2';
import { GooglePlus } from '@ionic-native/google-plus';
import firebase from 'firebase'; //needed for the GoogleAuthProvider

@Injectable()
export class AuthService {
  userProfile: any;
  private authState: FirebaseAuthState;

  constructor(public auth$: AngularFireAuth, private af: AngularFire,
    @Inject(FirebaseApp) private firebase: any, private platform: Platform) {
    auth$.subscribe((state: FirebaseAuthState) => {
      this.authState = state;
    });
  }

  trySilentLogin(): Observable<any> {
    var subject = new Subject();
    var plus = new GooglePlus().login({
      'webClientId': '114393826287-fvcvoj3046i3iggq9am09rottm0pak7c.apps.googleusercontent.com'
    })
      .then((userData) => {
         var provider = firebase.auth.GoogleAuthProvider.credential(userData.idToken);
            firebase.auth().signInWithCredential(provider)
              .then((success) => {
                console.log("Firebase success: " + JSON.stringify(success));
                this.userProfile = success;
                subject.next(this.userProfile);
              })
              .catch((error) => {
                console.log("Firebase failure: " + JSON.stringify(error));
                subject.error(error);
              });
      }).catch((error) => {
        subject.error(error)
      });
    return subject;
  }

  signInWithGoogle(): Observable<any> {
    var subject = new Subject();
    this.af.auth.subscribe((data: FirebaseAuthState) => {
      console.log("in auth subscribe", data)

      this.platform.ready().then(() => {
        var plus = new GooglePlus().login({
          'webClientId': webClientId
        })
          .then((userData) => {
            var provider = firebase.auth.GoogleAuthProvider.credential(userData.idToken);
            firebase.auth().signInWithCredential(provider)
              .then((success) => {
                this.userProfile = success;

              })
              .catch((error) => {
                console.log("Firebase failure: " + JSON.stringify(error));
                subject.error(error);
              });
            subject.next(this.userProfile);
          })
          .catch((gplusErr) => {
            console.log("GooglePlus failure: " + JSON.stringify(gplusErr));
            subject.error(gplusErr);
          });

      })
    })
    return subject;
  }

  signOut(): void {
    this.auth$.logout();
    new GooglePlus().logout();
  }

}