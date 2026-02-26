// Estrutura do checklist com marcação de itens que podem ser "Não Aplicável"
const CHECKLIST_ESTRUTURA = {
    "DOCUMENTOS OBRIGATÓRIOS": [
        { nome: "Currículo atualizado", podeNaoAplicavel: false },
        { nome: "01 Foto 3x4", podeNaoAplicavel: false },
        { nome: "CTPS Digital", podeNaoAplicavel: false },
        { nome: "RG – Frente e Verso", podeNaoAplicavel: false },
        { nome: "CPF", podeNaoAplicavel: false },
        { nome: "Título de Eleitor", podeNaoAplicavel: false },
        { nome: "Comprovante de Residência Atual", podeNaoAplicavel: false },
        { nome: "Certificado de Dispensa de Incorporação (Reservista)", podeNaoAplicavel: true },
        { nome: "Cartão PIS + Consulta de Qualificação Cadastral", podeNaoAplicavel: false },
        { nome: "Comprovante de Situação Cadastral do CPF", podeNaoAplicavel: false },
        { nome: "Atestado de Antecedentes Criminais (Original)", podeNaoAplicavel: false },
        { nome: "Conta Bancária – Bradesco ou Next", podeNaoAplicavel: false },
        { nome: "Certificados de Cursos Profissionalizantes", podeNaoAplicavel: true },
        { nome: "CNH (quando aplicável à função)", podeNaoAplicavel: true },
        { nome: "Exame Toxicológico (para função motorista)", podeNaoAplicavel: true },
        { nome: "Curso de Direção Defensiva (para função motorista)", podeNaoAplicavel: true },
        { nome: "Curso de Primeiros Socorros (para função motorista)", podeNaoAplicavel: true },
        { nome: "Cartão de Vacina", podeNaoAplicavel: false },
        { nome: "Atestado Médico Admissional", podeNaoAplicavel: false }
    ],
    "DOCUMENTOS OPCIONAIS / CONDICIONAIS": [],
    "Escolaridade": [
        { nome: "Ensino Fundamental", podeNaoAplicavel: false, exclusivo: true },
        { nome: "Ensino Médio", podeNaoAplicavel: false, exclusivo: true },
        { nome: "Ensino Superior", podeNaoAplicavel: false, exclusivo: true },
        { nome: "Pós-Graduação", podeNaoAplicavel: false, exclusivo: true },
        { nome: "Mestrado", podeNaoAplicavel: false, exclusivo: true },
        { nome: "Doutorado", podeNaoAplicavel: false, exclusivo: true }
    ],
    "Registro Profissional": [
        { nome: "Registro Profissional (quando profissão regulamentada)", podeNaoAplicavel: true },
        { nome: "Registro Profissional Pendente", podeNaoAplicavel: false }
    ],
    "Dependentes": {
        titulo: "Dependentes",
        grupos: [
            {
                nome: "Cônjuge",
                itens: [
                    { nome: "RG e CPF do Cônjuge", podeNaoAplicavel: false },
                    { nome: "Certidão de Casamento / União Estável", podeNaoAplicavel: false }
                ]
            },
            {
                nome: "Filhos",
                itens: [
                    { nome: "RG e CPF dos Filhos", podeNaoAplicavel: false },
                    { nome: "Cartão de Vacina dos Filhos", podeNaoAplicavel: false },
                    { nome: "Declaração Escolar dos Filhos", podeNaoAplicavel: false }
                ]
            }
        ]
    }
};

// Estado global
let funcionarios = {};
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
            fecharDropdowns();
        }
    });

    // Fechar dropdowns ao clicar fora
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.dropdown')) {
            fecharDropdowns();
        }
    });
});

// Funções de dropdown
function toggleDropdown(id) {
    const dropdown = document.getElementById(id);
    dropdown.classList.toggle('show');
}

