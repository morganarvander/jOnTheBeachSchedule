import { EventEmitter } from '@angular/core';
import { FirebaseHandler } from '../../firebaseHandler';
import { from } from 'linq';
import { IDateSessions, ISession, IUserData } from '../../models';
import { parseTimeInterval } from '../../utils';

export class SessionBuilder {
    visiblityPredicate: (session: ISession) => boolean;

    private allSessions: ISession[];

    public onSessionsBuilt = new EventEmitter<IDateSessions[]>();
    public visibleSessions: {
        date: string
        sessions: {
            time: string,
            sessions: ISession[]
        }[]
    }[];

    public userData: IUserData;

    constructor(predicate: (session: ISession) => boolean, firebaseHandler: FirebaseHandler) {
        this.visiblityPredicate = predicate;
        firebaseHandler.onSessions.subscribe((sessions) => {
            this.allSessions = sessions;
            this.buildSessions();
        });        
        firebaseHandler.subscribeOnUserAuth((userData) => 
            this.setUserData(userData)
        );        
    }

    public setUserData(userData: IUserData) {
        this.userData = userData;
        this.setupFavoriteMarkings();
    }

    private setupFavoriteMarkings() {
        if (this.allSessions) {
            this.allSessions.forEach((session) => {
                session.favorite = this.userData && this.userData.favoriteSessions.some(a => a == session.sessionId);
            })
        }
    }


    /* Marks a session as a favorite and updates the server accordingly */
    public markAsFavorite(session: ISession): IUserData {
        session.favorite = !session.favorite ? true : false;
        this.userData.favoriteSessions = this.allSessions.filter(a => a.favorite).map(a => a.sessionId);
        return this.userData;
    }

    /* Groups all sessions into a structure based on DAY->TIMEINTERVAL->SESSIONS */
    public buildSessions() {
        this.setupFavoriteMarkings();
        var daySessions = from(this.allSessions).
            where(this.visiblityPredicate).
            groupBy(a => a.date, (session) => session, (key, group) => {
                return {
                    date: key,
                    sessions: group.groupBy(a => a.time, a => a, (key, group) => {
                        return {
                            time: key,
                            sessions: group.orderBy(a => a.startTime).toArray()
                        }
                    }).orderBy(a => parseTimeInterval(a.time)).toArray()
                }
            });
        this.visibleSessions = daySessions.toArray();
        this.onSessionsBuilt.emit(this.visibleSessions);
    }
}