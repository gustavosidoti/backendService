var express = require('express');
var bcrypt = require('bcryptjs'); // para encriptar las contraseñas
var jwt = require('jsonwebtoken');

var mdAutenticacion = require('../middlewares/autenticacion'); // para usar las funciones de autenticacion de token creadas en autenticacion.js

//var SEED = require('../config/config').SEED; // esto lo traigo de la carpeta config

var app = express();

var Medico = require('../models/medico'); // me permite utilizar las funciones que el modelo de medicos tiene definido

// =====================================================
//           OBTENER TODOS LOS MEDICOS
// =====================================================

app.get('/', (request, res, next) => {

    var desde = request.query.desde || 0; // paginador con esto indicamos que queremos 5 registros más, y así sucesivamente
    desde = Number(desde);

    Medico.find({})
        .skip(desde) // traemos los siguientes resultados a partir de lo que indique la variable desde
        .limit(5) // limitamos a 5 los resultados
        .populate('usuario', 'nombre email')
        .populate('hospital')
        .exec(

            (err, medicos) => {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando medicos',
                        errors: err
                    });
                }

                Medico.count({}, (err, conteo) => {

                    res.status(200).json({
                        ok: true,
                        medicos: medicos,
                        total: conteo

                    });

                })

            });
});


// =====================================================
//           ACTUALIZAR MEDICOS
// =====================================================

app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;
    var body = req.body; // inicializamos la variable body con la respuesta del formulario



    // buscamos al medico por el id
    Medico.findById(id, (err, medico) => {
        // verificamos si hay un error al traer datos
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar medico',
                errors: err
            });
        }
        // si viene nulo es este error

        if (!medico) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El medico con el id' + id + 'no existe',
                errors: { message: 'No existe un medico con ese ID' }
            });
        }

        // actualizamos la data

        medico.nombre = body.nombre;
        medico.usuario = req.usuario._id;
        medico.hospital = body.hospital;


        // grabamos los datos que modificamos

        medico.save((err, medicoGuardado) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar medico',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                medico: medicoGuardado

            });
        });
    });
});



// =====================================================
//           CREAR UN NUEVO MEDICO
// =====================================================

app.post('/', mdAutenticacion.verificaToken, (req, res) => {

    var body = req.body;

    var medico = new Medico({ // hace referencia al modelo de datos que creamos
        nombre: body.nombre,
        usuario: req.usuario._id,
        hospital: body.hospital


    });

    medico.save((err, medicoGuardado) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear medico',
                errors: err
            });
        }


        res.status(201).json({
            ok: true,
            medico: medicoGuardado,
            medicotoken: req.usuario // info del usuario que generó la petición

        });
    });




});


// =====================================================
//           ELIMINAR UN MEDICO POR ID
// =====================================================

app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;
    // mongoose nos ofrece esta función para eliminar un medico por id
    Medico.findByIdAndRemove(id, (err, medicoBorrado) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar medico',
                errors: err
            });
        }

        if (!medicoBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un medico con ese id',
                errors: { message: 'No existe un medico con ese id' }
            });
        }


        res.status(200).json({
            ok: true,
            medico: medicoBorrado

        });

    });
});



module.exports = app;