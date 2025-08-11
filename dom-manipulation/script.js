// Initial quotes database
let quotes = [
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

// DOM elements
const quoteTextElement = document.getElementById("quoteText");
const quoteCategoryElement = document.getElementById("quoteCategory");
const newQuoteButton = document.getElementById("newQuote");
const categoryButtonsContainer = document.getElementById("categoryButtons");
const quoteControlsContainer = document.getElementById("quoteControls");

// Current category filter
let currentCategory = null;

// Initialize the app
function init() {
  // Display first quote
  showRandomQuote();

  // Setup event listeners
  newQuoteButton.addEventListener("click", showRandomQuote);

  // Generate category buttons
  updateCategoryButtons();

  // Create the add quote form dynamically
  createAddQuoteForm();
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
  formContainer.style.marginTop = "30px";
  formContainer.style.padding = "20px";
  formContainer.style.backgroundColor = "#f0f0f0";

  // Create heading
  const heading = document.createElement("h3");
  heading.textContent = "Add a new quote:";
  formContainer.appendChild(heading);

  // Create quote text input
  const quoteInput = document.createElement("input");
  quoteInput.id = "newQuoteText";
  quoteInput.type = "text";
  quoteInput.placeholder = "Enter a new quote";
  quoteInput.style.padding = "8px";
  quoteInput.style.marginRight = "10px";
  quoteInput.style.width = "300px";
  formContainer.appendChild(quoteInput);

  // Create category input
  const categoryInput = document.createElement("input");
  categoryInput.id = "newQuoteCategory";
  categoryInput.type = "text";
  categoryInput.placeholder = "Enter quote category";
  categoryInput.style.padding = "8px";
  categoryInput.style.marginRight = "10px";
  categoryInput.style.width = "300px";
  formContainer.appendChild(categoryInput);

  // Create submit button
  const submitButton = document.createElement("button");
  submitButton.textContent = "Add Quote";
  submitButton.onclick = addQuote;
  formContainer.appendChild(submitButton);

  // Add form to the DOM
  document.body.appendChild(formContainer);
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

// Initialize the app when the page loads
document.addEventListener("DOMContentLoaded", init);
