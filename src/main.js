const url = require('./lib/url.js');

const settings_default = {
	debug_notice: false,
	debug: false,
	testing: false
}
const bot = require('../.env.json');
const settings = typeof bot.settings !== 'undefined' ? bot.settings : settings_default

var irc = require('irc')
var client = new irc.Client(bot.network, bot.nick, {
    userName: bot.nick,
    realName: bot.nick,
		nick: bot.nick,
		password: bot.password,
    port: 6697,
    localAddress: null,
    debug: settings.debug,
    showErrors: true,
    autoRejoin: false,
    autoConnect: true,
    secure: true,
    selfSigned: false,
    certExpired: false,
    floodProtection: false,
    floodProtectionDelay: 1000,
    sasl: 0,
    retryCount: 0,
    retryDelay: 2000,
    stripColors: false,
    channelPrefixes: "&#",
    messageSplit: 1024,
    encoding: ''

})
client.addListener('notice', function (from, to, message) {
	if(settings.debug_notice){
		console.log(from + ' => ' + to + ': ' + message)
		if(from !== undefined && from.match(/^NickServ$/)){
			console.log('NOTICE from NickServ: ',to,',',message)
		}
	}
	if(from !== undefined && from.match(/^NickServ$/) && to !== undefined && to === bot.nick){
		if(message.match(/^You are now identified for/)){
			if(settings.testing){
				client.join('#tyriontesting', (a,b,c) => {
					console.log('joined #tyriontesting: ',a,b,c)
				})
				return
			}
			for(let i=0; i < bot.channels.length; i++){
				client.join(bot.channels[i], (a,b,c) => {
					console.log('joined ' + bot.channels[i])
				})
			}
		}
	}
})
client.addListener('message', function (from, to, message) {
	console.log(from + ' => ' + to + ': ' + message)
})
client.addListener('pm', function (from, message) {
	console.log(from + ' => ME: ' + message)
})
client.addListener('message#tyriontesting', function (from, message) {
	console.log(from + ' => #tyriontesting: ' + message)
})

/*
let https = require('https');

const options = {
  hostname: 'encrypted.google.com',
  port: 443,
  path: '/',
  method: 'GET'
};

const req = https.request(options, (res) => {
  console.log('statusCode:', res.statusCode);
  console.log('headers:', res.headers);

  res.on('data', (d) => {
    process.stdout.write(d);
  });
});

req.on('error', (e) => {
  console.error(e);
});
req.end();
*/
