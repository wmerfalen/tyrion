let irc = require('slate-irc');
let sasl = require('slate-irc-sasl');
let tls = require('tls');
let fs = require('fs');
 
// setup options here. 
let self = {
  host: "irc.libera.chat",
  port: "6697",
  nick: '',
  user: '',
	pass: '',
  key: '', 
  cert: ''
};
 
let stream = tls.connect({
  host: self.host,
  port: self.port,
  //key: fs.readFileSync(require("path").resolve(__dirname, self.key)),
  //cert: fs.readFileSync(require("path").resolve(__dirname, self.cert))
}, function() {
        
  let client = irc(stream);
  client.use(sasl());
 
  client.write("CAP LS");
  client.nick(self.nick);
  client.user(self.user, self.user);
  client.cap_req("sasl");
  client.authenticate("PLAIN");
  client.authenticate64(self.user, self.pass);
  client.cap_end();
  client.setMaxListeners(0);
 
  client.join('#tyriontesting');
  client.names('#tyriontesting', function(err, names){
  console.log(names);
  })     
})
 
