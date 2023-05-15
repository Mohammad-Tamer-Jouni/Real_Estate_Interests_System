const express = require('express');
const bodyParser = require('body-parser');
const authenticate = require('../authenticate');
const mongoose = require('mongoose');

const RealEstate = require('../models/realEstate');

const realEstateRouter = express.Router();

realEstateRouter.use(bodyParser.json());

realEstateRouter.route('/')
    .options((req, res) => { res.sendStatus(200); })
    .get((req, res, next) => {
        RealEstate.find(req.query)
            .populate('comments.author')
            .then((realEstate) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json({ realEstate });
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .post(authenticate.verifyUser, (req, res, next) => {
        req.body.owner = req.user._id;
        RealEstate.create(req.body)
            .then((realEstate) => {
                console.log('Real Estate Created ', realEstate);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(realEstate);
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .put(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /realEstate');
    })

    .delete(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        // RealEstate.remove({})
        //     .then((resp) => {
        //         res.statusCode = 200;
        //         res.setHeader('Content-Type', 'application/json');
        //         res.json(resp);
        //     }, (err) => next(err))
        //     .catch((err) => next(err));
        res.statusCode = 403;
        res.end('Delete operation not supported on /realEstate');
    });

realEstateRouter.route('/:raelEstateId')
    .options((req, res) => { res.sendStatus(200); })
    .get((req, res, next) => {
        RealEstate.findById(req.params.raelEstateId)
            .populate('comments.author')
            .then((realEstate) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json({realEstate});
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .post(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        res.statusCode = 403;
        res.end('POST operation not supported on /raelEstate/' + req.params.raelEstateId);
    })
    .put(authenticate.verifyUser, authenticate.verifyOwner, (req, res, next) => {
        RealEstate.findByIdAndUpdate(req.params.raelEstateId, { $set: req.body }, { new: true })
            .then((raelEstate) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(raelEstate);
            }, (err) => next(err))
            .catch((err) => next(err));
    })

    .delete(authenticate.verifyUser, (req, res, next) => {
        RealEstate.findByIdAndRemove(req.params.raelEstateId)
            .then((resp) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(resp);
            }, (err) => next(err))
            .catch((err) => next(err));
    });

realEstateRouter.route('/:raelEstateId/comments')
    .options((req, res) => { res.sendStatus(200); })
    .get((req, res, next) => {
        RealEstate.findById(req.params.raelEstateId)
            .populate('comments.auther')
            .then((raelEstate) => {
                if (raelEstate != null) {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json({ comments: raelEstate.comments });
                }
                else {
                    err = new Error('Rael Estate ' + req.params.raelEstateId + ' not found');
                    err.status = 404;
                    return next(err)
                }
            }, (err) => next(err))
            .catch((err) => next(err));
    })

    .post(authenticate.verifyUser, (req, res, next) => {
        RealEstate.findById(req.params.raelEstateId)
            .then((raelEstate) => {
                if (raelEstate != null) {
                    req.body.author = req.user._id;
                    raelEstate.comments.push(req.body);
                    raelEstate.save()
                        .then((raelEstate) => {
                            RealEstate.findById(raelEstate._id)
                                .populate('comments.author')
                                .then((raelEstate) => {
                                    res.statusCode = 200;
                                    res.setHeader('Content-Type', 'application/json');
                                    res.json(raelEstate);
                                })
                        }, (err) => next(err));
                }
                else {
                    err = new Error('RaelEstate ' + req.params.raelEstateId + ' not found');
                    err.status = 404;
                    return next(err);
                }
            }, (err) => next(err))
            .catch((err) => next(err));
    })

    .put(authenticate.verifyUser, (req, res, next) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /raelEstate/' + req.params.raelEstateId + '/comments');
    })

    .delete(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        RealEstate.findById(req.params.raelEstateId)
            .then((raelEstate) => {
                if (raelEstate != null) {
                    for (var i = (raelEstate.comments.length - 1); i >= 0; i--) {
                        raelEstate.comments.id(raelEstate.comments[i]._id).remove();
                    }
                    raelEstate.save()
                        .then((raelEstate) => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(raelEstate);
                        }, (err) => next(err));
                }
                else {
                    err = new Error('Rael Estate ' + req.params.raelEstateId + ' not found');
                    err.status = 404;
                    return next(err);
                }
            }, (err) => next(err))
            .catch((err) => next(err));
    });

realEstateRouter.route('/:raelEstateId/comments/:commentId')
    .options((req, res) => { res.sendStatus(200); })
    .get((req, res, next) => {
        RealEstate.findById(req.params.raelEstateId)
            .populate('comments.auther')
            .then((raelEstate) => {
                if (raelEstate != null && raelEstate.comments.id(req.params.commentId) != null) {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(raelEstate.comments.id(req.params.commentId));
                }
                else if (raelEstate == null) {
                    err = new Error('Rael Estate ' + req.params.raelEstateId + ' not found');
                    err.status = 404;
                    return next(err)
                }
                else {
                    err = new Error('Comment ' + req.params.commentid + ' not found');
                    err.status = 404;
                    return next(err)
                }
            }, (err) => next(err))
            .catch((err) => next(err));
    })

    .post(authenticate.verifyUser, (req, res, next) => {
        res.statusCode = 403;
        res.end('POST operation not supported on /raelEstate/' + req.params.raelEstateId + '/comments/' + req.params.commentId);
    })

    .put(authenticate.verifyUser, (req, res, next) => {
        RealEstate.findById(req.params.raelEstateId)
            .then((raelEstate) => {
                if (raelEstate != null && raelEstate.comments.id(req.params.commentId) != null
                    && raelEstate.comments.id(req.params.commentId).author.equals(req.user._id)) {
                    if (req.body.rating) {
                        raelEstate.comments.id(req.params.commentId).rating = req.body.rating;
                    }
                    if (req.body.comment) {
                        raelEstate.comments.id(req.params.commentId).comment = req.body.comment;
                    }
                    raelEstate.save()
                        .then((raelEstate) => {
                            RealEstate.findById(raelEstate._id)
                                .populate('comments.author')
                                .then((raelEstate) => {
                                    res.statusCode = 200;
                                    res.setHeader('Content-Type', 'application/json');
                                    res.json(raelEstate);
                                })
                        }, (err) => next(err));
                }
                else if (raelEstate == null) {
                    err = new Error('Rael Estate ' + req.params.raelEstateId + ' not found');
                    err.status = 404;
                    return next(err);
                }
                else {
                    err = new Error('Comment ' + req.params.commentId + ' not found');
                    err.status = 404;
                    return next(err);
                }
            }, (err) => next(err))
            .catch((err) => next(err));
    })

    .delete(authenticate.verifyUser, (req, res, next) => {
        RealEstate.findById(req.params.raelEstateId)
            .then((raelEstate) => {
                if (raelEstate != null && raelEstate.comments.id(req.params.commentId) != null
                    && raelEstate.comments.id(req.params.commentId).author.equals(req.user._id)) {
                    raelEstate.comments.id(req.params.commentId).remove();
                    raelEstate.save()
                        .then((raelEstate) => {
                            RealEstate.findById(raelEstate._id)
                                .populate('comments.author')
                                .then((raelEstate) => {
                                    res.statusCode = 200;
                                    res.setHeader('Content-Type', 'application/json');
                                    res.json(raelEstate);
                                })
                        }, (err) => next(err));
                }
                else if (raelEstate == null) {
                    err = new Error('Rael Estate ' + req.params.raelEstateId + ' not found');
                    err.status = 404;
                    return next(err);
                }
                else {
                    err = new Error('Comment ' + req.params.commentId + ' not found');
                    err.status = 404;
                    return next(err);
                }
            }, (err) => next(err))
            .catch((err) => next(err));
    });

module.exports = realEstateRouter;