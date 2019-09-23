const mongoose = require('mongoose');
const timestamp = require('mongoose-timestamp');

const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId, 
    email : {
        type:String,
        required: true,
    },
    password : {
        type:String,
        required: true,
    }    
});
userSchema.plugin(timestamp);
userSchema.set('timestamps', true);
const User = module.exports = mongoose.model('User',userSchema);

module.exports.createUser = (newUser, callback) =>{
    bcrypt.genSalt(10, (err,salt) => {
        bcrypt.hash(newUser.password,salt,(err,hash) => {
            newUser._id = new mongoose.Types.ObjectId(),
            newUser.password = hash;
            newUser.save(callback);
        });
    });
}

module.exports.getUserById = (id, callback) => {
    
    User.findById(id, callback);
}

module.exports.getUserByUsername = (username, callback) => {
    
    User.findOne({email:username}, callback);
}

module.exports.comparePassword = (candidatePassword, hash, callback) => {
    bcrypt.compare(candidatePassword, hash, (err,isMatch) => {
        
        if(err)
        {
            throw err;
        } 
        callback(null,isMatch);
    });
}
