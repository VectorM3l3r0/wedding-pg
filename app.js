  const DEFAULT_LANG = "pl";

// 1. UPDATE YOUR LINK HERE
const MAPS_URL = "https://www.google.com/maps/search/?api=1&query=Pałac+Alexandrinum";
const HOTEL_URL = "https://booking.profitroom.com/en/hotelpalacalexandrinum/pricelist/rooms/86187/?check-in=2026-09-02&check-out=2026-09-03&r1_adults=1&auto-dates=1&currency=PLN&_gl=1%2A15hwgi6%2A_ga%2AMTA5MTUyMzY3LjE3NzI2MTkwMjc.%2A_ga_RW48WJ8HEC%2AczE3NzI2MTkwMjYkbzEkZzEkdDE3NzI2MTkxNjUkajQwJGwwJGgw&gclid=CjwKCAiAzZ_NBhAEEiwAMtqKy2o0Jxk0afShPSCAU4eaCTkP0ZaTGI08xFoBfCYUElA7jaXA6CYayhoCidEQAvD_BwE";

const state = {
  lang: localStorage.getItem("wedding_lang") || DEFAULT_LANG,
  audioOn: false // Default to false until "Enter" is clicked
};

async function loadTranslations() {
  // Adding ?v=2 forces the browser to bypass the cache for this file
  const res = await fetch("./translations.json?v=2", { cache: "no-store" });
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
    if (typeof value === "string") {
      // FIX: This allows the \n from your JSON to become real line breaks
      el.innerHTML = value.replace(/\n/g, '<br>'); 
    }
  });

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

  if (!audio) return;

  async function turnOn() {
    try {
      await audio.play();
      state.audioOn = true;
      if (toggle) toggle.classList.add("on");
      applyTranslations(dict, state.lang);
    } catch(e) { console.log("Autoplay blocked"); }
  }

  function turnOff() {
    audio.pause();
    state.audioOn = false;
    if (toggle) toggle.classList.remove("on");
    applyTranslations(dict, state.lang);
  }

  if (enterBtn) {
    enterBtn.addEventListener("click", async () => {
      await turnOn();
      if (enter) enter.classList.add("hidden");
    });
  }

  if (toggle) {
    toggle.addEventListener("click", () => {
      if (!state.audioOn) turnOn();
      else turnOff();
    });
  }
}

(async function init() {
  setupLinks();
  try {
    const dict = await loadTranslations();
    applyTranslations(dict, state.lang);
    setupLanguageSwitcher(dict);
    setupAudio(dict);
  } catch (e) {
    console.error("Initialization failed", e);
  }
})();



