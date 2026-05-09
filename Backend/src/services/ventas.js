const fs = require('fs');
const path = require('path');

const ruta = path.join(__dirname, '../data/ventas.json');

const leer = () => JSON.parse(fs.readFileSync(ruta, 'utf-8'));
const guardar = (ventas) => fs.writeFileSync(ruta, JSON.stringify(ventas, null, 2));

module.exports = { leer, guardar };
