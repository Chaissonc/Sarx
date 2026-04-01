function calculate() {
  const weight = parseFloat(document.querySelector(".bodyWeight").value);
  const height = parseFloat(document.querySelector(".height").value);
  const age = parseFloat(document.querySelector(".age").value);

  if (!weight || !height || !age) {
    document.getElementById("result").textContent = "Please fill in all fields.";
    return;
  }

  // Convert lbs to kg and inches to meters (assuming imperial input)
  const weightKg = weight * 0.453592;
  const heightM = height * 0.0254;

  // BMI-based body fat estimate (Deurenberg formula)
  const bmi = weightKg / (heightM * heightM);
  const bodyFat = (1.2 * bmi) + (0.23 * age) - 16.2;

  document.getElementById("result").textContent =
    `Estimated Body Fat: ${bodyFat.toFixed(1)}%`;
}
