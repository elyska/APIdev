# Stripe

```
const fetchPromise = fetch('https://goodvertigo-chariotclarion-3000.codio-box.uk/api/v1/orders/1/payment', {
    method: 'POST',
        headers: {
            'Content-type': 'application/json',
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InVzZXIxQHVzZXIuY29tIiwiaWF0IjoxNjc4NzE5MDM4LCJleHAiOjE2Nzg3MTk2Mzh9.yqq0Ii_D-l1Xx-Jxqz4jE4B60xZ8K8eLX4fXC_1yrNs'
    }
});
fetchPromise.then(res => res.json()).then(res => {
  window.open(res.payment)
})
```
```
const fetchPromise = fetch('https://goodvertigo-chariotclarion-3000.codio-box.uk/api/v1/orders/1/payment', {
    method: 'POST',
        headers: {
            'Content-type': 'application/json',
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InVzZXIxQHVzZXIuY29tIiwiaWF0IjoxNjc4NzE5MDM4LCJleHAiOjE2Nzg3MTk2Mzh9.yqq0Ii_D-l1Xx-Jxqz4jE4B60xZ8K8eLX4fXC_1yrNs'
    }
});
fetchPromise.then(res => res.json()).then(res => console.log(res))
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