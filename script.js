let activities = {
    low: [],
    medium: [],
    high: []
};

if (localStorage.getItem("activities")) {
    activities = JSON.parse(localStorage.getItem("activities"));
}

function saveActivities() {
    localStorage.setItem("activities", JSON.stringify(activities));
}

const categoryNames = {
    low: "$",
    medium: "$$",
    high: "$$$"
};

let drawnCategory = null;

// -------- Budget ziehen + Highlight --------
function drawCategory() {
    const wheel = document.getElementById("wheel");
    wheel.classList.remove("flash-green", "flash-yellow", "flash-red");

    setTimeout(() => {
        const random = Math.random() * 100;
        if (random < 60) drawnCategory = "low";
        else if (random < 90) drawnCategory = "medium";
        else drawnCategory = "high";

        wheel.innerText = `Budget: ${categoryNames[drawnCategory]}`;

        // Farbiges Blitzen
        if (drawnCategory === "low") wheel.classList.add("flash-green");
        if (drawnCategory === "medium") wheel.classList.add("flash-yellow");
        if (drawnCategory === "high") wheel.classList.add("flash-red");

        setTimeout(() => {
            wheel.classList.remove("flash-green", "flash-yellow", "flash-red");
        }, 500);
    }, 300);
}

// -------- Slot-Animation --------
function drawActivity() {
    const slot = document.getElementById("slot");

    if (!drawnCategory) {
        alert("Bitte erst eine Budgetklasse ziehen.");
        return;
    }

    if (activities[drawnCategory].length === 0) {
        alert("Keine Aktivitäten in dieser Kategorie.");
        return;
    }

    // Mini Slot-Scrolling
    let count = 0;
    let interval = setInterval(() => {
        slot.innerText = activities[drawnCategory][Math.floor(Math.random() * activities[drawnCategory].length)] || "🔄";
        count++;
        if (count >= 10) {
            clearInterval(interval);
            const randomIndex = Math.floor(Math.random() * activities[drawnCategory].length);
            const activity = activities[drawnCategory][randomIndex];
            slot.innerText = activity;
            activities[drawnCategory].splice(randomIndex, 1);
            saveActivities();
            displayActivities();
        }
    }, 100);
}

// -------- Aktivität hinzufügen --------
function addActivity() {
    const category = document.getElementById("newCategory").value;
    const newActivity = document.getElementById("newActivity").value.trim();

    if (newActivity) {
        activities[category].push(newActivity);
        saveActivities();
        displayActivities();
        document.getElementById("newActivity").value = "";
    } else {
        alert("Bitte eine Aktivität eingeben.");
    }
}

// -------- Einzel-Aktivität löschen (mit Passwort) --------
function deleteActivity(category, index) {
    const password = prompt("Zum Löschen bitte Passwort eingeben:");
    if (password === "xd") {
        activities[category].splice(index, 1);
        saveActivities();
        displayActivities();
    } else if (password !== null) {
        alert("Falsches Passwort!");
    }
}

// -------- Anzeige --------
function displayActivities() {
    const activityDiv = document.getElementById("activityList");
    activityDiv.innerHTML = "";

    for (const category in activities) {
        const catTitle = document.createElement("h3");
        catTitle.innerText = `Kategorie ${categoryNames[category]}`;
        activityDiv.appendChild(catTitle);

        const ul = document.createElement("ul");
        activities[category].forEach((activity, index) => {
            const li = document.createElement("li");
            li.innerText = activity + " ";
            li.style.color =
                category === "low" ? "green" :
                category === "medium" ? "orange" : "red";

            const deleteBtn = document.createElement("button");
            deleteBtn.innerText = "🗑️";
            deleteBtn.style.marginLeft = "5px";
            deleteBtn.onclick = () => deleteActivity(category, index);
            li.appendChild(deleteBtn);
            ul.appendChild(li);
        });
        activityDiv.appendChild(ul);
    }
}

// -------- Reset --------
function resetActivities() {
    if (confirm("Alle Aktivitäten löschen?")) {
        activities = { low: [], medium: [], high: [] };
        saveActivities();
        displayActivities();
        alert("Alle Aktivitäten wurden gelöscht.");
    }
}

displayActivities();
