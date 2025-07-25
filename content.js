/*
 **********************************************************************
 * -------------------------------------------------------------------
 * Project Name : Abdal MagniCode
 * File Name    : content.js
 * Author       : Ebrahim Shafiei (EbraSha)
 * Email        : Prof.Shafiei@Gmail.com
 * Created On   : 2024-12-19 15:30:00
 * Description  : Content script for Abdal MagniCode extension providing magnifying glass and code inspection functionality
 * -------------------------------------------------------------------
 *
 * "Coding is an engaging and beloved hobby for me. I passionately and insatiably pursue knowledge in cybersecurity and programming."
 * – Ebrahim Shafiei
 *
 **********************************************************************
 */

class AbdalMagnicode {
  constructor() {
    this.isActive = false;
    this.abdalMagnicodeMagnifier = null;
    this.abdalMagnicodeCodeDisplay = null;
    this.abdalMagnicodeFloatingMenu = null;
    this.settings = {
      magnifierSize: 200,
      autoCopy: false,
      magnifierOpacity: 0.8
    };
    this.activeNotifications = [];
    this.init();
  }

  async init() {
    // Load settings
    try {
      const response = await browser.runtime.sendMessage({ action: "getSettings" });
      this.settings = response;
    } catch (error) {
      console.error('Error loading settings:', error);
    }
    
    // Listen for messages from background script
    browser.runtime.onMessage.addListener((message) => {
      if (message.action === "toggleMagnifier") {
        this.toggleMagnifier();
      } else if (message.action === "settingsUpdated") {
        this.updateSettings(message.settings);
      }
    });

    // Removed: this.createAbdalMagnicodeFloatingMenu();
  }

  toggleMagnifier() {
    if (this.isActive) {
      this.deactivateAbdalMagnicodeMagnifier();
    } else {
      this.activateAbdalMagnicodeMagnifier();
    }
  }

  updateSettings(newSettings) {
    const oldSize = this.settings.magnifierSize;
    this.settings = { ...this.settings, ...newSettings };
    
    console.log('Settings updated:', this.settings);
    
    // Update magnifier if it exists
    if (this.abdalMagnicodeMagnifier) {
      // If size changed, we need to recreate the magnifier
      if (newSettings.magnifierSize && newSettings.magnifierSize !== oldSize) {
        this.abdalMagnicodeMagnifier.remove();
        this.createAbdalMagnicodeMagnifier();
      } else {
        // Just update background gradient and matte overlay for opacity
        this.abdalMagnicodeMagnifier.style.background = `radial-gradient(rgba(245, 252, 252, ${this.settings.magnifierOpacity}) 45%, rgba(128, 128, 128, ${this.settings.magnifierOpacity}))`;
        if (this.abdalMagnicodeMatteOverlay) {
          this.abdalMagnicodeMatteOverlay.style.backdropFilter = `blur(${this.settings.magnifierOpacity * 5}px)`;
        }
        console.log('Updated magnifier opacity to:', this.settings.magnifierOpacity);
      }
    }
  }

  activateAbdalMagnicodeMagnifier() {
    this.isActive = true;
    this.createAbdalMagnicodeMagnifier();
    this.createAbdalMagnicodeCodeDisplay();
    
    // Show floating menu
    // Removed: if (this.abdalMagnicodeFloatingMenu) { ... }
    
    document.addEventListener('mousemove', this.handleAbdalMagnicodeMouseMove.bind(this));
    document.addEventListener('click', this.handleAbdalMagnicodeClick.bind(this));
    document.addEventListener('keydown', this.handleAbdalMagnicodeKeyDown.bind(this));
  }

  deactivateAbdalMagnicodeMagnifier() {
    this.isActive = false;
    if (this.abdalMagnicodeMagnifier) {
      this.abdalMagnicodeMagnifier.remove();
      this.abdalMagnicodeMagnifier = null;
    }
    if (this.abdalMagnicodeCodeDisplay) {
      this.abdalMagnicodeCodeDisplay.remove();
      this.abdalMagnicodeCodeDisplay = null;
    }
    this.abdalMagnicodeMatteOverlay = null;
    
    // Hide floating menu
    // Removed: if (this.abdalMagnicodeFloatingMenu) { ... }
    
    document.removeEventListener('mousemove', this.handleAbdalMagnicodeMouseMove.bind(this));
    document.removeEventListener('click', this.handleAbdalMagnicodeClick.bind(this));
    document.removeEventListener('keydown', this.handleAbdalMagnicodeKeyDown.bind(this));
  }

