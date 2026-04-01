let selectedSex = null;

function selectSex(btn, sex) {
  selectedSex = sex;
  document.querySelectorAll(".sexButton").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
}

function calculate() {
  const inputWeight = parseFloat(document.querySelector(".bodyWeight").value);
  const inputHeightFt = parseFloat(document.querySelector(".heightFt").value);
  const inputHeightIn = parseFloat(document.querySelector(".heightIn").value);
  const age = parseFloat(document.querySelector(".age").value);
  const activityFactor = parseFloat(document.querySelector(".activitySelect").value);

  if (!inputWeight || isNaN(inputHeightFt) || isNaN(inputHeightIn) || !age || !selectedSex || !activityFactor) {
    document.getElementById("formError").textContent = "Please fill in all fields.";
    return;
  }
  document.getElementById("formError").textContent = "";

  const heightIn = (inputHeightFt * 12) + inputHeightIn;
  const weightKg = inputWeight / 2.2;
  const heightCm = heightIn * 2.54;
  const heightM = heightCm / 100;

  // BMR (Mifflin-St Jeor)
  const bmrBase = (10 * weightKg) + (6.25 * heightCm) - (5 * age);
  const bmr = selectedSex === "male" ? bmrBase + 5 : bmrBase - 161;

  // BMI
  const bmi = weightKg / (heightM * heightM);

  // TDEE
  const tdee = bmr * activityFactor;

  // Body Fat % (BMI-based)
  const sexFactor = selectedSex === "male" ? 1 : 0;
  const bodyFat = Math.max(0, (1.2 * bmi) + (0.23 * age) - (10.8 * sexFactor) - 5.4);

  // Ideal Weight range (Devine formula → lbs, +20 for upper bound)
  const inchesOver5ft = Math.max(0, heightIn - 60);
  const idealWeightKg = selectedSex === "male"
    ? 50 + (2.3 * inchesOver5ft)
    : 45.5 + (2.3 * inchesOver5ft);
  const idealWeightLbs = idealWeightKg * 2.2;
  const idealWeightMax = idealWeightLbs + 20;

  // Body fat ideal range text
  const bfRange = selectedSex === "male" ? "Ideal: 8 – 20%" : "Ideal: 16 – 28%";
  document.getElementById("range-bodyfat").textContent = bfRange;

  // Populate stat values
  document.getElementById("val-bmi").textContent = bmi.toFixed(1);
  document.getElementById("val-bodyfat").textContent = bodyFat.toFixed(1) + "%";
  document.getElementById("val-bmr").textContent = Math.round(bmr) + " cal/day";
  document.getElementById("val-tdee").textContent = Math.round(tdee) + " cal/day";
  document.getElementById("val-weight").textContent = inputWeight + " lbs";
  document.getElementById("range-weight").textContent =
    `Ideal: ${Math.round(idealWeightLbs)} – ${Math.round(idealWeightMax)} lbs`;

  // Color coding
  setHealth("card-bmi", bmiHealth(bmi));
  setHealth("card-bodyfat", bodyFatHealth(bodyFat, selectedSex));
  setHealth("card-weight", weightHealth(inputWeight, idealWeightLbs, idealWeightMax));
  setHealth("card-bmr", "grey");
  setHealth("card-tdee", "grey");

  // Body image
  document.getElementById("bodyImage").src = selectedSex === "male"
    ? "assets/maleBody_removed_bg.png"
    : "assets/femaleBody_removed_bg.png";

  // Input summary
  const activityLabels = {
    "1.2": "Sedentary",
    "1.375": "Lightly Active",
    "1.55": "Moderately Active",
    "1.725": "Very Active"
  };
  document.getElementById("sum-age").textContent = `Age: ${age}`;
  document.getElementById("sum-height").textContent = `Height: ${inputHeightFt}'${inputHeightIn}"`;
  document.getElementById("sum-weight").textContent = `Weight: ${inputWeight} lbs`;
  document.getElementById("sum-sex").textContent = `Sex: ${selectedSex.charAt(0).toUpperCase() + selectedSex.slice(1)}`;
  document.getElementById("sum-activity").textContent = `Activity: ${activityLabels[String(activityFactor)] || ""}`;

  showResults();
}

function setHealth(cardId, color) {
  const card = document.getElementById(cardId);
  card.classList.remove("health-green", "health-yellow", "health-red", "health-grey");
  card.classList.add("health-" + color);
}

function bmiHealth(bmi) {
  if (bmi >= 18.5 && bmi < 25) return "green";
  if ((bmi >= 25 && bmi < 30) || (bmi >= 16 && bmi < 18.5)) return "yellow";
  return "red";
}

function bodyFatHealth(bf, sex) {
  if (sex === "male") {
    if (bf >= 8 && bf <= 20) return "green";
    if ((bf > 20 && bf <= 25) || (bf >= 5 && bf < 8)) return "yellow";
    return "red";
  } else {
    if (bf >= 16 && bf <= 28) return "green";
    if ((bf > 28 && bf <= 33) || (bf >= 13 && bf < 16)) return "yellow";
    return "red";
  }
}

function weightHealth(actualLbs, idealMin, idealMax) {
  if (actualLbs >= idealMin && actualLbs <= idealMax) return "green";
  const dist = actualLbs < idealMin ? idealMin - actualLbs : actualLbs - idealMax;
  if (dist <= 20) return "yellow";
  return "red";
}

function showResults() {
  document.getElementById("formPanel").classList.remove("active");
  document.getElementById("results").classList.add("active");
}

function showForm() {
  document.getElementById("results").classList.remove("active");
  document.getElementById("formPanel").classList.add("active");
}
