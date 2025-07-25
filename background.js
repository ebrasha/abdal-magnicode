/*
 **********************************************************************
 * -------------------------------------------------------------------
 * Project Name : Abdal MagniCode
 * File Name    : background.js
 * Author       : Ebrahim Shafiei (EbraSha)
 * Email        : Prof.Shafiei@Gmail.com
 * Created On   : 2024-12-19 15:30:00
 * Description  : Background script for Abdal MagniCode extension handling context menus and browser actions
 * -------------------------------------------------------------------
 *
 * "Coding is an engaging and beloved hobby for me. I passionately and insatiably pursue knowledge in cybersecurity and programming."
 * – Ebrahim Shafiei
 *
 **********************************************************************
 */

// Create context menu on extension installation
browser.runtime.onInstalled.addListener(() => {
  browser.contextMenus.create({
    id: "abdal-magnicode",
    title: "Abdal MagniCode - Inspect Code",
    contexts: ["all"]
  });
});

// Handle context menu clicks
browser.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "abdal-magnicode") {
    browser.tabs.sendMessage(tab.id, {
      action: "toggleMagnifier"
    });
  }
});

// Handle browser action clicks
browser.browserAction.onClicked.addListener((tab) => {
  browser.tabs.sendMessage(tab.id, {
    action: "toggleMagnifier"
  });
});

// Handle messages from content script
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "openSettings") {
    browser.tabs.create({
      url: browser.runtime.getURL("settings.html")
    });
  } else if (message.action === "getSettings") {
    browser.storage.local.get(["magnifierSize", "autoCopy", "magnifierOpacity"], (result) => {
      sendResponse({
        magnifierSize: result.magnifierSize || 200,
        autoCopy: result.autoCopy || false,
        magnifierOpacity: result.magnifierOpacity || 0.8
      });
    });
    return true; // Keep message channel open for async response
  } else if (message.action === "saveSettings") {
    browser.storage.local.set({
      magnifierSize: message.settings.magnifierSize,
      autoCopy: message.settings.autoCopy,
      magnifierOpacity: message.settings.magnifierOpacity
    });
  }
}); 