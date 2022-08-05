import { buildSchema } from "graphql";

class Usuario {
  constructor(id, { nombre, edad }) {
    this.id = id;
    this.nombre = nombre;
    this.edad = edad;
  }
}

const schema = buildSchema(`
  type Usuario {
    id: ID!
    nombre: String,
    edad: Int
  }
  input UsuarioInput {
    nombre: String,
    edad: Int
  }
  type Query {
    getUsuario(id: ID!): Usuario,
    getUsuarios(campo: String, valor: String): [Usuario],
  }
  type Mutation {
    createUsuario(datos: UsuarioInput): Usuario
    updateUsuario(id: ID!, datos: UsuarioInput): Usuario,
    deleteUsuario(id: ID!): Usuario,
  }
`);

export { Usuario, schema };
