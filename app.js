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

const STORAGE_KEY = "mydegree-state-v1";

const classTargets = [
  { key: "First", label: "1st Class", cutoff: 3.7 },
  { key: "SecondUpper", label: "2nd Upper", cutoff: 3.3 },
  { key: "SecondLower", label: "2nd Lower", cutoff: 3.0 }
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
              <td>
                <button class="fix-btn" type="button" data-code="${subject.code}" aria-pressed="false">Fix</button>
              </td>
            </tr>
          `;
        })
        .join("");

      return `
        <div class="year-block" data-year="${yearSlug}">
          <div class="year-head">
            <button class="year-toggle" type="button" aria-expanded="true">
              <span class="year-toggle__label">${year}</span>
            </button>
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
                  <th>Fixed</th>
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

  renderAnalysis();
  saveState();
}

function renderAnalysis() {
  const filledEl = document.getElementById("analysisFilled");
  const remainingEl = document.getElementById("analysisRemaining");
  const needEl = document.getElementById("analysisNeed");
  const rangeEl = document.getElementById("analysisRange");
  const noteEl = document.getElementById("analysisNote");

  if (!filledEl || !remainingEl || !needEl || !rangeEl || !noteEl) {
    return;
  }

  const selects = Array.from(document.querySelectorAll(".grade-select"));
  const stats = computeStats(selects);

  filledEl.textContent = String(stats.filledCredits);
  remainingEl.textContent = String(stats.remainingCredits);
  rangeEl.textContent = `${stats.minGpa.toFixed(2)} - ${stats.maxGpa.toFixed(2)}`;

  const target = getTargetGpa();
  if (target === null || stats.remainingCredits === 0) {
    needEl.textContent = "0.00";
    noteEl.textContent = stats.remainingCredits === 0 ? "All grades filled" : "Set a target GPA to see the required average.";
  } else {
    const requiredTotalPoints = target * stats.totalCredits;
    const requiredRemainingPoints = requiredTotalPoints - stats.filledPoints;
    const requiredAverage = requiredRemainingPoints / stats.remainingCredits;
    const formatted = formatRequiredAverage(requiredAverage, stats.remainingCredits);
    needEl.textContent = formatted.value === "-" ? "0.00" : formatted.value;

    if (formatted.note === "Not reachable") {
      noteEl.textContent = "Target is not reachable with remaining credits.";
    } else if (formatted.note === "Already secured") {
      noteEl.textContent = "Target already secured.";
    } else {
      noteEl.textContent = "Target is reachable with the shown average.";
    }
  }

  updateClassTargets(stats);
  updateGpaGraph(stats, target);
}

function computeStats(selects) {
  let filledCredits = 0;
  let remainingCredits = 0;
  let filledPoints = 0;

  selects.forEach((select) => {
    const credit = Number(select.dataset.credit) || 0;
    if (select.value === "") {
      remainingCredits += credit;
      return;
    }
    filledCredits += credit;
    filledPoints += credit * Number(select.value);
  });

  const totalCredits = filledCredits + remainingCredits;
  const gpa = filledCredits > 0 ? filledPoints / filledCredits : 0;
  const minGpa = totalCredits > 0 ? (filledPoints / totalCredits) : 0;
  const maxGpa = totalCredits > 0 ? ((filledPoints + remainingCredits * 4.0) / totalCredits) : 0;

  return {
    filledCredits,
    remainingCredits,
    filledPoints,
    totalCredits,
    gpa,
    minGpa,
    maxGpa
  };
}

function formatRequiredAverage(requiredAverage, remainingCredits) {
  if (remainingCredits === 0) {
    return { value: "-", note: "All grades filled" };
  }

  if (!Number.isFinite(requiredAverage)) {
    return { value: "-", note: "Missing credits" };
  }

  if (requiredAverage > 4.0) {
    return { value: requiredAverage.toFixed(2), note: "Not reachable" };
  }

  if (requiredAverage < 0) {
    return { value: "0.00", note: "Already secured" };
  }

  return { value: requiredAverage.toFixed(2), note: "Need this avg" };
}

function updateClassTargets(stats) {
  classTargets.forEach((target) => {
    const avgEl = document.getElementById(`analysis${target.key}Avg`);
    const noteEl = document.getElementById(`analysis${target.key}Note`);
    if (!avgEl || !noteEl) {
      return;
    }

    const requiredTotalPoints = target.cutoff * stats.totalCredits;
    const requiredRemainingPoints = requiredTotalPoints - stats.filledPoints;
    const requiredAverage = stats.remainingCredits > 0 ? requiredRemainingPoints / stats.remainingCredits : 0;
    const formatted = formatRequiredAverage(requiredAverage, stats.remainingCredits);
    avgEl.textContent = formatted.value;
    noteEl.textContent = formatted.note;
  });
}

