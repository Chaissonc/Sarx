// Pull saved data from localStorage — everything was set when the user submitted the intake form
var tdee          = parseFloat(localStorage.getItem("bm_tdee"))      || 0;
var currentWeight = parseFloat(localStorage.getItem("bm_weight"))    || 0;
var recMin        = parseFloat(localStorage.getItem("bm_minWeight")) || 0; // minimum healthy weight for their height
var recMax        = currentWeight * 3; // loose upper bound — no one should be targeting 3x their current weight
var selectedGoal      = localStorage.getItem("bm_goal")      || null;
var selectedIntensity = localStorage.getItem("bm_intensity") || "moderate";
var selectedDiet      = localStorage.getItem("bm_diet")      || "balanced";

// Keeps the calorie input box as wide as its content — shrinks/grows as you type
function resizeCalInput() {
  var input = document.getElementById("targetCalInput");
  if (!input) return;
  var len = (input.value || "0").length || 1;
  input.style.width = (len * 0.85) + "ch";
}

// Macro ratios for each diet style — protein/carbs/fat all add up to 1.0
var dietSplits = {
  "balanced":     { protein: 0.30, carbs: 0.40, fat: 0.30 },
  "high-protein": { protein: 0.42, carbs: 0.28, fat: 0.30 },
  "low-carb":     { protein: 0.35, carbs: 0.25, fat: 0.40 },
  "high-carb":    { protein: 0.25, carbs: 0.55, fat: 0.20 },
  "keto":         { protein: 0.30, carbs: 0.05, fat: 0.65 }
};

// If there's no TDEE, the user hasn't filled in their metrics yet — send them back
if (!tdee) { window.location.href = "../"; }

// Show current weight on load
(function () {
  var el = document.getElementById("current-weight-val");
  if (el && currentWeight) el.textContent = currentWeight;
})();

// Updates the small status line below the weight cards ("Cutting -15 lbs to 170", etc.)
function updateGoalStatusLine() {
  var el = document.getElementById("goalStatusLine");
  if (!el) return;
  var gw = parseFloat(document.getElementById("goalWeightInput").value);
  if (!gw) { el.textContent = "Enter your target weight to get started"; return; }
  if (!selectedGoal) { el.textContent = ""; return; }
  el.style.color = "";
  var diff = Math.round(Math.abs(currentWeight - gw));
  if (selectedGoal === "cut") {
    el.textContent = "Cutting -" + diff + " lbs to " + gw;
  } else if (selectedGoal === "lean-bulk") {
    el.textContent = "Bulking +" + diff + " lbs to " + gw;
  } else {
    el.textContent = "Maintaining weight";
  }
}

// Called when the user picks Cut, Maintain, or Bulk
function selectGoal(goal) {
  selectedGoal = goal;
  localStorage.setItem("bm_goal", goal);

  var section = document.getElementById("intensitySection");
  if (goal === "maintain") {
    // Collapse the aggression level section — it doesn't apply to maintaining
    var h = section.offsetHeight;
    section.style.transition = "none";
    section.style.overflow = "hidden";
    section.style.height = h + "px";
    section.getBoundingClientRect(); // force browser to register the height before animating
    section.style.transition = "height 0.3s ease, opacity 0.25s ease";
    section.style.height = "0px";
    section.style.opacity = "0";
    section.style.pointerEvents = "none";
  } else {
    // Expand the aggression level section for cut or bulk
    if (section.offsetHeight === 0) {
      section.style.transition = "none";
      section.style.overflow = "hidden";
      section.style.height = "0px";
      section.style.opacity = "0";
      section.style.pointerEvents = "";
      section.getBoundingClientRect();
      section.style.transition = "height 0.3s ease, opacity 0.28s ease";
      section.style.height = section.scrollHeight + "px";
      section.style.opacity = "1";
      // After the animation ends, let the height go "auto" so it doesn't clip if content changes
      section.addEventListener("transitionend", function onExpand(e) {
        if (e.propertyName !== "height") return;
        section.removeEventListener("transitionend", onExpand);
        section.style.height = "auto";
        section.style.overflow = "";
        section.style.transition = "";
      });
    }
    section.style.pointerEvents = "";
    selectedIntensity = localStorage.getItem("bm_intensity") || "moderate";
    document.querySelectorAll(".intensity-btn").forEach(function (b) { b.classList.remove("active"); });
    var activeBtn = document.querySelector('.intensity-btn[data-intensity="' + selectedIntensity + '"]');
    if (activeBtn) activeBtn.classList.add("active");
  }

  // Update the arrow color between current and target weight
  var arrow = document.getElementById("wt-arrow");
  if (arrow) {
    arrow.classList.remove("arrow-cut", "arrow-bulk");
    if (goal === "cut")       arrow.classList.add("arrow-cut");
    else if (goal === "lean-bulk") arrow.classList.add("arrow-bulk");
  }

  updateTargetCalFromGoal();
  updateGoalPlanner();
  updateGoalStatusLine();
}

