// --- script.js ---

// Firebase bereits in index.html initialisiert

const categoryNames = {
    low: "$",
    medium: "$$",
    high: "$$$"
};

let drawnCategory = null;

// Auto-Fix: Kategorien immer sicherstellen
firebase.database().ref("activities").once("value", (snapshot) => {
    const data = snapshot.val() || {};
    if (!data.low) firebase.database().ref("activities/low").set([]);
    if (!data.medium) firebase.database().ref("activities/medium").set([]);
    if (!data.high) firebase.database().ref("activities/high").set([]);
});

// Budget ziehen + Farbflash
function drawCategory() {
    const wheel = document.getElementById("wheel");
    wheel.style.transform = "rotate(10deg)";
    setTimeout(() => {
        wheel.style.transform = "rotate(0deg)";
        const random = Math.random() * 100;
        if (random < 60) drawnCategory = "low";
        else if (random < 90) drawnCategory = "medium";
        else drawnCategory = "high";

        wheel.style.backgroundColor =
            drawnCategory === "low" ? "lightgreen" :
            drawnCategory === "medium" ? "gold" :
            "lightcoral";

        setTimeout(() => wheel.style.backgroundColor = "", 500);
        wheel.innerText = `Budget: ${categoryNames[drawnCategory]}`;
    }, 300);
}

// Slot-Animation
function drawActivity() {
    const slot = document.getElementById("slot");

    if (!drawnCategory) {
        alert("Bitte erst eine Budgetklasse ziehen.");
        return;
    }

    firebase.database().ref("activities/" + drawnCategory).once("value", (snapshot) => {
        const list = snapshot.val() || [];

        if (list.length === 0) {
            alert("Keine Aktivitäten in dieser Kategorie.");
            return;
        }

        let count = 0;
        let interval = setInterval(() => {
            slot.innerText = list[Math.floor(Math.random() * list.length)] || "🔄";
            count++;
            if (count >= 10) {
                clearInterval(interval);
                const randomIndex = Math.floor(Math.random() * list.length);
                const activity = list[randomIndex];
                slot.innerText = activity;
                list.splice(randomIndex, 1);
                firebase.database().ref("activities/" + drawnCategory).set(list);
            }
        }, 100);
    });
}

// Neue Aktivität
function addActivity() {
    const category = document.getElementById("newCategory").value;
    const newActivity = document.getElementById("newActivity").value.trim();

    if (!newActivity) {
        alert("Bitte eine Aktivität eingeben.");
        return;
    }

    firebase.database().ref("activities/" + category).once("value", (snapshot) => {
        const list = snapshot.val() || [];
        list.push(newActivity);
        firebase.database().ref("activities/" + category).set(list);
        document.getElementById("newActivity").value = "";
    });
}

// Einzelne Aktivität löschen
function deleteActivity(category, index) {
    const password = prompt("Zum Löschen bitte Passwort eingeben:");
    if (password !== "xd") {
        if (password !== null) alert("Falsches Passwort!");
        return;
    }

    firebase.database().ref("activities/" + category).once("value", (snapshot) => {
        const list = snapshot.val() || [];
        list.splice(index, 1);
        firebase.database().ref("activities/" + category).set(list);
    });
}

// Anzeige
function displayActivities() {
    const activityDiv = document.getElementById("activityList");
    activityDiv.innerHTML = "";

    for (const category in categoryNames) {
        const catTitle = document.createElement("h3");
        catTitle.innerText = `Kategorie ${categoryNames[category]}`;
        activityDiv.appendChild(catTitle);

        const ul = document.createElement("ul");

        firebase.database().ref("activities/" + category).once("value", (snapshot) => {
            const list = snapshot.val() || [];
            list.forEach((activity, index) => {
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
        });
    }
}

// Reset
function resetActivities() {
    if (confirm("Alle Aktivitäten löschen?")) {
        firebase.database().ref("activities/low").set([]);
        firebase.database().ref("activities/medium").set([]);
        firebase.database().ref("activities/high").set([]);
        alert("Alle Aktivitäten wurden gelöscht.");
        displayActivities();
    }
}

// Live-Updater
firebase.database().ref("activities").on("value", displayActivities);