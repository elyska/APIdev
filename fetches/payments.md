# Stripe

```
const fetchPromise = fetch('https://goodvertigo-chariotclarion-3000.codio-box.uk/api/v1/orders/1/payment', {
    method: 'POST',
        headers: {
                'Content-type': 'application/json'
    }
});
fetchPromise.then(res => res.json()).then(res => {
  window.open(res.payment)
})
```
## Test cards
Payment succeeds
```text
4242 4242 4242 4242
```
Payment requires authentication
```text
4000 0025 0000 3155
```
Payment is declined
```text
4000 0000 0000 9995
```