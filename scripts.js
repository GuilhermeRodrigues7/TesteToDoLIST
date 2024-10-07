// Seleção dos elementos do DOM
const button = document.querySelector('.button-add-task');
const input = document.querySelector('.input-task');
const listacompleta = document.querySelector('.list-tasks');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');
const logoutButton = document.getElementById('logout-button'); // Botão de logout
const buscaInput = document.querySelector('.input-busca'); // Campo de busca
const prioridadeSelect = document.querySelector('.select-prioridade'); // Filtro de prioridade
const inputData = document.querySelector('.input-data'); // Campo de data de vencimento
const exportButton = document.getElementById('export-button'); // Botão de exportação
const importButton = document.getElementById('import-button'); // Botão de importação
const importFile = document.getElementById('import-file'); // Campo de importação de arquivo
const themeToggle = document.getElementById('theme-toggle'); // Botão de alternar tema

// Inicialização da lista de itens
let minhaListadeitens = [];
let itemEditando = null; // Variável para rastrear o item que está sendo editado

// Credenciais pré-definidas
const usuarioCorreto = "usuario";
const senhaCorreta = "senha";

// Função para mostrar notificações
function mostrarNotificacao(mensagem) {
    const notificacao = document.createElement('div');
    notificacao.textContent = mensagem;
    notificacao.className = 'notificacao';
    document.body.appendChild(notificacao);

    setTimeout(() => {
        notificacao.remove();
    }, 3000); // Dura 3 segundos
}

// Função para adicionar ou editar uma tarefa
function AdicionarOuEditarTarefa() {
    const tarefa = input.value.trim();
    const dataVencimento = inputData.value; // Pega a data de vencimento

    if (tarefa === '') {
        alert('O campo de tarefa não pode estar vazio!');
        return; 
    }

    if (itemEditando !== null) {
        // Atualiza a tarefa existente
        minhaListadeitens[itemEditando] = {
            tarefa: tarefa,
            dataVencimento: dataVencimento,
            prioridade: prioridadeSelect.value,
            concluida: minhaListadeitens[itemEditando].concluida
        };
        itemEditando = null; // Reseta a edição
        mostrarNotificacao('Tarefa editada com sucesso!');
    } else {
        // Adiciona nova tarefa
        minhaListadeitens.push({
            tarefa: tarefa,
            dataVencimento: dataVencimento,
            prioridade: prioridadeSelect.value,
            concluida: false
        });
        mostrarNotificacao('Tarefa adicionada com sucesso!');
    }

    input.value = ''; // Limpa o campo de entrada
    inputData.value = ''; // Limpa o campo de data
    prioridadeSelect.value = ''; // Limpa o campo de prioridade
    mostrarTarefas(); // Atualiza a lista de tarefas
}

// Função para mostrar as tarefas
function mostrarTarefas() {
    const busca = buscaInput.value.toLowerCase();
    const prioridade = prioridadeSelect.value;

    let novaLi = '';

    minhaListadeitens.forEach((item, posicao) => {
        // Filtra tarefas com base na busca e na prioridade
        if (item.tarefa.toLowerCase().includes(busca) && 
            (prioridade === '' || item.prioridade === prioridade)) {
            novaLi += `
                <li class="task ${item.concluida ? "done" : ""}">
                    <img src="./img/checked.png" alt="check-na-tarefa" onclick="concluirTarefa(${posicao})">
                    <p>${item.tarefa}</p>
                    <p>Vencimento: ${item.dataVencimento || 'Sem data'}</p>
                    <p>Prioridade: ${item.prioridade || 'Sem prioridade'}</p>
                    <img src="./img/editar.png" alt="editar-tarefa" onclick="editarTarefa(${posicao})" style="cursor: pointer; height: 25px; margin-left: 10px;"> <!-- Botão de edição -->
                    <img src="./img/trash.png" alt="tarefa-para-o-lixo" onclick="deletaritem(${posicao})"> 
                </li>
            `;
        }
    });

    listacompleta.innerHTML = novaLi;
    localStorage.setItem('lista', JSON.stringify(minhaListadeitens)); // Salva a lista no localStorage
}

