var mongo = require('mongodb'),
	fs = require('fs')
 
var Server = mongo.Server,
    Db = mongo.Db,
    BSON = mongo.BSONPure;
 
var server = new Server('localhost', 27017, {auto_reconnect: true});
db = new Db('photos', server);
db.open(function(err, db) {
    if(!err) {
        //console.log("Connected to 'photos' database");
        db.collection('photos', {strict:true}, function(err, collection) {
            if (err) {
                //console.log("The 'wines' collection doesn't exist. Creating it with sample data...");
                //populateDB();
            }
        });
    }
});
 
exports.listByID = function(req, res) {
    var id = req.params.id;
    console.log('Retrieving wine: ' + id);
    db.collection('photos', function(err, collection) {
        collection.findOne({'_id':new BSON.ObjectID(id)}, function(err, item) {
            res.send(item);
        });
    });
};
 
exports.listAll = function(req, res) {
    db.collection('photos', function(err, collection) {
        collection.find().toArray(function(err, items) {
            res.send(items);
        });
    });
};

exports.upload = function(req, res) {
	var fileInfo = req.files.files[0];
	console.log('file_info?',fileInfo);
	var tmpPath = fileInfo.path;
    var serverPath = __dirname + '/../public/images/' + fileInfo.name;
	var profile = {
		name: fileInfo.name,
		size: fileInfo.size,
		type: fileInfo.type
	}
	
	fs.rename(tmpPath, serverPath, function(error) {
		if(error) {
	   		res.send({
               error: 'Ah crap! Something bad happened'
	   		});
           return;
		}
		// Insert database record
	    db.collection('photos', function(err, collection) {
			//console.log('data_insert?',profile);
			collection.insert(profile, {safe:true}, function(err, result) {
	            if (err) {
	                //res.send({'error':'An error has occurred'});
	            } else {
	                console.log('Success: ' + JSON.stringify(result[0]));
	                //res.send(result[0]);
	            }
	        });
	    });	
		res.send(profile);
   	});	
}


 

 /*
exports.updateWine = function(req, res) {
    var id = req.params.id;
    var wine = req.body;
    console.log('Updating wine: ' + id);
    console.log(JSON.stringify(wine));
    db.collection('wines', function(err, collection) {
        collection.update({'_id':new BSON.ObjectID(id)}, wine, {safe:true}, function(err, result) {
            if (err) {
                console.log('Error updating wine: ' + err);
                res.send({'error':'An error has occurred'});
            } else {
                console.log('' + result + ' document(s) updated');
                res.send(wine);
            }
        });
    });
}
 
exports.deleteWine = function(req, res) {
    var id = req.params.id;
    console.log('Deleting wine: ' + id);
    db.collection('wines', function(err, collection) {
        collection.remove({'_id':new BSON.ObjectID(id)}, {safe:true}, function(err, result) {
            if (err) {
                res.send({'error':'An error has occurred - ' + err});
            } else {
                console.log('' + result + ' document(s) deleted');
                res.send(req.body);
            }
        });
    });
}
 */
 