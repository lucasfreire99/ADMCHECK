// Estrutura do checklist
const CHECKLIST_ESTRUTURA = {
    "DOCUMENTOS OBRIGATÓRIOS": [
        "Currículo atualizado",
        "01 Foto 3x4",
        "CTPS Digital",
        "RG – Frente e Verso",
        "CPF",
        "Título de Eleitor",
        "Comprovante de Residência Atual",
        "Certificado de Dispensa de Incorporação (Reservista)",
        "Cartão PIS + Consulta de Qualificação Cadastral",
        "Comprovante de Situação Cadastral do CPF",
        "Atestado de Antecedentes Criminais (Original)",
        "Conta Bancária – Bradesco ou Next",
        "Certificados de Cursos Profissionalizantes",
        "CNH (quando aplicável à função)",
        "Exame Toxicológico (para função motorista)",
        "Curso de Direção Defensiva (para função motorista)",
        "Curso de Primeiros Socorros (para função motorista)",
        "Cartão de Vacina",
        "Atestado Médico Admissional"
    ],
    "DOCUMENTOS OPCIONAIS / CONDICIONAIS": [],
    "Escolaridade": [
        "Ensino Fundamental",
        "Ensino Médio",
        "Ensino Superior",
        "Pós-Graduação",
        "Mestrado",
        "Doutorado"
    ],
    "Registro Profissional": [
        "Registro Profissional (quando profissão regulamentada)",
        "Registro Profissional Pendente"
    ],
    "Dependentes": [
        "RG e CPF do Cônjuge",
        "Certidão de Casamento / União Estável",
        "RG e CPF dos Filhos",
        "Cartão de Vacina dos Filhos",
        "Declaração Escolar dos Filhos"
    ]
};

// Estado global
let funcionarios = {};
let funcionarioSelecionado = null;
let excluirId = null;

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    carregarFuncionarios();
    renderizarSidebar();
    renderizarChecklist();

    // Fechar modal com ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            fecharModal();
        }
    });
});

// Funções de persistência
function carregarFuncionarios() {
    const dados = localStorage.getItem('admcheck_funcionarios');
    funcionarios = dados ? JSON.parse(dados) : {};
}

function salvarFuncionarios() {
    localStorage.setItem('admcheck_funcionarios', JSON.stringify(funcionarios));
}

// Função para criar checklist vazio
function criarChecklistVazio() {
    const checklist = {};
    for (const itens of Object.values(CHECKLIST_ESTRUTURA)) {
        itens.forEach(item => {
            checklist[item] = false;
        });
    }
    return checklist;
}

// Funções de renderização
function renderizarSidebar() {
    const lista = document.getElementById('funcionariosLista');
    lista.innerHTML = '';

    Object.entries(funcionarios).forEach(([id, func]) => {
        const status = calcularStatus(func.checklist);
        const statusClass = status === 100 ? 'verde' : status > 0 ? 'amarelo' : 'cinza';

        const item = document.createElement('div');
        item.className = 'funcionario-item';
        item.onclick = () => carregarFuncionario(id);

        item.innerHTML = `
            <div class="funcionario-info">
                <div class="funcionario-matricula">${func.matricula || 'Sem matrícula'}</div>
                <div class="funcionario-nome">${func.nome || 'Sem nome'}</div>
            </div>
            <div class="funcionario-right">
                <span class="status-badge ${statusClass}"></span>
                <button class="btn-excluir" onclick="event.stopPropagation(); abrirModalExclusao('${id}')">✕</button>
            </div>
        `;

        lista.appendChild(item);
    });
}

function renderizarChecklist() {
    const container = document.getElementById('checklistContainer');
    container.innerHTML = '';

    if (!funcionarioSelecionado || !funcionarios[funcionarioSelecionado]) {
        container.innerHTML = '<p style="color: #6b7a8f; text-align: center; padding: 40px;">Selecione um funcionário para visualizar o checklist</p>';
        return;
    }

    const funcionario = funcionarios[funcionarioSelecionado];
    const checklist = funcionario.checklist || {};

    for (const [categoria, itens] of Object.entries(CHECKLIST_ESTRUTURA)) {
        if (itens.length === 0) continue;

        const categoriaDiv = document.createElement('div');
        categoriaDiv.className = 'checklist-categoria';

        const titulo = document.createElement('h3');
        titulo.className = 'categoria-titulo';
        titulo.textContent = `🔹 ${categoria}`;
        categoriaDiv.appendChild(titulo);

        itens.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'checklist-item';

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `check_${item.replace(/\s+/g, '_').replace(/[^\w]/g, '_')}`;
            checkbox.checked = checklist[item] || false;
            checkbox.onchange = () => atualizarStatusAposMudanca();

            const label = document.createElement('label');
            label.htmlFor = checkbox.id;
            label.textContent = item;

            itemDiv.appendChild(checkbox);
            itemDiv.appendChild(label);
            categoriaDiv.appendChild(itemDiv);
        });

        container.appendChild(categoriaDiv);
    }
}

