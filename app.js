var express = require("express");

var mongoose = require("mongoose");

var app = express();

var port = process.env.PORT || 3000;

mongoose.connect(process.env.MONGOLAB_URI);

var Url = require("./models/Url");

var IDs = require("./models/IDs");

var getStringFromUrl = function(url) {
	return url.substring(1, url.length).replace(/%20/g, " ");
}

var checkIfValidUrl = function(url) {
	var expression = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;
	var regex = new RegExp(expression);
	if (url.match(regex)) {
		return true;
	} else {
		return false;
	}
}

var genrateID = function(cb) {
	var found = true;
	IDs.findOne({}, function(err, data) {
		if (!err) {
			if (data) {
				var ID_array = data.id_array || [];
				while (found) {
					var rand_num = Math.floor(Math.random() * (9000)) + 1000;
					if (ID_array.indexOf(rand_num) == -1) {
						found = false;
						data.id_array = ID_array.push(rand_num);
						data.save();
						cb(rand_num);
					}
				}
			} else {
				var id = new IDs();
				id.id_array = [];
				var rand_num = Math.floor(Math.random() * (9000)) + 1000;
				id.id_array.push(rand_num);
				id.save();
				cb(rand_num);
			}
		} else {
			console.log(err);
			cb(Math.floor(Math.random() * (9000)) + 1000);
		}
	})
}

app.get("/", function(req, res) {
	res.status(200).json({
		"message": "Shorten 'em url. Don't wait, do it now"
	})
})


app.get("*", function(req, res) {
	var url = getStringFromUrl(req.originalUrl);
	console.log("url is " + url);
	if (!isNaN(url)) {
		console.log("Url is a short url");
		Url.findOne({
			short_url: req.protocol + '://' + req.get('host') + '/' + url
		}).exec(function(err, data) {
			if (!err) {
				if (data) {
					console.log("Short url found.Redirecting user to real location -- >" + data.url);
					res.redirect(data.url);
				} else {
					console.log("short url does not exist");
					res.status(200).json({
						"error": "there is no such url"
					})
				}
			}
		})
	} else {
		console.log("request for making a short url");
		if (checkIfValidUrl(url)) {
			console.log("valid url");
			Url.findOne({
				url: url
			}).exec(function(err, data) {
				if (!err) {
					if (data) {
						console.log("fond this url", data);
						res.status(200).json({
							"original_url": data.url,
							"short_url": data.short_url
						});
					} else {
						console.log("url not found.making new url");
						var new_url = new Url();
						new_url.url = url;
						genrateID(function(id) {
							console.log("generaed is " + id);
							new_url.short_url = req.protocol + '://' + req.get('host') + '/' + id.toString();
							console.log(new_url);
							new_url.save(function(err) {
								if (err) {
									console.log("error occured", err);
								} else {
									console.log(url + " saved successfully");
								}
							});
							res.status(200).json({
								"original_url": new_url.url,
								"short_url": new_url.short_url
							});
						})
					}
				} else {
					console.log("error occured finding url");
					res.status(200).json({
						"error": "something went wrong"
					})
				}
			})

		} else {
			console.log("invalid url");
			res.status(200).json({
				"error": "Url is not in valid form."
			});
		}
	}
});

app.listen(port, function() {
	console.log("Server is running on " + port);
});