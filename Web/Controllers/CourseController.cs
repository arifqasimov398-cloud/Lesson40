namespace SchoolManagement.Controllers;

[Route("api/[controller]"), ApiController]
public sealed class CourseController(AppDbContext context) : ControllerBase
{
    [HttpPost]
    public IActionResult Create(Course course)
    {
        context.Courses.Add(course);
        context.SaveChanges();

        return StatusCode(201, course);
    }

    [HttpGet]
    public IActionResult GetAll()
    {
        var courses = context.Courses
            .Select(c => new { c.Id, c.Name })
            .ToList();

        return Ok();
    }
}