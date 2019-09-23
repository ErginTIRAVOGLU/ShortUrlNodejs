const express = require('express');
const app = express();
const PORT = 4000;
const mongoose = require("mongoose");
const MongoURI = "mongodb+srv://shorturluser:hVZKcJhtDXOzcosX@shorturllink-lavoo.mongodb.net/shortlinkurl?connect=replicaSet&retryWrites=true&w=majority";
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const exphbs = require('express-handlebars');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const localStrategy = require('passport-local').Strategy;


const connectDB = async() => {
    try {
        await mongoose.connect(MongoURI,{
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('MongoDB connected.')
    } catch (error) {
        console.error(error.message);
        process.exit(1);
    }
}


app.use(express.json({extented: false}));


app.use(session({
    secret: 's3cr3t',
    saveUninitialized: true,
    resave: true
})); 

app.use(passport.initialize());
app.use(passport.session());

app.set('views', path.join(__dirname,'views'));
app.engine('handlebars', exphbs({ defaultLayout: 'layout'}));
app.set('view engine', 'handlebars');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended:false }));

app.use(flash());
app.use(function(req,res,next){
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    if(req.user)
    {
        res.locals.user = req.user.email;
    }
    next();
});

app.use(cookieParser());
app.use(express.static(path.join(__dirname,'public')));


app.use('/', require('./routes/index'));
app.use('/user', require('./routes/user'));
app.use('/api/url', require('./routes/url'));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
connectDB();