namespace Web.Data
{
    public class AppDbContext(DbContextOptions<AppDbContext> options):DbContext (options)
    {
        public DbSet<Student> Students { get; set; } 
        public DbSet<Course> Courses { get; set; }
        public DbSet<Classroom> Classrooms { get; set; }
        public DbSet<StudentCourse> StudentCourses { get; set; }

        protected override void OnModelCreating(ModelBuilder mdb)
        {
            mdb.Entity<Student>(entity =>
            {
                entity.Property(e => e.FullName).HasMaxLength(100).IsRequired();
                entity.Property(e => e.Age).HasColumnType("int");

                entity.HasOne(e => e.Classroom)
                    .WithMany(e => e.Students)
                    .HasForeignKey(e => e.ClassroomId);
            });
            mdb.Entity<Classroom>(entity =>
            {
                entity.Property(e => e.Name).HasMaxLength(50).IsRequired();
            });
            mdb.Entity<Course>(entity =>
            {
                entity.Property(e => e.Name).HasMaxLength(100).IsRequired();
            });
            mdb.Entity<StudentCourse>(entity =>
            {
                entity.HasKey(e => new { e.StudentId, e.CourseId });

                entity.HasOne(e => e.Student)
                    .WithMany(e => e.Courses)
                    .HasForeignKey(e => e.StudentId);

                entity.HasOne(e => e.Course)
                    .WithMany(e => e.Students)
                    .HasForeignKey(e => e.CourseId);
            });
        }
    }
}
