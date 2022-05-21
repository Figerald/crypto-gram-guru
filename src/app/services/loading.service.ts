import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";

@Injectable()
export class LoadingService {
    private isLoading: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    public readonly getLoading: Observable<boolean> = this.isLoading.asObservable();

    public setLoading(data: boolean): void {
        this.isLoading.next(data);
    }
}
