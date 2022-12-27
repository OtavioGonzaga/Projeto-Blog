//Models
    const express = require('express')
    const router = express.Router()
    const mongoose = require('mongoose')
    require('../models/Categories')
    const Categories = mongoose.model("categories")
    require('../models/Posts')
    const Posts = mongoose.model('posts')
    var dateAtt = Date.now()
    setInterval(() => {
        dateAtt = Date.now()
    }, 1000)
//Funcitions
    var erros = []
    function categoryValidation(erros, name, slug) {
        if (!name || typeof name === undefined || typeof name === null) {
            erros.push('insira um nome válido')
        }
        if (name < 2) {
            erros.push('Nome muito curto')
        }
        if (name > 50) {
            erros.push('Nome muito grande')
        }
        if (!slug || typeof slug === undefined || typeof slug === null) {
            erros.push('Insira um slug válido')
        }
        if (slug.includes(" ")) {
            erros.push('O slug não pode conter espaços')
        }
        if (slug < 2) {
            erros.push('Slug muito pequeno')
        }
        if (slug > 40) {
            erros.push('Slug muito grande')
        }
        if (erros.length == 0) {
            return 'correct'
        } else {
            return 'error'
        }
    }
    function postValidation(erros, title, slug, description,category, content) {
        if (!slug || typeof slug === undefined || typeof slug === null) {
            erros.push('Insira um slug válido')
        }
        if (slug.includes(" ")) {
            erros.push('O slug não pode conter espaços')
        }
        if (slug.lenght < 2) {
            erros.push('Slug muito pequeno')
        }
        if (slug.lenght > 40) {
            erros.push('Slug muito grande')
        }
        if (!title || typeof title === null || typeof title === undefined) {
            erros.push('Insira um título válido')
        }
        if (title.length < 2) {
            erros.push('Título muito pequeno')
        }
        if (title.lenght > 60) {
            erros.push('Título muito grande')
        }
        if (!description || typeof description === undefined ||  typeof description === null) {
            erros.push('Insira uma descrição válida')
        }
        if (description.lenght < 10) {
            erros.push('Descrição muito pequena')
        }
        if (description.lenght > 600) {
            erros.push('descrição muito longa')
        }
        if (content.lenght < 10) {
            erros.push('É necessário mais conteúdo para uma postagem')
        }
        if (category == '0') {
            erros.push('Selecione uma categoria para a postagem')
        }
        if (erros.length == 0) {
            return 'correct'
        } else {
            return 'error'
        }
    }
