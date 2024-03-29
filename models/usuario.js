var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

var Schema = mongoose.Schema;

var rolesValidos = {
    values: ['ADMIN_ROLE', 'USER_ROLE'],
    message: '{VALUE} no es un rol permitido'
};



var usuarioSchema = new Schema({

    nombre: { type: String, required: [true, 'El nombre es necesario'] },
    email: { type: String, unique: true, required: [true, 'El email es necesario'] },
    password: { type: String, required: [true, 'La contraseña es necesaria'] },
    img: { type: String, required: false },
    role: { type: String, required: false, default: 'USER_ROLE', enum: rolesValidos },
    google: { type: Boolean, default: false }

}); // Definimos un objeto schema

usuarioSchema.plugin(uniqueValidator, { message: '{PATH} debe ser unico' }); // validación del plugin validator

module.exports = mongoose.model('Usuario', usuarioSchema); // con esto exportamos el schema y le damos el nombre 'Usuario'