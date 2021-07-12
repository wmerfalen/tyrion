
const https = require('https')

const settings_default = {
	debug_notice: false,
	debug: false,
	testing: false
}
const bot = require('../.env.json')
if(typeof bot === 'undefined') {
	console.error('Invalid settings found in .env.json! Please see the README! Exiting..')
	return
}
const settings = typeof bot.settings !== 'undefined' ? bot.settings : settings_default
const allow = typeof bot.allow !== 'undefined' ? bot.allow : null

const irc = require('./lib/irc.js')
const client = new irc.Client(bot.network, bot.nick, {
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
				client.join(bot.channels[i], () => {
					console.log('joined ' + bot.channels[i])
				})
			}
		}
	}
})
client.addListener('message', function (from, to, message) {
	if(settings.debug){
		console.log(JSON.stringify(['message',from,to,message]))
	}
})
client.addListener('pm', function (from, message) {
	if(settings.debug){
		console.log(JSON.stringify(['pm',from,null,message]))
	}
})
client.addListener('message#tyriontesting', function (from, message) {
	if(settings.debug){
		console.log(JSON.stringify(['message#tyriontesting',from,null,message]))
	}
})

