function getAudio(audioService) {
    return (req, res, next) => {
        return audioService.getAudio(req.params.audioID)
            .then((Audio) => {
                res.render('index.ejs', {template: 'audio/audioData.ejs', templateData: {data: Audio, user: req.user}});
            })
            .catch((error) => {
                next(error);
            })
        }
}

function getAllAudios(audioService) {
    return (req, res, next) => {
        return audioService.getAllAudios()
            .then((Audios) => {
                res.render('index.ejs', {template: 'audio/audioData.ejs', templateData: {data: Audios, user: req.user}});
            })
            .catch((error) => {
                next(error);
            })
    }
}

function postAudio(audioService) {
    return (req, res, next) => {
        return audioService.createAudio(req.user, req.body, req.file.filename)
            .then((success) => {
                res.redirect('/audios/');
            })
            .catch((error) => {
                next(error); // render audio form with errors from the error object
            })
    }
}

function putAudio(audioService) {
    return (req, res, next) => {
        return audioService.updateAudio(req.params.audioID, {body: req.body, user: req.user}, req.file.filename)
            .then((success) => {
                res.redirect('/audios/');
            })
            .catch((error) => {
                next(error);
            })
    }
}

function deleteAudio(audioService) {
    return (req, res, next) => {
        return audioService.removeAudio(req.params.audioID)
            .then((success) => {
                res.redirect('/audios/');
            })
            .catch((error) => {
                next(error);
            })
    }
}

function renderAudioForm(audioService) {
    return (req, res, next) => {
        let templateForm = {
            "PUT": 'audio/audioFormEdit.ejs',
            "POST": 'audio/audioFormPost.ejs',
            "DELETE": 'audio/audioFormDelete.ejs'
        }[req.action];

        if (req.action=="PUT") { // if edit, fetch new data to populate the form
            return audioService.getAudio(req.params.audioID)
                .then((Audio) => {
                    res.render('index.ejs', {template: templateForm, templateData: { formData: Audio, user: req.user, _csrf:req.csrfToken()}});
                })
                .catch((error) => {
                    next(error);
                })
        }
        else { // render empty form
            res.render('index.ejs', {template: templateForm, templateData: { user: req.user, _csrf:req.csrfToken() }});
        }
    }
}


module.exports = {
    deleteAudio :deleteAudio, 
    putAudio: putAudio,
    postAudio: postAudio,
    getAudio: getAudio, 
    getAllAudios: getAllAudios,
    renderAudioForm: renderAudioForm,
};
