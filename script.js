let dados = JSON.parse(localStorage.getItem("checklistsRH")) || {};
let matriculaParaExcluir = null;

/* Estrutura simplificada exemplo */
const estrutura = {
"DOCUMENTOS":[
"RG",
"CPF",
"Carteira de Trabalho",
"Comprovante de Residência"
]
};

function criarChecklist(){
document.getElementById("checklist").innerHTML="";
for(let sec in estrutura){
estrutura[sec].forEach((item,index)=>{
let div=document.createElement("div");
div.innerHTML=`
<label>
<input type="checkbox" onchange="atualizarProgresso()">
${item}
</label><br>`;
document.getElementById("checklist").appendChild(div);
});
}
atualizarProgresso();
}

function salvarChecklist(){
const matricula=document.getElementById("matricula").value;
const nome=document.getElementById("nome").value;
if(!matricula || !nome) return alert("Preencha matrícula e nome.");

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
const percentual=Math.round((marcados/total)*100);
document.getElementById("progress").style.width=percentual+"%";
document.getElementById("stats").innerText=`${percentual}% concluído`;
}

function atualizarListaFuncionarios(){
const lista=document.getElementById("listaFuncionarios");
lista.innerHTML="";

Object.keys(dados).forEach(matricula=>{
const func=dados[matricula];
const percentual=Math.round((func.checklist.filter(i=>i).length/func.checklist.length)*100);

const div=document.createElement("div");
div.className="funcionario-item";

div.innerHTML=`
<div class="func-top">
   <div class="func-nome">${func.nome}</div>
   <span class="badge ${percentual===100?'success':'progress'}">
   ${percentual===100?'100%':'Em andamento'}
   </span>
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
`Deseja excluir <strong>${dados[matricula].nome}</strong>?`;
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
if(e.key==="Escape") fecharModal();
});

atualizarListaFuncionarios();
