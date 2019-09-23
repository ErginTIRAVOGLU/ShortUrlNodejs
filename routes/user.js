const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const var_dump = require('var_dump');
const User = require('../models/user');
const Url = require('../models/url');
const moment = require('moment')
const mongoose = require('mongoose');
const Handlebars = require("handlebars");
const MomentHandler = require("handlebars.moment");

MomentHandler.registerHelpers(Handlebars);
Handlebars.registerHelper('formatDate', function (date, format) {
    var mmnt = moment(new Date(date));
    return mmnt.format(format);
});

Handlebars.registerHelper("inc", function(value, options)
{
    return parseInt(value) + 1;
});

moment.locale('tr');
router.get('/register', (req,res) => {
    res.render('user/register');
});

router.post('/register', [
        check('eposta', 'Hatalı Eposta').isEmail(),
        check('sifre', 'Şifre en az 6 karakter olmalı.').isLength({ min: 6 }),
        check('sifre2', 'Şifre(Tekrar) alanları uyuşmuyor.').custom((value, { req }) => value === req.body.sifre)

    ] , (req,res) => {
    const eposta = req.body.eposta;
    const sifre = req.body.sifre;
    const sifre2 = req.body.sifre2;

    

    const result = validationResult(req);
    //console.log(result.array());
    //var_dump(result.array());
    if(!result.isEmpty()) 
    {
        res.render('user/register',{
            errors:result.array()
        });
    }
    else
    {
        var newUser = new User({
            email:eposta,
            password:sifre
        });
        User.createUser(newUser, (err,user) => {
            if(err)
            {
                throw(err);
            }            
        });

        req.flash('success_message','Yeni kullanıcı eklendi.')
        res.redirect('/user/login');
    }
});

router.get('/login', (req,res) =>{
    res.render('user/login');
});

passport.use(new LocalStrategy({
    username: 'email',
    password: 'password'
  }, 
    (username, password, done) => {
    
        User.getUserByUsername(username, (err, user) => {
            if (err) 
            { 
                return done(err); 
            }
            if (!user) 
            {
                return done(null, false, { message: 'Hatalı kullanıcı bilgileri.' });
            }

            User.comparePassword(password, user.password, (err,isMatch) => {        
                if (err) 
                { 
                    return done(err); 
                }
                if(isMatch)
                {
                    
                    return done(null, user);                    
                }
                else
                {
                    return done(null, false, { message: 'Hatalı kullanıcı bilgileri' });        
                }
                
            });
        });
    })
   
);

passport.serializeUser(function(user, done) {
   
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    
    User.getUserById(id, function(err, user) {
        done(err, user);
    });
});

router.post('/login',
  passport.authenticate('local', {
      successRedirect:'/',
      failureRedirect:'/user/login',
      failureFlash : true,
      session: true 
    }), (req, res) => {
      
    // If this function gets called, authentication was successful.
    // `req.user` contains the authenticated user.
    //res.redirect('/users/' + req.user.username);
    res.redirect('/');
  });

router.get('/logout', isLoggedIn , (req,res) => {
    req.logout();    
    res.redirect('/');
});
router.get('/dashboard', isLoggedIn, async (req,res) => {
     
    const urls = await Url
            .find({user: req.user._id });
            console.log(urls);
    
    await res.render('user/dashboard', {urls:urls});
});
router.get('/dashboard/:shortUrl', isLoggedIn , async (req,res) => {
    const url = await Url
            .findOne({ urlCode: req.params.shortUrl,user: req.user._id });
            console.log(url);
    url.date = moment(new Date(url.date)).fromNow();
    await res.render('user/urldetail', {url:url}); 
}); 

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
    {
        return next();
    }
    else
    {     
        res.redirect('/user/login');
    }
     
}

module.exports = router;

