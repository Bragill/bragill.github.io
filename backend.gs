/**
 * Google Apps Script backend for POS system.
 * Accepts POST requests with JSON body.
 * Actions:
 *  - ping: simple response for connection test.
 *  - getData: returns inventory and sales as JSON.
 *  - sync: replaces inventory and sales with provided data.
 */
function doPost(e) {
  var data = JSON.parse(e.postData.contents);
  var action = data.action;
  var ss = SpreadsheetApp.openById(data.sheetId);
  var result = {};
  switch (action) {
    case 'ping':
      result.status = 'ok';
      break;
    case 'getData':
      result.inventory = readSheet(ss, 'Inventory');
      result.sales = readSheet(ss, 'Sales');
      break;
    case 'sync':
      writeSheet(ss, 'Inventory', data.inventory || []);
      writeSheet(ss, 'Sales', data.sales || []);
      result.status = 'synced';
      break;
    default:
      result.error = 'unknown action';
  }
  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeader('Access-Control-Allow-Origin', '*');
}

function readSheet(ss, name) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) return [];
  var values = sheet.getDataRange().getValues();
  if (values.length === 0) return [];
  var headers = values[0];
  return values.slice(1).map(function(row) {
    var obj = {};
    headers.forEach(function(h, i) { obj[h] = row[i]; });
    return obj;
  });
}

function writeSheet(ss, name, data) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) sheet = ss.insertSheet(name);
  sheet.clearContents();
  if (data.length === 0) return;
  var headers = Object.keys(data[0]);
  sheet.appendRow(headers);
  data.forEach(function(item) {
    sheet.appendRow(headers.map(function(h) { return item[h]; }));
  });
}
