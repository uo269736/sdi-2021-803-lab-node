//Módulos //Base de datos (nombre:admin,contraseña:sdi)
let express = require('express');
let app = express();

let swig = require('swig');
let bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static('public'));

//Variables
app.set('port',8081);

//Rutas/controladores por lógica
require("./routes/rusuarios.js")(app,swig); // (app, param1, param2, etc.)
require("./routes/rcanciones.js")(app,swig); // (app, param1, param2, etc.)
require("./routes/rautores.js")(app,swig); // (app, param1, param2, etc.)

//lanzar el servidor
app.listen(app.get('port'), function (){
   console.log('Servidor activo');
});

//mongodb://admin:sdi@tiendamusica-shard-00-00.lri4s.mongodb.net:27017,tiendamusica-shard-00-01.lri4s.mongodb.net:27017,tiendamusica-shard-00-02.lri4s.mongodb.net:27017/myFirstDatabase?ssl=true&replicaSet=atlas-2hhrcv-shard-0&authSource=admin&retryWrites=true&w=majority