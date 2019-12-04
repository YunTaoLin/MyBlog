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


//渲染發文頁面
router.get('/post', function(req, response) {
    //如果沒登入，跳到登入頁面
    if (!req.session.user) {
        return response.redirect('/login')
    }
    new Promise((res) => {
        Comment.find({ issuer: req.session.user._id })
            .then((commentList) => {
                res(commentList)
            })
    }).then((commentList) => {
        let seen = 0
        commentList.forEach(element => {
            seen += element.seen
        });
        return response.render('topic/post.html', {
            user: req.session.user,
            commentList: commentList,
            seen: seen
        })
    })

})

//處理發文請求
router.post('/post', function(req, res) {
    let body = req.body
    new Comment(body).save((err, data) => {
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

//處理更新文章請求
router.post('/updateArticle', function(req, res) {
    let body = req.body
    Comment.updateOne({
        _id: body.aticle_id,
        issuer: req.session.user._id
    }, {
        title: body.title,
        content: body.content,
        classify: body.classify,
        issue: body.issue,
        last_modified_time: Date.now()
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

//處理刪除文章
router.post('/delete', function(req, res) {
    let { password, id } = req.body
    if (md5(password) !== req.session.user.password) {
        return res.json({
            err_code: 1,
            message: 'password error'
        })
    }
    Comment.findByIdAndDelete(id, function(err) {
        if (err) {
            return res.json({
                err_code: 500,
                message: 'internet error'
            })
        }
        return res.json({
            err_code: 0,
            message: 'OK'
        })
    });


})











//渲染文章頁面
router.get('/article', function(req, res) {
    var ifLike = false
        //如果是在沒登入的狀態下，需要登入當前頁面，好讓使用者登入後可以跳轉
    if (!req.session.user) {
        req.session.nowURL = req._parsedOriginalUrl.path
    } else {
        // 判斷是否按過讚
        User.findById(req.session.user._id)
            .then((user) => {
                ifLike = user.like.find(item => item == req.query.id)
            })
    }
    //尋找文章資料
    Comment.findById(req.query.id)
        .then((article) => {
            //一次登入只會計算一次同一篇文章的觀看數
            if (!req.session.seen) {
                //紀錄看了那些文章(防止惡意刷點閱率)
                req.session.seen = []
            }
            if (!req.session.seen.find(e => e == req.query.id)) {
                Comment.updateOne({
                        _id: req.query.id
                    }, {
                        seen: article.seen + 1
                    })
                    .then(data => {
                        req.session.seen.push(req.query.id)
                    })
            }
            return new Promise((res, rej) => {
                //尋找文章作者資料
                User.findById(article.issuer)
                    .then((author) => { res({ article, author }) })
            })
        })
        .then(({ article, author }) => {
            let time = article.create_time
            let create_time = time.toLocaleString()
            article.theTime = create_time
            article.content = converter.makeHtml(article.content)
            return new Promise((res) => {
                //尋找文章作者的作品清單
                Comment.find({ issuer: author._id })
                    .then((commentList) => {
                        res({ article, author, commentList })
                    })
            })
        })
        .then(({ article, author, commentList }) => {
            res.render('topic/article.html', {
                user: req.session.user,
                article: article,
                author: author,
                commentList: commentList.reverse(),
                ifLike: ifLike
            })
        })
})


//渲染編輯頁面
router.get('/edit', function(req, response) {
    let user = req.session.user
    let article = req.query.article


    if (!req.session.user) {
        return response.redirect('/login')
    }
    new Promise((res) => {
            Comment.find({
                issuer: req.session.user._id
            }).then((commentList) => {
                res(commentList)
            })
        })
        .then((commentList) => {
            let seen = 0
            commentList.forEach(element => {
                seen += element.seen
            });
            return new Promise(res => {
                Comment.findOne({
                    issuer: user,
                    _id: article
                }).then(edit => {

                    res({ edit, commentList, seen })
                })
            })
        })
        .then(({ edit, commentList, seen }) => {
            return response.render('topic/edit.html', {
                user: req.session.user,
                commentList: commentList,
                seen: seen,
                edit: edit
            })
        })
})




//ajax取得留言列表

router.get('/reply', function(req, response) {
    let article_id = req.query.id
    new Promise(res => {
            //尋找留言清單
            Reply.find({
                    which_comment: article_id
                })
                .then((reply) => {
                    if (!reply[0]) {
                        return response.json({
                            err_code: 0,
                            replyList: []
                        })
                    }
                    res(reply)
                })
        })
        .then((reply) => {
            let replyList = []

            function myRender(i) {
                User.findById(reply[i].author)
                    .then(theAuthor => {
                        replyList.push(reply[i])
                        replyList[i]._doc.username = theAuthor.username
                        replyList[i]._doc.headimg = theAuthor.headimg
                        replyList[i]._doc.create_time = replyList[i].create_time.toLocaleString()
                        if (i + 1 === reply.length) {
                            return response.json({
                                err_code: 0,
                                replyList: replyList
                            })
                        }
                        myRender(i + 1)
                    })
            }
            myRender(0)
        })
})

//ajax處理留言請求

router.post('/reply', function(req, res) {
    let body = req.body
    new Reply(body).save((err, reply) => {
        if (err) {
            return res.status(500).json({
                err_code: 500,
                message: 'Internal error'
            })
        }
        //留言儲存成功
        res.json({
            err_code: 0,
            reply: reply
        })
    })
})

//ajax處理刪除留言
router.delete('/reply', (req, res) => {
    Reply.deleteOne({
        _id: req.query.id,
        author: req.session.user._id
    }, function(err) {
        if (err) {
            res.json({
                err_code: 500,
                message: 'internet error'
            })
        }
        res.json({
            err_code: 0,
            message: 'delete success'
        })
    })
})



//按讚相關
router.get('/like', function(req, response) {
    if (!req.session.user) {
        return response.status(200).json({
            err_code: 503,
            message: 'no login'
        })
    }
    let articleId = req.query.id
    let userId = req.session.user._id
    User.findById(userId)
        .then((user) => {
            if (!user.like) {
                user.like = []
            }
            if (user.like.find(item => item == articleId)) {
                //代表已經按過讚了，要收回讚
                var newLike = user.like.filter(item => item.indexOf(articleId) == -1)
                User.updateOne({
                        _id: userId
                    }, {
                        like: newLike
                    })
                    .then(() => {
                        return new Promise(res => {
                            Comment.findById(articleId)
                                .then((article) => {
                                    Comment.updateOne({
                                            _id: articleId
                                        }, {
                                            good: article.good - 1
                                        })
                                        .then(data => {
                                            res()
                                        })
                                })
                        })
                    })
                    .then(() => {
                        return response.json({
                            err_code: 0,
                            message: 'back like'
                        })
                    })
            } else {
                //代表用戶還沒按過讚
                var newLike = user.like
                newLike.push(new String(articleId))
                User.updateOne({
                        _id: userId
                    }, {
                        like: newLike
                    })
                    .then(() => {
                        return new Promise(res => {
                            Comment.findById(articleId)
                                .then((article) => {
                                    Comment.updateOne({
                                            _id: articleId
                                        }, {
                                            good: article.good + 1
                                        })
                                        .then(data => {
                                            res()
                                        })
                                })
                        })
                    })
                    .then(() => {
                        return response.json({
                            err_code: 0,
                            message: 'send  like'
                        })
                    })
            }
        })
})












module.exports = router