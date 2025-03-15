/**
 * main.js
 * File principale del configuratore che inizializza tutti i componenti
 */

import { configurazione } from './config.js';
import { updateProgressBar } from './utils.js';
import { initStep1Listeners } from './steps/step1.js';
import { initStep2Listeners } from './steps/step2.js';
import { initStep3Listeners } from './steps/step3.js';
import { initStep4Listeners } from './steps/step4.js';
import { initStep5Listeners } from './steps/step5.js';
import { initStep6Listeners } from './steps/step6.js';
import { initStep7Listeners } from './steps/step7.js';

/**
 * Inizializza il configuratore all'avvio della pagina
 */
$(document).ready(function() {
  console.log("Document ready - Configuratore inizializzato");
  
  // Nasconde tutti gli step tranne il primo
  $(".step-section").hide();
  $("#step1-tipologia").show();
  
  // Inizializza i listener per ogni step
  initStep1Listeners();
  initStep2Listeners();
  initStep3Listeners();
  initStep4Listeners();
  initStep5Listeners();
  initStep6Listeners();
  initStep7Listeners();
  
  // Inizializza la barra di progresso
  updateProgressBar(1);
});