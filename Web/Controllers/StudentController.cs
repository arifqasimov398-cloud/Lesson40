namespace SchoolManagement.Controllers;

[Route("api/[controller]"), ApiController]
public sealed class StudentController(AppDbContext context) : ControllerBase
{
    [HttpPost]
    public IActionResult Create(Student student)
    {
        var classroomExists = context.Classrooms.Any(c => c.Id == student.ClassroomId);

        if (!classroomExists)
            return BadRequest("Bu Id ilə sinif tapılmadı.");

        context.Students.Add(student);
        context.SaveChanges();

        return StatusCode(201, student);
    }

    [HttpGet]
    public IActionResult GetAll()
    {
        var students = context.Students
            .Select(s => new
            {
                s.Id,
                s.FullName,
                s.Age,
                s.ClassroomId,
                ClassroomName = s.Classroom.Name
            })
            .ToList();

        return Ok();
    }
}