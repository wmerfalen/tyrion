# Tyrion - The node.js IRC bot
Tyrion is a simple node.js bot with an emphasis on security and simplicity.

# Supported OS's
Linux currently, but it can easily work on Windows with some trivial changes.


# Installation
- Copy the `.env.json.example` to `.env.json` within the same directory (the directory this README is in).

- Fill out the details in the `.env.json`

```
cd src && npm i
```

# Running
```
cd src
node main.js
```

# Features
	- low memory footprint. only grabs and stores first 25 kilobytes from any request
	- follows 301/302 redirects

# A full configuration example
```
{
	"password": "botpass",	// password for bot
	"nick": "botname",	// use this as bot name
	"channels": [
		"#hangout",	// connect to these channels
		"#hangout2"
	],
	"network": "irc.libera.chat",	// connect to this network
	"port": 6697,	// use this port
	"bind": "127.0.0.1",	// bind to interface with this IP
	"showErrors": true,
	"rejoin": false,	// automatic rejoin?
	"auto": true,			// automatic connect?
	"secure": true,	// use secure connection?
	"signed": false,	// use self signed cert?
	"certExpired": false,	// accept cert expired?
	"protect": true,	// enable flood protection?
	"protectDelay": 1000,	// flood protection delay
	"sasl": true,	// use sasl?
	"retry": 0,	// retry count
	"delay": 2000,	// retry delay
	"strip": false,	// strip colors?
	"prefix": "&#",	// channel prefix
	"split": 1024,	// split message boundary
	"encoding": "",	// optional encoding, blank uses default
	"settings": {
		"debug_notice": false,
		"debug": false,
		"testing": false
	},
	"allow": [
		"admin_nick_1",	// which nicks to fetch URLs
		"admin_nick_2"
	]
}
```


# Future Features
- DNS result caching
- Internet WHOIS (not IRC WHOIS) granted to admin users
