<div align="center">
  
# 📋 ADMCHECK - Sistema de Checklist Admissional

![Version](https://img.shields.io/badge/version-3.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Build](https://img.shields.io/badge/build-passing-brightgreen)
![PRs](https://img.shields.io/badge/PRs-welcome-brightgreen)
![Maintenance](https://img.shields.io/badge/maintained-yes-blue)
![JavaScript](https://img.shields.io/badge/JavaScript-Vanilla-F7DF1E)
![CSS](https://img.shields.io/badge/CSS3-Dark%20Slim-1572B6)


  ### 🎯 Gerencie checklists admissionais com eficiência e estilo

</div>

---


## 🎯 Sobre o Projeto

**ADMCHECK** é um sistema web profissional desenvolvido para o setor de **DP/RH** gerenciar checklists admissionais de forma eficiente, intuitiva e elegante.

Com uma interface **dark slim moderna**, o sistema permite:

- 📝 Cadastrar funcionários com matrícula, nome, cargo e setor  
- ✅ Gerenciar checklist completo de documentos admissionais  
- 📊 Acompanhar progresso com indicadores visuais  
- 💾 Persistência local dos dados via `localStorage`  
- 📤 Exportar relatórios em múltiplos formatos  
- 📥 Importar funcionários em lote  
- 🔄 Backup e restauração de dados  

---

## ✨ Funcionalidades

### 📌 Gestão de Funcionários

- Cadastro completo (Matrícula, Nome, Cargo e Setor)
- Ordenação automática por matrícula (crescente)
- Busca em tempo real
- Contador total com badge
- Exclusão com modal de confirmação

---

### 📋 Checklist Inteligente

- 5 categorias organizadas
- Status "Não Aplicável" (➖) para itens condicionais
- Escolaridade exclusiva (apenas 1 nível pode ser marcado)
- Dependentes condicionais (categoria pode ser ocultada)
- Cálculo inteligente de progresso

---

### 🎯 Sistema de Status

- 🟢 Verde → 100% (Checklist completo)
- 🟡 Amarelo → 1% a 99% (Parcial)
- ⚪ Cinza → 0% (Não iniciado)

---

### 📤 Exportação Multi-formato

- 📄 TXT
- 📑 PDF
- 📊 Excel (XLSX)
- 📦 JSON

---

### 📥 Importação em Lote

- Download de template CSV/Excel
- Upload em massa
- Barra de progresso
- Resumo de importação

---

### 💾 Backup e Restauração

- Backup do funcionário atual
- Backup completo do sistema
- Restauração via arquivo `.backup`
- Modal com progresso visual

---

## 🚀 Tecnologias

- **HTML5**
- **CSS3**
- **JavaScript (ES6+)**
- **LocalStorage**
- **jsPDF**
- **SheetJS (XLSX)**

---

## 📋 Estrutura do Checklist

### 🔹 Documentos Obrigatórios

- Currículo atualizado
- 01 Foto 3x4
- CTPS Digital
- RG – Frente e Verso
- CPF
- Título de Eleitor
- Comprovante de Residência Atual
- Certificado de Dispensa de Incorporação (Reservista) ➖
- Cartão PIS + Consulta de Qualificação Cadastral
- Comprovante de Situação Cadastral do CPF
- Atestado de Antecedentes Criminais
- Conta Bancária – Bradesco ou Next
- Certificados de Cursos Profissionalizantes ➖
- CNH (quando aplicável) ➖
- Exame Toxicológico ➖
- Curso de Direção Defensiva ➖
- Curso de Primeiros Socorros ➖
- Cartão de Vacina
- Atestado Médico Admissional

### 🔹 Documentos Opcionais / Condicionais

#### 📚 Escolaridade (Exclusivo)

- Ensino Fundamental
- Ensino Médio
- Ensino Superior
- Pós-Graduação
- Mestrado
- Doutorado

#### 🏛 Registro Profissional

- Registro Profissional ➖
- Registro Profissional Pendente

#### 👨‍👩‍👧‍👦 Dependentes

- RG e CPF do Cônjuge
- Certidão de Casamento / União Estável
- RG e CPF dos Filhos
- Cartão de Vacina dos Filhos
- Declaração Escolar dos Filhos

➖ = Pode ser marcado como "Não Aplicável"

---

## 🖥️ Instalação

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/admcheck.git

# Entre no diretório
cd admcheck

# Execute com servidor local (recomendado)
npx live-server
```

Ou simplesmente abra o `index.html` no navegador.

---

## 📖 Como Usar

1. Cadastre um funcionário
2. Selecione na sidebar
3. Preencha o checklist
4. Salve automaticamente
5. Exporte, faça backup ou importe dados

---

## 📊 Regras de Negócio

- Matrícula e nome são obrigatórios
- Escolaridade permite apenas 1 seleção
- Itens "Não Aplicável" não contam no progresso
- Dependentes podem ser ocultados
- Progresso = (Itens Marcados / Itens Válidos) × 100

---

## 💾 Estrutura de Dados

```json
{
  "ID_TIMESTAMP": {
    "matricula": "001",
    "nome": "João Silva",
    "cargo": "Analista",
    "setor": "RH",
    "naoPossuiDependentes": false,
    "checklist": {
      "Currículo atualizado": {
        "marcado": true,
        "naoAplicavel": false
      }
    }
  }
}
```

---

## 🎨 Design System

**Cores Principais**

- Fundo: `#0f1115`
- Sidebar: `#1a1e24`
- Cards: `#252b33`
- Destaque: `#4f9eff`

**Status**

- Verde: `#00c853`
- Amarelo: `#ffd600`
- Cinza: `#6b7280`

---

## 🗺️ Roadmap

### ✅ Versão 1.0
- Cadastro básico
- Checklist estático
- Exportação TXT

### ✅ Versão 2.0
- Busca em tempo real
- Exportação PDF/Excel/JSON
- Importação em lote

### ✅ Versão 3.0
- Status "Não Aplicável"
- Backup completo
- Restauração
- Modais com progresso

### 🔜 Próximas Versões
- Modo claro
- Dashboard com gráficos
- Upload de documentos
- Alertas de vencimento
- Autenticação
- Sincronização em nuvem
- PWA Mobile

---

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch
3. Commit suas alterações
4. Envie para o repositório
5. Abra um Pull Request

---

## 📄 Licença

Distribuído sob licença MIT.

---

<div align="center">
  <sub>Desenvolvido com ❤️ para o setor de DP/RH</sub><br>
  <sub>© 2026 ADMCHECK - Versão 3.0.0</sub>
</div>