function fecharDropdowns() {
    document.querySelectorAll('.dropdown-content').forEach(dropdown => {
        dropdown.classList.remove('show');
    });
}

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
    
    // Processar categorias normais
    for (const [categoria, conteudo] of Object.entries(CHECKLIST_ESTRUTURA)) {
        if (categoria === "Dependentes") {
            // Processar grupos de dependentes
            conteudo.grupos.forEach(grupo => {
                grupo.itens.forEach(item => {
                    checklist[item.nome] = { 
                        marcado: false, 
                        naoAplicavel: false 
                    };
                });
            });
        } else if (Array.isArray(conteudo)) {
            // Categorias com array de itens
            conteudo.forEach(item => {
                checklist[item.nome] = { 
                    marcado: false, 
                    naoAplicavel: false 
                };
            });
        }
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

// Função para verificar se tem cônjuge
function temConjuge(checklist) {
    if (!checklist) return false;
    const itemConjuge = checklist["RG e CPF do Cônjuge"];
    const itemCasamento = checklist["Certidão de Casamento / União Estável"];
    
    // Considera que tem cônjuge se pelo menos um item relacionado a cônjuge estiver marcado
    // e não estiver como "Não Aplicável"
    return (itemConjuge && itemConjuge.marcado && !itemConjuge.naoAplicavel) ||
           (itemCasamento && itemCasamento.marcado && !itemCasamento.naoAplicavel);
}

// Função para verificar se tem filhos
function temFilhos(checklist) {
    if (!checklist) return false;
    const itemRGFilhos = checklist["RG e CPF dos Filhos"];
    const itemVacinaFilhos = checklist["Cartão de Vacina dos Filhos"];
    const itemEscolaFilhos = checklist["Declaração Escolar dos Filhos"];
    
    // Considera que tem filhos se pelo menos um item relacionado a filhos estiver marcado
    // e não estiver como "Não Aplicável"
    return (itemRGFilhos && itemRGFilhos.marcado && !itemRGFilhos.naoAplicavel) ||
           (itemVacinaFilhos && itemVacinaFilhos.marcado && !itemVacinaFilhos.naoAplicavel) ||
           (itemEscolaFilhos && itemEscolaFilhos.marcado && !itemEscolaFilhos.naoAplicavel);
}

// Função para calcular itens válidos considerando as regras de dependentes
function calcularItensValidos(checklist, naoPossuiDependentes) {
    if (!checklist) return { total: 0, marcados: 0 };
    
    let total = 0;
    let marcados = 0;
    
    for (const [categoria, conteudo] of Object.entries(CHECKLIST_ESTRUTURA)) {
        if (categoria === "Dependentes") {
            // Se não possui dependentes, pular toda a categoria
            if (naoPossuiDependentes) {
                continue;
            }
            
            const temConjugeFlag = temConjuge(checklist);
            const temFilhosFlag = temFilhos(checklist);
            
            // Processar cada grupo de dependentes
            conteudo.grupos.forEach(grupo => {
                let grupoAtivo = false;
                
                if (grupo.nome === "Cônjuge" && temConjugeFlag) {
                    grupoAtivo = true;
                } else if (grupo.nome === "Filhos" && temFilhosFlag) {
                    grupoAtivo = true;
                }
                
                grupo.itens.forEach(item => {
                    const itemData = checklist[item.nome];
                    if (itemData && !itemData.naoAplicavel) {
                        // Só conta se o grupo estiver ativo
                        if (grupoAtivo) {
                            total++;
                            if (itemData.marcado) marcados++;
                        }
                    }
                });
            });
        } else if (Array.isArray(conteudo)) {
            if (categoria === "Escolaridade") {
                // Escolaridade conta como 1 item no total
                total++;
                // Verificar se algum item de escolaridade está marcado
                const escolaridadeMarcada = conteudo.some(item => 
                    checklist[item.nome] && checklist[item.nome].marcado && !checklist[item.nome].naoAplicavel
                );
                if (escolaridadeMarcada) marcados++;
            } else {
                // Demais categorias: cada item conta individualmente
                conteudo.forEach(item => {
                    const itemData = checklist[item.nome];
                    if (itemData && !itemData.naoAplicavel) {
                        total++;
                        if (itemData.marcado) marcados++;
                    }
                });
            }
        }
    }
    
    return { total, marcados };
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
        const { total, marcados } = calcularItensValidos(func.checklist, func.naoPossuiDependentes);
        const status = total > 0 ? Math.round((marcados / total) * 100) : 0;
        const statusClass = status === 100 ? 'verde' : status > 0 ? 'amarelo' : 'cinza';

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
                <span class="status-tooltip ${statusClass}">${status}% (${marcados}/${total})</span>
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
        document.getElementById('dependentesGlobalContainer').style.display = 'none';
        return;
    }

    const funcionario = funcionarios[funcionarioSelecionado];
    const checklist = funcionario.checklist || {};

    // Mostrar/ocultar checkbox global de dependentes
    document.getElementById('dependentesGlobalContainer').style.display = 'block';
    const naoPossuiDependentes = funcionario.naoPossuiDependentes || false;
    document.getElementById('naoPossuiDependentes').checked = naoPossuiDependentes;

    for (const [categoria, conteudo] of Object.entries(CHECKLIST_ESTRUTURA)) {
        if (categoria === "DOCUMENTOS OPCIONAIS / CONDICIONAIS") continue;
        
        if (categoria === "Dependentes") {
            // Se não possui dependentes, pular a categoria
            if (naoPossuiDependentes) {
                continue;
            }
            
            const temConjugeFlag = temConjuge(checklist);
            const temFilhosFlag = temFilhos(checklist);
            
            const categoriaDiv = document.createElement('div');
            categoriaDiv.className = 'checklist-categoria';

            const titulo = document.createElement('h3');
            titulo.className = 'categoria-titulo';
            titulo.textContent = `🔹 ${conteudo.titulo}`;
            categoriaDiv.appendChild(titulo);

            // Renderizar cada grupo
            conteudo.grupos.forEach(grupo => {
                const grupoDiv = document.createElement('div');
                grupoDiv.className = 'checklist-grupo';
                
                const grupoTitulo = document.createElement('h4');
                grupoTitulo.className = 'grupo-titulo';
                grupoTitulo.textContent = grupo.nome;
                
                // Mostrar aviso se o grupo não está ativo
                let grupoAtivo = false;
                if (grupo.nome === "Cônjuge" && temConjugeFlag) {
                    grupoAtivo = true;
                } else if (grupo.nome === "Filhos" && temFilhosFlag) {
                    grupoAtivo = true;
                }
                
                if (!grupoAtivo) {
                    const aviso = document.createElement('div');
                    aviso.className = 'grupo-aviso';
                    aviso.textContent = `⚠️ Nenhum documento de ${grupo.nome.toLowerCase()} marcado. Os itens abaixo não serão contabilizados no progresso.`;
                    grupoDiv.appendChild(aviso);
                }
                
                grupoDiv.appendChild(grupoTitulo);
                
                grupo.itens.forEach(item => {
                    const itemData = checklist[item.nome] || { marcado: false, naoAplicavel: false };
                    const itemDiv = document.createElement('div');
                    itemDiv.className = `checklist-item ${itemData.naoAplicavel ? 'nao-aplicavel' : ''}`;

                    // Checkbox
                    const checkbox = document.createElement('input');
                    checkbox.type = 'checkbox';
                    checkbox.id = `check_${item.nome.replace(/\s+/g, '_').replace(/[^\w]/g, '_')}`;
                    checkbox.checked = itemData.marcado || false;
                    checkbox.disabled = itemData.naoAplicavel;
                    checkbox.onchange = () => {
                        atualizarStatusAposMudanca();
                    };

                    // Label
                    const label = document.createElement('label');
                    label.htmlFor = checkbox.id;
                    label.textContent = item.nome;

                    itemDiv.appendChild(checkbox);
                    itemDiv.appendChild(label);

                    grupoDiv.appendChild(itemDiv);
                });
                
                categoriaDiv.appendChild(grupoDiv);
            });

            container.appendChild(categoriaDiv);
            
        } else if (Array.isArray(conteudo) && conteudo.length > 0) {
            const categoriaDiv = document.createElement('div');
            categoriaDiv.className = 'checklist-categoria';

            const titulo = document.createElement('h3');
            titulo.className = 'categoria-titulo';
            titulo.textContent = `🔹 ${categoria}`;
            categoriaDiv.appendChild(titulo);

            conteudo.forEach(item => {
                const itemData = checklist[item.nome] || { marcado: false, naoAplicavel: false };
                const itemDiv = document.createElement('div');
                itemDiv.className = `checklist-item ${itemData.naoAplicavel ? 'nao-aplicavel' : ''}`;

                // Checkbox
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.id = `check_${item.nome.replace(/\s+/g, '_').replace(/[^\w]/g, '_')}`;
                checkbox.checked = itemData.marcado || false;
                checkbox.disabled = itemData.naoAplicavel;
                checkbox.onchange = () => {
                    if (item.exclusivo && checkbox.checked) {
                        // Se for item exclusivo, desmarcar outros da mesma categoria
                        desmarcarOutrosExclusivos(categoria, item.nome);
                    }
                    atualizarStatusAposMudanca();
                };

                // Label
                const label = document.createElement('label');
                label.htmlFor = checkbox.id;
                label.textContent = item.nome;

                itemDiv.appendChild(checkbox);
                itemDiv.appendChild(label);

                // Select para "Não Aplicável" (se aplicável)
                if (item.podeNaoAplicavel) {
                    const select = document.createElement('select');
                    select.className = 'status-select';
                    select.onchange = (e) => {
                        const valor = e.target.value;
                        if (valor === 'naoAplicavel') {
                            itemData.naoAplicavel = true;
                            checkbox.checked = false;
                            checkbox.disabled = true;
                        } else {
                            itemData.naoAplicavel = false;
                            checkbox.disabled = false;
                        }
                        itemDiv.className = `checklist-item ${itemData.naoAplicavel ? 'nao-aplicavel' : ''}`;
                        atualizarStatusAposMudanca();
                    };

                    const option1 = document.createElement('option');
                    option1.value = 'normal';
                    option1.textContent = '✔️ Normal';
                    option1.selected = !itemData.naoAplicavel;

                    const option2 = document.createElement('option');
                    option2.value = 'naoAplicavel';
                    option2.textContent = '➖ Não Aplicável';
                    option2.selected = itemData.naoAplicavel;

                    select.appendChild(option1);
                    select.appendChild(option2);
                    itemDiv.appendChild(select);
                }

                categoriaDiv.appendChild(itemDiv);
            });

            container.appendChild(categoriaDiv);
        }
    }
}

