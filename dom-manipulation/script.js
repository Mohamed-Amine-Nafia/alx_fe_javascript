// Initial quotes array
const quotes = [
  {
    text: "The best way to get started is to quit talking and begin doing.",
    category: "Motivation",
  },
  {
    text: "Life is what happens when you're busy making other plans.",
    category: "Life",
  },
  {
    text: "Do not watch the clock. Do what it does. Keep going.",
    category: "Inspiration",
  },
];

// Create and append DOM elements dynamically
function createAddQuoteForm() {
  const formDiv = document.createElement("div");

  const inputQuote = document.createElement("input");
  inputQuote.type = "text";
  inputQuote.placeholder = "Enter a new quote";
  inputQuote.id = "newQuoteText";

  const inputCategory = document.createElement("input");
  inputCategory.type = "text";
  inputCategory.placeholder = "Enter quote category";
  inputCategory.id = "newQuoteCategory";

  const addButton = document.createElement("button");
  addButton.textContent = "Add Quote";
  addButton.addEventListener("click", addQuote);

  formDiv.appendChild(inputQuote);
  formDiv.appendChild(inputCategory);
  formDiv.appendChild(addButton);

  document.body.appendChild(formDiv);
}

// Display random quote
function showRandomQuote() {
  const quoteDisplay = document.getElementById("quoteDisplay");
  if (quotes.length === 0) {
    quoteDisplay.textContent = "No quotes available.";
    return;
  }
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const { text, category } = quotes[randomIndex];
  quoteDisplay.textContent = `"${text}" — (${category})`;
}

// Add quote from inputs
function addQuote() {
  const inputQuote = document.getElementById("newQuoteText");
  const inputCategory = document.getElementById("newQuoteCategory");

  const text = inputQuote.value.trim();
  const category = inputCategory.value.trim();

  if (!text || !category) {
    alert("Please fill in both fields.");
    return;
  }

  quotes.push({ text, category });

  inputQuote.value = "";
  inputCategory.value = "";

  alert("Quote added!");
}

// Setup on page load
window.onload = () => {
  createAddQuoteForm();

  const showBtn = document.getElementById("newQuote");
  showBtn.addEventListener("click", showRandomQuote);

  showRandomQuote();
};
