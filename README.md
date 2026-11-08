# EduCore — School Management

ASP.NET Core 10 + Entity Framework Core + SQL Server + HTML/CSS/JavaScript.

## What is included

- Dashboard with student, classroom, course and enrollment counts.
- Responsive Azerbaijani interface.
- Student list and search.
- Create classrooms, courses and students.
- Enroll a student in a course.
- API connection status and refresh action.
- Existing REST API is used by the frontend; data is not stored in browser local storage.

## Requirements

- .NET 10 SDK
- SQL Server LocalDB (the development connection string uses `(localdb)\\MSSQLLocalDB`)
- EF Core command-line tool (if not installed: `dotnet tool install --global dotnet-ef`)

## Run locally

From the repository root:

```bash
dotnet restore Web/Web.csproj
dotnet ef database update --project Web/Web.csproj --startup-project Web/Web.csproj
dotnet run --project Web/Web.csproj
```

Open the HTTP URL printed by ASP.NET Core (the checked-in launch profile uses `http://localhost:5250`).

The Development launch profile loads `appsettings.Development.json`, which contains the LocalDB connection string. For a non-development deployment, configure `ConnectionStrings__DefaultConnection` as an environment variable or secret. Do not publish production database passwords in source control.

## API routes used by the UI

| Method | Route | Purpose |
|---|---|---|
| GET, POST | `/api/classroom` | List and create classrooms |
| GET, POST | `/api/student` | List and create students |
| GET, POST | `/api/course` | List and create courses |
| GET | `/api/studentcourse/{studentId}` | List a student's courses |
| POST | `/api/studentcourse` | Enroll a student in a course |

## Notes

- The UI needs the ASP.NET Core API and SQL Server database to be running. Opening `index.html` directly as a file will not work because the browser calls relative `/api` routes.
- The application currently has no authentication/role management, edit/delete screens, or public hosting configuration.
- Build and browser integration tests should be run in an environment with the .NET 10 SDK and SQL Server LocalDB installed.
