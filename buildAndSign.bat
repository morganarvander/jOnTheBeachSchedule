CALL ionic build android --release  
DEL /Q .\apk\*.*
CALL "c:\Program Files\Java\jdk1.8.0_65\bin\jarsigner" -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore jonthebeach.deploy.keystore platforms\android\build\outputs\apk\android-release-unsigned.apk jonthebeach -signedjar .\apk\android-release.signed.apk 
CALL "C:\Program Files (x86)\Android\android-sdk\build-tools\19.1.0\zipalign.exe" -f -v 4 .\apk\android-release.signed.apk .\apk\android-release.signed.aligned.apk