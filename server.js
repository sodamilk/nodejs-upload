var express = require('express'),
    photo = require('./routes/photo');
 
var app = express();
 
app.configure(function () {
    app.use(express.logger('dev'));     /* 'default', 'short', 'tiny', 'dev' */
    app.use(express.bodyParser({
    	uploadDir:'./tmp'
    }));
	app.use(express.json());
	app.use('/', express.static(__dirname + '/public'));
});

app.get('/photos/list',photo.listAll);
app.get('/photos/list/:id/detail',photo.listByID);
app.post('/photo/upload',photo.upload);
 
app.listen(3000);
console.log('Listening on port 3000...');