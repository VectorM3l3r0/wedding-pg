const DEFAULT_LANG = "pl";

const MAPS_URL = "https://www.google.com/maps/search/?api=1&query=Pa%C5%82ac%20Alexandrinum";
const HOTEL_URL = "https://www.palac-alexandrinum.pl/en/packages/price-of-the-day-flexible-offer/"; // <-- replace with your exact booking/payment link if you have it

const state = {
  lang: localStorage.getItem("wedding_lang") || DEFAULT_LANG,
  audioOn: true
};

async function loadTranslations() {
  const res = await fetch("./translations.json", { cache: "no-store" });
  if (!res.ok) throw new Error("Cannot load translations.json");
  return res.json();
}

function setLangButtonsActive(lang) {
  document.querySelectorAll(".lang__btn").forEach(b => {
    b.classList.toggle("active", b.dataset.lang === lang);
  });
}

function applyTranslations(dict, lang) {
  document.documentElement.lang = lang;
  setLangButtonsActive(lang);

  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    const value = dict?.[lang]?.[key];
    if (typeof value === "string") el.textContent = value;
  });

  // update audio label
  const audioLabel = document.querySelector("#audio-toggle [data-i18n]");
  if (audioLabel) {
    audioLabel.textContent = state.audioOn
      ? (dict?.[lang]?.["audio.on"] ?? "Music: on")
      : (dict?.[lang]?.["audio.off"] ?? "Music: off");
  }
}

function setupLinks() {
  const maps = document.getElementById("maps-link");
  if (maps) maps.href = MAPS_URL;

  const hotel = document.getElementById("hotel-link");
  if (hotel) hotel.href = HOTEL_URL;
}

function setupLanguageSwitcher(dict) {
  document.querySelectorAll(".lang__btn").forEach(btn => {
    btn.addEventListener("click", () => {
      state.lang = btn.dataset.lang;
      localStorage.setItem("wedding_lang", state.lang);
      applyTranslations(dict, state.lang);
    });
  });
}

function setupAudio(dict) {
  const audio = document.getElementById("bg-audio");
  const toggle = document.getElementById("audio-toggle");
  const enter = document.getElementById("enter");
  const enterBtn = document.getElementById("enter-btn");

  if (!audio) {
    console.error("Missing #bg-audio element");
    return;
  }

  async function turnOn() {
    await audio.play();
    state.audioOn = true;
    if (toggle) toggle.classList.add("on");
    applyTranslations(dict, state.lang);
  }

  function turnOff() {
    audio.pause();
    state.audioOn = false;
    if (toggle) toggle.classList.remove("on");
    applyTranslations(dict, state.lang);
  }

  async function enterSite() {
    try {
      await turnOn();
    } catch (e) {
      state.audioOn = false;
      if (toggle) toggle.classList.remove("on");
      applyTranslations(dict, state.lang);
    }

    if (enter) enter.classList.add("hidden");
  }

  if (enterBtn) {
    enterBtn.addEventListener("click", enterSite);
  }

  if (enter) {
    enter.addEventListener("click", (e) => {
      if (e.target === enter) enterSite();
    });
  }

  if (toggle) {
    toggle.addEventListener("click", async () => {
      try {
        if (!state.audioOn) await turnOn();
        else turnOff();
      } catch (e) {
        alert("Audio couldn’t play. Check assets/video-games-instrumental.mp3");
      }
    });
  }
}

(async function init() {
  setupLinks();

  const dict = await loadTranslations();
  applyTranslations(dict, state.lang);
  setupLanguageSwitcher(dict);
  setupAudio(dict);
})();




