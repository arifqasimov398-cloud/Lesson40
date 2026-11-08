namespace SchoolManagement.Controllers;

[Route("api/[controller]"), ApiController]
public sealed class StudentCourseController(AppDbContext context) : ControllerBase
{
    [HttpPost]
    public IActionResult AddStudentToCourse(StudentCourse studentCourse)
    {
        var studentExists = context.Students.Any(s => s.Id == studentCourse.StudentId);
        if (!studentExists)
            return NotFound("Bu ID ilə tələbə tapılmadı.");

        var courseExists = context.Courses.Any(c => c.Id == studentCourse.CourseId);
        if (!courseExists)
            return NotFound("Bu ID ilə kurs tapılmadı.");

        var alreadyAdded = context.StudentCourses.Any(sc =>
            sc.StudentId == studentCourse.StudentId &&
            sc.CourseId == studentCourse.CourseId);

        if (alreadyAdded)
            return Conflict("Tələbə bu kursa artıq əlavə olunub.");

        context.StudentCourses.Add(studentCourse);
        context.SaveChanges();

        return StatusCode(201, new
        {
            studentCourse.StudentId,
            studentCourse.CourseId
        });
    }

    [HttpGet("{studentId:int}")]
    public IActionResult GetCoursesOfStudent(int studentId)
    {
        var studentExists = context.Students.Any(s => s.Id == studentId);
        if (!studentExists)
            return NotFound("Bu ID ilə tələbə tapılmadı.");

        var courses = context.StudentCourses
            .Where(sc => sc.StudentId == studentId)
            .OrderBy(sc => sc.Course.Name)
            .Select(sc => new { sc.Course.Id, sc.Course.Name })
            .ToList();

        return Ok(courses);
    }
}
