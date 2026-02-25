# 📋 ADMCHECK — Sistema de Checklist Admissional

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Build](https://img.shields.io/badge/build-static-success.svg)
![Status](https://img.shields.io/badge/status-active-brightgreen.svg)
![License](https://img.shields.io/badge/license-MIT-lightgrey.svg)
![Made with](https://img.shields.io/badge/Made%20with-JavaScript-yellow.svg)

Sistema web para controle e acompanhamento de checklist admissional de colaboradores, com persistência local e interface corporativa moderna.

🔗 **Acesse o sistema:**  
https://lucasfreire99.github.io/ADMCHECK/

---

## 🎯 Objetivo

O **ADMCHECK** foi desenvolvido para organizar e acompanhar o processo de admissão de colaboradores, permitindo:

- Cadastro por matrícula e nome
- Controle visual de progresso
- Indicador de status exclusivamente visual (dot colorido)
- Persistência de dados via LocalStorage
- Interface otimizada para uso interno em RH / DP

---

## 🚀 Funcionalidades

### 📋 Checklist Individual
- Estrutura de documentos configurável
- Barra de progresso automática
- Percentual de conclusão em tempo real
- Salvamento persistente

### 👥 Sidebar Inteligente
- Lista fixa lateral
- Exibição de:
  - Nome
  - Matrícula
  - Indicador visual de status (sem texto)
- Exclusão com modal estilizado
- Fechamento com tecla `ESC`

### 🎨 Indicadores de Status

| Cor | Significado |
|-----|------------|
| 🟢 Verde | 100% concluído |
| 🔵 Azul | Parcialmente preenchido |
| ⚫ Cinza | Não iniciado |

---

## 🏗 Estrutura do Projeto

ADMCHECK/
│
├── index.html
├── style.css
├── script.js
└── README.md

---

## 🖥 Tecnologias Utilizadas

- HTML5
- CSS3 (Flexbox)
- JavaScript ES6
- LocalStorage API
- GitHub Pages (Deploy)

Sem frameworks externos.

---

## 📊 Arquitetura

- Renderização dinâmica via DOM
- Estado centralizado no objeto `dados`
- Persistência via JSON serializado
- Separação modular (HTML + CSS + JS)

### Fluxo de Execução

1. Criar checklist
2. Marcar documentos
3. Salvar colaborador
4. Atualização automática do status visual
5. Persistência no navegador

---

## 🔐 Persistência

Os dados são armazenados localmente no navegador usando:
localStorage.setItem("checklistsRH", JSON.stringify(dados));

Nenhum dado é enviado para servidor externo.

---

## 🌐 Deploy

Projeto hospedado via:

**GitHub Pages**

Repositório:
https://github.com/lucasfreire99/ADMCHECK

Deploy:
https://lucasfreire99.github.io/ADMCHECK/

---

## 📌 Roadmap

- 🔎 Filtro por nome/matrícula
- 📊 Ordenação automática por status
- ☁️ Integração com banco de dados
- 🔐 Autenticação
- 🏢 Múltiplas filiais
- 📄 Exportação em PDF

---

## 👨‍💻 Autor

**Lucas Freire**  
Assistente de Departamento Pessoal / RH  
Lima Campos - MA

---

## 📄 Licença

Este projeto está sob a licença MIT.  
Veja o arquivo `LICENSE` para mais detalhes.
