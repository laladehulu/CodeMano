

var editor = ace.edit("editor",{mode:"ace/mode/javascript",selectionStyle: "text"});
editor.setTheme("ace/theme/github")
editor.session.setMode("ace/mode/javascript");//initializing acer editor
var EditSession = ace.require("ace/edit_session").EditSession;
var Range= ace.require("ace/range").Range;

const questionTemplate =  `<div class="question-expand" onclick="expandQ(this)">
{{status}}
<div class="question-content">
  <p class="question-content-text">
    {{question}}
  </p>
  <span class="circle"></span>
  <textarea></textarea>
  <button class="btn-success btn" >Send</button>
</div>
</div>
`

// and then to load document into editor, just call

editor.setReadOnly(true);
var code = editor.session.getDocument();


var insertFromNetwork= (pos,text)=>{

    if(text.length ==1){
        insertChangeText();
    }
    else{
        changeLines();
    }
}

function createElementFromHTML(htmlString) {
    var div = document.createElement('div');
    div.innerHTML = htmlString.trim();
  
    // Change this to div.childNodes to support multiple top-level nodes
    return div.firstChild; 
  }
function addCard(cards,container){
    const template = `<div class="card"></div>`
    cards.forEach(card =>{
        let cardEle =createElementFromHTML(template);
        cardEle.querySelector(".card").innerHTML = cards;
        container.appendChild(cardEle);
    })
}
const QuestionManager = (function(){
    var RightSection = document.querySelector(".right");
    var allQuestions = [];//made up of nodes

 
    var addQuestion = (newQuestion)=>{
        var htmlStr = Mustache.render(questionTemplate,newQuestion);//render and create the element
        var ele = createElementFromHTML(htmlStr);
        allQuestions.push(ele);
        var index = allQuestions.length-1;
        var content = ele.querySelector(".question-content");
        var textArea = ele.querySelector("textarea");
        var sendBtn = ele.querySelector("button");
        sendBtn.addEventListener("click", function(){
           console.log(textArea.value) ;
           sendAnswer(index,textArea.value);
           ele.classList.toggle("question-active")
           finishStatus();
        })
        var statusNode= ele.childNodes[0];
        statusNode.nodeValue = "Q: "+newQuestion.question.slice(0,30);
        var statusCircle;
        function  changeStatus() {
            statusNode.nodeValue = "editing";
            statusCircle.classList.add("circle-editing")
        }
        function finishStatus(){
            statusNode.nodeValue = "done";
            statusCircle.classList.add("circle-done")
        }
        var statusCircle = ele.querySelector(".circle")
        content.querySelector("textarea").addEventListener('input', function (evt) {
            changeStatus();
            
        });
        content.addEventListener("click",function(event){
            event.stopPropagation();
            console.log("child clicked");
        })
        RightSection.appendChild(ele);
    }
    var removeQuestion = (index)=>{
        allQuestions[index].style.margin = "0px";
        allQuestions[index].style.maxHeight = "0";

        allQuestions[index].style.padding = "0";
        console.log( allQuestions[index].style.transform );
        var toRemove = allQuestions[index];

        setTimeout(() => {
            toRemove.remove();//remove node
        }, (500));

        allQuestions.splice(index,1);//remove the null from index
    }
    return {addQuestion,removeQuestion};
    
})()






function handlerFunctions(){
    var insertChangeText = (content)=>{
        let messageArray = content.split("/!");
        var start = {row:parseInt(messageArray[0],10),column:parseInt(messageArray[1],10)};
        //messageArray == [row,column,1st line,line,line]
        console.log(messageArray);
        code.insert(start,messageArray[2]);// add the first line to the starting pos
        if(messageArray.length>3){
        var lines = messageArray.slice(3);
        code.insertLines(start.row+1,lines);
        }
    ///!
    }
    var insertChangeLine = (content)=>{
        let place = {row:parseInt(content,10),column:0};
        code.insertNewLine(place);
    }
    var removeChangeRange = (content)=>{
        let messageArray = content.split("/!");
        var start = {row:parseInt(messageArray[0],10),column:parseInt(messageArray[1],10)};
        var end = {row:parseInt(messageArray[2],10),column:parseInt(messageArray[3],10)};
        var range = new Range(start.row,start.column,end.row,end.column);
        code.remove(range);

    }
    var addQuestion = (content)=>{
        let messageArray = content.split("/!")
        console.log(messageArray[0]);
        var question = {status:"unfinished",question:messageArray[0]}
        QuestionManager.addQuestion(question);  
        

    }
    var removeQuestion = (content)=>{
        let index = content.split("/!")[0]
        var question = {status:"unfinished",question:messageArray[0]}
        QuestionManager.removeQuestion[index];
     

    }
    
    
    function teacherClose(content){
        alert("the teacher has left the classroom");
    }
    var removeText = () =>{
        
    }
    return  {
        "i":insertChangeText,
        "l":insertChangeLine,
        "r":removeChangeRange,
        'q':addQuestion,
        'p':removeQuestion,
        'close':teacherClose
        
    }
}

const handlers = handlerFunctions();


code.on("change", (e)=>{
    
    console.log(e);
})

var ws = new WebSocket("wss://"+window.location.hostname
            +':'+window.location.port
            );
var sendAnswer = function(index,answerText){
    ws.send("a"+index+"/!"+answerText+"/!"+name);
}

ws.onopen= function(){
    console.log(ClassCode);
    ws.send("student");
    ws.send(ClassCode);
    ws.send("initiliazation sequence #3- apply all previous changes");

}
ws.onerror = function(e){
    console.log(e);
    alert("websocket connection error");
}

ws.onmessage = function(e){
    
    let data = e.data
    var pos, text;
    console.log(data);
    if(data == "close"){
        alert("the teacher has left the classroom");
    }
    if(data == "not open"){
        alert("code room not open");
    }
    else{
        handlers[data.charAt(0)](data.slice(1));//use the first letter to distinguish message type, and pass the rest of the string to the handler function
    }
   
}
