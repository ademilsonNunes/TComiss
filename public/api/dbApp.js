const express = require('express');
const sql = require('mssql');
const cors = require('cors');
const app = express();

// Configuração do CORS
app.use(cors());

// Configuração do banco de dados BISOBEL
const configBI = {
  user: 'sa',
  password: 'Totvs@2022$$',
  server: '192.168.0.16',
  database: 'BISOBEL',

  options: {
    encrypt: true, 
    trustServerCertificate: true, 
  },
};

// Configuração manual do CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*'); 
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// Rota para a API - retorna RCAs
app.get('/api/rca', async (req, res) => {
  try {
    await sql.connect(configBI);
    const result = await sql.query('SELECT CODIGOERP, NOME FROM RCA WHERE ATIVO = 1');
    res.json(result.recordset);
  } catch (error) {
    console.error('Erro ao executar a consulta:', error);
    res.status(500).json({ error: 'Erro ao executar a consulta' });
  }
});

// Inicialização do servidor
app.listen(3000, () => {
  console.log('API iniciada na porta 3000');
});
