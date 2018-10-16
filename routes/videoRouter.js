const express = require('express');
const multer = require('multer');
const csurf = require('csurf');

const videoController = require('../controllers/videoController.js');
const VideoService = require('../services/VideoService.js');
const resource = require('../middlewares/resourceInjector.js');
const action = require('../middlewares/actionInjector.js');
const authRequired = require('../middlewares/authorizationRequired.js');
const loginRequired = require('../middlewares/loginRequired.js');
const formSanitizer = require('../middlewares/formSanitizer.js');
const killCSRF = require('../middlewares/killCSRF.js');

const DAO = require('../models/core.js');

const router = express.Router(); 

_csrf = !process.env.ENVIRONMENT=="TEST" ? csurf({cookie: true}) : killCSRF;

router.get('/videos/new', [_csrf, action('POST'),resource('Video'), loginRequired, authRequired], videoController.renderVideoForm(new VideoService(DAO)));
router.get('/videos/:videoID/edit', [_csrf, action('PUT'), resource('Video'), loginRequired, authRequired], videoController.renderVideoForm(new VideoService(DAO)));
router.get('/videos/:videoID/delete', [_csrf, action('DELETE'), resource('Video'), loginRequired, authRequired], videoController.renderVideoForm(new VideoService(DAO)));

router.get('/videos/:videoID', [_csrf, action('GET'), resource('Video'), loginRequired, authRequired], videoController.getVideo(new VideoService(DAO)));
router.get('/videos', [_csrf, action('GET'), resource('Video'), loginRequired, authRequired], videoController.getAllVideos(new VideoService(DAO)));
router.post('/videos', [action('POST'), resource('Video'), loginRequired, authRequired, multer({ dest: 'public/video/' }).single('VideoFilePath'), _csrf, formSanitizer], videoController.postVideo(new VideoService(DAO)));
router.post('/videos/:videoID/edit', [action('POST'), resource('Video'), loginRequired, authRequired, multer({ dest: 'public/video/' }).single('VideoFilePath'), _csrf, formSanitizer], videoController.putVideo(new VideoService(DAO)));
router.post('/videos/:videoID/delete', [action('DELETE'), resource('Video'), loginRequired, authRequired, _csrf, formSanitizer], videoController.deleteVideo(new VideoService(DAO)));

module.exports = router;
