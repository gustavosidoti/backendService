// Requires

var express = require('express');
var mongoose = require('mongoose'); // referencia a la librería
var bodyParser = require('body-parser');

// Importar Rutas
var appRoutes = require('./routes/app'); // con esta linea nos traemos el archivo de rutas
var usuarioRoutes = require('./routes/usuario');
var hospitalRoutes = require('./routes/hospital');
var medicoRoutes = require('./routes/medico');
var busquedaRoutes = require('./routes/busqueda');
var uploadRoutes = require('./routes/upload');
var loginRoutes = require('./routes/login');
var imagenesRoutes = require('./routes/imagenes');


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

// Server index config
// mostramos todo lo que hay en uploads
var serveIndex = require('serve-index');
app.use(express.static(__dirname + '/'))
app.use('/uploads', serveIndex(__dirname + '/uploads'));

// Rutas    Aca en naranja la ruta que queramos implementar
app.use('/usuario', usuarioRoutes);
app.use('/hospital', hospitalRoutes);
app.use('/medico', medicoRoutes);
app.use('/login', loginRoutes);
app.use('/busqueda', busquedaRoutes);
app.use('/upload', uploadRoutes);
app.use('/img', imagenesRoutes);

app.use('/', appRoutes);


// Escucuchar Peticiones

app.listen(3000, () => {
    console.log('Express server puerto 3000: \x1b[36m%s\x1b[0m', 'online');
});