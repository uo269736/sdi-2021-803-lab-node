let http = require('http');
http.createServer(function handler(req, res) {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('Hello World\n');
}).listen(1337, '127.0.0.1');
console.log('Server running at http://127.0.0.1:1337/');


let express = require('express');
let app = express();
let os = require('os');
let puerto = 3000;
app.get('/memoria', function(req, res){
    setTimeout(function() { // Espera de 10 segundos

        console.log(os.freemem());
        var memoriaLibre = os.freemem() / 1000000; //pasar a MB
        res.status(200);
        res.json({
            memoria : memoriaLibre
        });

    }, 10000);
});
app.listen(puerto, function() {
    console.log("Servidor listo "+puerto);
});
