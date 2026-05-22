import express from "express";
import { google } from "googleapis";

const app = express();
app.use(express.json());

// API Route: init spreadsheet format
app.post("/api/sheets/init", async (req, res) => {
  try {
    const email = process.env.GOOGLE_CLIENT_EMAIL;
    const key = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    const spreadsheetId = process.env.SPREADSHEET_ID;

    if (!email || !key || !spreadsheetId) {
      return res.status(500).json({ error: "Faltam credenciais (GOOGLE_CLIENT_EMAIL, GOOGLE_PRIVATE_KEY ou SPREADSHEET_ID)" });
    }

    const auth = new google.auth.JWT({
      email,
      key,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    
    // Try to create sheets if they don't exist
    const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
    
    const sheetTitles = spreadsheet.data.sheets?.map(s => s.properties?.title) || [];
    const requests = [];

    if (!sheetTitles.includes('Estudantes')) {
      requests.push({
        addSheet: { properties: { title: 'Estudantes' } }
      });
    }
    
    if (!sheetTitles.includes('Nucleo')) {
      requests.push({
        addSheet: { properties: { title: 'Nucleo' } }
      });
    }

    if (requests.length > 0) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: { requests }
      });

      // Initialize header rows
      if (!sheetTitles.includes('Estudantes')) {
         await sheets.spreadsheets.values.update({
           spreadsheetId,
           range: 'Estudantes!A1:H1',
           valueInputOption: 'USER_ENTERED',
           requestBody: {
             values: [['id', 'name', 'city', 'idDocs', 'incomeDocs', 'incomeValue', 'scores', 'createdAt']]
           }
         });
      }
      if (!sheetTitles.includes('Nucleo')) {
         await sheets.spreadsheets.values.update({
           spreadsheetId,
           range: 'Nucleo!A1:F1',
           valueInputOption: 'USER_ENTERED',
           requestBody: {
             values: [['id', 'studentId', 'name', 'idDocs', 'incomeDocs', 'incomeValue']]
           }
         });
      }
    }

    res.json({ success: true, spreadsheetId });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// API Route: get data
app.get("/api/sheets/data", async (req, res) => {
  try {
    const email = process.env.GOOGLE_CLIENT_EMAIL;
    const key = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    const spreadsheetId = process.env.SPREADSHEET_ID;

    if (!email || !key || !spreadsheetId) {
      return res.status(500).json({ error: "Faltam credenciais (GOOGLE_CLIENT_EMAIL, GOOGLE_PRIVATE_KEY ou SPREADSHEET_ID)" });
    }

    const auth = new google.auth.JWT({
      email,
      key,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    const response = await sheets.spreadsheets.values.batchGet({
      spreadsheetId,
      ranges: ['Estudantes!A2:H1000', 'Nucleo!A2:F1000']
    });

    const estudantesRows = response.data.valueRanges?.[0].values || [];
    const nucleoRows = response.data.valueRanges?.[1].values || [];

    res.json({ estudantesRows, nucleoRows, spreadsheetId });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// API Route: write studant
app.post("/api/sheets/student", async (req, res) => {
  try {
    const email = process.env.GOOGLE_CLIENT_EMAIL;
    const key = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    const spreadsheetId = process.env.SPREADSHEET_ID;
    
    const { student } = req.body;

    if (!email || !key || !spreadsheetId) {
      return res.status(500).json({ error: "Faltam credenciais" });
    }

    const auth = new google.auth.JWT({
      email,
      key,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const sheets = google.sheets({ version: 'v4', auth });

    const values = [[
      student.id,
      student.name,
      student.city,
      JSON.stringify(student.idDocs),
      JSON.stringify(student.incomeDocs),
      student.incomeValue.toString(),
      JSON.stringify(student.scores),
      student.createdAt
    ]];

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Estudantes!A:H',
      valueInputOption: 'USER_ENTERED',
      requestBody: { values }
    });

    res.json({ success: true });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// API Route: write nucleo
app.post("/api/sheets/nucleus", async (req, res) => {
  try {
    const email = process.env.GOOGLE_CLIENT_EMAIL;
    const key = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    const spreadsheetId = process.env.SPREADSHEET_ID;
    
    const { member } = req.body;

    if (!email || !key || !spreadsheetId) {
      return res.status(500).json({ error: "Faltam credenciais" });
    }

    const auth = new google.auth.JWT({
      email,
      key,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const sheets = google.sheets({ version: 'v4', auth });

    const values = [[
      member.id,
      member.studentId,
      member.name,
      JSON.stringify(member.idDocs),
      JSON.stringify(member.incomeDocs),
      member.incomeValue.toString()
    ]];

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Nucleo!A:F',
      valueInputOption: 'USER_ENTERED',
      requestBody: { values }
    });

    res.json({ success: true });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

export default app;
