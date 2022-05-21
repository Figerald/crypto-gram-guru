export type ResultTypes = 
    undefined |
    'METAMASK-MISSING' |
    'METAMASK-NOT-CONNECTED' |
    'NOT-BINANCE-NETWORK' |
    'TRANSACTION-FAILED' |
    'METAMASK-PENDING-CONNECTION' |
    'ACCOUNT-CHANGED' |
    'TRANSACTION-FINISHED' |
    'success' |
    'error';

export type SubscriberDetails = {
    Email: string | undefined;
    Coupon: string | undefined;
    Date: string | undefined;
};
