document.addEventListener("DOMContentLoaded", function () {
  const startButton = document.getElementById("startButton");
  const message = document.getElementById("message");
  const assessment = document.getElementById("assessment");
  const securityForm = document.getElementById("securityForm");
  const results = document.getElementById("results");

  const scoreDisplay = document.getElementById("score");
  const scoreLevel = document.getElementById("scoreLevel");
  const scoreExplanation = document.getElementById("scoreExplanation");
  const recommendations = document.getElementById("recommendations");

  const actionChecklist = document.getElementById("actionChecklist");
  const checklistProgress = document.getElementById("checklistProgress");
  const progressBar = document.getElementById("progressBar");
  const retakeButton = document.getElementById("retakeButton");

  const storageKey = "personalSecurityChecklist";

  const advice = {
    q1: "Use unique passwords for important accounts. Consider a reputable password manager.",
    q2: "Enable multifactor authentication on important accounts where available.",
    q3: "Set a secure screen lock on your smartphone and computer.",
    q4: "Install operating system and app updates promptly.",
    q5: "Review app permissions and remove access that is not needed.",
    q6: "Review social media privacy settings and limit public visibility.",
    q7: "Check suspicious messages carefully. Avoid unexpected links and verify requests.",
    q8: "Back up important files and photos, and check that you can restore them.",
    q9: "Review account recovery options and learn how to secure a compromised account.",
    q10: "Limit the personal information you share publicly online."
  };

  // Open the assessment.
  startButton.addEventListener("click", function () {
    assessment.hidden = false;
    message.textContent = "Please answer all 10 questions.";
    assessment.scrollIntoView({ behavior: "smooth" });
  });

  // Read saved checklist progress from this browser.
  function readSavedProgress() {
    try {
      return JSON.parse(localStorage.getItem(storageKey)) || {};
    } catch (error) {
      return {};
    }
  }

  // Save checklist progress in this browser.
  function saveProgress(progress) {
    try {
      localStorage.setItem(storageKey, JSON.stringify(progress));
    } catch (error) {
      // The checklist still works if browser storage is unavailable.
    }
  }

  // Update the checklist completion count and progress bar.
  function updateProgress() {
    const checkboxes = actionChecklist.querySelectorAll(
      'input[type="checkbox"]'
    );

    const completed = Array.from(checkboxes).filter(
      function (checkbox) {
        return checkbox.checked;
      }
    ).length;

    const total = checkboxes.length;
    const percentage = total === 0
      ? 0
      : Math.round((completed / total) * 100);

    checklistProgress.textContent =
      completed + " of " + total + " actions completed";

    progressBar.value = percentage;
  }

  // Build the action checklist.
  function buildChecklist(actions) {
    const savedProgress = readSavedProgress();

    actionChecklist.replaceChildren();

    actions.forEach(function (action, index) {
      const item = document.createElement("li");
      const label = document.createElement("label");
      const checkbox = document.createElement("input");
      const text = document.createElement("span");

      checkbox.type = "checkbox";
      checkbox.id = "action" + index;
      checkbox.checked = savedProgress[action] === true;

      text.textContent = action;

      checkbox.addEventListener("change", function () {
        const currentProgress = readSavedProgress();
        currentProgress[action] = checkbox.checked;
        saveProgress(currentProgress);
        updateProgress();
      });

      label.htmlFor = checkbox.id;
      label.append(checkbox, text);
      item.appendChild(label);
      actionChecklist.appendChild(item);
    });

    updateProgress();
  }

  // Calculate the score and show personalised results.
  securityForm.addEventListener("submit", function (event) {
    event.preventDefault();

    let saferPractices = 0;
    const totalQuestions = 10;
    const actions = [];

    for (let i = 1; i <= totalQuestions; i++) {
      const answer = securityForm.querySelector(
        'input[name="q' + i + '"]:checked'
      );

      if (answer && answer.value === "yes") {
        saferPractices++;
      } else {
        actions.push(advice["q" + i]);
      }
    }

    const score = Math.round(
      (saferPractices / totalQuestions) * 100
    );

    scoreDisplay.textContent = score + " / 100";

    if (score < 40) {
      scoreLevel.textContent = "Needs improvement";
      scoreExplanation.textContent =
        "Start with the recommended actions below. Focus on one or two important changes at a time.";
    } else if (score < 70) {
      scoreLevel.textContent = "Developing safer habits";
      scoreExplanation.textContent =
        "You reported some safer practices. Work through the recommendations to strengthen your habits.";
    } else {
      scoreLevel.textContent = "Good reported practices";
      scoreExplanation.textContent =
        "You reported many of the safer practices covered by this questionnaire. Review the remaining recommendations and keep your security measures up to date.";
    }

    recommendations.replaceChildren();

    if (actions.length === 0) {
      const item = document.createElement("li");
      item.textContent =
        "You reported all the safer practices covered by this assessment. Continue reviewing your settings, updating your devices and checking your recovery options.";
      recommendations.appendChild(item);

      actions.push(
        "Review your privacy settings and device updates regularly."
      );
    } else {
      actions.forEach(function (action) {
        const item = document.createElement("li");
        item.textContent = action;
        recommendations.appendChild(item);
      });
    }

    buildChecklist(actions);

    results.hidden = false;
    results.scrollIntoView({ behavior: "smooth" });
  });

  // Start the assessment again.
  retakeButton.addEventListener("click", function () {
    securityForm.reset();
    results.hidden = true;
    assessment.hidden = false;
    message.textContent =
      "Start again by answering all 10 questions.";
    assessment.scrollIntoView({ behavior: "smooth" });
  });

  // Hide old results when the questionnaire is cleared.
  securityForm.addEventListener("reset", function () {
    results.hidden = true;
  });
});