// Função para desmarcar outros itens exclusivos na mesma categoria
function desmarcarOutrosExclusivos(categoria, itemSelecionado) {
    const itens = CHECKLIST_ESTRUTURA[categoria];
    itens.forEach(item => {
        if (item.exclusivo && item.nome !== itemSelecionado) {
            const checkbox = document.getElementById(`check_${item.nome.replace(/\s+/g, '_').replace(/[^\w]/g, '_')}`);
            if (checkbox) {
                checkbox.checked = false;
            }
        }
    });
}

// Função para toggle do checklist de dependentes
function toggleDependentesChecklist() {
    if (!funcionarioSelecionado) return;

    const naoPossuiDependentes = document.getElementById('naoPossuiDependentes').checked;
    funcionarios[funcionarioSelecionado].naoPossuiDependentes = naoPossuiDependentes;
    
    // Salvar e recarregar checklist
    salvarFuncionarios();
    renderizarChecklist();
    renderizarSidebar();
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
    for (const [categoria, conteudo] of Object.entries(CHECKLIST_ESTRUTURA)) {
        if (categoria === "Dependentes") {
            conteudo.grupos.forEach(grupo => {
                grupo.itens.forEach(item => {
                    const checkbox = document.getElementById(`check_${item.nome.replace(/\s+/g, '_').replace(/[^\w]/g, '_')}`);
                    if (checkbox) {
                        checklist[item.nome] = {
                            marcado: checkbox.checked,
                            naoAplicavel: false // Dependentes não têm opção "Não Aplicável"
                        };
                    }
                });
            });
        } else if (Array.isArray(conteudo)) {
            conteudo.forEach(item => {
                const checkbox = document.getElementById(`check_${item.nome.replace(/\s+/g, '_').replace(/[^\w]/g, '_')}`);
                if (checkbox) {
                    const select = checkbox.parentElement.querySelector('.status-select');
                    const naoAplicavel = select ? select.value === 'naoAplicavel' : false;
                    
                    checklist[item.nome] = {
                        marcado: checkbox.checked,
                        naoAplicavel: naoAplicavel
                    };
                }
            });
        }
    }

    funcionario.checklist = checklist;
    
    // Atualizar campos
    funcionario.cargo = document.getElementById('cargo').value.trim();
    funcionario.setor = document.getElementById('setor').value.trim();

    salvarFuncionarios();
    renderizarSidebar();
}

