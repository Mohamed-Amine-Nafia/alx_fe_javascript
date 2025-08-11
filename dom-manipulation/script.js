// Quotes database - will be loaded from localStorage
let quotes = [];

// DOM elements
const quoteTextElement = document.getElementById("quoteText");
const quoteCategoryElement = document.getElementById("quoteCategory");
const newQuoteButton = document.getElementById("newQuote");
const categoryButtonsContainer = document.getElementById("categoryButtons");
const quoteControlsContainer = document.getElementById("quoteControls");
const exportQuotesButton = document.getElementById("exportQuotes");
const clearStorageButton = document.getElementById("clearStorage");
const importFileInput = document.getElementById("importFile");

// Current category filter
let currentCategory = null;

// Initialize the app
function init() {
  // Load quotes from localStorage
  loadQuotes();

  // If no quotes in storage, load default quotes
  if (quotes.length === 0) {
    loadDefaultQuotes();
  }

  // Display first quote
  showRandomQuote();

  // Setup event listeners
  newQuoteButton.addEventListener("click", showRandomQuote);
  exportQuotesButton.addEventListener("click", exportToJson);
  clearStorageButton.addEventListener("click", clearLocalStorage);

  // Generate category buttons
  updateCategoryButtons();

  // Create the add quote form dynamically
  createAddQuoteForm();
}

// Load default quotes (only used if localStorage is empty)
function loadDefaultQuotes() {
  quotes = [
    {
      text: "The only way to do great work is to love what you do.",
      category: "inspiration",
    },
    {
      text: "Innovation distinguishes between a leader and a follower.",
      category: "business",
    },
    {
      text: "Your time is limited, don't waste it living someone else's life.",
      category: "life",
    },
    { text: "Stay hungry, stay foolish.", category: "inspiration" },
    {
      text: "The greatest glory in living lies not in never falling, but in rising every time we fall.",
      category: "life",
    },
    {
      text: "The way to get started is to quit talking and begin doing.",
      category: "motivation",
    },
    {
      text: "Life is what happens when you're busy making other plans.",
      category: "life",
    },
    {
      text: "The future belongs to those who believe in the beauty of their dreams.",
      category: "inspiration",
    },
  ];
  saveQuotes();
}

// Load quotes from localStorage
function loadQuotes() {
  const storedQuotes = localStorage.getItem("quotes");
  if (storedQuotes) {
    quotes = JSON.parse(storedQuotes);
  }

  // Store last loaded time in sessionStorage
  sessionStorage.setItem("lastLoaded", new Date().toISOString());
}

// Save quotes to localStorage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// Clear localStorage
function clearLocalStorage() {
  if (confirm("Are you sure you want to clear all saved quotes?")) {
    localStorage.removeItem("quotes");
    sessionStorage.removeItem("lastLoaded");
    quotes = [];
    loadDefaultQuotes();
    updateCategoryButtons();
    showRandomQuote();
    alert("Local storage cleared. Default quotes loaded.");
  }
}

// Show a random quote
function showRandomQuote() {
  let filteredQuotes = quotes;

  // Filter by category if one is selected
  if (currentCategory) {
    filteredQuotes = quotes.filter(
      (quote) => quote.category === currentCategory
    );
  }

  // If no quotes in filtered list, show all
  if (filteredQuotes.length === 0) {
    filteredQuotes = quotes;
    currentCategory = null;
    updateCategoryButtons();
  }

  // Get random quote
  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const randomQuote = filteredQuotes[randomIndex];

  // Display the quote
  quoteTextElement.textContent = `"${randomQuote.text}"`;
  quoteCategoryElement.textContent = `— ${randomQuote.category}`;

  // Store last viewed quote in sessionStorage
  sessionStorage.setItem("lastViewedQuote", JSON.stringify(randomQuote));
}

// Update category buttons based on available categories
function updateCategoryButtons() {
  // Clear existing buttons
  categoryButtonsContainer.innerHTML = "";

  // Get all unique categories
  const categories = [...new Set(quotes.map((quote) => quote.category))];

  // Add "All" button
  const allButton = document.createElement("button");
  allButton.textContent = "All";
  allButton.className = "category-btn" + (!currentCategory ? " active" : "");
  allButton.addEventListener("click", () => {
    currentCategory = null;
    updateCategoryButtons();
    showRandomQuote();
  });
  categoryButtonsContainer.appendChild(allButton);

  // Add buttons for each category
  categories.forEach((category) => {
    const button = document.createElement("button");
    button.textContent = category;
    button.className =
      "category-btn" + (currentCategory === category ? " active" : "");
    button.addEventListener("click", () => {
      currentCategory = category;
      updateCategoryButtons();
      showRandomQuote();
    });
    categoryButtonsContainer.appendChild(button);
  });
}

// Create the add quote form dynamically
function createAddQuoteForm() {
  // Remove existing form if it exists
  const existingForm = document.getElementById("addQuoteForm");
  if (existingForm) {
    existingForm.remove();
  }

  // Create form container
  const formContainer = document.createElement("div");
  formContainer.id = "addQuoteForm";
  formContainer.className = "form-container";

  // Create heading
  const heading = document.createElement("h3");
  heading.textContent = "Add a new quote:";
  formContainer.appendChild(heading);

  // Create quote text input
  const quoteInput = document.createElement("input");
  quoteInput.id = "newQuoteText";
  quoteInput.type = "text";
  quoteInput.placeholder = "Enter a new quote";
  formContainer.appendChild(quoteInput);

  // Create category input
  const categoryInput = document.createElement("input");
  categoryInput.id = "newQuoteCategory";
  categoryInput.type = "text";
  categoryInput.placeholder = "Enter quote category";
  formContainer.appendChild(categoryInput);

  // Create submit button
  const submitButton = document.createElement("button");
  submitButton.textContent = "Add Quote";
  submitButton.onclick = addQuote;
  formContainer.appendChild(submitButton);

  // Add form to the DOM
  quoteControlsContainer.appendChild(formContainer);
}

// Add a new quote to the database
function addQuote() {
  const newQuoteText = document.getElementById("newQuoteText").value;
  const newQuoteCategory = document.getElementById("newQuoteCategory").value;

  if (newQuoteText && newQuoteCategory) {
    // Add new quote
    quotes.push({
      text: newQuoteText,
      category: newQuoteCategory.toLowerCase(),
    });

    // Save to localStorage
    saveQuotes();

    // Clear input fields
    document.getElementById("newQuoteText").value = "";
    document.getElementById("newQuoteCategory").value = "";

    // Update UI
    updateCategoryButtons();
    showRandomQuote();

    alert("Quote added successfully!");
  } else {
    alert("Please enter both quote text and category.");
  }
}

// Export quotes to JSON file using Blob
function exportToJson() {
  const data = JSON.stringify(quotes, null, 2);
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  document.body.appendChild(a);
  a.click();

  // Clean up
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
}

// Import quotes from JSON file
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

      // Validate each quote
      for (const quote of importedQuotes) {
        if (!quote.text || !quote.category) {
          throw new Error(
            "Invalid quote format: Each quote must have text and category"
          );
        }
      }

      // Add imported quotes to our collection
      quotes.push(...importedQuotes);
      saveQuotes();
      updateCategoryButtons();
      showRandomQuote();

      // Reset file input
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
