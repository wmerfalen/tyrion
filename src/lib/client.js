
const settings_default = {
	debug_notice: false,
	debug: false,
	testing: false
}
const bot = require('../../.env.json')
if(typeof bot === 'undefined') {
	console.error('Invalid settings found in .env.json! Please see the README! Exiting..')
	process.abort()
	return
}
const settings = typeof bot.settings !== 'undefined' ? bot.settings : settings_default
if(typeof bot.allow === 'undefined'){
	console.error('You must specify a bot.allow array for the purpose of white-listing!')
	process.abort()
	return
}
const allow = typeof bot.allow !== 'undefined' ? bot.allow : null
const channels = typeof bot.channels !== 'undefined' ? bot.channels : '*'

const irc = require('./irc.js')
let client = new irc.Client(bot.network, bot.nick, {
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

const url = require('./url.js')
const has_url = (msg) => {
	return url.has_url(msg)
}
const fetch_from_message = (msg,callback) => {
	url.fetch_from_message(msg, (response) => {
		if(response.ok && response.status_code == 200){
			response['summary'] = url.summarize(response.body)
			callback(response)
		}
	})
}
const allowed = (user_name, to_channel) => {
	return allow.indexOf(user_name) !== -1 && channels.indexOf(to_channel) !== -1
}

const event_handlers = {
	joined_list: [],
	joined: (channel) => {
		if(!channel){
			event_handlers.warn('Null channel passed to joined')
			return
		}
		if(typeof channel.args !== 'undefined'){
			event_handlers.joined_list.push({
				chan: channel.args[0],
				time: Date.now()
			})
		}else{
			event_handlers.joined_list.push({
				chan: channel,
				time: Date.now()
			})
		}
		if(settings.testing || settings.debug){
			console.log(event_handlers.joined_list)
		}
	},
	post_auth_notice: (from, to, message) => {
		if(settings.debug || settings.debug_notice){
				console.log(from + ' => ' + to + ': ' + message)
		}
	},
	notice: (from, to, message) => {
		if(!('authenticated' in this)){
			this.authenticated = false
		}
		if(settings.debug || settings.debug_notice){
			console.log(from + ' => ' + to + ': ' + message)
			if(from !== undefined && from.match(/^NickServ$/)){
				console.log('NOTICE from NickServ: ',to,',',message)
			}
		}
		if(from !== undefined && from.match(/^NickServ$/) && to !== undefined && to === bot.nick){
			if(message.match(/^You are now identified for/)){
				if(settings.testing){
					client.join('#tyriontesting', (user_name,command_info) => {
						event_handlers.joined(command_info)
					})
				}else{
					for(let i=0; i < bot.channels.length; i++){
						client.join(bot.channels[i], () => {
							event_handlers.joined(bot.channels[i])
						})
					}
				}
				this.authenticated = true
			}
		}
		if(this.authenticated){
			console.log('Authenticated successfully. Switching NOTICE event handler...')
			client.removeListener('notice',event_handlers.notice)
			client.addListener('notice', event_handlers.post_auth_notice)
			console.log('NOTICE event handler switched.')
		}
	},
	message: (from, to, in_message) => {
		if(settings.debug){
			console.log(JSON.stringify(['message',from,to,in_message]))
		}
		if(to && allowed(from,to) && has_url(in_message)){
			if(settings.debug){
				console.log('Allowed user has url: ',[from,to,in_message])
			}
			fetch_from_message(in_message, (response) => {
				if(settings.debug){
					console.log(response)
				}
				if(response.ok && response.status_code === 200){
					if(response.summary === null){
						return
					}
					client.say(to,response.summary)
				}
			})
		}
	},
	pm: (from, to, message) => {
		if(settings.debug){
			console.log(JSON.stringify(['pm',from,to,message]))
		}
	},
}

client.addListener('notice', event_handlers.notice)
client.addListener('message', event_handlers.message)
client.addListener('pm', event_handlers.pm)
if(settings.testing){
	client.addListener('message#tyriontesting', (from, message) => {
		if(allowed(from,'#tyriontesting')){
			console.log(JSON.stringify(['message#tyriontesting',from,null,message]))
		}
	})
}

exports.client = client
