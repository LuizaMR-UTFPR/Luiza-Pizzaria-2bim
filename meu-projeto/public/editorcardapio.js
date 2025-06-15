const form = document.getElementById('formPizza');
const lista = document.getElementById('listaPizzas');
const nomeInput = document.getElementById('nome');
const ingredientesInput = document.getElementById('ingredientes');
const precoInput = document.getElementById('preco');
const pizzaIdInput = document.getElementById('pizzaId');

async function carregarPizzas() {
  const res = await fetch('/api/pizzas');
  const pizzas = await res.json();

  lista.innerHTML = '';
  pizzas.forEach(pizza => {
    const li = document.createElement('li');
    li.innerHTML = `
      <strong>${pizza.nome}</strong> - R$ ${parseFloat(pizza.preco).toFixed(2)}<br>
      Ingredientes: ${pizza.ingredientes}<br>
      <button onclick="editarPizza(${pizza.id}, '${pizza.nome}', '${pizza.ingredientes.replace(/'/g, "\\'")}', ${pizza.preco})">Editar</button>
      <button onclick="deletarPizza(${pizza.id})">Excluir</button>
    `;
    lista.appendChild(li);
  });
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = pizzaIdInput.value;
  const nome = nomeInput.value;
  const ingredientes = ingredientesInput.value;
  const preco = parseFloat(precoInput.value);

  const dados = { nome, ingredientes, preco };

  if (id) {
    // Atualizar
    await fetch(`/api/pizzas/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados)
    });
  } else {
    // Criar
    await fetch('/api/pizzas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados)
    });
  }

  form.reset();
  pizzaIdInput.value = '';
  carregarPizzas();
});

function editarPizza(id, nome, ingredientes, preco) {
  pizzaIdInput.value = id;
  nomeInput.value = nome;
  ingredientesInput.value = ingredientes;
  precoInput.value = preco;
}

async function deletarPizza(id) {
  if (confirm('Deseja realmente excluir esta pizza?')) {
    await fetch(`/api/pizzas/${id}`, { method: 'DELETE' });
    carregarPizzas();
  }
}

carregarPizzas();