//Routes
    //Index
        router.get("/", (req, res) => {
            res.render("admin/index")
        })
    //Categorias
        router.get('/categories', (req, res) => {
            Categories.find().lean().sort({date: 'desc'}).then((categories) => {
                res.render('admin/categories', {categories})
            }).catch((err) => {
                console.log("Houve um erro ao listar as categorias" + err)
                req.flash('error_msg', "Houve um erro ao listar as categorias")
                res.redirect("/admin")
            })
        })
    //Adicionar categorias
        router.get('/categories/add', (req, res) => {
         res.render('admin/addcategories')
        })
        router.post('/categories/new', (req, res) => {
            const newCategory = {
                name: req.body.name.trim(),
                slug: req.body.slug.trim().toLowerCase(),
                date: dateAtt
            }
            if (categoryValidation(erros, newCategory.name, newCategory.slug) == 'error') {
                console.log(`Houve ${erros.length} erros ao salvar a categoria: \n` + erros)
                erros.map((e) => {
                    req.flash('error_msg', ' ' + e)
                })
                res.redirect('./add')
                erros = []
            } else {
                new Categories(newCategory).save().then(() => {
                    console.log('Categoria salva com sucesso')
                    req.flash('success_msg', 'Categoria criada com sucesso!')
                    res.redirect('./')
                }).catch((err) => {
                    req.flash('erro_msg', 'Houve um erro ao salvar a categoria, tente novamente!')
                    res.redirect('./')
                    console.log("Houve um erro ao salvar categoria: " + err)
                })
            }
        })
    //Editar categorias
        router.get('/categories/edit/:id', (req, res) => {
            Categories.findOne({_id:req.params.id}).lean().then((categories) => {
                console.log(req.params.id)
                res.render('admin/editcategories', {categories})
            }).catch((err) => {
                console.log(err)
                req.flash('error_msg', 'Esta categoria não existe')
                res.redirect('./')
            })
        })
        router.post('/categories/edit', (req, res) => {
            const editCategory = {
                name: req.body.name.trim(),
                slug: req.body.slug.trim().toLowerCase(),
                date: dateAtt
            }
            if (categoryValidation(erros, editCategory.name, editCategory.slug) == 'error') {
                console.log(`Houve ${erros.length} erros ao editar a categoria: \n` + erros)
                erros.map((e) => {
                    req.flash('error_msg', ' ' + e)
                })
                res.redirect('./edit/' + req.body.id)
                erros = []
            } else {
                Categories.findOne({_id:req.body.id}).then((categoria) => {
                    categoria.name = editCategory.name
                    categoria.slug = editCategory.slug
                    categoria.date = editCategory.date
                    categoria.save().then(() => {
                        req.flash('success_msg', 'A categoria foi editada com sucesso')
                        res.redirect('./')
                    }).catch((err) => {
                        console.log('Houve um erro ao editar a categoria:\n' + err)
                        req.flash('error_msg', 'Houve um erro interno ao editar a categoria')
                        res.redirect('./')
                    })
                }).catch((err) => {
                    console.log('Houve um erro ao editar a categoria:\n' + err)
                    req.flash('error_msg', "Houve um erro ao editar a categoria")
                    res.redirect('./')
                })
            }
        })
    //Deletar categorias
        router.post('/categories/delete', (req, res) => {
            Categories.findByIdAndDelete({_id: req.body.id}).then(() => {
                req.flash('success_msg', 'Categoria deletada com sucesso')
                res.redirect('./')
            }).catch((err) => {
                console.log('Houve um erro ao deletar a categoria: \n' + err)
                req.flash('error_msg', 'Houve um erro ao deletar a categoria')
                res.redirect('./')
            })
        })
    //Adicionar postagens
        router.get('/posts', (req, res) => {
            Posts.find().populate('category').lean().sort({date: 'desc'}).then((posts) => {
                res.render('admin/posts', {posts})
            }).catch((err) => {
                console.log('Houve um erro ao exibir as postagens: \n' + err)
                req.flash('error_msg', 'Houve um erro ao exibir as categorias')
                res.redirect('./posts')
            })
        })
        router.get('/posts/add', (req, res) => {
            Categories.find().lean().then((categories) => {
                res.render('admin/addpost', {categories})
            }).catch((err) => {
                console.log('houve um erro ao carregar o formulário de postagens:\n' + err)
                req.flash('error_msg', 'Houve um erro ao carregar o formulário')
                res.redirect('./')
            })
        })
        router.post('/posts/new', ((req, res) => {
            const newPost = {
                title: req.body.title.trim(),
                slug: req.body.slug.trim().toLowerCase(),
                description: req.body.description.trim(),
                category: req.body.category,
                content: req.body.content.trim(),
                date: dateAtt
            }
            if(postValidation(erros, newPost.title, newPost.slug, newPost.description, newPost.category, newPost.content) == 'error') {
                console.log(`Houve ${erros.length} erros ao criar a postagem: \n` + erros)
                erros.map((e) => {
                    req.flash('error_msg', ' ' + e)
                })
                res.redirect('./add')
                erros = []
            } else {
                new Posts(newPost).save().then(() => {
                    console.log('Postagem salva com sucesso')
                    req.flash('success_msg', 'Postagem salva com sucesso')
                    res.redirect('./')
                }).catch((err) => {
                    console.log('Erro ao salvar postagem: \n' + err)
                    req.flash('error_msg', 'Houve um erro interno ao salvar a postagem')
                    res.redirect('./')
                })
            }
        }))
    //Editar postagens
        router.get('/posts/edit/:id', (req, res) => {
            Posts.findOne({_id:req.params.id}).lean().then((posts) => {
                Categories.find().lean().then((categories) => {
                    res.render('admin/editposts', {categories, posts})
                }).catch((err) => {
                      console.log(err)
                      req.flash('error_msg', 'Houve um ero interno ao editar a postagem')
                })
            }).catch((err) => {
                console.log(err)
                req.flash('error_msg', 'Esse post não existe')
                res.redirect('./')
            })
        })
        router.post('/posts/edit', (req, res) => {
            const editPost = {
                id: req.body.id,
                title: req.body.title.trim(),
                slug: req.body.slug.trim().toLowerCase(),
                description: req.body.description.trim(),
                category: req.body.category,
                content: req.body.content.trim(),
                date: dateAtt
            }
            if (postValidation(erros, editPost.title, editPost.slug, editPost.description, editPost.category, editPost.content) == 'error') {
                console.log(`Houve ${erros.length} erros ao salvar a categoria: \n` + erros)
                erros.map((e) => {
                    req.flash('error_msg', ' ' + e)
                })
                res.redirect(`./edit/${editPost.id}`)
                erros = []
            } else {
                Posts.findOne({_id: req.body.id}).then((posts) => {
                    posts.title = editPost.title
                    posts.slug = editPost.slug
                    posts.description = editPost.description
                    posts.category = editPost.category
                    posts.content = editPost.content
                    posts.date = editPost.date
                    posts.save().then(() => {
                        console.log('Postagem editada com sucesso')
                        req.flash('success_msg', 'Postagem editada com sucesso')
                        res.redirect('./')
                    }).catch((err) => {
                        console.log('Erro ao editar a postagem: \n' + err)
                        req.flash('error_msg', 'Houve um erro interno ao editar a postagem')
                    })
                }).catch((err) => {
                    console.log('Houve um erro ao indentificar a postagem: \n' + err)
                    req.flash('error_msg', 'A postagem não existe')
                })
            }
        })
    //Deletar postagens
        router.post('/posts/delete', (req, res) => {
            Posts.findByIdAndDelete({_id: req.body.id}).then(() => {
                req.flash('success_msg', 'Postagem deletada com sucesso')
                res.redirect('./')
            }).catch((err) => {
                console.log('Houve um erro ao deletar a postagem: \n' + err)
                req.flash('error_msg', 'Houve um erro ao deletar a postagem')
                res.redirect('./')
            })
        })
//exportações
    module.exports = router