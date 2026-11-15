async function loadNews() {
    const newsContainer = document.querySelector(".news-card");

    if (!newsContainer) return;

    try {
        const response = await fetch("data/news.json");

        if (!response.ok) {
            throw new Error(`Ошибка загрузки новостей: ${response.status}`);
        }

        const news = await response.json();

        news.sort((a, b) => new Date(b.date) - new Date(a.date));

        const heading = newsContainer.querySelector(".section-heading");

        newsContainer.innerHTML = "";
        if (heading) newsContainer.appendChild(heading);

        news.slice(0, 2).forEach(item => {
            const article = document.createElement("article");
            article.className = "news-item";

            const picture = document.createElement("div");
            picture.className = "news-picture";
            picture.textContent = item.icon || "📰";

            const text = document.createElement("div");
            text.className = "news-text";

            const title = document.createElement("h3");
            title.textContent = item.title;

            const summary = document.createElement("p");
            summary.textContent = item.summary;

            const date = document.createElement("time");
            date.dateTime = item.date;
            date.textContent = new Date(item.date + "T12:00:00")
                .toLocaleDateString("uk-UA", {
                    day: "numeric",
                    month: "long",
                    year: "numeric"
                });

            const source = document.createElement("a");
            source.href = item.source_url;
            source.textContent = `Джерело: ${item.source_name}`;
            source.target = "_blank";
            source.rel = "noopener noreferrer";
            source.className = "news-source";

            text.append(title, summary, date, source);
            article.append(picture, text);
            newsContainer.appendChild(article);
        });

    } catch (error) {
        console.error("Не вдалося завантажити новини:", error);
    }
}

document.addEventListener("DOMContentLoaded", loadNews);
