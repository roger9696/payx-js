interface PayXOptions {
    key: string;
    amount: number;
    currency?: string;
    email: string;
    firstname?: string;
    lastname?: string;
    phoneNumber?: string;
    metadata?: Record<string, any>;
    baseUrl?: string;
    onSuccess?: (response: any) => void;
    onCancel?: () => void;
    onError?: (error: any) => void;
}
declare class PayXPopup {
    private options;
    private iframe;
    private container;
    constructor(options: PayXOptions);
    open(): void;
    private createContainer;
    private createIframe;
    private setupListeners;
    close(): void;
}
declare const PayX: {
    setup: (options: PayXOptions) => PayXPopup;
};

export { PayX, type PayXOptions, PayX as default };
