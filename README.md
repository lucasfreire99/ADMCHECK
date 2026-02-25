
# 📋 ADMCHECK - Checklist de Documentação Admissional

![Version](https://img.shields.io/badge/version-2.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Build](https://img.shields.io/badge/build-passing-brightgreen)
![PRs](https://img.shields.io/badge/PRs-welcome-brightgreen)

> Sistema profissional para gestão de checklists admissionais desenvolvido para o setor de DP/RH.  
> Organize, acompanhe e armazene a documentação dos funcionários com uma interface dark slim moderna e intuitiva.

## 🚀 Tecnologias

| Tecnologia | Descrição |
|------------|-----------|
| **HTML5** | Estrutura semântica e acessível |
| **CSS3** | Design system dark slim com animações suaves |
| **JavaScript** (Vanilla) | Lógica pura sem frameworks |
| **LocalStorage** | Persistência de dados no navegador |
| **GitHub Pages** | Hospedagem gratuita e escalável |

## ✨ Funcionalidades

### 📌 **Gerenciamento de Funcionários**
- ✅ Cadastro completo (matrícula, nome e **cargo**)
- ✅ Listagem ordenada por **matrícula (crescente)**
- ✅ **Busca em tempo real** por matrícula ou nome
- ✅ Exclusão com modal de confirmação

### 📋 **Checklist Estruturado**
- ✅ 5 categorias organizadas hierarquicamente
- ✅ Mais de 30 itens documentais
- ✅ Checkboxes interativos com salvamento automático
- ✅ Categorias expansivas e de fácil navegação

### 🎯 **Indicadores Visuais**
- ✅ Badge colorido por status (sem textos)
  - 🟢 **Verde:** 100% dos documentos
  - 🟡 **Amarelo:** Parcialmente preenchido
  - ⚪ **Cinza:** Nenhum item marcado
- ✅ Feedback visual em tempo real

### 💾 **Persistência**
- ✅ Salvamento automático no localStorage
- ✅ Dados preservados após fechar o navegador
- ✅ Estrutura otimizada para consulta rápida

### 📤 **Exportação**
- ✅ **Exportar .txt** - Arquivo formatado com matrícula_nome.txt
- ✅ **Copiar relatório** - Para área de transferência
- ✅ Relatório inclui: matrícula, nome, cargo e checklist completo

### 🎨 **Design System**
- ✅ Dark slim moderno (`#0f1115`, `#1a1e24`, `#252b33`)
- ✅ Sidebar fixa com scroll customizado
- ✅ Bordas suaves (border-radius 8-12px)
- ✅ Tipografia Segoe UI
- ✅ Modal estilizado com overlay e tecla ESC

## 📋 Estrutura do Checklist

<details>
<summary><b>🔹 DOCUMENTOS OBRIGATÓRIOS</b></summary>

- Currículo atualizado
- 01 Foto 3x4
- CTPS Digital
- RG – Frente e Verso
- CPF
- Título de Eleitor
- Comprovante de Residência Atual
- Certificado de Dispensa de Incorporação (Reservista)
- Cartão PIS + Consulta de Qualificação Cadastral
- Comprovante de Situação Cadastral do CPF
- Atestado de Antecedentes Criminais (Original)
- Conta Bancária – Bradesco ou Next
- Certificados de Cursos Profissionalizantes
- CNH (quando aplicável à função)
- Exame Toxicológico (para função motorista)
- Curso de Direção Defensiva (para função motorista)
- Curso de Primeiros Socorros (para função motorista)
- Cartão de Vacina
- Atestado Médico Admissional
</details>

<details>
<summary><b>🔹 DOCUMENTOS OPCIONAIS / CONDICIONAIS</b></summary>

#### 📚 Escolaridade
- Ensino Fundamental
- Ensino Médio
- Ensino Superior
- Pós-Graduação
- Mestrado
- Doutorado

#### 🏛 Registro Profissional
- Registro Profissional (quando profissão regulamentada)
- Registro Profissional Pendente

#### 👨‍👩‍👧‍👦 Dependentes
- RG e CPF do Cônjuge
- Certidão de Casamento / União Estável
- RG e CPF dos Filhos
- Cartão de Vacina dos Filhos
- Declaração Escolar dos Filhos
</details>

## 🖥️ Como usar

### 🔗 **Acessar online**
O sistema está disponível em: [https://lucasfreire99.github.io/ADMCHECK/](https://lucasfreire99.github.io/ADMCHECK/)

### 📥 **Instalação local**

# Clone o repositório
git clone https://github.com/lucasfreire99.github.io/ADMCHECK.git

# Entre no diretório
cd admcheck

# Abra o arquivo index.html no navegador
# ou use um servidor local (recomendado)
npx live-server
📖 Guia rápido
1. Cadastrar funcionário
text
1. Preencha: Matrícula | Nome | Cargo
2. Clique em "Criar"
3. O funcionário aparece na sidebar automaticamente
2. Preencher checklist
text
1. Clique no funcionário na sidebar
2. Marque/desmarque os documentos
3. Clique em "Salvar" (ou aguarde salvamento automático)
4. O status na sidebar é atualizado automaticamente
3. Buscar funcionários
text
1. Use o campo de busca na sidebar
2. Digite parte da matrícula ou nome
3. A lista filtra em tempo real
4. Exportar relatório
text
1. Selecione o funcionário desejado
2. Clique em "Exportar .txt" para baixar
3. Ou clique em "Copiar Relatório" para clipboard
🎯 Regras de Negócio
Status por cor (apenas visual)
Cor	Significado	% de Preenchimento
🟢 Verde	Checklist completo	100%
🟡 Amarelo	Parcialmente preenchido	1% - 99%
⚪ Cinza	Não iniciado	0%
Ordenação
Sidebar ordenada por matrícula em ordem crescente

Ordenação numérica (ex: 001, 002, 010...)

Persistência
Todos os dados salvos no localStorage

Estrutura por ID único (timestamp)

Checklist sempre inicia vazio (todos false)

📁 Estrutura de Dados
javascript
`{
  "ID_UNICO": {
    matricula: "123",
    nome: "João Silva",
    cargo: "Analista de RH",
    checklist: {
      "Currículo atualizado": false,
      "01 Foto 3x4": true,
      // ... demais itens
    }
  }
}`

🔧 Melhorias da Versão 2.0
Funcionalidade	Descrição
📊 Ordenação	Sidebar ordenada por matrícula (crescente)
🔍 Busca em tempo real	Filtro por matrícula ou nome
👔 Campo Cargo	Novo campo nas informações do funcionário
🎨 Cargo na sidebar	Exibido abaixo do nome
📄 Relatório atualizado	Inclui campo cargo na exportação
⚡ Performance	Otimização na renderização da lista
🤝 Contribuições
Contribuições são sempre bem-vindas! Siga os passos:

Fork o projeto

Crie sua branch (git checkout -b feature/AmazingFeature)

Commit suas mudanças (git commit -m 'Add some AmazingFeature')

Push para a branch (git push origin feature/AmazingFeature)

Abra um Pull Request

📄 Licença
Distribuído sob licença MIT. Veja LICENSE para mais informações.

📞 Contato
LinkedIn: Seu Nome

Email: seu.email@example.com

Projeto: https://github.com/seu-usuario/admcheck

⭐ Funcionalidades Futuras
Modo claro/clássico

Gráficos de progresso

Múltiplos checklists por funcionário

Backup/restore dos dados

Impressão do relatório

Upload de documentos

<p align="center"> <sub>Desenvolvido com ❤️ para o setor de DP/RH</sub> <br> <sub>© 2026 ADMCHECK - Todos os direitos reservados</sub> </p> ```
