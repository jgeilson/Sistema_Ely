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
           range: 'Estudantes!A1:I1',
           valueInputOption: 'USER_ENTERED',
           requestBody: {
             values: [['id', 'name', 'city', 'idDocs', 'incomeDocs', 'incomeValue', 'scores', 'createdAt', 'edital']]
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
      ranges: ['Estudantes!A2:I1000', 'Nucleo!A2:F1000']
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
      student.createdAt,
      student.edital
    ]];

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Estudantes!A:I',
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

// API Route: update student
app.put("/api/sheets/student/update", async (req, res) => {
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

    // Fetch existing
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Estudantes!A2:I1000'
    });
    let rows = response.data.values || [];

    // Map/replace the matching row
    const updatedRows = rows.map((row: any[]) => {
      if (row[0] === student.id) {
        return [
          student.id,
          student.name,
          student.city,
          JSON.stringify(student.idDocs),
          JSON.stringify(student.incomeDocs),
          student.incomeValue.toString(),
          JSON.stringify(student.scores),
          student.createdAt,
          student.edital
        ];
      }
      return row;
    });

    // Clear and rewrite
    await sheets.spreadsheets.values.clear({
      spreadsheetId,
      range: 'Estudantes!A2:I1000'
    });

    if (updatedRows.length > 0) {
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: 'Estudantes!A2',
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: updatedRows }
      });
    }

    res.json({ success: true });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// API Route: delete student (and their nucleus members)
app.delete("/api/sheets/student/:id", async (req, res) => {
  try {
    const email = process.env.GOOGLE_CLIENT_EMAIL;
    const key = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    const spreadsheetId = process.env.SPREADSHEET_ID;
    
    const studentId = req.params.id;

    if (!email || !key || !spreadsheetId) {
      return res.status(500).json({ error: "Faltam credenciais" });
    }

    const auth = new google.auth.JWT({
      email,
      key,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const sheets = google.sheets({ version: 'v4', auth });

    // 1. Delete student from Estudantes
    const studentResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Estudantes!A2:I1000'
    });
    let studentRows = studentResponse.data.values || [];
    const filteredStudentRows = studentRows.filter((row: any[]) => row[0] !== studentId);

    await sheets.spreadsheets.values.clear({
      spreadsheetId,
      range: 'Estudantes!A2:I1000'
    });

    if (filteredStudentRows.length > 0) {
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: 'Estudantes!A2',
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: filteredStudentRows }
      });
    }

    // 2. Delete nucleus members from Nucleo
    const nucleusResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Nucleo!A2:F1000'
    });
    let nucleusRows = nucleusResponse.data.values || [];
    const filteredNucleusRows = nucleusRows.filter((row: any[]) => row[1] !== studentId);

    await sheets.spreadsheets.values.clear({
      spreadsheetId,
      range: 'Nucleo!A2:F1000'
    });

    if (filteredNucleusRows.length > 0) {
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: 'Nucleo!A2',
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: filteredNucleusRows }
      });
    }

    res.json({ success: true });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// API Route: update nucleus member
app.put("/api/sheets/nucleus/update", async (req, res) => {
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

    // Fetch existing
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Nucleo!A2:F1000'
    });
    let rows = response.data.values || [];

    // Map/replace row
    const updatedRows = rows.map((row: any[]) => {
      if (row[0] === member.id) {
        return [
          member.id,
          member.studentId,
          member.name,
          JSON.stringify(member.idDocs),
          JSON.stringify(member.incomeDocs),
          member.incomeValue.toString()
        ];
      }
      return row;
    });

    // Clear and rewrite
    await sheets.spreadsheets.values.clear({
      spreadsheetId,
      range: 'Nucleo!A2:F1000'
    });

    if (updatedRows.length > 0) {
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: 'Nucleo!A2',
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: updatedRows }
      });
    }

    res.json({ success: true });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// API Route: delete nucleus member
app.delete("/api/sheets/nucleus/:id", async (req, res) => {
  try {
    const email = process.env.GOOGLE_CLIENT_EMAIL;
    const key = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    const spreadsheetId = process.env.SPREADSHEET_ID;
    
    const memberId = req.params.id;

    if (!email || !key || !spreadsheetId) {
      return res.status(500).json({ error: "Faltam credenciais" });
    }

    const auth = new google.auth.JWT({
      email,
      key,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const sheets = google.sheets({ version: 'v4', auth });

    // Fetch existing members
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Nucleo!A2:F1000'
    });
    let rows = response.data.values || [];
    const filteredRows = rows.filter((row: any[]) => row[0] !== memberId);

    // Clear and rewrite
    await sheets.spreadsheets.values.clear({
      spreadsheetId,
      range: 'Nucleo!A2:F1000'
    });

    if (filteredRows.length > 0) {
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: 'Nucleo!A2',
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: filteredRows }
      });
    }

    res.json({ success: true });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

export default app;
