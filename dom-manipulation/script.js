const newQuoteText = document.getElementById("newQuoteText");
const newQuoteCategory = document.getElementById("newQuoteCategory");
const quoteDisplay = document.getElementById("quoteDisplay");

const quotes = JSON.parse(localStorage.getItem("Data")) || [];

function saveData() {
  localStorage.setItem("Data", JSON.stringify(quotes));
}

function addQuote() {
  const quote = newQuoteText.value;
  const category = newQuoteCategory.value;
  quotes.push({ quote, category });
  saveData();
  newQuoteText.value = "";
  newQuoteCategory.value = "";
}

function showRandomQuote() {
  quoteDisplay.innerHTML = "";
  quotes.forEach((element) => {
    quoteDisplay.innerHTML += `<p> Quote: ${element.quote}</p>
        <h4>Category :${element.category}</h4>`;
  });
}
showRandomQuote();
