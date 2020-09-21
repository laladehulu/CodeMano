const express = require("express");
const routers = require("./routers")
const ws = require("ws");
const spawn = require("child_process").spawn;
const {fork} = require("child_process");
var eventEmitter = require("events").EventEmitter;
var path = require('path');
const { emit } = require("process");
const mongoose = require("mongoose");
const mustache = require("mustache-express");
const e = require("express");
const bodyParser = require("body-parser");
var app = express();
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())
app.use(routers);
app.use(express.static("public"));

app.engine('html', mustache(__dirname + '/partials', '.mst'));
app.set('view engine', 'html');
app.disable('view cache');
mongoose.connect("mongodb://localhost/student",{  useUnifiedTopology: true ,useNewUrlParser: true, useCreateIndex: true })
var server = app.listen(80,function(err){

  
  if(err){
    return console.log(err)
    }
  console.log("listening");
})
function makeid(length) {
  var result           = '';
  var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  var charactersLength = characters.length;
  for ( var i = 0; i < length; i++ ) {
     result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}
app.get("/host",function(req,res){
  var id = makeid(6);
  while(allRooms[id]){
    id = makeid(6);
  }
  res.redirect('/teacher/'+id);
})
var stdin = process.openStdin();

stdin.addListener("data", function(d) {
    // note:  d is an object, and when converted to a string it will
    // end with a linefeed.  so we (rather crudely) account for that  
    // with toString() and then trim() 
    console.log("you entered: [" + 
        d.toString().trim() + "]");
    eval(d.toString().trim());
  });
//[]

function test(msg){
  messageEvent.emit("broadcast",msg);
}
var clients = [];
var i = 0;
var getName = function(name){
  
  return name+ " :  ";
}
var allRooms = {};
var roomChanges = {};
var wsServer = new ws.Server({server:server});
wsServer.on('connection', function connection(ws) {
  function listener(msg){
    if(ws.OPEN){
      console.log(msg);
      ws.send(msg)
    }
  }
  function close(){
    if(ws.OPEN){
      console.log("closed event listener call,client closing at room id: " + ws.classroomID);
      ws.send("close");
      ws.terminate();
    }
  }
  function addToSavedChange(change){
    allRooms[ws.classroomID].changes.push(change);
  }
  function initializationFunctions(){
      function initializeRole(message){
        console.log(typeof ws.isTeacher);
        ws.isTeacher = message == "teacher"? true:false;
      }
      function initializeCoderoomCode(message){
        ws.classroomID = message;
        if(ws.isTeacher){
          handleCreateCoderoom(message);
        }else{
          handleJoinCoderoom(message)
        }
    
      }
      function applyAllPreviousChange(){
        
        if(!allRooms[ws.classroomID]){console.log("coderoom" + ws.classroomID +"is not defined");return ws.terminate();}
        if(!ws.isTeacher){
          console.log("not teacher");
          allRooms[ws.classroomID].changes.forEach(change => {
            ws.send(change);
            console.log("send",change);
          });
        }
      }
      return [initializeRole,initializeCoderoomCode,applyAllPreviousChange];
  }

  var initializationSequence = initializationFunctions();
  var step = 0;
  ws.on('message', function incoming(message) {
    //console.log("message:" +message);
    if(step< initializationSequence.length){
      initializationSequence[step](message);
      step++;
    }
    else{
      if(ws.isTeacher){
        codeChange(message);
        addToSavedChange(message);
      }
      else{
        console.log(message);
        allRooms[ws.classroomID].teacherSokcet.send(message);
      }
    }
  });



  function codeChange(message){
    allRooms[ws.classroomID].eventEmitter.emit("codechange",message);
  }
  function handleCreateCoderoom(message){
    console.log(message);
    if(allRooms[message]){console.log( "attempting to create from ID" + message+", this code room already exist"); ws.send("e");}
else{
      allRooms[message] = {};
      allRooms[message].changes = [];
      allRooms[message].eventEmitter = new eventEmitter();
      allRooms[message].teacherSokcet = ws;
    }
  }
  function handleJoinCoderoom(message){
   // console.log(allRooms);
    if(!allRooms[message]){ console.log( "coderoom not open"); return ws.terminate()}
    else{
      allRooms[message].eventEmitter.on("codechange",listener);
      allRooms[message].eventEmitter.on("close",close)
    }
    //console.log(allRooms);
  }
  ws.on("close", function(){
    if(ws.isTeacher === undefined){return};
    if(ws.isTeacher){allRooms[ws.classroomID].eventEmitter.emit("close"); delete allRooms[ws.classroomID];}
    else{
      if(allRooms[ws.classroomID]){

      
      allRooms[ws.classroomID].eventEmitter.removeListener("codechange",listener)//remove it from chat room
      allRooms[ws.classroomID].eventEmitter.removeListener("close",close)//remove it from chat room}
      }
    }

  })
  

});