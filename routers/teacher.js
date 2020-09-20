const express = require("express");
const multer = require("multer");
const path = require('path');
const fs = require('fs');
const classroomSchema = require("../models/classRoom");
const teacherService = require("../services/teacherService");
const { allowedNodeEnvironmentFlags } = require("process");
const app = express.Router();
var rooms = {};
app.get("/:id", async function(req,res){//for test only  now, id doesnt matter as all users are added to the same large room
    res.render("t-classroom",{code:req.params.id});

});

app.post("/create", async function(req,res){//create a classroom
    var token = await teacherService.createClassroom();
    res.cookie("teacher-token",token);
    res.redirect('/teacher/'+req.params.id);
});
module.exports = app;