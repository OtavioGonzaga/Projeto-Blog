module.exports = {
    isAdm: (req, res, next) => {
        if (req.isAuthenticated() && req.user.isAdm == 1) return next()
        req.flash('error_msg', 'Você deve ser um administrador para continuar')
        res.redirect('/')
    }
}