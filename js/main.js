// Load theme preference immediately (before page render)
(function() {
    if (localStorage.getItem("darkMode") === "true") {
        document.body.classList.add("dark-mode");
    }
})();

const themeToggle = document.getElementById("themeToggle");
if (themeToggle) {
    themeToggle.addEventListener("click", () => {
        document.body.classList.toggle("dark-mode");
        localStorage.setItem("darkMode", document.body.classList.contains("dark-mode"));
        updateThemeToggleIcon();
    });
}

function updateThemeToggleIcon() {
    const themeToggle = document.getElementById("themeToggle");
    if (themeToggle) {
        const icon = themeToggle.querySelector("i");
        if (document.body.classList.contains("dark-mode")) {
            icon.classList.remove("fa-moon");
            icon.classList.add("fa-sun");
        } else {
            icon.classList.remove("fa-sun");
            icon.classList.add("fa-moon");
        }
    }
}

updateThemeToggleIcon();

const searchBtn = document.getElementById("searchBtn");
if (searchBtn) {
    searchBtn.addEventListener("click", renderCourses);
}

// Courses Data
const coursesData = [
    {id: 1, name: "اسس اساليب البحث", code: "040521301", year: null, semester: null, category: "اجباري جامعة", driveUrl: "https://drive.google.com/drive/folders/1hbZC882Rf0Pk6s8_28DexaygIbPGTxym"},
    {id: 2, name: "خدمة المجتمع", code: "000011110", year: null, semester: null, category: "اجباري جامعة", driveUrl: "https://drive.google.com/drive/folders/1JPkZM0Ia-cedMOcZz_VweoVdPnaBAj2L"},
    {id: 3, name: "دراسات فلسطينية", code: "040511011", year: null, semester: null, category: "اجباري جامعة", driveUrl: "https://drive.google.com/drive/folders/1WRoXBUG_l0OZG67xlbIhCssE9iQlyhFk"},
    {id: 4, name: "عربي", code: "040111001", year: null, semester: null, category: "اجباري جامعة", driveUrl: "https://drive.google.com/drive/folders/1WfnS499CB4oIaLmpv5f_Jggg0l8r90tD"},
    {id: 5, name: "مواد انجليزي", code: null, year: null, semester: null, category: "اجباري جامعة", driveUrl: "https://drive.google.com/drive/folders/1WkyKP3DfGqJyGZ4GPU4qqMLq3t9kWYto"},
    {id: 6, name: "Computer Skills", code: "110411000", year: null, semester: null, category: "اجباري جامعة", driveUrl: "https://drive.google.com/drive/folders/1SjoJmwFUpLbq35UlysFH9TLnZBaKRUXI"},
    {id: 7, name: "Calculus 1", code: "100411010", year: 1, semester: 1, category: "اجباري كلية", driveUrl: "https://drive.google.com/drive/folders/1X0fbhF8lcTesTSsoir2sqW1jh5VrMs2L"},
    {id: 8, name: "Introduction to IT", code: "240221010", year: 1, semester: 1, category: "اجباري تخصص", driveUrl: "https://drive.google.com/drive/folders/11-vVJZERssy3nswSi1H2C8J1hpJJbE4_"},
    {id: 9, name: "Lab Introduction to IT", code: "110111030", year: 1, semester: 1, category: "اجباري تخصص", driveUrl: "https://drive.google.com/drive/folders/1eON1blwCHvIuVh6Dw9SjWFy0rjxU8SPb"},
    {id: 10, name: "C++ (1)", code: "240111011", year: 1, semester: 2, category: "اجباري كلية", driveUrl: "https://drive.google.com/drive/folders/1hQD_eKyVxqN_YLjQk8yq3Zs6bpxIY3yl"},
    {id: 11, name: "Lab C++ (1)", code: "240111021", year: 1, semester: 2, category: "اجباري كلية", driveUrl: "https://drive.google.com/drive/folders/1hUmAKyKh87C_x28kQUc6IP95kwJEgv1W"},
    {id: 12, name: "Calculus 2", code: "100411020", year: 1, semester: 2, category: "اجباري كلية", driveUrl: "https://drive.google.com/drive/folders/1hOfjOyoXyKcQxp82crmlFJKlmm9e5bwy"},
    {id: 13, name: "Digital Logic Design", code: "110411100", year: 1, semester: 2, category: "اجباري تخصص", driveUrl: "https://drive.google.com/drive/folders/1hPXReG9R_Z_Au1EzaWNh0Ch2pyh7taxN"},
    {id: 14, name: "Discrete Mathematics", code: "100413750", year: 1, semester: 2, category: "اجباري كلية", driveUrl: "https://drive.google.com/drive/folders/1hVtW4PuE2uik-bP9UCPiIQIszsTCoqTZ"},
    {id: 15, name: "C++ (2)", code: "240112003", year: 2, semester: 1, category: "اجباري تخصص", driveUrl: "https://drive.google.com/drive/folders/1hja6dg8rN4y5gKjzW9UqNOL9T2jzZLqs"},
    {id: 16, name: "Lab C++ (2)", code: "110412120", year: 2, semester: 1, category: "اجباري تخصص", driveUrl: "https://drive.google.com/drive/folders/1hkiYnpoDdnyn57-vsLocB5ExfSTkIpBw"},
    {id: 17, name: "Math for IT", code: "100412040", year: 2, semester: 1, category: "اجباري كلية", driveUrl: "https://drive.google.com/drive/folders/1hhI7FbM-C8Z2pvYfPU88rQOKZXsG0tpF"},
    {id: 18, name: "Computer Organization", code: "240112111", year: 2, semester: 1, category: "اجباري تخصص", driveUrl: "https://drive.google.com/drive/folders/1hmKhR3ubEQyfa4crWeFNZD6XZnVG2oPo"},
    {id: 19, name: "Computer Networks 1", code: "240223041", year: 2, semester: 2, category: "اجباري تخصص", driveUrl: "https://drive.google.com/drive/folders/1iG0H7LKR_kVqyWfrALO5bRzD8jZKC_AW"},
    {id: 20, name: "Data Structures", code: "240112031", year: 2, semester: 2, category: "اجباري تخصص", driveUrl: "https://drive.google.com/drive/folders/1huOkQC9Xfi643cZyCUypLOXDK1Aq7Jqq"},
    {id: 21, name: "Data Structures LAB", code: "110412130", year: 2, semester: 2, category: "اجباري تخصص", driveUrl: "https://drive.google.com/drive/folders/1i1-_E6qhBNJxTjIMb8qRWIZO0kd9IQ-u"},
    {id: 22, name: "Java (OOP)", code: "240212010", year: 2, semester: 2, category: "اجباري تخصص", driveUrl: "https://drive.google.com/drive/folders/1iGTlgNaxx6rDZpxNLph4xI7ex-dPeUFU"},
    {id: 23, name: "Algorithm and Programming Techniques", code: "240113020", year: 3, semester: 1, category: "اجباري تخصص", driveUrl: "https://drive.google.com/drive/folders/1jENn7F2u9yyVuuI2FLLOye-Vj3JjeRVr"},
    {id: 24, name: "Data Base", code: "240113121", year: 3, semester: 1, category: "اجباري تخصص", driveUrl: "https://drive.google.com/drive/folders/1iNeTm9Wh-BMfH5eTFAiP8UFcK8fq5rNv"},
    {id: 25, name: "Data Base LAB", code: "240113132", year: 3, semester: 1, category: "اجباري تخصص", driveUrl: "https://drive.google.com/drive/folders/1iPSlz4CAHyW4ByMHRKShZQMxhRySx2Wu"},
    {id: 26, name: "Web Development 1", code: "240213081", year: 3, semester: 1, category: "اجباري تخصص", driveUrl: "https://drive.google.com/drive/folders/1ibQ1RHL_J_tMx4VNInuYprYDphgv3EfQ"},
    {id: 27, name: "Computer Networks 1 LAB", code: "110113220", year: 3, semester: 1, category: "اجباري تخصص", driveUrl: "https://drive.google.com/drive/folders/1iJLhJ8nHVld8r5QdpuY5nNKhGEbO1V4P"},
    {id: 28, name: "Introduction to Operating Systems", code: "240113311", year: 3, semester: 1, category: "اجباري تخصص", driveUrl: "https://drive.google.com/drive/folders/1iZJDjtyK6q9XrwaSeyWrz_zhsmj21OMP"},
    {id: 29, name: "Speech Communication and Technical Writing", code: "240213480", year: 3, semester: 1, category: "اجباري تخصص", driveUrl: "https://drive.google.com/drive/folders/1ifMGIa7iRWZK8NsIH2XQf2RHDtgAP1_d"},
    {id: 30, name: "Advanced Java (OOP)", code: "240213010", year: 3, semester: 2, category: "اجباري تخصص", driveUrl: "https://drive.google.com/drive/folders/1jO51JVYGW6yKWtBACVgtONwyaUYIfvuV"},
    {id: 31, name: "Introduction to Software Engineering", code: "240113171", year: 3, semester: 2, category: "اجباري تخصص", driveUrl: "https://drive.google.com/drive/folders/1jFq2GeN-D_ZrjYrgypfA12kY26L6IXUG"},
    {id: 32, name: "IT Project Management", code: "240114471", year: 3, semester: 2, category: "اجباري تخصص", driveUrl: "https://drive.google.com/drive/folders/1jKfuzO7lRdVYjdkf8hVINE7uoel4E2Az"},
    {id: 33, name: "Mobile Programming", code: "240113291", year: 3, semester: 2, category: "اجباري تخصص", driveUrl: "https://drive.google.com/drive/folders/1jK_hdft2TXQPnfaTRGk4wTHKUpsjLvll"},
    {id: 34, name: "Computer Architecture", code: "240114331", year: 4, semester: 1, category: "اجباري تخصص", driveUrl: "https://drive.google.com/drive/folders/1jTG_8wEfNfbebeHXxe8j8MWMdIrm4s3b"},
    {id: 35, name: "Fundamentals of Computer Graphics", code: "240212100", year: 4, semester: 1, category: "اجباري تخصص", driveUrl: "https://drive.google.com/drive/folders/1jWJWi704tfHHggiC1EMTZEY5kLNok39d"},
    {id: 36, name: "Software Testing and Validation", code: "240113620", year: 4, semester: 1, category: "اجباري تخصص", driveUrl: "https://drive.google.com/drive/folders/1jRS_TcS4AMfW7SmG8136NQYbBRtluMHy"},
    {id: 37, name: "Unix LAB", code: "240114341", year: 4, semester: 1, category: "اجباري تخصص", driveUrl: "https://drive.google.com/drive/folders/1hNW3B9_UZNR-Vg8tlTA9DTl5g93N7bNG"},
    {id: 38, name: "Visual Programming (Basic)", code: "240213231", year: 4, semester: 1, category: "اجباري تخصص", driveUrl: "https://drive.google.com/drive/folders/1jpmMSG21B0Z0CBlqI3yTvMBwRps64Cua"},
    {id: 39, name: "Artificial Intelligence", code: "240114350", year: 4, semester: 2, category: "اجباري تخصص", driveUrl: "https://drive.google.com/drive/folders/1kU5FBGdHHIOn-sfIKFcsKVBVxUCw3tBk"},
    {id: 40, name: "Information Security", code: "240113221", year: 4, semester: 2, category: "اجباري تخصص", driveUrl: "https://drive.google.com/drive/folders/1kDaCq3Bm25Ce_98pb67ng5s5O_062gkm"},
    {id: 41, name: "Theory of Computation", code: "240114081", year: 4, semester: 2, category: "اجباري تخصص", driveUrl: "https://drive.google.com/drive/folders/1kFSgbMn1Q7QuvDEHC2Y-qi2S_lm2EX-M"},
    {id: 42, name: "Web Development 2", code: "240214120", year: null, semester: null, category: "اختياري تخصص", driveUrl: "https://drive.google.com/drive/folders/1cwIQzJ1PYxdAdm1eZ-OzxQ1c2bqfEFGY"},
    {id: 43, name: "Special Topic in IT (Python)", code: "240114500", year: null, semester: null, category: "اختياري تخصص", driveUrl: "https://drive.google.com/drive/folders/1Sq-BmBJE46wEoIVf98hhw2r7LPI6zGhP"},
    {id: 44, name: "Cloud Computing", code: "240314800", year: null, semester: null, category: "اختياري تخصص", driveUrl: "https://drive.google.com/drive/folders/1e5ZG8ouPfTt9RYe-LnU_anYkq2F6bpMd"},
    {id: 45, name: "Creative Arts", code: null, year: null, semester: null, category: "مساق حر", driveUrl: "https://drive.google.com/drive/folders/1qzPpeAhmCqV5WOPSVKI-r3AhKn3cQ4ul"},
    {id: 46, name: "إحصاء للإدارة", code: null, year: null, semester: null, category: "مساق حر", driveUrl: "https://drive.google.com/drive/folders/1Ix3LkFcrJVYhCAXmT9vFjqF_H_j6VbfW"},
    {id: 47, name: "أساليب تعليم الرياضيات 1", code: null, year: null, semester: null, category: "مساق حر", driveUrl: "https://drive.google.com/drive/folders/1N6CNZt1kpna20aPhRDxIq0FNsTJx7LRp"},
    {id: 48, name: "التلاوة والتجويد", code: null, year: null, semester: null, category: "مساق حر", driveUrl: "https://drive.google.com/drive/folders/1eL8x0JFsT8IRJl4pI3iQsAaucWbX8oS6"},
    {id: 49, name: "اقتصاد كلي", code: null, year: null, semester: null, category: "مساق حر", driveUrl: "https://drive.google.com/drive/folders/1bjlSyG3WnwcsDdQBk90Ld3enWQJ4iq0K"},
    {id: 50, name: "التربية البدنية", code: null, year: null, semester: null, category: "اختياري جامعة", driveUrl: "https://drive.google.com/drive/folders/1MVpMCmf_PDFMmYUVTYx5DxRDL9n4C73U"},
    {id: 51, name: "القدس حضارة وتاريخ", code: null, year: null, semester: null, category: "اختياري جامعة", driveUrl: "https://drive.google.com/drive/folders/1nMgvUTms8O-STE6HFfb3ghhXkog1UFYX"},
    {id: 52, name: "انتخابات ومشاركة سياسية", code: null, year: null, semester: null, category: "اختياري جامعة", driveUrl: "https://drive.google.com/drive/folders/1WcLGMYXgWceQ9RLJX12kFmTUpocq-IwD"},
    {id: 53, name: "انسان والبيئة", code: null, year: null, semester: null, category: "اختياري جامعة", driveUrl: "https://drive.google.com/drive/folders/1HnfI3mlBiB2I8DANNKr9Qr5yUb2xoCS3"},
    {id: 54, name: "التفكير النقدي", code: null, year: null, semester: null, category: "اختياري جامعة", driveUrl: "https://drive.google.com/drive/folders/1kX9mHtKfbTAZIFntJtC-c32Jc8aSW2AQ"},
    {id: 55, name: "ثقافة اسلامية", code: null, year: null, semester: null, category: "اختياري جامعة", driveUrl: "https://drive.google.com/drive/folders/1MdgDyZLaxJKLoXLKNBhWVgCnEEL_aFQz"},
    {id: 56, name: "حركة اسيرة", code: null, year: null, semester: null, category: "اختياري جامعة", driveUrl: "https://drive.google.com/drive/folders/1I8rPtcH5jwqS89D-EN8SkPbPnsjxOwf7"},
    {id: 57, name: "علوم سياسية", code: null, year: null, semester: null, category: "اختياري جامعة", driveUrl: "https://drive.google.com/drive/folders/1WByWs8tMNpH2v_fWIQRHkyIN7P8sx-Vx"},
    {id: 58, name: "قضايا دولية معاصرة", code: null, year: null, semester: null, category: "اختياري جامعة", driveUrl: "https://drive.google.com/drive/folders/1WQfakiS9mEywZMXZ4zI99nJw3O0SrOju"},
    {id: 59, name: "منظمات المجتمع", code: null, year: null, semester: null, category: "اختياري جامعة", driveUrl: "https://drive.google.com/drive/folders/1clBSkiwS5onTqEWewGn_15KvvNnsm2K5"},
    {id: 60, name: "ملفات أخرى", code: null, year: null, semester: null, category: "ملفات أخرى", driveUrl: "https://drive.google.com/drive/folders/1aTYU-YwIGNGbo5TyfP3n-qsRuo3DZHVd?usp=drive_link"},
];

