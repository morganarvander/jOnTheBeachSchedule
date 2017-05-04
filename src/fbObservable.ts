import { Promise } from 'firebase';
import { Observable } from "rxjs/Observable";
import { Subject } from "rxjs/Subject";

export class FbObservable{
    public static fromPromise<T>(promise:Promise<T>) : Observable<T>{
        var subject = new Subject<T>();
        promise.then(a=>subject.next(a)).catch(e=>subject.error(e));
        return subject;
    }
}