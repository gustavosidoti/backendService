// Requires

var express = require('express');
var mongoose = require('mongoose'); // referencia a la librería
var bodyParser = require('body-parser');

// Importar Rutas
var appRoutes = require('./routes/app'); // con esta linea nos traemos el archivo de rutas
var usuarioRoutes = require('./routes/usuario');
var loginRoutes = require('./routes/login');

// Inicializar variables
var app = express();

// body parser
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())


// Conexión a la base de Datos
mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', (err, res) => {

    if (err) throw err;
    console.log('Base de Datos: \x1b[36m%s\x1b[0m', 'online');

});



// Rutas
app.use('/usuario', usuarioRoutes);
app.use('/login', loginRoutes);
app.use('/', appRoutes);


// Escucuchar Peticiones

app.listen(3000, () => {
    console.log('Express server puerto 3000: \x1b[36m%s\x1b[0m', 'online');
});