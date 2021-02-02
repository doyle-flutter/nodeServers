/* 
[ Server Side FrameWork ]
    (0) Node.js
    (1) ExpressJS
    (2) Koa
    (3) FeathersJS
    (4) Restify
    (5) KeystoneJS
    (6) HapiJS
*/
var controller = ({path, data, type}) => {
    if(type ==='json') return {path, data};
    return `<h2>${data}</h2><p>${data}</p>`
};
var dynamicPathController = ({data})     => ({data});
var qsController = ({data}) => ({'qs':data});
var qs = require('querystring');

/*
[ DB 준비 ]

(1) 데이터베이스 생성
  > CREATE DATABASE servers;
(2) 사용 할 데이터베이스 지정
  > USE servers
(4) 테이블 생성
  > CREATE TABLE datas (
      id int AUTO_INCREMENT,
      name TEXT NOT NULL,
      age TEXT NOT NULL,
      PRIMARY KEY (id)
    );
(5) 데이터 생성(미리 준비)
   > INSERT INTO datas VALUES (1, 'kkk', '20');
   > INSERT INTO datas VALUES (2, 'sss', '21');
   > INSERT INTO datas VALUES (3, 'jjj', '22');
(*) 생성 된 데이터베이스 확인
   > SHOW DATABASES;
(*) 생성 된 데이블 확인
   > SHOW TABLES;
(*) 생성 된 데이터 확인
   > SELECT * FROM datas;
(*) 동작 중인 MySQL 포트 확인
   > SHOW GLOBAL VARIABLES LIKE 'PORT';
*/

var mysql = require('mysql');
var dbOptions = {
    host: 'localhost',
    user: 'root',
    password: 'abc123456',
    database: 'servers',
    port: 3306
};
var connection = mysql.createConnection(dbOptions);
connection.connect();
var sqlReadAllQuery = "SELECT * FROM datas";
var sqlHandel = (req,res) => connection.query(sqlReadAllQuery, [],(err, result, f) => res.json(result));

// Socket.js
var socket = require('socket.io');
var socketCorsOptions = {
    origin: "http://localhost:3020",
    methods: ["GET", "POST"],
};

// Node.js
var fs = require('fs'),
    path = require('path');
var app = require('http').createServer((req,res) => {
    if(req.url == '/favicon.ico') return;
    if(req.url.split('/')[1] === 'dynamicPath'){
        if(req.url.split('/')[2]!= undefined){
            res.writeHead(200, {'Content-Type':'application/json'});
            return res.end(`data : ${req.url.split('/')[2]}`);    
        }
        res.writeHead(200, {'Content-Type':'application/json'});
        return res.end(`data : dy`);
    }
    if(req.url === '/db'){
        res.writeHead(200, {'Content-Type':'application/json'});
        return connection.query(sqlReadAllQuery, [], (err, results, f) => res.end(JSON.stringify(results)));
    }
    if(req.url.includes('/qs')){
        res.writeHead(200, {'Content-Type':'application/json'});
        var data = req.url.split('?')[1].split("=")[1];
        return res.end( JSON.stringify(qsController({data})) );
    }
    switch(req.url){
        default : {
            res.writeHead(200, {'Content-Type':'application/json'});
            return res.end( JSON.stringify(controller({path:'/', data:"Node.js", type: 'json'})) );
        }
        case '/sub' : {
            res.writeHead(200,{'Content-Type':'text/html'});
            return res.end( controller({path:'/sub', data:"Node.js", type: ''}) );
        }
        case '/list' : {
            res.writeHead(200, {"Content-Type": 'text/html'});
            return res.end(fs.readFileSync(path.join(__dirname, './intro.html')));
        }
    }
});
app.listen(3020);
var io = socket(app,{cors:socketCorsOptions});
io.on('connect', (soc) => {
    console.log("Node.js Socket.io");
    soc.emit('ready', "Hi Node.js Client");
});

