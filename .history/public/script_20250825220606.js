document.addEventListener('DOMContentLoaded', function() {
    const excelData = document.getElementById('excelData');
    const formatBtn = document.getElementById('formatBtn');
    const clearBtn = document.getElementById('clearBtn');
    const outputSection = document.getElementById('outputSection');
    const loading = document.getElementById('loading');
    const formattedContent = document.getElementById('formattedContent');
    const originalContent = document.getElementById('originalContent');
    const downloadBtn = document.getElementById('downloadBtn');
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');
    
    // Elementos de upload
    const optionTabs = document.querySelectorAll('.option-tab');
    const pasteArea = document.getElementById('pasteArea');
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const fileUploadArea = document.getElementById('fileUploadArea');
    const fileInfo = document.getElementById('fileInfo');
    const fileName = document.getElementById('fileName');
    const fileSize = document.getElementById('fileSize');
    const removeFile = document.getElementById('removeFile');
    
    // Elementos de informação do arquivo
    const fileInfoDisplay = document.getElementById('fileInfoDisplay');
    const displayFileName = document.getElementById('displayFileName');
    const displaySheetName = document.getElementById('displaySheetName');
    const displayRows = document.getElementById('displayRows');

    let currentData = null;
    let currentFile = null;

    // Event listeners
    formatBtn.addEventListener('click', formatData);
    clearBtn.addEventListener('click', clearData);
    downloadBtn.addEventListener('click', downloadData);

    // Tab switching
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;
            switchTab(tab);
        });
    });

    // Option tabs switching
    optionTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const option = tab.dataset.option;
            switchOption(option);
        });
    });

    // File upload events
    fileUploadArea.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', handleFileSelect);
    removeFile.addEventListener('click', removeSelectedFile);
    
    // Drag and drop
    fileUploadArea.addEventListener('dragover', handleDragOver);
    fileUploadArea.addEventListener('drop', handleDrop);

    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.key === 'Enter') {
            formatData();
        }
        if (e.ctrlKey && e.key === 'l') {
            clearData();
        }
    });

    function switchOption(option) {
        // Remover classe active de todas as abas
        optionTabs.forEach(tab => tab.classList.remove('active'));
        
        // Adicionar classe active à aba selecionada
        document.querySelector(`[data-option="${option}"]`).classList.add('active');
        
        // Mostrar área correspondente
        if (option === 'paste') {
            pasteArea.style.display = 'block';
            uploadArea.style.display = 'none';
        } else {
            pasteArea.style.display = 'none';
            uploadArea.style.display = 'block';
        }
    }

    function handleFileSelect(event) {
        const file = event.target.files[0];
        if (file) {
            processSelectedFile(file);
        }
    }

    function handleDragOver(event) {
        event.preventDefault();
        fileUploadArea.style.borderColor = 'var(--rosa-neon)';
        fileUploadArea.style.background = 'rgba(202, 0, 202, 0.1)';
    }

    function handleDrop(event) {
        event.preventDefault();
        fileUploadArea.style.borderColor = 'var(--azure-vivido)';
        fileUploadArea.style.background = 'rgba(0, 0, 0, 0.3)';
        
        const files = event.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];
            if (file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
                file.type === 'application/vnd.ms-excel' ||
                file.name.endsWith('.xlsx') ||
                file.name.endsWith('.xls')) {
                processSelectedFile(file);
            } else {
                showNotification('Por favor, selecione apenas arquivos Excel (.xlsx, .xls)', 'error');
            }
        }
    }

    function processSelectedFile(file) {
        currentFile = file;
        
        // Mostrar informações do arquivo
        fileName.textContent = file.name;
        fileSize.textContent = formatFileSize(file.size);
        
        fileUploadArea.style.display = 'none';
        fileInfo.style.display = 'flex';
        
        showNotification(`Arquivo "${file.name}" selecionado com sucesso!`, 'success');
    }

    function removeSelectedFile() {
        currentFile = null;
        fileInput.value = '';
        
        fileUploadArea.style.display = 'block';
        fileInfo.style.display = 'none';
        
        showNotification('Arquivo removido!', 'info');
    }

    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    async function formatData() {
        const activeOption = document.querySelector('.option-tab.active').dataset.option;
        
        if (activeOption === 'paste') {
            await formatPastedData();
        } else {
            await formatUploadedFile();
        }
    }

    async function formatPastedData() {
        const data = excelData.value.trim();
        
        if (!data) {
            showNotification('Por favor, cole alguns dados do Excel primeiro!', 'error');
            return;
        }

        showLoading(true);
        
        try {
            const response = await fetch('/api/format-data', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ data })
            });

            const result = await response.json();
            
            if (response.ok) {
                currentData = result;
                displayResults(result);
                showNotification('Dados formatados com sucesso!', 'success');
            } else {
                throw new Error(result.error || 'Erro ao formatar dados');
            }
        } catch (error) {
            console.error('Erro:', error);
            showNotification('Erro ao processar dados: ' + error.message, 'error');
        } finally {
            showLoading(false);
        }
    }

    async function formatUploadedFile() {
        if (!currentFile) {
            showNotification('Por favor, selecione um arquivo Excel primeiro!', 'error');
            return;
        }

        showLoading(true);
        
        try {
            const formData = new FormData();
            formData.append('excelFile', currentFile);

            const response = await fetch('/api/upload-excel', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();
            
            if (response.ok) {
                currentData = result;
                displayResults(result);
                showNotification('Arquivo processado com sucesso!', 'success');
            } else {
                throw new Error(result.error || 'Erro ao processar arquivo');
            }
        } catch (error) {
            console.error('Erro:', error);
            showNotification('Erro ao processar arquivo: ' + error.message, 'error');
        } finally {
            showLoading(false);
        }
    }

    function displayResults(result) {
        // Exibir dados originais
        originalContent.textContent = result.original;
        
        // Exibir dados formatados (aqui você pode adicionar lógica específica)
        formattedContent.textContent = result.formatted;
        
        // Mostrar informações do arquivo se disponível
        if (result.filename) {
            displayFileName.textContent = result.filename;
            displaySheetName.textContent = result.sheetName || 'N/A';
            displayRows.textContent = result.rows || 'N/A';
            fileInfoDisplay.style.display = 'grid';
        } else {
            fileInfoDisplay.style.display = 'none';
        }
        
        // Mostrar seção de resultados
        outputSection.style.display = 'block';
        
        // Scroll para os resultados
        outputSection.scrollIntoView({ behavior: 'smooth' });
    }

    function clearData() {
        excelData.value = '';
        outputSection.style.display = 'none';
        fileInfoDisplay.style.display = 'none';
        currentData = null;
        removeSelectedFile();
        showNotification('Dados limpos!', 'info');
    }

    function downloadData() {
        if (!currentData) {
            showNotification('Nenhum dado para baixar!', 'error');
            return;
        }

        const activeTab = document.querySelector('.tab-btn.active').dataset.tab;
        const content = activeTab === 'formatted' ? currentData.formatted : currentData.original;
        
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        
        // Nome do arquivo baseado no tipo de entrada
        let filename = `dados_${activeTab}_${new Date().toISOString().slice(0, 10)}.txt`;
        if (currentData.filename) {
            const baseName = currentData.filename.replace(/\.[^/.]+$/, '');
            filename = `${baseName}_${activeTab}_${new Date().toISOString().slice(0, 10)}.txt`;
        }
        
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showNotification('Arquivo baixado com sucesso!', 'success');
    }

    function switchTab(tabName) {
        // Remover classe active de todos os botões e painéis
        tabBtns.forEach(btn => btn.classList.remove('active'));
        tabPanes.forEach(pane => pane.classList.remove('active'));
        
        // Adicionar classe active ao botão e painel selecionado
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        document.getElementById(`${tabName}Content`).classList.add('active');
    }

    function showLoading(show) {
        loading.style.display = show ? 'block' : 'none';
        formatBtn.disabled = show;
    }

    function showNotification(message, type = 'info') {
        // Remover notificação existente
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        // Criar nova notificação
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Estilos da notificação
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 600;
            z-index: 1000;
            animation: slideIn 0.3s ease;
            max-width: 300px;
        `;

        // Cores baseadas no tipo
        const colors = {
            success: '#ccff00',
            error: '#ca00ca',
            info: '#00afee',
            warning: '#c2af00'
        };
        
        notification.style.background = colors[type] || colors.info;
        notification.style.color = type === 'success' ? '#000000' : '#ffffff';

        document.body.appendChild(notification);

        // Remover após 5 segundos
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);
    }

    // Animações CSS para notificações
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);

    // Auto-resize do textarea
    excelData.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = Math.min(this.scrollHeight, 400) + 'px';
    });

    // Mostrar notificação de boas-vindas
    setTimeout(() => {
        showNotification('Bem-vindo! Cole seus dados ou importe um arquivo Excel', 'info');
    }, 1000);
}); 