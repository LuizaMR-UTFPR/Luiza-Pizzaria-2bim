
// ===== server.js corrigido =====
const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const path = require('path');
const jwt = require('jsonwebtoken');
const fs = require('fs');

const app = express();
const PORT = 3000;
const JWT_SECRET = 'segredo_super_secreto';

// Criar pasta uploads se não existir
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
  console.log('Pasta uploads criada automaticamente');
}

// Conexão com o banco
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'PIZZARIA',
  password: 'mr210909',
  port: 5432,
});

// Middlewares globais
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
app.use(bodyParser.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static('uploads'));

// Rotas do carrossel do topo
const carrosselTopoRoutes = require('./carrosselTopoRoutes');
app.use('/api', carrosselTopoRoutes);

// Redireciona raiz para cadastro
app.get('/', (req, res) => {
  res.redirect('/cadastro.html');
});

// Middleware de autenticação JWT
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

// Middleware para verificar se é gerente
async function checarSeGerente(req, res, next) {
  try {
    const resultado = await pool.query(
      'SELECT 1 FROM gerentes WHERE usuario_id = $1',
      [req.user.id]
    );
    req.user.eGerente = resultado.rowCount > 0;
    next();
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao verificar gerente.' });
  }
}

// Cadastro
app.post('/cadastro', async (req, res) => {
  const { nome, email, senha } = req.body;
  try {
    await pool.query(
      'INSERT INTO usuarios (nome, email, senha) VALUES ($1, $2, $3)',
      [nome, email, senha]
    );
    res.redirect('/login.html');
  } catch (err) {
    res.send('Erro ao cadastrar: ' + err.message);
  }
});

// Login
app.post('/login', async (req, res) => {
  const { email, senha } = req.body;

  try {
    const resultado = await pool.query(
      'SELECT * FROM usuarios WHERE email = $1',
      [email]
    );
    if (resultado.rows.length === 0) {
      return res.status(401).json({ erro: 'Usuário não encontrado' });
    }

    const user = resultado.rows[0];
    if (senha !== user.senha) {
      return res.status(401).json({ erro: 'Senha incorreta' });
    }

    const gerenteRes = await pool.query(
      'SELECT 1 FROM gerentes WHERE usuario_id = $1',
      [user.id]
    );
    const eGerente = gerenteRes.rowCount > 0;

    const token = jwt.sign(
      { id: user.id, email: user.email, tipoUsuario: user.tipousuario },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      token,
      nome: user.nome,
      tipoUsuario: user.tipousuario,
      eGerente
    });
  } catch (err) {
    console.error('Erro no login:', err);
    res.status(500).json({ erro: 'Erro interno no servidor' });
  }
});

// Rota para destaques públicos
app.get('/api/destaques', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM carrossel_topo ORDER BY id');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao buscar destaques do topo' });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
