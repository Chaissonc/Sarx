// If the user already has data saved, skip the form and send them straight to their health index.
// The ?edit param lets them come back here to change their numbers.
(async function gate() {
  const isEditingIntake = new URLSearchParams(window.location.search).has('edit');
  if (isEditingIntake) return;

  if (localStorage.getItem("bm_tdee")) {
    window.location.replace("healthindex/");
    return;
  }

  if (!localStorage.getItem("bm_authed")) {
    // First-time visitor with no local data yet — offer sign up/in, with a skip-to-guest option.
    // bm_authed is set the moment they sign in OR choose to continue as a guest, so this only ever shows once.
    window.location.replace("auth/");
    return;
  }

  // Signed in (or previously chose guest) but this device's local cache is empty —
  // check Supabase in case this is a new/cleared device with a profile already saved.
  const found = await hydrateProfileFromSupabase();
  if (found) window.location.replace("healthindex/");
})();

let selectedSex = null; // tracked separately because it's a button, not a real input field

// Called when the user taps Male or Female
function selectSex(btn, sex) {
  selectedSex = sex;
  document.querySelectorAll(".seg-btn[data-sex]").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
}

// Runs all the health math and saves everything (localStorage, plus Supabase if signed in), then redirects
async function calculate() {
  const weight         = parseFloat(document.querySelector(".bodyWeight").value);
  const heightFt       = parseFloat(document.querySelector(".heightFt").value);
  const heightIn       = parseFloat(document.querySelector(".heightIn").value) || 0;
  const age            = parseFloat(document.querySelector(".age").value);
  const activityFactor = parseFloat(document.querySelector(".activitySelect").value);

  if (!weight || isNaN(heightFt) || !age || !selectedSex || !activityFactor) {
    document.getElementById("formError").textContent = "Please fill in all fields.";
    return;
  }
  if (age <= 13 || age > 99) {
    document.getElementById("formError").textContent = age <= 13
      ? "You must be at least 14 to use Sarx."
      : "Please enter a valid age.";
    return;
  }
  if (weight < 50 || weight > 600) {
    document.getElementById("formError").textContent = "Please enter a valid weight.";
    return;
  }
  if (heightIn < 0 || heightIn > 11) {
    document.getElementById("formError").textContent = "Inches must be between 0 and 11.";
    return;
  }
  document.getElementById("formError").textContent = "";

  // Convert everything to metric for the formulas
  const totalIn  = heightFt * 12 + heightIn;
  const weightKg = weight / 2.205;
  const heightCm = totalIn * 2.54;
  const heightM  = heightCm / 100;

  // Mifflin-St Jeor formula for BMR (basal metabolic rate)
  const bmrBase = 10 * weightKg + 6.25 * heightCm - 5 * age;
  const bmr     = selectedSex === "male" ? bmrBase + 5 : bmrBase - 161;
  const bmi     = weightKg / (heightM * heightM);
  const tdee    = bmr * activityFactor; // total calories the user burns per day

  // Deurenberg body fat estimate (based on BMI, age, sex — not as accurate as a scan but close enough)
  const sexFactor = selectedSex === "male" ? 1 : 0;
  const bodyFat   = Math.max(0, 1.2 * bmi + 0.23 * age - 10.8 * sexFactor - 5.4);

  // Devine formula for ideal body weight
  const inchesOver5ft = Math.max(0, totalIn - 60);
  const ibwKg    = selectedSex === "male" ? 50 + 2.3 * inchesOver5ft : 45.5 + 2.3 * inchesOver5ft;
  const ibwLbs   = ibwKg * 2.205;
  const idealMin = ibwLbs;
  const idealMax = ibwLbs + 30; // 30lb window above ideal

  // Minimum healthy weight based on BMI 18.5 (start of underweight threshold)
  const minWeightKg  = 18.5 * (heightM * heightM);
  const minWeightLbs = minWeightKg * 2.205;

  let bmiCat = "Underweight";
  if (bmi >= 18.5 && bmi < 25) bmiCat = "Healthy Range";
  else if (bmi >= 25 && bmi < 30) bmiCat = "Overweight";
  else if (bmi >= 30) bmiCat = "Obese";

  // Status is OPTIMAL only if both BMI and body fat are in the healthy range
  const isOptimal =
    bmi >= 18.5 && bmi < 25 &&
    bodyFat >= (selectedSex === "male" ? 8  : 16) &&
    bodyFat <= (selectedSex === "male" ? 20 : 28);

  // Save everything so the index, plan, and other pages can read it —
  // writes to localStorage instantly, and to Supabase too if signed in.
  const submitBtn = document.querySelector(".primary-btn");
  const originalLabel = submitBtn.textContent;
  submitBtn.disabled = true;
  submitBtn.textContent = "SAVING...";

  await saveProfile({
    bm_age:       age,
    bm_heightFt:  heightFt,
    bm_heightIn:  heightIn,
    bm_weight:    weight,
    bm_sex:       selectedSex,
    bm_activity:  activityFactor,
    bm_bmi:       bmi.toFixed(1),
    bm_bmiCat:    bmiCat,
    bm_bmr:       Math.round(bmr),
    bm_tdee:      Math.round(tdee),
    bm_bodyfat:   bodyFat.toFixed(1),
    bm_idealMin:  idealMin.toFixed(1),
    bm_idealMax:  idealMax.toFixed(1),
    bm_minWeight: minWeightLbs.toFixed(1),
    bm_status:    isOptimal ? "OPTIMAL" : "REVIEW",
  });

  submitBtn.disabled = false;
  submitBtn.textContent = originalLabel;
  window.location.href = "healthindex/";
}

// When the page loads, fill the form back in with whatever the user entered last time
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
