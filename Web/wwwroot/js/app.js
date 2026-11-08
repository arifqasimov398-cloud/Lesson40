const API = {
    students: "/api/student",
    classrooms: "/api/classroom",
    courses: "/api/course",
    enrollments: "/api/studentcourse"
};

const state = { students: [], classrooms: [], courses: [], enrollments: [], currentPage: "dashboard" };
const $ = (selector) => document.querySelector(selector);
const pageInfo = {
    dashboard: ["İcmal", "Məktəbin əsas göstəricilərinə ümumi baxış."],
    students: ["Tələbələr", "Tələbə məlumatlarına baxın və yeni tələbə qeydiyyatdan keçirin."],
    classrooms: ["Siniflər", "Məktəbdə mövcud olan sinifləri idarə edin."],
    courses: ["Kurslar", "Tədris olunan kursların siyahısı."],
    enrollments: ["Kurs qeydiyyatı", "Tələbə və kurs arasında əlaqə yaradın."]
};

function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[char]);
}

async function apiRequest(url, options = {}) {
    const response = await fetch(url, {
        ...options,
        headers: { "Content-Type": "application/json", ...(options.headers || {}) }
    });
    const text = await response.text();
    let data = null;
    if (text) {
        try { data = JSON.parse(text); }
        catch { data = text; }
    }
    if (!response.ok) {
        const message = typeof data === "string" ? data : data?.title || data?.message || data?.detail;
        throw new Error(message || `Server xətası: HTTP ${response.status}`);
    }
    return data;
}

function showToast(message, type = "success") {
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.textContent = message;
    $("#toastRegion").append(toast);
    window.setTimeout(() => toast.remove(), 3600);
}

function setConnection(status, message) {
    const banner = $("#connectionBanner");
    banner.classList.remove("connected", "error");
    if (status === "connected") banner.classList.add("connected");
    if (status === "error") banner.classList.add("error");
    $("#connectionText").textContent = message;
}

function initials(name) {
    return String(name || "?").trim().split(/\s+/).slice(0, 2).map(part => part[0] || "").join("").toUpperCase();
}

async function loadAllData() {
    setConnection("loading", "Server bağlantısı yoxlanılır...");
    try {
        const [students, classrooms, courses] = await Promise.all([
            apiRequest(API.students), apiRequest(API.classrooms), apiRequest(API.courses)
        ]);
        state.students = Array.isArray(students) ? students : [];
        state.classrooms = Array.isArray(classrooms) ? classrooms : [];
        state.courses = Array.isArray(courses) ? courses : [];
        const enrollmentLists = await Promise.all(state.students.map(async student => {
            try {
                const coursesForStudent = await apiRequest(`${API.enrollments}/${student.id}`);
                return (Array.isArray(coursesForStudent) ? coursesForStudent : []).map(course => ({
                    studentId: student.id, studentName: student.fullName,
                    classroomName: student.classroomName, courseId: course.id, courseName: course.name
                }));
            } catch { return []; }
        }));
        state.enrollments = enrollmentLists.flat();
        setConnection("connected", "Serverə qoşulub · Məlumatlar uğurla yükləndi");
        renderAll();
    } catch (error) {
        setConnection("error", `API bağlantısı alınmadı: ${error.message}`);
        renderEmptyOnError();
    }
}

function renderEmptyOnError() {
    ["statStudents", "statClassrooms", "statCourses", "statEnrollments"].forEach(id => $("#" + id).textContent = "—");
    $("#recentStudents").innerHTML = '<tr><td colspan="3" class="empty-cell">API bağlantısı qurulmayıb.</td></tr>';
    $("#dashboardClassrooms").innerHTML = '<div class="empty-state compact">Məlumat yüklənə bilmədi.</div>';
}

function renderAll() {
    $("#statStudents").textContent = state.students.length;
    $("#statClassrooms").textContent = state.classrooms.length;
    $("#statCourses").textContent = state.courses.length;
    $("#statEnrollments").textContent = state.enrollments.length;
    renderRecentStudents();
    renderDashboardClassrooms();
    renderStudents();
    renderClassrooms();
    renderCourses();
    renderEnrollments();
}

function renderRecentStudents() {
    const rows = [...state.students].slice(-5).reverse();
    $("#recentStudents").innerHTML = rows.length ? rows.map(student => `
        <tr><td><div class="person-cell"><span class="person-avatar">${escapeHtml(initials(student.fullName))}</span>${escapeHtml(student.fullName)}</div></td>
        <td>${escapeHtml(student.classroomName || "—")}</td><td>${escapeHtml(student.age)}</td></tr>`).join("")
        : '<tr><td colspan="3" class="empty-cell">Hələ tələbə əlavə edilməyib.</td></tr>';
}

