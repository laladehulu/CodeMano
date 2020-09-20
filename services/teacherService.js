class teacherService{
    constructor(){

    }
 async createClassroom(){
    function generateCode(){
        
        let letters = ["abcdefghijkw123456789"];
        let Code = ""
        for(let i = 0;i<6;i++){
            Code += letters[Math.floor(Math.random()*letters.length)];
        }
        return Code;
    }
    var teacherToken = generateCode();//insecure, need to use  a jwt token later on
    var code = generateCode();
    await classroomSchema.create({
        code: code,
        teacherToken:teacherToken,//need to hash it with becrypt
        assignment:[]
    })
    return teacherToken;

    }
    
}
module.exports = new teacherService();