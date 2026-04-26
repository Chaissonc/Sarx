if (localStorage.getItem("bm_tdee") && !new URLSearchParams(window.location.search).has('edit')) {
  window.location.replace("healthindex/");
}

let selectedSex = null;

function selectSex(btn, sex) {
  selectedSex = sex;
  document.querySelectorAll(".seg-btn[data-sex]").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
}

function calculate() {
  const weight       = parseFloat(document.querySelector(".bodyWeight").value);
  const heightFt     = parseFloat(document.querySelector(".heightFt").value);
  const heightIn     = parseFloat(document.querySelector(".heightIn").value) || 0;
  const age          = parseFloat(document.querySelector(".age").value);
  const activityFactor = parseFloat(document.querySelector(".activitySelect").value);

  if (!weight || isNaN(heightFt) || !age || !selectedSex || !activityFactor) {
    document.getElementById("formError").textContent = "Please fill in all fields.";
    return;
  }
  document.getElementById("formError").textContent = "";

  const totalIn  = heightFt * 12 + heightIn;
  const weightKg = weight / 2.205;
  const heightCm = totalIn * 2.54;
  const heightM  = heightCm / 100;

  const bmrBase = 10 * weightKg + 6.25 * heightCm - 5 * age;
  const bmr     = selectedSex === "male" ? bmrBase + 5 : bmrBase - 161;
  const bmi     = weightKg / (heightM * heightM);
  const tdee    = bmr * activityFactor;
  const sexFactor = selectedSex === "male" ? 1 : 0;
  const bodyFat = Math.max(0, 1.2 * bmi + 0.23 * age - 10.8 * sexFactor - 5.4);

  const inchesOver5ft = Math.max(0, totalIn - 60);
  const ibwKg    = selectedSex === "male" ? 50 + 2.3 * inchesOver5ft : 45.5 + 2.3 * inchesOver5ft;
  const ibwLbs   = ibwKg * 2.205;
  const idealMin = ibwLbs;
  const idealMax = ibwLbs + 30;

  const minWeightKg  = 18.5 * (heightM * heightM);
  const minWeightLbs = minWeightKg * 2.205;

  let bmiCat = "Underweight";
  if (bmi >= 18.5 && bmi < 25) bmiCat = "Healthy Range";
  else if (bmi >= 25 && bmi < 30) bmiCat = "Overweight";
  else if (bmi >= 30) bmiCat = "Obese";

  const isOptimal =
    bmi >= 18.5 && bmi < 25 &&
    bodyFat >= (selectedSex === "male" ? 8 : 16) &&
    bodyFat <= (selectedSex === "male" ? 20 : 28);

  localStorage.setItem("bm_age",       age);
  localStorage.setItem("bm_heightFt",  heightFt);
  localStorage.setItem("bm_heightIn",  heightIn);
  localStorage.setItem("bm_weight",    weight);
  localStorage.setItem("bm_sex",       selectedSex);
  localStorage.setItem("bm_activity",  activityFactor);
  localStorage.setItem("bm_bmi",       bmi.toFixed(1));
  localStorage.setItem("bm_bmiCat",    bmiCat);
  localStorage.setItem("bm_bmr",       Math.round(bmr));
  localStorage.setItem("bm_tdee",      Math.round(tdee));
  localStorage.setItem("bm_bodyfat",   bodyFat.toFixed(1));
  localStorage.setItem("bm_idealMin",  idealMin.toFixed(1));
  localStorage.setItem("bm_idealMax",  idealMax.toFixed(1));
  localStorage.setItem("bm_minWeight", minWeightLbs.toFixed(1));
  localStorage.setItem("bm_status",    isOptimal ? "OPTIMAL" : "REVIEW");

  window.location.href = "healthindex/";
}

document.addEventListener("DOMContentLoaded", function () {
  const age      = localStorage.getItem("bm_age");
  const heightFt = localStorage.getItem("bm_heightFt");
  const heightIn = localStorage.getItem("bm_heightIn");
  const weight   = localStorage.getItem("bm_weight");
  const sex      = localStorage.getItem("bm_sex");
  const activity = localStorage.getItem("bm_activity");

  if (age)      document.querySelector(".age").value = age;
  if (heightFt) document.querySelector(".heightFt").value = heightFt;
  if (heightIn) document.querySelector(".heightIn").value = heightIn;
  if (weight)   document.querySelector(".bodyWeight").value = weight;
  if (activity) document.querySelector(".activitySelect").value = activity;
  if (sex) {
    selectedSex = sex;
    const btn = document.querySelector(`.seg-btn[data-sex="${sex}"]`);
    if (btn) btn.classList.add("active");
  }
});