// DOM Elements
const searchInput = document.getElementById("searchInput");
const yearFilter = document.getElementById("yearFilter");
const semesterFilter = document.getElementById("semesterFilter");
const categoryFilter = document.getElementById("categoryFilter");
const coursesContainer = document.getElementById("coursesContainer");
const resultsCounter = document.getElementById("resultsCounter");

// Event listeners for filters
if (searchInput) {
    searchInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            renderCourses();
        }
    });
}
if (yearFilter) yearFilter.addEventListener("change", renderCourses);
if (semesterFilter) semesterFilter.addEventListener("change", renderCourses);
if (categoryFilter) categoryFilter.addEventListener("change", renderCourses);

// Get category badge class
function getCategoryBadgeClass(category) {
    switch (category) {
        case "اجباري جامعة":
            return "mandatory-college";
        case "اجباري كلية":
            return "mandatory-college";
        case "اجباري تخصص":
            return "mandatory-specialty";
        case "اختياري تخصص":
            return "elective-specialty";
        case "اختياري جامعة":
            return "elective-college";
        case "مساق حر":
            return "free-course";
        case "ملفات أخرى":
            return "other-files";
        default:
            return "mandatory-specialty";
    }
}

// Render courses
function renderCourses() {
    if (!coursesContainer) return;
    
    const search = searchInput ? searchInput.value.toLowerCase().trim() : "";
    const year = yearFilter ? yearFilter.value : "";
    const semester = semesterFilter ? semesterFilter.value : "";
    const category = categoryFilter ? categoryFilter.value : "";

    const filtered = coursesData.filter((course) => {
        let matchSearch = true;
        if (search) {
            matchSearch =
                course.name.toLowerCase().includes(search) ||
                (course.code && course.code.toLowerCase().includes(search)) ||
                course.category.toLowerCase().includes(search) ||
                (course.year && search.includes(String(course.year))) ||
                (course.semester && search.includes(String(course.semester)));
        }
        const matchYear = year ? course.year === Number(year) : true;
        const matchSemester = semester ? course.semester === Number(semester) : true;
        const matchCategory = category ? course.category === category : true;

        return matchSearch && matchYear && matchSemester && matchCategory;
    });

    coursesContainer.innerHTML = "";

    if (filtered.length === 0) {
        coursesContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-search"></i>
                <h3>لم يتم العثور على مساقات</h3>
                <p>جرّب تغيير معايير البحث</p>
            </div>
        `;
        if (resultsCounter) resultsCounter.textContent = "لا توجد نتائج";
    } else {
        filtered.forEach((course) => {
            const codeHTML = course.code
                ? `<span class="course-code">${course.code}</span>`
                : "";

            const yearText = course.year !== null ? `سنة ${course.year}` : "غير محدد";
            const semesterText = course.semester !== null ? `فصل ${course.semester}` : "";

            const courseCard = document.createElement("div");
            courseCard.className = "course-card";
            courseCard.innerHTML = `
                <div class="course-name">${course.name}</div>
                ${codeHTML}
                <div class="course-meta">
                    ${
                        course.year !== null
                            ? `<div class="meta-item"><i class="fas fa-book"></i> ${yearText}</div>`
                            : ""
                    }
                    ${
                        course.semester !== null
                            ? `<div class="meta-item"><i class="fas fa-calendar"></i> ${semesterText}</div>`
                            : ""
                    }
                    <div class="meta-item"><i class="fas fa-tag"></i> ${course.category}</div>
                </div>
                <div>
                    <span class="category-badge ${getCategoryBadgeClass(course.category)}">
                        ${course.category}
                    </span>
                </div>
                <div style="margin-top: 1rem;">
                    <a href="${course.driveUrl}?usp=sharing" target="_blank" rel="noopener noreferrer" class="drive-link-btn">
                        <i class="fas fa-folder-open"></i> فتح في Google Drive
                    </a>
                </div>
            `;
            coursesContainer.appendChild(courseCard);
        });

        if (resultsCounter) resultsCounter.textContent = `عدد النتائج: ${filtered.length} مساق`;
    }
}

// Initial render if on courses page
if (coursesContainer) {
    renderCourses();
}
