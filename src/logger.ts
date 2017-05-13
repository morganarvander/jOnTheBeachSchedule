import { Injectable } from '@angular/core';
import { AppInsightsService, SeverityLevel } from 'ng2-appinsights';

@Injectable()
export class Logger {

    constructor(private appinsightsService: AppInsightsService) {

    }
    public log(title: string, data: any) {
        console.log("LOG : " + title,data)
        this.appinsightsService.trackEvent(title, {data : data});
        this.appinsightsService.flush();
    }

    public logError(error: any) {
        console.error("ERROR :" + error, error)
        this.appinsightsService.trackException(
            new Error(error),
            'handleError',
            SeverityLevel.Error
        );
    }
}