// Called when the user picks a diet style filter
function selectDiet(btn, diet) {
  selectedDiet = diet;
  localStorage.setItem("bm_diet", diet);
  document.querySelectorAll("#diet-filters .lib-filter").forEach(function (b) { b.classList.remove("active"); });
  btn.classList.add("active");
  updateGoalPlanner();
}

// Called when the user picks an aggression level (Slow, Moderate, Aggressive)
// If no valid goal weight is set yet, save the selection but don't recalculate anything
function selectIntensity(btn, intensity) {
  selectedIntensity = intensity;
  localStorage.setItem("bm_intensity", intensity);
  document.querySelectorAll(".intensity-btn").forEach(function (b) { b.classList.remove("active"); });
  btn.classList.add("active");
  var gw = parseFloat(document.getElementById("goalWeightInput").value);
  if (!gw || gw < 80) return;
  updateTargetCalFromGoal();
  updateGoalPlanner();
}

// Sets the calorie target based on the selected goal and intensity
// These calorie offsets from TDEE are standard recommendations
function updateTargetCalFromGoal() {
  if (!selectedGoal) return;
  var offsets = {
    cut:         { slow: -250, moderate: -500, aggressive: -750 },
    maintain:    { slow: 0,    moderate: 0,    aggressive: 0    },
    "lean-bulk": { slow: 150,  moderate: 300,  aggressive: 500  }
  };
  var offset = (offsets[selectedGoal] || {})[selectedIntensity] || 0;
  var val = Math.round(tdee + offset);
  document.getElementById("targetCalInput").value = val;
  localStorage.setItem("bm_targetCal", val);
  resizeCalInput();
}

// Estimates how long it'll take to reach the goal weight based on the calorie deficit/surplus
// Uses the 3,500 cal = 1 lb rule (a rough but widely used estimate)
function updateTimeToGoal(targetCals) {
  if (!selectedGoal) return;
  var goalWeight = parseFloat(document.getElementById("goalWeightInput").value);
  var warningEl  = document.getElementById("goalWarning");
  var timeEl     = document.getElementById("timeToGoal");

  warningEl.textContent = "";
  timeEl.textContent    = "";

  if (!goalWeight || !currentWeight) return;

  var dailyDelta  = Math.abs(targetCals - tdee);
  if (selectedGoal === "maintain" || dailyDelta < 1) return;

  var weightDelta = Math.abs(currentWeight - goalWeight);
  var days   = (weightDelta * 3500) / dailyDelta;
  var weeks  = days / 7;
  var months = days / 30.44;

  // Calculate what calendar date that lands on
  var projected   = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  var monthNames  = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  var dateStr     = monthNames[projected.getMonth()] + " " + projected.getDate() + ", " + projected.getFullYear();
  timeEl.innerHTML = "~" + Math.round(days) + " days / ~" + Math.round(weeks) + " weeks / ~" + months.toFixed(1) + " months<br><span class='projected-date'>Est. " + dateStr + "</span>";
}

// The main display update — refreshes the calorie delta label, macros, and time-to-goal
function updateGoalPlanner() {
  if (!selectedGoal) return;
  var targetCals = parseFloat(document.getElementById("targetCalInput").value) || 0;
  var deltaEl    = document.getElementById("calDeltaLabel");

  if (targetCals <= 0) {
    deltaEl.textContent = "";
    resetMacros();
    document.getElementById("goalWarning").textContent = "";
    document.getElementById("timeToGoal").textContent  = "";
    return;
  }

  // Show the deficit/surplus relative to their TDEE
  var delta = targetCals - tdee;
  if (delta < 0) {
    deltaEl.textContent = Math.abs(Math.round(delta)) + " cal/day deficit";
    deltaEl.className   = "cal-delta cal-deficit";
  } else if (delta > 0) {
    deltaEl.textContent = "+" + Math.round(delta) + " cal/day surplus";
    deltaEl.className   = "cal-delta cal-surplus";
  } else {
    deltaEl.textContent = "At maintenance";
    deltaEl.className   = "cal-delta";
  }

  // Calculate grams for each macro using the selected diet split
  // Protein and carbs = 4 cal/g, fat = 9 cal/g
  var split = dietSplits[selectedDiet] || dietSplits["balanced"];
  document.getElementById("macro-protein").textContent     = Math.round(targetCals * split.protein / 4);
  document.getElementById("macro-carbs").textContent       = Math.round(targetCals * split.carbs   / 4);
  document.getElementById("macro-fat").textContent         = Math.round(targetCals * split.fat     / 9);
  document.getElementById("macro-protein-pct").textContent = Math.round(split.protein * 100) + "%";
  document.getElementById("macro-carbs-pct").textContent   = Math.round(split.carbs   * 100) + "%";
  document.getElementById("macro-fat-pct").textContent     = Math.round(split.fat     * 100) + "%";
  document.getElementById("macroSection").classList.remove("is-empty");

  updateTimeToGoal(targetCals);
}

