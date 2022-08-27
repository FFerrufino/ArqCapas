const express = require("express");
const routerDatos = require("../router/router");
const config = require("./config");
// const bodyParser = require("body-parser");
const exphbs = require("express-handlebars");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const connectMongo = require("connect-mongo");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();

app.use(express.static(path.join(__dirname, "../srcHtml/views")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Chat

const socketIO = require("socket.io");
const http = require("http");
let server = http.createServer(app);

module.exports.io = socketIO(server);
require("./socket");

// Conexión a la BD

const MongoStore = connectMongo.create({
  mongoUrl:
    "mongodb+srv://ferru:ferru2647@cluster0.lpvnv.mongodb.net/myFirstDatabase?retryWrites=true&w=majority",
  ttl: 600,
});

// Motor de plantillas
app.engine(
  ".hbs",
  exphbs.engine({
    defaultLayout: "main",
    layoutsDir: "../srcHtml/views/layouts",
    extname: ".hbs",
  })
);
app.set("view engine", ".hbs");
app.set("views", "../srcHtml/views");

// Session

app.use(bodyParser.urlencoded({ extended: true }));

app.use(cookieParser());
app.use(
  session({
    store: MongoStore,
    secret: ".",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(routerDatos);

const PORT = config.PORT;
server.listen(8080, () => {
  console.log(`Servidor express escuchando en el puerto ${PORT}`);
});
