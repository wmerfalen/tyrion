/**
 * file: url.js
 * description: finds and parses URL strings from within a string buffer.
 * author: William Merfalen (wmerfalen@gmail.com)
 */

const url = require('url')

const extract_url = (msg) => {
	const matched = msg.match(/(https?:\/\/(www\.)?[a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9\(\)]{1,6}\b([-a-zA-Z0-9\(\)@:%_\+.~#?&\/\/=]*))/g)
	return url.parse(Array.isArray(matched) && 0 in matched ? matched[0] : '')
}

const has_url = (msg) => {
	return extract_url(msg).protocol === 'https:'
}

const fetch_from_message = (msg, callback) => {
	const href = extract_url(msg)
	const https = require('https')

/**
pe ".help" for more information.
> u = require('url'); u.parse('https://google.com/foobar.php?a=1')
Url {
  protocol: 'https:',
  slashes: true,
  auth: null,
  host: 'google.com',
  port: null,
  hostname: 'google.com',
  hash: null,
  search: '?a=1',
  query: 'a=1',
  pathname: '/foobar.php',
  path: '/foobar.php?a=1',
  href: 'https://google.com/foobar.php?a=1'
}
>
*/
	const options = {
		hostname: href.hostname,
		port: href.port !== null ? href.port : 443,
		path: href.path,
		method: 'GET'
	}

	const req = https.request(options, (res) => {
		console.log('statusCode:', res.statusCode)
		console.log('headers:', res.headers)

		let buffer = ''
		res.on('data', (d) => {
			buffer += d
			process.stdout.write(d)
		})
		res.on('end', () => {
			callback({ok: true,response_object: res,body: buffer,status_code: res.statusCode,headers: res.headers})
		})
	})

	req.on('error', (e) => {
		callback({ok: false,response_object: null,error: e})
		console.error(e)
	})
	req.end()
}

const summarize = (html) => {
	const matched = html.match(/<title>([^<]+)<\/title>/i)
	if(matched && matched[1]){
		return matched[1]
	}
	return null
}

exports.extract_url = extract_url
exports.has_url = has_url
exports.fetch_from_message = fetch_from_message
exports.summarize = summarize

