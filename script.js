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
let funcionariosFiltrados = [];
let funcionarioSelecionado = null;
let excluirId = null;
let termoPesquisa = '';

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    carregarFuncionarios();
    renderizarSidebar();
    renderizarChecklist();
    atualizarTotalFuncionarios();

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

// Função para ordenar funcionários por matrícula (crescente)
function ordenarFuncionariosPorMatricula(funcsArray) {
    return funcsArray.sort((a, b) => {
        // Extrair números da matrícula para comparação numérica
        const numA = parseInt(a[1].matricula.replace(/\D/g, '')) || 0;
        const numB = parseInt(b[1].matricula.replace(/\D/g, '')) || 0;
        return numA - numB;
    });
}

// Função para filtrar funcionários
function filtrarFuncionarios() {
    termoPesquisa = document.getElementById('pesquisaFuncionario').value.toLowerCase().trim();
    renderizarSidebar();
}

// Função para atualizar contador total de funcionários
function atualizarTotalFuncionarios() {
    const total = Object.keys(funcionarios).length;
    document.getElementById('totalFuncionarios').textContent = total;
}

// Funções de renderização
function renderizarSidebar() {
    const lista = document.getElementById('funcionariosLista');
    lista.innerHTML = '';

    // Converter para array e ordenar
    let funcionariosArray = Object.entries(funcionarios);
    funcionariosArray = ordenarFuncionariosPorMatricula(funcionariosArray);

    // Aplicar filtro de pesquisa
    if (termoPesquisa) {
        funcionariosArray = funcionariosArray.filter(([_, func]) => 
            func.matricula.toLowerCase().includes(termoPesquisa) ||
            func.nome.toLowerCase().includes(termoPesquisa)
        );
    }

    if (funcionariosArray.length === 0) {
        lista.innerHTML = '<p style="color: #6b7a8f; text-align: center; padding: 20px;">Nenhum funcionário encontrado</p>';
        return;
    }

    funcionariosArray.forEach(([id, func]) => {
        const status = calcularStatus(func.checklist);
        const statusClass = status === 100 ? 'verde' : status > 0 ? 'amarelo' : 'cinza';
        const totalItens = Object.keys(func.checklist || {}).length;
        const itensMarcados = Object.values(func.checklist || {}).filter(v => v).length;

        const item = document.createElement('div');
        item.className = 'funcionario-item';
        item.onclick = () => carregarFuncionario(id);

        item.innerHTML = `
            <div class="funcionario-info">
                <div class="funcionario-matricula">${func.matricula || 'Sem matrícula'}</div>
                <div class="funcionario-nome">${func.nome || 'Sem nome'}</div>
                ${func.cargo ? `<div class="funcionario-cargo">${func.cargo}</div>` : ''}
            </div>
            <div class="funcionario-right">
                <span class="status-badge ${statusClass}"></span>
                <span class="status-tooltip ${statusClass}">${status}% (${itensMarcados}/${totalItens})</span>
                <button class="btn-excluir" onclick="event.stopPropagation(); abrirModalExclusao('${id}')">✕</button>
            </div>
        `;

        lista.appendChild(item);
    });

    atualizarTotalFuncionarios();
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
    const cargo = document.getElementById('cargo').value.trim();

    if (!matricula || !nome) {
        alert('Preencha matrícula e nome!');
        return;
    }

    const id = Date.now().toString();
    funcionarios[id] = {
        matricula,
        nome,
        cargo: cargo || '',
        checklist: criarChecklistVazio()
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
    document.getElementById('cargo').value = func.cargo || '';
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
    
    // Atualizar cargo também
    const cargo = document.getElementById('cargo').value.trim();
    funcionario.cargo = cargo;

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
    const totalItens = Object.keys(checklist).length;
    const itensMarcados = Object.values(checklist).filter(v => v).length;
    const percentual = totalItens > 0 ? Math.round((itensMarcados / totalItens) * 100) : 0;

    let relatorio = `CHECKLIST ADMISSIONAL\n`;
    relatorio += `================================\n\n`;
    relatorio += `Matrícula: ${func.matricula}\n`;
    relatorio += `Nome: ${func.nome}\n`;
    relatorio += `Cargo: ${func.cargo || 'Não informado'}\n`;
    relatorio += `Progresso: ${percentual}% (${itensMarcados}/${totalItens})\n\n`;
    relatorio += `================================\n\n`;

    for (const [categoria, itens] of Object.entries(CHECKLIST_ESTRUTURA)) {
        if (itens.length === 0) continue;

        relatorio += `${categoria}:\n`;
        relatorio += `--------------------------------\n`;
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

function exportarPDF() {
    if (!funcionarioSelecionado) {
        alert('Selecione um funcionário!');
        return;
    }

    const func = funcionarios[funcionarioSelecionado];
    const checklist = func.checklist || {};
    const totalItens = Object.keys(checklist).length;
    const itensMarcados = Object.values(checklist).filter(v => v).length;
    const percentual = totalItens > 0 ? Math.round((itensMarcados / totalItens) * 100) : 0;

    // Criar documento PDF
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    let y = 20;
    const lineHeight = 7;
    const marginLeft = 15;
    
    // Título
    doc.setFontSize(18);
    doc.setTextColor(0, 200, 83);
    doc.text('ADMCHECK - Checklist Admissional', marginLeft, y);
    y += lineHeight * 2;
    
    // Linha separadora
    doc.setDrawColor(63, 72, 84);
    doc.line(marginLeft, y - 3, 195, y - 3);
    
    // Informações do funcionário
    doc.setFontSize(12);
    doc.setTextColor(255, 255, 255);
    doc.text(`Matrícula: ${func.matricula}`, marginLeft, y);
    y += lineHeight;
    doc.text(`Nome: ${func.nome}`, marginLeft, y);
    y += lineHeight;
    doc.text(`Cargo: ${func.cargo || 'Não informado'}`, marginLeft, y);
    y += lineHeight;
    
    // Progresso
    const statusColor = percentual === 100 ? [0, 200, 83] : percentual > 0 ? [255, 214, 0] : [107, 114, 128];
    doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
    doc.text(`Progresso: ${percentual}% (${itensMarcados}/${totalItens})`, marginLeft, y);
    y += lineHeight * 1.5;
    
    // Linha separadora
    doc.setDrawColor(63, 72, 84);
    doc.line(marginLeft, y - 3, 195, y - 3);
    
    // Checklist
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    
    for (const [categoria, itens] of Object.entries(CHECKLIST_ESTRUTURA)) {
        if (itens.length === 0) continue;
        
        // Verificar se precisa de nova página
        if (y > 270) {
            doc.addPage();
            y = 20;
        }
        
        // Categoria
        doc.setFontSize(11);
        doc.setTextColor(183, 196, 217);
        doc.text(`🔹 ${categoria}`, marginLeft, y);
        y += lineHeight;
        
        // Itens
        doc.setFontSize(9);
        doc.setTextColor(204, 215, 233);
        
        itens.forEach(item => {
            // Verificar se precisa de nova página
            if (y > 270) {
                doc.addPage();
                y = 20;
            }
            
            const marcado = checklist[item] ? '[X]' : '[ ]';
            doc.text(`${marcado} ${item}`, marginLeft + 5, y);
            y += lineHeight;
        });
        
        y += lineHeight / 2;
    }
    
    // Rodapé
    doc.setFontSize(8);
    doc.setTextColor(107, 122, 143);
    doc.text('ADMCHECK - Sistema de Checklist Admissional', marginLeft, 285);
    doc.text(new Date().toLocaleDateString('pt-BR'), 170, 285);
    
    // Salvar PDF
    doc.save(`${func.matricula}_${func.nome.replace(/\s+/g, '_')}.pdf`);
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
            document.getElementById('cargo').value = '';
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
    document.getElementById('cargo').value = '';
}
