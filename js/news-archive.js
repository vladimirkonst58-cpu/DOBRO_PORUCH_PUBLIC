async function loadNewsArchive() {
    const container = document.querySelector("#all-news-list");

    if (!container) return;

    try {
        const response = await fetch("data/news.json");

        if (!response.ok) {
            throw new Error(`Помилка завантаження: ${response.status}`);
        }

        const news = await response.json();

        news.sort((a, b) => new Date(b.date) - new Date(a.date));

        container.innerHTML = "";

        if (news.length === 0) {
            container.textContent = "Поки що новин немає.";
            return;
        }

        news.forEach(item => {
            const article = document.createElement("article");
            article.className = "archive-news-item";

            const picture = document.createElement("div");
            picture.className = "archive-news-picture";
            picture.textContent = item.icon || "📰";

            const content = document.createElement("div");
            content.className = "archive-news-content";

            const category = document.createElement("span");
            category.className = "archive-news-category";
            category.textContent = item.category || "Новини";

            const title = document.createElement("h3");
            title.textContent = item.title || "Без заголовка";

            const summary = document.createElement("p");
            summary.textContent = item.summary || "";

            const date = document.createElement("time");
            date.dateTime = item.date || "";
            date.textContent = item.date
                ? new Date(item.date + "T12:00:00").toLocaleDateString("uk-UA", {
                    day: "numeric",
                    month: "long",
                    year: "numeric"
                })
                : "";

            content.append(category, title, summary, date);

            if (item.source_url) {
                const source = document.createElement("a");
                source.href = item.source_url;
                source.textContent = `Джерело: ${item.source_name || "Офіційне повідомлення"}`;
                source.target = "_blank";
                source.rel = "noopener noreferrer";
                source.className = "news-source";
                content.appendChild(source);
            }

            article.append(picture, content);
            container.appendChild(article);
        });

    } catch (error) {
        console.error("Помилка завантаження архіву новин:", error);
        container.textContent = "Не вдалося завантажити новини. Спробуйте оновити сторінку.";
    }
}

document.addEventListener("DOMContentLoaded", loadNewsArchive);
