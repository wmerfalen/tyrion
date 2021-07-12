/**
 * file: url.js
 * description: finds and parses URL strings from within a string buffer.
 * author: William Merfalen (wmerfalen@gmail.com)
 */

const url = require('url')

exports.extract_url = (msg) => {
	const matched = msg.match(/(https?:\/\/(www\.)?[a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9\(\)]{1,6}\b([-a-zA-Z0-9\(\)@:%_\+.~#?&\/\/=]*))/g)
	return url.parse(Array.isArray(matched) && 0 in matched ? matched[0] : '')
}
