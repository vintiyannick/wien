/* Vienna Sightseeing Beispiel */

// Stephansdom Objekt
let stephansdom = {
    lat: 48.208493,
    lng: 16.373118,
    zoom: 14,
    title: "Domkirche St. Stephan",
};

// Karte initialisieren
let map = L.map("map", {
    maxZoom: 19
}).setView([stephansdom.lat, stephansdom.lng], stephansdom.zoom);

// Overlays definieren
let overlays = {
    sights: L.featureGroup().addTo(map),
    lines: L.featureGroup().addTo(map),
    stops: L.featureGroup().addTo(map),
    zones: L.featureGroup().addTo(map),
    hotels: L.markerClusterGroup({
        disableClusteringAtZoom: 17
    }).addTo(map),
}

// Layercontrol
L.control.layers({
    "BasemapAT": L.tileLayer.provider('BasemapAT.basemap').addTo(map),
    "BasemapAT grau": L.tileLayer.provider('BasemapAT.grau').addTo(map),
    "BasemapAT Overlay": L.tileLayer.provider('BasemapAT.overlay').addTo(map),
    "BasemapAT HighDPI": L.tileLayer.provider('BasemapAT.highdpi').addTo(map),
    "BasemapAT Ortofoto": L.tileLayer.provider('BasemapAT.orthofoto').addTo(map),
    "BasemapAT Relief": L.tileLayer.provider('BasemapAT.terrain').addTo(map),
    "BasemapAT Oberfläche": L.tileLayer.provider('BasemapAT.surface').addTo(map),

}, {
    "Sehenswürdigkeiten": overlays.sights,
    "Vienna sightseeing Linien": overlays.lines,
    "Vienna sightseeing Haltestellen": overlays.stops,
    "Fußgängerzonen": overlays.zones,
    "Hotels": overlays.hotels.addTo(map),
}).addTo(map);

// Maßstab
L.control.scale({
    imperial: false,
}).addTo(map);

// Sehenswürdigkeiten Standorte Wien
async function loadSights(url) {
    //console.log(url);
    let response = await fetch(url);
    let jsondata = await response.json();
    //console.log(jsondata);
    L.geoJSON(jsondata, {
        attribution: "Datenquelle: <a href='https://data.wien.gv.at'> Stadt Wien</a>",
        pointToLayer: function (feature, latlng) {
            return L.marker(latlng, {
                icon: L.icon({
                    iconUrl: "icons/photo.png",
                    iconAnchor: [16, 37],
                    popupAnchor: [0, -37]
                })
            });
        },
        onEachFeature: function(feature, layer) {
            //console.log(feature.properties);
            layer.bindPopup(`
                <img src="${feature.properties.THUMBNAIL}" alt="*">
                <h4>${feature.properties.NAME}</h4>
                <address>${feature.properties.ADRESSE}</address>
                <a href="${feature.properties.WEITERE_INF}" target="wien">Website</a>
                `);
        }
    }).addTo(overlays.sights);
}

// Kraftfahrlinien Wien
async function loadLines(url) {
    let response = await fetch(url);
    let jsondata = await response.json();
    L.geoJSON(jsondata, {
        attribution: "Datenquelle: <a href='https://data.wien.gv.at'> Stadt Wien</a>",
        style: function (feature) {
            // console.log(feature.properties);
            let lineColor;

            if (feature.properties.LINE_NAME == "Yellow Line") {
                lineColor = "#FFDC00";
            } else if (feature.properties.LINE_NAME == "Blue Line") {
                lineColor = "#0074D9";
            } else if (feature.properties.LINE_NAME == "Red Line") {
                lineColor = "#FF4136";
            } else if (feature.properties.LINE_NAME == "Green Line") {
                lineColor = "#2ECC40";
            } else if (feature.properties.LINE_NAME == "Grey Line") {
                lineColor = "#AAAAAA";
            } else if (feature.properties.LINE_NAME == "Orange Line") {
                lineColor = "#FF851B";
            } else {
                lineColor = "#111111";
            }
            return {
                color: lineColor
            }
        },
        onEachFeature: function(feature, layer) {
            //console.log(feature.properties);
            layer.bindPopup(`
                <h4><i class="fa-solid fa-bus"></i> ${feature.properties.LINE_NAME}</h4>
                <p><i class="fa-regular fa-circle-stop"></i> ${feature.properties.FROM_NAME}</p>
                <p><i class="fa-solid fa-down-long"></i></p>
                <p><i class="fa-regular fa-circle-stop"></i> ${feature.properties.TO_NAME}</p>
                `);
        }
    }).addTo(overlays.lines);
}

