# PayX Browser SDK

The official browser SDK for PayX Popup Payments. This library allows you to easily integrate a secure payment popup into your website.

## Installation

```bash
npm install payx-js
```

Or use via CDN:

```html
<script src="https://cdn.payx.app/js/v1/payx.js"></script>
```

## Usage

### Simple Checkout

```javascript
import { PayX } from 'payx-js';

const handler = PayX.setup({
  key: 'px_test_your_public_key',
  email: 'customer@example.com',
  amount: 100.00,
  currency: 'GHS',
  onSuccess: (response) => {
    console.log('Payment Successful!', response);
    alert('Thank you for your purchase!');
  },
  onCancel: () => {
    console.log('Payment Cancelled');
  },
  onError: (error) => {
    console.error('Payment Error', error);
  }
});

handler.open();
```

## API

### `PayX.setup(options)`

Returns a handler object with an `open()` and `close()` method.

| Option | Type | Required | Description |
| --- | --- | --- | --- |
| `key` | `string` | Yes | Your PayX Public Key |
| `email` | `string` | Yes | Customer's email address |
| `amount` | `number` | Yes | The amount to charge (in base currency unit, e.g. 10.50) |
| `currency` | `string` | No | Currency code (default: `GHS`) |
| `firstname` | `string` | No | Customer's first name |
| `lastname` | `string` | No | Customer's last name |
| `phoneNumber`| `string` | No | Customer's mobile money number |
| `onSuccess` | `function` | No | Callback triggered on successful payment |
| `onCancel` | `function` | No | Callback triggered if the user closes the popup |
| `onError` | `function` | No | Callback triggered on error |
