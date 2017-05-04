import { ContactPage } from '../pages/contact/contact.component';
import { AppInsightsInstrumentationKey } from './firebaseConfig';
import { FirebaseAuthState } from 'angularfire2/auth';
import { AuthService } from '../auth/authService';
import { LoginComponent } from '../pages/login/login.component';
import { Component, ViewChild } from '@angular/core';
import { Nav, Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { HomePage } from '../pages/home/home';
import { AppInsightsService } from "ng2-appinsights";

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;

  rootPage: any = LoginComponent;

  pages: Array<{ title: string, component: any }>;

  constructor(
    public platform: Platform,
    public statusBar: StatusBar,
    public splashScreen: SplashScreen,
    private authService: AuthService,
    private appinsightsService : AppInsightsService
  ) {
    this.initializeApp();
    this.appinsightsService.Init({
        instrumentationKey: AppInsightsInstrumentationKey,
        verboseLogging: true
    });    
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
      this.appinsightsService.trackEvent(
            'AppStart'            
        );
      this.appinsightsService.flush();
    });
  }

  openPage(page) {
    this.authService.auth$.subscribe((state: FirebaseAuthState) => {
      if (state.auth.isAnonymous) {
        this.nav.setRoot(LoginComponent);
      }
      else{
        this.rootPage = HomePage;
      }
    });
  }

  openSchedule(){
    this.nav.setRoot(HomePage);
  }

  openContact(){
    this.nav.setRoot(ContactPage);
  }

  logout(){
    this.authService.signOut().subscribe(a=>this.nav.setRoot(LoginComponent));
  }
}
