let dados = JSON.parse(localStorage.getItem("checklistsRH")) || {};
let matriculaParaExcluir = null;

/* Estrutura exemplo */
const estrutura = {
"🔹 DOCUMENTOS OBRIGATÓRIOS":[
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
"Cartão de Vacina","Atestado Médico Admissional"
],
"🔹 DOCUMENTOS OPCIONAIS / CONDICIONAIS":
"📚 Escolaridade":[
"Ensino Fundamental","Ensino Médio","Ensino Superior",
"Pós-Graduação","Mestrado","Doutorado"
],
"🏛 Registro Profissional":[
"Registro Profissional (quando profissão regulamentada)",
"Registro Profissional Pendente"
],
"👨‍👩‍👧‍👦 Dependentes":[
"RG e CPF do Cônjuge","Certidão de Casamento / União Estável",
"RG e CPF dos Filhos","Cartão de Vacina dos Filhos",
"Declaração Escolar dos Filhos"
]
};

function criarChecklist(){
const container=document.getElementById("checklist");
container.innerHTML="";

estrutura["DOCUMENTOS"].forEach(item=>{
let div=document.createElement("div");
div.innerHTML=`
<label>
<input type="checkbox" onchange="atualizarProgresso()">
${item}
</label><br>`;
container.appendChild(div);
});

atualizarProgresso();
}

function salvarChecklist(){
const matricula=document.getElementById("matricula").value;
const nome=document.getElementById("nome").value;

if(!matricula || !nome){
alert("Preencha matrícula e nome.");
return;
}

const checks=document.querySelectorAll("#checklist input");

dados[matricula]={
nome:nome,
checklist:Array.from(checks).map(c=>c.checked)
};

localStorage.setItem("checklistsRH",JSON.stringify(dados));
atualizarListaFuncionarios();
}

function carregarChecklist(){
const matricula=document.getElementById("matricula").value;
if(!dados[matricula]) return;

criarChecklist();

const checks=document.querySelectorAll("#checklist input");
checks.forEach((c,i)=>c.checked=dados[matricula].checklist[i]);

atualizarProgresso();
}

function atualizarProgresso(){
const checks=document.querySelectorAll("#checklist input");
const total=checks.length;
const marcados=Array.from(checks).filter(c=>c.checked).length;
const percentual=total ? Math.round((marcados/total)*100) : 0;

document.getElementById("progress").style.width=percentual+"%";
document.getElementById("stats").innerText=`${percentual}% concluído`;
}

function atualizarListaFuncionarios(){
const lista=document.getElementById("listaFuncionarios");
lista.innerHTML="";

Object.keys(dados).forEach(matricula=>{
const func=dados[matricula];

const total=func.checklist.length;
const marcados=func.checklist.filter(i=>i).length;
const percentual=total ? Math.round((marcados/total)*100) : 0;

let statusClass="empty";
if(percentual===100){
statusClass="success";
}else if(percentual>0){
statusClass="progress";
}

const div=document.createElement("div");
div.className="funcionario-item";

div.innerHTML=`
<div class="func-top">
   <div class="func-nome">${func.nome}</div>
   <span class="badge ${statusClass}"></span>
</div>

<div class="func-bottom">
   <div class="func-matricula">Matrícula: ${matricula}</div>
   <button class="btn-excluir" onclick="excluirFuncionario('${matricula}')">Excluir</button>
</div>
`;

div.onclick=(e)=>{
if(e.target.tagName!=="BUTTON"){
document.getElementById("matricula").value=matricula;
document.getElementById("nome").value=func.nome;
carregarChecklist();
}
};

lista.appendChild(div);
});
}

function excluirFuncionario(matricula){
matriculaParaExcluir=matricula;

document.getElementById("modalTexto").innerHTML=
`Deseja excluir <strong>${dados[maticulaParaExcluir].nome}</strong>?`;

document.getElementById("modalOverlay").style.display="flex";
}

function fecharModal(){
document.getElementById("modalOverlay").style.display="none";
matriculaParaExcluir=null;
}

function confirmarExclusao(){
if(matriculaParaExcluir){
delete dados[matriculaParaExcluir];
localStorage.setItem("checklistsRH",JSON.stringify(dados));
atualizarListaFuncionarios();
}
fecharModal();
}

document.addEventListener("keydown",function(e){
if(e.key==="Escape"){
fecharModal();
}
});

atualizarListaFuncionarios();
