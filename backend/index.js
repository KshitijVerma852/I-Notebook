const express = require("express");
const connectToMongo = require("./db");
const app = express();
connectToMongo();
const port = 3000;

app.use(express.json());

// Available Routes

app.use("/api/auth", require("./routes/auth"));
app.use("/api/notes", require("./routes/notes"));

app.get("/", (req, res) => {
    res.send("Hello world");
});

app.listen(port, () => {
    console.log(`Listening at https://localhost:${port}.`);
});
