const express = require('express')
let router = express.Router()

//markdown 轉HTML
let showdown = require('showdown')
let converter = new showdown.Converter()

// 大頭照儲存
const multer = require('multer')

// 密碼加密
let md5 = require('blueimp-md5')

let User = require('./models/user', { useMongoClient: true })
let Comment = require('./models/comment.js', { useMongoClient: true })
let Reply = require('./models/reply', { useMongoClient: true })

let trans_time = require('./public/js/transTime')



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





//首頁
router.get('/', function(req, response) {
    //將跳轉需求初始化
    req.session.nowURL = null
    Comment.find()
        .then(list => {
            //判斷文章總數來切割分頁
            let pageArray = []
            for (let i = 1; i <= Math.ceil(list.length / 10); i++) {
                pageArray.push(i)
            }
            page = req.query.page || 1
            list = list.reverse().slice(page * 10 - 10, page * 10)
            if (list.length == 0) {
                return response.render('index.html', {
                    user: req.session.user
                })
            }
            let commentList = []
                //用遞迴的方進行處理非同步的疊代處理
            function myRender(i) {
                User.findById(list[i].issuer)
                    .then(issuer => {
                        let time = list[i].create_time
                        let create_time = trans_time(time)
                        list[i].username = issuer.username
                        list[i].headimg = issuer.headimg
                        list[i].show_create_time = String(create_time)
                        list[i].theId = String(list[i]._id)
                        Reply.find({ which_comment: list[i]._id })
                            .then(reply => {
                                list[i].reply = reply.length
                                commentList.push(list[i])
                                if (i + 1 === list.length) {
                                    return response.render('index.html', {
                                        user: req.session.user,
                                        commentList: commentList,
                                        pageArray: pageArray,
                                        nowPage: req.query.page || 1
                                    })
                                }
                                myRender(i + 1)
                            })
                    })
            }
            myRender(0)

        })
})




//渲染登入頁面
router.get('/login', function(req, res) {
    // 如果登入了就導到首頁
    if (req.session.user) {
        res.redirect('/')
    }
    res.render('login.html', {
        to: req.session.nowURL
    })
    req.session.nowURL = null

})

//處理登入請求
router.post('/login', function(req, res) {
    var body = req.body
    body.password = md5(body.password)
    User.findOne({
        email: body.email,
        password: body.password
    }, (error, user) => {
        if (error) {
            return res.status(500).json({
                err_code: 500,
                message: 'Internal error'
            })
        } else if (!user) {
            return res.status(200).json({
                err_code: 1,
                message: 'email or password error'
            })
        } else {


            //登入成功，使用Session紀錄登入狀態
            req.session.user = user


            res.json({
                err_code: 0,
                message: 'OK'
            })
        }
    })
})

//渲染註冊頁面
router.get('/register', function(req, res) {
    // 如果登入了就導到首頁
    if (req.session.user) {
        res.redirect('/')
    }
    res.render('register.html')

})

//處理註冊請求
router.post('/register', function(req, res) {

    // 1.表單提交
    // req.body
    // 2.操作數據庫
    // 判斷用戶是否存在
    let body = req.body
    body.password = md5(body.password)
    User.findOne({
        $or: [{ email: body.email }, { username: body.username }]
    }, (err, data) => {
        if (err) {
            return res.status(500).json({
                err_code: 500,
                message: 'Internal error'
            })
        }
        if (data) {
            //email或用戶名已存在
            //這邊有json方法，可以方便傳送json
            return res.status(200).json({
                err_code: 1,
                message: 'Email or username aleady exists'
            })
        }
        new User(body).save((err, user) => {
            if (err) {
                return res.status(500).json({
                    err_code: 500,
                    message: 'Internal error'
                })
            }
            //註冊成功，使用Session紀錄登入狀態
            req.session.user = user
            res.json({
                err_code: 0,
                message: 'OK'
            })
        })




    })
})

//處理登出
router.get('/logout', function(req, res) {
    req.session.user = null
    res.redirect('/login')
})

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
    console.log(ifLike)
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
    console.log(body)
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
        console.log('更新')
        res.json({
            err_code: 0,
            message: 'OK'
        })
    })
})

router.post('/updateTwitter', function(req, res) {
    let body = req.body
    console.log(body)
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
        console.log('更新')
        res.json({
            err_code: 0,
            message: 'OK'
        })
    })
})

router.post('/updatePhone', function(req, res) {
    let body = req.body
    console.log(body)
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
        console.log('更新')
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


// 渲染搜尋頁面
router.get('/search', function(req, response) {
    //將跳轉需求初始化
    req.session.nowURL = null
    let search = req.query.search
    Comment.find()
        .then(list => {
            //判斷文章總數來切割分頁
            let pageArray = []
            let newList = list.filter(item => {
                    return item.title.toLowerCase().indexOf(search.toLowerCase()) != -1
                })
                //如果找不到，就直接渲染
            if (!newList.length) {
                return response.render('search.html', {
                    user: req.session.user,
                    search: search,
                    Find: false
                })
            }
            for (let i = 1; i <= Math.ceil(newList.length / 10); i++) {
                pageArray.push(i)
            }
            page = req.query.page || 1
            newList = newList.reverse().slice(page * 10 - 10, page * 10)
            if (list.length == 0) {
                return response.render('index.html', {
                    user: req.session.user
                })
            }
            let commentList = []
                //用遞迴的方進行處理非同步的疊代處理
            function myRender(i) {
                User.findById(newList[i].issuer)
                    .then(issuer => {
                        let time = newList[i].create_time
                        let create_time = trans_time(time)
                        newList[i].username = issuer.username
                        newList[i].headimg = issuer.headimg
                        newList[i].show_create_time = String(create_time)
                        newList[i].theId = String(newList[i]._id)
                        Reply.find({ which_comment: newList[i]._id })
                            .then(reply => {
                                newList[i].reply = reply.length
                                commentList.push(newList[i])
                                if (i + 1 === newList.length) {
                                    return response.render('search.html', {
                                        user: req.session.user,
                                        commentList: commentList,
                                        pageArray: pageArray,
                                        nowPage: req.query.page || 1,
                                        search: search
                                    })
                                }
                                myRender(i + 1)
                            })
                    })
            }
            myRender(0)

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
                console.log(user.like)
                console.log(articleId)
                var newLike = user.like
                newLike.push(new String(articleId))
                console.log(newLike)
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