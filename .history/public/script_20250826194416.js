document.addEventListener('DOMContentLoaded', function() {
    // Elementos da interface
    const excelData = document.getElementById('excelData');
    const processBtn = document.getElementById('processBtn');
    const clearBtn = document.getElementById('clearBtn');
    const outputSection = document.getElementById('outputSection');
    const filtersSection = document.getElementById('filtersSection');
    const loading = document.getElementById('loading');
    const filteredContent = document.getElementById('filteredContent');
    const originalContent = document.getElementById('originalContent');
    
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
    
    // Elementos de informação
    const fileInfoDisplay = document.getElementById('fileInfoDisplay');
    const displayFileName = document.getElementById('displayFileName');
    const displaySheetName = document.getElementById('displaySheetName');
    const displayTotalRows = document.getElementById('displayTotalRows');
    const displayFilteredRows = document.getElementById('displayFilteredRows');
    
    // Elementos de exportação
    const exportCsvBtn = document.getElementById('exportCsvBtn');
    const copyToClipboardBtn = document.getElementById('copyToClipboardBtn');

    // Variáveis globais
    let currentData = null;
    let currentFile = null;
    let originalData = null;
    let filteredData = null;
    let headers = [];
    let cityColumn = null;
    let areaColumn = null;
    let rotaColumn = null;
    let selectedLeads = [];
    let leadSelectionEnabled = true;

    // Event listeners básicos
    if (processBtn) processBtn.addEventListener('click', processData);
    if (clearBtn) clearBtn.addEventListener('click', clearData);
    if (applyFiltersBtn) applyFiltersBtn.addEventListener('click', applyFilters);
    if (clearFiltersBtn) clearFiltersBtn.addEventListener('click', clearFilters);
    if (exportCsvBtn) exportCsvBtn.addEventListener('click', exportToCsv);
    if (copyToClipboardBtn) copyToClipboardBtn.addEventListener('click', copyToClipboard);

    // Adicionar efeito de onda em todos os botões
    addWaveEffectToButtons();

    // Option tabs
    optionTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const option = tab.dataset.option;
            switchOption(option);
        });
    });

    // File upload
    if (fileUploadArea && fileInput) {
        fileUploadArea.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', handleFileSelect);
    }
    if (removeFile) removeFile.addEventListener('click', removeSelectedFile);

    // Drag and drop
    if (fileUploadArea) {
        fileUploadArea.addEventListener('dragover', handleDragOver);
        fileUploadArea.addEventListener('drop', handleDrop);
    }

    // Filtros dinâmicos
    const showCityFilterBtn = document.getElementById('showCityFilterBtn');
    const showAreaFilterBtn = document.getElementById('showAreaFilterBtn');
    const clearDynamicFiltersBtn = document.getElementById('clearDynamicFiltersBtn');
    
    if (showCityFilterBtn) showCityFilterBtn.addEventListener('click', showCityFilter);
    if (showAreaFilterBtn) showAreaFilterBtn.addEventListener('click', showAreaFilter);
    if (clearDynamicFiltersBtn) clearDynamicFiltersBtn.addEventListener('click', clearDynamicFilters);

    // Tabs de saída
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabName = btn.dataset.tab;
            switchTab(tabName);
        });
    });

    function switchOption(option) {
        optionTabs.forEach(tab => tab.classList.remove('active'));
        document.querySelector(`[data-option="${option}"]`)?.classList.add('active');
        
        if (option === 'paste' && pasteArea && uploadArea) {
            pasteArea.style.display = 'block';
            uploadArea.style.display = 'none';
        } else if (uploadArea && pasteArea) {
            pasteArea.style.display = 'none';
            uploadArea.style.display = 'block';
        }
    }

    function handleFileSelect(event) {
        const file = event.target.files[0];
        if (file) {
            console.log('Arquivo selecionado:', file.name);
            processSelectedFile(file);
        }
    }

    function handleDragOver(event) {
        event.preventDefault();
        if (fileUploadArea) {
            fileUploadArea.style.borderColor = '#00afee';
            fileUploadArea.style.background = 'rgba(0, 175, 238, 0.1)';
        }
    }

    function handleDrop(event) {
        event.preventDefault();
        if (fileUploadArea) {
            fileUploadArea.style.borderColor = '#031f5f';
            fileUploadArea.style.background = 'transparent';
        }
        
        const files = event.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];
            if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
                processSelectedFile(file);
            } else {
                showNotification('Por favor, selecione apenas arquivos Excel (.xlsx, .xls)', 'error');
            }
        }
    }

    function processSelectedFile(file) {
        currentFile = file;
        
        if (fileName) fileName.textContent = file.name;
        if (fileSize) fileSize.textContent = formatFileSize(file.size);
        
        if (fileUploadArea) fileUploadArea.style.display = 'none';
        if (fileInfo) fileInfo.style.display = 'flex';
        
        showNotification(`Arquivo "${file.name}" selecionado!`, 'success');
    }

    function removeSelectedFile() {
        currentFile = null;
        if (fileInput) fileInput.value = '';
        if (fileUploadArea) fileUploadArea.style.display = 'block';
        if (fileInfo) fileInfo.style.display = 'none';
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
        const activeOption = document.querySelector('.option-tab.active');
        if (!activeOption) return;
        
        const option = activeOption.dataset.option;
        
        if (option === 'paste') {
            await processPastedData();
        } else {
            await processUploadedFile();
        }
    }

    async function processPastedData() {
        if (!excelData) return;
        
        const data = excelData.value.trim();
        if (!data) {
            showNotification('Cole os dados do Excel primeiro!', 'error');
            return;
        }

        showLoading(true);
        
        try {
            const response = await fetch('/api/format-data', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ data })
            });

            const result = await response.json();
            
            if (response.ok) {
                currentData = result;
                processDataForFiltering(result.original);
                showNotification('Dados processados com sucesso!', 'success');
            } else {
                throw new Error(result.error || 'Erro ao processar dados');
            }
        } catch (error) {
            console.error('Erro:', error);
            showNotification('Erro: ' + error.message, 'error');
        } finally {
            showLoading(false);
        }
    }

    async function processUploadedFile() {
        if (!currentFile) {
            showNotification('Selecione um arquivo Excel primeiro!', 'error');
            return;
        }

        showLoading(true);
        
        try {
            console.log('Fazendo upload:', currentFile.name);
            
            const formData = new FormData();
            formData.append('excelFile', currentFile);

            const response = await fetch('/api/upload-excel', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();
            
            if (response.ok) {
                console.log('Upload bem-sucedido:', result.rows, 'linhas');
                currentData = result;
                processDataForFiltering(result.original);
                showNotification(`Arquivo processado! ${result.rows} linhas carregadas.`, 'success');
            } else {
                throw new Error(result.error || 'Erro no upload');
            }
        } catch (error) {
            console.error('Erro no upload:', error);
            showNotification('Erro no upload: ' + error.message, 'error');
        } finally {
            showLoading(false);
        }
    }

    function processDataForFiltering(data) {
        console.log('=== PROCESSANDO DADOS PARA FILTRAGEM ===');
        
        // Parse CSV data
        const lines = data.split('\n').filter(line => line.trim());
        if (lines.length === 0) {
            showNotification('Nenhum dado válido!', 'error');
            return;
        }

        // Extract headers
        headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        console.log('Headers detectados:', headers);
        
        // Parse data rows
        originalData = lines.slice(1).map(line => {
            const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
            const row = {};
            headers.forEach((header, index) => {
                row[header] = values[index] || '';
            });
            return row;
        });

        console.log('Total de registros:', originalData.length);
        console.log('Exemplo de registro:', originalData[0]);

        // Detectar colunas automaticamente
        detectColumns();
        
        // Popular filtros
        populateFilters();
        
        // Mostrar seção de filtros
        if (filtersSection) filtersSection.style.display = 'block';
        
        // Aplicar filtros iniciais
        applyFilters();
        
        // Mostrar info do arquivo
        if (currentData.filename && fileInfoDisplay) {
            if (displayFileName) displayFileName.textContent = currentData.filename;
            if (displaySheetName) displaySheetName.textContent = currentData.sheetName || 'N/A';
            if (displayTotalRows) displayTotalRows.textContent = originalData.length;
            fileInfoDisplay.style.display = 'grid';
        }
        
        // Scroll para filtros
        if (filtersSection) {
            filtersSection.scrollIntoView({ behavior: 'smooth' });
        }
    }

    function detectColumns() {
        console.log('=== DETECTANDO COLUNAS ===');
        
        // Detectar coluna de cidade (NM_MUNICIPIO)
        cityColumn = headers.find(h => 
            h === 'NM_MUNICIPIO' || 
            h.toLowerCase().includes('municipio') ||
            h.toLowerCase().includes('cidade')
        );
        
        // Detectar coluna de bairro (BAIRRO)
        const bairroColumn = headers.find(h => 
            h === 'BAIRRO' || 
            h.toLowerCase().includes('bairro')
        );
        
        // Detectar coluna de área/região (NM_GEO)
        areaColumn = headers.find(h => 
            h === 'NM_GEO' || 
            h.toLowerCase().includes('geo') ||
            h.toLowerCase().includes('regiao') ||
            h.toLowerCase().includes('area')
        );
        
        // Detectar coluna de rota (FL_ROTA_TOP_XPRT)
        rotaColumn = headers.find(h => 
            h === 'FL_ROTA_TOP_XPRT' || 
            h.toLowerCase().includes('rota')
        );
        
        console.log('Coluna cidade detectada:', cityColumn);
        console.log('Coluna bairro detectada:', bairroColumn);
        console.log('Coluna área detectada:', areaColumn);
        console.log('Coluna rota detectada:', rotaColumn);
        
        // Verificar valores únicos
        if (cityColumn) {
            const cities = [...new Set(originalData.map(row => row[cityColumn]).filter(val => val && val.trim()))];
            console.log('Cidades encontradas:', cities);
        }
        
        if (bairroColumn) {
            const bairros = [...new Set(originalData.map(row => row[bairroColumn]).filter(val => val && val.trim()))];
            console.log('Bairros encontrados:', bairros.slice(0, 10)); // Primeiros 10
        }
        
        if (areaColumn) {
            const areas = [...new Set(originalData.map(row => row[areaColumn]).filter(val => val && val.trim()))];
            console.log('Áreas encontradas:', areas.slice(0, 10)); // Primeiras 10
        }
    }

    function populateFilters() {
        console.log('=== POPULANDO FILTROS ===');
        
        // Limpar filtros
        if (cityFilter) cityFilter.innerHTML = '<option value="">Todas as cidades</option>';
        if (areaFilter) areaFilter.innerHTML = '<option value="">Todas as áreas</option>';
        
        // Popular cidades (incluindo lógica para agrupar por região)
        if (cityColumn && cityFilter) {
            const cities = [...new Set(originalData.map(row => row[cityColumn])
                .filter(val => val && val.trim()))]
                .sort();
            
            console.log('Populando cidades:', cities);
            
            // Criar grupos de cidades por região
            const cityGroups = {
                'Mauá (Região)': cities.filter(city => 
                    city.toLowerCase().includes('maua') || 
                    city.toLowerCase().includes('mauá')
                ),
                'Santo André (Região)': cities.filter(city => 
                    city.toLowerCase().includes('santo andre') || 
                    city.toLowerCase().includes('santo andré')
                ),
                'Outras': cities.filter(city => 
                    !city.toLowerCase().includes('maua') && 
                    !city.toLowerCase().includes('mauá') &&
                    !city.toLowerCase().includes('santo andre') &&
                    !city.toLowerCase().includes('santo andré')
                )
            };
            
            // Adicionar grupos principais
            if (cityGroups['Mauá (Região)'].length > 0) {
                const option = document.createElement('option');
                option.value = 'MAUA_REGIAO';
                option.textContent = `Mauá (Região) - ${cityGroups['Mauá (Região)'].length} registros`;
                cityFilter.appendChild(option);
            }
            
            if (cityGroups['Santo André (Região)'].length > 0) {
                const option = document.createElement('option');
                option.value = 'SANTO_ANDRE_REGIAO';
                option.textContent = `Santo André (Região) - ${cityGroups['Santo André (Região)'].length} registros`;
                cityFilter.appendChild(option);
            }
            
            // Adicionar cidades individuais
            cities.forEach(city => {
                const option = document.createElement('option');
                option.value = city;
                option.textContent = city;
                cityFilter.appendChild(option);
            });
        }
        
        // Popular áreas
        if (areaColumn && areaFilter) {
            const areas = [...new Set(originalData.map(row => row[areaColumn])
                .filter(val => val && val.trim()))]
                .sort();
            
            console.log('Populando áreas:', areas.length, 'itens');
            
            areas.forEach(area => {
                const option = document.createElement('option');
                option.value = area;
                option.textContent = area;
                areaFilter.appendChild(option);
            });
        }
        
        // Event listeners para filtros
        if (cityFilter) {
            cityFilter.addEventListener('change', function() {
                console.log('Cidade selecionada:', this.value);
                updateAreaFilter(this.value);
                applyFilters();
            });
        }
        
        if (areaFilter) {
            areaFilter.addEventListener('change', function() {
                console.log('Área selecionada:', this.value);
                applyFilters();
            });
        }
        
        if (searchFilter) {
            searchFilter.addEventListener('input', function() {
                console.log('Busca:', this.value);
                applyFilters();
            });
        }
    }

    function updateAreaFilter(selectedCity) {
        if (!areaColumn || !areaFilter) return;
        
        console.log('Atualizando áreas para cidade:', selectedCity);
        
        // Filtrar dados pela cidade
        let filteredByCity = originalData;
        if (selectedCity && cityColumn) {
            filteredByCity = originalData.filter(row => row[cityColumn] === selectedCity);
        }
        
        // Pegar áreas únicas
        const areas = [...new Set(filteredByCity.map(row => row[areaColumn])
            .filter(val => val && val.trim()))]
            .sort();
        
        console.log('Áreas para', selectedCity, ':', areas.length, 'itens');
        
        // Limpar e popular novamente
        areaFilter.innerHTML = '<option value="">Todas as áreas</option>';
        areas.forEach(area => {
            const option = document.createElement('option');
            option.value = area;
            option.textContent = area;
            areaFilter.appendChild(option);
        });
    }

    function applyFilters() {
        if (!originalData) return;
        
        console.log('=== APLICANDO FILTROS ===');
        
        let filtered = [...originalData];
        
        // Filtro por cidade (incluindo lógica de região)
        const selectedCity = cityFilter ? cityFilter.value : '';
        if (selectedCity && cityColumn) {
            console.log('Filtrando por cidade:', selectedCity);
            
            if (selectedCity === 'MAUA_REGIAO') {
                // Filtrar todos os registros de Mauá
                filtered = filtered.filter(row => {
                    const cityValue = row[cityColumn] ? row[cityColumn].toLowerCase() : '';
                    return cityValue.includes('maua') || cityValue.includes('mauá');
                });
                console.log('Registros da região de Mauá:', filtered.length);
            } else if (selectedCity === 'SANTO_ANDRE_REGIAO') {
                // Filtrar todos os registros de Santo André
                filtered = filtered.filter(row => {
                    const cityValue = row[cityColumn] ? row[cityColumn].toLowerCase() : '';
                    return cityValue.includes('santo andre') || cityValue.includes('santo andré');
                });
                console.log('Registros da região de Santo André:', filtered.length);
            } else {
                // Filtro específico por cidade
                filtered = filtered.filter(row => row[cityColumn] === selectedCity);
                console.log('Registros após filtro de cidade específica:', filtered.length);
            }
        }
        
        // Filtro por área
        const selectedArea = areaFilter ? areaFilter.value : '';
        if (selectedArea && areaColumn) {
            console.log('Filtrando por área:', selectedArea);
            filtered = filtered.filter(row => row[areaColumn] === selectedArea);
            console.log('Registros após filtro de área:', filtered.length);
        }
        
        // Filtro por busca
        const searchTerm = searchFilter ? searchFilter.value.toLowerCase() : '';
        if (searchTerm) {
            console.log('Filtrando por busca:', searchTerm);
            filtered = filtered.filter(row => {
                return Object.values(row).some(value => 
                    value.toString().toLowerCase().includes(searchTerm)
                );
            });
            console.log('Registros após busca:', filtered.length);
        }
        
        filteredData = filtered;
        console.log('RESULTADO FINAL:', filtered.length, 'registros');
        
        displayResults();
        
        const totalFilters = (selectedCity ? 1 : 0) + (selectedArea ? 1 : 0) + (searchTerm ? 1 : 0);
        if (totalFilters > 0) {
            showNotification(`${totalFilters} filtro(s) aplicado(s) - ${filtered.length} registros encontrados`, 'success');
        }
    }

    function clearFilters() {
        if (cityFilter) cityFilter.value = '';
        if (areaFilter) areaFilter.value = '';
        if (searchFilter) searchFilter.value = '';
        applyFilters();
    }

    function displayResults() {
        // Só mostrar dados originais se não houver filtros ativos
        const hasActiveFilters = (cityFilter && cityFilter.value) || 
                               (areaFilter && areaFilter.value) || 
                               (searchFilter && searchFilter.value);
        
        if (originalContent) {
            if (hasActiveFilters) {
                originalContent.style.display = 'none';
            } else {
                originalContent.style.display = 'block';
                originalContent.innerHTML = createDataTable(originalData, 'Dados Originais');
            }
        }
        
        if (filteredContent) {
            if (hasActiveFilters) {
                filteredContent.style.display = 'block';
                filteredContent.innerHTML = createDataTable(filteredData, 'Dados Filtrados');
            } else {
                filteredContent.style.display = 'none';
            }
        }
        
        if (displayFilteredRows) {
            displayFilteredRows.textContent = filteredData ? filteredData.length : 0;
        }
        
        if (outputSection) {
            outputSection.style.display = 'block';
            
            // Criar ou atualizar área de leads selecionados
            updateSelectedLeadsArea();
            
            outputSection.scrollIntoView({ behavior: 'smooth' });
        }
    }

    function createDataTable(data, title) {
        if (!data || data.length === 0) {
            return `<div class="no-data">Nenhum dado encontrado.</div>`;
        }

        let tableHTML = `
            <div class="table-container">
                <div class="table-header">
                    <h3>${title} (${data.length} registros)</h3>
                    <div class="table-actions">
                        <button class="btn-mini ${leadSelectionEnabled ? 'active' : ''}" onclick="toggleLeadSelection()">
                            📝 ${leadSelectionEnabled ? 'Seleção ON' : 'Seleção OFF'}
                        </button>
                        <button class="btn-mini" onclick="clearSelectedLeads()">
                            🗑️ Limpar Selecionados (${selectedLeads.length})
                        </button>
                    </div>
                </div>
                <div class="table-wrapper">
                    <table class="data-table" id="leadsTable">
                        <thead><tr>
                            <th style="width: 40px;">#</th>
        `;

        // Headers importantes primeiro
        const priorityHeaders = [cityColumn, areaColumn, rotaColumn, 'NM_RAZAO_SOCIAL', 'NM_FANTASIA'].filter(h => h && headers.includes(h));
        const otherHeaders = headers.filter(h => !priorityHeaders.includes(h));
        const displayHeaders = [...priorityHeaders, ...otherHeaders];

        displayHeaders.forEach(header => {
            tableHTML += `<th>${header}</th>`;
        });

        tableHTML += `</tr></thead><tbody>`;

        // Limitar a 100 registros para performance
        data.slice(0, 100).forEach((row, index) => {
            const isSelected = selectedLeads.some(lead => JSON.stringify(lead) === JSON.stringify(row));
            tableHTML += `<tr class="lead-row ${isSelected ? 'selected' : ''}" data-index="${index}" onclick="selectLead(${index}, this)">`;
            tableHTML += `<td class="row-number">${index + 1}</td>`;
            displayHeaders.forEach(header => {
                const value = row[header] || '';
                tableHTML += `<td title="${value}">${value}</td>`;
            });
            tableHTML += '</tr>';
        });

        if (data.length > 100) {
            tableHTML += `<tr><td colspan="${displayHeaders.length + 1}" style="text-align: center; font-style: italic; padding: 20px;">... e mais ${data.length - 100} registros</td></tr>`;
        }

        tableHTML += `</tbody></table></div></div>`;
        return tableHTML;
    }

    // Filtros dinâmicos
    function showCityFilter() {
        const dynamicCityFilter = document.getElementById('dynamicCityFilter');
        const cityCheckboxes = document.getElementById('cityCheckboxes');
        
        if (!cityColumn || !dynamicCityFilter || !cityCheckboxes) {
            showNotification('Filtros dinâmicos não disponíveis!', 'error');
            return;
        }
        
        cityCheckboxes.innerHTML = '';
        
        const cities = [...new Set(originalData.map(row => row[cityColumn]).filter(val => val && val.trim()))].sort();
        
        cities.forEach(city => {
            const label = document.createElement('label');
            label.className = 'filter-option';
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.className = 'city-checkbox';
            checkbox.value = city;
            
            const span = document.createElement('span');
            span.textContent = city;
            
            label.appendChild(checkbox);
            label.appendChild(span);
            cityCheckboxes.appendChild(label);
        });
        
        dynamicCityFilter.style.display = 'block';
    }

    function showAreaFilter() {
        const dynamicAreaFilter = document.getElementById('dynamicAreaFilter');
        const areaCheckboxes = document.getElementById('areaCheckboxes');
        
        if (!areaColumn || !dynamicAreaFilter || !areaCheckboxes) {
            showNotification('Filtros dinâmicos não disponíveis!', 'error');
            return;
        }
        
        areaCheckboxes.innerHTML = '';
        
        const areas = [...new Set(originalData.map(row => row[areaColumn]).filter(val => val && val.trim()))].sort();
        
        areas.forEach(area => {
            const label = document.createElement('label');
            label.className = 'filter-option';
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.className = 'area-checkbox';
            checkbox.value = area;
            
            const span = document.createElement('span');
            span.textContent = area;
            
            label.appendChild(checkbox);
            label.appendChild(span);
            areaCheckboxes.appendChild(label);
        });
        
        dynamicAreaFilter.style.display = 'block';
    }

    function clearDynamicFilters() {
        const dynamicCityFilter = document.getElementById('dynamicCityFilter');
        const dynamicAreaFilter = document.getElementById('dynamicAreaFilter');
        
        if (dynamicCityFilter) dynamicCityFilter.style.display = 'none';
        if (dynamicAreaFilter) dynamicAreaFilter.style.display = 'none';
        
        clearFilters();
        showNotification('Filtros limpos!', 'info');
    }

    // Exportação
    function exportToCsv() {
        if (!filteredData || filteredData.length === 0) {
            showNotification('Nenhum dado para exportar!', 'error');
            return;
        }
        
        const csvContent = [
            headers.join(','),
            ...filteredData.map(row => headers.map(header => row[header] || '').join(','))
        ].join('\n');
        
        downloadFile(csvContent, 'dados_filtrados.csv', 'text/csv');
        showNotification('CSV exportado com sucesso!', 'success');
    }

    function copyToClipboard() {
        if (!filteredData || filteredData.length === 0) {
            showNotification('Nenhum dado para copiar!', 'error');
            return;
        }
        
        const content = [
            headers.join('\t'),
            ...filteredData.map(row => headers.map(header => row[header] || '').join('\t'))
        ].join('\n');
        
        navigator.clipboard.writeText(content).then(() => {
            showNotification('Dados copiados!', 'success');
        }).catch(() => {
            showNotification('Erro ao copiar!', 'error');
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
        if (excelData) excelData.value = '';
        if (outputSection) outputSection.style.display = 'none';
        if (filtersSection) filtersSection.style.display = 'none';
        if (fileInfoDisplay) fileInfoDisplay.style.display = 'none';
        
        currentData = null;
        originalData = null;
        filteredData = null;
        headers = [];
        cityColumn = null;
        areaColumn = null;
        rotaColumn = null;
        
        removeSelectedFile();
        showNotification('Dados limpos!', 'info');
    }

    function showLoading(show) {
        if (loading) loading.style.display = show ? 'block' : 'none';
        if (processBtn) processBtn.disabled = show;
    }

    function showNotification(message, type = 'info') {
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
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

        const colors = {
            success: '#ccff00',
            error: '#ca00ca',
            info: '#00afee',
            warning: '#c2af00'
        };
        
        notification.style.background = colors[type] || colors.info;
        notification.style.color = type === 'success' ? '#000' : '#fff';

        document.body.appendChild(notification);

        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);
    }

    // Função para adicionar efeito de onda nos botões
    function addWaveEffectToButtons() {
        const buttons = document.querySelectorAll('.btn-primary, .btn-secondary, .btn-success, .btn-mini');
        
        buttons.forEach(button => {
            let debounce = false;
            
            button.addEventListener('click', (e) => {
                if (debounce) return;
                debounce = true;
                
                // Animação do botão
                button.classList.add('clicked');
                setTimeout(() => {
                    button.classList.remove('clicked');
                    debounce = false;
                }, 700);
                
                // Criar onda
                createWave(e, button);
            });
        });
    }

    // Função para criar onda
    function createWave(event, button) {
        const rect = button.getBoundingClientRect();
        const wave = document.createElement('div');
        wave.classList.add('wave');
        
        // Posicionar onda no centro do botão
        wave.style.left = (rect.left + rect.width / 2) + 'px';
        wave.style.top = (rect.top + rect.height / 2) + 'px';
        wave.style.width = '20px';
        wave.style.height = '20px';
        
        document.body.appendChild(wave);
        
        setTimeout(() => {
            if (wave.parentNode) {
                wave.parentNode.removeChild(wave);
            }
        }, 700);
    }

    // Funções para seleção de leads
    window.selectLead = function(index, row) {
        if (!leadSelectionEnabled || !filteredData) return;
        
        const lead = filteredData[index];
        if (!lead) return;
        
        const leadExists = selectedLeads.findIndex(selected => 
            JSON.stringify(selected) === JSON.stringify(lead)
        );
        
        if (leadExists >= 0) {
            // Remover se já selecionado
            selectedLeads.splice(leadExists, 1);
            row.classList.remove('selected');
            showNotification(`Lead removido! (${selectedLeads.length} selecionados)`, 'info');
        } else {
            // Adicionar se não selecionado
            selectedLeads.push(lead);
            row.classList.add('selected');
            showNotification(`Lead selecionado! (${selectedLeads.length} selecionados)`, 'success');
        }
        
        updateSelectedLeadsArea();
        updateSelectionButtons();
    };
    
    window.toggleLeadSelection = function() {
        leadSelectionEnabled = !leadSelectionEnabled;
        showNotification(
            leadSelectionEnabled ? 'Seleção de leads ativada' : 'Seleção de leads desativada', 
            'info'
        );
        displayResults(); // Recriar tabela
    };
    
    window.clearSelectedLeads = function() {
        selectedLeads = [];
        updateSelectedLeadsArea();
        displayResults(); // Recriar tabela para remover seleções visuais
        showNotification('Leads selecionados limpos!', 'info');
    };
    
    function updateSelectionButtons() {
        const buttons = document.querySelectorAll('.btn-mini');
        buttons.forEach(btn => {
            if (btn.textContent.includes('Limpar')) {
                btn.textContent = `🗟️ Limpar Selecionados (${selectedLeads.length})`;
            }
        });
    }
    
    function updateSelectedLeadsArea() {
        let selectedArea = document.getElementById('selectedLeadsArea');
        
        if (!selectedArea) {
            // Criar área de leads selecionados
            selectedArea = document.createElement('div');
            selectedArea.id = 'selectedLeadsArea';
            selectedArea.className = 'selected-leads-section';
            
            if (outputSection) {
                outputSection.appendChild(selectedArea);
            }
        }
        
        if (selectedLeads.length === 0) {
            selectedArea.innerHTML = `
                <div class="selected-leads-header">
                    <h3>📋 Leads Selecionados (0)</h3>
                    <p>Clique nos leads da tabela acima para selecioná-los</p>
                </div>
            `;
            return;
        }
        
        selectedArea.innerHTML = `
            <div class="selected-leads-header">
                <h3>📋 Leads Selecionados (${selectedLeads.length})</h3>
                <div class="selected-actions">
                    <button class="btn-mini btn-export" onclick="exportSelectedLeads()">
                        📄 Exportar Selecionados
                    </button>
                    <button class="btn-mini btn-copy" onclick="copySelectedLeads()">
                        📋 Copiar Selecionados
                    </button>
                    <button class="btn-mini btn-clear" onclick="clearSelectedLeads()">
                        🗟️ Limpar Todos
                    </button>
                </div>
            </div>
            <div class="selected-leads-content">
                ${createSelectedLeadsTable()}
            </div>
        `;
    }
    
    function createSelectedLeadsTable() {
        if (selectedLeads.length === 0) return '';
        
        const priorityHeaders = [cityColumn, areaColumn, rotaColumn, 'NM_RAZAO_SOCIAL', 'NM_FANTASIA'].filter(h => h && headers.includes(h));
        const otherHeaders = headers.filter(h => !priorityHeaders.includes(h));
        const displayHeaders = [...priorityHeaders, ...otherHeaders];
        
        let tableHTML = `
            <div class="selected-table-wrapper">
                <table class="selected-table">
                    <thead><tr>
                        <th style="width: 40px;">#</th>
                        <th style="width: 40px;">❌</th>
        `;
        
        displayHeaders.slice(0, 8).forEach(header => { // Mostrar apenas primeiros 8 campos
            tableHTML += `<th>${header}</th>`;
        });
        
        tableHTML += `</tr></thead><tbody>`;
        
        selectedLeads.forEach((lead, index) => {
            tableHTML += `<tr class="selected-row">`;
            tableHTML += `<td class="row-number">${index + 1}</td>`;
            tableHTML += `<td><button class="btn-remove" onclick="removeSelectedLead(${index})">❌</button></td>`;
            
            displayHeaders.slice(0, 8).forEach(header => {
                const value = lead[header] || '';
                tableHTML += `<td title="${value}">${value.length > 30 ? value.substring(0, 30) + '...' : value}</td>`;
            });
            
            tableHTML += '</tr>';
        });
        
        tableHTML += `</tbody></table></div>`;
        return tableHTML;
    }
    
    window.removeSelectedLead = function(index) {
        selectedLeads.splice(index, 1);
        updateSelectedLeadsArea();
        displayResults(); // Recriar tabela principal
        showNotification(`Lead removido! (${selectedLeads.length} selecionados)`, 'info');
    };
    
    window.exportSelectedLeads = function() {
        if (selectedLeads.length === 0) {
            showNotification('Nenhum lead selecionado!', 'error');
            return;
        }
        
        const csvContent = [
            headers.join(','),
            ...selectedLeads.map(lead => headers.map(header => lead[header] || '').join(','))
        ].join('\n');
        
        downloadFile(csvContent, `leads_selecionados_${selectedLeads.length}.csv`, 'text/csv');
        showNotification(`${selectedLeads.length} leads exportados!`, 'success');
    };
    
    window.copySelectedLeads = function() {
        if (selectedLeads.length === 0) {
            showNotification('Nenhum lead selecionado!', 'error');
            return;
        }
        
        const content = [
            headers.join('\t'),
            ...selectedLeads.map(lead => headers.map(header => lead[header] || '').join('\t'))
        ].join('\n');
        
        navigator.clipboard.writeText(content).then(() => {
            showNotification(`${selectedLeads.length} leads copiados!`, 'success');
        }).catch(() => {
            showNotification('Erro ao copiar!', 'error');
        });
    };
    
    // Animações CSS
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
    if (excelData) {
        excelData.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = Math.min(this.scrollHeight, 400) + 'px';
        });
    }

    // Notificação de boas-vindas
    setTimeout(() => {
        showNotification('Sistema refeito para seus dados! Teste o filtro de Mauá.', 'info');
    }, 1000);
});

