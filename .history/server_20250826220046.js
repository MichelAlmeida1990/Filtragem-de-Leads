const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const XLSX = require('xlsx');

const app = express();
const PORT = 3001;

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

// Middleware para forçar UTF-8
app.use((req, res, next) => {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Content-Encoding', 'utf-8');
    next();
});

// Aumentar limite de tamanho para dados JSON
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use(express.static('public'));

// Rota principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Rota para página de teste de upload
app.get('/test', (req, res) => {
    res.sendFile(path.join(__dirname, 'test_upload.html'));
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
        console.log('=== UPLOAD DE ARQUIVO EXCEL ===');
        console.log('Headers:', req.headers);
        console.log('Files:', req.files);
        console.log('File:', req.file);
        
        if (!req.file) {
            console.error('Nenhum arquivo recebido');
            return res.status(400).json({ error: 'Nenhum arquivo foi enviado' });
        }

        console.log('Arquivo recebido:', {
            originalname: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size,
            buffer: req.file.buffer ? 'Buffer presente' : 'Buffer ausente'
        });

        // Verificar se o buffer está presente
        if (!req.file.buffer) {
            console.error('Buffer do arquivo não encontrado');
            return res.status(400).json({ error: 'Arquivo corrompido ou inválido' });
        }

        // Ler o arquivo Excel com configuração UTF-8
        console.log('Tentando ler arquivo Excel...');
        const workbook = XLSX.read(req.file.buffer, { 
            type: 'buffer',
            codepage: 65001, // UTF-8
            cellText: true,
            cellDates: true
        });
        
        console.log('Planilhas encontradas:', workbook.SheetNames);
        
        // Pegar a primeira planilha
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        console.log('Planilha selecionada:', sheetName);
        
        // Converter para JSON mantendo a estrutura original com UTF-8
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
            header: 1,
            raw: false,
            defval: ''
        });
        
        console.log('Dados convertidos:', {
            totalRows: jsonData.length,
            firstRow: jsonData[0],
            sampleData: jsonData.slice(0, 3)
        });
        
        // Converter para string CSV mantendo a formatação original
        const csvData = jsonData.map(row => 
            row.map(cell => {
                // Se o valor contém vírgula, colocar entre aspas
                if (cell && cell.toString().includes(',')) {
                    return `"${cell}"`;
                }
                return cell || '';
            }).join(', ')
        ).join('\n');
        
        console.log('CSV gerado (primeiros 500 chars):', csvData.substring(0, 500));
        
        const formattedData = {
            original: csvData,
            formatted: csvData,
            filename: req.file.originalname,
            sheetName: sheetName,
            rows: jsonData.length,
            timestamp: new Date().toISOString()
        };

        console.log('Dados formatados enviados com sucesso');
        res.json(formattedData);
    } catch (error) {
        console.error('Erro detalhado ao processar arquivo:', error);
        console.error('Stack trace:', error.stack);
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