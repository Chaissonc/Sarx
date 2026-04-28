function renderDesc(desc) {
  var blocks = desc.split('\n\n');
  var html = '';

  blocks.forEach(function(block, idx) {
    var lines = block.split('\n');
    var bulletLines = lines.filter(function(l) { return l.trimLeft().charAt(0) === '•'; });
    var textLines   = lines.filter(function(l) { return l.trimLeft().charAt(0) !== '•'; });
    var headerText  = textLines.join(' ').trim();

    if (bulletLines.length > 0) {
      var bulletsHTML = bulletLines.map(function(b, bi) {
        var text = b.replace(/^\s*•\s*/, '');
        var colon = text.indexOf(':');
        var inner;
        if (colon > 0 && colon < 50) {
          inner =
            '<p class="item-bullet-title">' + text.slice(0, colon) + '</p>' +
            '<p class="item-bullet-body">'  + text.slice(colon + 1).trim() + '</p>';
        } else {
          inner = '<p class="item-bullet-body">' + text + '</p>';
        }
        return '<div class="item-bullet' + (bi > 0 ? ' item-bullet-sep' : '') + '">' + inner + '</div>';
      }).join('');

      html +=
        '<div class="item-section">' +
          (headerText ? '<p class="item-section-label">' + headerText + '</p>' : '') +
          bulletsHTML +
        '</div>';

    } else if (idx === 0) {
      html += '<p class="item-intro">' + headerText + '</p>';

    } else {
      var colon = headerText.indexOf(':');
      if (colon > 0 && colon < 60) {
        html +=
          '<div class="item-section">' +
            '<p class="item-section-label">' + headerText.slice(0, colon) + '</p>' +
            '<p class="item-section-text">'  + headerText.slice(colon + 1).trim() + '</p>' +
          '</div>';
      } else {
        html += '<div class="item-section"><p class="item-section-text">' + headerText + '</p></div>';
      }
    }
  });

  return html;
}

document.addEventListener("DOMContentLoaded", function() {
  var id = new URLSearchParams(location.search).get("id");
  var item = id ? allItems.find(function(x) { return x.id === id; }) : null;
  var content = document.getElementById("item-content");

  if (!item) {
    document.title = "Not Found | Sarx";
    content.innerHTML =
      '<p class="section-tag">LEARN</p>' +
      '<h1 class="screen-title">Item not found</h1>' +
      '<p class="item-intro">This item doesn\'t exist. <a href="/learning/">Go back to the library.</a></p>';
    return;
  }

  document.title = item.title + " — " + item.topicLabel + " | Sarx";

  var evClass = "topic-evidence evidence-" + item.evidence;
  var evLabel = item.evidence === "high" ? "HIGH EVIDENCE" : item.evidence === "medium" ? "MED EVIDENCE" : "TREND";

  // Personalized dosage for protein and fiber if user data exists
  var personalizedDosage = null;
  var weight = parseFloat(localStorage.getItem("bm_weight"));
  var tdee   = parseFloat(localStorage.getItem("bm_tdee"));

  if (item.id === "daily-protein-target" && weight) {
    var low  = Math.round(weight * 0.7);
    var high = Math.round(weight * 1.0);
    personalizedDosage = low + "–" + high + "g / day";
  } else if (item.id === "daily-fiber-target" && tdee) {
    var fiber = Math.round((tdee / 1000) * 14);
    personalizedDosage = fiber + "g / day";
  }

  var displayDosage = personalizedDosage || item.dosage;
  var isPersonalized = personalizedDosage !== null;

  var badges = "";
  if (isPersonalized) {
    badges += '<span class="item-badge item-badge-personalized">PERSONALIZED</span>';
  } else if (item.sarxPick) {
    badges += '<span class="item-badge item-badge-pick">SARX PICK</span>';
  }
  if (item.trend) badges += '<span class="item-badge item-badge-trend">TREND WARNING</span>';
  badges += '<span class="item-badge ' + evClass + '"><span class="topic-evidence-dot"></span>' + evLabel + '</span>';

  var dosageCard = "";
  if (displayDosage || item.when) {
    dosageCard =
      '<div class="item-dosage-card">' +
        (displayDosage ? '<div class="item-dosage-cell"><span class="item-dosage-label">' + (isPersonalized ? 'YOUR TARGET' : 'DOSE') + '</span><span class="item-dosage-value">' + displayDosage + '</span></div>' : '') +
        (item.when     ? '<div class="item-dosage-cell"><span class="item-dosage-label">TIMING</span><span class="item-dosage-value">' + item.when + '</span></div>' : '') +
      '</div>';
  }

  var trendWarning = item.trend
    ? '<div class="item-trend-warning"><strong>Trend Warning:</strong> This is currently popular online but has limited or mixed clinical evidence. Use caution before adding it to your routine.</div>'
    : "";

  content.innerHTML =
    '<p class="section-tag">' + item.topicLabel.toUpperCase() + '</p>' +
    '<div class="item-header">' +
      '<span class="item-emoji">' + item.emoji + '</span>' +
      '<h1 class="screen-title" style="margin-bottom:8px">' + item.title + '</h1>' +
    '</div>' +
    '<div class="item-badges">' + badges + '</div>' +
    dosageCard +
    trendWarning +
    '<div class="item-body">' + renderDesc(item.desc) + '</div>';
});
