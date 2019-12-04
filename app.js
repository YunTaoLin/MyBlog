const express = require('express')
const app = express()
const path = require('path')
const session = require('express-session')
    // const router = require('./router')
const bodyParser = require('body-parser')

//路由
const index = require('./router/index')
const article = require('./router/article')
const admin = require('./router/admin')
const account = require('./router/account')


app.use('/public/', express.static(path.join(__dirname + '/public')))
app.use('/node_modules/', express.static(path.join(__dirname + '/node_modules')))

//設定模板引擎
app.engine('html', require('express-art-template'))
app.set('views', path.join(__dirname, './views'))

//設定express-session
// app.set('trust proxy', 1) 
app.use(session({
    secret: 'YunTaoLin', //加密
    resave: false,
    saveUninitialized: true, //不管有無用到，都創建session
    // cookie: { secure: true }//這個設置代表安全性，若不是Https協議則不儲存cookie
}))

//使用bodyParser
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
    //掛載路由

app.use(article);
app.use(admin);
app.use(account);
app.use(index)




app.listen(80, (err, res) => {
    if (err) throw err
    console.log('啟動成功')
})