  createAbdalMagnicodeMagnifier() {
    // Create magnifying glass
    this.abdalMagnicodeMagnifier = document.createElement('div');
    this.abdalMagnicodeMagnifier.id = 'abdalMagnicode-magnifier';
    this.abdalMagnicodeMagnifier.style.cssText = `
      position: fixed;
      width: ${this.settings.magnifierSize}px;
      height: ${this.settings.magnifierSize}px;
      border-radius: 50%;
      border: 6px solid rgba(0, 0, 0, 0.1);
      background: radial-gradient(rgba(245, 252, 252, ${this.settings.magnifierOpacity}) 45%, rgba(128, 128, 128, ${this.settings.magnifierOpacity}));
      pointer-events: none;
      z-index: 10001;
      display: none;
      overflow: hidden;
      box-shadow: 0 0 20px rgba(0, 0, 0, 0.3), 0 0 40px rgba(0, 0, 0, 0.2);
    `;
    
    // Create content container (no magnification)
    this.abdalMagnicodeMagnifiedContent = document.createElement('div');
    this.abdalMagnicodeMagnifiedContent.id = 'abdalMagnicode-magnified-content';
    this.abdalMagnicodeMagnifiedContent.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      border-radius: 50%;
      overflow: hidden;
    `;
    
    // Create matte overlay
    this.abdalMagnicodeMatteOverlay = document.createElement('div');
    this.abdalMagnicodeMatteOverlay.id = 'abdalMagnicode-matte-overlay';
    this.abdalMagnicodeMatteOverlay.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      border-radius: 50%;
      backdrop-filter: blur(${this.settings.magnifierOpacity * 5}px);
      pointer-events: none;
      z-index: 1;
    `;
    
    this.abdalMagnicodeMagnifier.appendChild(this.abdalMagnicodeMagnifiedContent);
    this.abdalMagnicodeMagnifier.appendChild(this.abdalMagnicodeMatteOverlay);
    document.body.appendChild(this.abdalMagnicodeMagnifier);
  }

