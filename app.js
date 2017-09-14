function timeout(ms) {
  return new Promise((resolve, reject) => {
    setTimeout(reject, ms);
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
        'diners',
        'jcb'
      ]
    }
  }], details).show().then(result => {
    return Promise.race([
      timeout(2000),
      fetch('/pay', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(result.toJSON())
      })
    ])
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

function onClickDemoA(e) {
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
        value: e.target.dataset.value
      }
    }
  });
}

function onClickDemoB() {
  const checkboxes = Array
    .from(document.querySelectorAll('input[type=checkbox]'))
    .filter(checkbox => checkbox.checked);

  if (checkboxes.length === 0) {
    return;
  }

  const displayItems = checkboxes.map(checkbox => {
    return {
      label: checkbox.dataset.label,
      amount: {
        currency: 'JPY',
        value: Number(checkbox.value)
      }
    };
  });

  const value = checkboxes
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
