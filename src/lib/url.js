/**
 * file: url.js
 * description: finds and parses URL strings from within a string buffer.
 * author: William Merfalen (wmerfalen@gmail.com)
 */

const url = require('url')

const test = () => {
	const assert = require('assert').strict
	const tests = [
		[1,'https://google.com'],
		[0,'kldjfoj19i04joa90seuje.osijerio3ujkhgn--34'],
		[0,'ftp://ftp.google.com/forge/bs'],
		[1,'https://nodejs.org/dist/latest-v14.x/docs/api/assert.html'],
		[0,'ssh://git@github.com/wmerfalen/slenderize'],
	]

	const pass = (should_pass, in_url) => {
		if(should_pass){
			assert(url.parse(in_url).protocol == 'https:')
		}
	}
	tests.forEach((element) => {
		pass(element[0],element[1])
	})

}

test()
