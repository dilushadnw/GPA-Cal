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

const classTargets = [
  { key: "First", label: "1st Class", cutoff: 3.7 },
  { key: "SecondUpper", label: "2nd Upper", cutoff: 3.3 },
  { key: "SecondLower", label: "2nd Lower", cutoff: 3.0 }
];

let latestGrades = null;
const STORAGE_KEY = "mydegree-state-v1";

function getTargetValue() {
  const input = document.getElementById("analysisTarget");
  const value = Number(input.value);
  return Number.isFinite(value) ? value : null;
}

function computeStats(grades) {
  let filledCredits = 0;
  let remainingCredits = 0;
  let filledPoints = 0;

  grades.forEach((entry) => {
    const credit = Number(entry.credit) || 0;
    if (entry.gradePoints === null || entry.gradePoints === undefined) {
      remainingCredits += credit;
      return;
    }
    filledCredits += credit;
    filledPoints += credit * Number(entry.gradePoints);
  });

  const totalCredits = filledCredits + remainingCredits;
  const gpa = filledCredits > 0 ? filledPoints / filledCredits : 0;
  const minGpa = totalCredits > 0 ? filledPoints / totalCredits : 0;
  const maxGpa = totalCredits > 0 ? (filledPoints + remainingCredits * 4.0) / totalCredits : 0;

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

function updateAnalysis(grades) {
  const gpaEl = document.getElementById("analysisGpa");
  const filledEl = document.getElementById("analysisFilled");
  const remainingEl = document.getElementById("analysisRemaining");
  const rangeEl = document.getElementById("analysisRange");
  const noteEl = document.getElementById("analysisNote");

  const stats = computeStats(grades);

  gpaEl.textContent = stats.gpa.toFixed(2);
  filledEl.textContent = String(stats.filledCredits);
  remainingEl.textContent = String(stats.remainingCredits);
  rangeEl.textContent = `${stats.minGpa.toFixed(2)} - ${stats.maxGpa.toFixed(2)}`;

  updateClassTargets(stats);
  updateGpaGraph(stats, getTargetValue());

  noteEl.textContent = stats.remainingCredits === 0
    ? "All grades filled."
    : "Set a target GPA to check the required average.";
}

function checkTarget(grades) {
  const noteEl = document.getElementById("analysisNote");
  const target = getTargetValue();

  if (target === null) {
    noteEl.textContent = "Enter a valid target GPA.";
    return;
  }

  const stats = computeStats(grades);
  if (stats.remainingCredits === 0) {
    noteEl.textContent = "All grades filled. Target depends on current GPA.";
    return;
  }

  const requiredTotalPoints = target * stats.totalCredits;
  const requiredRemainingPoints = requiredTotalPoints - stats.filledPoints;
  const requiredAverage = requiredRemainingPoints / stats.remainingCredits;
  const formatted = formatRequiredAverage(requiredAverage, stats.remainingCredits);

  if (formatted.note === "Not reachable") {
    noteEl.textContent = `Target not reachable. Need avg ${formatted.value}.`;
  } else if (formatted.note === "Already secured") {
    noteEl.textContent = "Target already secured.";
  } else {
    noteEl.textContent = `Target reachable. Need avg ${formatted.value}.`;
  }
  updateGpaGraph(stats, target);
}

function handleUpload(event) {
  const file = event.target.files[0];
  const status = document.getElementById("analysisStatus");

  if (!file) {
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      if (!data || !Array.isArray(data.grades)) {
        throw new Error("Invalid format");
      }
      latestGrades = data.grades;
      updateAnalysis(data.grades);
      status.textContent = `Loaded: ${file.name}`;
      document.getElementById("analysisCheck").onclick = () => checkTarget(data.grades);
    } catch (error) {
      status.textContent = "Invalid marksheet file";
    }
  };
  reader.readAsText(file);
}

document.getElementById("analysisUpload").addEventListener("change", handleUpload);
document.getElementById("analysisTarget").addEventListener("input", () => {
  if (!latestGrades) {
    return;
  }
  updateGpaGraph(computeStats(latestGrades), getTargetValue());
});

function loadSavedAnalysis() {
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
    if (state && typeof state.targetGpa === "string") {
      document.getElementById("analysisTarget").value = state.targetGpa;
    }
    if (state && state.marksheet && Array.isArray(state.marksheet.grades)) {
      latestGrades = state.marksheet.grades;
      updateAnalysis(latestGrades);
      document.getElementById("analysisStatus").textContent = "Loaded from browser";
    }
  } catch (error) {
    // Ignore malformed data.
  }
}

loadSavedAnalysis();
