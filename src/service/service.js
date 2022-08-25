const cookieParser = require("cookie-parser");
const session = require("express-session");
const connectMongo = require("connect-mongo");
const bodyParser = require("body-parser");
const exphbs = require("express-handlebars");
const path = require("path");
const bcrypt = require("bcrypt");
const User = require("../daos/models/user");
const contenedorMongoose = require("../daos/mongoCont");
const { fork } = require("child_process");
const crypto = require("crypto");
const createTransport = require("nodemailer");
// const twilio = require("twilio");

const passport = require("passport");
const { Strategy } = require("passport-local");
const LocalStrategy = Strategy;

//Bcrypt
async function createHash(password) {
  console.log("pass sin encriptar " + password);
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
  const saltRounds = 10;
  // console.log("old pass hash: ", usuario);
  try {
    // const salt = await bcrypt.genSalt(saltRounds);
    // const hash = await bcrypt.hash(password, salt);
    const lawea = await createHash(password);

    // console.log("new pass hash: ", lawea);
    console.log("kimo", usuario, password);

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
    const hola = await verificaPass(existeUsuario.password, password);
    console.log("console de hola " + hola);

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
  // console.log(usuario);
  done(null, usuario);
});

passport.deserializeUser(async (nombre, done) => {
  const bd = new contenedorMongoose(User);
  let coll = await bd.read().then();
  const usuario = coll.find((usuario) => usuario.username == nombre);
  // console.log(usuario);
  done(null, usuario);
});

// Rutas
async function main(req, res) {
  if (req.session.username) {
    res.redirect("/datos");
  } else {
    res.redirect("/login");
  }
}

async function login(req, res) {
  res.render("login");
}

async function loginError(req, res) {
  res.render("loginError");
}

async function register(req, res) {
  res.render("register");
}
async function logged(req, res) {
  // console.log("logged req.user: ", req.session);
  console.log("logged req.user: ", req.session.passport.user);
  console.log(req.session.passport);
  const datosUsuario = {
    nombre: req.session.passport.user.username,
    direccion: req.session.passport.user.email,
    admin: req.session.passport.user.admin,
  };
  if (req.session.passport.user.admin == false) {
    res.render("logged", { datos: datosUsuario });
  } else {
    res.render("admin");
  }
  console.log(datosUsuario);
}

async function logout(req, res) {
  console.log("logout" + req.session);
  req.session.destroy((err) => {
    if (err) {
      return res.json({ status: "logout ERROR", body: err });
    }
  });
  console.log("logout2" + req.session);

  res.redirect("/");
}

async function randoms(req, res) {
  const ran = fork("child.js");

  ran.on("message", (msg) => {
    if (msg == "listo") {
      ran.send(req.params.max);
    } else {
      res.send(msg);
    }
  });
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
async function auth(req, res) {
  let username = req.query.username || "";
  const password = req.query.password || "";

  username = username.replace(/[!@#$%^&*]/g, "");

  if (!username || !password || !users[username]) {
    process.exit(1);
    return res.sendStatus(400);
  }

  const { salt, hash } = users[username];
  const encryptHash = crypto.pbkdf2Sync(password, salt, 10000, 512, "sha512");

  if (crypto.timingSafeEqual(hash, encryptHash)) {
    res.sendStatus(200);
  } else {
    process.exit(1);
    res.sendStatus(401);
  }
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

  // const MailAdmin = "...";

  // const transporter = createTransport({
  //   service: "gmail",
  //   port: 587,
  //   auth: {
  //     user: MailAdmin,
  //     pass: "",
  //   },
  // });

  // const mailOptions = {
  //   from: "Servidor Node.js",
  //   to: req.body.email,
  //   subject: "Nuevo usuario",
  //   html: [req.doby.username, req.body.email, req.body.number],
  //   attachments: [
  //     {
  //       path: "58F.jpg",
  //     },
  //   ],
  // };

  // try {
  //   const info = await transporter.sendMail(mailOptions);
  //   console.log(info);
  // } catch (error) {
  //   console.log(error);
  // }
  // const accountSid = "AC1fa832d3b34023d1f65e7b29b1ec0651";
  // const authToken = "0e42fe04ac8d86727f1ebe330d977ab7";
  // const client = require("twilio")(accountSid, authToken);

  // client.messages
  //   .create({
  //     body: [req.doby.username, req.body.email, req.body.number],
  //     from: "whatsapp:+14155238886",
  //     to: "whatsapp:+5493517883201",
  //   })
  //   .then((message) => console.log(message.sid))
  //   .done();

  // const options = {
  //   body: [req.doby.username, req.body.email, req.body.number],
  //   mediaUrl: [],
  //   from: "whatsapp:+14155238886",
  //   to: "whatsapp:+5493517883201",
  // };
}

module.exports = {
  main,
  login,
  loginError,
  register,
  logged,
  logout,
  randoms,
  newUser,
  auth,
  loginPost,
  registerPost,
};
