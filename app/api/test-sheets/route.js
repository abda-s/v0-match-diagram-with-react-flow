import { google } from 'googleapis';

// Named export for GET requests
export async function GET() {
  try {
    console.log("Testing Google Sheets connection...");
    console.log("Service Account Email:", process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL);
    console.log("Spreadsheet ID:", process.env.SPREADSHEET_ID);
    
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    
    // Get spreadsheet metadata
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: process.env.SPREADSHEET_ID,
    });
    
    console.log("Spreadsheet title:", spreadsheet.data.properties.title);
    
    // Get sheet names
    const sheetNames = spreadsheet.data.sheets.map(sheet => sheet.properties.title);
    console.log("Available sheets:", sheetNames);
    
    // Get data from the first sheet
    const firstSheetName = sheetNames[0];
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: `${firstSheetName}!A1:Z10`,
    });
    
    console.log("Data from first sheet:", response.data.values);
    
    return Response.json({
      spreadsheetTitle: spreadsheet.data.properties.title,
      sheetNames,
      firstSheetData: response.data.values
    });
  } catch (error) {
    console.error("Error details:", error);
    return Response.json({ 
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}