const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Rota principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Rota para processar dados do Excel
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

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`Acesse: http://localhost:${PORT}`);
}); 