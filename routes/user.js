//Models
    const express = require('express')
    const router = express.Router()
    const mongoose = require('mongoose')
    require('../models/Users')
    const Users = mongoose.model('users')
    const bcryptjs = require('bcryptjs')
    const passport = require('passport')
    var dateAtt = Date.now()
    setInterval(() => {
        dateAtt = Date.now()
    }, 1000)
//functions
    var erros = []
    function newAccountValidation(erros, name, email, password, password2) {
        if (!name || typeof name === undefined || typeof name === null) {
            erros.push('Nome inválido')
        }
        if (name.length < 2) {
            erros.push('Nome muito pequeno')
        }
        if (name.length > 50) {
            erros.push('Nome muito grande')
        }
        if (!password || typeof password === undefined || typeof password === null) {
            erros.push('Insira uma senha válida')
        }
        if (password.length < 6) {
            erros.push('Senha fraca')
        }
        if (password.length > 25) {
            erros.push('Senha muito longa')
        }
        if (password != password2) {
            erros.push('Digite a mesma senha nos dois espaços')
        }
        if (password.includes(' ')) {
            erros.push('A senha não pode conter espaços em branco')
        }
        if (!email || typeof email === undefined || typeof email === null || email.length < 8 || email.lenght > 250 || email.includes(' ') || email.includes('@') == false) {
            erros.push('Insira um e-mail válido')
        }
        if (erros.length == 0) {
            return 'correct'
        } else {
            return 'error'
        }
    }
//Register
    router.get("/register", (req, res) => {
        res.render("user/register")
    })
    router.post('/register', (req, res) => {
        const newAccount = {
            name: req.body.name.trim(),
            email: req.body.email.trim(),
            password: req.body.password.trim(),
            password2: req.body.password2.trim(),
            date: dateAtt
        }
        if (newAccountValidation(erros, newAccount.name, newAccount.email, newAccount.password, newAccount.password2) == 'error') {
            console.log(`Houve ${erros.length} erros ao criar a conta: \n` + erros)
            erros.map((e) => {
                req.flash('error_msg', ' ' + e)
            })
            res.redirect('./register')
            erros = []
        } else {
            Users.findOne({email: newAccount.email}).then((usuario) => {
                if (usuario) {
                    req.flash('error_msg', 'Já existe uma conta com esse email')
                    res.redirect('/')
                } else { //gerar hash de senha
                    bcryptjs.genSalt(10, (erro, salt) => {
                        if (erro) {
                            console.log('Erro ao usar o bcryptjs: \n' + erro)
                            req.flash('error_msg', 'Houve um erro interno durante o registro')
                            res.redirect('/')
                        } else {
                            bcryptjs.hash(newAccount.password, salt, (erro, hash) => {
                                if (erro) {
                                    console.log('Houve um erro durante o login: \n' + erro)
                                    req.flash('error_msg', 'Houve um erro durante o cadastro')
                                    res.redirect('/')
                                } else {
                                    newAccount.password = hash
                                    new Users(newAccount).save().then((conta) => {
                                        console.log('Usuário registrado: \n' + conta)
                                        req.flash('success_msg', 'Usuário registrado com sucesso')
                                        res.redirect('/')
                                    }).catch((err) => {
                                        console.log('Houve um erro interno durante o cadastro: \n' + err)
                                        req.flash('error_msg', 'Houve um erro interno durante o cadastro')
                                        res.redirect('/')
                                    })
                                }
                            })
                        }
                    })
                }
            }).catch((err) => {
                console.log('Não foi possível encontrar o usuário: \n' + err)
                req.flash('error_msg', 'Não foi possível encontrar o usuário')
                res.redirect('/')
            })
        }
    })
//Login
    router.get('/login', (req, res) => {
        res.render('user/login')
    })
    router.post('/login', (req, res, next) => {
        passport.authenticate('local', {
            successRedirect: '/',
            failureRedirect: '/user/login',
            failureFlash: true
        })(req, res, next)
    })
//Logout
    router.get('/logout', (req, res) => {
        req.logout(err => {
            if (err) {
                console.log(err)
                req.flash('error_msg', 'Houve um erro ao deslogar com a conta')
                res.redirect('/')
            } else {
                req.flash('success_msg', 'Deslogado com sucesso')
                res.redirect('/')
            }
        })
        
    })
//Exports
    module.exports = router