// Variable to track the selected room
let selectedRoom = null;

document
  .getElementById("searchForm")
  .addEventListener("submit", function (event) {
    event.preventDefault(); // Prevents page reload/navigation

    const query = document
      .getElementById("searchInput")
      .value.trim()
      .toLowerCase(); // Grab, trim, and lowercase input
    if (!query) {
      document.getElementById("results").innerHTML =
        '<p class="no-results">No search term entered.</p>';
      return;
    }

    // Get the selected room button
    const selectedButton = document.querySelector(".room-button.selected");
    if (!selectedButton) {
      document.getElementById("results").innerHTML =
        '<p class="no-results">Please select a room first.</p>';
      return;
    }
    const room = selectedButton.getAttribute("data-room");

    // Clear previous results and show loading
    document.getElementById("results").innerHTML =
      '<p class="loading">Searching...</p>';

    // Build the URL: /search?q=gloves&room=little_blue
    const url = `/search?q=${encodeURIComponent(
      query
    )}&room=${encodeURIComponent(room)}`;

    fetch(url) // Send GET request to your /search route
      .then((response) => response.json()) // Parse the JSON response
      .then((supplies) => {
        let html = ""; // Start with header and styled list
        if (supplies.length === 0) {
          html += `<li class="no-results">I couldn't find "${query}" in ${selectedButton.textContent}. Try one of the following options: 1) Select another room above (what you're looking for may have been moved by the storekeepers) or 2) Click on the "Should something be renamed?" button to provide feedback on the supplies' names.</li>`;
        } else {
          html += "<ul>";
          // Group by item name
          const groupedSupplies = {};
          supplies.forEach((supply) => {
            const [name, shelf, level] = supply; // No room in response
            if (!groupedSupplies[name]) groupedSupplies[name] = [];
            groupedSupplies[name].push({ shelf, level });
          });

          for (const [name, locations] of Object.entries(groupedSupplies)) {
            html += `<li class="result-item">`;
            html += `
              <table class="table">
                <tbody>`;
            locations.forEach(({ shelf, level }) => {
              html += `
                <tr>
                  <td><strong>Item</strong></td>
                  <td><strong>Shelf</strong></td>
                  <td><strong>Level</strong></td>
                </tr>
                <tr>
                  <td>${name}</td>
                  <td>${shelf}</td>
                  <td>${level}</td>
                </tr>`;
            });
            html += `</tbody></table>`;
            html += `</li>`;
          }
          html += "</ul>";
        }
        document.getElementById("results").innerHTML = html; // Insert below search bar
      })
      .catch((error) => {
        console.error("Error:", error);
        document.getElementById("results").innerHTML =
          '<p class="error">Apologies. This service does not seem to be working at the moment.</p>';
      });
  });

// Add event listener for room button selection
document.querySelectorAll(".room-button").forEach((button) => {
  button.addEventListener("click", function () {
    // Remove selected class from all buttons
    document.querySelectorAll(".room-button").forEach((btn) => {
      btn.classList.remove("selected");
    });
    // Add selected class to clicked button
    this.classList.add("selected");
    selectedRoom = this.getAttribute("data-room"); // Update tracked room
  });
});

// Optional: Restore selected button on page load or refresh (if URL has room param)
window.addEventListener("load", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const roomFromUrl = urlParams.get("room");
  if (roomFromUrl) {
    const button = document.querySelector(
      `.room-button[data-room="${roomFromUrl}"]`
    );
    if (button) {
      document
        .querySelectorAll(".room-button")
        .forEach((btn) => btn.classList.remove("selected"));
      button.classList.add("selected");
      selectedRoom = roomFromUrl;
    }
  } else {
    // If no room parameter, ensure no button is selected
    document
      .querySelectorAll(".room-button")
      .forEach((btn) => btn.classList.remove("selected"));
  }
});
