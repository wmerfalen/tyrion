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

const tests = {
	run: (){
		const test_entire_message_is_url = () => {
			const assert = require('assert').strict
			const tests = [
				[1,'https://google.com'],
				[0,'kldjfoj19i04joa90seuje.osijerio3ujkhgn--34'],
				[0,'ftp://ftp.google.com/forge/bs'],
				[1,'https://nodejs.org/dist/latest-v14.x/docs/api/assert.html'],
				[0,'ssh://git@github.com/wmerfalen/slenderize'],
			]

			const pass = (should_pass, in_url) => {
				this.log('test_entire_message_is_url',should_pass,in_url)
				if(should_pass){
					assert(url.parse(in_url).protocol == 'https:')
				}else{
					assert(url.parse(in_url).protocol != 'https:')
				}
			}
			tests.forEach((element) => {
				pass(element[0],element[1])
			})

		}

		const test_url_in_message = () => {
			const assert = require('assert').strict
			const tests = [
				[1,'Hey, you guys should use this search engine: https://bing.com ... NOTTTT'],
				[0,'kldjfoj19i04joa90seuje.osijerio3ujkhgn--34 this is a bunch of rubbish'],
				[0,'ftp://ftp.google.com/forge/bs you really shouldnt be using this ftp site'],
				[1,'yeah so if you want to check out some notes on nodejs, check this:https://nodejs.org/dist/latest-v14.x/docs/api/assert.html'],
				[0,'star this repo pls: ssh://git@github.com/wmerfalen/slenderize'],
			]

			const pass = (should_pass, in_url) => {
				this.log('test_url_in_message',should_pass,in_url)
				if(should_pass){
					assert(extract_url(in_url).protocol === 'https:')
				}else{
					assert(extract_url(in_url).protocol === null)
				}
			}
			tests.forEach((element) => {
				pass(element[0],element[1])
			})

		}

		test_entire_message_is_url()
		test_url_in_message()
	}/** end run function */
}

tests.run()
