const express = require('express');
const router = express.Router();
const Url = require('../models/url');

router.get('/', (req,res) => {
    
        res.render('index');
     
}); 

router.get('/:shortUrl', async(req,res) => {
    try {
        const url = await Url
            .findOne({ urlCode: req.params.shortUrl });
            if(url)
            {
                return res.redirect(url.longUrl);
            }
            else
            {
                return res.status(404).json('No url found');                
            }

    } catch (error) {
        console.log(error);
        res.status(500).json(`Server error : ${error}`);
    }
});
module.exports = router;