// Controle da Animação de Fundo
let backgroundAnimationEnabled = true;

function toggleBackgroundAnimation() {
    const btn = document.getElementById('tetrisToggle');
    
    if (backgroundAnimationEnabled) {
        // Desligar animação
        if (window.stopCieloBackground) {
            window.stopCieloBackground();
        }
        backgroundAnimationEnabled = false;
        btn.textContent = '✨ Animação OFF';
        btn.classList.add('off');
        showNotification('Animação de fundo desativada! ✨', 'info');
    } else {
        // Ligar animação
        if (window.startCieloBackground) {
            window.startCieloBackground();
        }
        backgroundAnimationEnabled = true;
        btn.textContent = '✨ Animação ON';
        btn.classList.remove('off');
        showNotification('Animação de fundo ativada! ✨', 'success');
    }
}

// Controle do Banner Interativo
let bannerAnimationEnabled = false;

function toggleBannerAnimation() {
    const banner = document.getElementById('marketBanner');
    const btn = event.target;
    
    if (bannerAnimationEnabled) {
        banner.classList.remove('active');
        bannerAnimationEnabled = false;
        btn.textContent = '🎭 Animar';
        showNotification('Banner estático ativado! 📌', 'info');
    } else {
        banner.classList.add('active');
        bannerAnimationEnabled = true;
        btn.textContent = '📌 Fixar';
        showNotification('Banner animado ativado! 🎭', 'success');
    }
}

