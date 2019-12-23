var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED; // esto lo traigo de la carpeta config

// =====================================================
//           VERIFICAR TOKEN
// =====================================================
exports.verificaToken = function(req, res, next) {

    var token = req.query.token; // lo capturamos de la url

    jwt.verify(token, SEED, (err, decoded) => { // primer parametro el token que recibo
        // segundo parametro el seed
        // tercer parametro un callback con el error y el decoded
        // que contiene la info del usuario que esta en payload

        if (err) {
            return res.status(401).json({
                ok: false,
                mensaje: 'Token Incorrecto',
                errors: err
            });
        }
        req.usuario = decoded.usuario; // traemos la info del usuario que hace la petición y la colocamos en el request

        next(); // esto sirve para que continue con las funciones que están debajo

    });


}