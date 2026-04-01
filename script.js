let selectedSex = null;

function selectSex(btn, sex) {
  selectedSex = sex;
  document.querySelectorAll(".sexButton").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
}

function calculate() {
  const inputWeight = parseFloat(document.querySelector(".bodyWeight").value);
  const inputHeightFt = parseFloat(document.querySelector(".heightFt").value)
  const inputHeightIn = parseFloat(document.querySelector(".heightIn").value);
  const age = parseFloat(document.querySelector(".age").value);
  const activityFactor = parseFloat(document.querySelector(".activitySelect").value);
  const heightIn = (inputHeightFt * 12) + inputHeightIn;

  //convert to metric
  const weightKg = (inputWeight / 2.2)
  const heightCm = (heightIn * 2.54)


  // Mifflin-St Jeor BMR
  const bmrBase = (10 * weightKg) + (6.25 * heightCm) - (5 * age);
  const bmr = selectedSex === "male" ? bmrBase + 5 : bmrBase - 161;

  // BMI Calculation
  const heightC = (heightCm/100)
  const bmi = (weightKg/(heightC*heightC))

  const tdee = bmr * activityFactor;


  document.getElementById("result").textContent =
    `BMI: ${(bmi.toFixed(1))} BMR: ${Math.round(bmr)} cal/day | TDEE: ${Math.round(tdee)} cal/day`;


  //Input Check
  if (!inputWeightweight || !inputHeight || !age || !selectedSex || !activityFactor) {
    document.getElementById("result").textContent = "Please fill in all fields.";
    return;
  }
}
