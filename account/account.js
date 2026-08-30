// This page requires a signed-in session — guests never reach it (the menu sends
// them to /auth/ instead), but handle it directly too in case someone lands here
// via a stale bookmark or browser back button after signing out.
document.addEventListener("DOMContentLoaded", init);

async function init() {
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (!session) {
    window.location.replace("../auth/");
    return;
  }

  document.getElementById("accountEmail").textContent = session.user.email || "—";

  // Google sign-ins arrive with a name already in user_metadata (full_name/name) —
  // prefill with that, but an explicitly saved display_name always wins.
  var meta = session.user.user_metadata || {};
  var savedName = meta.display_name || meta.full_name || meta.name || "";
  document.getElementById("displayNameInput").value = savedName;

  if (session.user.created_at) {
    var created = new Date(session.user.created_at);
    var monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    document.getElementById("memberSince").textContent = monthNames[created.getMonth()] + " " + created.getFullYear();
  }
}

async function saveDisplayName() {
  var input  = document.getElementById("displayNameInput");
  var notice = document.getElementById("accountSaveNotice");
  var name   = input.value.trim();

  notice.textContent = "";

  const { error } = await supabaseClient.auth.updateUser({ data: { display_name: name } });

  if (error) {
    notice.style.color = "#CC2325";
    notice.textContent = error.message;
  } else {
    notice.style.color = "#2a8f4a";
    notice.textContent = "Saved.";
    setTimeout(function () { notice.textContent = ""; }, 2500);
  }
}

async function signOutOfAccount() {
  await supabaseClient.auth.signOut();
  // Same cleanup as the drawer menu's sign-out — clear the synced local cache so it
  // doesn't linger readable as if it were guest data.
  Object.keys(localStorage)
    .filter(function (key) { return key.indexOf("bm_") === 0; })
    .forEach(function (key) { localStorage.removeItem(key); });
  window.location.href = "../auth/";
}
