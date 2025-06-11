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

// =======================
// CRUD de PIZZAS
// =======================

const pizzaRouter = express.Router();

// GET - Listar todas as pizzas
pizzaRouter.get('/api/pizzas', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM pizzas ORDER BY id');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar pizzas.' });
  }
});

// POST - Adicionar nova pizza
pizzaRouter.post('/api/pizzas', async (req, res) => {
  const { nome, ingredientes, preco } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO pizzas (nome, ingredientes, preco) VALUES ($1, $2, $3) RETURNING *',
      [nome, ingredientes, preco]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao adicionar pizza.' });
  }
});

// PUT - Atualizar pizza
pizzaRouter.put('/api/pizzas/:id', async (req, res) => {
  const { id } = req.params;
  const { nome, ingredientes, preco } = req.body;
  try {
    const result = await pool.query(
      'UPDATE pizzas SET nome = $1, ingredientes = $2, preco = $3 WHERE id = $4 RETURNING *',
      [nome, ingredientes, preco, id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar pizza.' });
  }
});

// DELETE - Remover pizza
pizzaRouter.delete('/api/pizzas/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM pizzas WHERE id = $1', [id]);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar pizza.' });
  }
});

app.use(pizzaRouter);

// ==========================
// ROTAS DE GERENCIAMENTO DE USUÁRIOS
// ==========================

// Middleware para verificar se o usuário é o gerente mestre (id = 1)
function checarSeGerenteMestre(req, res, next) {
  if (req.user.id !== 1) {
    return res.status(403).json({ erro: 'Acesso restrito ao gerente mestre.' });
  }
  next();
}

// Rota para listar IDs dos gerentes (para o painel)
app.get('/api/gerentes', requireAuth, checarSeGerenteMestre, async (req, res) => {
  try {
    const resultado = await pool.query('SELECT usuario_id FROM gerentes');
    const gerentesIds = resultado.rows.map(row => row.usuario_id);
    res.json(gerentesIds);
  } catch (err) {
    console.error('Erro ao buscar gerentes:', err);
    res.status(500).json({ erro: 'Erro ao buscar gerentes' });
  }
});


// GET - Listar todos os usuários (apenas gerente mestre - ID = 1)
app.get('/api/usuarios', requireAuth, checarSeGerenteMestre, async (req, res) => {
  try {
    const resultado = await pool.query('SELECT id, nome, email FROM usuarios ORDER BY nome');
    res.json(resultado.rows);
  } catch (err) {
    console.error('Erro ao buscar usuários:', err);
    res.status(500).json({ erro: 'Erro ao buscar usuários' });
  }
});


// POST - Promover usuário a gerente
app.post('/api/promover-gerente', requireAuth, checarSeGerenteMestre, async (req, res) => {
  const { usuarioId } = req.body;
  try {
    await pool.query('INSERT INTO gerentes (usuario_id) VALUES ($1) ON CONFLICT DO NOTHING', [usuarioId]);
    res.json({ mensagem: 'Usuário promovido a gerente.' });
  } catch (err) {
    console.error('Erro ao promover gerente:', err);
    res.status(500).json({ erro: 'Erro ao promover gerente' });
  }
});


// DELETE - Remover usuário da lista de gerentes
app.post('/api/remover-gerente', requireAuth, checarSeGerenteMestre, async (req, res) => {
  const { usuarioId } = req.body;
  try {
    await pool.query('DELETE FROM gerentes WHERE usuario_id = $1', [usuarioId]);
    res.json({ mensagem: 'Gerente removido com sucesso.' });
  } catch (err) {
    console.error('Erro ao remover gerente:', err);
    res.status(500).json({ erro: 'Erro ao remover gerente' });
  }
});

// ==========================

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
