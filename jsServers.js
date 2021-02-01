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
var dynamicPathController = ({data}) => ({data});
var qsController = ({data}) => ({'qs':data});
var qs = require('querystring');

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


//  [ ExpressJS ]
var express = require('express');
var expressApp = express();
expressApp.get('/', (req,res) => res.json( controller({path: '/', data: "ExpressJS", type: 'json'}) ));
expressApp.get('/sub', (req,res) => res.send( controller({path: '/sub', data: "ExpressJS", type: ''}) ));
expressApp.get('/dynamicPath/:data', (req,res) => res.json( dynamicPathController({data: req.params.data}) ));
// expressApp.get('/qs', (req,res) => res.json(qsController({data: req.query.data}))); // 충돌
expressApp.get('/qs', (req,res) => res.json(qsController({data: qs.parse(req.url.split('?')[1]).data})));
expressApp.listen(3030, _ => console.log("ExpressJS :3030"));


//  [ KoaJS]
var Koa = require('koa'), 
    koaApp = new Koa(),
    KoaRouter = require('koa-router'),
    koaRouter = KoaRouter();
koaApp.listen(3040, _ => console.log("KOA :3040"));
koaRouter.get('/dynamicPath/:data', (ctx, next) => ctx.body = dynamicPathController({data: ctx.params.data}));
koaRouter.get('/qs', (ctx, next) => ctx.body = qsController({data: ctx.query.data}));
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
feathersApp.listen(3050).on('listening', () => console.log('Feathers :3050'));
feathersApp.use(fExpress.json());
feathersApp.use(fExpress.urlencoded({ extended: true }));
feathersApp.configure(fExpress.rest());
feathersApp.get('/', (req,res) => res.json( controller({path: '/', data: "FeathersJS", type: 'json'}) ));
feathersApp.get('/sub', (req,res) => res.send( controller({path: '/sub', data: "FeathersJS", type: ''}) ));
feathersApp.get('/dynamicPath/:data', (req,res) => res.json( dynamicPathController({data: req.params.data}) ));
feathersApp.get('/qs', (req,res) => res.json( qsController({data: qs.parse(req.url.split('?')[1]).data}) ));

//  [ RestifyJS ]
var restify = require('restify'),
    restifyServer = restify.createServer();
restifyServer.listen(3060, _ => console.log('Restify :3060'));
restifyServer.get('/', (req,res) => res.json( controller({path: '/', data: "RestifyJS", type: 'json'}) ));
restifyServer.get('/sub', (req,res) => {
    res.setHeader("Content-Type","text/html");
    return res.sendRaw( controller({path: '/sub', data: "RestifyJS", type: ''}) );
});
restifyServer.get('/dynamicPath/:data', (req,res) => res.json( dynamicPathController({data: req.params.data}) ));
restifyServer.get('/qs', (req,res) => res.json( qsController({data: qs.parse(req.url.split('?')[1]).data}) ));

//  [ KeystoneJS ]
var keystone = require('keystone');
const url = require('keystone/fields/types/url/UrlType');
const { Url } = require('keystone/lib/fieldTypes');
keystone.init({'cookie secret' : 'secure string goes here',port: 3070});
keystone.set('routes', (app) => {
  app.get('/', (req,res) => res.json( controller({path: '/', data: "KeystoneJS", type: 'json'}) ));
  app.get('/sub', (req,res) => res.send( controller({path: '/sub', data: "KeystoneJS", type: ''}) ));
  app.get('/dynamicPath/:data', (req,res) => res.json( dynamicPathController({data: req.params.data}) ));
  app.get('/qs', (req,res) => res.json(qsController({data: qs.parse(req.url.split('?')[1]).data}) ));
});
keystone.start();

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
(async () => {
    await hapiServer.start(); 
    console.log(`Hapi : ${hapiServer.info.port}`); 
})();