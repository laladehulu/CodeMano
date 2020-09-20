class StudentClassroomService{
    constructor(){

    }
 getAssignmentLists(classroom){
        return classroom.assignment;
    }
}
module.exports = new StudentClassroomService();