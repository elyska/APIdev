# Products
## Update
```
const fetchPromise = fetch('https://goodvertigo-chariotclarion-3000.codio-box.uk/api/v1/products/2', {
    method: 'PUT',
		headers: {
				'Content-type': 'application/json'
	},
    body: JSON.stringify({title: "Updated name", description: 'Updated description', price: 10.89})
});
fetchPromise.then(res => res.json()).then(res => console.log(res))
```

## Delete
```
const fetchPromise = fetch('https://goodvertigo-chariotclarion-3000.codio-box.uk/api/v1/products/2', {
    method: 'DELETE',
		headers: {
				'Content-type': 'application/json'
	}
});
fetchPromise.then(res => res.json()).then(res => console.log(res))
```