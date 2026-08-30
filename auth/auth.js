let authMode = "login"; // "login" | "signup" — classic login-first layout, signup is the secondary path

function setAuthMode(mode) {
  authMode = mode;
  document.getElementById("authSubmitBtn").textContent = mode === "signup" ? "CREATE ACCOUNT" : "LOG IN";
  document.getElementById("authError").textContent = "";
  document.getElementById("authNotice").textContent = "";

  var isSignup = mode === "signup";

  // Confirm password only makes sense when creating an account
  var confirmGroup = document.getElementById("confirmPasswordGroup");
  var confirmInput = document.getElementById("authConfirmPassword");
  confirmGroup.style.display = isSignup ? "" : "none";
  confirmInput.required = isSignup;
  if (!isSignup) confirmInput.value = "";

  // The button below Google flips between offering signup and offering to go back to login
  document.getElementById("authToggleBtn").textContent = isSignup ? "Log In Instead" : "Create New Account";
}

function toggleAuthMode() {
  setAuthMode(authMode === "signup" ? "login" : "signup");
}

// Supabase's raw error text ("Invalid login credentials") is accurate but reads
// like a system message. Swap it for the standard, user-facing phrasing used
// everywhere else on the web — deliberately vague about which field was wrong.
function friendlyAuthError(err) {
  if (err && err.message === "Invalid login credentials") {
    return "Wrong email or password.";
  }
  return (err && err.message) || "Something went wrong. Please try again.";
}

// bm_authed just means "don't show the auth gate again on this device" —
// it's set whether the person signed in or chose to skip.
function goToApp() {
  localStorage.setItem("bm_authed", "1");
  window.location.href = "../index.html";
}

function continueAsGuest() {
  goToApp();
}

// Reconciles this device's local (possibly guest) data against the account
// just signed into. Existing account data always wins — signing into an
// account that already has saved metrics should show THAT data, not
// whatever was sitting in localStorage from guest browsing. Only if the
// account has no saved profile yet do we treat local data as worth keeping,
// and push it up so it isn't lost if this device's storage is ever cleared.
async function reconcileAfterSignIn() {
  const foundRemoteProfile = await hydrateProfileFromSupabase();
  if (foundRemoteProfile) return;

  const localFields = {};
  Object.keys(localStorage).forEach(function (key) {
    if (key.indexOf("bm_") === 0 && key !== "bm_authed") {
      localFields[key] = localStorage.getItem(key);
    }
  });
  if (Object.keys(localFields).length > 0) {
    await saveProfile(localFields);
  }
}

// Google sign-in is a full-page redirect (to Google, then back to this page with
// a session already established), not an async call we get a result from directly.
async function signInWithGoogle() {
  const { error } = await supabaseClient.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: window.location.origin + "/auth/" },
  });
  if (error) document.getElementById("authError").textContent = error.message;
}

// Catches the redirect back from Google: the Supabase client parses the session out
// of the URL automatically on load, so if one's already present when this page opens,
// that's what just happened — reconcile and continue into the app like any other sign-in.
(async function checkForOAuthRedirect() {
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (session) {
    await reconcileAfterSignIn();
    goToApp();
  }
})();

async function handleAuthSubmit(event) {
  event.preventDefault();

  const email = document.getElementById("authEmail").value.trim();
  const password = document.getElementById("authPassword").value;
  const errorEl = document.getElementById("authError");
  const noticeEl = document.getElementById("authNotice");
  const submitBtn = document.getElementById("authSubmitBtn");

  errorEl.textContent = "";
  noticeEl.textContent = "";
  submitBtn.disabled = true;

  try {
    if (authMode === "signup") {
      const confirmPassword = document.getElementById("authConfirmPassword").value;
      if (password !== confirmPassword) {
        errorEl.textContent = "Passwords don't match.";
        return; // finally still runs — re-enables the button
      }

      const { data, error } = await supabaseClient.auth.signUp({ email, password });
      if (error) throw error;

      if (data.session) {
        // Email confirmation is off for this project — signed in immediately.
        submitBtn.textContent = "SYNCING...";
        await reconcileAfterSignIn();
        goToApp();
      } else {
        // Email confirmation is required before a session is issued.
        noticeEl.textContent = "Check your email to confirm your account, then log in.";
        setAuthMode("login");
      }
    } else {
      const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
      if (error) throw error;
      submitBtn.textContent = "SYNCING...";
      await reconcileAfterSignIn();
      goToApp();
    }
  } catch (err) {
    errorEl.textContent = friendlyAuthError(err);
  } finally {
    submitBtn.disabled = false;
  }
}
