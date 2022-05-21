import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import Web3 from 'web3';
import { ResultTypes } from './types';
import { LoadingService } from './loading.service';
import { SubscriptionService } from './subscription.service';

declare global {
  interface Window {
    ethereum: any
  }
}

@Injectable({
    providedIn: 'root'
})
export class MetaMaskService {
  private currentAccount: BehaviorSubject<string> = new BehaviorSubject('');
  private resultStatus: BehaviorSubject<ResultTypes> = new BehaviorSubject(undefined as ResultTypes);
  public readonly setAccount: Observable<string> = this.currentAccount.asObservable();
  public readonly setResult: Observable<ResultTypes> = this.resultStatus.asObservable();
  private provider: Web3 = new Web3(Web3.givenProvider);
  private ethereum = window.ethereum;

  public constructor(private readonly loadingService: LoadingService,
                     private readonly subscriptionService: SubscriptionService) {
  }

  public async verifyMetaMask(): Promise<boolean> {
    if (!this.provider.currentProvider) {
      this.resultStatus.next('METAMASK-MISSING');
      console.log('Please install MetaMask');
      window.open('https://metamask.io/download/', '_blank');

      return false;
    }
    this.listenEthereumEvents();

    return true;
  }

  public startApp(): void {
    if (!this.verifyMetaMask()) return;
    // If the provider returned by detectEthereumProvider is not the same as
    // window.ethereum, something is overwriting it, perhaps another wallet.
    if (!this.provider) {
        console.error('Do you have multiple wallets installed?');
        this.resultStatus.next('METAMASK-MISSING');

        return;
    }
    // Check network
    this.provider.eth
      .getChainId()
      .then(data => {
        if (data !== 97) {
          this.resultStatus.next('NOT-BINANCE-NETWORK');
          return console.error('Wrong network');
        };

        // Access the decentralized web!
        this.provider.eth
          .getAccounts()
          .then((data) => {
            this.handleAccountsChanged(data);
          })
          .catch(err => {
            if (err.code === 4001) {
              // EIP-1193 userRejectedRequest error
              // If this happens, the user rejected the connection request.
              console.log('Please connect to MetaMask.');
              this.resultStatus.next('METAMASK-NOT-CONNECTED');
            } else {
              this.resultStatus.next('error');
              console.log(err);
            }
          });
      })
      .catch(err => this.resultStatus.next('error'));
  }

  public async sendTransaction(account: string, value: number, email: string, periodicity?: string): Promise<void> {
    if (!this.provider) {
      this.verifyMetaMask();
    };

    this.provider?.eth.sendTransaction({
      from: account,
      to: '0x014BE62501B589604838F4Eb6Bd624AfebB30aB0',
      value: (value * 1000000000000000000)
    }).then(async (result) => {
      this.loadingService.setLoading(false);
      this.resultStatus.next('TRANSACTION-FINISHED');
      this.subscriptionService.postSubscription(email, result.from, periodicity);
    }).catch(error => {
      this.resultStatus.next('TRANSACTION-FAILED');
      this.loadingService.setLoading(false);
    });
  }

  private handleAccountsChanged(accounts: any): void {
    if (accounts.length === 0) {
      // MetaMask is locked or the user has not connected any accounts
      if (!this.provider) {
        this.verifyMetaMask();
      };
      this.provider.eth.requestAccounts()
        .then(accounts => {
          this.currentAccount.next(accounts[0]);
          this.resultStatus.next('success');
        })
        .catch(err => {
          if (err.code === -32002) {
            return this.resultStatus.next('METAMASK-PENDING-CONNECTION');
          }

          if (err.code === 4001) {
            return this.resultStatus.next('METAMASK-NOT-CONNECTED');
          }
          this.resultStatus.next('error');
        });

      return;
    } else if (accounts[0] !== this.currentAccount) {
      // send account string
      this.currentAccount.next(accounts[0]);
      // Do any other work!
      return this.resultStatus.next('success');
    }
    this.resultStatus.next('METAMASK-NOT-CONNECTED');
    console.log('Please connect to MetaMask.');
  }

  private listenEthereumEvents(): void {
    if (!this.ethereum) {
      console.log('Metamask is missing');

      return this.resultStatus.next('METAMASK-MISSING');
    }
    this.ethereum.on('accountsChanged', () => location.reload());
    this.ethereum.on('chainChanged', () => location.reload());
    this.ethereum.on('disconnect', () => location.reload());
  }
}
