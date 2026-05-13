export interface PayXOptions {
  key: string;
  amount: number;
  currency?: string;
  email: string;
  firstname?: string;
  lastname?: string;
  phoneNumber?: string;
  metadata?: Record<string, any>;
  onSuccess?: (response: any) => void;
  onCancel?: () => void;
  onError?: (error: any) => void;
}

class PayXPopup {
  private options: PayXOptions;
  private iframe: HTMLIFrameElement | null = null;
  private container: HTMLDivElement | null = null;

  constructor(options: PayXOptions) {
    this.options = {
      currency: 'GHS',
      ...options
    };
  }

  public open() {
    this.createContainer();
    this.createIframe();
    this.setupListeners();
  }

  private createContainer() {
    this.container = document.createElement('div');
    this.container.id = 'payx-popup-container';
    Object.assign(this.container.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: '999999',
      backdropFilter: 'blur(4px)',
      transition: 'opacity 0.3s ease'
    });

    document.body.appendChild(this.container);
  }

  private createIframe() {
    this.iframe = document.createElement('iframe');
    const checkoutUrl = 'https://pay-x-beryl.vercel.app/checkout';
    
    // Build query params
    const params = new URLSearchParams({
      key: this.options.key,
      amount: this.options.amount.toString(),
      currency: this.options.currency || 'GHS',
      email: this.options.email,
      ...(this.options.phoneNumber && { phoneNumber: this.options.phoneNumber }),
      ...(this.options.firstname && { firstname: this.options.firstname }),
      ...(this.options.lastname && { lastname: this.options.lastname }),
    });

    this.iframe.src = `${checkoutUrl}?${params.toString()}`;
    Object.assign(this.iframe.style, {
      width: '100%',
      maxWidth: '450px',
      height: '90vh',
      maxHeight: '700px',
      border: 'none',
      borderRadius: '16px',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      backgroundColor: '#fff',
      transition: 'transform 0.3s ease'
    });

    this.container?.appendChild(this.iframe);
  }

  private setupListeners() {
    const handleMessage = (event: MessageEvent) => {
      // Security check: Only trust messages from your domain
      if (event.origin !== 'https://pay-x-beryl.vercel.app') return;

      const { type, data } = event.data;

      switch (type) {
        case 'PAYX_SUCCESS':
          this.options.onSuccess?.(data);
          this.close();
          break;
        case 'PAYX_CANCEL':
          this.options.onCancel?.();
          this.close();
          break;
        case 'PAYX_ERROR':
          this.options.onError?.(data);
          break;
      }
    };

    window.addEventListener('message', handleMessage);
    
    // Cleanup listener on close
    this.container?.addEventListener('click', (e) => {
      if (e.target === this.container) {
        this.close();
        this.options.onCancel?.();
      }
    });
  }

  public close() {
    if (this.container) {
      this.container.style.opacity = '0';
      setTimeout(() => {
        this.container?.remove();
        this.container = null;
        this.iframe = null;
      }, 300);
    }
  }
}

export const PayX = {
  setup: (options: PayXOptions) => {
    return new PayXPopup(options);
  }
};

// Also export as default
export default PayX;
