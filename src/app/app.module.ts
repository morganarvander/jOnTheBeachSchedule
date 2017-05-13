import { FirebaseHandler } from '../firebaseHandler';
import { Logger } from '../logger';
import { ContactPage } from '../pages/contact/contact.component';
import { SpeakerDetails } from '../pages/speakerDetails/speakerDetails.component';
import { SessionDetails } from '../pages/sessionDetails/sessionDetails';
import { AuthService } from '../auth/authService';
import { LoginComponent } from '../pages/login/login.component';
import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';

import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';


import { AngularFireModule } from 'angularfire2';
import { firebaseConfig } from "./firebaseConfig";

import { FIREBASE_PROVIDERS } from 'angularfire2';
import { AppInsightsModule } from 'ng2-appinsights';
import { IonicStorageModule } from "@ionic/storage";
import { Ionic2RatingModule } from 'ionic2-rating';

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    SessionDetails,
    LoginComponent,
    ContactPage,
    SpeakerDetails
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    IonicStorageModule.forRoot(),
    AngularFireModule.initializeApp(firebaseConfig),
    AppInsightsModule,
    Ionic2RatingModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    SessionDetails,
    LoginComponent,
    SpeakerDetails,
    ContactPage
  ],
  providers: [
    FIREBASE_PROVIDERS,
    StatusBar,
    SplashScreen,
    { provide: ErrorHandler, useClass: IonicErrorHandler },
    AuthService,
    Logger,
    FirebaseHandler
  ]
})
export class AppModule { }
