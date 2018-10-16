require('dotenv').config();  // populate process.env with .env file variables

process.env.ENVIRONMENT='TEST'; // override ONLY FOR THE TESTS!

const crypto = require('crypto');

const request = require('supertest');
const app = require('../app.js');
const DAO = require('../models/core.js');


async function populateDB(DAO) {
    try {
        // create permissions
        await DAO.Permission.create({Id: 1, Action:'GET', TableName:'Audio'});
        await DAO.Permission.create({Id: 2, Action:'POST', TableName:'Audio'});
        await DAO.Permission.create({Id: 3, Action:'PUT', TableName:'Audio'});
        await DAO.Permission.create({Id: 4, Action:'DELETE', TableName:'Audio'});
        await DAO.Permission.create({Id: 5, Action:'GET', TableName:'Video'});
        await DAO.Permission.create({Id: 6, Action:'POST', TableName:'Video'});
        await DAO.Permission.create({Id: 7, Action:'PUT', TableName:'Video'});
        await DAO.Permission.create({Id: 8, Action:'DELETE', TableName:'Video'});
        // create roles
        await DAO.Role.create({Id: 1, RoleName:'admin'});
        await DAO.Role.create({Id: 2, RoleName:'uploader'});
        await DAO.Role.create({Id: 3, RoleName:'viewer'});
        // admin permissions - GET, POST, PUT, DELETE
        await DAO.RolePermission.create({Id: 1, RoleId:1, PermissionId: 1});
        await DAO.RolePermission.create({Id: 2, RoleId:1, PermissionId: 2});
        await DAO.RolePermission.create({Id: 3, RoleId:1, PermissionId: 3});
        await DAO.RolePermission.create({Id: 4, RoleId:1, PermissionId: 4});
        await DAO.RolePermission.create({Id: 5, RoleId:1, PermissionId: 5});
        await DAO.RolePermission.create({Id: 6, RoleId:1, PermissionId: 6});
        await DAO.RolePermission.create({Id: 7, RoleId:1, PermissionId: 7});
        await DAO.RolePermission.create({Id: 8, RoleId:1, PermissionId: 8});
        // uploader permissions - POST, PUT
        await DAO.RolePermission.create({Id: 9, RoleId:2, PermissionId: 2});
        await DAO.RolePermission.create({Id: 10, RoleId:2, PermissionId: 3});
        await DAO.RolePermission.create({Id: 11, RoleId:2, PermissionId: 6});
        await DAO.RolePermission.create({Id: 12, RoleId:2, PermissionId: 7});
        // viewer permissions - GET
        await DAO.RolePermission.create({Id: 13, RoleId:3, PermissionId: 1});
        await DAO.RolePermission.create({Id: 14, RoleId:3, PermissionId: 5});
        // create users
        await DAO.User.create({UserName: 'master', Password: 'masterpass', Email: 'master@master.master'})
        await DAO.User.create({UserName: 'moderator', Password: 'moderatorpass', Email: 'mod@mod.mod'})
        await DAO.User.create({UserName: 'user', Password: 'userpass', Email: 'user@user.user'})
        // assign roles to users
        await DAO.UserRole.create({UserId: 1, RoleId:1}) // master - admin
        await DAO.UserRole.create({UserId: 2, RoleId:2}) // moderator - uploader
        await DAO.UserRole.create({UserId: 3, RoleId:3}) // user - viewer
        // login the master-admin user
        await DAO.Session.create({Id: crypto.randomBytes(12).toString('hex'), UserId:1,
            Creation: Date.now(), Expiration: Date.now() + process.env.SESSION_DURATION_TEST})
        // logint the user-viewer
        await DAO.Session.create({Id: crypto.randomBytes(12).toString('hex'), UserId:3,
            Creation: Date.now(), Expiration: Date.now() + process.env.SESSION_DURATION_TEST})
        // create test resources - id - 1
        await DAO.Audio.create({Id:1, SongName:'testsong', AudioFilePath:'testpath', UserId:1})
        await DAO.Video.create({Id:1, VideoName:'testvideo', VideoFilePath:'testpath', UserId:1})
        // create test resources - id - 7
        await DAO.Audio.create({Id:7, SongName:'testsong7', AudioFilePath:'testpath7', UserId:3})
        await DAO.Video.create({Id:7, VideoName:'testvideo7', VideoFilePath:'testpath7', UserId:3})
    }
    catch (error) {
        console.log("test DB population function failed");
    }
}


beforeAll(() => {
    return DAO.sequelize.authenticate()
        .then(() => { // db connected
            return DAO.sequelize.sync();
        })
        .then(()=>{ // db synced
            return populateDB(DAO);
        })
        .then(()=>{ // db populated
            return 1;
        })
        .catch((error) => {
            console.log(error);
        })
});

