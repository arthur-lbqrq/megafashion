// server.js
// Node 18+ recomendado
import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// Conexão MySQL via variáveis de ambiente
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || '127.0.0.1',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'megafashion',
  port: process.env.MYSQL_PORT ? Number(process.env.MYSQL_PORT) : 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Health
app.get('/health', (req, res) => res.json({ ok: true }));

// Registrar venda
app.post('/api/sales', async (req, res) => {
  try {
    const { seller, amount, payment_method } = req.body;
    if (!seller || !amount || !payment_method) return res.status(400).json({ error: 'Dados incompletos' });

    const [result] = await pool.execute(
      'INSERT INTO sales (seller, amount, payment_method) VALUES (?, ?, ?)',
      [seller, parseFloat(amount).toFixed(2), payment_method]
    );

    res.json({ ok: true, id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro interno' });
  }
});

// Listar vendas (opcional: filtro por datas)
app.get('/api/sales', async (req, res) => {
  try {
    const { from, to } = req.query; // formato YYYY-MM-DD
    let sql = 'SELECT id, seller, amount, payment_method, created_at FROM sales';
    const params = [];
    if (from && to) {
      sql += ' WHERE created_at BETWEEN ? AND ?';
      params.push(from + ' 00:00:00', to + ' 23:59:59');
    }
    sql += ' ORDER BY created_at DESC LIMIT 1000';
    const [rows] = await pool.execute(sql, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro interno' });
  }
});

// Resumo por vendedor + total geral (entre datas opcionais)
app.get('/api/summary', async (req, res) => {
  try {
    const { from, to } = req.query; // opcional
    let where = '';
    const params = [];
    if (from && to) {
      where = ' WHERE created_at BETWEEN ? AND ? ';
      params.push(from + ' 00:00:00', to + ' 23:59:59');
    }

    const sql = `
      SELECT seller, SUM(amount) AS total, COUNT(*) AS vendas
      FROM sales
      ${where}
      GROUP BY seller
    `;

    const [rows] = await pool.execute(sql, params);

    // Total geral
    const totalSql = `SELECT SUM(amount) AS total_geral FROM sales ${where}`;
    const [totalRows] = await pool.execute(totalSql, params);

    res.json({ perSeller: rows, total: totalRows[0].total_geral || 0 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro interno' });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));