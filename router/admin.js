const express = require('express')
let router = express.Router()

//markdown 轉HTML
let showdown = require('showdown')
let converter = new showdown.Converter()

// 大頭照儲存
const multer = require('multer')

// 密碼加密
let md5 = require('blueimp-md5')

let User = require('../models/user', { useMongoClient: true })
let Comment = require('../models/comment.js', { useMongoClient: true })
let Reply = require('../models/reply.js', { useMongoClient: true })

let trans_time = require('../public/js/transTime')


//設定大頭照儲存
var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'public/img/')
    },
    filename: function(req, file, cb) {
        cb(null, req.session.user._id + '.jpg')
    }
})
var upload = multer({ storage: storage })
    // var upload = multer({ dest: 'public/img/' });



//渲染管理文章
router.get('/admin', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/')
    }
    let user = req.session.user
    var total_reply = 0
    Comment.find({
            issuer: user._id
        })
        .then((commentList) => {
            return new Promise((res) => {
                for (let i = 0; i < commentList.length; i++) {
                    Reply.find({
                            which_comment: commentList[i]._id
                        })
                        .then((reply) => {
                            commentList[i].reply = reply.length
                            total_reply += reply.length
                            if (i === commentList.length - 1) {
                                res(commentList)
                            }
                        })
                }
            })
        })
        .then((final_commentList) => {
            let total_seen = 0;
            let total_good = 0
            final_commentList.forEach(item => {
                total_seen += item.seen
                total_good += item.good
            })
            res.render('settings/admin.html', {
                user: user,
                commentList: final_commentList,
                total_seen: total_seen,
                total_good: total_good,
                where: req.route.path,
                total_reply: total_reply
            })
        })
})




//渲染個人管理區
router.get('/profile', function(req, res) {
    if (!req.session.user) {
        return res.redirect('/')
    }
    User.findOne({
            _id: req.session.user._id
        })
        .then((user) => {
            res.render('settings/profile.html', {
                user: user,
                where: req.route.path
            })
        })
})



/*
 * -------START-編輯個人資訊的Ajax----------------
 */

router.post('/updateAbout', function(req, res) {
    let body = req.body
    User.updateOne({
        _id: req.session.user._id
    }, {
        bio: body.bio
    }, (err, data) => {
        if (err) {
            return res.status(500).json({
                err_code: 500,
                message: 'Internal error'
            })
        }
        res.json({
            err_code: 0,
            message: 'OK'
        })
    })

})

router.post('/updateProfile', function(req, res) {
    let body = req.body
    User.updateOne({
        _id: req.session.user._id
    }, {
        username: body.username,
        email: body.email,
        gender: body.gender,
        otherEmail: body.otherEmail
    }, (err, data) => {
        if (err) {
            return res.status(500).json({
                err_code: 500,
                message: 'Internal error'
            })
        }
        res.json({
            err_code: 0,
            message: 'OK'
        })
    })

})


router.post('/updateGithub', function(req, res) {
    let body = req.body
    User.updateOne({
        _id: req.session.user._id
    }, {
        github: body.data
    }, (err, data) => {
        if (err) {
            return res.status(500).json({
                err_code: 500,
                message: 'Internal error'
            })
        }
        res.json({
            err_code: 0,
            message: 'OK'
        })
    })
})

router.post('/updateFb', function(req, res) {
    let body = req.body
    User.updateOne({
        _id: req.session.user._id
    }, {
        fb: body.data
    }, (err, data) => {
        if (err) {
            return res.status(500).json({
                err_code: 500,
                message: 'Internal error'
            })
        }
        res.json({
            err_code: 0,
            message: 'OK'
        })
    })
})

router.post('/updateTwitter', function(req, res) {
    let body = req.body
    User.updateOne({
        _id: req.session.user._id
    }, {
        twitter: body.data
    }, (err, data) => {
        if (err) {
            return res.status(500).json({
                err_code: 500,
                message: 'Internal error'
            })
        }
        res.json({
            err_code: 0,
            message: 'OK'
        })
    })
})

router.post('/updatePhone', function(req, res) {
    let body = req.body
    User.updateOne({
        _id: req.session.user._id
    }, {
        phone: String(body.data)
    }, (err, data) => {
        if (err) {
            return res.status(500).json({
                err_code: 500,
                message: 'Internal error'
            })
        }
        res.json({
            err_code: 0,
            message: 'OK'
        })
    })
})

/*
 * -------END-編輯個人資訊的Ajax----------------
 */

//更新大頭照
router.post('/updateImg', upload.single('upload_img'), function(req, res, next) {
    if (!req.session.user) {
        return res.redirect('/')
    }
    User.updateOne({ _id: req.session.user._id }, {
        headimg: req.file.destination + req.file.filename
    }).then(() => {
        req.session.user.headimg = req.file.destination + req.file.filename
        res.redirect('/profile')
    })
})













module.exports = router