describe('INTEGRATION TESTS', () =>{

    
    describe('GUEST - NOT AUTHENTICATED', ()=>{

        describe('USER ROUTES', ()=>{
            
            it('GET index renders correctly', () => {
                return request(app)
                    .get('/')
                    .expect(200)
            });

            it('GET about renders correctly', () => {
                return request(app)
                    .get('/about')
                    .expect(200)
            });
        
            it('GET login page renders correctly', () => {
                return request(app)
                    .get('/login')
                    .expect(200)
            });
    
            it('GET register page renders correctly', () => {
                return request(app)
                    .get('/register')
                    .expect(200)
            });
    
            it('GET logout page does not render - response 401 - not authenticated', () => {
                return request(app)
                    .get('/logout')
                    .expect(401)
            });
    
            it('POST register succesfully register a new testuser, 200', () => {
                return request(app)
                    .post('/register')
                    .type('form')
                    .send("UserName=testuser2")
                    .send("Password=testpass2")
                    .send("Email=mail2@mail.com")
                    .expect(200)
            });
            
            it('POST login should return 404 since test-user does not exist', () => {
                return request(app)
                    .post('/login')
                    .type('form')
                    .send("UserName=nouser")
                    .send("Password=nopass")
                    .expect(404)
            });
            
            it('POST login should redirect to index upon succesful login since moderator exists', () => {
                return request(app)
                    .post('/login')
                    .type('form')
                    .send("UserName=moderator")
                    .send("Password=moderatorpass")
                    .expect(302)
            });
            
            
            it('POST logout page does not redirect - response 401 - not authenticated', () => {
                return request(app)
                    .post('/logout')
                    .expect(401)
            });
        })


        describe('AUDIO ROUTES', ()=>{
            it('GET audios list does not render - response 401 - not authenticated', () => {
                return request(app)
                    .get('/audios')
                    .expect(401)
            }); 
    
            it('GET audios detail does not render - response 401 - not authenticated', () => {
                return request(app)
                    .get('/audios/1/')
                    .expect(401)
            }); 
    
            it('GET audios post form does not render - response 401 - not authenticated', () => {
                return request(app)
                    .get('/audios/new')
                    .expect(401)
            }); 
    
            it('GET audios post edit form does not render - response 401 - not authenticated', () => {
                return request(app)
                    .get('/audios/1/edit')
                    .expect(401)
            }); 
    
            it('GET audios get delete form does not render - response 401 - not authenticated', () => {
                return request(app)
                    .get('/audios/1/delete')
                    .expect(401)
            });
    
            it('POST new audio is not created - response 401 - not authenticated', () => {
                return request(app)
                    .post('/audios')
                    .expect(401)
            }); 
    
    
            it('POST audios is not edited - response 401 - not authenticated', () => {
                return request(app)
                    .post('/audios/1/edit')
                    .expect(401)
            }); 
    
    
            it('POST audio is not deleted - response 401 - not authenticated', () => {
                return request(app)
                    .post('/audios/1/delete')
                    .expect(401)
            }); 
        })


        describe('VIDEO ROUTES', ()=>{
            it('GET videos list does not render - response 401 - not authenticated', () => {
                return request(app)
                    .get('/videos')
                    .expect(401)
            }); 
        
            it('GET videos detail does not render - response 401 - not authenticated', () => {
                return request(app)
                    .get('/videos/1/')
                    .expect(401)
            }); 
        
            it('GET videos post form does not render - response 401 - not authenticated', () => {
                return request(app)
                    .get('/videos/new')
                    .expect(401)
            }); 
        
            it('GET videos post edit form does not render - response 401 - not authenticated', () => {
                return request(app)
                    .get('/videos/1/edit')
                    .expect(401)
            }); 
        
            it('GET videos get delete form does not render - response 401 - not authenticated', () => {
                return request(app)
                    .get('/videos/1/delete')
                    .expect(401)
            });
        
            it('POST new video is not created - response 401 - not authenticated', () => {
                return request(app)
                    .post('/videos')
                    .expect(401)
            }); 
        
        
            it('POST videos is not edited - response 401 - not authenticated', () => {
                return request(app)
                    .post('/videos/1/edit')
                    .expect(401)
            }); 
        
        
            it('POST video is not deleted - response 401 - not authenticated', () => {
                return request(app)
                    .post('/videos/1/delete')
                    .expect(401)
            }); 
        })

    })


    describe('AUTHENTICATED - ADMIN', ()=>{

        let adminSessionId;

        beforeAll(()=>{
            return DAO.Session.findOne({where:{UserId:1}})
                .then((session)=>{
                    adminSessionId = session.dataValues.Id;
                })
        })

        describe('USER ROUTES', ()=>{

        
            it('GET login page does not render - response 500 - authenticated', () => {
                return request(app)
                    .get('/login')
                    .set('Cookie', [`session_id=${adminSessionId}`])
                    .expect(500)
            });
    
            it('GET register page renders correctly', () => {
                return request(app)
                    .get('/register')
                    .set('Cookie', [`session_id=${adminSessionId}`])
                    .expect(200)
            });
    
            it('GET logout page does render - response 200 - authenticated', () => {
                return request(app)
                    .get('/logout')
                    .set('Cookie', [`session_id=${adminSessionId}`])
                    .expect(200)
            });
    
        })


        describe('AUDIO ROUTES', ()=>{

            it('GET audios does render - response 200 - authenticated', () => {
                return request(app)
                    .get('/audios')
                    .set('Cookie', [`session_id=${adminSessionId}`])
                    .expect(200)
            }); 
    
            it('GET audios detail does render - response 200 - authenticated', () => {
                return request(app)
                    .get('/audios/1/')
                    .set('Cookie', [`session_id=${adminSessionId}`])
                    .expect(200)
            }); 
    
            it('GET audios post form does render - response 200 - authenticated', () => {
                return request(app)
                    .get('/audios/new')
                    .set('Cookie', [`session_id=${adminSessionId}`])
                    .expect(200)
            }); 
    
            it('GET audios post edit form does render - response 200 - authenticated', () => {
                return request(app)
                    .get('/audios/1/edit')
                    .set('Cookie', [`session_id=${adminSessionId}`])
                    .expect(200)
            }); 
    
            it('GET audios get delete form does render - response 200 - authenticated', () => {
                return request(app)
                    .get('/audios/1/delete')
                    .set('Cookie', [`session_id=${adminSessionId}`])
                    .expect(200)
            });
    
            it('POST new audio is not created - response 500 - authenticated & file is missing', () => {
                return request(app)
                    .post('/audios')
                    .set('Cookie', [`session_id=${adminSessionId}`])
                    .field('SongName', 'testsong22')
                    .expect(500)
            }); 
    
    
            it('POST audios is edited - response 500 - authenticated & file is missing', () => {
                return request(app)
                    .post('/audios/1/edit')
                    .set('Cookie', [`session_id=${adminSessionId}`])
                    .field('SongName', 'testsong22edited')
                    .expect(500)
            }); 
    
    
            it('POST audio is deleted - response 302 - authenticated & authorized', () => {
                return request(app)
                    .post('/audios/1/delete')
                    .set('Cookie', [`session_id=${adminSessionId}`])
                    .expect(302)
            }); 

        })


        describe('VIDEO ROUTES', ()=>{

            it('GET videos does render - response 200 - authenticated', () => {
                return request(app)
                    .get('/videos')
                    .set('Cookie', [`session_id=${adminSessionId}`])
                    .expect(200)
            }); 
        
            it('GET videos detail does render - response 200 - authenticated', () => {
                return request(app)
                    .get('/videos/1/')
                    .set('Cookie', [`session_id=${adminSessionId}`])
                    .expect(200)
            }); 
        
            it('GET videos post form does render - response 200 - authenticated', () => {
                return request(app)
                    .get('/videos/new')
                    .set('Cookie', [`session_id=${adminSessionId}`])
                    .expect(200)
            }); 
        
            it('GET videos post edit form does render - response 200 - authenticated', () => {
                return request(app)
                    .get('/videos/1/edit')
                    .set('Cookie', [`session_id=${adminSessionId}`])
                    .expect(200)
            }); 
        
            it('GET videos get delete form does render - response 200 - authenticated', () => {
                return request(app)
                    .get('/videos/1/delete')
                    .set('Cookie', [`session_id=${adminSessionId}`])
                    .expect(200)
            });
        
            it('POST new video is not created - response 500 - authenticated & file is missing', () => {
                return request(app)
                    .post('/videos')
                    .set('Cookie', [`session_id=${adminSessionId}`])
                    .field('SongName', 'testsong22')
                    .expect(500)
            }); 
        
        
            it('POST videos is edited - response 500 - authenticated & file is missing', () => {
                return request(app)
                    .post('/videos/1/edit')
                    .set('Cookie', [`session_id=${adminSessionId}`])
                    .field('SongName', 'testsong22edited')
                    .expect(500)
            }); 
        
        
            it('POST video is deleted - response 302 - authenticated & authorized', () => {
                return request(app)
                    .post('/videos/1/delete')
                    .set('Cookie', [`session_id=${adminSessionId}`])
                    .expect(302)
            }); 
        
        })

    })


    describe('AUTHENTICATED - VIEWER', ()=>{

        let viewerSessionId;

        beforeAll(()=>{
            return DAO.Session.findOne({where:{UserId:3}})
                .then((session)=>{
                    viewerSessionId = session.dataValues.Id;
                })
        })

        describe('USER ROUTES', ()=>{

        
            it('GET login page does not render - response 500 - authenticated', () => {
                return request(app)
                    .get('/login')
                    .set('Cookie', [`session_id=${viewerSessionId}`])
                    .expect(500)
            });
    
            it('GET register page renders correctly', () => {
                return request(app)
                    .get('/register')
                    .set('Cookie', [`session_id=${viewerSessionId}`])
                    .expect(200)
            });
    
            it('GET logout page does render - response 200 - authenticated', () => {
                return request(app)
                    .get('/logout')
                    .set('Cookie', [`session_id=${viewerSessionId}`])
                    .expect(200)
            });
    
        })


        describe('AUDIO ROUTES', ()=>{

            it('GET audios does render - response 200 - authenticated', () => {
                return request(app)
                    .get('/audios')
                    .set('Cookie', [`session_id=${viewerSessionId}`])
                    .expect(200)
            }); 
    
            it('GET audios detail does render - response 200 - authenticated', () => {
                return request(app)
                    .get('/audios/7/')
                    .set('Cookie', [`session_id=${viewerSessionId}`])
                    .expect(200)
            }); 
    
            it('GET audios post form does not render - response 403 - not authorized', () => {
                return request(app)
                    .get('/audios/new')
                    .set('Cookie', [`session_id=${viewerSessionId}`])
                    .expect(403)
            }); 
    
            it('GET audios post edit form does not render - response 403 - not authorized', () => {
                return request(app)
                    .get('/audios/7/edit')
                    .set('Cookie', [`session_id=${viewerSessionId}`])
                    .expect(403)
            }); 
    
            it('GET audios get delete form does not render - response 403 - not authorized', () => {
                return request(app)
                    .get('/audios/7/delete')
                    .set('Cookie', [`session_id=${viewerSessionId}`])
                    .expect(403)
            });
    
            it('POST new audio is not created - response 403 - not authorized', () => {
                return request(app)
                    .post('/audios')
                    .set('Cookie', [`session_id=${viewerSessionId}`])
                    .field('SongName', 'testsong22')
                    .expect(403)
            }); 
    
    
            it('POST audios is not edited - response 403 - not authorized', () => {
                return request(app)
                    .post('/audios/7/edit')
                    .set('Cookie', [`session_id=${viewerSessionId}`])
                    .field('SongName', 'testsong22edited')
                    .expect(403)
            }); 
    
    
            it('POST audio is not deleted - response 403 - not authorized', () => {
                return request(app)
                    .post('/audios/7/delete')
                    .set('Cookie', [`session_id=${viewerSessionId}`])
                    .expect(403)
            }); 

        })


        describe('VIDEO ROUTES', ()=>{

            it('GET videos does render - response 200 - authenticated', () => {
                return request(app)
                    .get('/videos')
                    .set('Cookie', [`session_id=${viewerSessionId}`])
                    .expect(200)
            }); 
        
            it('GET videos detail does render - response 200 - authenticated', () => {
                return request(app)
                    .get('/videos/7/')
                    .set('Cookie', [`session_id=${viewerSessionId}`])
                    .expect(200)
            }); 
        
            it('GET videos post form does not render - response 403 - not authorized', () => {
                return request(app)
                    .get('/videos/new')
                    .set('Cookie', [`session_id=${viewerSessionId}`])
                    .expect(403)
            }); 
        
            it('GET videos post edit form does not render - response 403 - not authorized', () => {
                return request(app)
                    .get('/videos/7/edit')
                    .set('Cookie', [`session_id=${viewerSessionId}`])
                    .expect(403)
            }); 
        
            it('GET videos get delete form does not render - response 403 - not authorized', () => {
                return request(app)
                    .get('/videos/7/delete')
                    .set('Cookie', [`session_id=${viewerSessionId}`])
                    .expect(403)
            });
        
            it('POST new video is not created - response 403 - not authorized', () => {
                return request(app)
                    .post('/videos')
                    .set('Cookie', [`session_id=${viewerSessionId}`])
                    .field('SongName', 'testsong22')
                    .expect(403)
            }); 
        
        
            it('POST videos is not edited - response 403 - not authorized', () => {
                return request(app)
                    .post('/videos/7/edit')
                    .set('Cookie', [`session_id=${viewerSessionId}`])
                    .field('SongName', 'testsong22edited')
                    .expect(403)
            }); 
        
        
            it('POST video is not deleted - response 403 - not authorized', () => {
                return request(app)
                    .post('/videos/7/delete')
                    .set('Cookie', [`session_id=${viewerSessionId}`])
                    .expect(403)
            }); 
        
        })


    })

})

