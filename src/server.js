const express = require("express");
const routerDatos = require("./router");
const app = express();

app.use("/main", express.static(__dirname + "/public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/datos", routerDatos);

const PORT = config.PORT;
app.listen(8080, () => {
  console.log(`Servidor express escuchando en el puerto ${PORT}`);
});
