# APIdev

The API enables the management of various aspects of an eCommerce website, including products, product categories, user accounts, and online payments. It uses JWT authentication with refresh token rotation to provide enhanced security. Authorisation was implemented to protect routes and records that are not intended for public access. There are 2 roles available – user and admin. 
Users can create an account, view products and categories, place orders and view all their orders. Third-party API Stripe is used for fast and secure online payments. Users can also delete their own account.
Administrators can add, edit, and delete products, assign them to categories or delete them from categories. This allows for seamless product management and ensures that product information is up-to-date and accurate. The API also enables the management of user accounts, allowing to securely store customer information and track purchases.
