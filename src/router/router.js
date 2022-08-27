const { Router } = require("express");
const compression = require("express");
const {
  main,
  login,
  loginError,
  register,
  logged,
  logout,
  randoms,
  newUser,
  auth,
  chat,
  loginPost,
  registerPost,
} = require("../service/service");

const routerDatos = new Router();

routerDatos.use(compression());

routerDatos.get("/", main);
routerDatos.get("/login", login);
routerDatos.get("/loginError", loginError);
routerDatos.get("/register", register);
routerDatos.get("/logged", logged);
routerDatos.get("/logout", logout);
routerDatos.get("/api/randoms/:max", randoms);
routerDatos.get("/newUser", newUser);
routerDatos.get("/auth-bloq", auth);
routerDatos.get("/chat", chat);

routerDatos.post("/login", loginPost);
routerDatos.post("/register", registerPost);

module.exports = routerDatos;
