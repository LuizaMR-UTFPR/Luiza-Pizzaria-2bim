const form = document.getElementById('formCombo');
const lista = document.getElementById('listaCombos');

let editandoId = null;

const token = JSON.parse(localStorage.getItem('usuarioLogado'))?.token;

async function carregarCombos() {
  const res = await fetch('/api/combos');
  const combos = await res.json();
  renderCombos(combos);
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const nome = document.getElementById('nomeCombo').value;
  const itens = document.getElementById('itens').value;
  const preco = parseFloat(document.getElementById('precoCombo').value).toFixed(2);

  const combo = { nome, itens, preco };

  try {
    if (editandoId) {
      await fetch(`/api/combos/${editandoId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(combo)
      });
      editandoId = null;
    } else {
      await fetch('/api/combos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(combo)
      });
    }

    form.reset();
    carregarCombos();
  } catch (err) {
    console.error('Erro ao salvar combo:', err);
    alert('Erro ao salvar combo.');
  }
});

function renderCombos(combos) {
  lista.innerHTML = '';

  combos.forEach(combo => {
    const li = document.createElement('li');
    li.innerHTML = `
      <strong>${combo.nome}</strong><br />
      Itens: ${combo.itens}<br />
      Preço: R$ ${parseFloat(combo.preco).toFixed(2)}<br />
      <button onclick="editarCombo(${combo.id}, '${combo.nome}', '${combo.itens}', ${combo.preco})">Editar</button>
      <button onclick="excluirCombo(${combo.id})">Excluir</button>
    `;
    lista.appendChild(li);
  });
}

function editarCombo(id, nome, itens, preco) {
  document.getElementById('nomeCombo').value = nome;
  document.getElementById('itens').value = itens;
  document.getElementById('precoCombo').value = preco;
  editandoId = id;
}

async function excluirCombo(id) {
  try {
    await fetch(`/api/combos/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    carregarCombos();
  } catch (err) {
    console.error('Erro ao excluir combo:', err);
    alert('Erro ao excluir combo.');
  }
}

carregarCombos();
