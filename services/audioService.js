const { Error404 } = require('../errors/errors.js');

module.exports = class audioService {

    constructor(DAO) {
        this.DAO = DAO;
    }

    getAudio (id) {
        return this.DAO.Audio
            .findOne({attributes: ['Id', 'SongName', 'AudioFilePath', 'UserId'], where: {Id: id}, include: [{model:this.DAO.User, attributes: ['Username']}], raw: true})
            .then((AudioInstance) => {
                if (AudioInstance) {
                    return [AudioInstance];
                }
                throw new Error404('Audio not found'); // Audio not found
            });
    }

    getAllAudios() { 
        return this.DAO.Audio
            .findAll({attributes: ['Id', 'SongName', 'AudioFilePath'], include: [{model:this.DAO.User, attributes: ['Username']}], raw: true})
            .then((Audios) => {
                return Audios;
            });
    }

    createAudio(user, data, filename) { // generatedFilename comes from multer middleware->controller->service
        return this.DAO.Audio
            .build({SongName: data.SongName, AudioFilePath: filename, UserId: user.id})
            .save()
            .then(Audio => {
                return Audio;
            });
    }

    updateAudio(id, data, filename) {
        return this.DAO.Audio
            .findOne({where: {Id: id}})
            .then((Audio) => {
                return Audio.update({SongName: data.body.SongName, AudioFilePath: filename, UserId: data.user.id});
            });
    }

    removeAudio(id) {
        return this.DAO.Audio
            .findOne({where: {Id: id}})
            .then(Audio => {
                return Audio.destroy();
            });
    }

}
