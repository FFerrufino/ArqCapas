const express = require("express");
const routerDatos = require("../router/router");
const config = require("./config");
// const bodyParser = require("body-parser");
const exphbs = require("express-handlebars");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const connectMongo = require("connect-mongo");
const bodyParser = require("body-parser");

const app = express();

app.use("/main", express.static(__dirname + "/public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const MongoStore = connectMongo.create({
  mongoUrl:
    "mongodb+srv://ferru:ferru2647@cluster0.lpvnv.mongodb.net/myFirstDatabase?retryWrites=true&w=majority",
  ttl: 600,
});

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

app.use(bodyParser.urlencoded({ extended: true }));
// app.use(express.json());

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
app.get("/lawea", (req, res) => {
  res.render("login");
});

const PORT = config.PORT;
app.listen(8080, () => {
  console.log(`Servidor express escuchando en el puerto ${PORT}`);
});
