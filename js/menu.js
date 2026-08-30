var _installPrompt = null; // Android saves the install prompt here when the browser fires it

// Android fires this event before showing the install banner — we grab it so we can trigger it manually later
window.addEventListener("beforeinstallprompt", function (e) {
  e.preventDefault();
  _installPrompt = e;
});

// Opens the side drawer menu
function openMenu() {
  document.getElementById("menu-overlay").classList.add("open"); // dim background
  document.getElementById("menu-drawer").classList.add("open");  // slide in the panel
  document.body.style.overflow = "hidden"; // stop the page from scrolling behind the menu
}

// Closes the side drawer menu
function closeMenu() {
  document.getElementById("menu-overlay").classList.remove("open");
  document.getElementById("menu-drawer").classList.remove("open");
  document.body.style.overflow = ""; // restore normal scrolling
}

// "Add App" button — works differently on Android vs iOS
function addApp() {
  if (_installPrompt) {
    // Android: trigger the native install prompt we captured earlier
    _installPrompt.prompt();
    _installPrompt.userChoice.then(function () { _installPrompt = null; });
  } else {
    // iOS doesn't support the prompt API, so show manual instructions instead
    var isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
    var msg = isIOS
      ? "Tap the Share button below, then \"Add to Home Screen\"."
      : "Open your browser menu and tap \"Add to Home Screen\" or \"Install App\".";
    showMenuToast(msg);
  }
}

// Shows a small toast message inside the drawer, auto-dismisses after 4 seconds
function showMenuToast(msg) {
  var toast = document.getElementById("menu-toast");
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add("visible");
  setTimeout(function () { toast.classList.remove("visible"); }, 4000);
}

// Reflects the current auth state in the drawer's "Account" item. Signed in, it opens
// the account page (email, display name, sign out); as a guest, it goes to sign-in.
async function initAccountMenuItem() {
  var item = document.getElementById("accountMenuItem");
  var label = document.getElementById("accountMenuLabel");
  if (!item || !label || typeof supabaseClient === "undefined") return;

  const { data: { session } } = await supabaseClient.auth.getSession();
  if (session) {
    label.textContent = "Account";
    item.onclick = function () { window.location.href = "../account/"; };
  } else {
    label.textContent = "Sign In";
    item.onclick = function () { window.location.href = "../auth/"; };
  }
}

document.addEventListener("DOMContentLoaded", initAccountMenuItem);
