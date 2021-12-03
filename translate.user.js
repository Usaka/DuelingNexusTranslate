// ==UserScript==
// @name         Dueling Nexus Translate (EN,ES,FR)
// @namespace    https://duelingnexus.com/
// @description  Script para traducir la descripción de las cartas a los idiomas soportados en yugioh.fandom.com
// @author       UsakaRokujou
// @version      0.2.2-beta
// @match        https://duelingnexus.com/game/*
// @match        https://duelingnexus.com/editor/*
// @grant        none
// @updateURL    https://github.com/Usaka/DuelingNexusTranslate/raw/master/translate.user.js
// @downloadURL  https://github.com/Usaka/DuelingNexusTranslate/raw/master/translate.user.js
// ==/UserScript==

// Verifica si existe la data de la carta, la descarga y la muestra en pantalla
function loadLanguage(id) {
  var card = Engine.getCardData(id);

  if (!(0 >= id) && lastCurrentCardId !== id) {
    lastCurrentCardId = id;
    originalName = document.getElementById("card-name").innerHTML;
    document.getElementById("card-name").innerHTML = "...";

    originalLore = document.getElementById("card-description").innerHTML;
    document.getElementById("card-description").innerHTML = "...";

    if (cardsTemp[id]) {
      setCardData(id);
    } else {
      downloadCardData(id, card);
    }
  }
}

// Descarga la información de la carta si no se tiene localmente
function downloadCardData(id, card) {
  const name = encodeURIComponent(card.name);
  fetch(
    `https://yugioh.fandom.com/api.php?action=query&titles=${name}&prop=revisions&rvslots=*&rvprop=content&formatversion=2&format=json&origin=*`
  )
    .then((res) => res.json())
    .then((result) => {
      var content = result.query?.pages[0]?.revisions[0]?.slots?.main?.content;

      content = content.split("|");

      languageList.forEach((l) => {
        if (l !== "en") {
          let translate = {
            name: content
              .find((f) => f.includes(`${l}_name`))
              ?.split("=")[1]
              ?.trim(),
            lore: content
              .find((f) => f.includes(`${l}_lore`))
              ?.split("=")[1]
              ?.trim()
              .replace("'", ""),
            pendulum: content
              .find((f) => f.includes(`${l}_pendulum_effect`))
              ?.split("=")[1]
              ?.trim()
              .replace("'", ""),
          };

          if (cardsTemp[id]) {
            cardsTemp[id][l] = translate;
          } else {
            cardsTemp[id] = {};
            cardsTemp[id][l] = translate;
          }
        }
      });

      localStorage.setItem("cardsTemp", JSON.stringify(cardsTemp));
      lastCurrentCardId = 0;
      loadLanguage(id);
    });
}

// Consulta la traducción de la carta y la agrega a la vista
function setCardData(id) {
  // Actualizar el nombre de la carta
  document.getElementById("card-name").innerHTML = cardsTemp[id][language].name
    ? cardsTemp[id][language].name
    : `【NOT】 - ${originalName}`;

  // Verificacion datos de la carta
  var card = Engine.getCardData(id);

  // Actualizar los tipos de la carta
  for (let html of document.getElementsByClassName("card-types")) {
    let cardType = [];

    html.innerHTML.split("|").forEach((elem) => {
      cardType.push(dataText[elem] ? dataText[elem][language] : elem);
    });

    html.innerHTML = cardType.join(" | ");
  }

  // Actualizar la raza de la carta
  let race = document.getElementById("card-race");
  if (race.innerHTML !== "") {
    race.innerHTML =
      "<br/>" +
      (dataText[race.innerHTML]
        ? dataText[race.innerHTML][language]
        : race.innerHTML);
  }

  // Actualizar los atributos de la carta
  let attribute = document.getElementById("card-attribute");
  if (attribute.innerHTML !== "") {
    attribute.innerHTML =
      dataText[attribute.innerHTML] && dataText[attribute.innerHTML][language]
        ? dataText[attribute.innerHTML][language]
        : attribute.innerHTML;
  }

  // Actualizar el nivel de la carta
  let level = document.getElementById("card-level");
  if (level.innerHTML !== "") {
    let l = level.innerHTML.split(" ");
    l[0] = dataText[l[0]] ? dataText[l[0]][language] : l[0];
    level.innerHTML = l.join(" ");
  }

  // Actualizar la información si es pendulo
  var pendulum = cardsTemp[id][language].pendulum
    ? `←${card.lscale}【${dataText["Pendulum Effect"][language]}】${card.lscale}→<br> 
    ${cardsTemp[id][language].pendulum} <br><br>
    【${dataText["Monster Effect"][language]}】<br>`
    : "";

  // Actualizar la descripción o efecto de la carta
  document.getElementById("card-description").innerHTML = `
  ${
    cardsTemp[id][language].lore
      ? pendulum + cardsTemp[id][language].lore
      : "【NOT】<br/>" + originalLore
  }`;
}

