// RTL Language Auto-Detection Script
// This script automatically detects when the page language changes
// and applies right-to-left (RTL) layout for RTL languages

// List of RTL language codes (languages that read from right to left)
const RTL_LANGUAGES = [
  'ar',    // Arabic
  'arc',   // Aramaic
  'dv',    // Divehi
  'fa',    // Persian
  'ha',    // Hausa (can be RTL)
  'he',    // Hebrew
  'khw',   // Khowar
  'ks',    // Kashmiri
  'ku',    // Kurdish
  'ps',    // Pashto
  'sd',    // Sindhi
  'ur',    // Urdu
  'uz',    // Uzbek (Afghanistan)
  'yi'     // Yiddish
];

/**
 * Check if a language code is RTL
 * @param {string} lang - Language code (e.g., 'ar', 'en', 'he')
 * @returns {boolean} - True if language is RTL
 */
function isRTLLanguage(lang) {
  if (!lang) return false;
  
  // Extract the base language code (e.g., 'ar' from 'ar-SA')
  const baseLang = lang.toLowerCase().split('-')[0];
  
  // Check if it's in our RTL languages list
  return RTL_LANGUAGES.includes(baseLang);
}

/**
 * Apply RTL layout to the page
 * Updates the html element's dir attribute and adds Bootstrap RTL if needed
 */
function applyRTL() {
  const html = document.documentElement;
  
  // Set the direction to RTL
  html.setAttribute('dir', 'rtl');
  
  // Add a class for additional RTL-specific styling if needed
  html.classList.add('rtl-mode');
  
  // Log for debugging
  console.log('RTL layout applied');
}

/**
 * Apply LTR layout to the page
 * Updates the html element's dir attribute back to LTR
 */
function applyLTR() {
  const html = document.documentElement;
  
  // Set the direction to LTR (left-to-right)
  html.setAttribute('dir', 'ltr');
  
  // Remove RTL class
  html.classList.remove('rtl-mode');
  
  // Log for debugging
  console.log('LTR layout applied');
}

/**
 * Detect and apply the correct layout based on current language
 * Checks the html lang attribute and applies RTL/LTR accordingly
 */
function detectAndApplyLayout() {
  const html = document.documentElement;
  const currentLang = html.getAttribute('lang');
  
  // Check if current language is RTL
  if (isRTLLanguage(currentLang)) {
    applyRTL();
  } else {
    applyLTR();
  }
  
  // Translate the page content if translation function is available
  if (typeof window.translatePage === 'function') {
    window.translatePage(currentLang);
  }
}

/**
 * Observe changes to the lang attribute on the html element
 * This catches changes from Google Translate and other translation tools
 */
function observeLanguageChanges() {
  const html = document.documentElement;
  
  // Create a MutationObserver to watch for attribute changes
  const observer = new MutationObserver(function(mutations) {
    // Loop through all mutations (changes)
    mutations.forEach(function(mutation) {
      // Check if the 'lang' attribute changed
      if (mutation.type === 'attributes' && mutation.attributeName === 'lang') {
        console.log('Language changed to:', html.getAttribute('lang'));
        
        // Apply the appropriate layout
        detectAndApplyLayout();
      }
    });
  });
  
  // Start observing the html element for attribute changes
  observer.observe(html, {
    attributes: true,           // Watch for attribute changes
    attributeFilter: ['lang']   // Only watch the 'lang' attribute
  });
  
  console.log('Language change observer started');
}

/**
 * Check for Google Translate widget presence
 * Some translation tools modify the page in specific ways
 */
function observeGoogleTranslate() {
  // Watch for Google Translate's font elements (they add <font> tags)
  const bodyObserver = new MutationObserver(function() {
    // Check if page contains Google Translate elements
    const translateElement = document.querySelector('.goog-te-banner-frame');
    
    if (translateElement) {
      // Recheck layout when translation happens
      setTimeout(detectAndApplyLayout, 500);
    }
  });
  
  // Observe changes to the body
  bodyObserver.observe(document.body, {
    childList: true,    // Watch for added/removed children
    subtree: true       // Watch all descendants
  });
}

/**
 * Initialize the RTL detection system
 * Call this when the page loads
 */
function initRTLDetection() {
  console.log('Initializing RTL auto-detection...');
  
  // Apply correct layout on initial load
  detectAndApplyLayout();
  
  // Start observing for language changes
  observeLanguageChanges();
  
  // Watch for Google Translate activity
  observeGoogleTranslate();
  
  // Also check periodically (backup method)
  // Some translation tools don't update the lang attribute immediately
  setInterval(function() {
    const html = document.documentElement;
    const lang = html.getAttribute('lang');
    const dir = html.getAttribute('dir');
    const shouldBeRTL = isRTLLanguage(lang);
    
    // Check if direction doesn't match language
    if (shouldBeRTL && dir !== 'rtl') {
      applyRTL();
    } else if (!shouldBeRTL && dir === 'rtl') {
      applyLTR();
    }
  }, 1000); // Check every second
  
  console.log('RTL auto-detection initialized successfully');
}

// Wait for the page to fully load, then initialize
if (document.readyState === 'loading') {
  // Page is still loading, wait for DOMContentLoaded event
  document.addEventListener('DOMContentLoaded', initRTLDetection);
} else {
  // Page is already loaded, initialize immediately
  initRTLDetection();
}

// Set up language switcher if it exists
document.addEventListener('DOMContentLoaded', function() {
  const languageSwitcher = document.getElementById('languageSwitcher');
  
  if (languageSwitcher) {
    // Listen for language selection changes
    languageSwitcher.addEventListener('change', function() {
      const selectedLang = this.value;
      const html = document.documentElement;
      
      // Update the lang attribute (this will trigger our observer)
      html.setAttribute('lang', selectedLang);
      
      console.log('Language manually switched to:', selectedLang);
    });
    
    console.log('Language switcher initialized');
  }
});

// Export functions for manual use if needed
window.RTLDetector = {
  isRTLLanguage: isRTLLanguage,
  applyRTL: applyRTL,
  applyLTR: applyLTR,
  detectAndApplyLayout: detectAndApplyLayout
};