function renderDashboardClassrooms() {
    const rows = state.classrooms.slice(0, 5);
    $("#dashboardClassrooms").innerHTML = rows.length ? rows.map(room => {
        const count = state.students.filter(student => student.classroomId === room.id).length;
        return `<div class="classroom-row"><span class="classroom-symbol">▦</span><span><strong>${escapeHtml(room.name)}</strong><small>${count} tələbə</small></span></div>`;
    }).join("") : '<div class="empty-state compact">Hələ sinif yaradılmayıb.</div>';
}

function renderStudents() {
    const query = ($("#studentSearch")?.value || "").trim().toLocaleLowerCase("az");
    const filtered = state.students.filter(student =>
        String(student.fullName || "").toLocaleLowerCase("az").includes(query) ||
        String(student.classroomName || "").toLocaleLowerCase("az").includes(query));
    $("#studentCountLabel").textContent = `${filtered.length} tələbə göstərilir`;
    $("#studentsTable").innerHTML = filtered.length ? filtered.map(student => `
        <tr><td>#${escapeHtml(student.id)}</td><td><div class="person-cell"><span class="person-avatar">${escapeHtml(initials(student.fullName))}</span>${escapeHtml(student.fullName)}</div></td>
        <td>${escapeHtml(student.age)}</td><td><span class="meta-pill">${escapeHtml(student.classroomName || "—")}</span></td></tr>`).join("")
        : '<tr><td colspan="4" class="empty-cell">Axtarışa uyğun tələbə tapılmadı.</td></tr>';
}

function renderClassrooms() {
    $("#classroomsGrid").innerHTML = state.classrooms.length ? state.classrooms.map(room => {
        const count = state.students.filter(student => student.classroomId === room.id).length;
        return `<article class="entity-card"><div class="entity-card-top"><span class="entity-icon">▦</span><span class="entity-id">ID #${escapeHtml(room.id)}</span></div><h3>${escapeHtml(room.name)}</h3><p>Sinif məlumatları</p><div class="entity-meta"><span class="meta-pill">${count} tələbə</span></div></article>`;
    }).join("") : '<div class="panel empty-state">Sinif tapılmadı. İlk sinfi yaratmaq üçün yuxarıdakı düymədən istifadə edin.</div>';
}

function renderCourses() {
    $("#coursesGrid").innerHTML = state.courses.length ? state.courses.map(course => {
        const count = state.enrollments.filter(item => item.courseId === course.id).length;
        return `<article class="entity-card"><div class="entity-card-top"><span class="entity-icon">▤</span><span class="entity-id">ID #${escapeHtml(course.id)}</span></div><h3>${escapeHtml(course.name)}</h3><p>Kurs məlumatları</p><div class="entity-meta"><span class="meta-pill">${count} qeydiyyat</span></div></article>`;
    }).join("") : '<div class="panel empty-state">Kurs tapılmadı. İlk kursu yaratmaq üçün yuxarıdakı düymədən istifadə edin.</div>';
}

function renderEnrollments() {
    $("#enrollmentsTable").innerHTML = state.enrollments.length ? state.enrollments.map(item => `
        <tr><td><div class="person-cell"><span class="person-avatar">${escapeHtml(initials(item.studentName))}</span>${escapeHtml(item.studentName)}</div></td>
        <td>${escapeHtml(item.classroomName || "—")}</td><td><span class="meta-pill">${escapeHtml(item.courseName)}</span></td></tr>`).join("")
        : '<tr><td colspan="3" class="empty-cell">Hələ kurs qeydiyyatı yoxdur.</td></tr>';
}

function navigate(page) {
    if (!pageInfo[page]) page = "dashboard";
    state.currentPage = page;
    document.querySelectorAll("[data-page]").forEach(link => link.classList.toggle("active", link.dataset.page === page));
    document.querySelectorAll(".page-section").forEach(section => section.classList.add("hidden"));
    $("#" + page + "Page").classList.remove("hidden");
    $("#pageTitle").textContent = pageInfo[page][0];
    $("#pageSubtitle").textContent = pageInfo[page][1];
    $("#breadcrumbCurrent").textContent = pageInfo[page][0];
    $("#sidebar").classList.remove("open");
}

function showModal(title, fields, submit) {
    $("#modalTitle").textContent = title;
    $("#modalFields").innerHTML = fields;
    $("#formError").classList.add("hidden");
    $("#modalBackdrop").classList.remove("hidden");
    $("#modalForm").onsubmit = async event => {
        event.preventDefault();
        const button = $("#submitModal");
        button.disabled = true;
        button.textContent = "Yadda saxlanılır...";
        try {
            const formData = new FormData(event.currentTarget);
            await submit(formData);
            closeModal();
            await loadAllData();
            showToast("Məlumat uğurla yadda saxlanıldı.");
        } catch (error) {
            $("#formError").textContent = error.message;
            $("#formError").classList.remove("hidden");
        } finally {
            button.disabled = false;
            button.textContent = "Yadda saxla";
        }
    };
    const firstInput = $("#modalFields input, #modalFields select");
    if (firstInput) firstInput.focus();
}

