# 📋 ADMCHECK

![Version](https://img.shields.io/badge/version-2.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Build](https://img.shields.io/badge/build-passing-brightgreen)
![PRs](https://img.shields.io/badge/PRs-welcome-brightgreen)

> Sistema profissional para gestão de checklists admissionais desenvolvido para o setor de DP/RH.
> Organize, acompanhe e armazene a documentação dos funcionários com uma interface **dark slim moderna e intuitiva**.

---

## 📖 Introdução

O **ADMCHECK** é uma aplicação web desenvolvida para otimizar o processo de conferência e organização da documentação admissional de funcionários.

Voltado para o setor de **Departamento Pessoal (DP)** e **Recursos Humanos (RH)**, o sistema permite:

* Controle estruturado de documentos obrigatórios e condicionais
* Acompanhamento visual de status
* Exportação de relatórios individuais
* Persistência local dos dados

A aplicação é leve, rápida e funciona 100% no navegador.

---

## 📑 Índice

* [Tecnologias](#-tecnologias)
* [Instalação](#-instalação)
* [Como Usar](#-como-usar)
* [Funcionalidades](#-funcionalidades)
* [Estrutura do Checklist](#-estrutura-do-checklist)
* [Regras de Negócio](#-regras-de-negócio)
* [Estrutura de Dados](#-estrutura-de-dados)
* [Melhorias da Versão 2.0](#-melhorias-da-versão-20)
* [Funcionalidades Futuras](#-funcionalidades-futuras)
* [Contribuições](#-contribuições)
* [Licença](#-licença)
* [Contato](#-contato)

---

## 🚀 Tecnologias

| Tecnologia               | Descrição                                    |
| ------------------------ | -------------------------------------------- |
| **HTML5**                | Estrutura semântica e acessível              |
| **CSS3**                 | Design system dark slim com animações suaves |
| **JavaScript (Vanilla)** | Lógica pura sem frameworks                   |
| **LocalStorage**         | Persistência de dados no navegador           |
| **GitHub Pages**         | Hospedagem gratuita e escalável              |

---

## 📥 Instalação

### 🔗 Acessar Online

A aplicação está disponível em:

👉 [https://lucasfreire99.github.io/ADMCHECK/](https://lucasfreire99.github.io/ADMCHECK/)

---

### 💻 Instalação Local

```bash
# Clone o repositório
git clone https://github.com/lucasfreire99/ADMCHECK.git

# Entre no diretório
cd ADMCHECK

# Abra o index.html no navegador
# ou utilize um servidor local (recomendado)
npx live-server
```

---

## 🖥️ Como Usar

### 1️⃣ Cadastrar Funcionário

1. Preencha:

   * Matrícula
   * Nome
   * Cargo
2. Clique em **"Criar"**
3. O funcionário aparecerá automaticamente na sidebar

---

### 2️⃣ Preencher Checklist

1. Clique no funcionário na sidebar
2. Marque ou desmarque os documentos
3. Clique em **Salvar** (ou aguarde o salvamento automático)
4. O status será atualizado automaticamente

---

### 3️⃣ Buscar Funcionários

1. Utilize o campo de busca
2. Digite parte da matrícula ou nome
3. A lista será filtrada em tempo real

---

### 4️⃣ Exportar Relatório

1. Selecione o funcionário
2. Clique em:

   * **Exportar .txt** (download automático)
   * **Copiar Relatório** (área de transferência)

O relatório contém:

* Matrícula
* Nome
* Cargo
* Checklist completo

---

## ✨ Funcionalidades

### 📌 Gerenciamento de Funcionários

* Cadastro completo (matrícula, nome e cargo)
* Listagem ordenada por matrícula (crescente)
* Busca em tempo real
* Exclusão com modal de confirmação

---

### 📋 Checklist Estruturado

* 5 categorias organizadas hierarquicamente
* +30 itens documentais
* Checkboxes interativos
* Salvamento automático
* Categorias expansivas

---

### 🎯 Indicadores Visuais

| Cor        | Significado        | Percentual |
| ---------- | ------------------ | ---------- |
| 🟢 Verde   | Checklist completo | 100%       |
| 🟡 Amarelo | Parcial            | 1% – 99%   |
| ⚪ Cinza    | Não iniciado       | 0%         |

---

### 💾 Persistência

* Dados armazenados no `localStorage`
* Estrutura otimizada por ID único (timestamp)
* Checklist inicia sempre vazio

---

### 📤 Exportação

* Exportação `.txt`
* Cópia para clipboard
* Nome do arquivo: `matricula_nome.txt`

---

### 🎨 Design System

* Paleta dark slim (`#0f1115`, `#1a1e24`, `#252b33`)
* Sidebar fixa
* Scroll customizado
* Border-radius 8–12px
* Tipografia Segoe UI
* Modal com overlay e suporte à tecla ESC

---

## 📋 Estrutura do Checklist

### 🔹 Documentos Obrigatórios

* Currículo atualizado
* 01 Foto 3x4
* CTPS Digital
* RG – Frente e Verso
* CPF
* Título de Eleitor
* Comprovante de Residência
* Reservista
* Cartão PIS
* Situação Cadastral CPF
* Antecedentes Criminais
* Conta Bancária
* Certificados
* CNH (quando aplicável)
* Exame Toxicológico (motorista)
* Direção Defensiva (motorista)
* Primeiros Socorros (motorista)
* Cartão de Vacina
* Atestado Médico Admissional

---

### 🔹 Documentos Opcionais / Condicionais

**Escolaridade**

* Ensino Fundamental
* Ensino Médio
* Ensino Superior
* Pós-Graduação
* Mestrado
* Doutorado

**Registro Profissional**

* Registro Profissional
* Registro Pendente

**Dependentes**

* RG/CPF do Cônjuge
* Certidão de Casamento
* RG/CPF dos Filhos
* Cartão de Vacina dos Filhos
* Declaração Escolar

---

## 🎯 Regras de Negócio

### 📌 Ordenação

* Sidebar ordenada por matrícula crescente
* Ordenação numérica real (001, 002, 010...)

### 📌 Persistência

* Armazenamento via `localStorage`
* ID único baseado em timestamp

### 📌 Status

* Cálculo automático por percentual de itens marcados
* Atualização em tempo real

---

## 📁 Estrutura de Dados

```javascript
{
  "ID_UNICO": {
    matricula: "123",
    nome: "João Silva",
    cargo: "Analista de RH",
    checklist: {
      "Currículo atualizado": false,
      "01 Foto 3x4": true
    }
  }
}
```

---

## 🔧 Melhorias da Versão 2.0

| Funcionalidade          | Descrição                        |
| ----------------------- | -------------------------------- |
| 📊 Ordenação            | Ordenação numérica por matrícula |
| 🔍 Busca                | Filtro em tempo real             |
| 👔 Campo Cargo          | Novo campo no cadastro           |
| 🎨 Cargo na Sidebar     | Exibido abaixo do nome           |
| 📄 Relatório Atualizado | Inclui cargo                     |
| ⚡ Performance           | Otimização na renderização       |

---

## ⭐ Funcionalidades Futuras

* Modo claro
* Gráficos de progresso
* Múltiplos checklists por funcionário
* Backup e restore
* Impressão do relatório
* Upload de documentos

---

## 🤝 Contribuições

Contribuições são bem-vindas!

1. Faça um fork
2. Crie uma branch (`git checkout -b feature/NovaFeature`)
3. Commit (`git commit -m 'Add NovaFeature'`)
4. Push (`git push origin feature/NovaFeature`)
5. Abra um Pull Request

---

## 📄 Licença

Distribuído sob a licença **MIT**.
Consulte o arquivo `LICENSE` para mais detalhes.

---

## 📞 Contato

GitHub: [https://github.com/lucasfreire99](https://github.com/lucasfreire99)
Projeto: [https://github.com/lucasfreire99/ADMCHECK](https://github.com/lucasfreire99/ADMCHECK)
Live Demo: [https://lucasfreire99.github.io/ADMCHECK/](https://lucasfreire99.github.io/ADMCHECK/)

---

<p align="center">
  <sub>Desenvolvido com ❤️ para o setor de DP/RH</sub><br>
  <sub>© 2024 ADMCHECK - Todos os direitos reservados</sub>
</p>
