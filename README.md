# jOnTheBeach

Mobile schedule for jOnTheBeach conference in Malaga 2017

The application is currently published on Google Play as an alpha version  at 
https://play.google.com/store/apps/details?id=se.crosscut.jonthebeach

##Background##
The purpose of this project was to investigate the frameworks Ionic and Firebase and doing that with a real world example. Since I'm attending the jOnTheBeach conference this year, it seemed like a good idea to do a mobile client to view the session and to be able to create a personal list of sessions.

##Implementation##
The app and the source is "as is", I have not put any great thoughts into structuring the app in some fancy way etc and since it has quite a limited lifespan I just focused on making it work.

In order to get the data for the sessions I simply scraped the website and extracted the required information. 

###Ionic###
Ionic was installed using npm and the application was created using the Ionic CLI tool, plain and simple.

###Firebase###
Firebase is accessed throug AngluarFire2 (https://github.com/angular/angularfire2) and it is really is to access the features of Firebase through this library.


##Lesson learned##

I thought this was going to be an easy and it was, almost. The main problem I ran into was the authentication part for Google. It worked like a charm when running the app in the browser but not in the client. In the browser, a window pops up, requesting your credentials, but this does not work on a device. 

So, in order to be able to login using Google, the another library is used for the primary authentication. After authenticating through this library, the result is used for authenticating the AngularFirebase client. 