  createAbdalMagnicodeCodeDisplay() {
    this.abdalMagnicodeCodeDisplay = document.createElement('div');
    this.abdalMagnicodeCodeDisplay.id = 'abdalMagnicode-code-display';
    this.abdalMagnicodeCodeDisplay.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      left: auto;
      max-width: 400px;
      max-height: 300px;
      background: rgba(0, 0, 0, 0.9);
      color: #00ff00;
      font-family: 'Courier New', monospace;
      font-size: 12px;
      padding: 15px;
      border-radius: 8px;
      border: 1px solid rgba(255, 255, 255, 0.2);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
      z-index: 10002;
      overflow: auto;
      display: none;
      backdrop-filter: blur(10px);
      transition: left 0.2s, right 0.2s;
    `;
    document.body.appendChild(this.abdalMagnicodeCodeDisplay);

    this._abdalMagnicodeCodeDisplayMoveTimeout = null;
    this._abdalMagnicodeCodeDisplayCurrent = 'right';

    // Mouse enter/leave for moving the code window
    this.abdalMagnicodeCodeDisplay.addEventListener('mouseenter', () => {
      this.moveAbdalMagnicodeCodeDisplayToLeft();
      if (this._abdalMagnicodeCodeDisplayMoveTimeout) {
        clearTimeout(this._abdalMagnicodeCodeDisplayMoveTimeout);
        this._abdalMagnicodeCodeDisplayMoveTimeout = null;
      }
    });
    this.abdalMagnicodeCodeDisplay.addEventListener('mouseleave', () => {
      if (this._abdalMagnicodeCodeDisplayMoveTimeout) {
        clearTimeout(this._abdalMagnicodeCodeDisplayMoveTimeout);
      }
      this._abdalMagnicodeCodeDisplayMoveTimeout = setTimeout(() => {
        this.moveAbdalMagnicodeCodeDisplayToRight();
        this._abdalMagnicodeCodeDisplayMoveTimeout = null;
      }, 350);
    });
  }

  moveAbdalMagnicodeCodeDisplayToLeft() {
    if (!this.abdalMagnicodeCodeDisplay || this._abdalMagnicodeCodeDisplayCurrent === 'left') return;
    this.abdalMagnicodeCodeDisplay.style.left = '20px';
    this.abdalMagnicodeCodeDisplay.style.right = 'auto';
    this._abdalMagnicodeCodeDisplayCurrent = 'left';
  }

  moveAbdalMagnicodeCodeDisplayToRight() {
    if (!this.abdalMagnicodeCodeDisplay || this._abdalMagnicodeCodeDisplayCurrent === 'right') return;
    this.abdalMagnicodeCodeDisplay.style.right = '20px';
    this.abdalMagnicodeCodeDisplay.style.left = 'auto';
    this._abdalMagnicodeCodeDisplayCurrent = 'right';
  }

  handleAbdalMagnicodeMouseMove(event) {
    if (!this.abdalMagnicodeMagnifier || !this.isActive) return;
    
    const x = event.clientX;
    const y = event.clientY;
    const size = this.settings.magnifierSize;
    
    // Move magnifier with cursor
    this.abdalMagnicodeMagnifier.style.left = (x - size / 2) + 'px';
    this.abdalMagnicodeMagnifier.style.top = (y - size / 2) + 'px';
    this.abdalMagnicodeMagnifier.style.display = 'block';
    
    // Create view of the page content (no magnification)
    this.createAbdalMagnicodeMagnifiedView(x, y, size);
    
    // Get element under cursor
    const element = document.elementFromPoint(x, y);
    if (element) {
      this.showAbdalMagnicodeElementCode(element);
    }
  }

  handleAbdalMagnicodeClick(event) {
    if (!this.isActive) return;
    
    const element = event.target;
    this.showAbdalMagnicodeElementCode(element);
    
    if (this.settings.autoCopy) {
      // Prevent default behavior for links when auto-copy is enabled
      if (element.tagName === 'A' || element.closest('a')) {
        event.preventDefault();
        event.stopPropagation();
        
        // Show visual feedback that link was blocked
        this.showAbdalMagnicodeLinkBlockedNotification();
      }
      
      this.copyAbdalMagnicodeElementCode(element);
    }
  }

  handleAbdalMagnicodeKeyDown(event) {
    if (event.key === 'Escape') {
      this.deactivateAbdalMagnicodeMagnifier();
    }
  }

  // Removed: createAbdalMagnicodeFloatingMenu function

  createAbdalMagnicodeMagnifiedView(x, y, size) {
    if (!this.abdalMagnicodeMagnifiedContent) return;
  
    // Clear previous content
    this.abdalMagnicodeMagnifiedContent.innerHTML = '';
  
    const viewport = document.createElement('div');
    viewport.id = 'abdalMagnicode-magnified-viewport';
    viewport.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      border-radius: 50%;
      overflow: hidden;
    `;
  
    // Convert client coordinates to page coordinates
    const scrollX = window.scrollX || document.documentElement.scrollLeft || 0;
    const scrollY = window.scrollY || document.documentElement.scrollTop || 0;
    const pageX = x + scrollX;
    const pageY = y + scrollY;
  
    // Calculate offset for view (no magnification)
    const offsetX = (size / 2) - pageX;
    const offsetY = (size / 2) - pageY;
  
    const contentView = document.createElement('div');
    contentView.id = 'abdalMagnicode-magnified-content-view';
    contentView.style.cssText = `
      position: absolute;
      top: ${offsetY}px;
      left: ${offsetX}px;
      width: ${document.documentElement.scrollWidth}px;
      height: ${document.documentElement.scrollHeight}px;
      pointer-events: none;
    `;

    //
    // const magnification = 1.5;
    //
    // const offsetX = (size / 2) - pageX * magnification;
    // const offsetY = (size / 2) - pageY * magnification;
    //
    // const contentView = document.createElement('div');
    // contentView.id = 'abdalMagnicode-magnified-content-view';
    // contentView.style.cssText = `
    //   position: absolute;
    //   top: ${offsetY}px;
    //   left: ${offsetX}px;
    //   width: ${document.documentElement.scrollWidth * magnification}px;
    //   height: ${document.documentElement.scrollHeight * magnification}px;
    //   transform: scale(${magnification});
    //   transform-origin: 0 0;
    //   pointer-events: none;
    // `;
    //
  
    // Clone page content
    const pageClone = document.body.cloneNode(true);
  
    // Remove extension elements from clone
    const magnifierElements = pageClone.querySelectorAll(
      '#abdalMagnicode-magnifier, #abdalMagnicode-code-display, #abdalMagnicode-settings-btn, #abdalMagnicode-floating-menu, #abdal-magnifier, #abdal-code-display, #abdal-settings-btn, #abdal-floating-menu'
    );
    magnifierElements.forEach(el => el.remove());
  
    contentView.appendChild(pageClone);
    viewport.appendChild(contentView);
    this.abdalMagnicodeMagnifiedContent.appendChild(viewport);
  }

