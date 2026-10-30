namespace SchoolManagement.Controllers;

[Route("api/[controller]"), ApiController]
public sealed class StudentCourseController(AppDbContext context) : ControllerBase
{
    [HttpPost]
    public IActionResult AddStudentToCourse(StudentCourse studentCourse)
    {
        var studentExists = 
            context.Students.Any(s => s.Id == studentCourse.StudentId);
        if (!studentExists)
            return NotFound("Bu Id ilə tələbə tapılmadı.");

        var courseExists = 
            context.Courses.Any(c => c.Id == studentCourse.CourseId);
        if (!courseExists)
            return NotFound("Bu Id ilə kurs tapılmadı.");

        var alreadyAdded = 
            context.StudentCourses.Any(sc =>
            sc.StudentId == studentCourse.StudentId &&
            sc.CourseId == studentCourse.CourseId);
        if (alreadyAdded)
            return Conflict("Tələbə bu kursa artıq yazılıb.");

        context.StudentCourses.Add(studentCourse);
        context.SaveChanges();

        return StatusCode(201, studentCourse);
    }

    [HttpGet("{studentId}")]
    public IActionResult GetCoursesOfStudent(int studentId)
    {
        var studentExists = 
            context.Students.Any(s => s.Id == studentId);
        if (!studentExists)
            return NotFound("Bu Id ilə tələbə tapılmadı.");

        var courses = context.StudentCourses
            .Where(sc => sc.StudentId == studentId)
            .Select(sc => new { sc.Course.Id, sc.Course.Name })
            .ToList();

        return Ok();
    }
}