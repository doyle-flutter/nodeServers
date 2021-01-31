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

// Node.js
var app = require('http').createServer((req,res) => {
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
            return res.end(`
            <div>
                <img src="https://user-images.githubusercontent.com/56661529/106377860-59c8f400-63e3-11eb-93af-0eda2378dc4f.png" alt="info" />
                <div>
                    <h3>Node.js</h3>
                    <ul>
                        <li><a href="http://localhost:3020">JSON</a></li>
                        <li><a href="http://localhost:3020/sub">HTML</a></li>
                    </ul>
                </div>
                <div>
                    <h3>ExpressJS</h3>
                    <ul>
                        <li><a href="http://localhost:3030">JSON</a></li>
                        <li><a href="http://localhost:3030/sub">HTML</a></li>
                    </ul>
                </div>
                <div>
                    <h3>Koa</h3>
                    <ul>
                        <li><a href="http://localhost:3040">JSON</a></li>
                        <li><a href="http://localhost:3040/sub">HTML</a></li>
                    </ul>
                </div>
                <div>
                    <h3>FeathersJS</h3>
                    <ul>
                        <li><a href="http://localhost:3050">JSON</a></li>
                        <li><a href="http://localhost:3050/sub">HTML</a></li>
                    </ul>
                </div>
                <div>
                    <h3>RestifyJS</h3>
                    <ul>
                        <li><a href="http://localhost:3060">JSON</a></li>
                        <li><a href="http://localhost:3060/sub">HTML</a></li>
                    </ul>
                </div>
                <div>
                    <h3>KeystoneJS</h3>
                    <ul>
                        <li><a href="http://localhost:3070">JSON</a></li>
                        <li><a href="http://localhost:3070/sub">HTML</a></li>
                    </ul>
                </div>
                <div>
                    <h3>HapiJS</h3>
                    <ul>
                        <li><a href="http://localhost:3080">JSON</a></li>
                        <li><a href="http://localhost:3080/sub">HTML</a></li>
                    </ul>
                </div>
            </div>
            `);
        }
    }
});
app.listen(3020);


//  [ ExpressJS ]
var express = require('express'), 
    expressApp = express();
expressApp.listen(3030, _ => console.log("ExpressJS :3030"));
expressApp.get('/', (req,res) => res.json( controller({path: '/', data: "ExpressJS", type: 'json'}) ));
expressApp.get('/sub', (req,res) => res.send( controller({path: '/sub', data: "ExpressJS", type: ''}) ));

//  [ KoaJS]
var Koa = require('koa'), 
    koaApp = new Koa();
koaApp.listen(3040, _ => console.log("KOA :3040"));
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

//  [ RestifyJS]
var restify = require('restify'),
    restifyServer = restify.createServer();
restifyServer.listen(3060, _ => console.log('Restify :3060'));
restifyServer.get('/', (req,res) => res.json( controller({path: '/', data: "RestifyJS", type: 'json'}) ));
restifyServer.get('/sub', (req,res) => {
    res.setHeader("Content-Type","text/html");
    return res.sendRaw( controller({path: '/sub', data: "RestifyJS", type: ''}) );
});

//  [ KeystoneJS ]
var keystone = require('keystone');
keystone.init({'cookie secret' : 'secure string goes here',port: 3070});
keystone.set('routes', (app) => {
  app.get('/', (req,res) => res.json( controller({path: '/', data: "KeystoneJS", type: 'json'}) ));
  app.get('/sub', (req,res) => res.send( controller({path: '/sub', data: "KeystoneJS", type: ''}) ));
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
(async () => {
    await hapiServer.start(); 
    console.log(`Hapi : ${hapiServer.info.port}`); 
})();