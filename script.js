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

// Itens que podem ser "Não Aplicável"
const ITENS_NAO_APLICAVEIS = [
    "Certificado de Dispensa de Incorporação (Reservista)",
    "Certificados de Cursos Profissionalizantes",
    "Registro Profissional (quando profissão regulamentada)",
    "CNH (quando aplicável à função)",
    "Exame Toxicológico (para função motorista)",
    "Curso de Direção Defensiva (para função motorista)",
    "Curso de Primeiros Socorros (para função motorista)"
];

// Estado global
let funcionarios = {};
let funcionariosFiltrados = [];
let funcionarioSelecionado = null;
let excluirId = null;
let termoPesquisa = '';
let sidebarCollapsed = false;

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

    // Carregar estado da sidebar
    const savedState = localStorage.getItem('sidebar_collapsed');
    if (savedState === 'true') {
        toggleSidebar();
    }
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
            if (ITENS_NAO_APLICAVEIS.includes(item)) {
                checklist[item] = { status: false, naoAplicavel: false };
            } else {
                checklist[item] = false;
            }
        });
    }
    return checklist;
}

// Função para ordenar funcionários por matrícula (crescente)
function ordenarFuncionariosPorMatricula(funcsArray) {
    return funcsArray.sort((a, b) => {
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

// Função para toggle da sidebar
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const toggleIcon = document.getElementById('sidebarToggleIcon');
    
    sidebarCollapsed = !sidebarCollapsed;
    sidebar.classList.toggle('collapsed', sidebarCollapsed);
    toggleIcon.textContent = sidebarCollapsed ? '▶' : '◀';
    
    localStorage.setItem('sidebar_collapsed', sidebarCollapsed);
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
            func.nome.toLowerCase().includes(termoPesquisa) ||
            (func.setor && func.setor.toLowerCase().includes(termoPesquisa))
        );
    }

    if (funcionariosArray.length === 0) {
        lista.innerHTML = '<p style="color: #6b7a8f; text-align: center; padding: 20px;">Nenhum funcionário encontrado</p>';
        return;
    }

    funcionariosArray.forEach(([id, func]) => {
        const status = calcularStatus(func.checklist);
        const statusClass = status === 100 ? 'verde' : status > 0 ? 'amarelo' : 'cinza';
        const totalItens = calcularTotalItens(func.checklist);
        const itensMarcados = calcularItensMarcados(func.checklist);

        const item = document.createElement('div');
        item.className = 'funcionario-item';
        item.onclick = () => carregarFuncionario(id);

        item.innerHTML = `
            <div class="funcionario-info">
                <div class="funcionario-matricula">${func.matricula || 'Sem matrícula'}</div>
                <div class="funcionario-nome">${func.nome || 'Sem nome'}</div>
                ${func.cargo ? `<div class="funcionario-cargo">${func.cargo}</div>` : ''}
                ${func.setor ? `<div class="funcionario-setor">${func.setor}</div>` : ''}
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

function calcularTotalItens(checklist) {
    if (!checklist) return 0;
    return Object.keys(checklist).length;
}

function calcularItensMarcados(checklist) {
    if (!checklist) return 0;
    return Object.values(checklist).filter(v => {
        if (typeof v === 'object') {
            return v.status === true;
        }
        return v === true;
    }).length;
}

function calcularStatus(checklist) {
    if (!checklist) return 0;
    
    const total = Object.keys(checklist).length;
    if (total === 0) return 0;

    let marcados = 0;
    Object.values(checklist).forEach(v => {
        if (typeof v === 'object') {
            if (v.status === true) marcados++;
        } else if (v === true) {
            marcados++;
        }
    });

    return Math.round((marcados / total) * 100);
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
        const categoriaDiv = document.createElement('div');
        categoriaDiv.className = 'checklist-categoria';

        const titulo = document.createElement('h3');
        titulo.className = 'categoria-titulo';
        titulo.textContent = `🔹 ${categoria}`;
        
        if (categoria === 'Escolaridade') {
            const extra = document.createElement('span');
            extra.className = 'categoria-extra';
            extra.textContent = '(máx. 2 opções)';
            titulo.appendChild(extra);
        }
        
        categoriaDiv.appendChild(titulo);

        // Opção especial para Dependentes
        if (categoria === 'Dependentes') {
            const naoPossuiDiv = document.createElement('div');
            naoPossuiDiv.className = 'nao-possui-dependentes';
            
            const naoPossuiCheck = document.createElement('input');
            naoPossuiCheck.type = 'checkbox';
            naoPossuiCheck.id = 'naoPossuiDependentes';
            naoPossuiCheck.checked = funcionario.naoPossuiDependentes || false;
            naoPossuiCheck.onchange = (e) => {
                funcionario.naoPossuiDependentes = e.target.checked;
                if (e.target.checked) {
                    // Marcar todos os dependentes como não aplicável
                    itens.forEach(item => {
                        if (!checklist[item]) {
                            checklist[item] = false;
                        }
                    });
                }
                salvarFuncionarios();
                renderizarChecklist();
            };
            
            const naoPossuiLabel = document.createElement('label');
            naoPossuiLabel.htmlFor = 'naoPossuiDependentes';
            naoPossuiLabel.textContent = 'Não possui dependentes';
            
            naoPossuiDiv.appendChild(naoPossuiCheck);
            naoPossuiDiv.appendChild(naoPossuiLabel);
            categoriaDiv.appendChild(naoPossuiDiv);
        }

        itens.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'checklist-item';

            const isNaoAplicavel = ITENS_NAO_APLICAVEIS.includes(item);
            const itemValue = checklist[item];

            if (isNaoAplicavel) {
                // Radio buttons para Sim/Não/Não Aplicável
                const radioGroup = document.createElement('div');
                radioGroup.style.display = 'flex';
                radioGroup.style.alignItems = 'center';
                radioGroup.style.gap = '15px';

                const status = typeof itemValue === 'object' ? itemValue : { status: false, naoAplicavel: false };

                // Radio Sim
                const simLabel = document.createElement('label');
                simLabel.style.display = 'flex';
                simLabel.style.alignItems = 'center';
                simLabel.style.gap = '5px';
                simLabel.style.color = '#ccd7e9';
                
                const simRadio = document.createElement('input');
                simRadio.type = 'radio';
                simRadio.name = `radio_${item}`;
                simRadio.checked = status.status === true && !status.naoAplicavel;
                simRadio.onchange = () => {
                    checklist[item] = { status: true, naoAplicavel: false };
                    salvarChecklist();
                };
                
                simLabel.appendChild(simRadio);
                simLabel.appendChild(document.createTextNode('Sim'));

                // Radio Não
                const naoLabel = document.createElement('label');
                naoLabel.style.display = 'flex';
                naoLabel.style.alignItems = 'center';
                naoLabel.style.gap = '5px';
                naoLabel.style.color = '#ccd7e9';
                
                const naoRadio = document.createElement('input');
                naoRadio.type = 'radio';
                naoRadio.name = `radio_${item}`;
                naoRadio.checked = status.status === false && !status.naoAplicavel;
                naoRadio.onchange = () => {
                    checklist[item] = { status: false, naoAplicavel: false };
                    salvarChecklist();
                };
                
                naoLabel.appendChild(naoRadio);
                naoLabel.appendChild(document.createTextNode('Não'));

                // Radio Não Aplicável
                const naLabel = document.createElement('label');
                naLabel.style.display = 'flex';
                naLabel.style.alignItems = 'center';
                naLabel.style.gap = '5px';
                naLabel.style.color = '#8f9bae';
                
                const naRadio = document.createElement('input');
                naRadio.type = 'radio';
                naRadio.name = `radio_${item}`;
                naRadio.checked = status.naoAplicavel === true;
                naRadio.onchange = () => {
                    checklist[item] = { status: false, naoAplicavel: true };
                    salvarChecklist();
                };
                
                naLabel.appendChild(naRadio);
                naLabel.appendChild(document.createTextNode('Não Aplicável ➖'));

                radioGroup.appendChild(simLabel);
                radioGroup.appendChild(naoLabel);
                radioGroup.appendChild(naLabel);

                const label = document.createElement('span');
                label.textContent = item;
                label.style.color = '#ccd7e9';
                label.style.minWidth = '300px';

                itemDiv.appendChild(label);
                itemDiv.appendChild(radioGroup);
            } else if (categoria === 'Escolaridade') {
                // Checkbox com limite de 2
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.id = `check_${item.replace(/\s+/g, '_').replace(/[^\w]/g, '_')}`;
                checkbox.checked = itemValue === true;
                checkbox.onchange = (e) => {
                    // Contar quantos já estão marcados
                    const marcados = itens.filter(i => checklist[i] === true).length;
                    
                    if (e.target.checked && marcados >= 2) {
                        alert('Máximo de 2 opções permitidas para Escolaridade');
                        e.target.checked = false;
                        return;
                    }
                    
                    checklist[item] = e.target.checked;
                    salvarChecklist();
                };

                const label = document.createElement('label');
                label.htmlFor = checkbox.id;
                label.textContent = item;

                itemDiv.appendChild(checkbox);
                itemDiv.appendChild(label);
            } else {
                // Checkbox normal
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.id = `check_${item.replace(/\s+/g, '_').replace(/[^\w]/g, '_')}`;
                checkbox.checked = itemValue === true;
                checkbox.onchange = () => {
                    checklist[item] = checkbox.checked;
                    salvarChecklist();
                };

                const label = document.createElement('label');
                label.htmlFor = checkbox.id;
                label.textContent = item;

                itemDiv.appendChild(checkbox);
                itemDiv.appendChild(label);
            }

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
    const setor = document.getElementById('setor').value.trim();

    if (!matricula || !nome) {
        alert('Preencha matrícula e nome!');
        return;
    }

    const id = Date.now().toString();
    funcionarios[id] = {
        matricula,
        nome,
        cargo: cargo || '',
        setor: setor || '',
        naoPossuiDependentes: false,
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
    document.getElementById('setor').value = func.setor || '';
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

    // Para itens com radio, precisamos pegar do objeto atual
    const funcionarioAtual = funcionarios[funcionarioSelecionado];
    if (funcionarioAtual && funcionarioAtual.checklist) {
        Object.keys(funcionarioAtual.checklist).forEach(key => {
            if (ITENS_NAO_APLICAVEIS.includes(key)) {
                checklist[key] = funcionarioAtual.checklist[key];
            }
        });
    }

    funcionario.checklist = checklist;
    
    // Atualizar cargo e setor
    const cargo = document.getElementById('cargo').value.trim();
    const setor = document.getElementById('setor').value.trim();
    funcionario.cargo = cargo;
    funcionario.setor = setor;

    salvarFuncionarios();
    renderizarSidebar();
}

function atualizarStatusAposMudanca() {
    if (funcionarioSelecionado) {
        salvarChecklist();
    }
}

// Funções de exportação
function gerarRelatorio() {
    if (!funcionarioSelecionado) {
        alert('Selecione um funcionário!');
        return null;
    }

    const func = funcionarios[funcionarioSelecionado];
    const checklist = func.checklist || {};
    const totalItens = calcularTotalItens(checklist);
    const itensMarcados = calcularItensMarcados(checklist);
    const percentual = totalItens > 0 ? Math.round((itensMarcados / totalItens) * 100) : 0;

    let relatorio = `CHECKLIST ADMISSIONAL\n`;
    relatorio += `================================\n\n`;
    relatorio += `Matrícula: ${func.matricula}\n`;
    relatorio += `Nome: ${func.nome}\n`;
    relatorio += `Cargo: ${func.cargo || 'Não informado'}\n`;
    relatorio += `Setor: ${func.setor || 'Não informado'}\n`;
    relatorio += `Progresso: ${percentual}% (${itensMarcados}/${totalItens})\n\n`;
    relatorio += `================================\n\n`;

    for (const [categoria, itens] of Object.entries(CHECKLIST_ESTRUTURA)) {
        relatorio += `${categoria}:\n`;
        relatorio += `--------------------------------\n`;
        itens.forEach(item => {
            const valor = checklist[item];
            let marcado = '[ ]';
            
            if (ITENS_NAO_APLICAVEIS.includes(item) && typeof valor === 'object') {
                if (valor.naoAplicavel) {
                    marcado = '[➖]';
                } else {
                    marcado = valor.status ? '[X]' : '[ ]';
                }
            } else {
                marcado = valor ? '[X]' : '[ ]';
            }
            
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
    const totalItens = calcularTotalItens(checklist);
    const itensMarcados = calcularItensMarcados(checklist);
    const percentual = totalItens > 0 ? Math.round((itensMarcados / totalItens) * 100) : 0;

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
    doc.text(`Setor: ${func.setor || 'Não informado'}`, marginLeft, y);
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
            if (y > 270) {
                doc.addPage();
                y = 20;
            }
            
            const valor = checklist[item];
            let marcado = '[ ]';
            
            if (ITENS_NAO_APLICAVEIS.includes(item) && typeof valor === 'object') {
                if (valor.naoAplicavel) {
                    marcado = '[➖]';
                } else {
                    marcado = valor.status ? '[X]' : '[ ]';
                }
            } else {
                marcado = valor ? '[X]' : '[ ]';
            }
            
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
    
    doc.save(`${func.matricula}_${func.nome.replace(/\s+/g, '_')}.pdf`);
}

function exportarExcel() {
    if (!funcionarioSelecionado) {
        alert('Selecione um funcionário!');
        return;
    }

    const func = funcionarios[funcionarioSelecionado];
    const checklist = func.checklist || {};

    // Preparar dados para o Excel
    const dados = [];
    
    // Cabeçalho
    dados.push(['CHECKLIST ADMISSIONAL']);
    dados.push(['Matrícula', func.matricula]);
    dados.push(['Nome', func.nome]);
    dados.push(['Cargo', func.cargo || 'Não informado']);
    dados.push(['Setor', func.setor || 'Não informado']);
    dados.push([]);
    
    // Checklist por categoria
    for (const [categoria, itens] of Object.entries(CHECKLIST_ESTRUTURA)) {
        dados.push([categoria]);
        itens.forEach(item => {
            const valor = checklist[item];
            let status = '';
            
            if (ITENS_NAO_APLICAVEIS.includes(item) && typeof valor === 'object') {
                if (valor.naoAplicavel) {
                    status = 'Não Aplicável';
                } else {
                    status = valor.status ? 'Sim' : 'Não';
                }
            } else {
                status = valor ? 'Sim' : 'Não';
            }
            
            dados.push([`  ${item}`, status]);
        });
        dados.push([]);
    }

    // Criar worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(dados);
    
    // Ajustar largura das colunas
    ws['!cols'] = [{ wch: 50 }, { wch: 15 }];
    
    XLSX.utils.book_append_sheet(wb, ws, 'Checklist');
    XLSX.writeFile(wb, `${func.matricula}_${func.nome.replace(/\s+/g, '_')}.xlsx`);
}

function exportarJSON() {
    if (!funcionarioSelecionado) {
        alert('Selecione um funcionário!');
        return;
    }

    const func = funcionarios[funcionarioSelecionado];
    const blob = new Blob([JSON.stringify(func, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${func.matricula}_${func.nome.replace(/\s+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

function exportarBackup() {
    const blob = new Blob([JSON.stringify(funcionarios, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `admcheck_backup_${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

function restaurarBackup(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const dados = JSON.parse(e.target.result);
            
            // Validar estrutura básica
            if (typeof dados !== 'object') {
                throw new Error('Arquivo inválido');
            }

            // Confirmar restauração
            if (confirm(`Isso irá substituir todos os ${Object.keys(funcionarios).length} funcionários atuais. Deseja continuar?`)) {
                funcionarios = dados;
                salvarFuncionarios();
                renderizarSidebar();
                renderizarChecklist();
                alert('Backup restaurado com sucesso!');
            }
        } catch (error) {
            alert('Erro ao restaurar backup: arquivo inválido');
        }
    };
    reader.readAsText(file);
    
    // Limpar input
    event.target.value = '';
}

// Funções de importação CSV
function downloadTemplate() {
    const template = [
        ['matricula', 'nome', 'cargo', 'setor'],
        ['001', 'João Silva', 'Analista de RH', 'Recursos Humanos'],
        ['002', 'Maria Santos', 'Motorista', 'Logística'],
        ['003', 'Pedro Oliveira', 'Auxiliar Administrativo', 'Administrativo']
    ];
    
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(template);
    XLSX.utils.book_append_sheet(wb, ws, 'Modelo');
    XLSX.writeFile(wb, 'modelo_importacao_funcionarios.xlsx');
}

function importarCSV(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = e.target.result;
            const workbook = XLSX.read(data, { type: 'binary' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const json = XLSX.utils.sheet_to_json(worksheet);

            let importados = 0;
            let erros = 0;

            json.forEach((row, index) => {
                if (row.matricula && row.nome) {
                    const id = Date.now().toString() + index;
                    funcionarios[id] = {
                        matricula: String(row.matricula),
                        nome: String(row.nome),
                        cargo: row.cargo || '',
                        setor: row.setor || '',
                        naoPossuiDependentes: false,
                        checklist: criarChecklistVazio()
                    };
                    importados++;
                } else {
                    erros++;
                }
            });

            if (importados > 0) {
                salvarFuncionarios();
                renderizarSidebar();
                alert(`${importados} funcionários importados com sucesso! ${erros > 0 ? `${erros} linhas ignoradas.` : ''}`);
            } else {
                alert('Nenhum funcionário válido encontrado no arquivo.');
            }
        } catch (error) {
            alert('Erro ao importar arquivo. Verifique o formato.');
        }
    };
    reader.readAsBinaryString(file);
    
    // Limpar input
    event.target.value = '';
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
    document.getElementById('modalTitle').textContent = 'Confirmar exclusão';
    document.getElementById('modalMessage').textContent = 'Tem certeza que deseja excluir este funcionário?';
    document.getElementById('modalConfirmBtn').textContent = 'Confirmar';
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
            document.getElementById('setor').value = '';
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
    document.getElementById('setor').value = '';
}
