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
           range: 'Estudantes!A1:L1',
           valueInputOption: 'USER_ENTERED',
           requestBody: {
             values: [['id', 'name', 'city', 'idDocs', 'incomeDocs', 'incomeValue', 'scores', 'createdAt', 'edital', 'createdBy', 'updatedBy', 'updatedAt']]
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
      ranges: ['Estudantes!A2:L1000', 'Nucleo!A2:F1000']
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
      student.edital,
      student.createdBy || '',
      student.updatedBy || '',
      student.updatedAt || ''
    ]];

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Estudantes!A:L',
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
      range: 'Estudantes!A2:L1000'
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
          student.edital,
          student.createdBy || row[9] || '',
          student.updatedBy || '',
          student.updatedAt || ''
        ];
      }
      return row;
    });

    // Clear and rewrite
    await sheets.spreadsheets.values.clear({
      spreadsheetId,
      range: 'Estudantes!A2:L1000'
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
      range: 'Estudantes!A2:L1000'
    });
    let studentRows = studentResponse.data.values || [];
    const filteredStudentRows = studentRows.filter((row: any[]) => row[0] !== studentId);

    await sheets.spreadsheets.values.clear({
      spreadsheetId,
      range: 'Estudantes!A2:L1000'
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

// API Route: Generate formal report opinion using Gemini 3.5 Flash
app.post("/api/gemini/generate-parecer", async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(400).json({ 
        error: "A chave API do Gemini (GEMINI_API_KEY) não está configurada nos segredos do projeto. Por favor, adicione-a em Configurações > Segredos." 
      });
    }

    const { student, nucleus, perCapita, familySize, totalIncome, incomeScore } = req.body;
    if (!student) {
      return res.status(400).json({ error: "Dados do estudante são necessários." });
    }

    const { GoogleGenAI } = await import("@google/genai");
    const ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    const idDocsComp = student.idDocs.filter((d: any) => d.status === 'Completo').map((d: any) => d.name).join(', ');
    const idDocsInc = student.idDocs.filter((d: any) => d.status === 'Incompleto').map((d: any) => `${d.name} (${d.observation || 'pendente'})`).join(', ');
    const idDocsNenv = student.idDocs.filter((d: any) => d.status === 'Não Enviou').map((d: any) => d.name).join(', ');

    const incDocsComp = student.incomeDocs.filter((d: any) => d.status === 'Completo').map((d: any) => d.name).join(', ');
    const incDocsInc = student.incomeDocs.filter((d: any) => d.status === 'Incompleto').map((d: any) => `${d.name} (${d.observation || 'pendente'})`).join(', ');
    const incDocsNenv = student.incomeDocs.filter((d: any) => d.status === 'Não Enviou').map((d: any) => d.name).join(', ');

    const idDocsStatus = [
      idDocsComp ? `Validados: [${idDocsComp}]` : '',
      idDocsInc ? `Incompletos/Pendentes: [${idDocsInc}]` : '',
      idDocsNenv ? `Não Enviados: [${idDocsNenv}]` : ''
    ].filter(Boolean).join('; ') || 'Sem documentos cadastrados';

    const incomeDocsStatus = [
      incDocsComp ? `Validados: [${incDocsComp}]` : '',
      incDocsInc ? `Incompletos/Pendentes: [${incDocsInc}]` : '',
      incDocsNenv ? `Não Enviados: [${incDocsNenv}]` : ''
    ].filter(Boolean).join('; ') || 'Sem comprovações cadastradas';

    const familyDocsStatus = nucleus && nucleus.length > 0
      ? nucleus.map((m: any, i: number) => {
          const mIdComp = m.idDocs.filter((d: any) => d.status === 'Completo').map((d: any) => d.name).join(', ');
          const mIdInc = m.idDocs.filter((d: any) => d.status === 'Incompleto').map((d: any) => `${d.name} (${d.observation || 'pendente'})`).join(', ');
          const mIncComp = m.incomeDocs.filter((d: any) => d.status === 'Completo').map((d: any) => d.name).join(', ');
          const mIncInc = m.incomeDocs.filter((d: any) => d.status === 'Incompleto').map((d: any) => `${d.name} (${d.observation || 'pendente'})`).join(', ');
          
          return `- Membro #${i + 1} (${m.name}): Identificação: [${mIdComp || 'nenhum completo'}${mIdInc ? ' / Pendentes: ' + mIdInc : ''}]; Renda: [${mIncComp || 'nenhum completo'}${mIncInc ? ' / Pendentes: ' + mIncInc : ''}] (Renda: R$ ${m.incomeValue})`;
        }).join('\n')
      : 'Não se aplica (Domicílio unipessoal)';

    const minWageHalf = 1412 / 2;
    const perCapitaClassification = perCapita <= minWageHalf 
      ? "Extrema Pobreza (até 1/2 salário mínimo per capita)" 
      : perCapita <= 1412 
        ? "Baixa Renda (entre 1/2 e 1 salário mínimo per capita)" 
        : "Acima de 1 salário mínimo per capita";

    const prompt = `Você é uma inteligência artificial voltada para o serviço social que auxilia assistentes sociais na redação de pareceres de avaliação socioeconômica para programas de assistência estudantil.
Sua tarefa é redigir um parecer social sintético, formal, técnico e objetivo para o estudante com base nos dados reais descritos abaixo.

REGRAS CRÍTICAS:
- Escreva em português do Brasil (pt-BR).
- Escreva estritamente na terceira pessoa de forma direta e corrida (nunca responda como chat, e não se dirija ao usuário).
- Use tom estritamente técnico e profissional, típico de pareceres periciais de assistentes sociais do CRESS.
- Limite o texto a no máximo 100-110 palavras (um único parágrafo conciso ou dois extremamente curtos), pois o espaço impresso de anotações no papel é limitado.
- Se houver pendências de documentos (status 'Incompleto' ou 'Não Enviou'), cite resumidamente que foi indeferido, sendo necessário recorrer (entrar com recurso) e promover regularização documental.
- Se a renda per capita for muito baixa, reforce os indicadores de extrema vulnerabilidade para fundamentar o parecer.
- Não crie dados fictícios, use apenas o contexto fornecido. Não faça menção a nomes de variáveis ou placeholders técnicos.

DADOS DA ANÁLISE SOCIOECONÔMICA DO ESTUDANTE:
- Nome do Estudante / Candidato: ${student.name}
- Processo Seletivo / Edital: ${student.edital || 'Não especificado'}
- Município: ${student.city || 'Não informado'}
- Membros no Núcleo Familiar (incluindo o estudante): ${familySize}
- Renda Mensal Total do Grupo: R$ ${totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
- Renda Per Capita Mensal: R$ ${perCapita.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (${perCapitaClassification})
- Índice de Vulnerabilidade Social e Clínica (IV): ${student.scores?.IV || 0} pontos
- Índice Familiar e Educacional (FE): ${student.scores?.FE || 0} pontos
- Índice de Renda Familiar (RF): ${student.scores?.RF || 0} pontos
- Índice de Fatos Agravantes Gerais (FA): ${student.scores?.FA || 0} pontos
- Pontuação Básica de Renda Adicional do Sistema: ${incomeScore} pontos

SITUAÇÃO DOCUMENTAL DO ESTUDANTE:
- Documentos de Identidade: ${idDocsStatus}
- Documentos de Comprovação de Renda: ${incomeDocsStatus}

SITUAÇÃO DOCUMENTAL DO NÚCLEO FAMILIAR:
${familyDocsStatus}

Retorne unicamente o texto corrido do parecer para ser impresso, sem introduções do tipo "Aqui está o parecer:", sem blocos de formatação markdown, ou qualquer quebra-cabeça explicativo adicional.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });

    const parecer = response.text?.trim() || "";

    res.json({ parecer });
  } catch (error: any) {
    console.error("Erro ao gerar parecer com Gemini:", error);
    res.status(500).json({ error: error.message || "Erro interno ao processar com Gemini" });
  }
});

// API Route: Login validation via 'config' sheet
app.post("/api/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ status: "error", message: "Usuário e senha são obrigatórios." });
    }

    const email = process.env.GOOGLE_CLIENT_EMAIL;
    const key = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    const spreadsheetId = process.env.SPREADSHEET_ID;

    // Se as credenciais estiverem ausentes, permite usuário de fallback "admin / admin"
    if (!email || !key || !spreadsheetId) {
      if (username.toLowerCase() === "admin" && password === "admin") {
        return res.json({ 
          success: true, 
          username: "admin", 
          isSandbox: true,
          message: "Autenticado com credenciais padrões em modo local de testes." 
        });
      }
      return res.status(500).json({ 
        status: "error", 
        message: "As credenciais do Google Sheets não estão configuradas e o login padrão falhou." 
      });
    }

    const auth = new google.auth.JWT({
      email,
      key,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    
    try {
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'config!A2:B100',
      });

      const rows = response.data.values || [];
      if (rows.length === 0) {
        return res.status(400).json({ 
          status: "error", 
          message: "Nenhum usuário cadastrado na aba 'config' da planilha (ou planilha vazia)." 
        });
      }

      const authenticatedUser = rows.find((row: any[]) => {
        const dbUser = row[0]?.toString().trim().toLowerCase();
        const dbPass = row[1]?.toString().trim();
        return dbUser === username.trim().toLowerCase() && dbPass === password;
      });

      if (authenticatedUser) {
        return res.json({ 
          success: true, 
          username: authenticatedUser[0] 
        });
      } else {
        return res.status(401).json({ 
          status: "error", 
          message: "Usuário ou senha incorretos." 
        });
      }
    } catch (sheetError: any) {
      console.error("Erro ao ler aba 'config':", sheetError);
      
      const errMsg = sheetError.message || "";
      if (errMsg.includes('RANGE_NOT_FOUND') || sheetError.status === 400 || errMsg.toLowerCase().includes('config')) {
        return res.status(404).json({
          status: "error",
          message: "Aba 'config' não foi localizada na planilha. Certifique-se de criar uma aba com o nome 'config', onde a coluna A possui os usuários e a coluna B possui as senhas."
        });
      }
      
      return res.status(500).json({ 
        status: "error", 
        message: `Falha ao acessar aba 'config' da planilha: ${sheetError.message}` 
      });
    }
  } catch (error: any) {
    console.error("Erro interno de login:", error);
    res.status(500).json({ status: "error", message: error.message || "Erro interno do servidor" });
  }
});

export default app;
