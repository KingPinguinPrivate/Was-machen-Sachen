// --- Firebase Initialisierung ---
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// Lokale Kopie der Aktivitäten
let activities = {
    low: [],
    medium: [],
    high: []
};

const categoryNames = {
    low: "$",
    medium: "$$",
    high: "$$$"
};

let drawnCategory = null;

// --------- Echtzeit Sync ---------
db.ref("activities").on("value", (snapshot) => {
    activities = snapshot.val() || { low: [], medium: [], high: [] };
    displayActivities();
});

// --------- Budget ziehen ---------
function drawCategory() {
    const wheel = document.getElementById("wheel");
    wheel.style.transform = "rotate(10deg)";
    setTimeout(() => {
        wheel.style.transform = "rotate(0deg)";
        const random = Math.random() * 100;
        if (random < 60) drawnCategory = "low";
        else if (random < 90) drawnCategory = "medium";
        else drawnCategory = "high";

        // Farb-Flash
        wheel.style.backgroundColor =
            drawnCategory === "low" ? "lightgreen" :
            drawnCategory === "medium" ? "gold" :
            "lightcoral";

        setTimeout(() => wheel.style.backgroundColor = "", 500);

        wheel.innerText = `Budget: ${categoryNames[drawnCategory]}`;
    }, 300);
}

// --------- Slot Ziehen ---------
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

    // Slot Mini-Animation
    let count = 0;
    let interval = setInterval(() => {
        slot.innerText = activities[drawnCategory][Math.floor(Math.random() * activities[drawnCategory].length)] || "🔄";
        count++;
        if (count >= 10) {
            clearInterval(interval);
            const randomIndex = Math.floor(Math.random() * activities[drawnCategory].length);
            const activity = activities[drawnCategory][randomIndex];
            slot.innerText = activity;

            // Aus der Datenbank löschen
            activities[drawnCategory].splice(randomIndex, 1);
            db.ref("activities").set(activities);
        }
    }, 100);
}

// --------- Neue Aktivität hinzufügen ---------
function addActivity() {
    const category = document.getElementById("newCategory").value;
    const newActivity = document.getElementById("newActivity").value.trim();

    if (newActivity) {
        activities[category].push(newActivity);
        db.ref("activities").set(activities);
        document.getElementById("newActivity").value = "";
    } else {
        alert("Bitte eine Aktivität eingeben.");
    }
}

// --------- Einzel-Aktivität löschen (mit Passwort) ---------
function deleteActivity(category, index) {
    const password = prompt("Zum Löschen bitte Passwort eingeben:");
    if (password === "xd") {
        activities[category].splice(index, 1);
        db.ref("activities").set(activities);
    } else if (password !== null) {
        alert("Falsches Passwort!");
    }
}

// --------- Anzeige ---------
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

// --------- Reset (komplett löschen) ---------
function resetActivities() {
    if (confirm("Alle Aktivitäten löschen?")) {
        activities = { low: [], medium: [], high: [] };
        db.ref("activities").set(activities);
        alert("Alle Aktivitäten wurden gelöscht.");
    }
}
