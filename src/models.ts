
export interface ISession {
  date: string;
  description: string;
  location: string;
  speakerId: string;
  time: string;
  title: string;
  startTime: Date;
  endTime: Date;
  favorite: boolean;
  sessionId: string;
  averageRating : number;
  workshopTitle : string;
}

export interface ISpeaker {
  description: string;
  imageUrl: string;
  smallImageUrl: string;
  name: string;
  speakerId: string;
}

export interface IUserData {
  uid: string;
  favoriteSessions: string[];
  
  anonymous : boolean;
}

export interface IDateSessions{
  date : string;
  sessions : ITimeSessions[];
}

export interface ITimeSessions{
  time : string;
  sessions : ISession[];
}

export interface ISettings{
  canComment : boolean;
  canRate : boolean;
}
