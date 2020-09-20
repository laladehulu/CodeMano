const express = require("express");
const multer = require("multer");
const path = require('path');
const fs = require('fs');
const classroomRoute = require("./classroom")
const teacherRoute = require("./teacher")
const directoryPath = path.join(__dirname, '../uploads');
const storage = multer.diskStorage({
    destination:function(req,file,cb){
        cb(null, "/uploads");
    },
    filename:function(req, file,cb){
        cb(null, Date.now()+".jpg");
    }
})
const upload = multer({storage:storage})
const app = express.Router();

app.use("/classroom",classroomRoute);
app.use("/teacher",teacherRoute);

app.get("/", async function(req,res){
    res.render("landing.html",{})
    
});
app.get("/join", async function(req,res){
    res.render("join.html",{})
})
app.post("/join", function(req,res){
    res.redirect("/classroom/?code="+req.body.code+"&name="+req.body.name);
}
)
app.post("/postImage",upload.single("picture"),function(req,res){
    res.end();
})
module.exports = app;