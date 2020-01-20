var express = require('express');

var app = express();

const path = require('path');
const fs = require('fs');

app.get('/:tipo/:img', (req, res, next) => {

    var tipo = req.params.tipo;
    var img = req.params.img;

    //obtener el path  // se utiliza la const path

    var pathImagen = path.resolve(__dirname, `../uploads/${ tipo }/${ img }`);

    // verificar si la imagen existe en el path // utiliza el fs

    if (fs.existsSync(pathImagen)) {
        // si existe la envia

        res.sendFile(pathImagen);
    } else {
        // sino pasamos la imagen rota en assests
        var pathNoImagen = path.resolve(__dirname, '../assets/no-img.jpg');
        res.sendFile(pathNoImagen);
    }

});

module.exports = app;