const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const validUrl = require('valid-url');
const shortid = require('shortid');

const Url =require('../models/url');

router.post('/shorten',
    
    [check('longUrl', 'Hatalı Url').isURL()],
    isLoggedIn,
    async (req, res) => {
        const { longUrl } = req.body;
        const baseUrl = "http://localhost:4000";
        const result = validationResult(req);
        if(!result.isEmpty())
        {
            res.render('index',{
                errors:result.array()
            });
        }
        else
        {
            if(!validUrl.isUri(baseUrl))
            {
                return res.status(401).json('Invalid base url');        
            }

            const urlCode = shortid.generate();

            if(validUrl.isUri(longUrl))
            {
                try {
                    let url = await Url.findOne({ longUrl,user:req.user._id });

                    if(url)
                    {
                        res.redirect(`/user/dashboard/${url.urlCode}`);
                    }
                    else
                    {
                        const shortUrl = `${baseUrl}/${urlCode}`;

                        url = new Url({
                            _id : new mongoose.Types.ObjectId(),
                            longUrl,
                            shortUrl,
                            urlCode,
                            date: new Date(),
                            user:req.user
                        });

                        await url.save();
                        res.redirect(`/user/dashboard/${url.urlCode}`);
                        //res.json(url); /api/url/shorten
                    }
                } catch (error) {
                    console.log(error);
                    res.status(500).json(`Server Errror ${error}`);
                }
            }
            else
            {
                res.status(401).json('Long url error');
            }
        }
});

module.exports = router;

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