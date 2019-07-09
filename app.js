// SCSCSCSCSCSC cards

const express = require('express');
const app = express();
const http = require('http').Server(app);
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
// Connect to Mongoose

var uri = ''

mongoose.connect(uri, {
useNewUrlParser:true
});

var conn = mongoose.connection;
const nodemailer = require('nodemailer');
var fileupload = require("express-fileupload");
var Grid = require('gridfs-stream');
Grid.mongo = mongoose.mongo;
app.use(bodyParser.json());
app.use(fileupload());
app.use(function (req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	console.log(req.body);
	next();
});


users = require('./models/users');


conn.once('open', function () {
	var gfs = Grid(conn.db);
	// all set!

    app.get('/devtools',(req,res)=>{
        console.log('DevTools Accessesed by ' + req.ip)
    })


	var transporter = nodemailer.createTransport({
		service: 'gmail',
		auth: {
			user: 'flashcards.chinmaykh@gmail.com',
			pass: 'flash_cards'
		}
	});


	// FILE UPLOADS
	function cmon(req, res) {
		console.log(req.body.usrnam)
		var part = req.files.file;
		var writeStream = gfs.createWriteStream({
			filename: part.name,
			mode: 'w',
			content_type: part.mimetype,
			metadata: {
				"usrnam": req.body.usrnam,
				"org": req.body.org
			}
		});
		writeStream.on('close', function (response) {
			return res.status(200).send({
				message: 'Success',
				fileUploadId: response._id
			});
		});
		writeStream.write(part.data);
		writeStream.end();
	}

    // FILE DOWNLOAD GATEWAY
	function getFiles(req, res) {

		var readstream = gfs.createReadStream({
			_id: req
		});
		console.log('It was found, I think')
		readstream.pipe(res);

	}

    // FILE QUERY PATHWAY

	function findFiles(req, res, pram) {

		// console.log("filename to download "+req.params);
		console.log(pram);
		gfs.files.find({ filename: pram }).toArray(function (err, files) {
			if (err) {
				return res.status(400).send(err);
			}
			else if (!files.length === 0) {
				return res.status(400).send({
					message: 'File not found'
				});
			}
			console.log(files);

			res.json(files);
		});


	}

    // FILE UPLOAD URL
	app.post('/upload', (req, res) => {
		req.files.file.name = req.body.class;
		console.log(req);
		cmon(req, res);
	});

    // FILE DOWNLOAD URL
	app.get('/files/:id', (req, res) => {
		console.log(req.params.id);
		getFiles(req.params.id, res);

	});

    // FILE QUERY URL
	app.post('/findMyFiles/', (req, res) => {
		var param = req.body.param;
		console.log(param);
		findFiles(req, res, param);
	});

	//----- Feedback -----
	app.get('/chin/feedbacks', (req, res) => {
		Feedbak.getFeedBacks((err, fdb) => {
			if (err) { throw err; }
			res.json(fdb);
		});
	});

	app.post('/chin/feedbacks', (req, res) => {
		var fbbbb = req.body;

		var mailOptions = {
			from: 'svnpsrnr@gmail.com',
			to: ['chinmayharitas@gmail.com','kiranbodipati@gmail.com'],
			subject: 'Feedback !',
			text: JSON.stringify(fbbbb)
		};

		transporter.sendMail(mailOptions, function (error, info) {

			if (error) {
				console.log(error);
				console.log("Check for security permission from google");
			} else {
				console.log('Email sent: ' + info.response);
			}
		});


		Feedbak.sendFeedBack(fbbbb, (err, fbbbb) => {
			if (err) { throw err; }
			res.json('Feedback has been sent to developer');
		});


	});

	
	//--------------------------------------------------GROUPS--------------------------------------------------------------------------------------

	app.get('/list/users', (req, res) => {
		Group.getGroups((err, creds) => {
			if (err) {
				throw err;
			}
			res.json(creds);
		});
	});

	app.get('/api/groups/:_id', (req, res) => {
		Group.getGroupById(req.params._id, (err, cred) => {					//BASICALLY A LOOP, IF NO MATCH, ERR
			if (err) {
				throw err;
			}
			res.json(cred);
		})
	});

	app.get('/groups/:name', (req, res) => {
		Group.getGroupByName(req.params.name, (err, cred) => {					//BASICALLY A LOOP, IF NO MATCH, ERR
			if (err) {
				throw err;
			}
			res.json(cred);
		})
	});

	app.post('/add/groups', (req, res) => {
		var cred = req.body;
		Group.addGroup(cred, (err, cred) => {				 	//BASICALLY A LOOP, IF NO MATCH, ERR
			if (err) {
				throw err;
			}
			res.json(cred);
		})
	});

	app.post('/api/groups/:_id', (req, res) => {
		var id = req.body._id;
		var tt = req.body.tt;
		Group.updateGroup(id, tt, {}, (err, cred) => {					//BASICALLY A LOOP, IF NO MATCH, ERR
			if (err) {
				throw err;
			}
			res.json(cred);
		})
	});


	app.put('/groups/:name', (req, res) => {
		var name = req.params.name;
		var tt = req.body;
		Group.addMessage(name, tt, {}, (err, cred) => {					//BASICALLY A LOOP, IF NO MATCH, ERR
			if (err) {
				throw err;
			}
			res.json(cred);
		})
	});

	app.put('/groups/links/:name', (req, res) => {
		var name = req.params.name;
		var tt = req.body;
		Group.addLink(name, tt, {}, (err, cred) => {					//BASICALLY A LOOP, IF NO MATCH, ERR
			if (err) {
				throw err;
			}
			res.json(cred);
		})
	});

	//--------------------------------------------------SOCKET.IO--FOR-MESSAGING------------------
	var a  = 0 ;
	io.on('connection',(socket)=>{
		a = a+1;
		console.log( a + 'User(s) Connected ! ');
		socket.on('disconnect', function(){
			console.log('User disconnected');
		});
	})

	//--------------------------------------------------SERVER--------------------------------------------------------------------------------------

	app.listen(8989);
	console.log('Running on port 8989...');

})