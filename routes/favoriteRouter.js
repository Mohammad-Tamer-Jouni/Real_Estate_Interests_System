const express = require('express');
const bodyParser = require('body-parser');
const authenticate = require('../authenticate');
const mongoose = require('mongoose');

const Favorites = require('../models/favorite');

const favoriteRouter = express.Router();

favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/')
    .options((req, res) => { res.sendStatus(200); })
    .get(authenticate.verifyUser, (req, res, next) => {
        Favorites.findOne({ user: req.user._id })
            .populate('user')
            .populate('realEstate')
            .then((favorites) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorites);
            }, (err) => next(err))
            .catch((err) => next(err));
    })

    .post(authenticate.verifyUser,
        (req, res, next) => {
            Favorites.find({})
                .populate('user')
                .populate('realEstate')
                .then((favourites) => {
                    var user;
                    if (favourites)
                        user = favourites.filter(fav => fav.user._id.toString() === req.user.id.toString())[0];
                    if (!user)
                        user = new Favorites({ user: req.user.id });
                    for (let i of req.body) {
                        if (user.realEstate.find((d_id) => {
                            if (d_id._id) {
                                return d_id._id.toString() === i._id.toString();
                            }
                        }))
                            continue;
                        user.realEstate.push(i._id);
                    }
                    user.save()
                        .then((userFavs) => {
                            res.statusCode = 201;
                            res.setHeader("Content-Type", "application/json");
                            res.json(userFavs);
                            console.log("Favourites Created");
                        }, (err) => next(err))
                        .catch((err) => next(err));

                })
                .catch((err) => next(err));
        })

    .delete(authenticate.verifyUser, (req, res, next) => {
        Favorites.findOneAndDelete({ user: req.user._id })
            .then((resp) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(resp);
            }, (err) => next(err))
            .catch((err) => next(err));
    })

favoriteRouter.route('/:realEstateId')
    .post(authenticate.verifyUser, (req, res, next) => {
        Favorites.findOne({ user: req.user._id })
            .then((favorite) => {
                if (favorite == null) {
                    Favorites.create({ user: req.user._id, realEstate: [req.params.realEstateId] })
                        .then((favorite) => {
                            Favorites.findById(favorite._id)
                                .populate('user')
                                .populate('realEstate')
                                .then((favorite) => {
                                    res.statusCode = 200;
                                    res.setHeader('Content-Type', 'application/json');
                                    res.json(favorite);
                                })
                        })
                        .catch((err) => {
                            return next(err);
                        });
                }
                else {
                    if (favorite.realEstate.indexOf(req.params.realEstateId) == -1) {
                        favorite.realEstate.push(req.params.realEstateId)
                        favorite.save()
                            .then((favorite) => {
                                Favorites.findById(favorite._id)
                                    .populate('user')
                                    .populate('realEstate')
                                    .then((favorite) => {
                                        res.statusCode = 200;
                                        res.setHeader('Content-Type', 'application/json');
                                        res.json(favorite);
                                    })
                            })
                            .catch((err) => {
                                return next(err);
                            });
                    }
                    else {
                        var err = new Error('Already There');
                        err.status = 500;
                        next(err);
                    }
                }
            }, (err) => next(err))
            .catch((err) => next(err))
    })
    .delete(authenticate.verifyUser, (req, res, next) => {
        Favorites.findOne({ user: req.user._id })
            .then((favorite) => {
                if (favorite == null) {
                    var err = new Error('Nothing in Favorites');
                    err.status = 500;
                    next(err);
                }
                else {
                    if (favorite.realEstate.indexOf(req.params.realEstateId) == -1) {
                        var err = new Error('Not Present in Favorites');
                        err.status = 500;
                        next(err);
                    }
                    else {
                        favorite.realEstate.splice(favorite.realEstate.indexOf(req.params.realEstateId), 1)
                        favorite.save()
                            .then((favorite) => {
                                Favorites.findById(favorite._id)
                                    .populate('user')
                                    .populate('realEstate')
                                    .then((favorite) => {
                                        res.statusCode = 200;
                                        res.setHeader('Content-Type', 'application/json');
                                        res.json(favorite);
                                    })
                            })
                            .catch((err) => {
                                return next(err);
                            });
                    }
                }
            }, (err) => next(err))
            .catch((err) => next(err))
    })

module.exports = favoriteRouter;