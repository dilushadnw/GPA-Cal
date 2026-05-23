const subjects = [
  { year: "First Year", code: "ICT1201", title: "Fundamentals of Computer Systems" },
  { year: "First Year", code: "ICT1402", title: "Principles of Programme Design and Programming" },
  { year: "First Year", code: "ICT1303", title: "Basic Electronics and Digital Logic Design" },
  { year: "First Year", code: "ICT1404", title: "Mathematics and Statistics for Computing" },
  { year: "First Year", code: "ICT1305", title: "Data Structures" },
  { year: "First Year", code: "ICT1306", title: "Object Oriented Programming" },
  { year: "First Year", code: "ICT1407", title: "Database Systems" },
  { year: "First Year", code: "ICT1308", title: "Operating Systems" },
  { year: "Second Year", code: "ICT2301", title: "Design and Analysis of Algorithms" },
  { year: "Second Year", code: "ICT2402", title: "Software Engineering" },
  { year: "Second Year", code: "ICT2403", title: "Graphics and Image Processing" },
  { year: "Second Year", code: "ICT2204", title: "Web Technology" },
  { year: "Second Year", code: "ICT2305", title: "Computer Networks" },
  { year: "Second Year", code: "ICT2406", title: "Internet Programming" },
  { year: "Second Year", code: "ICT2207", title: "Management Information Systems" },
  { year: "Second Year", code: "ICT2408", title: "Computer Organization and Architecture" },
  { year: "Second Year", code: "ICT2209", title: "Communication Skills" },
  { year: "Second Year", code: "ICT2210", title: "Multimedia Technologies" },
  { year: "Third Year", code: "ICT3301", title: "Human Computer Interaction" },
  { year: "Third Year", code: "ICT3202", title: "Operational Research" },
  { year: "Third Year", code: "ICT3303", title: "Information Systems Security" },
  { year: "Third Year", code: "ICT3304", title: "Embedded Systems" },
  { year: "Third Year", code: "ICT3205", title: "Information Technology Project Management" },
  { year: "Third Year", code: "ICT3207", title: "Professional Practice and Ethics" },
  { year: "Third Year", code: "ICT3208", title: "Entrepreneurship" },
  { year: "Third Year", code: "ICT3209", title: "Principles of Accounting" },
  { year: "Third Year", code: "ICT3212", title: "Introduction to Intelligent Systems" },
  { year: "Third Year", code: "ICT3213", title: "Advanced Operating Systems (Optional)" },
  { year: "Third Year", code: "ICT3411", title: "Group Project" }
];

const gradeScale = [
  { label: "A+", points: 4.0 },
  { label: "A", points: 4.0 },
  { label: "A-", points: 3.7 },
  { label: "B+", points: 3.3 },
  { label: "B", points: 3.0 },
  { label: "B-", points: 2.7 },
  { label: "C+", points: 2.3 },
  { label: "C", points: 2.0 },
  { label: "C-", points: 1.7 },
  { label: "D+", points: 1.3 },
  { label: "D", points: 1.0 },
  { label: "F", points: 0.0 }
];

function creditFromCode(code) {
  const match = code.match(/(\d{4})/);
  if (!match) {
    return 0;
  }
  const digits = match[1].split("");
  return Number(digits[1]) || 0;
}

function slugifyYear(year) {
  return year.toLowerCase().replace(/\s+/g, "-");
}

function renderGpaTables() {
  const container = document.getElementById("gpaTables");
  const gradeOptions = gradeScale
    .map((grade) => `<option value="${grade.points}">${grade.label}</option>`)
    .join("");

  const years = [...new Set(subjects.map((subject) => subject.year))];

  container.innerHTML = years
    .map((year) => {
      const yearSlug = slugifyYear(year);
      const rows = subjects
        .filter((subject) => subject.year === year)
        .map((subject) => {
          const credit = creditFromCode(subject.code);
          return `
            <tr>
              <td>${subject.code}</td>
              <td>${subject.title}</td>
              <td class="num">${credit}</td>
              <td>
                <select class="grade-select" data-credit="${credit}" data-year="${yearSlug}" data-code="${subject.code}">
                  <option value="">Select</option>
                  ${gradeOptions}
                </select>
              </td>
            </tr>
          `;
        })
        .join("");

      return `
        <div class="year-block">
          <div class="year-head">
            <h3>${year}</h3>
            <div class="totals">
              <span>GPA:</span>
              <strong id="gpaYear-${yearSlug}">0.00</strong>
            </div>
            <div class="totals">
              <span>Credits:</span>
              <strong id="creditsYear-${yearSlug}">0</strong>
            </div>
          </div>
          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Title</th>
                  <th class="num">Credit</th>
                  <th>Grade</th>
                </tr>
              </thead>
              <tbody>
                ${rows}
              </tbody>
            </table>
          </div>
        </div>
      `;
    })
    .join("");
}