  showAbdalMagnicodeElementCode(element) {
    if (!this.abdalMagnicodeCodeDisplay) return;
    
    let code = '';
    let elementInfo = '';
    
    // Get element tag name and attributes
    const tagName = element.tagName ? element.tagName.toLowerCase() : 'unknown';
    const id = element.id ? `#${element.id}` : '';
    const className = element.className ? `.${element.className.split(' ').join('.')}` : '';
    elementInfo = `${tagName}${id}${className}`;
    
    // Get outer HTML (limited to first 500 characters)
    const outerHTML = element.outerHTML || element.innerHTML || 'No content available';
    code = outerHTML.length > 500 ? outerHTML.substring(0, 500) + '...' : outerHTML;
    
    // Format the code for display
    const formattedCode = this.formatAbdalMagnicodeHTML(code);
    
    this.abdalMagnicodeCodeDisplay.innerHTML = `
      <div style="margin-bottom: 10px; color: #ffffff; font-weight: bold;">
        Element: ${elementInfo}
      </div>
      <div style="color: #00ff00; white-space: pre-wrap; line-height: 1.4;">
        ${formattedCode}
      </div>
    `;
    this.abdalMagnicodeCodeDisplay.style.display = 'block';
  }

  formatAbdalMagnicodeHTML(html) {
    // Enhanced HTML formatting for better readability
    return html
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/&lt;(\/?)([^>]+)&gt;/g, '<span style="color: #ff6b6b;">&lt;$1$2&gt;</span>')
      .replace(/="([^"]*)"/g, '<span style="color: #4ecdc4;">="$1"</span>')
      .replace(/class="([^"]*)"/g, '<span style="color: #ffd93d;">class="$1"</span>')
      .replace(/id="([^"]*)"/g, '<span style="color: #6bcf7f;">id="$1"</span>');
  }

  copyAbdalMagnicodeElementCode(element) {
    const code = element.outerHTML || element.innerHTML || 'No content available';
    navigator.clipboard.writeText(code).then(() => {
      this.showAbdalMagnicodeNotification('Code copied to clipboard!');
    }).catch(() => {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = code;
      textArea.style.position = 'fixed';
      textArea.style.left = '-9999px';
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      this.showAbdalMagnicodeNotification('Code copied to clipboard!');
    });
  }

  showAbdalMagnicodeLinkBlockedNotification() {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      background: rgba(255, 107, 107, 0.9);
      color: white;
      padding: 15px 25px;
      border-radius: 8px;
      z-index: 10003;
      font-family: Arial, sans-serif;
      font-size: 14px;
      box-shadow: 0 4px 20px rgba(255, 107, 107, 0.5);
      border: 2px solid rgba(255, 255, 255, 0.3);
      transition: all 0.3s ease;
    `;
    notification.textContent = '🔗 Link blocked - Code copied instead!';
    
    // Position notification at the bottom of the screen
    this.positionAbdalMagnicodeNotification(notification);
    document.body.appendChild(notification);
    
    // Add to active notifications
    this.activeNotifications.push(notification);
    
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
        // Remove from active notifications
        const index = this.activeNotifications.indexOf(notification);
        if (index > -1) {
          this.activeNotifications.splice(index, 1);
        }
        // Reposition remaining notifications
        this.repositionAbdalMagnicodeNotifications();
      }
    }, 2000);
  }

  showAbdalMagnicodeNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      background: rgba(0, 0, 0, 0.9);
      color: white;
      padding: 15px 25px;
      border-radius: 8px;
      z-index: 10003;
      font-family: Arial, sans-serif;
      font-size: 14px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
      transition: all 0.3s ease;
    `;
    notification.textContent = message;
    
    // Position notification at the bottom of the screen
    this.positionAbdalMagnicodeNotification(notification);
    document.body.appendChild(notification);
    
    // Add to active notifications
    this.activeNotifications.push(notification);
    
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
        // Remove from active notifications
        const index = this.activeNotifications.indexOf(notification);
        if (index > -1) {
          this.activeNotifications.splice(index, 1);
        }
        // Reposition remaining notifications
        this.repositionAbdalMagnicodeNotifications();
      }
    }, 2000);
  }

  positionAbdalMagnicodeNotification(notification) {
    // Position at bottom center of screen
    const bottomOffset = 20 + (this.activeNotifications.length * 70); // 70px spacing between notifications
    notification.style.bottom = `${bottomOffset}px`;
    notification.style.left = '50%';
    notification.style.transform = 'translateX(-50%)';
  }

  repositionAbdalMagnicodeNotifications() {
    // Reposition all active notifications
    this.activeNotifications.forEach((notification, index) => {
      const bottomOffset = 20 + (index * 70);
      notification.style.bottom = `${bottomOffset}px`;
    });
  }
}

// Initialize the extension
new AbdalMagnicode(); 