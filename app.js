function timeout(ms) {
  return new Promise((resolve, reject) => {
    setTimeout(reject, ms);
  });
}

const basicCard = {
  supportedMethods: ['basic-card'],
  data: {
    supportedNetworks: [
      'visa',
      'mastercard',
      'amex',
      'diners',
      'jcb'
    ]
  }
};

const payWithGoogle = {
  supportedMethods: ['https://google.com/pay'],
  data: {
    // Merchant ID available after approval by Google.
    // 'merchantId':'01234567890123456789',
    environment: 'TEST',
    apiVersion: 1,
    allowedPaymentMethods: [
      'CARD',
      'TOKENIZED_CARD'
    ],
    paymentMethodTokenizationParameters: {
      tokenizationType: 'PAYMENT_GATEWAY',
      // Check with your payment gateway on the parameters to pass.
      parameters: {}
    },
    cardRequirements: {
      allowedCardNetworks: [
        'AMEX',
        'DISCOVER',
        'MASTERCARD',
        'VISA'
      ],
      billingAddressRequired: true,
      billingAddressFormat: 'MIN'
    },
    phoneNumberRequired: true,
    emailRequired: true,
    shippingAddressRequired: true
  }
};

async function pay(details) {
  const request = new PaymentRequest([
    basicCard,
    payWithGoogle
  ], details);

  const paymentAvailable = await request.canMakePayment();

  if (!paymentAvailable) {
    return;
  }

  const result = await request.show();

  try {
    const response = await Promise.race([
      timeout(2000),
      fetch('/pay', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(result.toJSON())
      })
    ]);

    if (response.status === 200) {
      result.complete('success');
    } else {
      result.complete('fail');
    }
  } catch (error) {
    result.complete('fail');
  }
}

function onClickDemoA(e) {
  e.preventDefault();
  const clickedButton = e.target;

  pay({
    displayItems: [{
      label: clickedButton.dataset.label,
      amount: {
        currency: 'JPY',
        value: clickedButton.dataset.value
      }
    }],
    total: {
      label: 'Total due',
      amount: {
        currency: 'JPY',
        value: clickedButton.dataset.value
      }
    }
  });
}

function onClickDemoB(e) {
  e.preventDefault();
  const checkboxes = Array.from(document.querySelectorAll('input[type=checkbox]'));
  const checkedCheckboxes = checkboxes.filter(checkbox => checkbox.checked);

  if (checkedCheckboxes.length === 0) {
    return;
  }

  const displayItems = checkedCheckboxes.map(checkbox => {
    return {
      label: checkbox.dataset.label,
      amount: {
        currency: 'JPY',
        value: Number(checkbox.value)
      }
    };
  });

  const value = checkedCheckboxes
    .map(checkbox => Number(checkbox.value))
    .reduce((previous, current) => previous + current);

  pay({
    displayItems,
    total: {
      label: 'Total due',
      amount: {
        currency: 'JPY',
        value
      }
    }
  });
}

document.querySelectorAll('.demo-a').forEach(button => {
  button.addEventListener('click', onClickDemoA);
});

document.querySelectorAll('.demo-b').forEach(button => {
  button.addEventListener('click', onClickDemoB);
});
