var mongoose = require("mongoose");

var IDs_Schema = new mongoose.Schema({
	id_array:[]
});

var IDs = module.exports = mongoose.model("IDs",IDs_Schema);