function updateGpaGraph(stats, target) {
  const gpaBar = document.getElementById("analysisGpaBar");
  const rangeBar = document.getElementById("analysisRangeBar");
  const targetMarker = document.getElementById("analysisTargetMarker");
  const gpaLine = document.getElementById("analysisGpaLine");
  const rangeLine = document.getElementById("analysisRangeLine");

  if (!gpaBar || !rangeBar || !targetMarker || !gpaLine || !rangeLine) {
    return;
  }

  const gpaPct = Math.max(0, Math.min(1, stats.gpa / 4)) * 100;
  const minPct = Math.max(0, Math.min(1, stats.minGpa / 4)) * 100;
  const maxPct = Math.max(0, Math.min(1, stats.maxGpa / 4)) * 100;

  gpaBar.style.width = `${gpaPct}%`;
  rangeBar.style.left = `${minPct}%`;
  rangeBar.style.width = `${Math.max(0, maxPct - minPct)}%`;

  if (target !== null && target >= 0 && target <= 4) {
    targetMarker.style.display = "block";
    targetMarker.style.left = `${(target / 4) * 100}%`;
  } else {
    targetMarker.style.display = "none";
  }

  gpaLine.textContent = stats.gpa.toFixed(2);
  rangeLine.textContent = `${stats.minGpa.toFixed(2)} - ${stats.maxGpa.toFixed(2)}`;
}

function resetGpa() {
  document.querySelectorAll(".grade-select").forEach((select) => {
    if (select.dataset.fixed === "true") {
      return;
    }
    select.value = "";
    delete select.dataset.autofill;
  });
  calculateGpa();
}

function getTargetGpa() {
  const input = document.getElementById("targetGpa");
  const value = Number(input.value);
  return Number.isFinite(value) ? value : null;
}

function pickNearestGrade(points) {
  const sorted = [...gradeScale].sort((a, b) => b.points - a.points);
  let best = sorted[0];
  let bestDiff = Math.abs(points - best.points);
  sorted.forEach((grade) => {
    const diff = Math.abs(points - grade.points);
    if (diff < bestDiff) {
      best = grade;
      bestDiff = diff;
    }
  });
  return best;
}

function findOptionByLabel(select, label) {
  return Array.from(select.options).find((option) => option.text === label);
}

function applyGradeLabel(select, label) {
  const match = findOptionByLabel(select, label);
  if (!match) {
    return false;
  }
  select.value = match.value;
  select.dataset.autofill = "true";
  return true;
}

function getCreditOverrides() {
  return {
    4: document.getElementById("credit4").value,
    3: document.getElementById("credit3").value,
    2: document.getElementById("credit2").value,
    1: document.getElementById("credit1").value
  };
}

function autoFillToTarget() {
  const target = getTargetGpa();
  const status = document.getElementById("targetStatus");
  const preferred = document.getElementById("autoGrade").value;
  const useCreditMap = document.getElementById("useCreditMap").checked;
  const creditMap = getCreditOverrides();

  const selects = Array.from(document.querySelectorAll(".grade-select"));

  if (useCreditMap) {
    let filled = 0;
    selects.forEach((select) => {
      if (select.value !== "" || select.dataset.fixed === "true") {
        return;
      }
      const credit = Number(select.dataset.credit) || 0;
      const label = creditMap[credit];
      if (label && applyGradeLabel(select, label)) {
        filled += 1;
      }
    });
    calculateGpa();
    status.textContent = filled > 0 ? "Auto filled using credit map" : "No credit rules matched";
    return;
  }

  if (preferred) {
    let filled = 0;
    selects.forEach((select) => {
      if (select.value !== "" || select.dataset.fixed === "true") {
        return;
      }
      if (applyGradeLabel(select, preferred)) {
        filled += 1;
      }
    });
    calculateGpa();
    status.textContent = filled > 0 ? `Auto filled with ${preferred}` : "No empty grades to auto fill";
    return;
  }

  if (target === null) {
    status.textContent = "Enter a valid target GPA or pick a grade";
    return;
  }

  let currentCredits = 0;
  let currentPoints = 0;
  let remainingCredits = 0;

  selects.forEach((select) => {
    const credit = Number(select.dataset.credit) || 0;
    if (select.value === "") {
      remainingCredits += credit;
      return;
    }
    currentCredits += credit;
    currentPoints += credit * Number(select.value);
  });

  if (remainingCredits === 0) {
    status.textContent = "No empty grades to auto fill";
    return;
  }

  const requiredTotalPoints = target * (currentCredits + remainingCredits);
  const requiredRemainingPoints = requiredTotalPoints - currentPoints;
  const requiredAverage = requiredRemainingPoints / remainingCredits;

  const chosen = pickNearestGrade(requiredAverage);

  selects.forEach((select) => {
    if (select.value !== "" || select.dataset.fixed === "true") {
      return;
    }
    select.value = String(chosen.points);
    select.dataset.autofill = "true";
  });

  calculateGpa();
  status.textContent = `Auto filled with ${chosen.label} (avg ${chosen.points.toFixed(2)})`;
}

function clearAutoFill() {
  document.querySelectorAll(".grade-select").forEach((select) => {
    if (select.dataset.fixed === "true") {
      return;
    }
    if (select.dataset.autofill === "true") {
      select.value = "";
      delete select.dataset.autofill;
    }
  });
  calculateGpa();
  document.getElementById("targetStatus").textContent = "Auto fill cleared";
}

