var express = require('express');
var bcrypt = require('bcryptjs'); // para encriptar las contraseñas
var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED; // esto lo traigo de la carpeta config

var app = express(); // levantamos el express

var Usuario = require('../models/usuario'); // me permite utilizar las funciones que el modelo de usuario tiene definido

// Google
var CLIENT_ID = require('../config/config').CLIENT_ID;
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);

// =====================================================
//           LOGIN DE USUARIO USUARIO Autenticación de Google
// =====================================================
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    //const userid = payload['sub'];
    // If request specified a G Suite domain:
    //const domain = payload['hd'];
    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true

    }
}

app.post('/google', async(req, res) => {

    var token = req.body.token;

    var googleUser = await verify(token)
        .catch(e => {
            res.status(403).json({
                ok: false,
                mensaje: 'token no valido'

            });
        });

    Usuario.findOne({ email: googleUser.email }, (err, usuarioDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuarios',
                errors: err
            });
        }

        if (usuarioDB) {
            if (usuarioDB.google === false) { // si el usuario no fue autenticado por google
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Debe usar su autenticación normal',

                });
            } else { // si el usuario está autenticado debo refrescar el token
                var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 }); // payload: la data que queramos que vaya. luego duración 4 horas

                // respuesta del servidor si todo salió bien
                res.status(200).json({
                    ok: true,
                    usuario: usuarioDB,
                    token: token,
                    id: usuarioDB._id

                });
            }
        } else {
            // El usuario no existe hay que crearlo
            var usuario = new Usuario();

            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = true;
            usuario.password = ':)';


            usuario.save((err, usuarioDB) => {

                var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 }); // payload: la data que queramos que vaya. luego duración 4 horas

                // respuesta del servidor si todo salió bien
                res.status(200).json({
                    ok: true,
                    usuario: usuarioDB,
                    token: token,
                    id: usuarioDB._id

                });

            });
        }
    });


    // return res.status(200).json({
    //     ok: true,
    //      mensaje: 'OK.!!',
    //      googleUser: googleUser

    // });


});




// =====================================================
//           LOGIN DE USUARIO USUARIO Autenticación Normal
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