/*
 **********************************************************************
 * -------------------------------------------------------------------
 * Project Name : Abdal MagniCode
 * File Name    : settings.js
 * Author       : Ebrahim Shafiei (EbraSha)
 * Email        : Prof.Shafiei@Gmail.com
 * Created On   : 2024-12-19 15:30:00
 * Description  : JavaScript functionality for Abdal MagniCode settings page
 * -------------------------------------------------------------------
 *
 * "Coding is an engaging and beloved hobby for me. I passionately and insatiably pursue knowledge in cybersecurity and programming."
 * – Ebrahim Shafiei
 *
 **********************************************************************
 */

class AbdalMagniCodeSettings {
  constructor() {
    this.settings = {
      magnifierSize: 200,
      autoCopy: false,
      magnifierOpacity: 0.8
    };
    this.init();
  }

  async init() {
    // Load current settings
    await this.loadSettings();
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Update UI with current settings
    this.updateUI();
  }

  async loadSettings() {
    try {
      const response = await browser.runtime.sendMessage({ action: "getSettings" });
      this.settings = response;
    } catch (error) {
      console.error('Error loading settings:', error);
      this.showNotification('Error loading settings', 'error');
    }
  }

  setupEventListeners() {
    // Magnifier size slider
    const sizeSlider = document.getElementById('magnifierSize');
    const sizeValue = document.getElementById('sizeValue');
    
    sizeSlider.addEventListener('input', (e) => {
      const value = parseInt(e.target.value);
      this.settings.magnifierSize = value;
      sizeValue.textContent = `${value}px`;
    });

    // Magnifier opacity slider
    const opacitySlider = document.getElementById('magnifierOpacity');
    const opacityValue = document.getElementById('opacityValue');
    
    opacitySlider.addEventListener('input', (e) => {
      const value = parseInt(e.target.value);
      this.settings.magnifierOpacity = value / 100;
      opacityValue.textContent = `${value}%`;
    });

    // Auto-copy toggle
    const autoCopyToggle = document.getElementById('autoCopy');
    
    autoCopyToggle.addEventListener('change', (e) => {
      this.settings.autoCopy = e.target.checked;
    });

    // Save button
    const saveButton = document.getElementById('saveSettings');
    saveButton.addEventListener('click', () => {
      this.saveSettings();
    });

    // Reset button
    const resetButton = document.getElementById('resetSettings');
    resetButton.addEventListener('click', () => {
      this.resetSettings();
    });

    // Add hover effects to settings cards
    const settingsCards = document.querySelectorAll('.settings-card');
    settingsCards.forEach(card => {
      card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-2px)';
      });
      
      card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0)';
      });
    });
  }

  updateUI() {
    // Update sliders
    const sizeSlider = document.getElementById('magnifierSize');
    const sizeValue = document.getElementById('sizeValue');
    sizeSlider.value = this.settings.magnifierSize;
    sizeValue.textContent = `${this.settings.magnifierSize}px`;

    const opacitySlider = document.getElementById('magnifierOpacity');
    const opacityValue = document.getElementById('opacityValue');
    opacitySlider.value = Math.round(this.settings.magnifierOpacity * 100);
    opacityValue.textContent = `${Math.round(this.settings.magnifierOpacity * 100)}%`;

    // Update toggle
    const autoCopyToggle = document.getElementById('autoCopy');
    autoCopyToggle.checked = this.settings.autoCopy;
  }

  async saveSettings() {
    try {
      await browser.runtime.sendMessage({
        action: "saveSettings",
        settings: this.settings
      });
      
      this.showNotification('Settings saved successfully!', 'success');
      
      // Add visual feedback to save button
      const saveButton = document.getElementById('saveSettings');
      const originalText = saveButton.innerHTML;
      saveButton.innerHTML = '<span class="button-icon">✅</span>Saved!';
      saveButton.style.background = 'linear-gradient(135deg, #4CAF50, #45a049)';
      
      setTimeout(() => {
        saveButton.innerHTML = originalText;
        saveButton.style.background = 'linear-gradient(135deg, #667eea, #764ba2)';
      }, 2000);
      
    } catch (error) {
      console.error('Error saving settings:', error);
      this.showNotification('Error saving settings', 'error');
    }
  }

  async resetSettings() {
    // Reset to default values
    this.settings = {
      magnifierSize: 200,
      autoCopy: false,
      magnifierOpacity: 0.8
    };
    
    // Update UI
    this.updateUI();
    
    // Save the reset settings
    await this.saveSettings();
    
    this.showNotification('Settings reset to default!', 'success');
  }

  showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type} show`;
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
      notification.classList.remove('show');
    }, 3000);
  }

  // Utility function to format numbers
  formatNumber(num) {
    return num.toLocaleString();
  }

  // Utility function to validate settings
  validateSettings(settings) {
    const errors = [];
    
    if (settings.magnifierSize < 100 || settings.magnifierSize > 400) {
      errors.push('Magnifier size must be between 100 and 400 pixels');
    }
    
    if (settings.magnifierOpacity < 0.1 || settings.magnifierOpacity > 1) {
      errors.push('Magnifier opacity must be between 10% and 100%');
    }
    
    return errors;
  }
}

// Initialize settings when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new AbdalMagniCodeSettings();
});

// Add some additional UI enhancements
document.addEventListener('DOMContentLoaded', () => {
  // Add smooth scrolling to the page
  document.documentElement.style.scrollBehavior = 'smooth';
  
  // Add loading animation to buttons
  const buttons = document.querySelectorAll('button');
  buttons.forEach(button => {
    button.addEventListener('click', function() {
      this.style.transform = 'scale(0.95)';
      setTimeout(() => {
        this.style.transform = 'scale(1)';
      }, 150);
    });
  });
  
  // Add keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + S to save
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      document.getElementById('saveSettings').click();
    }
    
    // Escape to close (if we were in a popup)
    if (e.key === 'Escape') {
      // Could add close functionality here
    }
  });
}); 