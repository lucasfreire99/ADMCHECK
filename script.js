/* ================================
   ADMCHECK - Script Atualizado
================================= */

/* ---------- Estrutura do Checklist ---------- */

const CHECKLIST_ESTRUTURA = {
  "🔹 DOCUMENTOS OBRIGATÓRIOS": [
    "Currículo atualizado","01 Foto 3x4","CTPS Digital","RG – Frente e Verso","CPF",
    "Título de Eleitor","Comprovante de Residência Atual",
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
  "🔹 DOCUMENTOS OPCIONAIS / CONDICIONAIS": {
    "📚 Escolaridade": [
      "Ensino Fundamental","Ensino Médio","Ensino Superior",
      "Pós-Graduação","Mestrado","Doutorado"
    ],
    "🏛 Registro Profissional": [
      "Registro Profissional (quando profissão regulamentada)",
      "Registro Profissional Pendente"
    ],
    "👨‍👩‍👧‍👦 Dependentes": [
      "RG e CPF do Cônjuge","Certidão de Casamento / União Estável",
      "RG e CPF dos Filhos","Cartão de Vacina dos Filhos",
      "Declaração Escolar dos Filhos"
    ]
  }
};

/* ---------- Variáveis ---------- */

let funcionarioAtual = null;
const checklistContainer = document.getElementById("checklistContainer");
const sidebarLista = document.getElementById("listaFuncionarios");
const modal = document.getElementById("modalConfirmacao");
const modalTexto = document.getElementById("modalTexto");
let callbackConfirmacao = null;

/* ---------- Utilidades ---------- */

function gerarID() {
  return "ADM-" + Date.now();
}

function obterFuncionarios() {
  return JSON.parse(localStorage.getItem("funcionarios")) || {};
}

function salvarFuncionarios(obj) {
  localStorage.setItem("funcionarios", JSON.stringify(obj));
}

/* ---------- Criar Checklist ---------- */

function criarChecklist() {
  const matricula = document.getElementById("matricula").value.trim();
  const nome = document.getElementById("nome").value.trim();

  if (!matricula || !nome) {
    alert("Preencha matrícula e nome.");
    return;
  }

  funcionarioAtual = gerarID();

  const funcionarios = obterFuncionarios();

  funcionarios[funcionarioAtual] = {
    matricula,
    nome,
    checklist: {}
  };

  salvarFuncionarios(funcionarios);
  renderChecklist(funcionarios[funcionarioAtual].checklist);
  atualizarSidebar();
}

/* ---------- Renderizar Checklist ---------- */

function renderChecklist(dados = {}) {
  checklistContainer.innerHTML = "";

  Object.entries(CHECKLIST_ESTRUTURA).forEach(([grupo, conteudo]) => {

    const grupoDiv = document.createElement("div");
    grupoDiv.classList.add("grupo");

    const titulo = document.createElement("h3");
    titulo.textContent = grupo;
    grupoDiv.appendChild(titulo);

    if (Array.isArray(conteudo)) {
      grupoDiv.appendChild(renderLista(conteudo, dados));
    } else {
      Object.entries(conteudo).forEach(([subGrupo, lista]) => {
        const subTitulo = document.createElement("h4");
        subTitulo.textContent = subGrupo;
        grupoDiv.appendChild(subTitulo);
        grupoDiv.appendChild(renderLista(lista, dados));
      });
    }

    checklistContainer.appendChild(grupoDiv);
  });
}

/* ---------- Render Lista ---------- */

function renderLista(lista, dados) {
  const ul = document.createElement("ul");

  lista.forEach(item => {
    const li = document.createElement("li");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = dados[item] || false;

    checkbox.addEventListener("change", () => {
      atualizarStatus();
    });

    const label = document.createElement("label");
    label.textContent = item;

    li.appendChild(checkbox);
    li.appendChild(label);
    ul.appendChild(li);
  });

  return ul;
}

/* ---------- Salvar ---------- */

function salvarChecklist() {
  if (!funcionarioAtual) return;

  const funcionarios = obterFuncionarios();
  const checkboxes = checklistContainer.querySelectorAll("input[type=checkbox]");

  checkboxes.forEach(cb => {
    const texto = cb.nextSibling.textContent;
    funcionarios[funcionarioAtual].checklist[texto] = cb.checked;
  });

  salvarFuncionarios(funcionarios);
  atualizarSidebar();
  alert("Checklist salvo.");
}

/* ---------- Carregar ---------- */

function carregarChecklist(id) {
  const funcionarios = obterFuncionarios();
  const funcionario = funcionarios[id];

  if (!funcionario) return;

  funcionarioAtual = id;

  document.getElementById("matricula").value = funcionario.matricula;
  document.getElementById("nome").value = funcionario.nome;

  renderChecklist(funcionario.checklist);
  atualizarSidebar();
}

/* ---------- Atualizar Sidebar ---------- */

function atualizarSidebar() {
  sidebarLista.innerHTML = "";
  const funcionarios = obterFuncionarios();

  Object.entries(funcionarios).forEach(([id, dados]) => {

    const total = Object.keys(flattenChecklist()).length;
    const preenchidos = Object.values(dados.checklist).filter(Boolean).length;
    const porcentagem = total ? (preenchidos / total) * 100 : 0;

    const item = document.createElement("div");
    item.classList.add("sidebar-item");

    const info = document.createElement("div");
    info.classList.add("sidebar-info");
    info.innerHTML = `<strong>${dados.matricula}</strong><br>${dados.nome}`;

    const status = document.createElement("span");
    status.classList.add("status-dot");

    if (porcentagem === 100) status.classList.add("concluido");
    else if (porcentagem > 0) status.classList.add("andamento");
    else status.classList.add("pendente");

    const btnExcluir = document.createElement("button");
    btnExcluir.textContent = "✕";
    btnExcluir.classList.add("btn-excluir");

    btnExcluir.onclick = (e) => {
      e.stopPropagation();
      abrirModal("Deseja excluir este funcionário?", () => {
        delete funcionarios[id];
        salvarFuncionarios(funcionarios);
        atualizarSidebar();
        checklistContainer.innerHTML = "";
      });
    };

    item.onclick = () => carregarChecklist(id);

    item.appendChild(info);
    item.appendChild(status);
    item.appendChild(btnExcluir);

    sidebarLista.appendChild(item);
  });
}

/* ---------- Flatten Checklist ---------- */

function flattenChecklist() {
  let lista = {};

  Object.values(CHECKLIST_ESTRUTURA).forEach(grupo => {
    if (Array.isArray(grupo)) {
      grupo.forEach(item => lista[item] = false);
    } else {
      Object.values(grupo).forEach(sub => {
        sub.forEach(item => lista[item] = false);
      });
    }
  });

  return lista;
}

/* ---------- Atualizar Status ---------- */

function atualizarStatus() {
  salvarChecklist();
}

/* ---------- Modal ---------- */

function abrirModal(texto, callback) {
  modalTexto.textContent = texto;
  modal.style.display = "flex";
  callbackConfirmacao = callback;
}

function confirmarModal() {
  if (callbackConfirmacao) callbackConfirmacao();
  fecharModal();
}

function fecharModal() {
  modal.style.display = "none";
  callbackConfirmacao = null;
}

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") fecharModal();
});