//  [ ExpressJS ]
var express = require('express');
var expressApp = express();
var cors = require('cors');
expressApp.use(cors());
expressApp.get('/', (req,res) => res.json( controller({path: '/', data: "ExpressJS", type: 'json'}) ));
expressApp.get('/sub', (req,res) => res.send( controller({path: '/sub', data: "ExpressJS", type: ''}) ));
expressApp.get('/dynamicPath/:data', (req,res) => res.json( dynamicPathController({data: req.params.data}) ));
// expressApp.get('/qs', (req,res) => res.json(qsController({data: req.query.data}))); // 충돌
expressApp.get('/qs', (req,res) => res.json(qsController({data: qs.parse(req.url.split('?')[1]).data})));
expressApp.get('/db', sqlHandel)
// expressApp.listen(3030, _ => console.log("ExpressJS :3030"));

var expressHttp = require('http').createServer(expressApp);
var expressIo = socket(expressHttp,{cors: socketCorsOptions});
expressHttp.listen(3030, _ => console.log("ExpressJS :3030"));
expressIo.on('connect', (soc) => {
    console.log("Express Socket.io");
    soc.emit('ready', "Hi Express Client");
});


//  [ KoaJS]

/* mysql2.promise() */
var mysql2 = require('mysql2');
var mysql2Connection = mysql2.createConnection(dbOptions);

/* mysql2 async-await */
var mysql2Promise = require('mysql2');
var mysql2PromiseConnectionPool = mysql2Promise.createPool(dbOptions);
var mysql2Async = async () => {
    var pool = mysql2PromiseConnectionPool.promise();
    return await pool.query(sqlReadAllQuery);
}

var Koa = require('koa'), 
    koaApp = new Koa(),
    KoaRouter = require('koa-router'),
    koaRouter = KoaRouter();
// koaApp.listen(3040, _ => console.log("KOA :3040"));

var koaHttp = require('http').createServer(koaApp);
var koaSocket = socket(koaHttp,{cors: socketCorsOptions});
koaHttp.listen(3040, _ => console.log("Koa :3040"));
koaSocket.on('connect', (soc) => {
    console.log("Koa Socket.io");
    soc.emit('ready', "Hi Koa Client");
});

koaRouter.get('/dynamicPath/:data', (ctx, next) => ctx.body = dynamicPathController({data: ctx.params.data}));
koaRouter.get('/qs', (ctx, next) => ctx.body = qsController({data: ctx.query.data}));
koaRouter.get('/db', async (ctx, next) => {
    /* mysql2 */
    // return mysql2Connection.promise().query(sqlReadAllQuery)
    //     .then( ([rows,fields]) => {
    //         console.log(rows)
    //         return ctx.body = rows;
    //     })
    //     .catch(() => {
    //         return ctx.body = "ERROR"
    //     });

    /* mysql2 async-await */
    var [results, f] = await mysql2Async();
    return ctx.body = results;
});
koaApp.use(koaRouter.routes());
koaApp.use(async ctx => {
    switch(ctx.path){
        default : {
            return ctx.body = controller({path: '/', data: "KoaJS", type: 'json'});
        }
        case '/sub' : {
            return ctx.body = controller({path: '/sub', data: "KoaJS", type: ''}) ;
        }
    }
});

//  [ FeathersJS ]
var feathers = require('@feathersjs/feathers'), 
    fExpress = require('@feathersjs/express'), 
    feathersApp = fExpress(feathers());

var feathersHttp = require('http').createServer(feathersApp);
var feathersSocket = socket(feathersHttp,{cors: socketCorsOptions});
feathersHttp.listen(3050, _ => console.log("Feathers :3050"));
feathersSocket.on('connect', (soc) => {
    console.log("Feathers Socket.io");
    soc.emit('ready', "Hi Feathers Client");
});

// feathersApp.listen(3050).on('listening', () => console.log('Feathers :3050'));
feathersApp.use(fExpress.json());
feathersApp.use(fExpress.urlencoded({ extended: true }));
feathersApp.configure(fExpress.rest());
feathersApp.get('/', (req,res) => res.json( controller({path: '/', data: "FeathersJS", type: 'json'}) ));
feathersApp.get('/sub', (req,res) => res.send( controller({path: '/sub', data: "FeathersJS", type: ''}) ));
feathersApp.get('/dynamicPath/:data', (req,res) => res.json( dynamicPathController({data: req.params.data}) ));
feathersApp.get('/qs', (req,res) => res.json( qsController({data: qs.parse(req.url.split('?')[1]).data}) ));
feathersApp.get('/db', sqlHandel);

