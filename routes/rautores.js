//Función que exportamos como módulo
module.exports = function(app,swig) {

    app.get("/autores", function(req, res) {

        let autores = [{
            "nombre" : "Marco",
            "grupo"  : "Los verdes",
            "rol"    : "Cantante",
        },{
            "nombre" : "Lucas",
            "grupo"  : "ACFD",
            "rol"    : "Batería",
        },{
            "nombre" : "Maria",
            "grupo"  : "Maria y los 4",
            "rol"    : "Guitarrista",
        }];

        let respuesta = swig.renderFile('views/autores.html', {
            vendedor : 'Autores' ,
            autores : autores
        });

        res.send(respuesta);
    });

    app.get('/autores/agregar', function (req, res) {
        let respuesta = swig.renderFile('views/autores-agregar.html', {

        });
        res.send(respuesta);
    });

    app.post("/autor", function (req, res){
        let respuesta ="";
        if(typeof (req.body.nombre)=="undefined")
            respuesta+="Nombre del autor no enviado en la peticion " +'<br>';
        else
            respuesta+="Autor agregado: "+req.body.nombre + '<br>';
        if(typeof (req.body.grupo)=="undefined")
            respuesta+="Grupo no enviado en la peticion " + '<br>';
        else
            respuesta+="grupo: "+req.body.grupo + '<br>';
        if(typeof (req.body.rol)=="undefined")
            respuesta+="Rol no enviado en la peticion "+ '<br>';
        else
            respuesta+="rol: "+req.body.rol + '<br>';
        res.send(respuesta);
    });

    app.get('/autores/*', function (req, res) {
        res.redirect("/autores");
    })



};