// Função para marcar uma tarefa como concluída
function concluirTarefa(posicao) { 
    minhaListadeitens[posicao].concluida = !minhaListadeitens[posicao].concluida;
    mostrarTarefas(); // Atualiza a lista de tarefas
}

// Função para deletar uma tarefa
function deletaritem(posicao) {
    minhaListadeitens.splice(posicao, 1);
    mostrarTarefas(); // Atualiza a lista de tarefas
    mostrarNotificacao('Tarefa deletada com sucesso!');
}

// Função para editar uma tarefa
function editarTarefa(posicao) {
    const tarefaAtual = minhaListadeitens[posicao];
    input.value = tarefaAtual.tarefa; // Preenche o campo de tarefa
    inputData.value = tarefaAtual.dataVencimento; // Preenche a data de vencimento
    prioridadeSelect.value = tarefaAtual.prioridade; // Preenche a prioridade
    itemEditando = posicao; // Define qual tarefa está sendo editada
}

// Função para recarregar as tarefas do localStorage
function recarregarTarefas() {
    const tarefasdolocalstorage = localStorage.getItem('lista');

    if (tarefasdolocalstorage) {
        minhaListadeitens = JSON.parse(tarefasdolocalstorage);
    }

    mostrarTarefas(); // Mostra as tarefas carregadas
}

// Função para exportar tarefas
exportButton.addEventListener('click', function() {
    const dataStr = JSON.stringify(minhaListadeitens);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tarefas.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
});

// Função para importar tarefas
importButton.addEventListener('click', function() {
    importFile.click();
});

importFile.addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                minhaListadeitens = JSON.parse(e.target.result);
                mostrarTarefas();
                mostrarNotificacao('Tarefas importadas com sucesso!');
            } catch (error) {
                alert('Erro ao importar as tarefas. O arquivo pode estar corrompido.');
            }
        };
        reader.readAsText(file);
    }
});

// Função para lidar com o login
loginForm.addEventListener('submit', function(event) {
    event.preventDefault(); // Previne o envio do formulário

    const usuario = loginForm[0].value;
    const senha = loginForm[1].value;

    // Verifica se as credenciais estão corretas
    if (usuario === usuarioCorreto && senha === senhaCorreta) {
        document.querySelector('.login-container').style.display = 'none';
        document.querySelector('.container').style.display = 'block';
        loginError.style.display = 'none'; // Esconde a mensagem de erro
    } else {
        loginError.textContent = "Usuário ou senha incorretos!";
        loginError.style.display = 'block';
    }
});

// Função para voltar à tela de login
logoutButton.addEventListener('click', function() {
    document.querySelector('.login-container').style.display = 'block';
    document.querySelector('.container').style.display = 'none';
    loginForm.reset(); // Reseta o formulário de login
    loginError.style.display = 'none'; // Esconde a mensagem de erro
});

// Chama a função para carregar as tarefas ao iniciar
recarregarTarefas();

// Adiciona o evento de clique no botão para adicionar ou editar nova tarefa
button.addEventListener('click', AdicionarOuEditarTarefa);

// Adiciona eventos de input para busca e filtro
buscaInput.addEventListener('input', mostrarTarefas);
prioridadeSelect.addEventListener('change', mostrarTarefas);

// Função para alternar entre tema claro e escuro
themeToggle.addEventListener('click', function() {
    document.body.classList.toggle('dark');
    document.querySelector('.container').classList.toggle('dark');
});

// Remova as seguintes linhas que estavam incorretas
// document.body.classList.toggle('dark'); // Alterna entre tema claro e escuro
// taskElement.classList.toggle('done'); // Adiciona ou remove a classe
