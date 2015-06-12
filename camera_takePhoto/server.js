var express = require('express');
var app = express();
var http = require('http').Server(app);

app.use(express.static('public'));

http.listen(8000, function() {
	console.log('listen on *:8000');
});