// Clears all macro values back to "--" (called when input is invalid or empty)
function resetMacros() {
  ["macro-protein","macro-carbs","macro-fat","macro-protein-pct","macro-carbs-pct","macro-fat-pct"]
    .forEach(function(id) { document.getElementById(id).textContent = "--"; });
  document.getElementById("macroSection").classList.add("is-empty");
}

document.addEventListener("DOMContentLoaded", function () {
  resizeCalInput();

  // Restore the saved diet filter selection
  var savedDietBtn = document.querySelector('#diet-filters .lib-filter[data-diet="' + selectedDiet + '"]');
  if (savedDietBtn) {
    document.querySelectorAll("#diet-filters .lib-filter").forEach(function (b) { b.classList.remove("active"); });
    savedDietBtn.classList.add("active");
  }

  // Restore goal weight and show status line
  var savedGoalWeight = localStorage.getItem("bm_goalWeight");
  document.getElementById("goalStatusLine").textContent = "Enter your target weight to get started";
  if (savedGoalWeight) document.getElementById("goalWeightInput").value = savedGoalWeight;

  if (selectedGoal) {
    var section = document.getElementById("intensitySection");
    if (selectedGoal !== "maintain") {
      // Show the intensity section immediately without animation on page load
      section.style.height = "auto";
      section.style.overflow = "";
      section.style.opacity = "1";
      section.style.transition = "";
      section.style.pointerEvents = "";
      var intBtn = document.querySelector('.intensity-btn[data-intensity="' + selectedIntensity + '"]');
      if (intBtn) intBtn.classList.add("active");
    }

    // Only recalculate and show the plan if there's a valid saved goal weight
    // Without this guard, the calories/macros would show up with an empty weight field
    if (savedGoalWeight && parseFloat(savedGoalWeight) >= 80) {
      updateTargetCalFromGoal();
      updateGoalPlanner();
      updateGoalStatusLine();
    }
  }

  // Manual calorie input — user can override the auto-calculated value
  document.getElementById("targetCalInput").addEventListener("input", function () {
    localStorage.setItem("bm_targetCal", this.value);
    resizeCalInput();
    var cal = parseFloat(this.value);

    // Don't show anything for very low numbers — probably still typing
    if (cal && cal < 400) {
      document.getElementById("calDeltaLabel").textContent = "";
      document.getElementById("timeToGoal").innerHTML = "";
      resetMacros();
      return;
    }

    // Warn if the calorie target is dangerously low (below 50% of a reasonable deficit)
    var calFloor = (tdee - 750) * 0.5;
    if (cal && cal >= 400 && cal < calFloor) {
      var deltaEl = document.getElementById("calDeltaLabel");
      deltaEl.textContent = "Going this low can be harmful to your health";
      deltaEl.className   = "cal-delta cal-error";
      document.getElementById("timeToGoal").innerHTML = "";
      resetMacros();
      return;
    }
    updateGoalPlanner();
  });

  // Goal weight input — drives the whole plan page
  document.getElementById("goalWeightInput").addEventListener("input", function () {
    localStorage.setItem("bm_goalWeight", this.value);
    var gw          = parseFloat(this.value);
    var warningEl   = document.getElementById("goalWarning");
    var statusLine  = document.getElementById("goalStatusLine");

    // Clear everything if weight is empty or too low to be realistic
    if (!gw || gw < 80) {
      warningEl.textContent  = "";
      statusLine.textContent = !gw ? "Enter your target weight to get started" : "";
      document.getElementById("targetCalInput").value    = "";
      document.getElementById("calDeltaLabel").textContent = "";
      document.getElementById("timeToGoal").textContent  = "";
      resetMacros();
      return;
    }

    // Warn if below the minimum healthy weight for their height
    if (recMin && gw < recMin) {
      statusLine.textContent = "Below minimum recommended weight";
      statusLine.style.color = "#f0a020";
      warningEl.textContent  = "";
      document.getElementById("targetCalInput").value    = "";
      document.getElementById("calDeltaLabel").textContent = "";
      document.getElementById("timeToGoal").textContent  = "";
      resetMacros();
      return;
    }

    // Warn if the target is unrealistically high (3x current weight)
    if (gw > recMax) {
      statusLine.textContent = "Set a more realistic target weight";
      statusLine.style.color = "#f0a020";
      warningEl.textContent  = "";
      document.getElementById("targetCalInput").value    = "";
      document.getElementById("calDeltaLabel").textContent = "";
      document.getElementById("timeToGoal").textContent  = "";
      resetMacros();
      return;
    }

    warningEl.textContent = "";

    // Auto-select the goal based on whether the target is above or below current weight
    if (currentWeight) {
      var autoGoal = gw > currentWeight ? "lean-bulk" : gw < currentWeight ? "cut" : "maintain";
      if (autoGoal !== selectedGoal) {
        selectGoal(autoGoal);
        return;
      }
    }
    if (!document.getElementById("targetCalInput").value) updateTargetCalFromGoal();
    updateGoalStatusLine();
    updateGoalPlanner();
  });
});
