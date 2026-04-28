function getPersonalizedDosage(item) {
  var weight = parseFloat(localStorage.getItem("bm_weight"));
  var tdee   = parseFloat(localStorage.getItem("bm_tdee"));
  if (item.id === "daily-protein-target" && weight) {
    return Math.round(weight * 0.7) + "–" + Math.round(weight * 1.0) + "g / day";
  }
  if (item.id === "daily-fiber-target" && tdee) {
    return Math.round((tdee / 1000) * 14) + "g / day";
  }
  return null;
}

function renderItems(filter) {
  var filtered = (filter === "all" ? allItems : allItems.filter(function(item) { return item.topic === filter; }))
    .slice()
    .sort(function(a, b) {
      var pa = getPersonalizedDosage(a) !== null;
      var pb = getPersonalizedDosage(b) !== null;
      if (pa !== pb) return pa ? -1 : 1;
      var rank = { high: 1, medium: 2, trend: 3 };
      var ra = a.sarxPick ? 0 : rank[a.evidence] !== undefined ? rank[a.evidence] : 3;
      var rb = b.sarxPick ? 0 : rank[b.evidence] !== undefined ? rank[b.evidence] : 3;
      return ra - rb;
    });

  var list = document.getElementById("lib-list");

  if (!filtered.length) {
    list.innerHTML = '<p class="lib-empty">No items found.</p>';
    return;
  }

  var arrow = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" width="14" height="14" aria-hidden="true"><path d="M9 18l6-6-6-6"/></svg>';

  list.innerHTML = filtered.map(function(item, i) {
    var personalized = getPersonalizedDosage(item);
    var dosageDisplay = personalized || item.dosage;
    var meta = item.topicLabel.toUpperCase() + (dosageDisplay ? " • " + dosageDisplay : "");
    var evClass = "topic-evidence evidence-" + item.evidence;
    var evLabel = item.evidence === "high" ? "HIGH EVIDENCE" : item.evidence === "medium" ? "MED EVIDENCE" : "TREND";
    var badge = personalized
      ? '<span class="lib-personalized-badge">PERSONALIZED</span>'
      : item.sarxPick
        ? '<span class="lib-pick-badge">SARX PICK</span>'
        : '<span class="' + evClass + '"><span class="topic-evidence-dot"></span>' + evLabel + '</span>';
    var style = "animation-delay:" + (i * 0.04) + "s";
    return '<a class="lib-card" href="/learning/item/?id=' + item.id + '" style="' + style + '">' +
      '<div class="lib-icon">' + item.emoji + '</div>' +
      '<div class="lib-card-body">' +
        '<p class="lib-card-title">' + item.title + '</p>' +
        '<p class="lib-card-meta">' + meta + '</p>' +
      '</div>' +
      '<div class="lib-card-right">' + badge + arrow + '</div>' +
    '</a>';
  }).join("");
}

document.addEventListener("DOMContentLoaded", function() {
  renderItems("all");

  document.getElementById("lib-filters").addEventListener("click", function(e) {
    var btn = e.target.closest(".lib-filter");
    if (!btn) return;
    document.querySelectorAll(".lib-filter").forEach(function(b) { b.classList.remove("active"); });
    btn.classList.add("active");
    renderItems(btn.dataset.filter);
  });
});
