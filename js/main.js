document.addEventListener("DOMContentLoaded", function () {

    const mapElement = document.getElementById("map");

    if (!mapElement || typeof L === "undefined") {
        console.error("Карта или библиотека Leaflet не найдена");
        return;
    }

    // Карта Киева
    const map = L.map("map").setView([50.4501, 30.5234], 11);

    // Подложка OpenStreetMap
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(map);

    // Слои категорий
    const layers = {
        pharmacy: L.layerGroup().addTo(map),
        water: L.layerGroup().addTo(map),
        heating: L.layerGroup().addTo(map),
        help: L.layerGroup().addTo(map)
    };

    // Защита текста в карточках объектов
    function escapeHtml(value) {
        return String(value).replace(/[&<>"']/g, function (char) {
            return {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#039;"
            }[char];
        });
    }

    // Загружаем аптеки из отдельного JSON-файла
    fetch("data/pharmacies.json")
        .then(function (response) {
            if (!response.ok) {
                throw new Error("Ошибка загрузки аптек: HTTP " + response.status);
            }
            return response.json();
        })
        .then(function (pharmacies) {

            pharmacies.forEach(function (pharmacy) {

                const name = pharmacy.name || "Аптека без названия";
                const address = pharmacy.address || "";

                let popup = "<div class='pharmacy-popup'>";
                popup += "<b>" + escapeHtml(name) + "</b>";

                if (address) {
                    popup += "<br>Адрес: " + escapeHtml(address);
                } else {
                    popup += "<br>Адрес не указан";
                }

                popup += "<br>Координаты: " +
                    Number(pharmacy.lat).toFixed(5) + ", " +
                    Number(pharmacy.lon).toFixed(5);

                if (pharmacy.phone) {
                    const phone = String(pharmacy.phone);
                    popup += "<br>Телефон: <a href='tel:" +
                        escapeHtml(phone) + "'>" +
                        escapeHtml(phone) + "</a>";
                }

                if (pharmacy.opening_hours) {
                    popup += "<br>График работы: " +
                        escapeHtml(pharmacy.opening_hours);
                }

                if (pharmacy.website) {
                    let website = String(pharmacy.website);
                    if (!/^https?:\/\//i.test(website)) {
                        website = "https://" + website;
                    }

                    popup += "<br><a href='" + escapeHtml(website) +
                        "' target='_blank' rel='noopener noreferrer'>Сайт аптеки</a>";
                }

                const routeUrl =
                    "https://www.google.com/maps/dir/?api=1&destination=" +
                    encodeURIComponent(pharmacy.lat + "," + pharmacy.lon) + "&hl=uk";

                popup += "<br><br><a href='" + routeUrl +
                    "' target='_blank' rel='noopener noreferrer'><b>Проложить маршрут</b></a>";

                if (pharmacy.osm_url) {
                    popup += "<br><small><a href='" +
                        escapeHtml(pharmacy.osm_url) +
                        "' target='_blank' rel='noopener noreferrer'>Источник: OpenStreetMap</a></small>";
                }

                popup += "</div>";

                const marker = L.circleMarker(
                    [pharmacy.lat, pharmacy.lon],
                    {
                        radius: 5,
                        color: "#d93645",
                        fillColor: "#e64b55",
                        fillOpacity: 0.8,
                        weight: 1
                    }
                );

                marker.bindPopup(popup);
                marker.addTo(layers.pharmacy);
            });

            console.log("Загружено аптек:", pharmacies.length);
        })
        .catch(function (error) {
            console.error("Не удалось загрузить аптеки:", error);
        });

    // Завантаження перевірених пунктів соціальної та волонтерської допомоги
    fetch("data/help.json")
        .then(function (response) {
            if (!response.ok) {
                throw new Error("Помилка завантаження пунктів допомоги: HTTP " + response.status);
            }
            return response.json();
        })
        .then(function (helpPoints) {

            helpPoints.forEach(function (point) {

                let popup = "<div class='help-popup'>";
                popup += "<b>" + escapeHtml(point.name || "Пункт допомоги") + "</b>";
                popup += "<br>Адреса: " + escapeHtml(point.address || "Не вказана");

                const routeUrl =
                    "https://www.google.com/maps/dir/?api=1&destination=" +
                    encodeURIComponent(point.lat + "," + point.lon) +
                    "&hl=uk";

                popup += "<br><br><a href='" + routeUrl +
                    "' target='_blank' rel='noopener noreferrer' " +
                    "style='display:inline-block;padding:9px 14px;background:#36a66b;" +
                    "color:white;border-radius:7px;text-decoration:none;font-weight:bold;'>" +
                    "Прокласти маршрут</a><br><br>";

                if (point.district) {
                    popup += "<b>Район:</b> " + escapeHtml(point.district) + "<br>";
                }

                if (point.description) {
                    popup += "<b>Послуги:</b> " + escapeHtml(point.description) + "<br>";
                }

                if (Array.isArray(point.phones) && point.phones.length > 0) {
                    popup += "<b>Телефон:</b> ";
                    popup += point.phones.map(function (phone) {
                        const tel = phone.replace(/[^+0-9]/g, "");
                        return "<a href='tel:" + escapeHtml(tel) + "'>" +
                            escapeHtml(phone) + "</a>";
                    }).join(", ");
                    popup += "<br>";
                }

                if (point.working_time) {
                    popup += "<b>Графік:</b> " +
                        escapeHtml(point.working_time) + "<br>";
                }

                if (point.source_url) {
                    popup += "<br><a href='" + escapeHtml(point.source_url) +
                        "' target='_blank' rel='noopener noreferrer'>" +
                        "Джерело інформації</a>";
                }

                popup += "</div>";

                L.circleMarker([point.lat, point.lon], {
                    radius: 9,
                    color: "#238b50",
                    fillColor: "#36a66b",
                    fillOpacity: 0.9,
                    weight: 2
                })
                .bindPopup(popup)
                .addTo(layers.help);
            });

            console.log("Загружено пунктов помощи:", helpPoints.length);
        })
        .catch(function (error) {
            console.error("Не удалось загрузить пункты помощи:", error);
        });

    // Завантаження офіційного реєстру пунктів обігріву КМДА
    fetch("data/heating.json")
        .then(function (response) {
            if (!response.ok) {
                throw new Error("Помилка завантаження пунктів обігріву: HTTP " + response.status);
            }
            return response.json();
        })
        .then(function (heatingPoints) {

            heatingPoints.forEach(function (point) {

                let popup = "<div class='heating-popup'>";
                popup += "<b>" + escapeHtml(point.name || "Пункт обігріву") + "</b>";

                popup += "<br>Адреса: " +
                    escapeHtml(point.address || "Не вказана");

                const routeUrl =
                    "https://www.google.com/maps/dir/?api=1&destination=" +
                    encodeURIComponent(point.lat + "," + point.lon) +
                    "&hl=uk";

                popup += "<br><br><a href='" + routeUrl +
                    "' target='_blank' rel='noopener noreferrer' " +
                    "style='display:inline-block;padding:9px 14px;background:#f39c36;" +
                    "color:white;border-radius:7px;text-decoration:none;font-weight:bold;'>" +
                    "Прокласти маршрут</a><br><br>";


                if (point.district) {
                    popup += "<br>Район: " + escapeHtml(point.district);
                }

                if (point.destination) {
                    popup += "<br>Тип: " + escapeHtml(point.destination);
                }

                if (point.working_time) {
                    popup += "<br>Графік роботи: " +
                        escapeHtml(point.working_time);
                }

                popup += "<br><b>Можливості пункту:</b>";

                function addFacility(label, value) {
                    if (value !== null && value !== undefined && value !== "") {
                        popup += "<br>" + label + ": " + escapeHtml(String(value));
                    }
                }

                addFacility("Обігрів", point.heater);
                addFacility("Генератор", point.generator);
                addFacility("Зарядка телефонів", point.charge);
                addFacility("Вода", point.water);
                addFacility("Інтернет", point.internet);
                addFacility("Мобільний зв'язок", point.cellular);
                addFacility("Аптечка", point.first_aid);
                addFacility("Пандус", point.pandus);

                if (point.count_people) {
                    popup += "<br>Місткість: " +
                        escapeHtml(String(point.count_people)) + " осіб";
                }

                if (point.availability) {
                    popup += "<br><br>" +
                        escapeHtml(point.availability);
                }

                if (point.last_edited_date) {
                    const editedDate = new Date(
                        Number(point.last_edited_date)
                    );

                    if (!isNaN(editedDate.getTime())) {
                        popup += "<br><small>Оновлено в реєстрі: " +
                            editedDate.toLocaleDateString("uk-UA") +
                            "</small>";
                    }
                }

                popup += "<br><small>Джерело: офіційний портал відкритих даних Києва</small>";
                popup += "</div>";

                L.circleMarker([point.lat, point.lon], {
                    radius: 7,
                    color: "#d98220",
                    fillColor: "#f39c36",
                    fillOpacity: 0.9,
                    weight: 1.5
                })
                .bindPopup(popup)
                .addTo(layers.heating);
            });

            console.log("Завантажено пунктів обігріву:", heatingPoints.length);
        })
        .catch(function (error) {
            console.error("Не вдалося завантажити пункти обігріву:", error);
        });

    // Завантаження офіційного реєстру бюветів Києва
    fetch("data/water.json")
        .then(function (response) {
            if (!response.ok) {
                throw new Error("Помилка завантаження бюветів: HTTP " + response.status);
            }
            return response.json();
        })
        .then(function (waterPoints) {

            waterPoints.forEach(function (point) {

                const working = String(point.status || "").toLowerCase() === "працює";
                const markerColor = working ? "#258bd2" : "#888888";

                let popup = "<div class='water-popup'>";
                popup += "<b>Бювет Києва</b>";
                popup += "<br>Адреса: " + escapeHtml(point.address || "Не вказана");

                if (point.district) {
                    popup += "<br>Район: " + escapeHtml(point.district);
                }

                popup += "<br>Стан: <b>" +
                    escapeHtml(point.status || "Не зазначено") + "</b>";

                popup += "<br>Генератор: " +
                    (point.generator ? "Є" : "Не зазначено");

                if (point.well_depth) {
                    popup += "<br>Глибина свердловини: " +
                        escapeHtml(point.well_depth) + " м";
                }

                if (point.water_analysis &&
                    /^https:\/\//i.test(point.water_analysis)) {
                    popup += "<br><a href='" +
                        escapeHtml(point.water_analysis) +
                        "' target='_blank' rel='noopener noreferrer'>Аналіз води</a>";
                }

                const routeUrl =
                    "https://www.google.com/maps/dir/?api=1&destination=" +
                    encodeURIComponent(point.lat + "," + point.lon) + "&hl=uk";

                popup += "<br><br><a href='" + routeUrl +
                    "' target='_blank' rel='noopener noreferrer'><b>Прокласти маршрут</b></a>";

                popup += "<br><small>Джерело: офіційний реєстр Київводфонду</small>";
                popup += "</div>";

                L.circleMarker([point.lat, point.lon], {
                    radius: 6,
                    color: markerColor,
                    fillColor: markerColor,
                    fillOpacity: 0.85,
                    weight: 1
                })
                .bindPopup(popup)
                .addTo(layers.water);
            });

            console.log("Завантажено бюветів:", waterPoints.length);
        })
        .catch(function (error) {
            console.error("Не вдалося завантажити бювети:", error);
        });

    // Управление категориями
    document.querySelectorAll(".category-toggle").forEach(function (button) {

        button.addEventListener("click", function () {

            const category = button.dataset.category;
            const layer = layers[category];

            if (!layer) {
                console.error("Неизвестная категория:", category);
                return;
            }

            if (map.hasLayer(layer)) {
                map.removeLayer(layer);
                button.setAttribute("aria-pressed", "false");
            } else {
                layer.addTo(map);
                button.setAttribute("aria-pressed", "true");
            }

            console.log("Переключена категория:", category);
        });
    });

    setTimeout(function () {
        map.invalidateSize();
    }, 300);

    console.log("Карта Киева готова");
});
