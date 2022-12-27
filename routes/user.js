//Models
    const express = require('express')
    const router = express.Router()
    const mongoose = require('mongoose')
    require('../models/Users')
    const Users = mongoose.model('users')
    const bcryptjs = require('bcryptjs')
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
                if(usuario) {
                    req.flash('error_msg', 'Já existe uma conta com esse e-mail')
                    res.redirect('./register')
                } else {
                    bcryptjs.genSalt(10, (erro, salt) => {
                        bcryptjs.hash(newAccount.password, salt, (erro, hash) => {
                            if(erro) {
                                req.flash('error_msg', 'Houve um erro durante o salvamento da conta')
                                res.redirect('/')
                            }
                            newAccount.password = hash
                            new Users(newAccount).save().then(() => {       
                                console.log('Conta criada com sucesso')
                                req.flash('success_msg', 'Conta criada com sucesso')
                                res.redirect('/') 
                            }).catch((err) => {
                                console.log('Erro ao salvar a conta: \n' + err)
                                req.flash('error_msg', 'Houve um erro interno ao salvar a conta')
                                res.redirect('/')
                            })
                        })
                    })
                }
            })
        }
    })
//Exports
    module.exports = router