"use strict";

// Product catalog and form rules are intentionally separate data structures.
const products = [
  { id: "artisan-bread", name: "Artisan Bread" },
  { id: "morning-pastry", name: "Morning Pastry" },
  { id: "celebration-cake", name: "Celebration Cake" },
  { id: "signature-loaf", name: "Signature Loaf" }
];
const storageKeys = { favorites: "northStarFavorites", requestType: "northStarRequestType" };
const validationRules = [
  { id: "customer-name", message: "Please enter your full name (at least 2 characters)." },
  { id: "customer-email", message: "Enter a valid email address, such as name@example.com." },
  { id: "request-type", message: "Please choose a request type." },
  { id: "item-details", message: "Please describe the items you need (at least 10 characters)." }
];
function safeRead(key, fallback) {
  try { const value = localStorage.getItem(key); return value === null ? fallback : JSON.parse(value); }
  catch { return fallback; }
}
function safeWrite(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* Browsers may disable local storage. */ }
}
function getFavorites() {
  const stored = safeRead(storageKeys.favorites, []);
  return Array.isArray(stored) ? stored.filter(id => products.some(product => product.id === id)) : [];
}
function renderFavorites() {
  const host = document.getElementById("favorite-options");
  if (!host) return;
  const favorites = getFavorites();
  host.replaceChildren();
  products.forEach(product => {
    const row = document.createElement("div"); row.className = "favorite-choice";
    const label = document.createElement("span"); label.textContent = product.name;
    const button = document.createElement("button"); button.type = "button";
    const selected = favorites.includes(product.id);
    button.textContent = selected ? "Remove favorite" : "Add to favorites";
    button.setAttribute("aria-pressed", String(selected));
    button.setAttribute("aria-label", `${selected ? "Remove" : "Save"} ${product.name}`);
    button.addEventListener("click", () => toggleFavorite(product.id));
    row.append(label, button); host.append(row);
  });
  const list = document.getElementById("favorite-list"); list.replaceChildren();
  if (favorites.length === 0) {
    const li = document.createElement("li"); li.textContent = "No favorites saved yet."; list.append(li);
  } else favorites.forEach(id => {
    const li = document.createElement("li"); li.textContent = products.find(p => p.id === id).name; list.append(li);
  });
}
function toggleFavorite(id) {
  const favorites = getFavorites();
  const next = favorites.includes(id) ? favorites.filter(item => item !== id) : [...favorites, id];
  safeWrite(storageKeys.favorites, next);
  renderFavorites();
  document.getElementById("favorite-status").textContent = "Favorites updated and saved in this browser.";
}
function initFavorites() {
  if (!document.getElementById("favorite-options")) return;
  renderFavorites();
  document.getElementById("clear-favorites").addEventListener("click", () => {
    safeWrite(storageKeys.favorites, []); renderFavorites();
    document.getElementById("favorite-status").textContent = "Your saved favorites have been cleared.";
  });
}
function errorFor(field) {
  const value = field.value.trim();
  if (field.id === "customer-name") return value.length < 2 ? validationRules[0].message : "";
  if (field.id === "customer-email") return !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? validationRules[1].message : "";
  if (field.id === "request-type") return !value ? validationRules[2].message : "";
  if (field.id === "item-details") return value.length < 10 ? validationRules[3].message : "";
  return "";
}
function validateField(field) {
  const message = errorFor(field);
  document.getElementById(`${field.id}-error`).textContent = message;
  field.setAttribute("aria-invalid", String(Boolean(message)));
  field.setAttribute("aria-describedby", `${field.id}-error`);
  return !message;
}
function initForm() {
  const form = document.getElementById("preorder-form"); if (!form) return;
  const typeField = document.getElementById("request-type");
  const remembered = safeRead(storageKeys.requestType, "");
  if (["preorder", "question"].includes(remembered)) typeField.value = remembered;
  typeField.addEventListener("change", () => safeWrite(storageKeys.requestType, typeField.value));
  validationRules.forEach(rule => {
    const field = document.getElementById(rule.id);
    field.addEventListener(field.tagName === "SELECT" ? "change" : "input", () => {
      if (field.getAttribute("aria-invalid") === "true") validateField(field);
    });
  });
  form.addEventListener("submit", event => {
    event.preventDefault(); // A static GitHub Pages demo cannot receive orders.
    let firstInvalid = null;
    validationRules.forEach(rule => {
      const field = document.getElementById(rule.id);
      if (!validateField(field) && !firstInvalid) firstInvalid = field;
    });
    const status = document.getElementById("form-status");
    if (firstInvalid) { status.textContent = "Please correct the highlighted fields before continuing."; firstInvalid.focus(); }
    else status.textContent = "Your inquiry details look valid. This demo does not send orders; please contact the bakery to complete your request.";
  });
}
document.addEventListener("DOMContentLoaded", () => { initFavorites(); initForm(); });