// Haltestellen Wien
async function loadStops(url) {
    let response = await fetch(url);
    let jsondata = await response.json();
    L.geoJSON(jsondata, {
        attribution: "Datenquelle: <a href='https://data.wien.gv.at'> Stadt Wien</a>",
        pointToLayer: function (feature, latlng) {
            // console.log(feature.properties);

            return L.marker(latlng, {
                icon: L.icon({
                    iconUrl: `icons/bus_${feature.properties.LINE_ID}.png`,
                    iconAnchor: [16, 37],
                    popupAnchor: [0, -37]
                })
            });
        },
        onEachFeature: function(feature, layer) {
             //console.log(feature.properties);
             layer.bindPopup(`
                <h4><i class="fa-solid fa-bus"></i> ${feature.properties.LINE_NAME}</h4>
                ${feature.properties.STAT_ID} ${feature.properties.STAT_NAME}
                `);
        }
    }).addTo(overlays.stops);
}

// Fußgängerzonen Wien
async function loadZones(url) {
    let response = await fetch(url);
    let jsondata = await response.json();
    L.geoJSON(jsondata, {
        attribution: "Datenquelle: <a href='https://data.wien.gv.at'> Stadt Wien</a>",
        style: function (feature) {
            // console.log(feature);
            return {
                color: "#F012BE",
                weight: 1,
                opacity: 0.4,
                fillOpacity: 0.1,
            }
        },
        onEachFeature: function(feature, layer) {
            //console.log(feature.properties);
            layer.bindPopup(`
                <h4>Fußgängerzone ${feature.properties.ADRESSE}</h4>
                <p><i class="fa-regular fa-clock"></i> ${feature.properties.ZEITRAUM}</p>
                <p><i class="fa-solid fa-circle-info"></i> ${feature.properties.AUSN_TEXT}</p>
                `);
        }
    }).addTo(overlays.zones);
}

// Hotels Wien
async function loadHotels(url) {
    let response = await fetch(url);
    let jsondata = await response.json();
    L.geoJSON(jsondata, {
        attribution: "Datenquelle: <a href='https://data.wien.gv.at'> Stadt Wien</a>",
        pointToLayer: function (feature, latlng) {
            // console.log(feature.properties.KATEGORIE_TXT);
            let iconName;

            if (feature.properties.KATEGORIE_TXT == "1*") {
                iconName = "hotel_1stars.png";
            } else if (feature.properties.KATEGORIE_TXT == "2*") {
                iconName = "hotel_2stars.png";
            } else if (feature.properties.KATEGORIE_TXT == "3*") {
                iconName = "hotel_3stars.png";
            } else if (feature.properties.KATEGORIE_TXT == "4*") {
                iconName = "hotel_4stars.png";
            } else if (feature.properties.KATEGORIE_TXT == "5*") {
                iconName = "hotel_5stars.png";
            } else {
                iconName = "hotel_0stars.png";
            }
            // console.log(iconName);

            return L.marker(latlng, {
                icon: L.icon({
                    iconUrl: `icons/${iconName}`,
                    iconAnchor: [16, 37],
                    popupAnchor: [0, -37]
                })
            });
        },
        onEachFeature: function(feature, layer) {
            //console.log(feature.properties);
            layer.bindPopup(`
                <h4>${feature.properties.BETRIEB}</h4>
                <h5>Hotel ${feature.properties.KATEGORIE_TXT}</h5>
                <hr>
                Addr: ${feature.properties.ADRESSE}<br>
                <i class="fa-solid fa-phone"></i>: <a href="tel:${feature.properties.KONTAKT_TEL}">${feature.properties.KONTAKT_TEL}</a><br>
                <i class="fa-solid fa-at"></i>: <a href="mailto:${feature.properties.KONTAKT_EMAIL}">${feature.properties.KONTAKT_EMAIL}</a><br>
                <a href="${feature.properties.WEBLINK1}" target="wien">Homepage</a><br>
                `);
        }
    }).addTo(overlays.hotels);
}

// GeoJSON laden und visualisieren
loadSights("https://data.wien.gv.at/daten/geo?service=WFS&request=GetFeature&version=1.1.0&typeName=ogdwien:SEHENSWUERDIGOGD&srsName=EPSG:4326&outputFormat=json");
loadLines("https://data.wien.gv.at/daten/geo?service=WFS&request=GetFeature&version=1.1.0&typeName=ogdwien:TOURISTIKLINIEVSLOGD&srsName=EPSG:4326&outputFormat=json");
loadStops("https://data.wien.gv.at/daten/geo?service=WFS&request=GetFeature&version=1.1.0&typeName=ogdwien:TOURISTIKHTSVSLOGD&srsName=EPSG:4326&outputFormat=json");
loadZones("https://data.wien.gv.at/daten/geo?service=WFS&request=GetFeature&version=1.1.0&typeName=ogdwien:FUSSGEHERZONEOGD&srsName=EPSG:4326&outputFormat=json");
loadHotels("https://data.wien.gv.at/daten/geo?service=WFS&request=GetFeature&version=1.1.0&typeName=ogdwien:UNTERKUNFTOGD&srsName=EPSG:4326&outputFormat=json");