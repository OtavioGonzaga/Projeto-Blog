//Carregando módulos
    const express = require('express')
    const handlebars = require('express-handlebars')
    const moment = require('moment')
    const app = express() //recebe a função do express
    const admin = require('./routes/admin')
    const path = require('path')
    const mongoose = require('mongoose')
    const flash = require('connect-flash')
    require('./models/Categories')
    const Categories = mongoose.model('categories')
    require('./models/Posts')
    const Posts = mongoose.model('posts')
    const user = require('./routes/user')
    const passport = require('passport')
    const session = require('express-session')
    require('./config/auth')(passport)//passa o parâmetro esperado pela função findUser no arquivo auth.js
    const db = require('./config/db')
//Configurações
    //sessão
        app.use(session({
            secret: "@Kn5c42p6239avksblog",
            resave: true,
            saveUninitialized: true,
            cookie: {maxAge: 2 * 60 * 60 * 1000}
        }))
        app.use(passport.initialize())
        app.use(passport.session())
        app.use(flash())
    //middleware
        app.use((req, res, next) => {
            res.locals.success_msg = req.flash('success_msg')
            res.locals.error_msg = req.flash('error_msg')
            res.locals.error = req.flash('error')
            res.locals.user = req.user || null
            next()
        })
    //express
        app.use(express.urlencoded({extended: true}))
        app.use(express.json())
    //handlebars
        app.engine('handlebars', handlebars.engine({defaultLayout: 'main', helpers: {
            formatDate: (date) => {
                return moment(date).format('DD/MM/YYYY HH:mm')
            }
        }}))
        app.set('view engine', 'handlebars')
    //mongoose
        mongoose.Promise = global.Promise
        mongoose.set('strictQuery', true)
        mongoose.connect(db.mongoURI).then(() => console.log('Conectado ao MongoDB')).catch((err) => console.log('Houve um erro ao se conectar: ' + err))
    //public
        app.use(express.static(path.join(__dirname, 'public')))
//Rotas
    //Home
        app.get('/', (req, res) => {
            Posts.find().lean().populate('category').sort({date: 'desc'}).then((posts) => {
                res.render('index', {posts})
            }).catch((err) => {
                console.log('Houve um erro no site: \n' + err)
                req.flash('error_msg', 'Houve um erro interno')
                res.redirect('/404')
            })
        })
    //Posts
        app.get('/post/:slug', (req, res) => {
            Posts.findOne({slug: req.params.slug}).lean().then((postagem) => {
                if (postagem) {
                    res.render('posts/index', {postagem})
                } else {
                    req.flash('error_msg', 'Essa postagem não existe')
                    res.redirect('/')
                }
            }).catch((err) => {
                console.log('Houve um erro interno ao carregar a postagem: \n' + err)
                req.flash('error_msg', 'Houve um erro interno')
                res.redirect('/')
            })
        })
    //Categories
        app.get('/categories', (req, res) => {
            Categories.find().lean().sort({name: 'asc'}).then((categorias) => {
                res.render('categories/index', {categorias})
            }).catch((err) => {
                console.log('Houve um erro interno ao listar as categorias: \n' + err)
                req.flash('error_msg', 'Houve um erro interno ao listar as categorias')
                res.redirect('/')
            })
        })
    //Posts by category
        app.get('/categories/:slug', (req, res) => {
            Categories.findOne({slug: req.params.slug}).lean().then((categoria) => {
                if (categoria) {
                    Posts.find({category: categoria._id}).lean().then((postagens) => {
                        res.render('categories/posts', {postagens, categoria} )
                    }).catch((err) => {
                        console.log(': \n' + err)
                        req.flash('error_msg', 'Houve um erro ao listar os posts')
                        res.redirect('/')
                    })
                } else {
                    req.flash('error_msg', 'Essa categoria não existe')
                    res.redirect('/')
                }
            }).catch((err) => {
                console.log('Houve um erro interno ao listar as postagens: \n' + err)
                req.flash('error_msg', 'Houve um erro interno ao listar as postagens dessa categoria')
                res.redirect('/')
            })
        })
    //Erro 404
        app.get('/404', (req, res) => {
            res.send('404 not found')
        })
//Outros
    app.use('/admin', admin)
    app.use('/user', user)
    const port = process.env.port || 2073
    app.listen(port, () => console.log(`Servidor ativo na porta ${port}.`))