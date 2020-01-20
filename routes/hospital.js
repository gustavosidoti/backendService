var express = require('express');
var bcrypt = require('bcryptjs'); // para encriptar las contraseñas
var jwt = require('jsonwebtoken');

var mdAutenticacion = require('../middlewares/autenticacion'); // para usar las funciones de autenticacion de token creadas en autenticacion.js

//var SEED = require('../config/config').SEED; // esto lo traigo de la carpeta config

var app = express();

var Hospital = require('../models/hospital'); // me permite utilizar las funciones que el modelo de hospitales tiene definido

// =====================================================
//           OBTENER TODOS LOS HOSPITALES
// =====================================================

app.get('/', (request, res, next) => {

    var desde = request.query.desde || 0; // paginador con esto indicamos que queremos 5 registros más, y así sucesivamente
    desde = Number(desde);

    Hospital.find({})
        .skip(desde) // traemos los siguientes resultados a partir de lo que indique la variable desde
        .limit(5) // limitamos a 5 los resultados
        .populate('usuario', 'nombre email')
        .exec(

            (err, hospitales) => {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando hospitales',
                        errors: err
                    });
                }

                Hospital.count({}, (err, conteo) => {

                    res.status(200).json({
                        ok: true,
                        hospitales: hospitales,
                        total: conteo

                    });

                })

            });
});


// =====================================================
//           ACTUALIZAR HOSPITALES
// =====================================================

app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;
    var body = req.body; // inicializamos la variable body con la respuesta del formulario



    // buscamos al hospital por el id
    Hospital.findById(id, (err, hospital) => {
        // verificamos si hay un error al traer datos
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar hospital',
                errors: err
            });
        }
        // si viene nulo es este error

        if (!hospital) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El hospital con el id' + id + 'no existe',
                errors: { message: 'No existe un hospital con ese ID' }
            });
        }

        // actualizamos la data

        hospital.nombre = body.nombre;
        hospital.usuario = req.usuario._id;


        // grabamos los datos que modificamos

        hospital.save((err, hospitalGuardado) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar hospital',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                hospital: hospitalGuardado

            });
        });
    });
});



// =====================================================
//           CREAR UN NUEVO HOSPITAL
// =====================================================

app.post('/', mdAutenticacion.verificaToken, (req, res) => {

    var body = req.body;

    var hospital = new Hospital({ // hace referencia al modelo de datos que creamos
        nombre: body.nombre,
        usuario: req.usuario._id


    });

    hospital.save((err, hospitalGuardado) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear hospital',
                errors: err
            });
        }


        res.status(201).json({
            ok: true,
            hospital: hospitalGuardado,
            hospitaltoken: req.usuario // info del usuario que generó la petición

        });
    });




});


// =====================================================
//           ELIMINAR UN HOSPITALES POR ID
// =====================================================

app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;
    // mongoose nos ofrece esta función para eliminar hospitales por id
    Hospital.findByIdAndRemove(id, (err, hospitalBorrado) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar hospital',
                errors: err
            });
        }

        if (!hospitalBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un hospital con ese id',
                errors: { message: 'No existe un hospital con ese id' }
            });
        }


        res.status(200).json({
            ok: true,
            hospital: hospitalBorrado

        });

    });
});



module.exports = app;