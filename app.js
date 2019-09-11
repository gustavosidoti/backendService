// Requires

var express = require('express');
var mongoose = require('mongoose'); // referencia a la librería

// Inicializar variables
var app = express();

// Conexión a la base de Datos
mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', (err, res) => {

    if (err) throw err;
    console.log('Base de Datos: \x1b[36m%s\x1b[0m', 'online');

});


// Rutas
app.get('/', (request, response, next) => {

    response.status(200).json({
        ok: true,
        mensaje: 'peticion realizada correctamente'
    });


});


// Escucuchar Peticiones

app.listen(3000, () => {
    console.log('Express server puerto 3000: \x1b[36m%s\x1b[0m', 'online');
});