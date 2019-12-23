var express = require('express');
var bcrypt = require('bcryptjs'); // para encriptar las contraseñas
var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED; // esto lo traigo de la carpeta config

var app = express(); // levantamos el express

var Usuario = require('../models/usuario'); // me permite utilizar las funciones que el modelo de usuario tiene definido


// =====================================================
//           LOGIN DE USUARIO USUARIO
// =====================================================

app.post('/', (req, res) => {

    var body = req.body;

    // 1- verificación si existe usuario con ese correo
    Usuario.findOne({ email: body.email }, (err, usuarioDB) => { // la condición entre las llaves, luego recibo un callback con error, y un usuarioDB si sale bien

        // 2 - verificamos si viene un error    
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuarios',
                errors: err
            });
        }

        // 3 - si no existe un usuario     
        if (!usuarioDB) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales Incorrectas -email', // quitar lo del email cuando lo pasemos a producción
                errors: err
            });
        }

        // 4 - si no existe una contraseña .. función específica de bcrypt para comparar 2 strings 
        if (!bcrypt.compareSync(body.password, usuarioDB.password)) { // ahí están los 2 strings a comparar
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales Incorrectas -password', // quitar el password cuando lo pasemos a producción
                errors: err
            });
        }

        // Crear un token
        usuarioDB.password = ':)'; // quitamos la contraseña para no enviarla al token
        var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 }); // payload: la data que queramos que vaya. luego duración 4 horas

        // respuesta del servidor si todo salió bien
        res.status(200).json({
            ok: true,
            usuario: usuarioDB,
            token: token,
            id: usuarioDB._id

        });
    })




});




module.exports = app;