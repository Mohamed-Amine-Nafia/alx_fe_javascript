// Quotes database - will be loaded from localStorage
let quotes = [];
let currentFilter = null;

// DOM elements
const quoteTextElement = document.getElementById("quoteText");
const quoteCategoryElement = document.getElementById("quoteCategory");
const newQuoteButton = document.getElementById("newQuote");
const quoteControlsContainer = document.getElementById("quoteControls");
const exportQuotesButton = document.getElementById("exportQuotes");
const clearStorageButton = document.getElementById("clearStorage");
const importFileInput = document.getElementById("importFile");
const categoryFilterSelect = document.getElementById("categoryFilter");
const clearFilterButton = document.getElementById("clearFilter");

// Initialize the app
function init() {
  // Load quotes from localStorage
  loadQuotes();

  // If no quotes in storage, load default quotes
  if (quotes.length === 0) {
    loadDefaultQuotes();
  }

  // Populate category filter
  populateCategories();

  // Load last filter from sessionStorage
  const lastFilter = sessionStorage.getItem("lastFilter");
  if (lastFilter) {
    currentFilter = lastFilter === "all" ? null : lastFilter;
    categoryFilterSelect.value = lastFilter;
  }

  // Display first quote
  showRandomQuote();

  // Setup event listeners
  newQuoteButton.addEventListener("click", showRandomQuote);
  exportQuotesButton.addEventListener("click", exportToJson);
  clearStorageButton.addEventListener("click", clearLocalStorage);
  clearFilterButton.addEventListener("click", clearFilter);
  categoryFilterSelect.addEventListener("change", filterQuotes);

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
    sessionStorage.removeItem("lastFilter");
    sessionStorage.removeItem("lastLoaded");
    quotes = [];
    loadDefaultQuotes();
    populateCategories();
    showRandomQuote();
    alert("Local storage cleared. Default quotes loaded.");
  }
}

// Populate category filter dropdown
function populateCategories() {
  // Clear existing options except "All"
  while (categoryFilterSelect.options.length > 1) {
    categoryFilterSelect.remove(1);
  }

  // Get all unique categories
  const categories = [...new Set(quotes.map((quote) => quote.category))];

  // Add categories to dropdown
  categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categoryFilterSelect.appendChild(option);
  });
}

// Filter quotes based on selected category
function filterQuotes() {
  const selectedCategory = categoryFilterSelect.value;
  currentFilter = selectedCategory === "all" ? null : selectedCategory;

  // Save filter to sessionStorage
  sessionStorage.setItem("lastFilter", selectedCategory);

  // Show a random quote from filtered selection
  showRandomQuote();
}

// Clear current filter
function clearFilter() {
  categoryFilterSelect.value = "all";
  currentFilter = null;
  sessionStorage.removeItem("lastFilter");
  showRandomQuote();
}

// Show a random quote
function showRandomQuote() {
  let filteredQuotes = quotes;

  // Filter by current filter if set
  if (currentFilter) {
    filteredQuotes = quotes.filter((quote) => quote.category === currentFilter);
  }

  // If no quotes in filtered list, show message
  if (filteredQuotes.length === 0) {
    quoteTextElement.textContent = currentFilter
      ? `No quotes found in category "${currentFilter}"`
      : "No quotes available";
    quoteCategoryElement.textContent = "";
    return;
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
    const category = newQuoteCategory.toLowerCase();
    quotes.push({
      text: newQuoteText,
      category: category,
    });

    // Save to localStorage
    saveQuotes();

    // Update category filter if new category
    if (
      ![...categoryFilterSelect.options].some((opt) => opt.value === category)
    ) {
      const option = document.createElement("option");
      option.value = category;
      option.textContent = category;
      categoryFilterSelect.appendChild(option);
    }

    // Clear input fields
    document.getElementById("newQuoteText").value = "";
    document.getElementById("newQuoteCategory").value = "";

    // Show the new quote
    currentFilter = null;
    categoryFilterSelect.value = "all";
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
      populateCategories();
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
