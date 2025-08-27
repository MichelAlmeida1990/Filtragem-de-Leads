document.addEventListener('DOMContentLoaded', function() {
    const excelData = document.getElementById('excelData');
    const processBtn = document.getElementById('processBtn');
    const clearBtn = document.getElementById('clearBtn');
    const outputSection = document.getElementById('outputSection');
    const filtersSection = document.getElementById('filtersSection');
    const loading = document.getElementById('loading');
    const filteredContent = document.getElementById('filteredContent');
    const originalContent = document.getElementById('originalContent');
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
    
    // Elementos de filtro
    const cityFilter = document.getElementById('cityFilter');
    const areaFilter = document.getElementById('areaFilter');
    const searchFilter = document.getElementById('searchFilter');
    const applyFiltersBtn = document.getElementById('applyFiltersBtn');
    const clearFiltersBtn = document.getElementById('clearFiltersBtn');
    
    // Elementos de informação do arquivo
    const fileInfoDisplay = document.getElementById('fileInfoDisplay');
    const displayFileName = document.getElementById('displayFileName');
    const displaySheetName = document.getElementById('displaySheetName');
    const displayTotalRows = document.getElementById('displayTotalRows');
    const displayFilteredRows = document.getElementById('displayFilteredRows');
    
    // Elementos de exportação
    const exportCsvBtn = document.getElementById('exportCsvBtn');
    const exportExcelBtn = document.getElementById('exportExcelBtn');
    const copyToClipboardBtn = document.getElementById('copyToClipboardBtn');

    let currentData = null;
    let currentFile = null;
    let originalData = null;
    let filteredData = null;
    let headers = [];
    let isExcelFile = false;

    // Event listeners
    processBtn.addEventListener('click', processData);
    clearBtn.addEventListener('click', clearData);
    applyFiltersBtn.addEventListener('click', applyFilters);
    clearFiltersBtn.addEventListener('click', clearFilters);
    exportCsvBtn.addEventListener('click', exportToCsv);
    exportExcelBtn.addEventListener('click', exportToExcel);
    copyToClipboardBtn.addEventListener('click', copyToClipboard);

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
            processData();
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
        fileUploadArea.style.borderColor = 'var(--cielo-laranja)';
        fileUploadArea.style.background = 'var(--cielo-bg-hover)';
    }

    function handleDrop(event) {
        event.preventDefault();
        fileUploadArea.style.borderColor = 'var(--cielo-azul-principal)';
        fileUploadArea.style.background = 'var(--cielo-bg-escuro)';
        
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

    async function processData() {
        const activeOption = document.querySelector('.option-tab.active').dataset.option;
        
        if (activeOption === 'paste') {
            await processPastedData();
        } else {
            await processUploadedFile();
        }
    }

    async function processPastedData() {
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
                isExcelFile = false;
                processDataForFiltering(result.original);
                showNotification('Dados processados com sucesso!', 'success');
            } else {
                throw new Error(result.error || 'Erro ao processar dados');
            }
        } catch (error) {
            console.error('Erro:', error);
            showNotification('Erro ao processar dados: ' + error.message, 'error');
        } finally {
            showLoading(false);
        }
    }

    async function processUploadedFile() {
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
                isExcelFile = true;
                processDataForFiltering(result.original);
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

    function processDataForFiltering(data) {
        // Parse CSV data
        const lines = data.split('\n').filter(line => line.trim());
        if (lines.length === 0) {
            showNotification('Nenhum dado válido encontrado!', 'error');
            return;
        }

        // Extract headers
        headers = lines[0].split(',').map(h => h.trim());
        
        // Parse data rows
        originalData = lines.slice(1).map(line => {
            const values = line.split(',').map(v => v.trim());
            const row = {};
            headers.forEach((header, index) => {
                row[header] = values[index] || '';
            });
            return row;
        });

        // Populate filter options
        populateFilters();
        
        // Show filters section
        filtersSection.style.display = 'block';
        
        // Apply initial filters (show all data)
        applyFilters();
        
        // Show file info if available
        if (currentData.filename) {
            displayFileName.textContent = currentData.filename;
            displaySheetName.textContent = currentData.sheetName || 'N/A';
            displayTotalRows.textContent = originalData.length;
            fileInfoDisplay.style.display = 'grid';
        } else {
            displayTotalRows.textContent = originalData.length;
            fileInfoDisplay.style.display = 'grid';
        }
        
        // Scroll to filters
        filtersSection.scrollIntoView({ behavior: 'smooth' });
    }

    function populateFilters() {
        // Clear existing options
        cityFilter.innerHTML = '<option value="">Todas as cidades</option>';
        areaFilter.innerHTML = '<option value="">Todas as áreas</option>';
        
        // Find city and area columns
        const cityColumn = headers.find(h => 
            h.toLowerCase().includes('cidade') || 
            h.toLowerCase().includes('city') ||
            h.toLowerCase().includes('municipio') ||
            h.toLowerCase().includes('local') ||
            h.toLowerCase().includes('nm_municipio')
        );
        
        const areaColumn = headers.find(h => 
            h.toLowerCase().includes('area') || 
            h.toLowerCase().includes('bairro') ||
            h.toLowerCase().includes('zona') ||
            h.toLowerCase().includes('regiao') ||
            h.toLowerCase().includes('nm_geo') ||
            h.toLowerCase().includes('rota')
        );
        
        if (cityColumn) {
            // Apenas MAUA e SANTO ANDRE como cidades válidas
            const validCities = ['MAUA', 'SANTO ANDRE'];
            
            validCities.forEach(city => {
                const option = document.createElement('option');
                option.value = city;
                option.textContent = city;
                cityFilter.appendChild(option);
            });
        }
        
        if (areaColumn) {
            // Pegar todos os valores únicos da coluna de área, exceto as cidades válidas
            const allAreas = [...new Set(originalData.map(row => row[areaColumn]).filter(area => {
                if (!area || area.trim() === '') return false;
                
                const areaValue = area.toString().trim();
                
                // Excluir valores que são números ou códigos
                if (/^\d+$/.test(areaValue)) return false; // Apenas números
                if (/^\d{2}$/.test(areaValue)) return false; // Códigos de 2 dígitos
                if (/^\d{3}$/.test(areaValue)) return false; // Códigos de 3 dígitos
                if (/^\d{4}$/.test(areaValue)) return false; // Códigos de 4 dígitos
                if (/^\d{5}$/.test(areaValue)) return false; // Códigos de 5 dígitos
                if (/^\d{6}$/.test(areaValue)) return false; // Códigos de 6 dígitos
                if (/^\d{7}$/.test(areaValue)) return false; // Códigos de 7 dígitos
                if (/^\d{8}$/.test(areaValue)) return false; // Códigos de 8 dígitos
                if (/^\d{9}$/.test(areaValue)) return false; // Códigos de 9 dígitos
                if (/^\d{10}$/.test(areaValue)) return false; // Códigos de 10 dígitos
                if (/^\d{11}$/.test(areaValue)) return false; // Códigos de 11 dígitos
                if (/^\d{12}$/.test(areaValue)) return false; // Códigos de 12 dígitos
                if (/^\d{13}$/.test(areaValue)) return false; // Códigos de 13 dígitos
                if (/^\d{14}$/.test(areaValue)) return false; // Códigos de 14 dígitos
                
                // Excluir valores que são códigos com letras e números
                if (/^[A-Z]{2}\s*-\s*[A-Z]+/.test(areaValue)) return false; // Padrão "XX - NOME"
                if (/^CN\s*-\s*[A-Z]+/.test(areaValue)) return false; // Padrão "CN - NOME"
                if (/^SEMANA/.test(areaValue)) return false; // Valores que começam com "SEMANA"
                if (/^INATIVO/.test(areaValue)) return false; // Valores que começam com "INATIVO"
                if (/^FRANQUIAS/.test(areaValue)) return false; // Valores que começam com "FRANQUIAS"
                
                // Excluir valores muito curtos (provavelmente códigos)
                if (areaValue.length <= 2) return false;
                
                // Excluir valores que são apenas números e letras misturados sem espaços
                if (/^[A-Z0-9]+$/.test(areaValue) && areaValue.length <= 10) return false;
                
                // Incluir apenas valores que parecem nomes de áreas
                // Deve ter pelo menos 3 caracteres e conter letras
                return areaValue.length >= 3 && /[A-Za-z]/.test(areaValue);
            }))];
            
            allAreas.sort().forEach(area => {
                const option = document.createElement('option');
                option.value = area;
                option.textContent = area;
                areaFilter.appendChild(option);
            });
        }
    }

    function applyFilters() {
        if (!originalData) return;
        
        let filtered = [...originalData];
        
        // Filter by city
        const selectedCity = cityFilter.value;
        if (selectedCity) {
            const cityColumn = headers.find(h => 
                h.toLowerCase().includes('cidade') || 
                h.toLowerCase().includes('city') ||
                h.toLowerCase().includes('municipio') ||
                h.toLowerCase().includes('local') ||
                h.toLowerCase().includes('nm_municipio')
            );
            if (cityColumn) {
                filtered = filtered.filter(row => row[cityColumn] === selectedCity);
            }
        }
        
        // Filter by area
        const selectedArea = areaFilter.value;
        if (selectedArea) {
            const areaColumn = headers.find(h => 
                h.toLowerCase().includes('area') || 
                h.toLowerCase().includes('bairro') ||
                h.toLowerCase().includes('zona') ||
                h.toLowerCase().includes('regiao') ||
                h.toLowerCase().includes('nm_geo') ||
                h.toLowerCase().includes('rota')
            );
            if (areaColumn) {
                filtered = filtered.filter(row => row[areaColumn] === selectedArea);
            }
        }
        
        // Filter by search term (busca em todos os campos)
        const searchTerm = searchFilter.value.toLowerCase();
        if (searchTerm) {
            filtered = filtered.filter(row => {
                return Object.values(row).some(value => 
                    value.toString().toLowerCase().includes(searchTerm)
                );
            });
        }
        
        filteredData = filtered;
        displayResults();
    }

    function clearFilters() {
        cityFilter.value = '';
        areaFilter.value = '';
        searchFilter.value = '';
        applyFilters();
    }

    function displayResults() {
        // Display original data
        originalContent.innerHTML = createDataTable(originalData, 'Dados Originais');
        
        // Display filtered data
        filteredContent.innerHTML = createDataTable(filteredData, 'Dados Filtrados');
        
        // Update filtered rows count
        displayFilteredRows.textContent = filteredData.length;
        
        // Show output section
        outputSection.style.display = 'block';
        
        // Scroll to results
        outputSection.scrollIntoView({ behavior: 'smooth' });
    }

    function createDataTable(data, title) {
        if (!data || data.length === 0) {
            return `<div class="no-data">Nenhum dado encontrado.</div>`;
        }

        let tableHTML = `
            <div class="table-container">
                <h3>${title} (${data.length} registros)</h3>
                <div class="table-wrapper">
                    <table class="data-table">
                        <thead>
                            <tr>
        `;

        // Headers
        headers.forEach(header => {
            tableHTML += `<th>${header}</th>`;
        });

        tableHTML += `
                            </tr>
                        </thead>
                        <tbody>
        `;

        // Data rows
        data.forEach(row => {
            tableHTML += '<tr>';
            headers.forEach(header => {
                const value = row[header] || '';
                tableHTML += `<td>${value}</td>`;
            });
            tableHTML += '</tr>';
        });

        tableHTML += `
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        return tableHTML;
    }

    function formatDataForDisplay(data) {
        if (!data || data.length === 0) return 'Nenhum dado encontrado.';
        
        const headerRow = headers.join(', ');
        const dataRows = data.map(row => 
            headers.map(header => row[header] || '').join(', ')
        );
        
        return [headerRow, ...dataRows].join('\n');
    }

    function exportToCsv() {
        if (!filteredData || filteredData.length === 0) {
            showNotification('Nenhum dado para exportar!', 'error');
            return;
        }
        
        const csvContent = formatDataForDisplay(filteredData);
        downloadFile(csvContent, 'dados_filtrados.csv', 'text/csv');
        showNotification('Arquivo CSV exportado com sucesso!', 'success');
    }

    function exportToExcel() {
        if (!filteredData || filteredData.length === 0) {
            showNotification('Nenhum dado para exportar!', 'error');
            return;
        }
        
        // For now, export as CSV with .xlsx extension
        // In a real implementation, you'd use a library like SheetJS
        const csvContent = formatDataForDisplay(filteredData);
        downloadFile(csvContent, 'dados_filtrados.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        showNotification('Arquivo Excel exportado com sucesso!', 'success');
    }

    function copyToClipboard() {
        if (!filteredData || filteredData.length === 0) {
            showNotification('Nenhum dado para copiar!', 'error');
            return;
        }
        
        const content = formatDataForDisplay(filteredData);
        navigator.clipboard.writeText(content).then(() => {
            showNotification('Dados copiados para a área de transferência!', 'success');
        }).catch(() => {
            showNotification('Erro ao copiar dados!', 'error');
        });
    }

    function downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    function clearData() {
        excelData.value = '';
        outputSection.style.display = 'none';
        filtersSection.style.display = 'none';
        fileInfoDisplay.style.display = 'none';
        currentData = null;
        originalData = null;
        filteredData = null;
        headers = [];
        isExcelFile = false;
        removeSelectedFile();
        showNotification('Dados limpos!', 'info');
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
        processBtn.disabled = show;
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

        // Cores baseadas no tipo (Cielo)
        const colors = {
            success: '#00cc66',
            error: '#ff6600',
            info: '#0066cc',
            warning: '#ff6600'
        };
        
        notification.style.background = colors[type] || colors.info;
        notification.style.color = '#ffffff';

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
        showNotification('Bem-vindo! Cole seus dados ou importe um arquivo Excel para filtrar', 'info');
    }, 1000);
}); 