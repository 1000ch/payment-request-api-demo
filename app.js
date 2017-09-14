const onClickDemoA = e => {
  pay({
    displayItems: [{
      label: e.target.dataset.label,
      amount: {
        currency: 'JPY',
        value: e.target.dataset.value
      }
    }],
    total: {
      label: 'Total due',
      amount: {
        currency: 'JPY',
        value : e.target.dataset.value
      }
    }
  });
};

function onClickDemoB() {
  const selected = Array
    .from(document.querySelectorAll('input[type=checkbox]'))
    .filter(checkbox => checkbox.checked);

  if (selected.length === 0) {
    return;
  }

  const displayItems = selected.map(checkbox => {
    return {
      label: checkbox.dataset.label,
      amount: {
        currency: 'JPY',
        value: Number(checkbox.value)
      }
    };
  });

  const value = selected
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

function pay(details) {
  new PaymentRequest([{
    supportedMethods: ['basic-card'],
    data: {
      supportedNetworks: [
        'visa',
        'mastercard',
        'amex',
        'discover',
        'diners',
        'jcb'
      ]
    }
  }], details).show().then(result => {
    return fetch('/pay', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(result.toJSON())
    })
    .then(response => {
      if (response.status === 200) {
        return result.complete('success');
      } else {
        return result.complete('fail');
      }
    })
    .catch(() => result.complete('fail'));
  });
}

document.querySelectorAll('.demo-a').forEach(button => {
  button.addEventListener('click', onClickDemoA);
});

document.querySelectorAll('.demo-b').forEach(button => {
  button.addEventListener('click', onClickDemoB);
});
