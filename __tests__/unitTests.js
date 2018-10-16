class MockSequelize {

    constructor(mockModel, status) {
        this.modelConstructor = mockModel;
        this.status = status;
    }
            
    define (tableName, attributesObject, options) {
        let Model = new MockModel(tableName, attributesObject, options);
        Model.setStatus(this.status);
        return Model;
    }

    transaction(func) {
        return func(); // the function supplied returns a promise
    }

    query() {
        return new Promise((resolve, reject)=>{ 
            if (this.status=='reject') {
                reject('reject');
            }
            if (this.status=='empty') {
                resolve([[], 'metadata']);
            }
            if (this.status=='success') { 
                resolve([1], 'metadata');
            }
        }); 
    }
}


class MockModel {

    constructor(tableName,attributesObject, options) {
        
        this.tableName = tableName;
        this.rawAttributes = [];
        this.prototype = {};
        this.hooks = {};
        this.status = '';
        this.buildData = '';

        for (let key in attributesObject) {
            this.rawAttributes.push(key);
        }

        for (let key in options.hooks) {
            this.hooks[key] = options.hooks[key];
        }

        return this;
    }

    _testPromise(data) {
        return new Promise((resolve, reject)=>{ 
            if (this.status=='reject') {
                reject('reject');
            }
            if (this.status=='empty') {
                resolve(null);
            }
            if (this.status=='success') { 
                if (data) {
                    resolve(data);
                }
                else resolve('success');
            }
        }); 
    }

    setStatus(newStatus) {
        this.status = newStatus;
        return this;
    }

    findOne () {
        return this._testPromise(this);
    }

    findAll () {
        return this._testPromise();
    }

    build (data) {
        this.buildData = data;
        return this;
    }

    save () {
        return this._testPromise(this.buildData);
    }

    create () {
        return this._testPromise();
    }

    update () {
        return this._testPromise('updated');
    }

    destroy () {
        return this._testPromise('destroyed');
    }

    authenticate() {
        return this._testPromise('authenticated');
    }
}


