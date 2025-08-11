// Quotes database - will be loaded from localStorage
let quotes = [];
let currentFilter = null;
let lastSyncTime = null;
let syncInterval = 30000; // Sync every 30 seconds
let syncInProgress = false;
let conflictNotification = null;

// DOM elements
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteButton = document.getElementById("newQuote");
const quoteControlsContainer = document.getElementById("quoteControls");
const exportQuotesButton = document.getElementById("exportQuotes");
const clearStorageButton = document.getElementById("clearStorage");
const manualSyncButton = document.getElementById("manualSync");
const importFileInput = document.getElementById("importFile");
const categoryFilterSelect = document.getElementById("categoryFilter");
const clearFilterButton = document.getElementById("clearFilter");
const syncStatus = document.getElementById("syncStatus");

// Server simulation endpoint
const SERVER_URL = "https://jsonplaceholder.typicode.com/posts";

// Initialize the app
async function init() {
  // Load quotes from localStorage
  loadQuotes();

  // If no quotes in storage, try loading from server
  if (quotes.length === 0) {
    await syncWithServer();
  } else {
    // Still check for updates from server
    setTimeout(syncWithServer, 2000);
  }

  // Setup event listeners
  newQuoteButton.addEventListener("click", showRandomQuote);
  exportQuotesButton.addEventListener("click", exportToJson);
  clearStorageButton.addEventListener("click", clearLocalStorage);
  clearFilterButton.addEventListener("click", clearFilter);
  categoryFilterSelect.addEventListener("change", filterQuotes);
  manualSyncButton.addEventListener("click", syncWithServer);

  // Create the add quote form dynamically
  createAddQuoteForm();

  // Set up periodic sync
  setInterval(syncWithServer, syncInterval);

  // Display first quote
  showRandomQuote();

  updateSyncStatus("Local data loaded. Syncing with server...");
}

// Fetch quotes from server
async function fetchQuotesFromServer() {
  try {
    updateSyncStatus("Checking for server updates...");
    const response = await fetch(SERVER_URL, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) throw new Error("Server error");
    const serverData = await response.json();

    // Transform server data to our quote format
    return serverData.slice(0, 10).map((post) => ({
      id: post.id,
      text: post.title,
      category: "server",
      serverVersion: 1,
      updatedAt: new Date().toISOString(),
    }));
  } catch (error) {
    updateSyncStatus("Server unavailable. Using local data.", "error");
    return null;
  }
}

// Simulate server post
async function postToServer(quotesToSync) {
  try {
    updateSyncStatus("Sending updates to server...");
    const response = await fetch(SERVER_URL, {
      method: "POST",
      body: JSON.stringify(quotesToSync),
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) throw new Error("Server error");
    return await response.json();
  } catch (error) {
    updateSyncStatus("Failed to update server. Will retry.", "error");
    return null;
  }
}

// [Rest of the functions remain exactly the same as in the previous implementation]
// ... (all other functions remain unchanged)

// Initialize the app when the page loads
document.addEventListener("DOMContentLoaded", init);
