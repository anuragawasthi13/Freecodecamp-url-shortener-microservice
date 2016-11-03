var mongoose = require("mongoose");

var Url_Schema = new mongoose.Schema({
	url:String,
	short_url: String
});

var Url = module.exports = mongoose.model("Url",Url_Schema);