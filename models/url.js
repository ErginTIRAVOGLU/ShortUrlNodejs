const mongoose = require('mongoose');
const timestamp = require('mongoose-timestamp');
const urlSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId, 
    urlCode : String,
    shortUrl : String,
    longUrl : String,
    date: {type:String, default: Date.now},
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
});
urlSchema.plugin(timestamp);
urlSchema.set('timestamps', true);
const Url = module.exports = mongoose.model('Url',urlSchema);