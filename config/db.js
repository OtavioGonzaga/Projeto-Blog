if (process.env.NODE_ENV == 'production') {
    module.exports = {mongoURI: 'mongodb+srv://OtavioGonzaga:kn5c42p6239avksmongo@blogneochrono.3iyadnz.mongodb.net/blogneochrono'}
} else {
    module.exports = {mongoURI: 'mongodb://127.0.0.1/blogapp'}
}