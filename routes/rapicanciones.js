module.exports = function(app, gestorBD) {

    app.get("/api/cancion", function(req, res) {
        gestorBD.obtenerCanciones( {} , function(canciones) {
            if (canciones == null) {
                res.status(500);
                res.json({
                    error : "se ha producido un error"
                })
            } else {
                res.status(200);
                res.send( JSON.stringify(canciones) );
            }
        });
    });

    app.get("/api/cancion/:id", function(req, res) {
        let criterio = { "_id" : gestorBD.mongo.ObjectID(req.params.id)}

        gestorBD.obtenerCanciones(criterio,function(canciones){
            if ( canciones == null ){
                res.status(500);
                res.json({
                    error : "se ha producido un error"
                })
            } else {
                res.status(200);
                res.send( JSON.stringify(canciones[0]) );
            }
        });
    });

    app.delete("/api/cancion/:id", function(req, res) {
        let criterio = { "_id" : gestorBD.mongo.ObjectID(req.params.id)}
        let autor=false;
        gestorBD.obtenerCanciones(criterio,function(canciones){
            if ( canciones == null ){
                res.status(500);
                res.json({
                    error : "se ha producido un error"
                })
            } else {
                if(canciones[0].autor==req.session.usuario)
                    autor=true;
            }
        });
        if(!autor){
            res.status(404);
            res.json({
                error : "se ha producido un error al eliminar",
                mensajeerror: "No puedes eliminar una canción de la que no eres el dueño"
            })
        }
        else {
            gestorBD.eliminarCancion(criterio, function (canciones) {
                if (canciones == null) {
                    res.status(500);
                    res.json({
                        error: "se ha producido un error"
                    })
                } else {
                    res.status(200);
                    res.send(JSON.stringify(canciones));
                }
            });
        }
    });

    app.post("/api/cancion", function(req, res) {
        let cancion = {
            nombre : req.body.nombre,
            genero : req.body.genero,
            precio : req.body.precio,
        }
        // ¿Validar nombre, genero, precio?
        let mensajeserror = [];
        if ( cancion.nombre != null)
            if ( req.body.nombre.length < 5)
                mensajeserror.push("Error:El nombre debe tener al menos 5 caracteres")
        if ( cancion.genero != null)
            if ( req.body.genero.length <3)
                mensajeserror.push("Error:El genero debe tener al menos 3 caracteres")
        if ( cancion.precio != null)
            if ( req.body.precio <0)
                mensajeserror.push("Error:El precio no puede ser negativo")

        if (mensajeserror.length > 0) {
            res.status(404);
            res.json({
                error: "se ha producido un error al insertar",
                mensajeserror: mensajeserror
            })
        } else {
            gestorBD.insertarCancion(cancion, function (id) {
                if (id == null) {
                    res.status(500);
                    res.json({
                        error: "se ha producido un error"
                    })
                } else {
                    res.status(201);
                    res.json({
                        mensaje: "canción insertada",
                        _id: id
                    })
                }
            });
        }

    });

    app.put("/api/cancion/:id", function(req, res) {

        let criterio = { "_id" : gestorBD.mongo.ObjectID(req.params.id) };
        let mensajeserror = [];
        let cancion = {}; // Solo los atributos a modificar
        if ( req.body.nombre != null)
            if ( req.body.nombre.length >= 5)
                cancion.nombre = req.body.nombre;
            else {
                mensajeserror.push("Error:El nombre debe tener al menos 5 caracteres")
            }
        if ( req.body.genero != null)
            if ( req.body.genero.length >=3)
                cancion.genero = req.body.genero;
            else {
                mensajeserror.push("Error:El genero debe tener al menos 3 caracteres")
            }
        if ( req.body.precio != null)
            if ( req.body.precio >=0)
                cancion.precio = req.body.precio;
            else {
                mensajeserror.push("Error:El precio no puede ser negativo")
            }

        let autor=false;
        gestorBD.obtenerCanciones(criterio,function(canciones){
            if ( canciones == null ){
                res.status(500);
                res.json({
                    error : "se ha producido un error"
                })
            } else {
                if(canciones[0].autor==req.session.usuario)
                    autor=true;
            }
        });
        if(!autor){
            res.status(404);
            res.json({
                error : "se ha producido un error al modificar",
                mensajeerror: "No puedes modificar una canción de la que no eres el dueño"
            })
        }
        else {
            if (mensajeserror.length > 0) {
                res.status(404);
                res.json({
                    error: "se ha producido un error al modificar",
                    mensajeserror: mensajeserror
                })
            } else {
                gestorBD.modificarCancion(criterio, cancion, function (result) {
                    if (result == null) {
                        res.status(500);
                        res.json({
                            error: "se ha producido un error"
                        })
                    } else {
                        res.status(200);
                        res.json({
                            mensaje: "canción modificada",
                            _id: req.params.id
                        })
                    }
                });
            }
        }
    });

    app.post("/api/autenticar/", function(req, res) {
        let seguro = app.get("crypto").createHmac("sha256", app.get('clave'))
            .update(req.body.password).digest('hex');

        let criterio = {
            email : req.body.email,
            password : seguro
        }

        gestorBD.obtenerUsuarios(criterio, function (usuarios) {
            if (usuarios == null || usuarios.length == 0) {
                res.status(401); //Unauthorized
                res.json({
                    autenticado : false
                })
            } else {
                let token = app.get('jwt').sign(
                    {usuario: criterio.email , tiempo: Date.now()/1000},
                    "secreto");
                res.status(200);
                res.json({
                    autenticado : true,
                    token : token
                })
            }
        });
    });

}
