//Función que exportamos como módulo
module.exports = function(app,swig,gestorBD) {

    app.get("/canciones", function(req, res) {

        let canciones = [{
                "nombre" : "Blank space",
                "precio" : "1.2",
        },{
                "nombre" : "See you again",
                "precio" : "1.3",
        },{
                "nombre" : "Uptown Funk",
                "precio" : "1.1",
        }];

        let respuesta = swig.renderFile('views/btienda.html', {
                vendedor : 'Tienda de canciones' ,
                canciones : canciones
        });

        res.send(respuesta);
    });

    app.get('/canciones/agregar', function (req, res) {
        let respuesta = swig.renderFile('views/bagregar.html', {

        });
        res.send(respuesta);
    });

    app.get('/cancion/eliminar/:id', function (req, res) {
        let criterio = {"_id" : gestorBD.mongo.ObjectID(req.params.id) };
        gestorBD.eliminarCancion(criterio,function(canciones){
            if ( canciones == null ){
                res.send(respuesta);
            } else {
                res.redirect("/publicaciones");
            }
        });
    })

    app.get('/suma', function(req, res) {
        let respuesta = parseInt(req.query.num1) + parseInt(req.query.num2);
        res.send(String(respuesta));
    });

    app.get('/cancion/:id', function(req, res) {
        let criterioComentario = {"cancion_id": gestorBD.mongo.ObjectID(req.params.id)};
        let criterioCancion = {"_id": gestorBD.mongo.ObjectID(req.params.id)};
        let resComentarios;
        gestorBD.obtenerCanciones(criterioCancion, function (canciones) {
            if (canciones == null) {
                let respuestaError = swig.renderFile('views/error.html',
                    {
                        mensajes: "Error al recuperar la canción."
                    });
                res.send(respuestaError);
            } else {
                gestorBD.obtenerComentarios(criterioComentario, function (comentarios) {
                    let criterioCompra = {"usuario": req.session.usuario};
                    gestorBD.obtenerCompras(criterioCompra, function (compras) {
                        if (compras == null) {
                            res.send("Error al listar");
                        } else {
                            let booleanAutorComprada = isAutorOrComprada(compras, canciones[0], req.session.usuario);
                            resComentarios = comentarios;
                            let configuracion = {
                                url: "https://www.freeforexapi.com/api/live?pairs=EURUSD",
                                method: "get",
                                headers: {
                                    "token": "ejemplo",
                                }
                            }
                            let rest = app.get("rest");
                            rest(configuracion, function (error, response, body) {
                                console.log("cod: " + response.statusCode + " Cuerpo :" + body);
                                let objetoRespuesta = JSON.parse(body);
                                let cambioUSD = objetoRespuesta.rates.EURUSD.rate;
                                // nuevo campo "usd"
                                canciones[0].usd = cambioUSD * canciones[0].precio;
                                let respuesta = swig.renderFile('views/bcancion.html',
                                    {
                                        cancion: canciones[0],
                                        comentarios: resComentarios,
                                        isAutorComprada: booleanAutorComprada
                                    });
                                res.send(respuesta);
                            });
                        }
                    });
                });
            }
        });
    });

    app.get('/canciones/:genero/:id', function(req, res) {
        let respuesta = 'id: ' + req.params.id + '<br>'
            + 'Género: ' + req.params.genero;
        res.send(respuesta);
    });

    app.post("/cancion", function (req, res){
        let cancion = {
            nombre : req.body.nombre,
            genero : req.body.genero,
            precio : req.body.precio,
            autor  : req.session.usuario
        }
        // Conectarse
        gestorBD.insertarCancion(cancion, function(id){
            if (id == null) {
                let respuestaError = swig.renderFile('views/error.html',
                    {
                        mensajes : "Error al insertar canción"
                    });
                res.send(respuestaError);
            } else {
                if (req.files.portada != null) {
                    var imagen = req.files.portada;
                    imagen.mv('public/portadas/' + id + '.png', function(err) {
                        if (err) {
                            let respuestaError = swig.renderFile('views/error.html',
                                {
                                    mensajes : "Error al subir la portada"
                                });
                            res.send(respuestaError);
                        } else {
                            if (req.files.audio != null) {
                                let audio = req.files.audio;
                                audio.mv('public/audios/'+id+'.mp3', function(err) {
                                    if (err) {
                                        let respuestaError = swig.renderFile('views/error.html',
                                            {
                                                mensajes : "Error al subir audio"
                                            });
                                        res.send(respuestaError);
                                    } else {
                                        res.redirect("/publicaciones");
                                    }
                                });
                            }
                        }
                    });
                }
            }
        });
    });

    app.get("/tienda", function(req, res) {
        let criterio = {};
        if( req.query.busqueda != null ){
            criterio = { "nombre" : {$regex : ".*"+req.query.busqueda+".*"} };
        }

        let pg = parseInt(req.query.pg); // Es String !!!
        if ( req.query.pg == null){ // Puede no venir el param
            pg = 1;
        }

        gestorBD.obtenerCancionesPg(criterio, pg , function(canciones, total ) {
            if (canciones == null) {
                let respuestaError = swig.renderFile('views/error.html',
                    {
                        mensajes : "Error al listar"
                    });
                res.send(respuestaError);
            } else {
                let ultimaPg = total/4;
                if (total % 4 > 0 ){ // Sobran decimales
                    ultimaPg = ultimaPg+1;
                }
                let paginas = []; // paginas mostrar
                for(let i = pg-2 ; i <= pg+2 ; i++){
                    if ( i > 0 && i <= ultimaPg){
                        paginas.push(i);
                    }
                }
                let respuesta = swig.renderFile('views/btienda.html',
                    {
                        canciones : canciones,
                        paginas : paginas,
                        actual : pg
                    });
                res.send(respuesta);
            }
        });
    });

    app.get("/publicaciones", function(req, res) {
        let criterio = { autor : req.session.usuario };
        gestorBD.obtenerCanciones(criterio, function(canciones) {
            if (canciones == null) {
                let respuestaError = swig.renderFile('views/error.html',
                    {
                        mensajes : "Error al listar"
                    });
                res.send(respuestaError);
            } else {
                let respuesta = swig.renderFile('views/bpublicaciones.html',
                    {
                        canciones : canciones
                    });
                res.send(respuesta);
            }
        });
    });

    app.get('/cancion/comprar/:id', function (req, res) {
        let cancionId = gestorBD.mongo.ObjectID(req.params.id);
        let compra = {
            usuario: req.session.usuario,
            cancionId: cancionId
        }
        let criterioCancion = {"_id": gestorBD.mongo.ObjectID(req.params.id)};
        gestorBD.obtenerCanciones(criterioCancion, function (canciones) {
            if (canciones == null) {
                let respuestaError = swig.renderFile('views/error.html',
                    {
                        mensajes : "Error al recuperar la canción"
                    });
                res.send(respuestaError);
            } else {
                let criterioCompra = {"usuario": req.session.usuario};
                gestorBD.obtenerCompras(criterioCompra, function (compras) {
                    if (compras == null) {
                        let respuestaError = swig.renderFile('views/error.html',
                            {
                                mensajes : "Error al listar"
                            });
                        res.send(respuestaError);
                    } else {
                        if (isAutorOrComprada(compras, canciones[0], req.session.usuario)) {
                            let respuestaError = swig.renderFile('views/error.html',
                                {
                                    mensajes : "No puedes comprar si eres el autor o ya la tienes comprada"
                                });
                            res.send(respuestaError);
                        } else {
                            gestorBD.insertarCompra(compra, function (idCompra) {
                                if (idCompra == null) {
                                    res.send(respuesta);
                                } else {
                                    res.redirect("/compras");
                                }
                            });
                        }
                    }
                });
            }
            ;
        });
    });

    app.get('/compras', function (req, res) {
        let criterio = { "usuario" : req.session.usuario };

        gestorBD.obtenerCompras(criterio ,function(compras){
            if ( compras == null ){
                let respuestaError = swig.renderFile('views/error.html',
                    {
                        mensajes : "Error al listar"
                    });
                res.send(respuestaError);
            } else {
                let cancionesCompradasIds = [];
                for(i=0; i<compras.length; i++){
                    cancionesCompradasIds.push( compras[i].cancionId );
                }
                let criterio = { "_id" : { $in: cancionesCompradasIds } }
                gestorBD.obtenerCanciones(criterio,function (canciones){
                    let respuesta = swig.renderFile('views/bcompras.html',
                        {
                            canciones : canciones
                        });
                    res.send(respuesta);
                });
            }
        });
    });

    app.get('/cancion/modificar/:id', function (req, res) {
        let criterio = { "_id" : gestorBD.mongo.ObjectID(req.params.id) };
        gestorBD.obtenerCanciones(criterio,function(canciones){
            if ( canciones == null ){
                let respuestaError = swig.renderFile('views/error.html',
                    {
                        mensajes : "Error al modificar"
                    });
                res.send(respuestaError);
            } else {
                let respuesta = swig.renderFile('views/bcancionModificar.html',
                    {
                        cancion : canciones[0]
                    });
                res.send(respuesta);
            }
        });
    });

    app.post('/cancion/modificar/:id', function (req, res) {
        let id = req.params.id;
        let criterio = { "_id" : gestorBD.mongo.ObjectID(id) };
        let cancion = {
            nombre : req.body.nombre,
            genero : req.body.genero,
            precio : req.body.precio
        }
        gestorBD.modificarCancion(criterio, cancion, function(result) {
            if (result == null) {
                let respuestaError = swig.renderFile('views/error.html',
                    {
                        mensajes : "Error al modificar"
                    });
                res.send(respuestaError);
            } else {
                paso1ModificarPortada(req.files, id, function (result) {
                    if( result == null){
                        let respuestaError = swig.renderFile('views/error.html',
                            {
                                mensajes : "Error en la modificación"
                            });
                        res.send(respuestaError);
                    } else {
                        res.redirect("/publicaciones");
                    }
                });
            }
        });
    });

    //Funciones para modificar una canción
    /*Paso I: Intentamos subir la portada
            A. Si se produce un error al subir la portada enviamos una respuesta de error.
            B. Sí se sube correctamente vamos a Paso II e intentamos subir el audio
            C. Si no había portada vamos a Paso II

      Paso II: Intentamos subir el audio
            A. Si se produce un error al subir el audio enviamos una respuesta de error
            B. Si se sube correctamente, finalizamos.
            C. Si no había audio, finalizamos.
    */
    function paso1ModificarPortada(files, id, callback){
        if (files && files.portada != null) {
            let imagen =files.portada;
            imagen.mv('public/portadas/' + id + '.png', function(err) {
                if (err) {
                    callback(null); // ERROR
                } else {
                    paso2ModificarAudio(files, id, callback); // SIGUIENTE
                }
            });
        } else {
            paso2ModificarAudio(files, id, callback); // SIGUIENTE
        }
    };

    function paso2ModificarAudio(files, id, callback){
        if (files && files.audio != null) {
            let audio = files.audio;
            audio.mv('public/audios/'+id+'.mp3', function(err) {
                if (err) {
                    callback(null); // ERROR
                } else {
                    callback(true); // FIN
                }
            });
        } else {
            callback(true); // FIN
        }
    };

    function isAutorOrComprada(compras, cancion, usuario) {
        if (cancion.autor == usuario) {
            return true;
        } else {
            for (let i = 0; i < compras.length; i++) {
                if ((compras[i].cancionId).equals(cancion._id)) {
                    return true;
                }
            }
            return false;
        }
    };



};