function atualizarStatusAposMudanca() {
    if (funcionarioSelecionado) {
        salvarChecklist();
    }
}

// Funções de exportação
function gerarDadosFuncionario(id) {
    const func = funcionarios[id];
    const { total, marcados } = calcularItensValidos(func.checklist, func.naoPossuiDependentes);
    const percentual = total > 0 ? Math.round((marcados / total) * 100) : 0;
    
    return {
        id,
        matricula: func.matricula,
        nome: func.nome,
        cargo: func.cargo || '',
        setor: func.setor || '',
        progresso: percentual,
        itens_marcados: marcados,
        itens_totais: total,
        naoPossuiDependentes: func.naoPossuiDependentes,
        checklist: func.checklist
    };
}

function gerarRelatorio() {
    if (!funcionarioSelecionado) {
        alert('Selecione um funcionário!');
        return null;
    }

    const func = funcionarios[funcionarioSelecionado];
    const { total, marcados } = calcularItensValidos(func.checklist, func.naoPossuiDependentes);
    const percentual = total > 0 ? Math.round((marcados / total) * 100) : 0;

    let relatorio = `CHECKLIST ADMISSIONAL\n`;
    relatorio += `================================\n\n`;
    relatorio += `Matrícula: ${func.matricula}\n`;
    relatorio += `Nome: ${func.nome}\n`;
    relatorio += `Cargo: ${func.cargo || 'Não informado'}\n`;
    relatorio += `Setor: ${func.setor || 'Não informado'}\n`;
    relatorio += `Progresso: ${percentual}% (${marcados}/${total})\n\n`;
    relatorio += `================================\n\n`;

    for (const [categoria, conteudo] of Object.entries(CHECKLIST_ESTRUTURA)) {
        if (categoria === "DOCUMENTOS OPCIONAIS / CONDICIONAIS") continue;
        
        if (categoria === "Dependentes") {
            if (func.naoPossuiDependentes) {
                relatorio += `${conteudo.titulo}:\n`;
                relatorio += `--------------------------------\n`;
                relatorio += `[➖] Não possui dependentes\n\n`;
                continue;
            }
            
            const temConjugeFlag = temConjuge(func.checklist);
            const temFilhosFlag = temFilhos(func.checklist);
            
            relatorio += `${conteudo.titulo}:\n`;
            relatorio += `--------------------------------\n`;
            
            conteudo.grupos.forEach(grupo => {
                let grupoAtivo = false;
                if (grupo.nome === "Cônjuge" && temConjugeFlag) {
                    grupoAtivo = true;
                } else if (grupo.nome === "Filhos" && temFilhosFlag) {
                    grupoAtivo = true;
                }
                
                if (grupoAtivo) {
                    relatorio += `  ${grupo.nome}:\n`;
                    grupo.itens.forEach(item => {
                        const itemData = func.checklist[item.nome] || { marcado: false };
                        const marcado = itemData.marcado ? '[X]' : '[ ]';
                        relatorio += `    ${marcado} ${item.nome}\n`;
                    });
                }
            });
            relatorio += '\n';
        } else if (Array.isArray(conteudo) && conteudo.length > 0) {
            relatorio += `${categoria}:\n`;
            relatorio += `--------------------------------\n`;
            conteudo.forEach(item => {
                const itemData = func.checklist[item.nome] || { marcado: false, naoAplicavel: false };
                let marcado = '[ ]';
                if (itemData.naoAplicavel) {
                    marcado = '[➖]';
                } else if (itemData.marcado) {
                    marcado = '[X]';
                }
                relatorio += `${marcado} ${item.nome}\n`;
            });
            relatorio += '\n';
        }
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
    const { total, marcados } = calcularItensValidos(func.checklist, func.naoPossuiDependentes);
    const percentual = total > 0 ? Math.round((marcados / total) * 100) : 0;

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
    doc.text(`Setor: ${func.setor || 'Não informado'}`, marginLeft, y);
    y += lineHeight;
    
    // Progresso
    const statusColor = percentual === 100 ? [0, 200, 83] : percentual > 0 ? [255, 214, 0] : [107, 114, 128];
    doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
    doc.text(`Progresso: ${percentual}% (${marcados}/${total})`, marginLeft, y);
    y += lineHeight * 1.5;
    
    // Linha separadora
    doc.setDrawColor(63, 72, 84);
    doc.line(marginLeft, y - 3, 195, y - 3);
    
    // Checklist
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    
    for (const [categoria, conteudo] of Object.entries(CHECKLIST_ESTRUTURA)) {
        if (categoria === "DOCUMENTOS OPCIONAIS / CONDICIONAIS") continue;
        
        // Verificar se precisa de nova página
        if (y > 270) {
            doc.addPage();
            y = 20;
        }
        
        if (categoria === "Dependentes") {
            if (func.naoPossuiDependentes) {
                doc.setFontSize(11);
                doc.setTextColor(183, 196, 217);
                doc.text(`🔹 ${conteudo.titulo}`, marginLeft, y);
                y += lineHeight;
                doc.setFontSize(9);
                doc.setTextColor(204, 215, 233);
                doc.text(`[➖] Não possui dependentes`, marginLeft + 5, y);
                y += lineHeight;
                y += lineHeight / 2;
                continue;
            }
            
            const temConjugeFlag = temConjuge(func.checklist);
            const temFilhosFlag = temFilhos(func.checklist);
            
            doc.setFontSize(11);
            doc.setTextColor(183, 196, 217);
            doc.text(`🔹 ${conteudo.titulo}`, marginLeft, y);
            y += lineHeight;
            
            conteudo.grupos.forEach(grupo => {
                let grupoAtivo = false;
                if (grupo.nome === "Cônjuge" && temConjugeFlag) {
                    grupoAtivo = true;
                } else if (grupo.nome === "Filhos" && temFilhosFlag) {
                    grupoAtivo = true;
                }
                
                if (grupoAtivo) {
                    doc.setFontSize(10);
                    doc.setTextColor(204, 215, 233);
                    doc.text(`  ${grupo.nome}:`, marginLeft, y);
                    y += lineHeight;
                    
                    grupo.itens.forEach(item => {
                        if (y > 270) {
                            doc.addPage();
                            y = 20;
                        }
                        
                        const itemData = func.checklist[item.nome] || { marcado: false };
                        const marcado = itemData.marcado ? '[X]' : '[ ]';
                        doc.text(`    ${marcado} ${item.nome}`, marginLeft + 5, y);
                        y += lineHeight;
                    });
                }
            });
            y += lineHeight / 2;
            
        } else if (Array.isArray(conteudo) && conteudo.length > 0) {
            doc.setFontSize(11);
            doc.setTextColor(183, 196, 217);
            doc.text(`🔹 ${categoria}`, marginLeft, y);
            y += lineHeight;
            
            doc.setFontSize(9);
            doc.setTextColor(204, 215, 233);
            
            conteudo.forEach(item => {
                if (y > 270) {
                    doc.addPage();
                    y = 20;
                }
                
                const itemData = func.checklist[item.nome] || { marcado: false, naoAplicavel: false };
                let marcado = '[ ]';
                if (itemData.naoAplicavel) {
                    marcado = '[➖]';
                } else if (itemData.marcado) {
                    marcado = '[X]';
                }
                doc.text(`${marcado} ${item.nome}`, marginLeft + 5, y);
                y += lineHeight;
            });
            
            y += lineHeight / 2;
        }
    }
    
    // Rodapé
    doc.setFontSize(8);
    doc.setTextColor(107, 122, 143);
    doc.text('ADMCHECK - Sistema de Checklist Admissional', marginLeft, 285);
    doc.text(new Date().toLocaleDateString('pt-BR'), 170, 285);
    
    // Salvar PDF
    doc.save(`${func.matricula}_${func.nome.replace(/\s+/g, '_')}.pdf`);
}

function exportarExcel() {
    if (!funcionarioSelecionado) {
        alert('Selecione um funcionário!');
        return;
    }

    const func = funcionarios[funcionarioSelecionado];
    const dados = gerarDadosFuncionario(funcionarioSelecionado);
    
    // Preparar dados para planilha
    const wb = XLSX.utils.book_new();
    
    // Aba de Resumo
    const resumoData = [
        ['ADMCHECK - Checklist Admissional'],
        ['Gerado em:', new Date().toLocaleString('pt-BR')],
        [],
        ['INFORMAÇÕES DO FUNCIONÁRIO'],
        ['Matrícula', func.matricula],
        ['Nome', func.nome],
        ['Cargo', func.cargo || 'Não informado'],
        ['Setor', func.setor || 'Não informado'],
        ['Progresso', `${dados.progresso}% (${dados.itens_marcados}/${dados.itens_totais})`],
        ['Não possui dependentes', func.naoPossuiDependentes ? 'Sim' : 'Não'],
        []
    ];
    
    // Aba do Checklist
    const checklistData = [
        ['CATEGORIA', 'DOCUMENTO', 'STATUS', 'GRUPO', 'OBSERVAÇÃO']
    ];
    
    for (const [categoria, conteudo] of Object.entries(CHECKLIST_ESTRUTURA)) {
        if (categoria === "DOCUMENTOS OPCIONAIS / CONDICIONAIS") continue;
        
        if (categoria === "Dependentes") {
            if (func.naoPossuiDependentes) {
                checklistData.push([categoria, 'Não possui dependentes', 'N/A', '', '']);
                continue;
            }
            
            const temConjugeFlag = temConjuge(func.checklist);
            const temFilhosFlag = temFilhos(func.checklist);
            
            conteudo.grupos.forEach(grupo => {
                let grupoAtivo = false;
                if (grupo.nome === "Cônjuge" && temConjugeFlag) {
                    grupoAtivo = true;
                } else if (grupo.nome === "Filhos" && temFilhosFlag) {
                    grupoAtivo = true;
                }
                
                grupo.itens.forEach(item => {
                    const itemData = func.checklist[item.nome] || { marcado: false };
                    let status = itemData.marcado ? 'OK' : 'Pendente';
                    if (!grupoAtivo) {
                        status = 'Ignorado (sem ' + grupo.nome.toLowerCase() + ')';
                    }
                    checklistData.push([categoria, item.nome, status, grupo.nome, '']);
                });
            });
        } else if (Array.isArray(conteudo) && conteudo.length > 0) {
            conteudo.forEach(item => {
                const itemData = func.checklist[item.nome] || { marcado: false, naoAplicavel: false };
                let status = '';
                if (itemData.naoAplicavel) {
                    status = 'Não Aplicável';
                } else if (itemData.marcado) {
                    status = 'OK';
                } else {
                    status = 'Pendente';
                }
                checklistData.push([categoria, item.nome, status, '', '']);
            });
        }
    }
    
    const wsResumo = XLSX.utils.aoa_to_sheet(resumoData);
    const wsChecklist = XLSX.utils.aoa_to_sheet(checklistData);
    
    // Ajustar largura das colunas
    wsChecklist['!cols'] = [
        { wch: 30 }, // Categoria
        { wch: 50 }, // Documento
        { wch: 20 }, // Status
        { wch: 15 }, // Grupo
        { wch: 30 }  // Observação
    ];
    
    XLSX.utils.book_append_sheet(wb, wsResumo, 'Resumo');
    XLSX.utils.book_append_sheet(wb, wsChecklist, 'Checklist');
    
    // Salvar arquivo
    XLSX.writeFile(wb, `${func.matricula}_${func.nome.replace(/\s+/g, '_')}.xlsx`);
}

function exportarJSON() {
    if (!funcionarioSelecionado) {
        alert('Selecione um funcionário!');
        return;
    }

    const dados = gerarDadosFuncionario(funcionarioSelecionado);
    const jsonStr = JSON.stringify(dados, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${dados.matricula}_${dados.nome.replace(/\s+/g, '_')}.json`;
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

// Funções de importação
function baixarTemplate() {
    const template = [
        ['matricula', 'nome', 'cargo', 'setor'],
        ['001', 'João Silva', 'Analista de RH', 'Recursos Humanos'],
        ['002', 'Maria Santos', 'Motorista', 'Logística'],
        ['003', 'Pedro Oliveira', 'Auxiliar Administrativo', 'Administração']
    ];
    
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(template);
    
    // Ajustar largura das colunas
    ws['!cols'] = [
        { wch: 15 }, // matricula
        { wch: 30 }, // nome
        { wch: 25 }, // cargo
        { wch: 25 }  // setor
    ];
    
    XLSX.utils.book_append_sheet(wb, ws, 'Funcionários');
    XLSX.writeFile(wb, 'template_importacao_funcionarios.xlsx');
}

function importarArquivo(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(sheet);
            
            processarImportacao(jsonData);
        } catch (error) {
            alert('Erro ao processar arquivo: ' + error.message);
        }
    };
    reader.readAsArrayBuffer(file);
    
    // Limpar input
    event.target.value = '';
}

function processarImportacao(dados) {
    const modal = document.getElementById('importModal');
    const message = document.getElementById('importMessage');
    const progressFill = document.getElementById('progressFill');
    let importados = 0;
    let erros = 0;
    
    modal.classList.add('show');
    message.textContent = `Processando importação... 0/${dados.length}`;
    progressFill.style.width = '0%';
    
    setTimeout(() => {
        dados.forEach((row, index) => {
            try {
                const matricula = row.matricula || row.Matricula || row.MATRICULA || '';
                const nome = row.nome || row.Nome || row.NOME || '';
                const cargo = row.cargo || row.Cargo || row.CARGO || '';
                const setor = row.setor || row.Setor || row.SETOR || '';
                
                if (!matricula || !nome) {
                    erros++;
                } else {
                    const id = Date.now() + index + Math.random();
                    funcionarios[id] = {
                        matricula: String(matricula).trim(),
                        nome: String(nome).trim(),
                        cargo: String(cargo || '').trim(),
                        setor: String(setor || '').trim(),
                        naoPossuiDependentes: false,
                        checklist: criarChecklistVazio()
                    };
                    importados++;
                }
            } catch (error) {
                erros++;
            }
            
            // Atualizar progresso
            const progresso = Math.round(((index + 1) / dados.length) * 100);
            progressFill.style.width = progresso + '%';
            message.textContent = `Processando importação... ${index + 1}/${dados.length}`;
        });
        
        if (importados > 0) {
            salvarFuncionarios();
            renderizarSidebar();
        }
        
        message.textContent = `Importação concluída! ${importados} funcionários importados, ${erros} erros.`;
    }, 100);
}

function fecharImportModal() {
    document.getElementById('importModal').classList.remove('show');
}

// Funções de Backup
function backupFuncionarioAtual() {
    if (!funcionarioSelecionado) {
        alert('Selecione um funcionário para fazer backup!');
        return;
    }

    const modal = document.getElementById('backupModal');
    const title = document.getElementById('backupModalTitle');
    const message = document.getElementById('backupMessage');
    const progressFill = document.getElementById('backupProgressFill');
    
    title.textContent = 'Backup em Andamento';
    message.textContent = 'Preparando backup do funcionário...';
    progressFill.style.width = '0%';
    modal.classList.add('show');
    
    setTimeout(() => {
        try {
            const func = funcionarios[funcionarioSelecionado];
            const { total, marcados } = calcularItensValidos(func.checklist, func.naoPossuiDependentes);
            
            const backupData = {
                versao: '3.0',
                data: new Date().toISOString(),
                tipo: 'backup_funcionario',
                funcionario: {
                    id: funcionarioSelecionado,
                    matricula: func.matricula,
                    nome: func.nome,
                    cargo: func.cargo,
                    setor: func.setor,
                    naoPossuiDependentes: func.naoPossuiDependentes,
                    progresso: {
                        total,
                        marcados,
                        percentual: total > 0 ? Math.round((marcados / total) * 100) : 0
                    },
                    checklist: func.checklist
                }
            };
            
            progressFill.style.width = '50%';
            message.textContent = 'Compactando dados...';
            
            setTimeout(() => {
                progressFill.style.width = '100%';
                message.textContent = 'Backup concluído! Preparando download...';
                
                setTimeout(() => {
                    const jsonStr = JSON.stringify(backupData, null, 2);
                    const blob = new Blob([jsonStr], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `backup_${func.matricula}_${func.nome.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.backup`;
                    a.click();
                    URL.revokeObjectURL(url);
                    
                    modal.classList.remove('show');
                }, 500);
            }, 500);
        } catch (error) {
            message.textContent = 'Erro ao fazer backup: ' + error.message;
            progressFill.style.width = '0%';
        }
    }, 500);
}

function backupTodosFuncionarios() {
    const modal = document.getElementById('backupModal');
    const title = document.getElementById('backupModalTitle');
    const message = document.getElementById('backupMessage');
    const progressFill = document.getElementById('backupProgressFill');
    
    title.textContent = 'Backup Completo';
    message.textContent = 'Preparando backup de todos os funcionários...';
    progressFill.style.width = '0%';
    modal.classList.add('show');
    
    setTimeout(() => {
        try {
            const totalFuncionarios = Object.keys(funcionarios).length;
            let processados = 0;
            
            const funcionariosBackup = {};
            
            for (const [id, func] of Object.entries(funcionarios)) {
                const { total, marcados } = calcularItensValidos(func.checklist, func.naoPossuiDependentes);
                
                funcionariosBackup[id] = {
                    matricula: func.matricula,
                    nome: func.nome,
                    cargo: func.cargo,
                    setor: func.setor,
                    naoPossuiDependentes: func.naoPossuiDependentes,
                    progresso: {
                        total,
                        marcados,
                        percentual: total > 0 ? Math.round((marcados / total) * 100) : 0
                    },
                    checklist: func.checklist
                };
                
                processados++;
                const progresso = Math.round((processados / totalFuncionarios) * 100);
                progressFill.style.width = progresso + '%';
                message.textContent = `Processando backup... ${processados}/${totalFuncionarios}`;
            }
            
            const backupData = {
                versao: '3.0',
                data: new Date().toISOString(),
                tipo: 'backup_completo',
                metadados: {
                    totalFuncionarios: totalFuncionarios,
                    versaoSistema: 'ADMCHECK 3.0'
                },
                funcionarios: funcionariosBackup
            };
            
            message.textContent = 'Backup concluído! Preparando download...';
            
            setTimeout(() => {
                const jsonStr = JSON.stringify(backupData, null, 2);
                const blob = new Blob([jsonStr], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `backup_completo_admcheck_${new Date().toISOString().split('T')[0]}.backup`;
                a.click();
                URL.revokeObjectURL(url);
                
                modal.classList.remove('show');
            }, 500);
        } catch (error) {
            message.textContent = 'Erro ao fazer backup: ' + error.message;
            progressFill.style.width = '0%';
        }
    }, 500);
}

function restaurarBackup(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const modal = document.getElementById('restoreModal');
    const message = document.getElementById('restoreMessage');
    const progressFill = document.getElementById('restoreProgressFill');
    const details = document.getElementById('backupDetails');
    
    modal.classList.add('show');
    message.textContent = 'Lendo arquivo de backup...';
    progressFill.style.width = '0%';
    
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const backupData = JSON.parse(e.target.result);
            
            progressFill.style.width = '50%';
            message.textContent = 'Analisando backup...';
            
            // Validar estrutura do backup
            if (!backupData.versao || !backupData.data || !backupData.tipo) {
                throw new Error('Arquivo de backup inválido ou corrompido');
            }
            
            // Mostrar detalhes do backup
            let detalhesHTML = `
                <div class="backup-summary">
                    <div class="backup-summary-item">
                        <span class="backup-summary-label">Versão</span>
                        <span class="backup-summary-value">${backupData.versao}</span>
                    </div>
                    <div class="backup-summary-item">
                        <span class="backup-summary-label">Data</span>
                        <span class="backup-summary-value">${new Date(backupData.data).toLocaleDateString('pt-BR')}</span>
                    </div>
                    <div class="backup-summary-item">
                        <span class="backup-summary-label">Tipo</span>
                        <span class="backup-summary-value">${backupData.tipo === 'backup_completo' ? 'Completo' : 'Funcionário'}</span>
                    </div>
                </div>
            `;
            
            if (backupData.tipo === 'backup_completo') {
                const total = Object.keys(backupData.funcionarios).length;
                detalhesHTML += `
                    <div class="backup-summary">
                        <div class="backup-summary-item">
                            <span class="backup-summary-label">Funcionários</span>
                            <span class="backup-summary-value">${total}</span>
                        </div>
                    </div>
                `;
            } else if (backupData.tipo === 'backup_funcionario') {
                const func = backupData.funcionario;
                detalhesHTML += `
                    <div class="backup-details">
                        <strong>Funcionário:</strong> ${func.nome}<br>
                        <strong>Matrícula:</strong> ${func.matricula}<br>
                        <strong>Cargo:</strong> ${func.cargo || 'Não informado'}<br>
                        <strong>Setor:</strong> ${func.setor || 'Não informado'}<br>
                        <strong>Progresso:</strong> ${func.progresso.percentual}% (${func.progresso.marcados}/${func.progresso.total})
                    </div>
                `;
            }
            
            detalhesHTML += '<div class="backup-warning">⚠️ A restauração substituirá os dados atuais. Deseja continuar?</div>';
            
            details.innerHTML = detalhesHTML;
            progressFill.style.width = '100%';
            message.textContent = 'Backup analisado com sucesso!';
            
            // Armazenar dados para confirmação
            window.backupDataParaRestaurar = backupData;
            
        } catch (error) {
            message.textContent = 'Erro ao ler backup: ' + error.message;
            progressFill.style.width = '0%';
            details.innerHTML = '';
        }
    };
    reader.readAsText(file);
    
    // Limpar input
    event.target.value = '';
}

function confirmarRestauracao() {
    const backupData = window.backupDataParaRestaurar;
    if (!backupData) return;
    
    const modal = document.getElementById('restoreModal');
    const message = document.getElementById('restoreMessage');
    const progressFill = document.getElementById('restoreProgressFill');
    const details = document.getElementById('backupDetails');
    
    message.textContent = 'Restaurando backup...';
    progressFill.style.width = '0%';
    details.innerHTML = '';
    
    setTimeout(() => {
        try {
            if (backupData.tipo === 'backup_completo') {
                // Restaurar backup completo
                const funcionariosArray = Object.entries(backupData.funcionarios);
                let restaurados = 0;
                
                funcionariosArray.forEach(([id, func], index) => {
                    // Manter o ID original ou gerar novo se necessário
                    const novoId = id;
                    
                    funcionarios[novoId] = {
                        matricula: func.matricula,
                        nome: func.nome,
                        cargo: func.cargo || '',
                        setor: func.setor || '',
                        naoPossuiDependentes: func.naoPossuiDependentes || false,
                        checklist: func.checklist || {}
                    };
                    
                    restaurados++;
                    const progresso = Math.round(((index + 1) / funcionariosArray.length) * 100);
                    progressFill.style.width = progresso + '%';
                    message.textContent = `Restaurando... ${restaurados}/${funcionariosArray.length}`;
                });
                
                message.textContent = `Restauração concluída! ${restaurados} funcionários restaurados.`;
                
            } else if (backupData.tipo === 'backup_funcionario') {
                // Restaurar funcionário específico
                const func = backupData.funcionario;
                
                funcionarios[func.id] = {
                    matricula: func.matricula,
                    nome: func.nome,
                    cargo: func.cargo || '',
                    setor: func.setor || '',
                    naoPossuiDependentes: func.naoPossuiDependentes || false,
                    checklist: func.checklist || {}
                };
                
                progressFill.style.width = '100%';
                message.textContent = 'Funcionário restaurado com sucesso!';
            }
            
            // Salvar no localStorage
            salvarFuncionarios();
            
            // Atualizar interface
            renderizarSidebar();
            
            // Se for backup de funcionário específico, selecioná-lo
            if (backupData.tipo === 'backup_funcionario') {
                funcionarioSelecionado = backupData.funcionario.id;
                carregarFuncionario(funcionarioSelecionado);
            }
            
            setTimeout(() => {
                modal.classList.remove('show');
                window.backupDataParaRestaurar = null;
            }, 2000);
            
        } catch (error) {
            message.textContent = 'Erro na restauração: ' + error.message;
            progressFill.style.width = '0%';
        }
    }, 500);
}

function fecharBackupModal() {
    document.getElementById('backupModal').classList.remove('show');
}

function fecharRestoreModal() {
    document.getElementById('restoreModal').classList.remove('show');
    window.backupDataParaRestaurar = null;
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
