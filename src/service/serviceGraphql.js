import crypto from "crypto";
import { Usuario } from "../models/Usuario.js";

const UsuariosMap = {};

function getUsuarios({ campo, valor }) {
  const Usuarios = Object.values(UsuariosMap);
  if (campo && valor) {
    return Usuarios.filter((p) => p[campo] == valor);
  } else {
    return Usuarios;
  }
}

function getUsuario({ id }) {
  if (!UsuariosMap[id]) {
    throw new Error("Usuario not found.");
  }
  return UsuariosMap[id];
}

function createUsuario({ datos }) {
  const id = crypto.randomBytes(10).toString("hex");
  const nuevaUsuario = new Usuario(id, datos);
  UsuariosMap[id] = nuevaUsuario;
  return nuevaUsuario;
}

function updateUsuario({ id, datos }) {
  if (!UsuariosMap[id]) {
    throw new Error("Usuario not found");
  }
  const UsuarioActualizada = new Usuario(id, datos);
  UsuariosMap[id] = UsuarioActualizada;
  return UsuarioActualizada;
}

function deleteUsuario({ id }) {
  if (!UsuariosMap[id]) {
    throw new Error("Usuario not found");
  }
  const UsuarioBorrada = UsuariosMap[id];
  delete UsuariosMap[id];
  return UsuarioBorrada;
}

module.export = {
  getUsuarios,
  getUsuario,
  createUsuario,
  updateUsuario,
  deleteUsuario,
};