function saveState() {
  const state = {
    marksheet: buildMarksheet(),
    targetGpa: document.getElementById("targetGpa").value,
    autoGrade: document.getElementById("autoGrade").value,
    useCreditMap: document.getElementById("useCreditMap").checked,
    creditMap: getCreditOverrides()
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    // Ignore storage errors (private mode or quota).
  }
}

function loadState() {
  let raw = null;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
  } catch (error) {
    raw = null;
  }

  if (!raw) {
    return;
  }

  try {
    const state = JSON.parse(raw);
    if (state && state.marksheet) {
      applyMarksheet(state.marksheet);
    }
    if (state && typeof state.targetGpa === "string") {
      document.getElementById("targetGpa").value = state.targetGpa;
    }
    if (state && typeof state.autoGrade === "string") {
      document.getElementById("autoGrade").value = state.autoGrade;
    }
    if (state && typeof state.useCreditMap === "boolean") {
      document.getElementById("useCreditMap").checked = state.useCreditMap;
    }
    if (state && state.creditMap) {
      document.getElementById("credit4").value = state.creditMap[4] || "";
      document.getElementById("credit3").value = state.creditMap[3] || "";
      document.getElementById("credit2").value = state.creditMap[2] || "";
      document.getElementById("credit1").value = state.creditMap[1] || "";
    }
  } catch (error) {
    // Ignore malformed data.
  }
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
    const fixed = select.dataset.fixed === "true";

    grades.push({
      code,
      year,
      credit,
      gradeLabel,
      gradePoints,
      fixed
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
    const row = select.closest("tr");
    const button = row ? row.querySelector(".fix-btn") : null;
    if (!entry) {
      select.value = "";
      delete select.dataset.fixed;
      if (row) {
        row.classList.remove("is-fixed-row");
      }
      if (button) {
        button.classList.remove("is-fixed");
        button.setAttribute("aria-pressed", "false");
        button.textContent = "Fix it";
      }
      return;
    }

    if (entry.fixed) {
      select.dataset.fixed = "true";
      if (row) {
        row.classList.add("is-fixed-row");
      }
      if (button) {
        button.classList.add("is-fixed");
        button.setAttribute("aria-pressed", "true");
        button.textContent = "Fixed";
      }
    } else {
      delete select.dataset.fixed;
      if (row) {
        row.classList.remove("is-fixed-row");
      }
      if (button) {
        button.classList.remove("is-fixed");
        button.setAttribute("aria-pressed", "false");
        button.textContent = "Fix it";
      }
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
loadState();
calculateGpa();

document.getElementById("calcGpa").addEventListener("click", calculateGpa);
document.getElementById("resetGpa").addEventListener("click", resetGpa);
document.getElementById("autoFill").addEventListener("click", autoFillToTarget);
document.getElementById("clearAutoFill").addEventListener("click", clearAutoFill);
document.getElementById("downloadSheet").addEventListener("click", downloadMarksheet);
document.getElementById("uploadSheet").addEventListener("change", handleUpload);
document.getElementById("targetGpa").addEventListener("input", renderAnalysis);
document.getElementById("targetGpa").addEventListener("input", saveState);
document.getElementById("autoGrade").addEventListener("change", saveState);
document.getElementById("useCreditMap").addEventListener("change", saveState);
document.getElementById("credit4").addEventListener("change", saveState);
document.getElementById("credit3").addEventListener("change", saveState);
document.getElementById("credit2").addEventListener("change", saveState);
document.getElementById("credit1").addEventListener("change", saveState);
document.getElementById("gpaTables").addEventListener("change", (event) => {
  if (event.target.matches(".grade-select")) {
    calculateGpa();
  }
});

document.getElementById("gpaTables").addEventListener("click", (event) => {
  const button = event.target.closest(".fix-btn");
  if (!button) {
    return;
  }

  const row = button.closest("tr");
  const select = row ? row.querySelector(".grade-select") : null;
  if (!select) {
    return;
  }

  const isFixed = select.dataset.fixed === "true";
  if (isFixed) {
    delete select.dataset.fixed;
    if (row) {
      row.classList.remove("is-fixed-row");
    }
    button.classList.remove("is-fixed");
    button.setAttribute("aria-pressed", "false");
    button.textContent = "Fix it";
  } else {
    select.dataset.fixed = "true";
    if (row) {
      row.classList.add("is-fixed-row");
    }
    button.classList.add("is-fixed");
    button.setAttribute("aria-pressed", "true");
    button.textContent = "Fixed";
  }
  saveState();
});

document.getElementById("gpaTables").addEventListener("click", (event) => {
  const toggle = event.target.closest(".year-toggle");
  if (!toggle) {
    return;
  }
  const block = toggle.closest(".year-block");
  if (!block) {
    return;
  }
  const isCollapsed = block.classList.toggle("is-collapsed");
  toggle.setAttribute("aria-expanded", String(!isCollapsed));
});
