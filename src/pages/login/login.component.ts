import { HomePage } from '../home/home';
import { NavController } from 'ionic-angular';
import { AuthService } from '../../auth/authService';
import { Component, OnInit } from '@angular/core';
import { FirebaseAuthState } from "angularfire2";

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
  ) { }

  ngOnInit() {
    try {
      this.authService.auth$.subscribe((state: FirebaseAuthState) => {
        this.authenticated = !state.auth.isAnonymous;
        if (this.authenticated) {
          this.nav.setRoot(HomePage);
        }
      },(error)=>{
        console.log(error);
      });
    } catch (err) {
      console.log(err);
    }
  }

  public login() {
    this.authService.signInWithGoogle();
  }

}