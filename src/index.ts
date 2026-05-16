export interface PayXOptions {
  key: string;
  amount: number;
  currency?: string;
  email: string;
  firstname?: string;
  lastname?: string;
  phoneNumber?: string;
  metadata?: Record<string, any>;
  baseUrl?: string; // Optional base URL for local testing
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
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: '999999',
      backdropFilter: 'blur(8px)',
      transition: 'opacity 0.3s ease',
      opacity: '0'
    });

    document.body.appendChild(this.container);
    
    // Fade in container
    setTimeout(() => {
      if (this.container) this.container.style.opacity = '1';
    }, 10);
  }

  private createIframe() {
    // Wrapper for iframe and close button
    const wrapper = document.createElement('div');
    Object.assign(wrapper.style, {
      position: 'relative',
      width: '100%',
      maxWidth: '450px',
      height: '600px', // Proper fixed height
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    });

    // Close button
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '&times;';
    Object.assign(closeBtn.style, {
      position: 'absolute',
      top: '12px',
      right: '12px',
      background: 'rgba(0, 0, 0, 0.05)',
      border: 'none',
      color: '#64748b',
      fontSize: '24px',
      cursor: 'pointer',
      width: '32px',
      height: '32px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.2s ease',
      zIndex: '1000001'
    });
    closeBtn.onmouseover = () => {
      closeBtn.style.background = 'rgba(0, 0, 0, 0.1)';
      closeBtn.style.color = '#1e293b';
    };
    closeBtn.onmouseout = () => {
      closeBtn.style.background = 'rgba(0, 0, 0, 0.05)';
      closeBtn.style.color = '#64748b';
    };
    closeBtn.onclick = (e) => {
      e.stopPropagation();
      this.close();
      this.options.onCancel?.();
    };

    this.iframe = document.createElement('iframe');
    const defaultBaseUrl = 'https://payx.company';
    const baseUrl = this.options.baseUrl || defaultBaseUrl;
    const checkoutUrl = `${baseUrl.replace(/\/$/, '')}/checkout`;
    
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
    
    // Add loading spinner
    const spinner = document.createElement('div');
    spinner.id = 'payx-loader';
    const spinnerStyle = document.createElement('style');
    spinnerStyle.innerHTML = `
      #payx-loader {
        width: 40px;
        height: 40px;
        border: 4px solid rgba(255, 255, 255, 0.1);
        border-left-color: #6366f1;
        border-radius: 50%;
        animation: payx-spin 1s linear infinite;
        position: absolute;
        top: 50%;
        left: 50%;
        margin-top: -20px;
        margin-left: -20px;
      }
      @keyframes payx-spin {
        to { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(spinnerStyle);
    wrapper.appendChild(spinner);

    Object.assign(this.iframe.style, {
      width: '100%',
      maxWidth: '450px',
      height: '100%', // Take full wrapper height
      border: 'none',
      borderRadius: '24px',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      backgroundColor: '#fff',
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      opacity: '0',
      display: 'none',
      transform: 'translateY(20px)'
    });

    this.iframe.onload = () => {
      if (this.iframe && this.container) {
        spinner.remove();
        this.iframe.style.display = 'block';
        setTimeout(() => {
          if (this.iframe) {
            this.iframe.style.opacity = '1';
            this.iframe.style.transform = 'translateY(0)';
          }
        }, 50);
      }
    };

    wrapper.appendChild(this.iframe);
    wrapper.appendChild(closeBtn);
    this.container?.appendChild(wrapper);
  }

  private setupListeners() {
    const handleMessage = (event: MessageEvent) => {
      const defaultBaseUrl = 'https://payx.company';
      const expectedOrigin = (this.options.baseUrl || defaultBaseUrl).replace(/\/$/, '');
      
      if (event.origin !== expectedOrigin) return;

      const { type, data } = event.data;

      switch (type) {
        case 'PAYX_SUCCESS':
          this.close();
          this.options.onSuccess?.(data);
          break;
        case 'PAYX_CANCEL':
          this.close();
          this.options.onCancel?.();
          break;
        case 'PAYX_ERROR':
          this.options.onError?.(data);
          break;
      }
    };

    window.addEventListener('message', handleMessage);
    
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

export default PayX;
