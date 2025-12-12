// public/script.js (Korrigierte Version)



// formular für Zeiten
document.getElementById("appointmentForm2").addEventListener("submit", async (e) => {
    e.preventDefault();

    const zeitpunkt = document.getElementById("zeitpunkt").value;

    const response = await fetch("/api/zeiten", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ zeitpunkt })
    });

    const result = await response.json();
    document.getElementById("message-area2").innerText = result.message;
});


// Debugging
console.log("script.js geladen");

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM ready");

  const form = document.getElementById("appointmentForm2");
  const input = document.getElementById("zeitpunkt");

  if (!form) console.error("Formular nicht gefunden (appointmentForm2)");
  if (!input) console.error("Input nicht gefunden (zeitpunkt)");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const zeitpunkt = input.value;
    console.log("Form submitted, zeitpunkt =", zeitpunkt);

    try {
      const res = await fetch("/api/zeiten", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ zeitpunkt })
      });

      console.log("Fetch response status:", res.status);
      const json = await res.json().catch(() => null);
      console.log("Fetch response body:", json);

      document.getElementById("message-area2").innerText = json?.message || JSON.stringify(json) || `Status: ${res.status}`;
    } catch (err) {
      console.error("Fetch error:", err);
      document.getElementById("message-area2").innerText = "Fehler beim Senden: " + err.message;
    }
  });
});


// Ende neu