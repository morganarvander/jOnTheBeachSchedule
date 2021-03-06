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

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    SessionDetails,
    LoginComponent,
    SpeakerDetails
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),    
    AngularFireModule.initializeApp(firebaseConfig)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    SessionDetails,
    LoginComponent,
    SpeakerDetails
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    AuthService
  ]
})
export class AppModule {}
