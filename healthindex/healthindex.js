// First block: reads all saved data from localStorage and renders the health index page
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

  // If there's no data at all, send them back to fill in the form
  if (!bmi) { window.location.href = "../"; return; }

  var bmr = localStorage.getItem("bm_bmr");

  // Fill in all the metric values on the page
  document.getElementById("status-tag").textContent    = "SARX STATUS • " + (status || "—");
  document.getElementById("val-bmi").textContent       = bmi;
  document.getElementById("bmi-category").textContent  = bmiCat || "--";
  document.getElementById("val-tdee").textContent      = parseInt(tdee).toLocaleString();
  document.getElementById("val-bmr").textContent       = parseInt(bmr).toLocaleString();
  document.getElementById("val-bodyfat").textContent   = bodyFat + "%";
  document.getElementById("val-weight").textContent    = weight + " lbs";

  // Build the stats bar at the top (age, height, weight, sex, activity level)
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
  // Each chip staggers in with a small animation delay
  document.getElementById("stats-bar").innerHTML = stats.map(function (s, i) {
    return '<div class="stat-chip" style="animation: chipIn 0.35s ease ' + (i * 0.07) + 's both"><span class="stat-chip-label">' + s.label +
           '</span><span class="stat-chip-value">' + s.value + '</span></div>';
  }).join("");

  // Set the ideal range label for body fat (different ranges for male vs female)
  var bfIdealLow  = sex === "male" ? 8  : 16;
  var bfIdealHigh = sex === "male" ? 20 : 28;
  var rangeEl = document.getElementById("bf-ideal-range");
  if (rangeEl) {
    rangeEl.innerHTML = '<span class="ideal-label">IDEAL RANGE</span><span class="ideal-value">' + bfIdealLow + '%–' + bfIdealHigh + '%</span>';
  }

  // Set the ideal range label for weight
  var weightRangeEl = document.getElementById("weight-ideal-range");
  if (weightRangeEl) {
    weightRangeEl.innerHTML = '<span class="ideal-label">IDEAL RANGE</span><span class="ideal-value">' + Math.round(idealMin) + '–' + Math.round(idealMax) + ' lbs</span>';
  }

  // Calculate where the body fat dot lands on the gradient bar (5%–95% range on screen)
  var maxBf  = sex === "male" ? 35 : 45;
  var bfPct  = Math.min(95, Math.max(5, (parseFloat(bodyFat) / maxBf) * 100));

  // Calculate where the weight dot lands — uses a custom curve so the healthy range
  // sits in the middle of the bar rather than being proportional to raw pounds
  var w      = parseFloat(weight);
  var buffer = 25; // lbs of padding on either side of the ideal range
  var wPct;
  if      (w <= idealMin - buffer) { wPct = 5; }
  else if (w <= idealMin)          { wPct = 5  + ((w - (idealMin - buffer)) / buffer) * 20; }
  else if (w <= idealMax)          { wPct = 25 + ((w - idealMin) / (idealMax - idealMin)) * 17; }
  else if (w <= idealMax + buffer) { wPct = 42 + ((w - idealMax) / buffer) * 28; }
  else                             { wPct = 95; }
  var wFinal = Math.min(95, Math.max(5, wPct));

  // Double requestAnimationFrame makes sure the dots animate from their starting position
  // instead of jumping straight to their final spot
  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      document.getElementById("bf-dot").style.left     = bfPct  + "%";
      document.getElementById("weight-dot").style.left = wFinal + "%";
    });
  });
})();