function calculateGpa() {
  const gpaValueEl = document.getElementById("gpaValue");
  const gpaCreditsEl = document.getElementById("gpaCredits");
  const gpaPointsEl = document.getElementById("gpaPoints");
  const selects = document.querySelectorAll(".grade-select");
  let totalCredits = 0;
  let totalPoints = 0;
  const perYear = {};

  selects.forEach((select) => {
    if (select.value === "") {
      return;
    }
    const credit = Number(select.dataset.credit) || 0;
    const points = Number(select.value);
    const year = select.dataset.year;
    totalCredits += credit;
    totalPoints += credit * points;

    if (!perYear[year]) {
      perYear[year] = { credits: 0, points: 0 };
    }
    perYear[year].credits += credit;
    perYear[year].points += credit * points;
  });

  const gpa = totalCredits > 0 ? totalPoints / totalCredits : 0;
  gpaValueEl.textContent = gpa.toFixed(2);
  gpaCreditsEl.textContent = totalCredits;
  gpaPointsEl.textContent = totalPoints.toFixed(2);

  Object.entries(perYear).forEach(([year, stats]) => {
    const gpaYearEl = document.getElementById(`gpaYear-${year}`);
    const creditsYearEl = document.getElementById(`creditsYear-${year}`);
    const yearGpa = stats.credits > 0 ? stats.points / stats.credits : 0;
    if (gpaYearEl) {
      gpaYearEl.textContent = yearGpa.toFixed(2);
    }
    if (creditsYearEl) {
      creditsYearEl.textContent = stats.credits;
    }
  });
}

function resetGpa() {
  document.querySelectorAll(".grade-select").forEach((select) => {
    select.value = "";
  });
  calculateGpa();
}

function buildMarksheet() {
  const grades = [];

  document.querySelectorAll(".grade-select").forEach((select) => {
    const code = select.dataset.code;
    const credit = Number(select.dataset.credit) || 0;
    const year = select.dataset.year;
    const selectedIndex = select.selectedIndex;
    const gradeLabel = selectedIndex > 0 ? select.options[selectedIndex].text : "";
    const gradePoints = select.value !== "" ? Number(select.value) : null;

    grades.push({
      code,
      year,
      credit,
      gradeLabel,
      gradePoints
    });
  });

  return {
    version: 1,
    generatedAt: new Date().toISOString(),
    grades
  };
}

function downloadMarksheet() {
  const payload = buildMarksheet();
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "ict-marksheet.json";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);

  const status = document.getElementById("sheetStatus");
  status.textContent = "Marksheet downloaded";
}

function applyMarksheet(data) {
  if (!data || !Array.isArray(data.grades)) {
    throw new Error("Invalid marksheet format");
  }

  const gradeMap = new Map(
    data.grades
      .filter((entry) => entry && entry.code)
      .map((entry) => [entry.code, entry])
  );

  document.querySelectorAll(".grade-select").forEach((select) => {
    const entry = gradeMap.get(select.dataset.code);
    if (!entry) {
      select.value = "";
      return;
    }

    const label = entry.gradeLabel;
    if (label) {
      const match = Array.from(select.options).find((option) => option.text === label);
      if (match) {
        select.value = match.value;
        return;
      }
    }

    if (entry.gradePoints !== null && entry.gradePoints !== undefined) {
      select.value = String(entry.gradePoints);
    } else {
      select.value = "";
    }
  });
}

function handleUpload(event) {
  const file = event.target.files[0];
  if (!file) {
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      applyMarksheet(data);
      calculateGpa();
      document.getElementById("sheetStatus").textContent = `Loaded: ${file.name}`;
    } catch (error) {
      document.getElementById("sheetStatus").textContent = "Invalid marksheet file";
    }
  };
  reader.readAsText(file);
}

renderGpaTables();
calculateGpa();

document.getElementById("calcGpa").addEventListener("click", calculateGpa);
document.getElementById("resetGpa").addEventListener("click", resetGpa);
document.getElementById("downloadSheet").addEventListener("click", downloadMarksheet);
document.getElementById("uploadSheet").addEventListener("change", handleUpload);
document.getElementById("gpaTables").addEventListener("change", (event) => {
  if (event.target.matches(".grade-select")) {
    calculateGpa();
  }
});