describe('UNIT TESTS', () =>{

    describe('CUSTOM ERRORS', () => {

        const { AbstractError } = require('../errors/errors.js');

        class TestError extends AbstractError {
            constructor(info) {
                super('TEST ERROR', 'TEST ERROR STATUS CODE', info);
            }
        }
        
        const testError = new TestError([{test1:{message:"test1"}}, {test2:{message:"test2"}}]);
    
        it('Test Error name matches the supplied argument', () => {
            expect(testError.name).toMatch('TEST ERROR');
        });

            
        it('Test Error statusCode matches the supplied argument', () => {
            expect(testError.statusCode).toMatch('TEST ERROR STATUS CODE');
        });
    
        it('Test Error is custom', () => {
            expect(testError.custom).toEqual(true);

        });

        it('Test Error calls super.constructor with message as "custom error"', () => {
            expect(testError.message).toMatch('custom error');

        })
    
        it('Test Error contains additional data', () => {
            expect(testError.info).toHaveLength(2);
        });
  })


  describe('MODELS', () => {

        const sequelize = new MockSequelize(MockModel);

        const Video = require('../models/Video.js')(sequelize);
        const Audio = require('../models/Audio.js')(sequelize);
        const Permission = require('../models/Permission.js')(sequelize);
        const Role = require('../models/Role.js')(sequelize);
        const RolePermission = require('../models/RolePermission.js')(sequelize);
        const Session = require('../models/Session.js')(sequelize);
        const UserRole = require('../models/UserRole.js')(sequelize);
        const User = require('../models/User.js')(sequelize);


        it('Audio table properties are - "Id", "SongName", "AudioFilePath"', () => {
            expect(Audio.rawAttributes).toEqual(['Id', 'SongName', 'AudioFilePath']);
        });

        it('Permission table properties are - "Id", "Action", "TableName"', () => {
            expect(Permission.rawAttributes).toEqual(['Id', 'Action', 'TableName']);
        });

        it('Role table properties are - "Id", "RoleName"', () => {
            expect(Role.rawAttributes).toEqual(['Id', 'RoleName']);
        });

        it('RolePermission table properties are - "Id"', () => {
            expect(RolePermission.rawAttributes).toEqual(['Id']);
        });

        it('UserRole table properties are - "Id"', () => {
            expect(UserRole.rawAttributes).toEqual(['Id']);
        });

        it('Session table properties are - "Id", "Creation", "Expiration"', () => {
            expect(Session.rawAttributes).toEqual(['Id', 'Creation', 'Expiration']);
        });

        it('User table properties are - "Id", "UserName", "Password", "Email"', () => {
            expect(User.rawAttributes).toEqual(['Id', 'UserName', 'Password', 'Email']);
        });

        it('User.authenticate is defined', () => {
            expect(User.authenticate).toBeDefined();
        });

    })

    describe('CONTROLLERS', () => {

        const Video = require('../models/Video.js');

        const Audio = require('../models/Audio.js');
        const Session = require('../models/Session.js');
        const User = require('../models/User.js');
        const UserRole = require('../models/UserRole.js');

        const UserService = require('../services/userService.js');
        const SessionService = require('../services/sessionService.js');
        const AudioService = require('../services/audioService.js');
        const MailerService = require('../services/mailerService.js');
        const VideoService = require('../services/videoService.js');


        const userController = require('../controllers/userController.js');
        const audioController = require('../controllers/audioController.js');
        const videoController = require('../controllers/videoController.js');

        const SuccessSequelize = new MockSequelize(MockModel, 'success');
        const FailSequelize = new MockSequelize(MockModel, 'reject');
        const EmptySequelize = new MockSequelize(MockModel, 'empty');


        const SuccessDAO = { 
            sequelize: SuccessSequelize,
            Audio: Audio(SuccessSequelize), 
            Video: Video(SuccessSequelize), 
            Session: Session(SuccessSequelize), 
            User: User(SuccessSequelize),
            UserRole: UserRole(SuccessSequelize)
        };

        const FailDAO = { 
            sequelize: FailSequelize,
            Audio: Audio(FailSequelize), 
            Video: Video(FailSequelize), 
            Session: Session(FailSequelize), 
            User: User(FailSequelize),
            UserRole: UserRole(FailSequelize)
        };

        const EmptyDAO = { 
            sequelize: EmptySequelize,
            Audio: Audio(EmptySequelize), 
            Video: Video(EmptySequelize), 
            Session: Session(EmptySequelize), 
            User: User(EmptySequelize),
            UserRole: UserRole(EmptySequelize)
        };

        const mockRequest = {
            csrfToken: ()=>{},
            user: {
                id: 11
            },
            url:"/login",
            cookies: {},
            action:"PUT",
            params: {
                audioID:1,
                videoID:1
            }, 
            body:{
                UserName:1,
                Password:1
            },
            file: {
                filename:1
            }
        }

        const MockMailerService = class MockMailer {
            mail() {
                return
            }
        }


        describe('AUDIO CONTROLLER', () => {

            let mockResponse = {};
            let mockNext = {};
            
            beforeEach(() => {

                mockResponse = {
                    clearCookie: jest.fn(),
                    render: jest.fn(),
                    redirect: jest.fn(),
                    cookie: jest.fn()
                };
                mockNext = jest.fn();
            })

            it('audioController.getAudio succesfully renders response', () => {
                let loadedController = audioController.getAudio(new AudioService(SuccessDAO));
                return loadedController(mockRequest,mockResponse,mockNext).then(()=>{
                    expect(mockResponse.render).toBeCalled();
                })
            });

            it('audioController.getAudio calls next() with error!', () => {
                let loadedController = audioController.getAudio(new AudioService(FailDAO));
                return loadedController(mockRequest,mockResponse,mockNext).then(()=>{
                    expect(mockNext).toBeCalled();
                })
            });

            it('audioController.getAllAudios succesfully renders response', () => {
                let loadedController = audioController.getAllAudios(new AudioService(SuccessDAO));
                return loadedController(mockRequest,mockResponse,mockNext).then(()=>{
                    expect(mockResponse.render).toBeCalled();
                })
            });

            it('audioController.getAlludios calls next() with error!', () => {
                let loadedController = audioController.getAllAudios(new AudioService(FailDAO));
                return loadedController(mockRequest,mockResponse,mockNext).then(()=>{
                    expect(mockNext).toBeCalled();
                })
            });

            it('audioController.postAudio succesfully redirects upon new post', () => {
                let loadedController = audioController.postAudio(new AudioService(SuccessDAO));
                return loadedController(mockRequest,mockResponse,mockNext).then(()=>{
                    expect(mockResponse.redirect).toBeCalled();
                })
            });

            it('audioController.postAudio calls next() with error!', () => {
                let loadedController = audioController.postAudio(new AudioService(FailDAO));
                return loadedController(mockRequest,mockResponse,mockNext).then(()=>{
                    expect(mockNext).toBeCalled();
                })
            });

            it('audioController.putAudio succesfully redirects upon edited post', () => {
                let loadedController = audioController.putAudio(new AudioService(SuccessDAO));
                return loadedController(mockRequest,mockResponse,mockNext).then(()=>{
                    expect(mockResponse.redirect).toBeCalled();
                })
            });

            it('audioController.putAudio calls next() with error!', () => {
                let loadedController = audioController.putAudio(new AudioService(FailDAO));
                return loadedController(mockRequest,mockResponse,mockNext).then(()=>{
                    expect(mockNext).toBeCalled();
                })
            });

            it('audioController.deleteAudio succesfully redirects upon deleted post', () => {
                let loadedController = audioController.deleteAudio(new AudioService(SuccessDAO));
                return loadedController(mockRequest,mockResponse,mockNext).then(()=>{
                    expect(mockResponse.redirect).toBeCalled();
                })
            });

            it('audioController.deleteAudio calls next() with error!', () => {
                let loadedController = audioController.deleteAudio(new AudioService(FailDAO));
                return loadedController(mockRequest,mockResponse,mockNext).then(()=>{
                    expect(mockNext).toBeCalled();
                })
            });

            it('audioController.renderAudioForm renders a PUT form', () => {
                let loadedController = audioController.renderAudioForm(new AudioService(SuccessDAO));
                return loadedController(mockRequest,mockResponse,mockNext).then(()=>{
                    expect(mockResponse.render).toBeCalled();
                })
            });

            it('audioController.renderAudioForm throws error while rendering a PUT form', () => {
                let loadedController = audioController.renderAudioForm(new AudioService(FailDAO));
                return loadedController(mockRequest,mockResponse,mockNext).then(()=>{
                    expect(mockNext).toBeCalled();
                })
            });

        })


        describe('VIDEO CONTROLLER', () => {

            let mockResponse = {};
            let mockNext = {};
            
            beforeEach(() => {
        
                mockResponse = {
                    clearCookie: jest.fn(),
                    render: jest.fn(),
                    redirect: jest.fn(),
                    cookie: jest.fn()
                };
                mockNext = jest.fn();
            })
        
            it('videoController.getVideo succesfully renders response', () => {
                let loadedController = videoController.getVideo(new VideoService(SuccessDAO));
                return loadedController(mockRequest,mockResponse,mockNext).then(()=>{
                    expect(mockResponse.render).toBeCalled();
                })
            });
        
            it('videoController.getVideo calls next() with error!', () => {
                let loadedController = videoController.getVideo(new VideoService(FailDAO));
                return loadedController(mockRequest,mockResponse,mockNext).then(()=>{
                    expect(mockNext).toBeCalled();
                })
            });
        
            it('videoController.getAllVideos succesfully renders response', () => {
                let loadedController = videoController.getAllVideos(new VideoService(SuccessDAO));
                return loadedController(mockRequest,mockResponse,mockNext).then(()=>{
                    expect(mockResponse.render).toBeCalled();
                })
            });
        
            it('videoController.getAlludios calls next() with error!', () => {
                let loadedController = videoController.getAllVideos(new VideoService(FailDAO));
                return loadedController(mockRequest,mockResponse,mockNext).then(()=>{
                    expect(mockNext).toBeCalled();
                })
            });
        
            it('videoController.postVideo succesfully redirects upon new post', () => {
                let loadedController = videoController.postVideo(new VideoService(SuccessDAO));
                return loadedController(mockRequest,mockResponse,mockNext).then(()=>{
                    expect(mockResponse.redirect).toBeCalled();
                })
            });
        
            it('videoController.postVideo calls next() with error!', () => {
                let loadedController = videoController.postVideo(new VideoService(FailDAO));
                return loadedController(mockRequest,mockResponse,mockNext).then(()=>{
                    expect(mockNext).toBeCalled();
                })
            });
        
            it('videoController.putVideo succesfully redirects upon edited post', () => {
                let loadedController = videoController.putVideo(new VideoService(SuccessDAO));
                return loadedController(mockRequest,mockResponse,mockNext).then(()=>{
                    expect(mockResponse.redirect).toBeCalled();
                })
            });
        
            it('videoController.putVideo calls next() with error!', () => {
                let loadedController = videoController.putVideo(new VideoService(FailDAO));
                return loadedController(mockRequest,mockResponse,mockNext).then(()=>{
                    expect(mockNext).toBeCalled();
                })
            });
        
            it('videoController.deleteVideo succesfully redirects upon deleted post', () => {
                let loadedController = videoController.deleteVideo(new VideoService(SuccessDAO));
                return loadedController(mockRequest,mockResponse,mockNext).then(()=>{
                    expect(mockResponse.redirect).toBeCalled();
                })
            });
        
            it('videoController.deleteVideo calls next() with error!', () => {
                let loadedController = videoController.deleteVideo(new VideoService(FailDAO));
                return loadedController(mockRequest,mockResponse,mockNext).then(()=>{
                    expect(mockNext).toBeCalled();
                })
            });
        
            it('videoController.renderVideoForm renders a PUT form', () => {
                let loadedController = videoController.renderVideoForm(new VideoService(SuccessDAO));
                return loadedController(mockRequest,mockResponse,mockNext).then(()=>{
                    expect(mockResponse.render).toBeCalled();
                })
            });
        
            it('videoController.renderVideoForm throws error while rendering a PUT form', () => {
                let loadedController = videoController.renderVideoForm(new VideoService(FailDAO));
                return loadedController(mockRequest,mockResponse,mockNext).then(()=>{
                    expect(mockNext).toBeCalled();
                })
            });
        
        })
        

        describe('USER CONTROLLER', ()=>{

            let mockResponse = {};
            let mockNext = {};
            
            beforeEach(() => {

                mockResponse = {
                    clearCookie: jest.fn(),
                    render: jest.fn(),
                    redirect: jest.fn(),
                    cookie: jest.fn()
                };
                mockNext = jest.fn();
            })

            it('userController.register succesfully renders response', () => {
                let loadedController = userController.register(new UserService(SuccessDAO, new SessionService(SuccessDAO)), new MockMailerService());
                return loadedController(mockRequest,mockResponse,mockNext).then(()=>{
                    expect(mockResponse.render).toBeCalled();
                })
            });

            it('userController.register calls next() with error!', () => {
                let loadedController = userController.register(new UserService(FailDAO, new SessionService(FailDAO)), new MockMailerService());
                return loadedController(mockRequest,mockResponse,mockNext).then(()=>{
                    expect(mockNext).toBeCalled();
                })
            });

            it('userController.login succesfully renders response and creates a session cookie', () => {
                let loadedController = userController.login(new UserService(SuccessDAO, new SessionService(SuccessDAO)));
                return loadedController(mockRequest,mockResponse,mockNext).then(()=>{
                    expect(mockResponse.cookie).toBeCalled();
                    expect(mockResponse.redirect).toBeCalled();
                })
            });

            it('userController.login calls next() with error!', () => {
                let loadedController = userController.login(new UserService(FailDAO, new SessionService(FailDAO)));
                return loadedController(mockRequest,mockResponse,mockNext).then(()=>{
                    expect(mockNext).toBeCalled();
                })
            });

            it('userController.logout succesfully renders response and clears cookie from response', () => {
                let loadedController = userController.logout(new UserService(SuccessDAO, new SessionService(SuccessDAO)));
                return loadedController(mockRequest,mockResponse,mockNext).then(()=>{
                    expect(mockResponse.clearCookie).toBeCalled();
                    expect(mockResponse.redirect).toBeCalled();
                })
            });

            it('userController.logout calls next() with error!', () => {
                let loadedController = userController.logout(new UserService(FailDAO, new SessionService(FailDAO)));
                return loadedController(mockRequest,mockResponse,mockNext).then(()=>{
                    expect(mockNext).toBeCalled();
                })
            });

            it('userController.renderUserForm renders a form succesfully', () => {
                userController.renderUserForm(mockRequest,mockResponse,mockNext);
                expect(mockResponse.render.mock.calls.length).toBe(1);
            });

        })
    })

    describe('SERVICES', () => {

        const { Error404 } = require('../errors/errors.js');

        const Audio = require('../models/Audio.js');
        const Video = require('../models/Video.js');
        const Session = require('../models/Session.js');
        const User = require('../models/User.js');
        const UserRole = require('../models/UserRole.js');


        const UserService = require('../services/userService.js');
        const SessionService = require('../services/sessionService.js');
        const AudioService = require('../services/audioService.js');
        const VideoService = require('../services/videoService.js');

        const SuccessSequelize = new MockSequelize(MockModel, 'success');
        const FailSequelize = new MockSequelize(MockModel, 'reject');
        const EmptySequelize = new MockSequelize(MockModel, 'empty');


        const SuccessDAO = { 
            sequelize: SuccessSequelize,
            Audio: Audio(SuccessSequelize), 
            Video: Video(SuccessSequelize), 
            Session: Session(SuccessSequelize), 
            User: User(SuccessSequelize),
            UserRole: UserRole(SuccessSequelize)
        };

        const FailDAO = { 
            sequelize: FailSequelize,
            Audio: Audio(FailSequelize), 
            Video: Video(FailSequelize), 
            Session: Session(FailSequelize), 
            User: User(FailSequelize),
            UserRole: UserRole(FailSequelize)
        };

        const EmptyDAO = { 
            sequelize: EmptySequelize,
            Audio: Audio(EmptySequelize),
            Video: Video(EmptySequelize),  
            Session: Session(EmptySequelize), 
            User: User(EmptySequelize),
            UserRole: UserRole(EmptySequelize)
        };

        describe('AUDIO SERVICE', () => {

            it('audioService.getAudio returned promise returns Audio', () => {
                return new AudioService(SuccessDAO).getAudio({}).then(data => {
                    expect(data).toEqual([SuccessDAO.Audio]);
                });
            });

            it('audioService.getAudio returned promise rejects and throws an error', () => {
                return expect(new AudioService(FailDAO).getAudio({})).rejects.toEqual('reject');
            });
    
            it('audioService.getAudio returns Empty Data Error 404', () => {
                return expect(new AudioService(EmptyDAO).getAudio({})).rejects.toEqual(new Error404);
            });

            it('audioService.getAllAudios returned promise returns Audios', () => {
                return new AudioService(SuccessDAO).getAllAudios({}).then(data => {
                    expect(data).toEqual('success');
                });
            });

            it('audioService.getAllAudios returned promise rejects and throws an error', () => {
                return expect(new AudioService(FailDAO).getAllAudios({})).rejects.toEqual('reject');
            });

            it('audioService.createAudio returned promise returns newly created Audio', () => {
                return new AudioService(SuccessDAO).createAudio({id:11},{SongName:'s1'}, 'file1').then(data => {
                    expect(data).toEqual({"AudioFilePath": 'file1', "SongName": 's1', "UserId": 11});
                });
            });

            it('audioService.createAudio returned promise rejects and throws an error', () => {
                return expect(new AudioService(FailDAO).createAudio({}, {}, '')).rejects.toEqual('reject');
            });

            it('audioService.createAudio function throws an error - arguments not supplied', () => {
                expect(() => new AudioService(FailDAO).createAudio()).toThrow();
            });


            it('audioService.updateAudio returned promise returns "updated"', () => {
                return new AudioService(SuccessDAO).updateAudio(11,{body:{SongName:'s1'}, user:{}}, 'file1').then(data => {
                    expect(data).toEqual('updated');
                });
            });

            it('audioService.updateAudio returned promise rejects and throws an error', () => {
                return expect(new AudioService(FailDAO).updateAudio(11,{body:{SongName:'s1'}, user:{}}, 'file1')).rejects.toEqual('reject');
            });

            it('audioService.removeAudio returned promise returns "destroyed"', () => {
                return new AudioService(SuccessDAO).removeAudio({}).then(data => {
                    expect(data).toEqual('destroyed');
                });
            });

            it('audioService.removeAudio returned promise rejects and throws an error', () => {
                return expect(new AudioService(FailDAO).removeAudio({})).rejects.toEqual('reject');
            });
    
        })


        describe('VIDEO SERVICE', () => {

            it('videoService.getVideo returned promise returns Video', () => {
                return new VideoService(SuccessDAO).getVideo({}).then(data => {
                    expect(data).toEqual([SuccessDAO.Video]);
                });
            });
        
            it('videoService.getVideo returned promise rejects and throws an error', () => {
                return expect(new VideoService(FailDAO).getVideo({})).rejects.toEqual('reject');
            });
        
            it('videoService.getVideo returns Empty Data Error 404', () => {
                return expect(new VideoService(EmptyDAO).getVideo({})).rejects.toEqual(new Error404);
            });
        
            it('videoService.getAllVideos returned promise returns Videos', () => {
                return new VideoService(SuccessDAO).getAllVideos({}).then(data => {
                    expect(data).toEqual('success');
                });
            });
        
            it('videoService.getAllVideos returned promise rejects and throws an error', () => {
                return expect(new VideoService(FailDAO).getAllVideos({})).rejects.toEqual('reject');
            });
        
            it('videoService.createVideo returned promise returns newly created Video', () => {
                return new VideoService(SuccessDAO).createVideo({id:11},{VideoName:'s1'}, 'file1').then(data => {
                    expect(data).toEqual({"VideoFilePath": 'file1', "VideoName": 's1', "UserId": 11});
                });
            });
        
            it('videoService.createVideo returned promise rejects and throws an error', () => {
                return expect(new VideoService(FailDAO).createVideo({}, {}, '')).rejects.toEqual('reject');
            });
        
            it('videoService.createVideo function throws an error - arguments not supplied', () => {
                expect(() => new VideoService(FailDAO).createVideo()).toThrow();
            });
        
        
            it('videoService.updateVideo returned promise returns "updated"', () => {
                return new VideoService(SuccessDAO).updateVideo(11,{body:{VideoName:'s1'}, user:{}}, 'file1').then(data => {
                    expect(data).toEqual('updated');
                });
            });
        
            it('videoService.updateVideo returned promise rejects and throws an error', () => {
                return expect(new VideoService(FailDAO).updateVideo(11,{body:{VideoName:'s1'}, user:{}}, 'file1')).rejects.toEqual('reject');
            });
        
            it('videoService.removeVideo returned promise returns "destroyed"', () => {
                return new VideoService(SuccessDAO).removeVideo({}).then(data => {
                    expect(data).toEqual('destroyed');
                });
            });
        
            it('videoService.removeVideo returned promise rejects and throws an error', () => {
                return expect(new VideoService(FailDAO).removeVideo({})).rejects.toEqual('reject');
            });
        
        })


        describe('USER SERVICE', () => {

            const mockPermissions = [ 
                { 
                    UserName: 'admin',
                    RoleName: 'administrator',
                    Action: 'GET',
                    TableName: 'Audio' 
                },
                { 
                    UserName: 'admin',
                    RoleName: 'administrator',
                    Action: 'POST',
                    TableName: 'Audio' 
                },
                { 
                    UserName: 'admin',
                    RoleName: 'administrator',
                    Action: 'GET',
                    TableName: 'Video' 
                },
                { 
                    UserName: 'admin',
                    RoleName: 'administrator',
                    Action: 'POST',
                    TableName: 'Video' 
                },
            ];
            
            const mockPermissionTree = {
                GET: {Audio: 1, Video: 1},
                POST: {Audio: 1, Video: 1},
            };
            
            const mockBuildUser = { 
                Id: "test-id",
                Email: "test-email",
                UserName: "test-user"
            }
                   

            it('userService.createUser succesfully creates a new User', () => {
                return new UserService(SuccessDAO, new SessionService(SuccessDAO)).createUser({}).then(data => {
                    expect(data).toEqual('success');
                });
            });

            it('userService.createUser returned promise rejects and throws an error', () => {
                return expect(new UserService(FailDAO, new SessionService(FailDAO)).createUser({})).rejects.toEqual('reject');
            });

            it('userService.getUser returns a user', () => {
                return new UserService(SuccessDAO, new SessionService(SuccessDAO)).getUser({}).then(User => {
                    expect(User).toBeDefined();
                });
            });

            it('userService.getUser returns NO user', () => {
                return expect(new UserService(EmptyDAO, new SessionService(EmptyDAO)).getUser({})).rejects.toEqual(new Error404);
            });

            it('userService.getUser fails', () => {
                return expect(new UserService(FailDAO, new SessionService(FailDAO)).getUser({})).rejects.toEqual('reject');
            });

            it('userService.getUserPermissions returns permissions', () => {
                return new UserService(SuccessDAO, new SessionService(SuccessDAO)).getUserPermissions({}).then(permissions => {
                    expect(permissions).toBeTruthy();
                });
            });

            it('userService.getUserPermissions returns empty permissions', () => {
                return new UserService(EmptyDAO, new SessionService(EmptyDAO)).getUserPermissions({}).then(permissions => {
                    expect(permissions).toEqual([]);
                });
            });

            it('userService.getUserPermissions throws error', () => {
                return expect(new UserService(FailDAO, new SessionService(FailDAO)).getUserPermissions({})).rejects.toEqual('reject');
            });


            it('userService.loginUser - login SUCCESFUL', () => {
                return new UserService(SuccessDAO, new SessionService(SuccessDAO)).loginUser({}).then(boolean => {
                    expect(boolean).toEqual('success');
                });
            });

            it('userService.loginUser - login FAILS', () => {
                return expect(new UserService(EmptyDAO, new SessionService(EmptyDAO)).loginUser({})).rejects.toEqual(new Error404);
            });

            it('userService.loginUser returned promise rejects and throws an error', () => {
                return expect(new UserService(FailDAO, new SessionService(FailDAO)).logoutUser({})).rejects.toEqual('reject');
            });

            it('userService.logoutUser - logout SUCCESFUL', () => {
                return new UserService(SuccessDAO, new SessionService(SuccessDAO)).logoutUser({}).then(boolean => {
                    expect(boolean).toEqual('destroyed');
                });
            });

            it('userService.logoutUser - logout FAILS', () => {
                return expect(new UserService(EmptyDAO, new SessionService(EmptyDAO)).logoutUser({})).rejects.toEqual(new Error404);
            });

            it('userService.logoutUser returned promise rejects and throws an error', () => {
                return expect(new UserService(FailDAO, new SessionService(FailDAO)).logoutUser({})).rejects.toEqual('reject');
            });

            it('userService._buildPermissionTree returns empty permission tree object correctly', () => {
                return expect(new UserService(FailDAO, new SessionService(FailDAO))._buildPermissionTree({})).toEqual({});
            });

            it('userService._buildPermissionTree builds the permission treee succesfully', () => {
                return expect(new UserService(FailDAO, new SessionService(FailDAO))._buildPermissionTree(mockPermissions)).toEqual(mockPermissionTree);
            });

            it('userService.checkPermission returns false - permission denined', () => {
                return expect(new UserService(FailDAO, new SessionService(FailDAO)).checkPermission(mockPermissionTree)("GET", "Audio")).toEqual(true);
            });

            it('userService.checkPermission returns true - permission granted', () => {
                return expect(new UserService(FailDAO, new SessionService(FailDAO)).checkPermission(mockPermissionTree)("GET", "Audio")).toEqual(true);
            });

            it('userService.buildUser is logged in with permissions', () => {
                let user = new UserService(FailDAO, new SessionService(FailDAO)).buildUser(mockBuildUser, mockPermissions, true);
                expect(user.permissions).toEqual(mockPermissionTree);
                expect(user.loggedIn).toEqual(true);
                return;
            });

            it('userService.buildUser is NOT logged in and has NO permissions', () => {
                let user = new UserService(FailDAO, new SessionService(FailDAO)).buildUser({},[], false);
                expect(user.permissions).toEqual({});
                expect(user.loggedIn).toEqual(false);
                return;
            });

        })

        describe('SESSION SERVICE', ()=>{
            
            it('sessionService.getSession returned promise returns Session', () => {
                return new SessionService(SuccessDAO).getSession({}).then(data => {
                    expect(data).toEqual(SuccessDAO.Session);
                });
            });

            it('sessionService.getSession returned promise rejects and throws an error', () => {
                return expect(new SessionService(FailDAO).getSession({})).rejects.toEqual('reject');
            });


            it('sessionService.createSession returns a new Session', () => {
                return new SessionService(SuccessDAO).createSession({}).then(data => {
                    expect(data).toEqual('success');
                });
            });

            it('sessionService.createSession throws error', () => {
                return expect(new SessionService(FailDAO).createSession({})).rejects.toEqual('reject');
            });

            it('sessionService.deletesSession deletes a session', () => {
                return new SessionService(SuccessDAO).deleteSession({}).then(data => {
                    expect(data).toEqual('destroyed');
                });
            });

            it('sessionService.deleteSession throws error', () => {
                return expect(new SessionService(FailDAO).deleteSession({})).rejects.toEqual('reject');
            });
        })

    })


    describe('MIDDLEWARES', () => {

        const resourceInjector = require('../middlewares/resourceInjector.js');
        const actionInjector = require('../middlewares/actionInjector.js');
        const formKeyValidator = require('../middlewares/formKeyValidator.js');
        const formSanitizer = require('../middlewares/formSanitizer.js');
        const authRequired = require('../middlewares/authorizationRequired.js');
        const loginRequired = require('../middlewares/loginRequired.js');
        const logoutRequired = require('../middlewares/logoutRequired.js');
        const killCSRF = require('../middlewares/killCSRF.js');
        const buildRequestUser = require('../middlewares/buildRequestUser.js');

        it('killCSRF injects request object succesfully!', () => {
            let mockRequest = {};
            killCSRF(mockRequest, {}, ()=>{});
            expect(mockRequest.csrfToken).toBeDefined();
        });

        it('resurceInjector injects request object succesfully!', () => {
            let loadedInjector = resourceInjector('test-resource');
            let mockRequest = {};
            loadedInjector(mockRequest, {}, ()=>{});
            expect(mockRequest.resource).toEqual('test-resource');
        });

        it('actionInjector injects request object succesfully!', () => {
            let loadedInjector = actionInjector('test-action');
            let mockRequest = {};
            loadedInjector(mockRequest, {}, ()=>{});
            expect(mockRequest.action).toEqual('test-action');
        });


        it('formKeyValidator validates succesfully!', () => {
            let mockNext = (error) => error ? false : true;
            let loadedFormValidator = formKeyValidator({'user':'test-user', 'age': 20, password:'abcdef'});
            expect(loadedFormValidator({body:{'user':'test-user', 'age':20, 'password':'abcdef', Z:'1'}}, {}, mockNext)).toEqual(true);
        });

        it('formKeyValidator wrong keys supplied!', () => {
            let mockNext = (error) => error ? false : true;
            let loadedFormValidator = formKeyValidator({'user':'test-user', 'age': 20, password:'abcdef'});
            expect(loadedFormValidator({body:{'wrong-user-key':'test-user', 'age':20, 'password':'abcdef', Z:'1'}}, {}, mockNext)).toEqual(false);
        });


        it('formSanitizer properly sanitizes inputs and prevents xss', () => {
            const mockRequest = {
                body:{
                    'user':"<script>xss</script>", 
                    'password':"<div>xss</div>",
                    'email':"<script>xss</script>"
                }
            };
            formSanitizer(mockRequest, {}, ()=>{});
            expect(mockRequest.body).toEqual({
                'user':"&lt;script&gt;xss&lt;&#x2F;script&gt;",
                'password':"&lt;div&gt;xss&lt;&#x2F;div&gt;", 
                'email':"&lt;script&gt;xss&lt;&#x2F;script&gt;"}
            );
        });

        it('logoutRequired - User is not logged in, return true!', () => {
            let mockRequestUser = {user:{loggedIn: false}};
            let mockNext = (error) => error ? false : true;
            expect(logoutRequired(mockRequestUser, {}, mockNext)).toEqual(true);
        });

        it('logoutRequired - User is logged in, return false!', () => {
            let mockRequestUser = {user:{loggedIn: true}};
            let mockNext = (error) => error ? false : true;
            expect(logoutRequired(mockRequestUser, {}, mockNext)).toEqual(false);
        });


        it('loginRequired - User is not logged in, return false!', () => {
            let mockRequestUser = {user:{loggedIn: false}};
            let mockNext = (error) => error ? false : true;
            expect(loginRequired(mockRequestUser, {}, mockNext)).toEqual(false);
        });

        it('loginRequired - User is logged in, return true!', () => {
            let mockRequestUser = {user:{loggedIn: true}};
            let mockNext = (error) => error ? false : true;
            expect(loginRequired(mockRequestUser, {}, mockNext)).toEqual(true);
        });

        it('authRequired - User does have the permission, return true!', () => {
            let mockRequestUser = {user:{checkPermission: () => true}};
            let mockNext = (error) => error ? false : true;
            expect(authRequired(mockRequestUser, {}, mockNext)).toEqual(true);
        });

        it('authRequired - User does not have the permission, return false!', () => {
            let mockRequestUser = {user:{checkPermission: () => false}};
            let mockNext = (error) => error ? false : true;
            expect(authRequired(mockRequestUser, {}, mockNext)).toEqual(false);
        });

    })

})
