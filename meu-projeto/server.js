const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const path = require('path');
const jwt = require('jsonwebtoken');
const fs = require('fs');

const app = express();
const PORT = 3000;
const JWT_SECRET = 'segredo_super_secreto';

// Cria pasta de uploads se não existir
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
  console.log('Pasta uploads criada automaticamente');
}

// Conexão com o PostgreSQL
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

// Middleware: apenas gerente mestre (id = 1)
function checarSeGerenteMestre(req, res, next) {
  if (req.user.id !== 1) {
    return res.status(403).json({ erro: 'Acesso restrito ao gerente mestre.' });
  }
  next();
}

// Redireciona raiz para a página de cadastro
app.get('/', (req, res) => {
  res.redirect('/cadastro.html');
});

// ==================
// ROTAS DE USUÁRIO
// ==================

// Cadastro de usuário
app.post('/cadastro', async (req, res) => {
  const { nome, email, senha } = req.body;
  try {
    await pool.query(
      'INSERT INTO usuarios (nome, email, senha) VALUES ($1, $2, $3)',
      [nome, email, senha]
    );
    res.redirect('/login.html');
  } catch (err) {
    res.status(500).send('Erro ao cadastrar: ' + err.message);
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

    if (resultado.rows.length === 0)
      return res.status(401).json({ erro: 'Usuário não encontrado' });

    const user = resultado.rows[0];
    if (senha !== user.senha)
      return res.status(401).json({ erro: 'Senha incorreta' });

    const gerenteRes = await pool.query(
      'SELECT 1 FROM gerentes WHERE usuario_id = $1',
      [user.id]
    );
    const eGerente = gerenteRes.rowCount > 0;

    const token = jwt.sign(
      { id: user.id, email: user.email, nome: user.nome },
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

// ==================
// ROTAS DE CONTEÚDO PÚBLICO
// ==================

// Destaques do carrossel superior
app.get('/api/destaques', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM carrossel_topo ORDER BY id');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao buscar destaques do topo' });
  }
});

// ==================
// CRUD de PIZZAS
// ==================

const pizzaRouter = express.Router();

pizzaRouter.get('/api/pizzas', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM pizzas ORDER BY id');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar pizzas.' });
  }
});

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


// ==================
// CRUD de COMBOS
// ==================

const comboRouter = express.Router();

comboRouter.get('/api/combos', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM combos ORDER BY id');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar combos.' });
  }
});

comboRouter.post('/api/combos', async (req, res) => {
  const { nome, itens, preco } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO combos (nome, itens, preco) VALUES ($1, $2, $3) RETURNING *',
      [nome, itens, preco]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao adicionar combo.' });
  }
});

comboRouter.put('/api/combos/:id', async (req, res) => {
  const { id } = req.params;
  const { nome, itens, preco } = req.body;
  try {
    const result = await pool.query(
      'UPDATE combos SET nome = $1, itens = $2, preco = $3 WHERE id = $4 RETURNING *',
      [nome, itens, preco, id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar combo.' });
  }
});

comboRouter.delete('/api/combos/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM combos WHERE id = $1', [id]);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar combo.' });
  }
});

app.use(comboRouter);


// ==================
// GERENCIAMENTO DE USUÁRIOS (restrito ao gerente mestre)
// ==================

app.get('/api/gerentes', requireAuth, checarSeGerenteMestre, async (req, res) => {
  try {
    const resultado = await pool.query('SELECT usuario_id FROM gerentes');
    res.json(resultado.rows.map(row => row.usuario_id));
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao buscar gerentes' });
  }
});

app.get('/api/usuarios', requireAuth, checarSeGerenteMestre, async (req, res) => {
  try {
    const resultado = await pool.query('SELECT id, nome, email FROM usuarios ORDER BY nome');
    res.json(resultado.rows);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao buscar usuários' });
  }
});

app.post('/api/promover-gerente', requireAuth, checarSeGerenteMestre, async (req, res) => {
  const { usuarioId } = req.body;
  try {
    await pool.query(
      'INSERT INTO gerentes (usuario_id) VALUES ($1) ON CONFLICT DO NOTHING',
      [usuarioId]
    );
    res.json({ mensagem: 'Usuário promovido a gerente.' });
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao promover gerente' });
  }
});