// Second block: handles the swipeable TDEE / BMR card
(function () {
  var card     = document.getElementById("slide-card");
  var panels   = card.querySelectorAll(".slide-panel");
  var dots     = card.querySelectorAll(".dot");
  var current  = 0;  // 0 = TDEE panel, 1 = BMR panel
  var startX   = 0;
  var dragging = false;

  // Slide to a panel by index
  function goTo(n) {
    current = Math.max(0, Math.min(n, 1));
    panels[0].style.transform = current === 0 ? "translateX(0)"   : "translateX(-100%)";
    panels[1].style.transform = current === 1 ? "translateX(0)"   : "translateX(100%)";
    dots.forEach(function (d, i) { d.classList.toggle("active", i === current); });
  }

  // Touch swipe support (mobile) — tap (<5px) opens focus, swipe (>30px) changes panel
  card.addEventListener("touchstart", function (e) { startX = e.touches[0].clientX; });
  card.addEventListener("touchend",   function (e) {
    var dx = startX - e.changedTouches[0].clientX;
    if      (Math.abs(dx) < 5)  { openFocus(current === 0 ? "tdee" : "bmr"); }
    else if (Math.abs(dx) > 30) { goTo(dx > 0 ? current + 1 : current - 1); }
  });

  // Mouse drag support (desktop) — same tap/swipe distinction
  card.addEventListener("mousedown",  function (e) { startX = e.clientX; dragging = true; });
  card.addEventListener("mouseup",    function (e) {
    if (!dragging) return;
    dragging = false;
    var dx = startX - e.clientX;
    if      (Math.abs(dx) < 5)  { openFocus(current === 0 ? "tdee" : "bmr"); }
    else if (Math.abs(dx) > 30) { goTo(dx > 0 ? current + 1 : current - 1); }
  });
  card.addEventListener("mouseleave", function () { dragging = false; });
})();


