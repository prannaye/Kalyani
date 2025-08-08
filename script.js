
const alphaKey = "88a8682639ff45bdb7bd28d49cc9aeab";


async function fetchStockData() {
  const symbol = document.getElementById("stock-symbol").value.trim();
  if (!symbol) return alert("Enter a stock symbol!");

  const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${alphaKey}`;
  const metaUrl = `https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${symbol}&apikey=${alphaKey}`;
  const response = await fetch(url);
  const data = await response.json();
  const timeSeries = data["Time Series (Daily)"];

  if (!timeSeries) return alert("Invalid stock symbol or API limit reached!");

  const dates = Object.keys(timeSeries).slice(0, 30).reverse();
  const prices = dates.map(date => parseFloat(timeSeries[date]["4. close"]));
  const latest = timeSeries[dates[dates.length - 1]];
  const previous = timeSeries[dates[dates.length - 2]];
  const currentPrice = parseFloat(latest["4. close"]);
  const prevPrice = parseFloat(previous["4. close"]);
  const changePercent = ((currentPrice - prevPrice) / prevPrice) * 100;

  const metaResp = await fetch(metaUrl);
  const metaData = await metaResp.json();
  const bestMatch = metaData.bestMatches?.[0] || { "2. Name": symbol };

  updateMetrics({ currentPrice, changePercent }, bestMatch);
  drawChart(dates, prices, symbol);
  fetchNews(symbol);
}

function updateMetrics(data, meta) {
  document.getElementById("stock-name").textContent = meta["2. Name"];
  document.getElementById("current-price").textContent = `$${data.currentPrice}`;

  const changeEl = document.getElementById("price-change");
  const icon = data.changePercent >= 0 ? "🔼" : "🔽";
  const color = data.changePercent >= 0 ? "green" : "red";
  const sign = data.changePercent >= 0 ? "+" : "";

  changeEl.innerHTML = `<span style="color:${color}">${icon} ${sign}${data.changePercent.toFixed(2)}%</span>`;
}

function drawChart(dates, prices, symbol) {
  const ctx = document.getElementById("stock-chart").getContext("2d");
  if (window.chart) window.chart.destroy();
  window.chart = new Chart(ctx, {
    type: "line",
    data: {
      labels: dates,
      datasets: [{
        label: `${symbol} Price`,
        data: prices,
        borderColor: "#0077cc",
        backgroundColor: "rgba(0, 119, 204, 0.1)",
        tension: 0.2
      }]
    },
    options: {
      responsive: true,
      scales: {
        x: { display: true },
        y: { display: true }
      }
    }
  });
}

async function fetchNews(symbol) {
  const res = await fetch(`https://gnews.io/api/v4/search?q=${symbol}&token=${gnewsKey}&lang=en&max=5`);
  const data = await res.json();
  const list = document.getElementById("news-list");
  list.innerHTML = "";
  data.articles?.forEach(article => {
    const li = document.createElement("li");
    li.innerHTML = `<a href="${article.url}" target="_blank">${article.title}</a>`;
    list.appendChild(li);
  });
}


document.getElementById("theme-toggle").onclick = () => {
  document.body.classList.toggle("dark");
}
