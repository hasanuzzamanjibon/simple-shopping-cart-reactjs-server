const express = require("express");
const app = express();
const port = process.env.PORT || 3001;
require("dotenv").config();
const cors = require("cors");

// middleware
app.use(express.json());
app.use(cors());


// root server directory
app.get("/", (req, res) =>{
    res.send("simple shopping cart reactJS server is running")
})


// server listeining
app.listen(port, () => {
  console.log(`server listening on ${port}`);
});
