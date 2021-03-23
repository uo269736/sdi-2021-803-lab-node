//Función que exportamos como módulo
module.exports = function(app) {
    app.get("/usuarios", function(req, res) {
        res.send("ver usuarios");
    });
};