// Funções de funcionários
function criarFuncionario() {
    const matricula = document.getElementById('matricula').value.trim();
    const nome = document.getElementById('nome').value.trim();

    if (!matricula || !nome) {
        alert('Preencha matrícula e nome!');
        return;
    }

    const id = Date.now().toString();
    funcionarios[id] = {
        matricula,
        nome,
        checklist: criarChecklistVazio() // Agora cria o checklist vazio
    };

    salvarFuncionarios();
    renderizarSidebar();
    funcionarioSelecionado = id;
    carregarFuncionario(id);
    limparCampos();
}

function carregarFuncionario(id) {
    const func = funcionarios[id];
    if (!func) return;

    funcionarioSelecionado = id;
    document.getElementById('matricula').value = func.matricula;
    document.getElementById('nome').value = func.nome;
    renderizarChecklist();
}

function salvarChecklist() {
    if (!funcionarioSelecionado) {
        alert('Selecione um funcionário!');
        return;
    }

    const funcionario = funcionarios[funcionarioSelecionado];
    const checklist = {};

    // Pega todos os itens do checklist atual
    for (const itens of Object.values(CHECKLIST_ESTRUTURA)) {
        itens.forEach(item => {
            const checkbox = document.getElementById(`check_${item.replace(/\s+/g, '_').replace(/[^\w]/g, '_')}`);
            if (checkbox) {
                checklist[item] = checkbox.checked;
            }
        });
    }

    funcionario.checklist = checklist;
    salvarFuncionarios();
    renderizarSidebar();
}

function atualizarStatusAposMudanca() {
    if (funcionarioSelecionado) {
        salvarChecklist();
    }
}

// Funções de status
function calcularStatus(checklist) {
    if (!checklist) return 0;
    
    const itens = Object.values(checklist);
    if (itens.length === 0) return 0;

    const marcados = itens.filter(v => v).length;
    return Math.round((marcados / itens.length) * 100);
}

// Funções de exportação
function gerarRelatorio() {
    if (!funcionarioSelecionado) {
        alert('Selecione um funcionário!');
        return null;
    }

    const func = funcionarios[funcionarioSelecionado];
    const checklist = func.checklist || {};

    let relatorio = `CHECKLIST ADMISSIONAL\n`;
    relatorio += `Matrícula: ${func.matricula}\n`;
    relatorio += `Nome: ${func.nome}\n\n`;

    for (const [categoria, itens] of Object.entries(CHECKLIST_ESTRUTURA)) {
        if (itens.length === 0) continue;

        relatorio += `${categoria}:\n`;
        itens.forEach(item => {
            const marcado = checklist[item] ? '[X]' : '[ ]';
            relatorio += `${marcado} ${item}\n`;
        });
        relatorio += '\n';
    }

    return relatorio;
}

function exportarTxt() {
    const relatorio = gerarRelatorio();
    if (!relatorio) return;

    const func = funcionarios[funcionarioSelecionado];
    const blob = new Blob([relatorio], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${func.matricula}_${func.nome.replace(/\s+/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
}

function copiarRelatorio() {
    const relatorio = gerarRelatorio();
    if (!relatorio) return;

    navigator.clipboard.writeText(relatorio).then(() => {
        alert('Relatório copiado para a área de transferência!');
    }).catch(() => {
        alert('Erro ao copiar relatório!');
    });
}

// Funções do modal
function abrirModalExclusao(id) {
    excluirId = id;
    document.getElementById('modal').classList.add('show');
}

function fecharModal() {
    document.getElementById('modal').classList.remove('show');
    excluirId = null;
}

function confirmarExclusao() {
    if (excluirId) {
        delete funcionarios[excluirId];
        salvarFuncionarios();

        if (funcionarioSelecionado === excluirId) {
            funcionarioSelecionado = null;
            document.getElementById('matricula').value = '';
            document.getElementById('nome').value = '';
            renderizarChecklist();
        }

        renderizarSidebar();
        fecharModal();
    }
}

// Funções auxiliares
function limparCampos() {
    document.getElementById('matricula').value = '';
    document.getElementById('nome').value = '';
}