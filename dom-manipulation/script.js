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

  // If no quotes in storage, load default quotes
  if (quotes.length === 0) {
    loadDefaultQuotes();
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

// Main sync function
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
      localStorage.setItem("quotes", JSON.stringify(quotes));
      populateCategories();

      if (conflicts.length > 0) {
        showConflictNotification(conflicts);
        updateSyncStatus(
          "Quotes synced with server! " +
            `${conflicts.length} conflicts resolved.`,
          "success"
        );
      } else {
        updateSyncStatus("Quotes synced with server!", "success");
      }
    } else {
      updateSyncStatus("Quotes already up to date with server.", "success");
    }

    lastSyncTime = new Date();
  } catch (error) {
    console.error("Sync failed:", error);
    updateSyncStatus("Sync failed. Will retry.", "error");
  } finally {
    syncInProgress = false;
  }
}

function showConflictNotification(conflicts) {
  if (conflictNotification) {
    conflictNotification.remove();
  }

  conflictNotification = document.createElement("div");
  conflictNotification.className = "conflict-notification";

  const conflictHeader = document.createElement("h4");
  conflictHeader.textContent = `${conflicts.length} conflict(s) resolved:`;
  conflictNotification.appendChild(conflictHeader);

  const conflictList = document.createElement("ul");
  conflicts.forEach((conflict) => {
    const item = document.createElement("li");
    item.innerHTML = `
      <p><strong>Server version:</strong> "${conflict.server.text}" (${conflict.server.category})</p>
      <p><strong>Your version:</strong> "${conflict.local.text}" (${conflict.local.category})</p>
      <p>Server version was kept.</p>
    `;
    conflictList.appendChild(item);
  });

  conflictNotification.appendChild(conflictList);

  const closeButton = document.createElement("button");
  closeButton.textContent = "Dismiss";
  closeButton.onclick = () => conflictNotification.remove();
  conflictNotification.appendChild(closeButton);

  document.body.appendChild(conflictNotification);

  setTimeout(() => {
    if (conflictNotification && conflictNotification.parentNode) {
      conflictNotification.remove();
    }
  }, 10000);
}

function updateSyncStatus(message, type = "info") {
  syncStatus.textContent = `Sync Status: ${message}`;
  syncStatus.className = `sync-status sync-${type}`;

  const existingTime = syncStatus.querySelector(".sync-time");
  if (existingTime) {
    existingTime.remove();
  }

  if (lastSyncTime) {
    const timeElement = document.createElement("span");
    timeElement.className = "sync-time";
    timeElement.textContent = ` (Last sync: ${new Date(
      lastSyncTime
    ).toLocaleTimeString()})`;
    syncStatus.appendChild(timeElement);
  }
}

function loadDefaultQuotes() {
  quotes = [
    {
      id: 1,
      text: "The only way to do great work is to love what you do.",
      category: "inspiration",
      serverVersion: 1,
      updatedAt: new Date().toISOString(),
    },
    {
      id: 2,
      text: "Innovation distinguishes between a leader and a follower.",
      category: "business",
      serverVersion: 1,
      updatedAt: new Date().toISOString(),
    },
    {
      id: 3,
      text: "Your time is limited, don't waste it living someone else's life.",
      category: "life",
      serverVersion: 1,
      updatedAt: new Date().toISOString(),
    },
    {
      id: 4,
      text: "Stay hungry, stay foolish.",
      category: "inspiration",
      serverVersion: 1,
      updatedAt: new Date().toISOString(),
    },
    {
      id: 5,
      text: "The greatest glory in living lies not in never falling, but in rising every time we fall.",
      category: "life",
      serverVersion: 1,
      updatedAt: new Date().toISOString(),
    },
    {
      id: 6,
      text: "The way to get started is to quit talking and begin doing.",
      category: "motivation",
      serverVersion: 1,
      updatedAt: new Date().toISOString(),
    },
    {
      id: 7,
      text: "Life is what happens when you're busy making other plans.",
      category: "life",
      serverVersion: 1,
      updatedAt: new Date().toISOString(),
    },
    {
      id: 8,
      text: "The future belongs to those who believe in the beauty of their dreams.",
      category: "inspiration",
      serverVersion: 1,
      updatedAt: new Date().toISOString(),
    },
  ];
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

function loadQuotes() {
  const storedQuotes = localStorage.getItem("quotes");
  if (storedQuotes) {
    quotes = JSON.parse(storedQuotes);
  }
  sessionStorage.setItem("lastLoaded", new Date().toISOString());
}

function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

function clearLocalStorage() {
  if (confirm("Are you sure you want to clear all saved quotes?")) {
    localStorage.removeItem("quotes");
    sessionStorage.removeItem("lastFilter");
    sessionStorage.removeItem("lastLoaded");
    quotes = [];
    loadDefaultQuotes();
    populateCategories();
    showRandomQuote();
    alert("Local storage cleared. Default quotes loaded.");
  }
}

function populateCategories() {
  while (categoryFilterSelect.options.length > 1) {
    categoryFilterSelect.remove(1);
  }

  const categories = [...new Set(quotes.map((quote) => quote.category))];

  categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categoryFilterSelect.appendChild(option);
  });
}

