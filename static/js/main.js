/**
 * main.js
 */

import { configurazione, mappaCategorieVisualizzazione } from './config.js';
import { updateProgressBar } from './utils.js';
import { initStep1Listeners } from './steps/step1.js';
import { initStep2Listeners } from './steps/step2.js';
import { initStep3Listeners } from './steps/step3.js';
import { initStep4Listeners } from './steps/step4.js';
import { initStep5Listeners } from './steps/step5.js';
import { initStep6Listeners } from './steps/step6.js';
import { initStep7Listeners } from './steps/step7.js';
import { caricaProfili } from './api.js';

$(document).ready(function() {
  console.log("Document ready - Configuratore inizializzato");

  $(".step-section").hide();
  $("#step1-tipologia").show();

  initStep1Listeners();
  initStep2Listeners();
  initStep3Listeners();
  initStep4Listeners();
  initStep5Listeners();
  initStep6Listeners();
  initStep7Listeners();

  updateProgressBar(1);
  
  // =====================================================================
  // Effetto luci SVG per la selezione della tipologia
  // =====================================================================
  
  // Salva lo stato dell'ultima luce attivata
  let lastActivatedLight = null;

  function activateLight(categoria) {
    // Disattiva tutte le luci
    $('.svg-light').css('opacity', 0);
  
    if (categoria) {
      // Attiva la luce specifica
      $(`.svg-light.${categoria}`).css('opacity', 1);
    }
  }

  // Gestione dell'hover sugli hotspot
  $('.hotspot').on('mouseenter', function() {
    const categoria = $(this).data('categoria');
    if (categoria) {
      activateLight(categoria);
    }
  }).on('mouseleave', function() {
    // Quando il mouse lascia l'hotspot
    if (!lastActivatedLight) {
      // Se nessuna categoria è selezionata, spegni tutte le luci
      $('.svg-light').css('opacity', 0);
    } else {
      // Se una categoria è già selezionata, mostra quella luce
      activateLight(lastActivatedLight);
    }
  });

  // Sovrascrivi il click degli hotspot per includere l'attivazione delle luci
  $('.hotspot').on('click', function() {
    const categoria = $(this).data('categoria');
    
    if (!categoria) {
      console.error("Nessuna categoria trovata per questo hotspot");
      return;
    }
    
    // Salva la categoria come ultima luce attivata
    lastActivatedLight = categoria;
    
    // Continua con il comportamento originale
    configurazione.categoriaSelezionata = categoria;
    
    $('.categoria-selezionata').text(`Categoria: ${mappaCategorieVisualizzazione[categoria] || categoria}`);
    
    updateProgressBar(2);
    
    $("#step1-tipologia").fadeOut(300, function() {
      $("#step2-modello").fadeIn(300);
      
      caricaProfili(categoria);
    });
  });

  // Riapplica l'attivazione della luce quando si torna alla schermata della mappa
  $('.btn-torna-indietro').on('click', function() {
    setTimeout(function() {
      if (lastActivatedLight) {
        activateLight(lastActivatedLight);
      }
    }, 400);
  });
});