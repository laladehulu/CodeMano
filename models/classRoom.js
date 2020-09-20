const mongoose = require("mongoose");

const classroomSchema = mongoose.Schema({
    teacherToken:String,
    code:String,
    assignment:[{
        title:String,
        task:String,
        template:String,
        work:{
            name:String,
            code:String,
            grade:String,
            
        }
    }]
},{strict:false})
module.exports = mongoose.model("classroom",classroomSchema);