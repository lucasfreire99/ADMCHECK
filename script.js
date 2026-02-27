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

// Função para verificar se um grupo tem pelo menos um documento marcado
function grupoTemDocumentoMarcado(grupo, checklist) {
    if (!checklist) return false;
    
    return grupo.itens.some(item => {
        const itemData = checklist[item.nome];
        return itemData && itemData.marcado && !itemData.naoAplicavel;
    });
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
                grupoDiv.appendChild(grupoTitulo);
                
                // Verificar se o grupo está ativo
                let grupoAtivo = false;
                if (grupo.nome === "Cônjuge" && temConjugeFlag) {
                    grupoAtivo = true;
                } else if (grupo.nome === "Filhos" && temFilhosFlag) {
                    grupoAtivo = true;
                }
                
                // Verificar se há pelo menos um documento marcado neste grupo
                const temDocumentoMarcado = grupoTemDocumentoMarcado(grupo, checklist);
                
                // Mostrar aviso APENAS se o grupo NÃO estiver ativo E NÃO tiver documentos marcados
                if (!grupoAtivo && !temDocumentoMarcado) {
                    const aviso = document.createElement('div');
                    aviso.className = 'grupo-aviso';
                    aviso.textContent = `Nenhum documento de ${grupo.nome.toLowerCase()} marcado`;
                    grupoDiv.appendChild(aviso);
                }
                
                // Renderizar itens do grupo
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
                    option2.selecte