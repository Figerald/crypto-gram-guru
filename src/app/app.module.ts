import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { LottieModule } from 'ngx-lottie';
import player from 'lottie-web';

import { AppComponent } from './app.component';
import { MetaMaskService } from './services/metamask.service';
import { LoadingService } from './services/loading.service';
import { SubscriptionService } from './services/subscription.service';

export function playerFactory() {
  return player;
}

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    LottieModule.forRoot({ player: playerFactory }),
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule
  ],
  providers: [MetaMaskService, LoadingService, SubscriptionService],
  bootstrap: [AppComponent]
})
export class AppModule { }
