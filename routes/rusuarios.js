//Función que exportamos como módulo
module.exports = function(app,swig,gestorBD) {
    app.get("/usuarios", function(req, res) {
        res.send("ver usuarios");
    });
};