// Verificar si el script esta en su ultima version o si se actualizo
function verifyVersion() {
  var version = "0.2.2-beta";

  var currentVersion = localStorage.getItem("currentVersion");

  if (version !== currentVersion) {
    localStorage.clear();
    localStorage.setItem("currentVersion", version);
    window.location.reload();
  }
}

// Cargar cartas ya descargadas
function loadLocalData() {
  var oldCards = JSON.parse(localStorage.getItem("cardsTemp"));

  // Verificar cartas descargas o inicializar
  if (oldCards) {
    cardsTemp = oldCards;
  }

  // Obtener el lenguaje predetermiando
  language = localStorage.getItem("language");

  // Verificar lenguaje predeterminado o seleccionar ingles por defecto
  if (!language) {
    language = "en";
    localStorage.setItem("language", "en");
  }
}

// Crea el selector de lenguajes en la parte superior
function createSelect() {
  // Inicializar el selector de lenguajes
  var select = document.createElement("select");
  select.id = "language";
  select.classList.add("editor-select");
  select.classList.add("engine-button");
  select.addEventListener("change", changeLanguage);

  languageList.forEach((l) => {
    var option = document.createElement("option");
    option.value = l;
    option.text = l.toUpperCase();

    select.appendChild(option);
  });

  select.value = localStorage.getItem("language");

  document.getElementById("editor-menu-content")?.appendChild(select);
  document.getElementById("options-window")?.appendChild(select);
}

// Cambiar el lenguaje de la interfaz usando el selector
function changeLanguage(select) {
  var select = document.getElementById("language");
  localStorage.setItem("language", select.value);
  language = select.value;
  let temp = lastCurrentCardId;
  lastCurrentCardId = 0;
  Engine.ui.setCardInfo(temp);
}

// Obtener las traducciones locales necesarias
async function loadLocalTranslate() {
  let result = await fetch(
    "https://raw.githubusercontent.com/Usaka/DuelingNexusTranslate/master/data/translate.json"
  );

  if (result) {
    dataText = await result.json();
  } else {
    alert("Can't get a translate local data");
  }
}

// Inicializa el script
async function init() {
  await loadLocalTranslate();
  verifyVersion();
  loadLocalData();
  createSelect();

  // Reemplaza el metodo predefinido para cargar una carta en la barra derecha
  var oldSetCardInfo = Engine.UI.prototype.setCardInfo;

  lastCurrentCardId = 0;

  Engine.ui.setCardInfo = function (a) {
    oldSetCardInfo.call(this, a);
    if (language !== "en") loadLanguage.call(this, a);
  };
}

// var languageList = ["en", "es", "fr", "de", "it", "pt"];
var languageList = ["en", "es", "fr"];
var language = "en";
var lastCurrentCardId = 0;
var originalName = "";
var originalLore = "";
var cardsTemp = {};
var dataText = {};
await init();