function closeModal() {
    $("#modalBackdrop").classList.add("hidden");
    $("#modalForm").reset();
}

function openClassroomModal() {
    showModal("Yeni sinif yarat", `
        <div class="field"><label for="classroomName">Sinifin adı</label><input id="classroomName" name="name" maxlength="50" placeholder="Məsələn: 10A" required></div>`,
        async data => apiRequest(API.classrooms, { method: "POST", body: JSON.stringify({ name: data.get("name").trim() }) }));
}

function openCourseModal() {
    showModal("Yeni kurs əlavə et", `
        <div class="field"><label for="courseName">Kursun adı</label><input id="courseName" name="name" maxlength="100" placeholder="Məsələn: Riyaziyyat" required></div>`,
        async data => apiRequest(API.courses, { method: "POST", body: JSON.stringify({ name: data.get("name").trim() }) }));
}

function openStudentModal() {
    if (!state.classrooms.length) {
        showToast("Əvvəlcə ən azı bir sinif yaradın.", "error");
        navigate("classrooms");
        return;
    }
    showModal("Yeni tələbə qeydiyyatı", `
        <div class="field"><label for="studentName">Ad və soyad</label><input id="studentName" name="fullName" maxlength="100" placeholder="Məsələn: Əli Məmmədov" required></div>
        <div class="field"><label for="studentAge">Yaş</label><input id="studentAge" name="age" type="number" min="1" max="120" placeholder="16" required></div>
        <div class="field"><label for="studentClassroom">Sinif</label><select id="studentClassroom" name="classroomId" required><option value="">Sinif seçin</option>${state.classrooms.map(room => `<option value="${escapeHtml(room.id)}">${escapeHtml(room.name)}</option>`).join("")}</select></div>`,
        async data => apiRequest(API.students, { method: "POST", body: JSON.stringify({
            fullName: data.get("fullName").trim(), age: Number(data.get("age")), classroomId: Number(data.get("classroomId"))
        }) }));
}

function openEnrollmentModal() {
    if (!state.students.length || !state.courses.length) {
        showToast("Kursa yazmaq üçün əvvəlcə tələbə və kurs əlavə edin.", "error");
        navigate(!state.students.length ? "students" : "courses");
        return;
    }
    showModal("Tələbəni kursa yaz", `
        <div class="field"><label for="enrollStudent">Tələbə</label><select id="enrollStudent" name="studentId" required><option value="">Tələbə seçin</option>${state.students.map(student => `<option value="${escapeHtml(student.id)}">${escapeHtml(student.fullName)} · ${escapeHtml(student.classroomName || "")}</option>`).join("")}</select></div>
        <div class="field"><label for="enrollCourse">Kurs</label><select id="enrollCourse" name="courseId" required><option value="">Kurs seçin</option>${state.courses.map(course => `<option value="${escapeHtml(course.id)}">${escapeHtml(course.name)}</option>`).join("")}</select></div>`,
        async data => apiRequest(API.enrollments, { method: "POST", body: JSON.stringify({
            studentId: Number(data.get("studentId")), courseId: Number(data.get("courseId"))
        }) }));
}

function initialize() {
    $("#todayLabel").textContent = new Intl.DateTimeFormat("az-AZ", { day: "numeric", month: "long", year: "numeric" }).format(new Date());
    $("#yearLabel").textContent = new Date().getFullYear();
    document.querySelectorAll("[data-page]").forEach(link => link.addEventListener("click", event => {
        event.preventDefault();
        const page = link.dataset.page;
        navigate(page);
        history.replaceState(null, "", "#" + page);
    }));
    $("#mobileMenu").addEventListener("click", () => $("#sidebar").classList.toggle("open"));
    $("#quickAddStudent").addEventListener("click", openStudentModal);
    $("#addStudentButton").addEventListener("click", openStudentModal);
    $("#addClassroomButton").addEventListener("click", openClassroomModal);
    $("#addCourseButton").addEventListener("click", openCourseModal);
    $("#addEnrollmentButton").addEventListener("click", openEnrollmentModal);
    $("#studentSearch").addEventListener("input", renderStudents);
    $("#refreshButton").addEventListener("click", loadAllData);
    $("#modalClose").addEventListener("click", closeModal);
    $("#cancelModal").addEventListener("click", closeModal);
    $("#modalBackdrop").addEventListener("click", event => { if (event.target === $("#modalBackdrop")) closeModal(); });
    document.addEventListener("keydown", event => { if (event.key === "Escape") closeModal(); });
    const initialPage = location.hash.replace("#", "");
    navigate(pageInfo[initialPage] ? initialPage : "dashboard");
    loadAllData();
}

document.addEventListener("DOMContentLoaded", initialize);