function filterQuotes() {
  const selectedCategory = categoryFilterSelect.value;
  currentFilter = selectedCategory === "all" ? null : selectedCategory;
  sessionStorage.setItem("lastFilter", selectedCategory);
  showRandomQuote();
}

function clearFilter() {
  categoryFilterSelect.value = "all";
  currentFilter = null;
  sessionStorage.removeItem("lastFilter");
  showRandomQuote();
}

function showRandomQuote() {
  let filteredQuotes = quotes;

  if (currentFilter) {
    filteredQuotes = quotes.filter((quote) => quote.category === currentFilter);
  }

  if (filteredQuotes.length === 0) {
    quoteDisplay.innerHTML = currentFilter
      ? `<div class="no-quotes">No quotes found in category "${currentFilter}"</div>`
      : '<div class="no-quotes">No quotes available</div>';
    return;
  }

  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const randomQuote = filteredQuotes[randomIndex];

  quoteDisplay.innerHTML = `
    <div id="quoteText">"${randomQuote.text}"</div>
    <div id="quoteCategory">— ${randomQuote.category}</div>
  `;

  sessionStorage.setItem("lastViewedQuote", JSON.stringify(randomQuote));
}

function createAddQuoteForm() {
  const existingForm = document.getElementById("addQuoteForm");
  if (existingForm) {
    existingForm.remove();
  }

  const formContainer = document.createElement("div");
  formContainer.id = "addQuoteForm";
  formContainer.className = "form-container";

  const heading = document.createElement("h3");
  heading.textContent = "Add a new quote:";
  formContainer.appendChild(heading);

  const quoteInput = document.createElement("input");
  quoteInput.id = "newQuoteText";
  quoteInput.type = "text";
  quoteInput.placeholder = "Enter a new quote";
  formContainer.appendChild(quoteInput);

  const categoryInput = document.createElement("input");
  categoryInput.id = "newQuoteCategory";
  categoryInput.type = "text";
  categoryInput.placeholder = "Enter quote category";
  formContainer.appendChild(categoryInput);

  const submitButton = document.createElement("button");
  submitButton.textContent = "Add Quote";
  submitButton.onclick = addQuote;
  formContainer.appendChild(submitButton);

  quoteControlsContainer.appendChild(formContainer);
}

function addQuote() {
  const newQuoteText = document.getElementById("newQuoteText").value;
  const newQuoteCategory = document.getElementById("newQuoteCategory").value;

  if (newQuoteText && newQuoteCategory) {
    const category = newQuoteCategory.toLowerCase();
    const newQuote = {
      id: Date.now(),
      text: newQuoteText,
      category: category,
      serverVersion: 0,
      updatedAt: new Date().toISOString(),
    };

    quotes.push(newQuote);
    localStorage.setItem("quotes", JSON.stringify(quotes));

    if (
      ![...categoryFilterSelect.options].some((opt) => opt.value === category)
    ) {
      const option = document.createElement("option");
      option.value = category;
      option.textContent = category;
      categoryFilterSelect.appendChild(option);
    }

    document.getElementById("newQuoteText").value = "";
    document.getElementById("newQuoteCategory").value = "";

    currentFilter = null;
    categoryFilterSelect.value = "all";
    showRandomQuote();

    setTimeout(syncQuotes, 1000);

    alert("Quote added successfully!");
  } else {
    alert("Please enter both quote text and category.");
  }
}

function exportToJson() {
  const data = JSON.stringify(quotes, null, 2);
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  document.body.appendChild(a);
  a.click();

  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
}

function importFromJson() {
  const file = importFileInput.files[0];
  if (!file) {
    alert("Please select a file first.");
    return;
  }

  const fileReader = new FileReader();
  fileReader.onload = function (event) {
    try {
      const importedQuotes = JSON.parse(event.target.result);

      if (!Array.isArray(importedQuotes)) {
        throw new Error("Invalid format: Expected an array of quotes");
      }

      for (const quote of importedQuotes) {
        if (!quote.text || !quote.category) {
          throw new Error(
            "Invalid quote format: Each quote must have text and category"
          );
        }
      }

      quotes.push(...importedQuotes);
      localStorage.setItem("quotes", JSON.stringify(quotes));
      populateCategories();
      showRandomQuote();

      importFileInput.value = "";

      alert(`Successfully imported ${importedQuotes.length} quotes!`);
    } catch (error) {
      alert(`Error importing quotes: ${error.message}`);
    }
  };
  fileReader.onerror = function () {
    alert("Error reading file");
  };
  fileReader.readAsText(file);
}

// Initialize the app when the page loads
document.addEventListener("DOMContentLoaded", init);
