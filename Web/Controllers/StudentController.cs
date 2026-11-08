namespace SchoolManagement.Controllers;

[Route("api/[controller]"), ApiController]
public sealed class StudentController(AppDbContext context) : ControllerBase
{
    [HttpPost]
    public IActionResult Create(Student student)
    {
        if (string.IsNullOrWhiteSpace(student.FullName))
            return BadRequest("Tələbənin adı boş ola bilməz.");

        if (student.Age < 1 || student.Age > 120)
            return BadRequest("Yaş 1 ilə 120 arasında olmalıdır.");

        var classroomExists = context.Classrooms.Any(c => c.Id == student.ClassroomId);
        if (!classroomExists)
            return BadRequest("Seçilmiş sinif tapılmadı.");

        student.FullName = student.FullName.Trim();
        context.Students.Add(student);
        context.SaveChanges();

        return StatusCode(201, new
        {
            student.Id,
            student.FullName,
            student.Age,
            student.ClassroomId
        });
    }

    [HttpGet]
    public IActionResult GetAll()
    {
        var students = context.Students
            .OrderBy(s => s.FullName)
            .Select(s => new
            {
                s.Id,
                s.FullName,
                s.Age,
                s.ClassroomId,
                ClassroomName = s.Classroom.Name
            })
            .ToList();

        return Ok(students);
    }
}
