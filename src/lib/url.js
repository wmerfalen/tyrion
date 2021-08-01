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
	return ['http:','https:'].indexOf(extract_url(msg).protocol) !== -1
}


const fetch_headers_from_url = (url) => {
	const https = require('https')
	return new Promise((resolve, reject) => {
			https.get(url, (res) => {
			resolve(res.headers)
		}).on('error', reject)
	})
}

const impl_is_html = async (url) => {
	const ignore = [
		/^image\/.*$/,
	]
	let headers = await fetch_headers_from_url(url)
	if('content-type' in headers) {
		for(let pcre of ignore) {
			if(headers['content-type'].match(pcre)){
				return false
			}
		}
		return true
	}
	return false
}
async function is_html(url){
	const can_be_parsed = await impl_is_html(url)
	return can_be_parsed
}
const fetch_url = async (in_url) => {
	return new Promise((resolve, reject) => {
		let type = 'https'
		if(in_url.match(/^http:/i)){
			type = 'http'
		}
		const lib = require(type)
		const url = require('url')
		const href = url.parse(in_url)
			const options = {
				hostname: href.hostname,
				port: href.port !== null ? href.port : (type === 'http' ? 80 : 443),
				path: href.path,
				method: 'GET',
			}
		const trim_headers = (h) => {
			let save = {}
			if('location' in h){
				save.location = h.location
			}
			return save
		}

		const req = lib.request(options, (res) => {
			if(res.statusCode == 301 || res.statusCode == 302){
				reject({ok: false,'status': 'redirect', response: res})
				return
			}
			let buffer = ''
			let byte_max = 1024 * 1024
			let fetched = false
			let byte_ctr = 0
			res.on('data', (d) => {
				if(byte_ctr >= byte_max){
					return
				}
				buffer += d.toString()
				byte_ctr += d.size
			})
			res.on('end', () => {
				resolve({ok: true,body: Buffer(buffer).slice(0,byte_max).toString(),status_code: res.statusCode,headers: trim_headers(res.headers)})
			})
		})

		req.on('error', (e) => {
			reject({ok: false,status_code: 0,body: null,error: e})
		})
		req.end()
	})
}

const fetch_from_message = async (msg,callback) => {
	const href = extract_url(msg)
	await fetch_url(href.href)
		.then(callback)
		.catch(async (response) => {
			if(response['status'] === 'redirect' && 'location' in response['response'].headers){
				await fetch_url(
					response['response'].headers['location']
				).then(callback).catch(callback)
			}
		})
}

const minimal_html_escape = html => html.replace(/&amp;/,'&')

const summarize = (html) => {
	const matched = html.match(/<title>([^<]+)<\/title>/i)
	if(matched && matched[1]){
		return minimal_html_escape(matched[1])
	}
	return null
}

exports.extract_url = extract_url
exports.has_url = has_url
exports.fetch_from_message = fetch_from_message
exports.summarize = summarize

exports.fetch_headers_from_url = fetch_headers_from_url
exports.is_html = is_html
