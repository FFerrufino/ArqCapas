const chai = require("chai");
const assert = chai.assert;
const should = chai.should();
const expect = chai.expect;
const contenedorMongoose = require("../src/daos/mongoCont");

it("Debería agregar correctamente a la BD", async function () {
  const bd = new contenedorMongoose(Test);
  let coll = await bd.read().then();
  const usuario = coll.find((usuario) => usuario.username == "Prueba");
  assert.strictEqual(usuario, undefined);
});

it("Debería agregar correctamente a la BD", async function () {
  const db = new contenedorMongoose(Test);
  db.create({ username: "Prueba" });
  let coll = await bd.read().then();
  const usuario = coll.find((usuario) => usuario.username == "Prueba");
  assert.strictEqual(usuario.username, "Prueba");
});
