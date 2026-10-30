namespace Web.Entity
{
    public class Student
    {
        public int Id { get; set; }
        public string FullName { get; set; }
        public int Age { get; set; }
        public int ClassroomId { get; set; }
        public List<StudentCourse> Courses { get; set; }
        public Classroom Classroom { get; set; }

    }
}
