import { getSheetData, processScoringSheet } from '@/lib/googleSheets';

export async function GET() {
  try {
    const rows = await getSheetData("Ali's 16");
    const matches = processScoringSheet(rows);
    return Response.json(matches);
  } catch (error) {
    console.error('Error in scoring-16 endpoint:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}