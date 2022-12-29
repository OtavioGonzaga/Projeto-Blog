const LocalStrategy = require('passport-local').Strategy
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
require('../models/Users')
const Users = mongoose.model('users')
module.exports = (passport) => {
    passport.serializeUser((user, done) => {
        done(null, user.email)
    })
    passport.deserializeUser((email, done) => {
        Users.findOne({email: email}).lean().then((user) => {
            done(null, user)
        }).catch((err) => {
            console.log(err)
            return done(err, null)
        })
    })
    passport.use(new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password'
    }, (email, password, done) => {
        Users.findOne({email: email}).lean().then((user) => {
            if (!user) return done(null, false)
            const isValid = bcrypt.compareSync(password, user.password)
            console.log(isValid)
            if (!isValid) return done(null, false)
            return done(null, user)
        }).catch((err) => {
            console.log(err)
            return done(err, false)
        })
    }))
}