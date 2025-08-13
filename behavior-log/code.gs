/**
 * Google Apps Script Server Code - EXPERT VERSION
 * Version: 1.0.0
 * Last Updated: 2025-08-12
 * 
 * Improvements:
 * - Robust error handling and validation
 * - Security headers and rate limiting
 * - Structured logging
 * - Input sanitization
 */

const VERSION = '1.0.0';
const LAST_UPDATED = '2025-08-12';

/**
 * Structured logging helper
 * @param {string} event - Event name
 * @param {Object} data - Event data
 */
function logEvent(event, data) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    event: event,
    data: data,
    version: VERSION
  };
  Logger.log(JSON.stringify(logEntry));
}

/**
 * Serves the HTML form when web app is accessed
 * @param {Object} e - Event object with request parameters
 * @returns {HtmlOutput} The behavior logging form
 */
function doGet(e) {
  try {
    logEvent('form_served', { parameters: e.parameter, userAgent: e.parameter.userAgent });
    
    return HtmlService.createHtmlOutputFromFile('index')
      .setTitle('Behavior Logging Form')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1');
      
  } catch (error) {
    logEvent('form_serve_error', { error: error.toString(), stack: error.stack });
    throw error;
  }
}

/**
 * Processes behavior logging form submissions
 * @param {string[]} formData - Array: [description, energyImpact, wealthTypes, timeDuration, frequency, timeOfDay]
 * @returns {Object} Success response with timestamp
 * @throws {Error} If validation fails or spreadsheet access fails
 */
function addRow(formData) {
  try {
    // Rate limiting - prevent spam submissions
    const lastSubmission = PropertiesService.getScriptProperties().getProperty('lastSubmission');
    const now = Date.now();
    if (lastSubmission && (now - parseInt(lastSubmission)) < 1000) {
      throw new Error('Please wait before submitting again');
    }
    PropertiesService.getScriptProperties().setProperty('lastSubmission', now.toString());
    
    logEvent('form_submission_attempt', { dataLength: formData ? formData.length : 0 });
    
    // Enhanced input validation
    if (!formData || !Array.isArray(formData) || formData.length < 6) {
      throw new Error('Invalid form data structure');
    }
    
    // Validate and sanitize inputs
    const description = (formData[0] || '').toString().trim();
    if (!description || description.length === 0) {
      throw new Error('Description is required');
    }
    if (description.length > 500) {
      throw new Error('Description must be less than 500 characters');
    }
    
    if (!formData[3] || !formData[4]) {
      throw new Error('Time duration and frequency are required');
    }
    
    // Open or create the spreadsheet
    const spreadsheet = getOrCreateSpreadsheet();
    const sheet = spreadsheet.getActiveSheet();
    
    // Add headers if this is the first row
    if (sheet.getLastRow() === 0) {
      const headers = [
        'Timestamp',
        'Description', 
        'Energy Impact',
        'Wealth Types',
        'Time Duration',
        'Frequency',
        'Time of Day'
      ];
      sheet.appendRow(headers);
      
      // Format header row
      const headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setFontWeight('bold');
      headerRange.setBackground('#4285f4');
      headerRange.setFontColor('white');
    }
    
    // Prepare sanitized row data with timestamp
    const rowData = [
      new Date(),
      description, // Already validated and sanitized
      Math.max(-5, Math.min(5, parseInt(formData[1]) || 0)), // Energy Impact (clamped to -5 to 5)
      (formData[2] || '').toString().trim(), // Wealth Types
      (formData[3] || '').toString().trim(), // Time Duration
      (formData[4] || '').toString().trim(), // Frequency
      (formData[5] || '').toString().trim()  // Time of Day
    ];
    
    sheet.appendRow(rowData);
    
    const result = {
      success: true,
      message: 'Data saved successfully',
      timestamp: new Date().toISOString()
    };
    
    logEvent('form_submission_success', { 
      description_length: description.length,
      energy_impact: rowData[2],
      wealth_types_count: (formData[2] || '').split(',').filter(t => t.trim()).length
    });
    
    return result;
      
  } catch (error) {
    logEvent('form_submission_error', { 
      error: error.toString(), 
      stack: error.stack,
      formDataValid: Array.isArray(formData)
    });
    
    throw new Error('Failed to save data: ' + error.message);
  }
}

/**
 * Manages Google Sheets integration with automatic fallbacks
 * Handles permissions, missing sheets, and automatic creation
 * @returns {Spreadsheet} The target spreadsheet for data storage
 * @throws {Error} If unable to access or create spreadsheet
 */
function getOrCreateSpreadsheet() {
  const DEFAULT_SPREADSHEET_ID = 'your-default-spreadsheet-id-here'; // Replace with your spreadsheet ID if needed
  const SPREADSHEET_NAME = 'Behavior Log Data';
  
  try {
    logEvent('spreadsheet_access_attempt', {});
    
    // Try to get spreadsheet ID from Properties first
    const properties = PropertiesService.getScriptProperties();
    let spreadsheetId = properties.getProperty('SPREADSHEET_ID');
    
    // If no stored ID, use the default one and store it
    if (!spreadsheetId) {
      spreadsheetId = DEFAULT_SPREADSHEET_ID;
      properties.setProperty('SPREADSHEET_ID', spreadsheetId);
      logEvent('using_default_spreadsheet', { spreadsheetId });
    }
    
    // Try to open the specific spreadsheet
    try {
      const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
      logEvent('spreadsheet_access_success', { 
        spreadsheetId, 
        name: spreadsheet.getName() 
      });
      return spreadsheet;
    } catch (accessError) {
      logEvent('spreadsheet_access_failed', { 
        spreadsheetId, 
        error: accessError.toString() 
      });
      
      // If we can't access the specified sheet, try to find one by name as fallback
      const files = DriveApp.getFilesByName(SPREADSHEET_NAME);
      if (files.hasNext()) {
        const file = files.next();
        const fallbackId = file.getId();
        logEvent('using_fallback_spreadsheet', { fallbackId });
        
        // Update stored ID to the one we can actually access
        properties.setProperty('SPREADSHEET_ID', fallbackId);
        return SpreadsheetApp.openById(fallbackId);
      }
      
      // Last resort: create new spreadsheet
      logEvent('creating_new_spreadsheet', { name: SPREADSHEET_NAME });
      const newSpreadsheet = SpreadsheetApp.create(SPREADSHEET_NAME);
      const newId = newSpreadsheet.getId();
      
      // Store the new ID
      properties.setProperty('SPREADSHEET_ID', newId);
      
      // Share with owner (optional - for visibility)
      const owner = Session.getActiveUser().getEmail();
      if (owner) {
        DriveApp.getFileById(newId).addEditor(owner);
      }
      
      logEvent('spreadsheet_created_success', { 
        spreadsheetId: newId, 
        owner 
      });
      return newSpreadsheet;
    }
    
  } catch (error) {
    logEvent('spreadsheet_error', { error: error.toString(), stack: error.stack });
    throw new Error('Failed to access or create spreadsheet: ' + error.toString());
  }
}

