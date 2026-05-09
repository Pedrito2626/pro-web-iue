const fs = require('fs');
const path = require('path');

const ruta = path.join(__dirname, '../data/productos.json');

const leer = () => JSON.parse(fs.readFileSync(ruta, 'utf-8'));
const guardar = (productos) => fs.writeFileSync(ruta, JSON.stringify(productos, null, 2));

module.exports = { leer, guardar };
