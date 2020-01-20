var express = require('express');
var fileUpload = require('express-fileupload');
var fs = require('fs');

var app = express();

var Usuario = require('../models/usuario');
var Medico = require('../models/medico');
var Hospital = require('../models/hospital');

// default options
app.use(fileUpload());

app.put('/:tipo/:id', (req, res, next) => {

    var tipo = req.params.tipo;
    var id = req.params.id;

    // tipos de colección
    var tiposValidos = ['hospitales', 'medicos', 'usuarios'];
    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Tipo de coleccion no es válida',
            errors: { message: 'Tipo de coleccion no es válida' }
        });
    }

    if (!req.files) { // preguntamos si vienen archivos

        return res.status(400).json({
            ok: false,
            mensaje: 'No seleccionó nada',
            errors: { message: 'Debe seleccionar una imagen' }
        });
    }

    // Obtener el nombre del archivo
    var archivo = req.files.imagen;
    var nombreCortado = archivo.name.split('.'); // obtenemos un arreglo con cada palabra del nombre
    var extensionArchivo = nombreCortado[nombreCortado.length - 1]; // obtenemos la última posición

    // solo estas extensiones aceptamos
    var extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

    if (extensionesValidas.indexOf(extensionArchivo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Extensión no válida',
            errors: { message: 'Las extensiones válidas son ' + extensionesValidas.join(', ') }
        });
    }

    // Nombre de archivo personalizado .. idUsuario+numrandom+extension del archivo
    // 121212121212-123.png
    var nombreArchivo = `${ id }-${ new Date().getMilliseconds() }.${ extensionArchivo }`;

    // Mover el archivo del temporal a un paht

    var path = `./uploads/${ tipo }/${ nombreArchivo }`;

    archivo.mv(path, err => { // mv de la función mover, recibe el path y puede devolver callback error

        if (err) { // preguntamos si hay un error

            return res.status(500).json({
                ok: false,
                mensaje: 'Error al mover archivo',
                errors: err
            });
        }

        // Función agregada para llamar a una funcion que valide duplicados y más    

        subirPorTipo(tipo, id, nombreArchivo, res);

    })


    // movió el archivo a la carpeta especificada en el paht con su nombre asignado
    //res.status(200).json({
    // ok: true,
    // mensaje: 'Archivo movido',
    // extensionArchivo: extensionArchivo
    //});


});

function subirPorTipo(tipo, id, nombreArchivo, res) {

    if (tipo === 'usuarios') {

        Usuario.findById(id, (err, usuario) => {

            if (!usuario) {
                return res.status(400).json({
                    ok: true,
                    mensaje: 'Usuario no existe',
                    errors: { message: 'Usuario no existe' }
                });
            }

            if (usuario.img) {

                var pathViejo = `./uploads/usuarios/${usuario.img}`;
                if (fs.existsSync(pathViejo)) {
                    // si existe elimina la imagen anterior

                    fs.unlinkSync(pathViejo);
                }

            }

            // guarda el nuevo archivo
            usuario.img = nombreArchivo;

            usuario.save((err, usuarioActualizado) => {

                usuarioActualizado.password = ':)';

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de Usuario Actualizada',
                    usuario: usuarioActualizado
                });

            })

        });

    }

    if (tipo === 'medicos') {

        Medico.findById(id, (err, medico) => {

            if (!medico) {
                return res.status(400).json({
                    ok: true,
                    mensaje: 'Médico no existe',
                    errors: { message: 'Médico no existe' }
                });
            }

            if (medico.img) {

                var pathViejo = `./uploads/medicos/${medicos.img}`;
                if (fs.existsSync(pathViejo)) {
                    // si existe elimina la imagen anterior

                    fs.unlinkSync(pathViejo);
                }

            }

            // guarda el nuevo archivo
            medico.img = nombreArchivo;

            medico.save((err, medicoActualizado) => {

                medicoActualizado.password = ':)';

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de Medico Actualizada',
                    medico: medicoActualizado
                });

            })

        });

    }

    if (tipo === 'hospitales') {

        Hospital.findById(id, (err, hospital) => {

            if (!hospital) {
                return res.status(400).json({
                    ok: true,
                    mensaje: 'Hospital no existe',
                    errors: { message: 'Hospital no existe' }
                });
            }

            if (hospital.img) {

                var pathViejo = `./uploads/hospitales/${hospital.img}`;
                if (fs.existsSync(pathViejo)) {
                    // si existe elimina la imagen anterior

                    fs.unlinkSync(pathViejo);
                }

            }

            // guarda el nuevo archivo
            hospital.img = nombreArchivo;

            hospital.save((err, hospitalActualizado) => {

                hospitalActualizado.password = ':)';

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de Hospital Actualizada',
                    hospital: hospitalActualizado
                });

            })

        });

    }

}

module.exports = app;