//  [ RestifyJS ]
var restify = require('restify'),
    restifyServer = restify.createServer();
// restifyServer.listen(3060, _ => console.log('Restify :3060'));

var restifyHttp = require('http').createServer(restifyServer);
var restifySocket = socket(restifyHttp,{cors: socketCorsOptions});
restifyHttp.listen(3060, _ => console.log("Restify :3060"));
restifySocket.on('connect', (soc) => {
    console.log("Restify Socket.io");
    soc.emit('ready', "Hi Restify Client");
});

restifyServer.get('/', (req,res) => res.json( controller({path: '/', data: "RestifyJS", type: 'json'}) ));
restifyServer.get('/sub', (req,res) => {
    res.setHeader("Content-Type","text/html");
    return res.sendRaw( controller({path: '/sub', data: "RestifyJS", type: ''}) );
});
restifyServer.get('/dynamicPath/:data', (req,res) => res.json( dynamicPathController({data: req.params.data}) ));
restifyServer.get('/qs', (req,res) => res.json( qsController({data: qs.parse(req.url.split('?')[1]).data}) ));
restifyServer.get('/db', sqlHandel);

//  [ KeystoneJS ]
var keystone = require('keystone');
const url = require('keystone/fields/types/url/UrlType');
const { Url } = require('keystone/lib/fieldTypes');
const { constants } = require('buffer');
keystone.init({'cookie secret' : 'secure string goes here',port: 3070});
keystone.set('routes', (app) => {
  app.get('/', (req,res) => res.json( controller({path: '/', data: "KeystoneJS", type: 'json'}) ));
  app.get('/sub', (req,res) => res.send( controller({path: '/sub', data: "KeystoneJS", type: ''}) ));
  app.get('/dynamicPath/:data', (req,res) => res.json( dynamicPathController({data: req.params.data}) ));
  app.get('/qs', (req,res) => res.json(qsController({data: qs.parse(req.url.split('?')[1]).data}) ));
  app.get('/db', sqlHandel);
});

keystone.start({
    onStart: () => {
        var keystoneHttp = keystone.httpServer;
        var keystoneSocket = socket(keystoneHttp,{cors: socketCorsOptions});
        keystoneSocket.on('connect', (soc) => {
            console.log("Keystone Socket.io");
            soc.emit('ready', "Hi Keystone Client");
        });
        return;
    }
});

//  [ HapiJS ]
var Hapi = require('@hapi/hapi'), 
    hapiServer = new Hapi.Server({host:'localhost', port: 3080});
hapiServer.route({
    method: 'GET',
    path: '/',
    handler: (req,h) => controller({path: '/', data: "HapiJS", type: 'json'}),
});
hapiServer.route({
    method: 'GET',
    path: '/sub',
    handler: (req,h) => h
        .response(controller({path: '/sub', data: "HapiJS", type: ''}))
        .type('text/html'),
});
hapiServer.route({
    method: 'GET',
    path: '/dynamicPath/{data?}',
    handler: (req,h) => dynamicPathController({data: req.params.data})
});
hapiServer.route({
    method: 'GET',
    path: '/qs',
    handler: (req,h) => qsController({data: req.query.data})
});
hapiServer.route({
    method: 'GET',
    path: '/db',
    handler: async (req,h) => {
        var [results, f] = await mysql2Async();
        return results;
    }
});
var hapiSocket = socket(hapiServer.listener ,{cors:socketCorsOptions});
hapiSocket.on('connect', (soc) => {
    console.log("Hapi Socket.io");
    soc.emit('ready', "Hi Hapi Client");
});
(async () => {
    await hapiServer.start(); 
    console.log(`Hapi : ${hapiServer.info.port}`); 
})();