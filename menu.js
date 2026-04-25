var _installPrompt = null;

window.addEventListener("beforeinstallprompt", function (e) {
  e.preventDefault();
  _installPrompt = e;
});

function openMenu() {
  document.getElementById("menu-overlay").classList.add("open");
  document.getElementById("menu-drawer").classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeMenu() {
  document.getElementById("menu-overlay").classList.remove("open");
  document.getElementById("menu-drawer").classList.remove("open");
  document.body.style.overflow = "";
}

function addApp() {
  if (_installPrompt) {
    _installPrompt.prompt();
    _installPrompt.userChoice.then(function () { _installPrompt = null; });
  } else {
    var isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
    var msg = isIOS
      ? "Tap the Share button below, then \"Add to Home Screen\"."
      : "Open your browser menu and tap \"Add to Home Screen\" or \"Install App\".";
    showMenuToast(msg);
  }
}

function showMenuToast(msg) {
  var toast = document.getElementById("menu-toast");
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add("visible");
  setTimeout(function () { toast.classList.remove("visible"); }, 4000);
}
