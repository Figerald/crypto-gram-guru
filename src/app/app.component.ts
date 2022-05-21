import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { AnimationOptions } from 'ngx-lottie';
import { Subject, takeUntil } from 'rxjs';
import { animationsArray } from './animation/animations';
import { SubscriberDetails } from './services/types';
import { LoadingService } from './services/loading.service';
import { MetaMaskService } from './services/metamask.service';
import { SubscriptionService } from './services/subscription.service';

// TODO:
// 5. Add some animations
// 6. Check if email has a subscription when trying to submit new
// 7. Handle error on same address and email

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: animationsArray
})
export class AppComponent implements OnInit, OnDestroy {
  public subscriberDetails: SubscriberDetails = {
    Email: undefined,
    Coupon: undefined,
    Date: undefined
  };
  public isSubscribeDetails = false;
  public loading = false;
  public successNotification = false;
  public contactForm = new FormGroup({
    name: new FormControl(''),
    email: new FormControl(''),
    text: new FormControl('')
  });
  public subscriptionForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email])
  });
  public options: AnimationOptions = {
    path: '/assets/animation.json',
  };
  public shortAccount: string | undefined;
  public notificationAnimationStatus = 'hide';
  public notificationObj = {
    type: '',
    text: ''
  };
  public errorObj = {
    isError: false,
    errorMessage: ''
  };
  public periodicity: string | undefined;
  public periodError = false;
  public isMetamaskConnected = true;
  private account: string | undefined;
  private destroy$: Subject<void> = new Subject();
  private changeDetector: ChangeDetectorRef | undefined;
  
  get email() {
    return this.subscriptionForm.get('email');
  }

  public constructor(private readonly metaMaskService: MetaMaskService,
                     private readonly loadingService: LoadingService,
                     private readonly subscriptionService: SubscriptionService) {
    this.metaMaskService.setResult.pipe(takeUntil(this.destroy$)).subscribe(result => {
      if (result) {
        console.log(result);
        this.handleNotification(result);
      };
    });
    this.loadingService.getLoading.pipe(takeUntil(this.destroy$)).subscribe(data => this.loading = data);
  }

  public ngOnInit(): void {
    this.metaMaskService.setAccount.pipe(takeUntil(this.destroy$)).subscribe(account => {
      this.changeDetector?.detectChanges();
      if (account) {
        this.shortAccount = `${account.substring(0, 4)}...${account.slice(-4)}`;
        this.account = account;
      }
    });
  }

  public connectToMetamask(): void {
    this.metaMaskService.startApp();
    this.isMetamaskConnected = true;
  }

  // Catch when user changes account
  // Catch when user changes network
  public async confirmSubscription(): Promise<void> {
    if (this.inputValidation()) return;
    if (!this.account) {
      this.isMetamaskConnected = false;

      return;
    }

    this.loading = true;
    const amount = this.periodicity === 'annual' ? 1.2 : 0.4;
    const email = this.email?.value;
    this.metaMaskService.sendTransaction(this.account, amount, email, this.periodicity);
  }

  public async checkForSubscription(): Promise<void> {
    this.errorObj = {
      isError: false,
      errorMessage: ''
    };
    if (this.email && this.email.errors && this.email.errors['required']) {
      this.errorObj.errorMessage = 'Please enter your email address!';
      this.errorObj.isError = true;

      return;
    }
    this.loading = true;
    const result = await this.subscriptionService.checkForSubscription(this.email?.value);
    if (result.status === 'success' && result.data) {
      this.subscriberDetails = result.data;
    } else {
      this.subscriberDetails = {
        Email: undefined,
        Coupon: undefined,
        Date: undefined
      }
    }
    this.isSubscribeDetails = true;
    this.loading = false;
  }

  public sendMessage(): void {
    const name = this.contactForm.get('name')?.value;
    const message = this.contactForm.get('text')?.value;
    const email = this.contactForm.get('email')?.value;
    if (!email) {
      return console.log(email);
    }
    this.subscriptionService.postMessage(email, name, message);
    this.notificationObj.text = 'Your message sent successfully!';
    this.notificationObj.type = 'success';
    this.notificationAnimationStatus = 'show';
    setTimeout(() => {
      this.notificationAnimationStatus = 'hide';
    }, 3000);
    this.contactForm.setValue({ name: '', email: '', text: ''});
  }

  public ngOnDestroy(): void {
    this.destroy$.next();
  }

  private inputValidation(): boolean {
    let validationResult = false;
    this.errorObj.isError = false;
    this.periodError = false;
    this.isMetamaskConnected = true;

    if (!this.periodicity) {
      this.periodError = true;
      validationResult = true;
    }

    if (this.email && this.email.errors && this.email.errors['required']) {
      this.errorObj.errorMessage = 'Please enter your email address!';
      this.errorObj.isError = true;
      validationResult = true;
    }

    if (this.email && this.email.errors && this.email.errors['email']) {
      this.errorObj.errorMessage = 'Please enter valid email address!';
      this.errorObj.isError = true;
      validationResult = true;
    }

    return validationResult;
  }

  private handleNotification(type: string): void {
    if (type === 'success') {
      this.notificationObj.text = 'Wallet connected successfully!';
      this.notificationObj.type = type;
    }

    if (type === 'TRANSACTION-FINISHED') {
      this.notificationObj.text = 'Congratulation! Subscription confirmed.'
      this.notificationObj.type = 'success';
    }

    if (type === 'NOT-BINANCE-NETWORK') {
      this.notificationObj.text = 'Change your network to Binance Smart Chain.';
      this.notificationObj.type = 'warning';
    }

    if (type === 'METAMASK-MISSING') {
      this.notificationObj.text = 'MetaMask not installed!'
      this.notificationObj.type = 'warning';
    }

    if (type === 'METAMASK-NOT-CONNECTED') {
      this.notificationObj.text = 'MetaMask is locked or the user has not connected any accounts.';
      this.notificationObj.type = 'warning';
    }

    if (type === 'TRANSACTION-FAILED') {
      this.notificationObj.text = 'Oops, something went wrong, transaction failed!';
      this.notificationObj.type = 'warning';
    }

    if (type === 'METAMASK-PENDING-CONNECTION') {
      this.notificationObj.text = 'Already pending for connection, please open MetaMask.';
      this.notificationObj.type = 'warning';
    }

    if (type === 'ACCOUNT-CHANGED') {
      this.notificationObj.text = `Account changed: ${this.account}`;
      this.notificationObj.type = 'success';
    }

    if (type === 'error') {
      this.notificationObj.text = 'Oops, something went wrong, Please try again later!';
      this.notificationObj.type = 'warning';
    }

    this.notificationAnimationStatus = 'show';
    setTimeout(() => {
      this.notificationAnimationStatus = 'hide';
    }, 3000);
  }
}
