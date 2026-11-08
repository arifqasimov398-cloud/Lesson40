namespace SchoolManagement.Controllers;

[Route("api/[controller]"), ApiController]
public sealed class CourseController(AppDbContext context) : ControllerBase
{
    [HttpPost]
    public IActionResult Create(Course course)
    {
        if (string.IsNullOrWhiteSpace(course.Name))
            return BadRequest("Kursun adı boş ola bilməz.");

        course.Name = course.Name.Trim();
        context.Courses.Add(course);
        context.SaveChanges();

        return StatusCode(201, new { course.Id, course.Name });
    }

    [HttpGet]
    public IActionResult GetAll()
    {
        var courses = context.Courses
            .OrderBy(c => c.Name)
            .Select(c => new { c.Id, c.Name })
            .ToList();

        return Ok(courses);
    }
}
