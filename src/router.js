const { Router } = require("express");
const compression = require("express");
const {
  main,
  login,
  loginError,
  register,
  logged,
  logout,
  info,
  randoms,
  newUser,
  auth,
  loginPost,
  registerPost,
} = require("./service");

const routerDatos = new Router();

routerDatos.use(compression());

routerDatos.get("/", main);
routerDatos.get("/login", login);
routerDatos.get("/loginError", loginError);
routerDatos.get("/register", register);
routerDatos.get("/logged", logged);
routerDatos.get("/logout", logout);
routerDatos.get("/info", info);
routerDatos.get("/api/randoms/:max", randoms);
routerDatos.get("/newUser", newUser);
routerDatos.get("/auth-bloq", auth);

routerDatos.post("/login", loginPost);
routerDatos.post("/register", registerPost);

module.exports = routerDatos;
