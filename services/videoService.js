const { Error404 } = require('../errors/errors.js');

module.exports = class videoService {

    constructor(DAO) {
        this.DAO = DAO;
    }

    getVideo (id) {
        return this.DAO.Video
            .findOne({attributes: ['Id', 'VideoName', 'VideoFilePath', 'UserId'], where: {Id: id}, include: [{model:this.DAO.User, attributes: ['Username']}], raw: true})
            .then((VideoInstance) => {
                if (VideoInstance) {
                    return [VideoInstance];
                }
                throw new Error404('Video not found'); // Video not found
            });
    }

    getAllVideos() { 
        return this.DAO.Video
            .findAll({attributes: ['Id', 'VideoName', 'VideoFilePath'], include: [{model:this.DAO.User, attributes: ['Username']}], raw: true})
            .then((Videos) => {
                return Videos;
            });
    }

    createVideo(user, data, filename) { // generatedFilename comes from multer middleware->controller->service
        return this.DAO.Video
            .build({VideoName: data.VideoName, VideoFilePath: filename, UserId: user.id})
            .save()
            .then(Video => {
                return Video;
            });
    }

    updateVideo(id, data, filename) {
        return this.DAO.Video
            .findOne({where: {Id: id}})
            .then((Video) => {
                return Video.update({VideoName: data.body.VideoName, VideoFilePath: filename, UserId: data.user.id});
            });
    }

    removeVideo(id) {
        return this.DAO.Video
            .findOne({where: {Id: id}})
            .then(Video => {
                return Video.destroy();
            });
    }

}
