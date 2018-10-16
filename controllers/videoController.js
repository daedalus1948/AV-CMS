function getVideo(videoService) {
    return (req, res, next) => {
        return videoService.getVideo(req.params.videoID)
            .then((Video) => {
                res.render('index.ejs', {template: 'video/videoData.ejs', templateData: {data: Video, user: req.user}});
            })
            .catch((error) => {
                next(error);
            })
        }
}

function getAllVideos(videoService) {
    return (req, res, next) => {
        return videoService.getAllVideos()
            .then((Videos) => {
                res.render('index.ejs', {template: 'video/videoData.ejs', templateData: {data: Videos, user: req.user}});
            })
            .catch((error) => {
                next(error);
            })
    }
}

function postVideo(videoService) {
    return (req, res, next) => {
        return videoService.createVideo(req.user, req.body, req.file.filename)
            .then((success) => {
                res.redirect('/videos/');
            })
            .catch((error) => {
                next(error); // render video form with errors from the error object
            })
    }
}

function putVideo(videoService) {
    return (req, res, next) => {
        return videoService.updateVideo(req.params.videoID, {body: req.body, user: req.user}, req.file.filename)
            .then((success) => {
                res.redirect('/videos/');
            })
            .catch((error) => {
                next(error);
            })
    }
}

function deleteVideo(videoService) {
    return (req, res, next) => {
        return videoService.removeVideo(req.params.videoID)
            .then((success) => {
                res.redirect('/videos/');
            })
            .catch((error) => {
                next(error);
            })
    }
}

function renderVideoForm(videoService) {
    return (req, res, next) => {
        let templateForm = {
            "PUT": 'video/videoFormEdit.ejs',
            "POST": 'video/videoFormPost.ejs',
            "DELETE": 'video/videoFormDelete.ejs'
        }[req.action];

        if (req.action=="PUT") { // if edit, fetch new data to populate the form
            return videoService.getVideo(req.params.videoID)
                .then((Video) => {
                    res.render('index.ejs', {template: templateForm, templateData: { formData: Video, user: req.user, _csrf:req.csrfToken()}});
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
    deleteVideo :deleteVideo, 
    putVideo: putVideo,
    postVideo: postVideo,
    getVideo: getVideo, 
    getAllVideos: getAllVideos,
    renderVideoForm: renderVideoForm,
};
