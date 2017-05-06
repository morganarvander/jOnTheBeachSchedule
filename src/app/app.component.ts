import { ContactPage } from '../pages/contact/contact.component';
import { AppInsightsInstrumentationKey } from './firebaseConfig';
import { FirebaseAuthState } from 'angularfire2/auth';
import { AuthService } from '../auth/authService';
import { LoginComponent } from '../pages/login/login.component';
import { Component, ViewChild, OnInit } from '@angular/core';
import { Nav, Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { HomePage } from '../pages/home/home';
import { AppInsightsService } from "ng2-appinsights";

@Component({
  templateUrl: 'app.html'
})
export class MyApp implements OnInit{

  @ViewChild(Nav) nav: Nav;

  rootPage: any = HomePage;

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
  ngOnInit(): void {
    this.platform.ready().then(() => {
      
    })
  }
  
  openSchedule(){
    this.nav.setRoot(HomePage);
  }

  openContact(){
    this.nav.setRoot(ContactPage);
  }

  openLogin(){
    this.nav.setRoot(LoginComponent);
  }

  logout(){ 
    this.authService.signOut().subscribe();
  }
}
