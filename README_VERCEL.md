# 🚀 Deploy DataHub Analytics na Vercel

## 📋 Guia de Deploy

### 1. **Conectar GitHub à Vercel**
```bash
# Acesse https://vercel.com/new
# Importe o repositório: MichelAlmeida1990/Filtragem-de-Leads
```

### 2. **Configurações Automáticas**
✅ Framework Preset: **Other**  
✅ Root Directory: **/** (padrão)  
✅ Build Command: **npm run build**  
✅ Output Directory: **public** (padrão)  
✅ Install Command: **npm install**  

### 3. **Variáveis de Ambiente**
Não são necessárias para este projeto.

### 4. **Estrutura para Vercel**
```
/
├── api/
│   └── upload-excel.js     # API Serverless
├── public/
│   ├── index.html          # Frontend
│   ├── script.js           # JavaScript
│   └── styles.css          # CSS
├── vercel.json             # Configuração Vercel
└── package.json            # Dependências
```

### 5. **URLs Após Deploy**
- **Aplicação Principal:** `https://seu-projeto.vercel.app/`
- **API Upload:** `https://seu-projeto.vercel.app/api/upload-excel`

### 6. **Funcionalidades Serverless**
✅ Upload de arquivos Excel/CSV  
✅ Processamento de dados  
✅ Filtragem inteligente  
✅ Exportação de relatórios  
✅ Interface responsiva  

### 7. **Limitações Vercel**
- **Tamanho do arquivo:** Máximo 10MB
- **Timeout:** 30 segundos para processamento
- **Memória:** Limitada por plano

### 8. **Deploy Automático**
Todo push para a branch `main` fará deploy automático.

## 🎯 Comandos Locais

```bash
# Instalar dependências
npm install

# Executar localmente
npm run dev

# Build para produção  
npm run build
```

## 🔧 Solução de Problemas

### Erro de Build
```bash
# Verificar logs no dashboard da Vercel
# Revisar dependências no package.json
```

### API não responde
```bash
# Verificar rotas no vercel.json
# Conferir estrutura da pasta /api
```

### Upload falha
```bash
# Verificar tamanho do arquivo (< 10MB)
# Confirmar formato (Excel/CSV)
```

## 📱 Teste de Produção

1. **Acesse a URL da Vercel**
2. **Teste upload de arquivo**
3. **Verifique filtragem**
4. **Teste exportação**
5. **Confirme responsividade**

## 🎨 Customização

Para alterar configurações após deploy:
1. Modifique `vercel.json`
2. Faça push para `main`
3. Deploy automático será executado

---

**🚀 DataHub Analytics pronto para produção na Vercel!**