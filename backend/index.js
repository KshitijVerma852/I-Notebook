const express = require("express");
const connectToMongo = require("./db");
const app = express();
connectToMongo();
const port = 3000;

app.get("/", (req, res) => {
    res.send("Hello world");
});

app.listen(port, () => {
    console.log(`Listening at ${port}.`);
});
