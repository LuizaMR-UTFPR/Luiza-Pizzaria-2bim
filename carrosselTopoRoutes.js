// ===== carrosselTopoRoutes.js corrigido =====
const express = require('express');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const multer = require('multer');
const path = require('path');

const router = express.Router();
const JWT_SECRET = 'segredo_super_secreto';

// Configuração do multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, 'uploads'));
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  }
});

const upload = multer({ storage });

// Conexão com o banco
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'loginecadastro',
  password: 'mr210909',
  port: 5432,
});

// Middleware de autenticação
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ erro: 'Token ausente.' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ erro: 'Token inválido.' });
  }
}

// GET - listar itens do carrossel (público)
router.get('/carrossel-topo', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM carrossel_topo ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao buscar carrossel topo' });
  }
});

// POST - adicionar item (protegido)
router.post('/carrossel-topo', requireAuth, upload.single('imagem'), async (req, res) => {
  const legenda = req.body.legenda;
  const arquivo = req.file;

  if (!arquivo) return res.status(400).json({ erro: 'Imagem é obrigatória.' });

  const caminhoImagem = `/uploads/${arquivo.filename}`;

  try {
    const result = await pool.query(
      'INSERT INTO carrossel_topo (imagem, legenda) VALUES ($1, $2) RETURNING *',
      [caminhoImagem, legenda]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao adicionar item ao carrossel topo' });
  }
});

// PUT - editar item (protegido)
router.put('/carrossel-topo/:id', requireAuth, upload.single('imagem'), async (req, res) => {
  const { id } = req.params;
  const legenda = req.body.legenda;
  const arquivo = req.file;

  try {
    let query, params;

    if (arquivo) {
      const caminhoImagem = `/uploads/${arquivo.filename}`;
      query = 'UPDATE carrossel_topo SET imagem = $1, legenda = $2 WHERE id = $3 RETURNING *';
      params = [caminhoImagem, legenda, id];
    } else {
      query = 'UPDATE carrossel_topo SET legenda = $1 WHERE id = $2 RETURNING *';
      params = [legenda, id];
    }

    const result = await pool.query(query, params);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao editar item do carrossel topo' });
  }
});

// DELETE - remover item (protegido)
router.delete('/carrossel-topo/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM carrossel_topo WHERE id = $1', [id]);
    res.json({ mensagem: 'Item removido do carrossel topo' });
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao remover item do carrossel topo' });
  }
});

module.exports = router;
