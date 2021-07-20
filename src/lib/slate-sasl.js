
let irc = require('slate-irc')
let sasl = require('slate-irc-sasl')
let tls = require('tls')
let fs = require('fs')
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
 
// setup options here. 
let self = {
  host: bot.network,
  port: bot.port,
  nick: bot.nick,
  user: bot.nick,
  pass: bot.password,
  key: 'ssl_key' in bot && bot.ssl_key !== null ? bot.ssl_key : null,
  cert: 'ssl_cert' in bot && bot.ssl_cert !== null && 'ssl_key' in bot && bot.ssl_key !== null ? bot.ssl_cert : null,
}
const config = {
  host: self.host,
  port: self.port,
}
if(self.key !== null && self.cert !== null){
  config.key = fs.readFileSync(require('path').resolve(__dirname, self.key))
  config.cert = fs.readFileSync(require('path').resolve(__dirname, self.cert))
}
let client = null

let stream = tls.connect(config, function() {
  client = irc(stream)
  client.use(sasl())
 
  client.write('CAP LS')
  client.nick(self.nick)
  client.user(self.user, self.user)
  client.cap_req('sasl')
  client.authenticate('PLAIN')
  client.authenticate64(self.user, self.pass)
  client.cap_end()
  client.setMaxListeners(0)

	client.on('message', event_handlers.message)
	client.on('notice', event_handlers.notice)
	client.on('end', event_handlers.end)
	client.on('close', event_handlers.close)
	client.on('error', event_handlers.error)

	for(let channel of bot.channels){
		client.join(channel)
	}
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
		/*
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
		*/
	},
	end: (obj) => {
		console.log(['end',obj])
	},
	close: (obj) => {
		console.log(['close',obj])
	},
	error: (obj) => {
		console.log(['error',obj])
	},
	message: (obj) => {
		const user = obj.from
		const channel = obj.to
		const in_message = obj.message

		if(settings.debug){
			console.log(JSON.stringify(['message',user,channel,in_message]))
			if(allowed(user,channel)){
				console.log(JSON.stringify(['message' + channel,user,channel,in_message]))
			}
		}

		if(channel && allowed(user,channel) && has_url(in_message)){
			if(settings.debug){
				console.log('Allowed user has url: ',[user,channel,in_message])
			}
			fetch_from_message(in_message, (response) => {
				if(settings.debug){
					console.log(response)
				}
				if(response.ok && response.status_code === 200){
					if(response.summary === null){
						return
					}
					client.send(channel,response.summary)
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
