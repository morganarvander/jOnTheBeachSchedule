
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
}

export interface ISpeaker {
  description: string;
  imageUrl: string;
  name: string;
  speakerId: string;
}

export interface IUserData {
  uid: string;
  favoriteSessions: string[];
}