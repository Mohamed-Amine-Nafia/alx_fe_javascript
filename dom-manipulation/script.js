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
    await syncQuotes();
  } else {
    // Still check for updates from server
    setTimeout(syncQuotes, 2000);
  }

  // Setup event listeners
  newQuoteButton.addEventListener("click", showRandomQuote);
  exportQuotesButton.addEventListener("click", exportToJson);
  clearStorageButton.addEventListener("click", clearLocalStorage);
  clearFilterButton.addEventListener("click", clearFilter);
  categoryFilterSelect.addEventListener("change", filterQuotes);
  manualSyncButton.addEventListener("click", syncQuotes);

  // Create the add quote form dynamically
  createAddQuoteForm();

  // Set up periodic sync
  setInterval(syncQuotes, syncInterval);

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

// Main sync function (renamed from syncWithServer to match requirement)
async function syncQuotes() {
  if (syncInProgress) return;
  syncInProgress = true;

  try {
    const serverQuotes = await fetchQuotesFromServer();
    if (!serverQuotes) return;

    // Merge strategy: server wins conflicts
    const localQuotes = [...quotes];
    const mergedQuotes = [];
    const conflicts = [];

    // Add all server quotes (server wins)
    serverQuotes.forEach((serverQuote) => {
      const localIndex = localQuotes.findIndex((q) => q.id === serverQuote.id);
      if (localIndex >= 0) {
        // Conflict detected
        const localQuote = localQuotes[localIndex];
        if (
          localQuote.text !== serverQuote.text ||
          localQuote.category !== serverQuote.category
        ) {
          conflicts.push({
            server: serverQuote,
            local: localQuote,
          });
        }
        mergedQuotes.push(serverQuote);
        localQuotes.splice(localIndex, 1);
      } else {
        mergedQuotes.push(serverQuote);
      }
    });

    // Add remaining local quotes
    mergedQuotes.push(...localQuotes);

    // Update local storage if changes detected
    if (JSON.stringify(quotes) !== JSON.stringify(mergedQuotes)) {
      quotes = mergedQuotes;
      saveQuotes();
      populateCategories();

      if (conflicts.length > 0) {
        showConflictNotification(conflicts);
      }

      updateSyncStatus(
        `Synced with server. ${conflicts.length} conflicts resolved.`,
        "success"
      );
    } else {
      updateSyncStatus("Already up to date.", "success");
    }

    lastSyncTime = new Date();
  } catch (error) {
    console.error("Sync failed:", error);
    updateSyncStatus("Sync failed. Will retry.", "error");
  } finally {
    syncInProgress = false;
  }
}

// [All other functions remain exactly the same as in previous implementation]
// ... (showConflictNotification, updateSyncStatus, loadDefaultQuotes, etc.)

// Initialize the app when the page loads
document.addEventListener("DOMContentLoaded", init);