// Third block: focus modal for BMI, TDEE, BMR
function openFocus(type) {
  var bmi    = parseFloat(localStorage.getItem("bm_bmi"));
  var bmiCat = localStorage.getItem("bm_bmiCat") || "";
  var tdee   = parseInt(localStorage.getItem("bm_tdee"));
  var bmr    = parseInt(localStorage.getItem("bm_bmr"));

  var label = document.getElementById("focus-label");
  var body  = document.getElementById("focus-body");
  var html  = "";

  if (type === "bmi") {
    label.textContent = "Body Mass Index";

    // Map BMI value to a position on the 4-zone bar
    // Zones: Underweight 0–15%, Normal 15–45%, Overweight 45–70%, Obese 70–100%
    var dotPct;
    if      (bmi < 18.5) { dotPct = Math.max(2,  (bmi - 10) / 8.5 * 15); }
    else if (bmi < 25)   { dotPct = 15 + (bmi - 18.5) / 6.4 * 30; }
    else if (bmi < 30)   { dotPct = 45 + (bmi - 25)   / 5   * 25; }
    else                 { dotPct = Math.min(97, 70 + (bmi - 30) / 10 * 27); }

    var catDescs = {
      "Underweight":   "Being underweight can signal insufficient caloric intake or an underlying condition. BMI under 18.5 is linked to nutritional deficiencies and reduced bone density.",
      "Healthy Range": "The 18.5–24.9 range is associated with the lowest disease risk from weight. Most adults here have stable metabolic markers.",
      "Overweight":    "25–29.9 carries modestly elevated metabolic risk, but context matters — muscular individuals often land here despite healthy body composition.",
      "Obese":         "A BMI of 30+ is associated with higher risk of type 2 diabetes, cardiovascular disease, and joint stress. This is a screening flag, not a clinical diagnosis."
    };

    html = '<span class="focus-value">' + bmi + '</span>'
         + '<span class="focus-value-sub">' + bmiCat + '</span>'
         + '<div class="focus-bar-wrap">'
         +   '<div class="focus-bar bmi-gradient"></div>'
         +   '<div class="focus-bar-dot-track"><div class="focus-bar-dot" id="focus-bmi-dot"></div></div>'
         +   '<div class="focus-bar-labels">'
         +     '<span>Underweight</span><span>Normal</span><span>Overweight</span><span>Obese</span>'
         +   '</div>'
         + '</div>'
         + '<p class="focus-desc">Your BMI of <strong>' + bmi + '</strong> places you in the <strong>' + bmiCat + '</strong> range. ' + (catDescs[bmiCat] || "") + '</p>'
         + '<p class="focus-def">BMI (Body Mass Index) is a ratio of weight to height squared. It\'s a population-level screening tool — useful for identifying risk patterns, but not a direct measure of body composition. Muscular individuals often score in the overweight range despite healthy body fat levels.</p>';

    body.innerHTML = html;

    // Animate the dot after the modal paints
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        var dot = document.getElementById("focus-bmi-dot");
        if (dot) dot.style.left = dotPct.toFixed(1) + "%";
      });
    });

  } else if (type === "tdee") {
    label.textContent = "Total Daily Energy Expenditure";
    var activityCal = tdee - bmr;
    var bmrPct = Math.round((bmr / tdee) * 100);

    html = '<span class="focus-value">' + tdee.toLocaleString() + '</span>'
         + '<span class="focus-value-sub">kcal / day</span>'
         + '<div class="focus-split">'
         +   '<div class="focus-split-block" style="flex:' + bmrPct + ';background:#f6f6f9">'
         +     '<span class="focus-split-label" style="color:#aaa">BMR</span>'
         +     '<span class="focus-split-val" style="color:#1a1a1a">' + bmr.toLocaleString() + '</span>'
         +   '</div>'
         +   '<div class="focus-split-block" style="flex:' + (100 - bmrPct) + ';background:#E8192C">'
         +     '<span class="focus-split-label" style="color:rgba(255,255,255,0.7)">ACTIVITY</span>'
         +     '<span class="focus-split-val" style="color:#fff">+' + activityCal.toLocaleString() + '</span>'
         +   '</div>'
         + '</div>'
         + '<p class="focus-desc">Your TDEE breaks down into <strong>' + bmr.toLocaleString() + ' calories</strong> your body burns at rest (' + bmrPct + '%) and <strong>' + activityCal.toLocaleString() + ' calories</strong> from movement and activity. Eat below your TDEE to lose weight, above it to gain.</p>'
         + '<p class="focus-def">TDEE (Total Daily Energy Expenditure) is the total calories your body burns in 24 hours — your resting metabolism combined with everything you burn through movement, exercise, and digestion. It\'s the single number that determines whether you gain, lose, or maintain weight.</p>';

    body.innerHTML = html;

  } else if (type === "bmr") {
    label.textContent = "Basal Metabolic Rate";
    var perHour  = Math.round(bmr / 24);
    var sleep8   = Math.round(bmr * 8  / 24);
    var waking16 = Math.round(bmr * 16 / 24);

    html = '<span class="focus-value">' + bmr.toLocaleString() + '</span>'
         + '<span class="focus-value-sub">kcal burned at rest</span>'
         + '<div class="focus-targets">'
         +   '<div class="focus-target"><span class="focus-target-label">PER HOUR</span><span class="focus-target-val">' + perHour + '</span></div>'
         +   '<div class="focus-target"><span class="focus-target-label">DURING SLEEP</span><span class="focus-target-val">' + sleep8.toLocaleString() + '</span></div>'
         +   '<div class="focus-target"><span class="focus-target-label">WAKING REST</span><span class="focus-target-val">' + waking16.toLocaleString() + '</span></div>'
         + '</div>'
         + '<p class="focus-desc">Your body burns <strong>' + perHour + ' calories per hour</strong> at complete rest — that\'s <strong>' + sleep8.toLocaleString() + ' calories</strong> while you sleep and <strong>' + waking16.toLocaleString() + ' calories</strong> during your waking hours before any movement is added.</p>'
         + '<p class="focus-def">BMR (Basal Metabolic Rate) is calculated using the Mifflin-St Jeor equation — the most accurate population-level formula according to the Academy of Nutrition and Dietetics. It accounts for age, sex, height, and weight. Physical activity is not included.</p>';

    body.innerHTML = html;
  }

  document.getElementById("focus-overlay").classList.add("open");
}

function closeFocus() {
  document.getElementById("focus-overlay").classList.remove("open");
}

document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") closeFocus();
});
