const express = require("express");
const ClassroomSchema = require("../models/classRoom");
const multer = require("multer");
const path = require('path');
const fs = require('fs');
const classRoom = require("../models/classRoom");
const studentClassroomService = require("../services/studentClassroomService");


const app = express.Router();
var rooms = {};
app.get("/", async function(req,res){

    
    res.render("classroom",{code: req.query.code,name:req.query.name});
   
});
async function getClassroomMiddleware(req,res,next){
    var classroom = await ClassroomSchema.find({code:req.params.code});
    if(!classroom){
        return res.send("no such classroom");
    }
    req.foundClassroom = classroom;
    next();
}
app.get("/:code/assignments",getClassroomMiddleware, async function(req,res){
    res.render("student-assignment-list",studentClassroomService.getAssignmentLists(req.classroom));
    
});
module.exports = app;