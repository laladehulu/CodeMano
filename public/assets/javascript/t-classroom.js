

var editor = ace.edit("editor",{mode:"ace/mode/javascript",selectionStyle: "text"});
editor.setTheme("ace/theme/github")
editor.session.setMode("ace/mode/javascript");//initializing acer editor
var EditSession = ace.require("ace/edit_session").EditSession;
var Range= ace.require("ace/range").Range;
var js = new EditSession("some js code");

var questionTemplate = `<div class="question-expand" onclick="expandQ(this)">
<p class="question-content-text">
  
</p>
<p class="question-content-count">
  Submitted #: <span class="count">1</span>
</p>
<div class="question-answers">
  <div class="answer-container">
   
    
  </div>
 
</div>
</div>`
var answerTemplate = `         

  <div class="answer">
    <p class="answer-student-name">
      Devin
    </p>
    <div class="answer-text">
      Hi

  </div>
  
</div>

</div>

`
function createElementFromHTML(htmlString) {
    var div = document.createElement('div');
    div.innerHTML = htmlString.trim();
  
    // Change this to div.childNodes to support multiple top-level nodes
    return div.firstChild; 
  }

// and then to load document into editor, just call
var Question = (function(){
    const Answer = function(index, answerText,studentName){
        this.answerText = answerText;
        this.studentName = studentName;
        this.element = createElementFromHTML(answerTemplate);
        
        allQuestions[index].element.querySelector(".answer-container").appendChild(this.element);//it need the index to add the element into the page
        console.log(this.element);
        this.studentNameDiv = this.element.querySelector(".answer-student-name");

        this.textDiv = this.element.querySelector(".answer-text");
        this.changeAnswerView(answerText,studentName);

    }
    Answer.prototype.changeAnswerView = function(answerText,studentName){
  
        this.studentNameDiv.innerHTML=studentName;
 
        this.textDiv.innerHTML = answerText;
    }
    var QuestionSection = document.querySelector(".questions");

    var QuestionAddInputEle = document.querySelector(".add-question");
    var questionTextarea = QuestionAddInputEle.querySelector("textarea");
    QuestionAddInputEle.style.display ="none";
    var allQuestions = [];//{questionString,node}


 
    var enableAddQuestionUI = (newQuestion)=>{
        QuestionAddInputEle.style.display ="block";
        
    }
    var turnOffAddQuestionUI = (newQuestion)=>{
        QuestionAddInputEle.style.display ="none";
        
    }
    var addQuestion = ()=>{
        var questionText = questionTextarea.value;
        let newQuestionEle = createElementFromHTML(questionTemplate);
        allQuestions.push({questionText,answers:{},element:newQuestionEle});

        sendNewQuestion(questionText);
        QuestionSection.appendChild(newQuestionEle);
        newQuestionEle.querySelector(".question-content-text").innerHTML = questionText;
        questionTextarea.value = "";
        
    }
    var addAnswer = (index, answerText,studentName)=>{
        if(allQuestions[index].answers[studentName]){//if the student already responded, simply change the view by calling changeView function
            allQuestions[index].answers[studentName].changeAnswerView(answerText,studentName);
        }
        else{
            allQuestions[index].answers[studentName] = new Answer(index,answerText,studentName);
        }

       
        allQuestions
    }
    return {
        enableAddQuestionUI,turnOffAddQuestionUI,addQuestion,addAnswer
        
    }
})()
var code = editor.session.getDocument();


function reformatData(change){
    function formatInsert(change){
        var str ='i'+change.start.row.toString()+'/!'+change.start.column.toString();
        change.lines.forEach(element => {
            str+= '/!'+element;
        });
        console.log(str);
        return str;
    }
    function formatRemove(change){
        var str ='r'+change.start.row.toString()+'/!'+change.start.column.toString()
        +'/!'+change.end.row.toString()+'/!'+change.end.column.toString();
        return str;
    }
    return change.action == "insert"?formatInsert(change): formatRemove(change);
}

var ws = new WebSocket("ws://"+window.location.hostname
            +':'+window.location.port
            );
            function sendNewQuestion(questionText){
                ws.send("q"+questionText)
            }
code.on("change", (e)=>{
    ws.send(reformatData(e));
    
})


ws.onopen= function(){
    ws.send("teacher");
    ws.send(ClassCode);
    ws.send("initiliazation sequence #3- apply all previous changes");
}
const Handlers = (function handlerFunctions(){
  
    function answerQuestion(content){
        let messageArray = content.split("/!");
        Question.addAnswer(messageArray[0],messageArray[1],messageArray[2])
    }
    
    function teacherClose(content){
        
    }
    var removeText = () =>{
        
    }
    return  {
        'a':answerQuestion
        
    }
})();

ws.onmessage = function(e){
    if(e =="e"){
        alert("you are trying to create a room that already exist.Please open another instance.");
    }
   let data = e.data
   //var pos, text;
    Handlers[data.charAt(0)](data.slice(1));//use the first letter to distinguish message type, and pass the rest of the string to the handler function
}
