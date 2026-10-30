namespace SchoolManagement.Controllers;

[Route("api/[controller]"), ApiController]
public sealed class ClassroomController(AppDbContext context) : ControllerBase
{
    [HttpPost]
    public IActionResult Create(Classroom classroom)
    {
        context.Classrooms.Add(classroom);
        context.SaveChanges();

        return StatusCode(201, classroom);
    }

    [HttpGet]
    public IActionResult GetAll()
    {
        var classrooms = context.Classrooms
            .Select(c => new { c.Id, c.Name })
            .ToList();

        return Ok(classrooms);
    }
}