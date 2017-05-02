import { FirebaseSdkAuthBackend } from 'angularfire2/auth';
import { FirebaseApp } from 'angularfire2/tokens';
import { HomePage } from '../home/home';
import { NavController, NavParams, Platform } from 'ionic-angular';
import { AuthService } from '../../auth/authService';
import { Component, OnInit } from '@angular/core';
import { FirebaseAuthState } from "angularfire2";
import { GooglePlus } from '@ionic-native/google-plus';

@Component({
  selector: 'login',
  templateUrl: './login.component.html',
})
export class LoginComponent implements OnInit {

  protected username: string;
  protected password: string;
  protected authenticated: boolean = true;

  constructor(
    private authService: AuthService,
    private nav: NavController,
    private navParams: NavParams,
    private platform: Platform
  ) { }

  ngOnInit() {
    try {
      this.authenticated = true;
      this.platform.ready().then(() => {
        debugger;
        let doSignOut = this.navParams.get("signout");
        if (doSignOut) {
          this.signout();
          this.authenticated = false;          
        }
        else {
          this.authService.trySilentLogin().subscribe((userData) => {
            this.nav.setRoot(HomePage);
          },(error)=>{
            this.authenticated = false;
          })
          
        }
      });
    } catch (err) {
      console.log(err);
    }
  }

  public login() {
    this.authService.signInWithGoogle().subscribe(userInfo => {
      this.authenticated = userInfo != null;
      this.nav.setRoot(HomePage);
    });
  }

  loginWithFacebook(){
    this.authService.signInWithFacebook().subscribe((userInfo)=>{
      
    });
  }

  public signout() {
    this.authService.signOut();
  }

}