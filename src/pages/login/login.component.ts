import { HomePage } from '../home/home';
import { NavController, NavParams, Platform } from 'ionic-angular';
import { AuthService } from '../../auth/authService';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'login',
  templateUrl: './login.component.html',
})
export class LoginComponent implements OnInit{

  constructor(
    private authService: AuthService,
    private nav: NavController,
    private navParams: NavParams,
    private platform: Platform
  ) { }

  ngOnInit() {
    try {      
      this.platform.ready().then(() => {
        let doSignOut = this.navParams.get("signout");
        if (doSignOut) {
          this.signout();
        }
      });
    } catch (err) {
      console.log(err);
    }
  }

  public login() {
    this.authService.signInWithGoogle().subscribe(userInfo => {
      this.nav.setRoot(HomePage);
    });
  }

  loginWithFacebook() {
    this.authService.signInWithFacebook().subscribe((userInfo) => {
      this.nav.setRoot(HomePage);
    });
  }

  public signout() {
    this.authService.signOut();
  }

}