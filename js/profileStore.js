// profileStore — the one place that knows how bm_* localStorage keys map to
// the Supabase `profiles` table. Everywhere else in the app keeps reading
// localStorage.getItem("bm_xxx") exactly as before; this file is what keeps
// that local cache in sync with Supabase for signed-in users.
//
// Guest (not signed in): behaves exactly like the old localStorage-only app.
// Signed in: writes go to localStorage AND Supabase; a fresh device with an
// empty localStorage gets hydrated from Supabase the first time it needs data.
//
// Requires supabaseClient.js to be loaded first.

const BM_TO_COLUMN = {
  bm_age:        "age",
  bm_heightFt:   "height_ft",
  bm_heightIn:   "height_in",
  bm_weight:     "weight",
  bm_sex:        "sex",
  bm_activity:   "activity",
  bm_bmi:        "bmi",
  bm_bmiCat:     "bmi_cat",
  bm_bmr:        "bmr",
  bm_tdee:       "tdee",
  bm_bodyfat:    "body_fat",
  bm_idealMin:   "ideal_min",
  bm_idealMax:   "ideal_max",
  bm_minWeight:  "min_weight",
  bm_status:     "status",
  bm_goal:       "goal",
  bm_intensity:  "intensity",
  bm_diet:       "diet",
  bm_targetCal:       "target_cal",
  bm_goalWeight:      "goal_weight",
  bm_targetCalCustom: "target_cal_custom",
};

// Writes each bm_* field to localStorage immediately (synchronous — same as
// before), then upserts to Supabase in the background if signed in.
// Fields not signed in for aren't lost; they just stay local-only until sync.
async function saveProfile(fields) {
  // null/undefined means "not decided yet" (e.g. no goal picked) — skip it rather
  // than writing the literal string "null", which would read back as truthy.
  for (const [key, value] of Object.entries(fields)) {
    if (value === null || value === undefined) continue;
    // localStorage only stores strings — the app's own convention for flags is "1"/"0",
    // not JS's "true"/"false", so normalize before writing.
    localStorage.setItem(key, typeof value === "boolean" ? (value ? "1" : "0") : value);
  }

  const { data: { session } } = await supabaseClient.auth.getSession();
  if (!session) return; // guest mode — localStorage is the only store

  const row = { user_id: session.user.id };
  for (const [bmKey, value] of Object.entries(fields)) {
    if (value === null || value === undefined) continue;
    const column = BM_TO_COLUMN[bmKey];
    if (!column) continue;
    // An empty string means "cleared" (e.g. blanking the calorie field) — send an
    // actual NULL, not "", which would fail against numeric columns like target_cal.
    row[column] = value === "" ? null : value;
  }

  const { error } = await supabaseClient.from("profiles").upsert(row);
  if (error) console.error("Failed to sync profile to Supabase:", error.message);
}

// Pulls the saved profile from Supabase into localStorage. Returns true if a
// profile was found and hydrated, false otherwise (guest, or signed in but
// hasn't completed onboarding yet). Used at the app-entry gate to recognize
// a returning signed-in user on a device with an empty local cache.
async function hydrateProfileFromSupabase() {
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (!session) return false;

  const { data, error } = await supabaseClient
    .from("profiles")
    .select("*")
    .eq("user_id", session.user.id)
    .maybeSingle();

  if (error) {
    console.error("Failed to load profile from Supabase:", error.message);
    return false;
  }
  if (!data) return false;

  for (const [bmKey, column] of Object.entries(BM_TO_COLUMN)) {
    let value = data[column];
    if (value === null || value === undefined) continue;
    // Postgres booleans come back as real JS booleans — the app's own convention
    // for flags is the string "1"/"0" (see bm_targetCalCustom), so normalize.
    if (typeof value === "boolean") value = value ? "1" : "0";
    localStorage.setItem(bmKey, value);
  }
  return true;
}
