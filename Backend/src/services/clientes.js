const fs = require('fs');
const path = require('path');

const ruta = path.join(__dirname, '../data/clientes.json');

const leer = () => JSON.parse(fs.readFileSync(ruta, 'utf-8'));
const guardar = (clientes) => fs.writeFileSync(ruta, JSON.stringify(clientes, null, 2));

module.exports = { leer, guardar };
