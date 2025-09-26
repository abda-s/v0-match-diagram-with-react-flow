import { google } from 'googleapis';

export async function getSheetData(sheetName) {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });
    console.log('Google Sheets API authentication successful', process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'));

    const sheets = google.sheets({ version: 'v4', auth });
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: `${sheetName}!A1:Z1000`,
    });

    return response.data.values || [];
  } catch (error) {
    console.error(`Error accessing sheet "${sheetName}":`, error);
    
    // If it's a permission error, return empty data instead of throwing
    if (error.code === 403 || (error.message && error.message.includes('permission'))) {
      console.warn(`Permission denied for sheet "${sheetName}". Returning empty data.`);
      return [];
    }
    
    // For other errors, rethrow
    throw error;
  }
}

// Helper function to truncate strings longer than 18 characters
function truncateString(str, maxLength = 20) {
  if (!str || str.length <= maxLength) {
    return str;
  }
  return str.substring(0, maxLength - 3) + '...';
}

export function processScoringSheet(rows) {
  if (!rows || rows.length === 0) {
    return [];
  }

  // Find the main header row
  const headerRow = rows.find(row => 
    row.some(cell => cell && cell.toLowerCase().includes('arena'))
  );
  
  if (!headerRow) {
    throw new Error('Header row not found');
  }

  // Find column indices for team numbers and names
  const arenaIndex = headerRow.findIndex(cell => 
    cell && cell.toLowerCase().includes('arena')
  );
  
  // Find Team 1 Number column
  const team1NumberIndex = headerRow.findIndex(cell => 
    cell && cell.toLowerCase().includes('team') && 
    cell.toLowerCase().includes('1') && 
    cell.toLowerCase().includes('number')
  );
  
  // Find Team 1 Name column
  const team1NameIndex = headerRow.findIndex(cell => 
    cell && cell.toLowerCase().includes('team') && 
    cell.toLowerCase().includes('1') && 
    (cell.toLowerCase().includes('name') || !headerRow.some(c => 
      c.toLowerCase().includes('team') && 
      c.toLowerCase().includes('1') && 
      c.toLowerCase().includes('number')
    ))
  );
  
  // Find Team 2 Number column
  const team2NumberIndex = headerRow.findIndex(cell => 
    cell && cell.toLowerCase().includes('team') && 
    cell.toLowerCase().includes('2') && 
    cell.toLowerCase().includes('number')
  );
  
  // Find Team 2 Name column
  const team2NameIndex = headerRow.findIndex(cell => 
    cell && cell.toLowerCase().includes('team') && 
    cell.toLowerCase().includes('2') && 
    (cell.toLowerCase().includes('name') || !headerRow.some(c => 
      c.toLowerCase().includes('team') && 
      c.toLowerCase().includes('2') && 
      c.toLowerCase().includes('number')
    ))
  );
  
  // Find score columns
  const score1Index = headerRow.findIndex((cell, index) => 
    cell && cell.toLowerCase().includes('scoring') && 
    (index === headerRow.findIndex(c => c && c.toLowerCase().includes('scoring')) || 
    cell.toLowerCase().includes('1'))
  );
  
  const score2Index = headerRow.findIndex((cell, index) => 
    cell && cell.toLowerCase().includes('scoring') && 
    index > score1Index
  );

  // Process data rows
  const matches = [];
  const startIndex = rows.indexOf(headerRow) + 1;
  
  for (let i = startIndex; i < rows.length; i++) {
    const row = rows[i];
    
    // Skip empty rows
    if (!row || row.length === 0) {
      continue;
    }
    
    // Skip rows that don't have an arena (likely section headers)
    if (!row[arenaIndex]) {
      continue;
    }
    
    // Skip rows where score columns contain "Score" (indicating it's a header row)
    const score1Value = row[score1Index] || '';
    const score2Value = row[score2Index] || '';
    
    if (score1Value.toLowerCase().includes('scoring') || 
        score2Value.toLowerCase().includes('scoring')) {
      continue;
    }
    
    // Extract team numbers and names
    let team1Number = row[team1NumberIndex] || '';
    let team1Name = row[team1NameIndex] || '';
    let team2Number = row[team2NumberIndex] || '';
    let team2Name = row[team2NameIndex] || '';
    
    // Check if team number is empty or team name is "Team Not Found"
    const isTeam1TBP = !team1Number || team1Name === "Team Not Found";
    const isTeam2TBP = !team2Number || team2Name === "Team Not Found";
    
    // Replace with TBP if needed
    if (isTeam1TBP) {
      team1Number = 'TBP';
      team1Name = 'TBP';
    }
    
    if (isTeam2TBP) {
      team2Number = 'TBP';
      team2Name = 'TBP';
    }
    
    // Create team display strings (number + name if available)
    const team1Display = team1Number && team1Name && team1Number !== 'TBP' 
      ? `${team1Number}: ${team1Name}` 
      : team1Number || team1Name || 'TBP';
      
    const team2Display = team2Number && team2Name && team2Number !== 'TBP' 
      ? `${team2Number}: ${team2Name}` 
      : team2Number || team2Name || 'TBP';
    
    // Set arena to empty if both teams are TBP
    const arena = (isTeam1TBP && isTeam2TBP) ? '' : (row[arenaIndex] || '');
    const score1 = score1Value;
    const score2 = score2Value;
    
    // Determine match status and winner
    let status = 'Not Started';
    let winner = null;
    let winnerDisplay = null;
    
    // Only determine winner if both teams are not TBP and scores are present
    if (!isTeam1TBP && !isTeam2TBP && score1 && score2) {
      status = 'Completed';
      if (score1 === '1' && score2 === '0') {
        winner = team1Number;
        winnerDisplay = team1Display;
      } else if (score1 === '0' && score2 === '1') {
        winner = team2Number;
        winnerDisplay = team2Display;
      }
    } else if (score1 || score2) {
      status = 'In Progress';
    }
    
    // Check if it's a BYE match
    const isBye = (team1Display.toLowerCase().includes('bye') || team2Display.toLowerCase().includes('bye'));
    
    matches.push({
      arena,
      team1Number,
      team1Name: truncateString(team1Name),
      team1Display: truncateString(team1Display),
      team2Number,
      team2Name: truncateString(team2Name),
      team2Display: truncateString(team2Display),
      score1,
      score2,
      status,
      winner,
      winnerDisplay: truncateString(winnerDisplay),
      isBye
    });
  }
  
  return matches;
}