function showMarketInfo() {
    const marketData = [
        '💳 Cartões de crédito e débito',
        '⚡ PIX instantâneo',
        '💻 Maquininhas de cartão',
        '🏢 Soluções empresariais',
        '💰 Gestão financeira',
        '🔒 Segurança avançada',
        '📈 Relatórios e analytics',
        '🌐 Integração com sistemas'
    ];
    
    const infoText = marketData.join('\n');
    
    // Criar modal de informações
    const modal = document.createElement('div');
    modal.className = 'market-info-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>📊 Informações do Mercado</h3>
                <button class="modal-close" onclick="this.parentElement.parentElement.parentElement.remove()">×</button>
            </div>
            <div class="modal-body">
                <div class="market-list">
                    ${marketData.map(item => `<div class="market-item">${item}</div>`).join('')}
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Auto-remover após 8 segundos
    setTimeout(() => {
        if (modal.parentElement) {
            modal.remove();
        }
    }, 8000);
}

// Auto-ativar banner após carregamento
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        const banner = document.getElementById('marketBanner');
        if (banner) {
            banner.classList.add('active');
            bannerAnimationEnabled = true;
        }
    }, 2000);
});

// Função para alternar entre tabs de saída
function switchTab(tabName) {
    // Atualizar botões ativos
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`)?.classList.add('active');
    
    // Atualizar conteúdo ativo
    document.querySelectorAll('.tab-pane').forEach(pane => {
        pane.classList.remove('active');
    });
    document.getElementById(`${tabName}Content`)?.classList.add('active');
}