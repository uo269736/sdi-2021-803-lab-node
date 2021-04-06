//Función que exportamos como módulo
module.exports = function(app,swig,gestorBD) {

    app.post("/comentarios/:cancion_id", function (req, res){
        if(req.session.usuario==null){
            res.send("Necesitas iniciar sesión para publicar un comentario");
        }
        else {
            let comentario = {
                autor: req.session.usuario,
                texto: req.body.texto,
                cancion_id: gestorBD.mongo.ObjectID(req.params.cancion_id),
            }

            gestorBD.insertarComentario(comentario, function (id) {
                if (id == null) {
                    res.send("Error al insertar comentario");
                } else {
                    res.send('Comentario Insertado ' + id);
                }
            });
        }
    });


};
