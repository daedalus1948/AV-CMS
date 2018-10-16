const express = require('express');
const multer = require('multer');
const csurf = require('csurf');

const audioController = require('../controllers/audioController.js');
const AudioService = require('../services/AudioService.js');
const resource = require('../middlewares/resourceInjector.js');
const action = require('../middlewares/actionInjector.js');
const authRequired = require('../middlewares/authorizationRequired.js');
const loginRequired = require('../middlewares/loginRequired.js');
const formSanitizer = require('../middlewares/formSanitizer.js');
const killCSRF = require('../middlewares/killCSRF.js');
const DAO = require('../models/core.js');

const router = express.Router(); 

_csrf = !process.env.ENVIRONMENT=="TEST" ? csurf({cookie: true}) : killCSRF;

router.get('/audios/new', [_csrf, action('POST'),resource('Audio'), loginRequired, authRequired], audioController.renderAudioForm(new AudioService(DAO)));
router.get('/audios/:audioID/edit', [_csrf, action('PUT'), resource('Audio'), loginRequired, authRequired], audioController.renderAudioForm(new AudioService(DAO)));
router.get('/audios/:audioID/delete', [_csrf, action('DELETE'), resource('Audio'), loginRequired, authRequired], audioController.renderAudioForm(new AudioService(DAO)));

router.get('/audios/:audioID', [_csrf, action('GET'), resource('Audio'), loginRequired, authRequired], audioController.getAudio(new AudioService(DAO)));
router.get('/audios', [_csrf, action('GET'), resource('Audio'), loginRequired, authRequired], audioController.getAllAudios(new AudioService(DAO)));
router.post('/audios', [action('POST'), resource('Audio'), loginRequired, authRequired, multer({ dest: 'public/audio/' }).single('AudioFilePath'), _csrf, formSanitizer], audioController.postAudio(new AudioService(DAO)));
router.post('/audios/:audioID/edit', [action('POST'), resource('Audio'), loginRequired, authRequired, multer({ dest: 'public/audio/' }).single('AudioFilePath'), _csrf, formSanitizer], audioController.putAudio(new AudioService(DAO)));
router.post('/audios/:audioID/delete', [action('DELETE'), resource('Audio'), loginRequired, authRequired, _csrf, formSanitizer], audioController.deleteAudio(new AudioService(DAO)));

module.exports = router;
