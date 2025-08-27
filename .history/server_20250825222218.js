const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const XLSX = require('xlsx');

const app = express();
const PORT = 3000;

// Configuração do Multer para upload de arquivos
const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    fileFilter: (req, file, cb) => {
        // Aceitar apenas arquivos Excel
        if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
            file.mimetype === 'application/vnd.ms-excel' ||
            file.originalname.endsWith('.xlsx') ||
            file.originalname.endsWith('.xls')) {
            cb(null, true);
        } else {
            cb(new Error('Apenas arquivos Excel são permitidos!'), false);
        }
    },
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB máximo
    }
});

// Middleware
app.use(cors());

// Aumentar limite de tamanho para dados JSON
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use(express.static('public'));

// Rota principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Rota para processar dados do Excel (texto)
app.post('/api/format-data', (req, res) => {
    try {
        const { data } = req.body;
        
        if (!data) {
            return res.status(400).json({ error: 'Dados não fornecidos' });
        }

        // Aqui você pode adicionar a lógica de formatação específica
        // Por enquanto, apenas retornamos os dados como estão
        const formattedData = {
            original: data,
            formatted: data,
            timestamp: new Date().toISOString()
        };

        res.json(formattedData);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao processar dados: ' + error.message });
    }
});

// Rota para upload de arquivo Excel
app.post('/api/upload-excel', upload.single('excelFile'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Nenhum arquivo foi enviado' });
        }

        // Ler o arquivo Excel
        const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
        
        // Pegar a primeira planilha
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Converter para JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        // Converter para string CSV
        const csvData = jsonData.map(row => row.join(', ')).join('\n');
        
        const formattedData = {
            original: csvData,
            formatted: csvData,
            filename: req.file.originalname,
            sheetName: sheetName,
            rows: jsonData.length,
            timestamp: new Date().toISOString()
        };

        res.json(formattedData);
    } catch (error) {
        console.error('Erro ao processar arquivo:', error);
        res.status(500).json({ error: 'Erro ao processar arquivo Excel: ' + error.message });
    }
});

// Middleware para tratamento de erros do Multer
app.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'Arquivo muito grande. Máximo 10MB.' });
        }
    }
    res.status(400).json({ error: error.message });
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`Acesse: http://localhost:${PORT}`);
}); 