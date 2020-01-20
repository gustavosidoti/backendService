var express = require('express');

var app = express();
var Hospital = require('../models/hospital'); // importamos el modelo de hospital para buscar ahí
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');

//=====================================================
// Búsqueda por colección
//=====================================================

app.get('/coleccion/:tabla/:busqueda', (req, res) => {

    var busqueda = req.params.busqueda;
    var tabla = req.params.tabla;
    var regex = new RegExp(busqueda, 'i'); // pasarlo a expresion regular, la i es de indistinto mayus y minusculas


    switch (tabla) {
        case 'usuarios':
            promesa = buscarUsuarios(busqueda, regex);
            break;

        case 'medicos':
            promesa = buscarMedicos(busqueda, regex);
            break;

        case 'hospitales':
            promesa = buscarHospitales(busqueda, regex);
            break;

        default:
            return res.status(400).json({
                ok: false,
                mensaje: 'Los tipos de búsqueda sólo son: usuarios, medicos y hospitales',
                error: { message: 'Tipo de tabla/coleccion no válido' }
            });

    }

    promesa.then(data => {
        res.status(200).json({
            ok: true,
            [tabla]: data // propiedad de etmascript6 de objetos computada. Para arrojar el dato de la tabla enviado por parametro url

        });
    })


})


//=====================================================
// Búsqueda General
//=====================================================

app.get('/todo/:busqueda', (req, response, next) => {

    var busqueda = req.params.busqueda; // lo que viene en la url como parametro de búsqueda
    var regex = new RegExp(busqueda, 'i'); // pasarlo a expresion regular, la i es de indistinto mayus y minusculas


    Promise.all([
            buscarHospitales(busqueda, regex),
            buscarMedicos(busqueda, regex),
            buscarUsuarios(busqueda, regex)
        ])
        .then(respuestas => {

            response.status(200).json({
                ok: true,
                hospitales: respuestas[0],
                medicos: respuestas[1],
                usuarios: respuestas[2]

            });

        })


});

function buscarHospitales(busqueda, regex) {

    return new Promise((resolve, reject) => {

        Hospital.find({ nombre: regex })
            .populate('usuario', 'nombre email')
            .exec((err, hospitales) => { // la búsqueda sólo admite expresiones regulares

                if (err) {
                    reject('error al cargar hospitales', err);
                } else {
                    resolve(hospitales);
                }

            });

    });

}

function buscarMedicos(busqueda, regex) {

    return new Promise((resolve, reject) => {

        Medico.find({ nombre: regex })
            .populate('usuario', 'nombre email')
            .populate('hospital')
            .exec((err, medicos) => {

                if (err) {
                    reject('error al cargar hospitales', err);
                } else {
                    resolve(medicos);
                }

            });

    });


}

function buscarUsuarios(busqueda, regex) {

    return new Promise((resolve, reject) => {

        Usuario.find({}, 'nombre email role')
            .or([{ 'nombre': regex }, { 'email': regex }])
            .exec((err, usuarios) => {

                if (err) {
                    reject('Error al cargar usuarios', err);
                } else {
                    resolve(usuarios);
                }
            })

    });


}

module.exports = app;