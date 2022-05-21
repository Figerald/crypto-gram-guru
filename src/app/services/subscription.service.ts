import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { firstValueFrom, lastValueFrom } from "rxjs";
import { SubscriberDetails } from "./types";

@Injectable()
export class SubscriptionService {
    public constructor(private readonly http: HttpClient) {
    }

    public async postSubscription(email: string, address?: string, periodicity?: string): Promise<void> {
        await firstValueFrom(this.http.post<{status: string}>('https://api.alphahuntsman.com/crypto-graph', { email, address, periodicity }));
    }

    public async postMessage(email: string, name?: string, message?: string): Promise<void> {
        await firstValueFrom(this.http.post<{status: string}>('https://api.alphahuntsman.com/crypto-graph/message', { email, name, message }));
    }

    public async checkForSubscription(email: string): Promise<{ status: string, data: SubscriberDetails}> {
        return await lastValueFrom(this.http.get<{ status: string, data: SubscriberDetails}>(`https://api.alphahuntsman.com/crypto-graph?email=${email}`));
    }
}
