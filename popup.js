const PRESETS = [
  '#FF3B30', '#FF9500', '#FFCC00', '#34C759',
  '#00C7BE', '#007AFF', '#5856D6', '#AF52DE',
  '#FF2D55', '#A2845E', '#567923', '#1C1C1E',
  '#E8D5B7', '#B5EAD7', '#C7CEEA', '#FFDAC1',
];

const DEFAULT_COLOR = '#567923';

let currentColor = DEFAULT_COLOR;
let isEnabled = true;

const hexDisplay = document.getElementById('hexDisplay');
const previewBar = document.getElementById('previewBar');
const colorGrid = document.getElementById('colorGrid');
const customColor = document.getElementById('customColor');
const hexInput = document.getElementById('hexInput');
const applyCustom = document.getElementById('applyCustom');
const enableToggle = document.getElementById('enableToggle');

function isValidHex(hex) {
  return /^#[0-9A-Fa-f]{6}$/.test(hex);
}

function gradientFor(hex) {
  return `linear-gradient(90deg, transparent, ${hex}88, ${hex}, ${hex}88, transparent)`;
}

function initUI(hex) {
  if (!isValidHex(hex)) return;
  currentColor = hex;

  previewBar.style.background = gradientFor(hex);
  hexDisplay.textContent = hex.toUpperCase();
  hexInput.value = hex.toUpperCase();
  customColor.value = hex;

  document.querySelectorAll('.color-swatch').forEach(s => {
    s.classList.toggle('selected', s.dataset.color === hex);
  });
}

function setColor(hex) {
  if (!isValidHex(hex)) return;
  initUI(hex);

  chrome.storage.local.set({ ambilightColor: hex });

  if (isEnabled) {
    broadcastToTabs({ type: 'SET_COLOR', color: hex });
  }
}

function broadcastToTabs(msg) {
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach(tab => {
      if (tab.id) {
        chrome.tabs.sendMessage(tab.id, msg).catch(() => { });
      }
    });
  });
}

PRESETS.forEach(hex => {
  const sw = document.createElement('div');
  sw.className = 'color-swatch';
  sw.style.background = hex;
  sw.dataset.color = hex;
  sw.title = hex;
  sw.addEventListener('click', () => setColor(hex));
  colorGrid.appendChild(sw);
});

applyCustom.addEventListener('click', () => setColor(hexInput.value));
customColor.addEventListener('input', () => setColor(customColor.value));
hexInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') setColor(hexInput.value);
});

enableToggle.addEventListener('change', () => {
  isEnabled = enableToggle.checked;
  chrome.storage.local.set({ ambilightEnabled: isEnabled });
  broadcastToTabs({ type: 'SET_ENABLED', enabled: isEnabled });
});

chrome.storage.local.get(['ambilightColor', 'ambilightEnabled'], (result) => {
  const color = result.ambilightColor || DEFAULT_COLOR;
  isEnabled = result.ambilightEnabled !== false;

  enableToggle.checked = isEnabled;
  initUI(color);
});