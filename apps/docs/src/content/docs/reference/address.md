---
title: Address
---

The `Address` class is a util class that helps you deal with addresses.

```javascript
// example usage
const address1 = Address.fromSs58(account1.address)
const address2 = Address.fromSs58(account2.address)

// so you don't have to worry about prefix when comparing!
const isSameAddress = address1.isEqual(address2)

// helps convert an address to different format by providing
const polkadotAddress = address1.toSs58(0)
```

## `Address` Methods

### `isEqual(Address)`

Compares 2 address classes.

```javascript
const isSameAddress = address.isEqual(address2)
```

### `toSs58(prefix)`

Format the address according to the prefix.

```javascript
const polkadotAddress = address.toSs58(0)
```

### `toPubKey()`

Returns the pubkey of the address

```javascript
const pubkey = address.toPubKey()
```
