(function () {
  var bmi      = localStorage.getItem("bm_bmi");
  var bmiCat   = localStorage.getItem("bm_bmiCat");
  var tdee     = localStorage.getItem("bm_tdee");
  var bodyFat  = localStorage.getItem("bm_bodyfat");
  var weight   = localStorage.getItem("bm_weight");
  var sex      = localStorage.getItem("bm_sex");
  var age      = localStorage.getItem("bm_age");
  var heightFt = localStorage.getItem("bm_heightFt");
  var heightIn = localStorage.getItem("bm_heightIn");
  var activity = localStorage.getItem("bm_activity");
  var idealMin = parseFloat(localStorage.getItem("bm_idealMin"));
  var idealMax = parseFloat(localStorage.getItem("bm_idealMax"));
  var status   = localStorage.getItem("bm_status");

  if (!bmi) { window.location.href = "../"; return; }

  var bmr = localStorage.getItem("bm_bmr");

  document.getElementById("status-tag").textContent = "SARX STATUS • " + (status || "—");
  document.getElementById("val-bmi").textContent = bmi;
  document.getElementById("bmi-category").textContent = bmiCat || "--";
  document.getElementById("val-tdee").textContent = parseInt(tdee).toLocaleString();
  document.getElementById("val-bmr").textContent = parseInt(bmr).toLocaleString();
  document.getElementById("val-bodyfat").textContent = bodyFat + "%";
  document.getElementById("val-weight").textContent = weight + " lbs";

  var activityLabels = {
    "1.2": "Sedentary", "1.375": "Lightly Active",
    "1.55": "Moderately Active", "1.725": "Very Active"
  };
  var stats = [
    { label: "AGE",      value: age },
    { label: "HEIGHT",   value: heightFt + "'" + heightIn + '"' },
    { label: "WEIGHT",   value: weight + " lbs" },
    { label: "SEX",      value: sex === "male" ? "Male" : "Female" },
    { label: "ACTIVITY", value: activityLabels[activity] || activity }
  ];
  document.getElementById("stats-bar").innerHTML = stats.map(function (s, i) {
    return '<div class="stat-chip" style="animation: chipIn 0.35s ease ' + (i * 0.07) + 's both"><span class="stat-chip-label">' + s.label +
           '</span><span class="stat-chip-value">' + s.value + '</span></div>';
  }).join("");

  var bfIdealLow  = sex === "male" ? 8  : 16;
  var bfIdealHigh = sex === "male" ? 20 : 28;
  var rangeEl = document.getElementById("bf-ideal-range");
  if (rangeEl) {
    rangeEl.innerHTML = '<span class="ideal-label">IDEAL RANGE</span><span class="ideal-value">' + bfIdealLow + '%–' + bfIdealHigh + '%</span>';
  }

  var weightRangeEl = document.getElementById("weight-ideal-range");
  if (weightRangeEl) {
    weightRangeEl.innerHTML = '<span class="ideal-label">IDEAL RANGE</span><span class="ideal-value">' + Math.round(idealMin) + '–' + Math.round(idealMax) + ' lbs</span>';
  }

  var maxBf = sex === "male" ? 35 : 45;
  var bfPct = Math.min(95, Math.max(5, (parseFloat(bodyFat) / maxBf) * 100));

  var w = parseFloat(weight);
  var buffer = 25;
  var wPct;
  if (w <= idealMin - buffer) {
    wPct = 5;
  } else if (w <= idealMin) {
    wPct = 5 + ((w - (idealMin - buffer)) / buffer) * 20;
  } else if (w <= idealMax) {
    wPct = 25 + ((w - idealMin) / (idealMax - idealMin)) * 17;
  } else if (w <= idealMax + buffer) {
    wPct = 42 + ((w - idealMax) / buffer) * 28;
  } else {
    wPct = 95;
  }
  var wFinal = Math.min(95, Math.max(5, wPct));

  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      document.getElementById("bf-dot").style.left = bfPct + "%";
      document.getElementById("weight-dot").style.left = wFinal + "%";
    });
  });
})();

(function () {
  var card     = document.getElementById("slide-card");
  var panels   = card.querySelectorAll(".slide-panel");
  var dots     = card.querySelectorAll(".dot");
  var current  = 0;
  var startX   = 0;
  var dragging = false;

  function goTo(n) {
    current = Math.max(0, Math.min(n, 1));
    panels[0].style.transform = current === 0 ? "translateX(0)"   : "translateX(-100%)";
    panels[1].style.transform = current === 1 ? "translateX(0)"   : "translateX(100%)";
    dots.forEach(function (d, i) { d.classList.toggle("active", i === current); });
  }

  card.addEventListener("touchstart", function (e) { startX = e.touches[0].clientX; });
  card.addEventListener("touchend",   function (e) {
    var dx = startX - e.changedTouches[0].clientX;
    if (Math.abs(dx) > 30) goTo(dx > 0 ? current + 1 : current - 1);
  });

  card.addEventListener("mousedown",  function (e) { startX = e.clientX; dragging = true; });
  card.addEventListener("mouseup",    function (e) {
    if (!dragging) return;
    dragging = false;
    var dx = startX - e.clientX;
    if (Math.abs(dx) > 30) goTo(dx > 0 ? current + 1 : current - 1);
  });
  card.addEventListener("mouseleave", function () { dragging = false; });
})();
