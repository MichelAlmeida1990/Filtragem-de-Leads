const multer = require('multer');
const XLSX = require('xlsx');

// Configuração do multer para upload em memória
const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB
    }
});

module.exports = async (req, res) => {
    // Configurar CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }

    try {
        // Usar multer como middleware
        await new Promise((resolve, reject) => {
            upload.single('file')(req, res, (err) => {
                if (err) {
                    console.error('Erro no multer:', err);
                    reject(err);
                } else {
                    resolve();
                }
            });
        });

        if (!req.file) {
            return res.status(400).json({ error: 'Nenhum arquivo enviado' });
        }

        console.log('Arquivo recebido:', req.file.originalname);
        
        let csvData = '';
        
        if (req.file.originalname.endsWith('.xlsx') || req.file.originalname.endsWith('.xls')) {
            // Processar arquivo Excel
            try {
                const workbook = XLSX.read(req.file.buffer, { 
                    type: 'buffer',
                    codepage: 65001 // UTF-8
                });
                
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                
                // Converter para CSV com codificação UTF-8
                csvData = XLSX.utils.sheet_to_csv(worksheet, { 
                    FS: ',',
                    RS: '\n',
                    blankrows: false
                });
                
                console.log('Arquivo Excel processado, primeiras linhas:', csvData.substring(0, 200));
                
            } catch (xlsxError) {
                console.error('Erro ao processar Excel:', xlsxError);
                return res.status(400).json({ 
                    error: 'Erro ao processar arquivo Excel',
                    details: xlsxError.message 
                });
            }
        } else if (req.file.originalname.endsWith('.csv')) {
            // Processar arquivo CSV
            csvData = req.file.buffer.toString('utf8');
            
            // Remover BOM se presente
            if (csvData.charCodeAt(0) === 0xFEFF) {
                csvData = csvData.slice(1);
            }
            
            console.log('Arquivo CSV processado, primeiras linhas:', csvData.substring(0, 200));
        } else {
            return res.status(400).json({ error: 'Formato de arquivo não suportado. Use CSV ou Excel.' });
        }

        if (!csvData || csvData.trim().length === 0) {
            return res.status(400).json({ error: 'Arquivo vazio ou não foi possível processar o conteúdo' });
        }

        // Adicionar BOM UTF-8 para garantir codificação correta
        const utf8BOM = '\uFEFF';
        const csvWithBOM = utf8BOM + csvData;

        res.status(200).json({ 
            message: 'Arquivo processado com sucesso',
            csvData: csvWithBOM,
            filename: req.file.originalname,
            size: req.file.size
        });

    } catch (error) {
        console.error('Erro geral no processamento:', error);
        res.status(500).json({ 
            error: 'Erro interno do servidor',
            details: error.message 
        });
    }
};