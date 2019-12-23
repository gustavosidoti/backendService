var express = require('express');
var bcrypt = require('bcryptjs'); // para encriptar las contraseñas
var jwt = require('jsonwebtoken');

var mdAutenticacion = require('../middlewares/autenticacion'); // para usar las funciones de autenticacion de token creadas en autenticacion.js

//var SEED = require('../config/config').SEED; // esto lo traigo de la carpeta config

var app = express();

var Usuario = require('../models/usuario'); // me permite utilizar las funciones que el modelo de usuario tiene definido

// =====================================================
//           OBTENER TODOS LOS USUARIOS
// =====================================================

app.get('/', (request, res, next) => {

    Usuario.find({}, 'nombre email img role')
        .exec(

            (err, usuarios) => {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando usuarios',
                        errors: err
                    });
                }

                res.status(200).json({
                    ok: true,
                    usuarios: usuarios

                });

            });
});


// =====================================================
//           ACTUALIZAR USUARIO
// =====================================================

app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;
    var body = req.body; // inicializamos la variable body con la respuesta del formulario



    // buscamos al usuario por el id
    Usuario.findById(id, (err, usuario) => {
        // verificamos si hay un error al traer datos
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            });
        }
        // si viene nulo es este error

        if (!usuario) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El usuario con el id' + id + 'no existe',
                errors: { message: 'No existe un usuario con ese ID' }
            });
        }

        // actualizamos la data

        usuario.nombre = body.nombre;
        usuario.email = body.email;
        usuario.role = body.role;

        // grabamos los datos que modificamos

        usuario.save((err, usuarioGuardado) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar usuario',
                    errors: err
                });
            }

            // no enviamos el password verdadero al usuario

            usuarioGuardado.password = ':)';

            res.status(200).json({
                ok: true,
                usuario: usuarioGuardado

            });
        });
    });
});



// =====================================================
//           CREAR UN NUEVO USUARIO
// =====================================================

app.post('/', mdAutenticacion.verificaToken, (req, res) => {

    var body = req.body;

    var usuario = new Usuario({ // hace referencia al modelo de datos que creamos
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10), // aqui colocamos la encriptación en el POST
        img: body.img,
        role: body.role

    });

    usuario.save((err, usuarioGuardado) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear usuario',
                errors: err
            });
        }


        res.status(201).json({
            ok: true,
            usuario: usuarioGuardado,
            usuariotoken: req.usuario // info del usuario que generó la petición

        });
    });




});


// =====================================================
//           ELIMINAR UN USUARIO POR ID
// =====================================================

app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;
    // mongoose nos ofrece esta función para eliminar usuarios por id
    Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar usuario',
                errors: err
            });
        }

        if (!usuarioBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un usuario con ese id',
                errors: { message: 'No existe un usuario con ese id' }
            });
        }


        res.status(200).json({
            ok: true,
            usuario: usuarioBorrado

        });

    });
});



module.exports = app;