app.post('/api/remover-gerente', requireAuth, checarSeGerenteMestre, async (req, res) => {
  const { usuarioId } = req.body;
  try {
    await pool.query('DELETE FROM gerentes WHERE usuario_id = $1', [usuarioId]);
    res.json({ mensagem: 'Gerente removido com sucesso.' });
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao remover gerente' });
  }
});

// ==================
// PEDIDOS
// ==================

app.post('/api/pedidos', requireAuth, async (req, res) => {
  const { nome_pizza, tamanho, preco } = req.body;

  if (!nome_pizza || !tamanho || preco == null) {
    return res.status(400).json({ message: 'Dados incompletos.' });
  }

  try {
    const nome_cliente = req.user.email;
    await pool.query(
      'INSERT INTO pedidos (nome_cliente, nome_pizza, tamanho, preco) VALUES ($1, $2, $3, $4)',
      [nome_cliente, nome_pizza, tamanho, preco]
    );
    res.status(201).json({ message: 'Pedido registrado com sucesso!' });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao salvar pedido.' });
  }
});

// ==================
// ROTAS DO CARROSSEL (carregadas de outro arquivo)
// ==================
const carrosselTopoRoutes = require('./carrosselTopoRoutes');
app.use('/api', carrosselTopoRoutes);

// ==================
// INICIAR SERVIDOR
// ==================

app.get('/api/usuario-logado', requireAuth, async (req, res) => {
  try {
    const { id } = req.user;
    const result = await pool.query('SELECT nome, email FROM usuarios WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ erro: 'Usuário não encontrado.' });

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Erro ao buscar usuário logado:', err);
    res.status(500).json({ erro: 'Erro ao buscar usuário logado.' });
  }
});

// Funções para gerar o payload PIX (pode colocar fora da rota, acima)
function formatField(id, value) {
  const length = value.length.toString().padStart(2, '0');
  return id + length + value;
}

function crc16(str) {
  let crc = 0xFFFF;
  for (let c = 0; c < str.length; c++) {
    crc ^= str.charCodeAt(c) << 8;
    for (let i = 0; i < 8; i++) {
      if ((crc & 0x8000) !== 0) {
        crc = (crc << 1) ^ 0x1021;
      } else {
        crc <<= 1;
      }
      crc &= 0xFFFF;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

app.get('/api/pix-payload', (req, res) => {
  const valorRaw = req.query.valor;
  if (!valorRaw) return res.status(400).json({ erro: 'Parâmetro valor é obrigatório' });

  const valor = Number(valorRaw);
  if (isNaN(valor) || valor <= 0) {
    return res.status(400).json({ erro: 'Valor inválido' });
  }

  // Dados fixos do recebedor, coloque conforme sua necessidade
  const chavePix = '02964990999'; // Sua chave PIX
  const nomeRecebedor = 'Celso Mainko';
  const cidade = 'SAO PAULO';
  const descricao = 'Pagamento Doceria Pink Delfins';

  let payload =
    formatField("00", "01") + // Payload Format Indicator
    formatField("26",  // Merchant Account Information
      formatField("00", "BR.GOV.BCB.PIX") + // GUI
      formatField("01", chavePix) +          // Chave Pix
      formatField("02", descricao)           // Descrição
    ) +
    formatField("52", "0000") +               // Merchant Category Code (default)
    formatField("53", "986") +                // Currency (BRL)
    formatField("54", valor.toFixed(2)) +    // Valor
    formatField("58", "BR") +                 // País
    formatField("59", nomeRecebedor) +       // Nome do recebedor
    formatField("60", cidade) +               // Cidade do recebedor
    formatField("62", "") +                   // Dados adicionais (campo obrigatório, mesmo vazio)
    "6304";                                  // CRC inicia aqui

  const crc = crc16(payload);
  const payloadFinal = payload + crc;

  res.json({ payload: payloadFinal });
});



app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