/* ---------- Exportar TXT ---------- */

function exportarTXT() {
  if (!funcionarioAtual) return;

  const funcionarios = obterFuncionarios();
  const dados = funcionarios[funcionarioAtual];

  let texto = `CHECKLIST ADMISSIONAL\n`;
  texto += `Matrícula: ${dados.matricula}\n`;
  texto += `Nome: ${dados.nome}\n\n`;

  Object.entries(dados.checklist).forEach(([item, status]) => {
    texto += `[${status ? "X" : " "}] ${item}\n`;
  });

  const blob = new Blob([texto], { type: "text/plain" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${dados.matricula}_${dados.nome}.txt`;
  link.click();
}

/* ---------- Copiar ---------- */

function copiarRelatorio() {
  if (!funcionarioAtual) return;

  const funcionarios = obterFuncionarios();
  const dados = funcionarios[funcionarioAtual];

  let texto = `CHECKLIST ADMISSIONAL\n`;
  texto += `Matrícula: ${dados.matricula}\n`;
  texto += `Nome: ${dados.nome}\n\n`;

  Object.entries(dados.checklist).forEach(([item, status]) => {
    texto += `[${status ? "X" : " "}] ${item}\n`;
  });

  navigator.clipboard.writeText(texto);
  alert("Relatório copiado.");
}

/* ---------- Inicialização ---------- */

atualizarSidebar();
