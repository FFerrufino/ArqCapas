const bcrypt = require("bcrypt");
const User = require("../daos/models/user");
const Prods = require("../daos/models/prods");
const Pedido = require("../daos/models/pedidos");
const contenedorMongoose = require("../daos/mongoCont");
const crypto = require("crypto");
const createTransport = require("nodemailer");

const passport = require("passport");
const { Strategy } = require("passport-local");
const user = require("../daos/models/user");
const LocalStrategy = Strategy;

//Bcrypt
async function createHash(password) {
  const saltRounds = 10;

  try {
    const salt = await bcrypt.genSalt(saltRounds);
    const hash = await bcrypt.hash(password, salt);
    return hash;
  } catch (error) {
    console.log(error);
  }
}

async function verificaPass(usuario, password) {
  try {
    return await bcrypt.compare(password, usuario);
  } catch (error) {
    console.log(error);
  }
}

//Passport

passport.use(
  new LocalStrategy(async (username, password, done) => {
    const bd = new contenedorMongoose(User);
    let coll = await bd.read().then();
    const existeUsuario = coll.find((usuario) => {
      return usuario.username == username;
    });

    if (!existeUsuario) {
      console.log("Usuario no encontrado");
      return done(null, false);
    }

    if (!(await verificaPass(existeUsuario.password, password))) {
      console.log("Contrase;a invalida");
      return done(null, false);
    }

    return done(null, existeUsuario);
  })
);

passport.serializeUser((usuario, done) => {
  done(null, usuario);
});

passport.deserializeUser(async (nombre, done) => {
  const bd = new contenedorMongoose(User);
  let coll = await bd.read().then();
  const usuario = coll.find((usuario) => usuario.username == nombre);

  done(null, usuario);
});

// Rutas
async function main(req, res) {
  if (req.session.passport == undefined) {
    res.redirect("/login");
  } else {
    res.redirect("/logged");
  }
}

async function login(req, res) {
  if (req.session.passport == undefined) {
    res.render("login");
  } else {
    res.redirect("/logged");
  }
}

async function loginError(req, res) {
  res.render("loginError");
}

async function register(req, res) {
  res.render("register");
}
async function logged(req, res) {
  const bd = new contenedorMongoose(Prods);
  let coll = await bd.read().then();
  let collname = [];

  coll.map((e) => {
    collname.push({
      name: e.name,
      id: e._id,
      url: e.img,
      description: e.description,
    });
  });
  console.log(collname);

  if (req.session.passport == undefined) {
    res.redirect("/");
  } else {
    const datosUsuario = {
      nombre: req.session.passport.user.username,
      direccion: req.session.passport.user.email,
      admin: req.session.passport.user.admin,
    };

    if (req.session.passport.user.admin == false) {
      res.render("logged", { datos: datosUsuario, prods: collname });
    } else {
      res.render("admin", { datos: datosUsuario, prods: collname });
    }
  }
}

async function adminUsers(req, res) {
  const bd = new contenedorMongoose(User);
  let coll = await bd.read().then();

  let collname = [];

  coll.map((e) => {
    collname.push({ name: e.username, id: e._id, mail: e.email });
  });
  if (req.session.passport.user.admin == false) {
    res.redirect("/logged");
  } else {
    res.render("adminUsuarios", { users: collname });
  }
}
async function logout(req, res) {
  req.session.destroy((err) => {
    if (err) {
      return res.json({ status: "logout ERROR", body: err });
    }
  });

  res.redirect("/");
}

async function chat(req, res) {
  if (req.session.passport == undefined) {
    res.redirect("/login");
  } else {
    res.render("chat", { datos: req.session.passport.user.username });
  }
}

async function deleteProd(req, res) {
  const bd = new contenedorMongoose(Prods);
  bd.delete(req.params._id);
}
async function deleteUser(req, res) {
  const bd = new contenedorMongoose(User);
  bd.delete(req.params._id);
}
async function createProd(req, res) {
  const bd = new contenedorMongoose(Prods);

  let newProd = {};
  newProd.name = req.body.name;
  newProd.img = req.body.img;
  newProd.description = req.body.description;

  bd.create(newProd);
}
async function pedido(req, res) {
  const bd = new contenedorMongoose(Pedido);
  let newProd = {};
  newProd.username = req.session.passport.user.username;
  newProd.email = req.session.passport.user.email;
  newProd.number = req.session.passport.user.number;
  newProd.pedido = req.params.prod;

  bd.create(newProd);
}

const users = {};

async function newUser(req, res) {
  let username = req.query.username || "";
  const password = req.query.password || "";

  username = username.replace(/[!@#$%^&*]/g, "");

  if (!username || !password || users[username]) {
    return res.sendStatus(400);
  }

  const salt = crypto.randomBytes(128).toString("base64");
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 512, "sha512");

  users[username] = { salt, hash };
  console.log("Success");
  res.sendStatus(200);
}

let loginPost = passport.authenticate("local", {
  successRedirect: "/logged",
  failureRedirect: "/loginError",
});

async function registerPost(req, res) {
  const bd = new contenedorMongoose(User);
  let coll = await bd.read().then();

  const newUsuario = coll.find(
    (usuario) => usuario.username == req.body.username
  );
  if (newUsuario) {
    res.render("registerError");
  } else {
    let newUser = {};
    newUser.username = req.body.username;
    newUser.email = req.body.email;
    newUser.password = await createHash(req.body.password);
    newUser.number = req.body.number;
    newUser.admin = false;
    bd.create(newUser);
    res.redirect("/login");
  }

  const MailAdmin = "...";

  const transporter = createTransport({
    service: "gmail",
    port: 587,
    auth: {
      user: MailAdmin,
      pass: "",
    },
  });

  const mailOptions = {
    from: MailAdmin,
    to: req.body.email,
    subject: "Te has registrado en E-commerce Ferru",
    html: [req.body.username, req.body.email, req.body.number],
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(info);
  } catch (error) {
    console.log(error);
  }
}

module.exports = {
  createProd,
  pedido,
  adminUsers,
  deleteProd,
  deleteUser,
  main,
  login,
  loginError,
  register,
  logged,
  logout,
  newUser,
  chat,
  loginPost,
  registerPost,
};
