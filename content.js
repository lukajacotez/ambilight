(function () {
  'use strict';

  const BAR_ID = 'ambilight-bar-lowkyz';
  let isEnabled = true;
  let currentColor = '#567923';

  function forceInject() {
    if (!isEnabled) return;

    let bar = document.getElementById(BAR_ID);
    let needsUpdate = false;

    if (!bar) {
      bar = document.createElement('div');
      bar.id = BAR_ID;

      if (document.body) {
        document.body.appendChild(bar);
      } else if (document.documentElement) {
        document.documentElement.appendChild(bar);
      }
      needsUpdate = true;
    }
    else if (bar.dataset.color !== currentColor) {
      needsUpdate = true;
    }

    if (needsUpdate) {
      bar.dataset.color = currentColor;

      bar.setAttribute('style', `
        position: fixed !important;
        bottom: 0 !important;
        left: 0 !important;
        width: 100% !important;
        height: 4px !important;
        z-index: 2147483647 !important;
        pointer-events: none !important;
        transition: background 0.4s ease, box-shadow 0.4s ease !important;
        
        /* FINI LE DÉGRADÉ : On met une couleur unie pour un néon parfait de bord à bord */
        background: ${currentColor} !important;
        
        /* Les ombres se chargent de faire l'effet de lumière qui bave vers le haut */
        box-shadow: 
          0 -2px 5px ${currentColor}cc,   
          0 -10px 25px ${currentColor}99,  
          0 -30px 60px ${currentColor}66,  
          0 -70px 130px ${currentColor}33, 
          0 -120px 200px ${currentColor}11 !important;
      `);
    }
  }

  function loadStorage() {
    try {
      chrome.storage.local.get(['ambilightColor', 'ambilightEnabled'], (result) => {
        if (result && result.ambilightEnabled !== undefined) {
          isEnabled = result.ambilightEnabled;
        }
        if (result && result.ambilightColor) {
          currentColor = result.ambilightColor;
        }
        forceInject();
      });
    } catch (e) {
      forceInject();
    }
  }

  loadStorage();

  // 2. Le Gardien
  setInterval(() => {
    if (isEnabled) {
      forceInject();
    }
  }, 500);

  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type === 'SET_COLOR') {
      currentColor = msg.color;
      forceInject();
    } else if (msg.type === 'SET_ENABLED') {
      isEnabled = msg.enabled;
      if (isEnabled) {
        forceInject();
      } else {
        let bar = document.getElementById(BAR_ID);
        if (bar) bar.remove();
      }
    }
  });

})();