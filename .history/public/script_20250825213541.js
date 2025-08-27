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

    let currentData = null;

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

    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.key === 'Enter') {
            formatData();
        }
        if (e.ctrlKey && e.key === 'l') {
            clearData();
        }
    });

    async function formatData() {
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

    function displayResults(result) {
        // Exibir dados originais
        originalContent.textContent = result.original;
        
        // Exibir dados formatados (aqui você pode adicionar lógica específica)
        formattedContent.textContent = result.formatted;
        
        // Mostrar seção de resultados
        outputSection.style.display = 'block';
        
        // Scroll para os resultados
        outputSection.scrollIntoView({ behavior: 'smooth' });
    }

    function clearData() {
        excelData.value = '';
        outputSection.style.display = 'none';
        currentData = null;
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
        a.download = `dados_${activeTab}_${new Date().toISOString().slice(0, 10)}.txt`;
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
        showNotification('Bem-vindo! Cole seus dados do Excel e clique em "Formatar Dados"', 'info');
    }, 1000);
}); 