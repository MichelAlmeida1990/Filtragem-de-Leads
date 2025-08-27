// Inicializar variáveis globais
window.originalData = [];
window.filteredData = [];
window.headers = [];

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

    // Adicionar efeito neumórfico em todos os botões
    addNeuWaveEffectToButtons();

    // Inicializar menu de navegação
    initializeNavigation();

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
        
        // Navegar automaticamente para a seção de filtros quando o usuário quer trabalhar com dados
        if (!document.getElementById('filters-section').classList.contains('active')) {
            if (window.activateIcon2) {
                window.activateIcon2(); // Ativar seção de filtros
            }
        }
        
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
        
        // Atualizar variáveis globais
        window.originalData = originalData;
        window.headers = headers;
        
        // Atualizar dashboard com novos dados
        if (typeof updateDashboardStats === 'function') {
            updateDashboardStats();
        }

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
            return `<div class="no-data">📋 Nenhum dado encontrado.</div>`;
        }

        let tableHTML = `
            <div class="enhanced-table-container">
                <div class="table-header">
                    <div class="table-info">
                        <h3>${title}</h3>
                        <span class="record-count">${data.length} registros</span>
                    </div>
                    <div class="table-actions">
                        <button class="btn-mini selection-toggle ${leadSelectionEnabled ? 'active' : ''}" onclick="toggleLeadSelection()">
                            <span class="btn-icon">${leadSelectionEnabled ? '✅' : '📝'}</span>
                            <span class="btn-text">${leadSelectionEnabled ? 'Seleção ON' : 'Ativar Seleção'}</span>
                        </button>
                        <button class="btn-mini clear-selection" onclick="clearSelectedLeads()" ${selectedLeads.length === 0 ? 'disabled' : ''}>
                            <span class="btn-icon">🗑️</span>
                            <span class="btn-text">Limpar (${selectedLeads.length})</span>
                        </button>
                    </div>
                </div>
                <div class="table-wrapper">
                    <table class="enhanced-data-table" id="leadsTable">
                        <thead>
                            <tr class="table-header-row">
                                <th class="row-selector">#</th>
        `;

        // Headers importantes primeiro com melhor apresentação
        const priorityHeaders = [cityColumn, areaColumn, rotaColumn, 'NM_RAZAO_SOCIAL', 'NM_FANTASIA'].filter(h => h && headers.includes(h));
        const otherHeaders = headers.filter(h => !priorityHeaders.includes(h));
        const displayHeaders = [...priorityHeaders, ...otherHeaders];

        displayHeaders.forEach((header, index) => {
            const isImportant = priorityHeaders.includes(header);
            const displayName = getHeaderDisplayName(header);
            tableHTML += `<th class="column-header ${isImportant ? 'important' : ''}" data-column="${header}">
                            <span class="header-text">${displayName}</span>
                            <span class="sort-indicator">↕️</span>
                          </th>`;
        });

        tableHTML += `</tr></thead><tbody class="table-body">`;

        // Limitar a 100 registros para performance
        data.slice(0, 100).forEach((row, index) => {
            const isSelected = selectedLeads.some(lead => JSON.stringify(lead) === JSON.stringify(row));
            tableHTML += `<tr class="enhanced-lead-row ${isSelected ? 'selected' : ''}" 
                            data-index="${index}" 
                            onclick="selectLeadWithEffect(${index}, this, event)"
                            onmouseenter="highlightRow(this)"
                            onmouseleave="unhighlightRow(this)">`;
            
            // Número da linha com indicador visual
            tableHTML += `<td class="row-number">
                            <span class="row-indicator">${index + 1}</span>
                            ${isSelected ? '<span class="selected-indicator">✓</span>' : ''}
                          </td>`;
            
            displayHeaders.forEach(header => {
                const value = row[header] || '';
                const isImportant = priorityHeaders.includes(header);
                const truncatedValue = truncateText(value, isImportant ? 25 : 15);
                tableHTML += `<td class="data-cell ${isImportant ? 'important' : ''}" title="${value}">
                                <span class="cell-content">${truncatedValue}</span>
                              </td>`;
            });
            tableHTML += '</tr>';
        });

        if (data.length > 100) {
            tableHTML += `<tr class="more-records-row">
                            <td colspan="${displayHeaders.length + 1}" class="more-records-cell">
                                <span class="more-indicator">📋</span>
                                <span class="more-text">... e mais ${data.length - 100} registros</span>
                                <span class="load-more-hint">Refine seus filtros para ver mais</span>
                            </td>
                          </tr>`;
        }

        tableHTML += `</tbody></table></div></div>`;
        return tableHTML;
    }

    // Função auxiliar para nomes mais amigáveis dos headers
    function getHeaderDisplayName(header) {
        const headerMap = {
            'NM_MUNICIPIO': '🏙️ Cidade',
            'NM_GEO': '📍 Área',
            'FL_ROTA_TOP_XPRT': '🛣️ Rota',
            'NM_RAZAO_SOCIAL': '🏢 Razão Social',
            'NM_FANTASIA': '🏪 Nome Fantasia',
            'BAIRRO': '🗺️ Bairro',
            'FLG_SMNA': '📅 Semana',
            'NR_CNPJ_CPF': '📋 CNPJ/CPF',
            'FX_PORTE_CNPJ': '📊 Porte',
            'FL_PUBLICO': '👥 Público',
            'NM_RAMO_ATIVIDADE': '🏭 Ramo',
            'SETOR': '🎯 Setor'
        };
        return headerMap[header] || header;
    }

    // Função auxiliar para truncar texto
    function truncateText(text, maxLength) {
        if (!text) return '';
        const str = String(text);
        return str.length > maxLength ? str.substring(0, maxLength) + '...' : str;
    }

    // Função melhorada para seleção de lead com efeitos
    function selectLeadWithEffect(index, rowElement, event) {
        event.preventDefault();
        
        // Adicionar efeito de clique
        rowElement.classList.add('clicking');
        
        // Criar efeito de ondas
        createRippleEffect(rowElement, event);
        
        setTimeout(() => {
            rowElement.classList.remove('clicking');
            selectLead(index, rowElement);
        }, 150);
    }

    // Função para criar efeito de ondas (ripple)
    function createRippleEffect(element, event) {
        const rect = element.getBoundingClientRect();
        const ripple = document.createElement('span');
        ripple.classList.add('ripple-effect');
        
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        
        element.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }

    // Funções para highlight de linha
    function highlightRow(rowElement) {
        if (!rowElement.classList.contains('selected')) {
            rowElement.classList.add('hover-highlight');
        }
    }

    function unhighlightRow(rowElement) {
        rowElement.classList.remove('hover-highlight');
    }

    // Tornar funções globais
    window.selectLeadWithEffect = selectLeadWithEffect;
    window.highlightRow = highlightRow;
    window.unhighlightRow = unhighlightRow;

    // ===== MICROINTERAÇÕES MODERNAS DOS BOTÕES =====
    function initializeModernButtons() {
        const modernButtons = document.querySelectorAll('.modern-btn');
        
        modernButtons.forEach(button => {
            // Adicionar efeito ripple
            button.addEventListener('click', function(e) {
                createModernRipple(this, e);
                
                // Adicionar estado de loading
                this.classList.add('loading');
                
                // Simular processo e mostrar sucesso
                setTimeout(() => {
                    this.classList.remove('loading');
                    this.classList.add('success');
                    
                    // Remover estado de sucesso
                    setTimeout(() => {
                        this.classList.remove('success');
                    }, 2000);
                }, 1000);
            });
            
            // Adicionar efeito de hover com partículas
            button.addEventListener('mouseenter', function() {
                createHoverParticles(this);
            });
            
            // Adicionar efeito de magnetismo no mouse
            button.addEventListener('mousemove', function(e) {
                createMagnetEffect(this, e);
            });
            
            button.addEventListener('mouseleave', function() {
                removeMagnetEffect(this);
            });
        });
    }

    // Efeito ripple moderno
    function createModernRipple(button, e) {
        const rect = button.getBoundingClientRect();
        const ripple = document.createElement('span');
        ripple.classList.add('ripple');
        
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.style.width = '20px';
        ripple.style.height = '20px';
        
        button.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }

    // Efeito de partículas no hover
    function createHoverParticles(button) {
        const rect = button.getBoundingClientRect();
        const particlesCount = 5;
        
        for (let i = 0; i < particlesCount; i++) {
            const particle = document.createElement('div');
            particle.style.position = 'absolute';
            particle.style.width = '4px';
            particle.style.height = '4px';
            particle.style.background = 'rgba(0, 175, 238, 0.6)';
            particle.style.borderRadius = '50%';
            particle.style.pointerEvents = 'none';
            particle.style.zIndex = '1000';
            
            const x = rect.left + Math.random() * rect.width;
            const y = rect.top + Math.random() * rect.height;
            
            particle.style.left = x + 'px';
            particle.style.top = y + 'px';
            
            document.body.appendChild(particle);
            
            // Animar partícula
            particle.animate([
                { 
                    transform: 'translateY(0px) scale(1)',
                    opacity: 1 
                },
                { 
                    transform: `translateY(-${20 + Math.random() * 20}px) scale(0)`,
                    opacity: 0 
                }
            ], {
                duration: 800 + Math.random() * 400,
                easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
            }).onfinish = () => particle.remove();
        }
    }

    // Efeito magnético do mouse
    function createMagnetEffect(button, e) {
        const rect = button.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        const deltaX = (e.clientX - centerX) * 0.05;
        const deltaY = (e.clientY - centerY) * 0.05;
        
        button.style.transform = `translateY(-3px) scale(1.02) translate(${deltaX}px, ${deltaY}px)`;
    }

    function removeMagnetEffect(button) {
        button.style.transform = '';
    }

    // Inicializar microinterações quando o DOM carregar
    document.addEventListener('DOMContentLoaded', function() {
        // Aguardar um pouco para garantir que todos os elementos foram carregados
        setTimeout(() => {
            initializeModernButtons();
        }, 500);
    });

    // Tornar funções globais para uso externo
    window.initializeModernButtons = initializeModernButtons;
    window.createModernRipple = createModernRipple;
    window.createHoverParticles = createHoverParticles;

    // ===== BANNER INTERATIVO =====
    function initializeBanner() {
        // Animar estatísticas no banner
        animateBannerStats();
        
        // Adicionar interações aos cards flutuantes
        initializeFloatingCards();
        
        // Atualizar estatísticas quando dados forem carregados
        updateBannerStats();
    }

    function animateBannerStats() {
        const statNumbers = document.querySelectorAll('.stat-number');
        
        statNumbers.forEach(stat => {
            const target = parseInt(stat.textContent) || 0;
            let current = 0;
            const increment = target / 50;
            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    current = target;
                    clearInterval(timer);
                }
                stat.textContent = Math.floor(current).toLocaleString('pt-BR');
            }, 30);
        });
    }

    function initializeFloatingCards() {
        const dataCards = document.querySelectorAll('.data-card');
        
        dataCards.forEach((card, index) => {
            card.addEventListener('click', function() {
                // Efeito de clique
                this.style.transform = 'scale(0.9) rotateZ(10deg)';
                
                setTimeout(() => {
                    this.style.transform = '';
                }, 200);
                
                // Ação baseada no card
                const cardText = this.querySelector('.card-text').textContent;
                switch(cardText) {
                    case 'Analytics':
                        if (window.activateIcon1) window.activateIcon1();
                        break;
                    case 'Filtros':
                        if (window.activateIcon2) window.activateIcon2();
                        break;
                    case 'Insights':
                        if (window.activateIcon3) window.activateIcon3();
                        break;
                }
                
                // Mostrar notificação
                showNotification(`Navegando para ${cardText}`, 'success');
            });
            
            // Efeito de hover melhorado
            card.addEventListener('mouseenter', function() {
                createCardParticles(this);
            });
        });
    }

    function createCardParticles(card) {
        const rect = card.getBoundingClientRect();
        const particlesCount = 8;
        
        for (let i = 0; i < particlesCount; i++) {
            const particle = document.createElement('div');
            particle.style.position = 'absolute';
            particle.style.width = '3px';
            particle.style.height = '3px';
            particle.style.background = '#06b6d4';
            particle.style.borderRadius = '50%';
            particle.style.pointerEvents = 'none';
            particle.style.zIndex = '1000';
            
            const angle = (360 / particlesCount) * i;
            const distance = 40 + Math.random() * 20;
            const x = rect.left + rect.width / 2 + Math.cos(angle * Math.PI / 180) * distance;
            const y = rect.top + rect.height / 2 + Math.sin(angle * Math.PI / 180) * distance;
            
            particle.style.left = x + 'px';
            particle.style.top = y + 'px';
            
            document.body.appendChild(particle);
            
            // Animar partícula
            particle.animate([
                { 
                    transform: 'scale(0) rotate(0deg)',
                    opacity: 0 
                },
                { 
                    transform: 'scale(1) rotate(180deg)',
                    opacity: 1 
                },
                { 
                    transform: 'scale(0) rotate(360deg)',
                    opacity: 0 
                }
            ], {
                duration: 1000,
                easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
            }).onfinish = () => particle.remove();
        }
    }

    function updateBannerStats() {
        // Atualizar estatísticas do banner com dados reais
        const totalRecordsEl = document.getElementById('bannerTotalRecords');
        const totalCitiesEl = document.getElementById('bannerTotalCities');
        const filteredCountEl = document.getElementById('bannerFilteredCount');
        
        if (window.originalData && totalRecordsEl) {
            totalRecordsEl.textContent = window.originalData.length.toLocaleString('pt-BR');
        }
        
        if (window.originalData && totalCitiesEl) {
            const cities = new Set(window.originalData.map(row => 
                row['NM_MUNICIPIO'] || row['CIDADE'] || ''
            )).size;
            totalCitiesEl.textContent = cities.toLocaleString('pt-BR');
        }
        
        if (window.filteredData && filteredCountEl) {
            filteredCountEl.textContent = window.filteredData.length.toLocaleString('pt-BR');
        }
    }

    // Adicionar parallax suave ao banner
    function initializeBannerParallax() {
        const banner = document.querySelector('.modern-banner');
        if (!banner) return;
        
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const rate = scrolled * -0.5;
            
            banner.style.transform = `translateY(${rate}px)`;
        });
    }

    // Inicializar banner quando DOM carregar
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(() => {
            initializeBanner();
            initializeBannerParallax();
        }, 500);
    });

    // Atualizar estatísticas quando dados mudarem
    const originalUpdateDashboardStats = updateDashboardStats;
    updateDashboardStats = function() {
        if (originalUpdateDashboardStats) {
            originalUpdateDashboardStats();
        }
        updateBannerStats();
    };

    // Tornar funções globais
    window.initializeBanner = initializeBanner;
    window.updateBannerStats = updateBannerStats;

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
        
        // Função para escapar campos CSV adequadamente
        function escapeCsvField(field) {
            if (field === null || field === undefined) return '';
            const str = String(field);
            // Se contém vírgula, aspas, ou quebra de linha, envolver em aspas
            if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
                return '"' + str.replace(/"/g, '""') + '"';
            }
            return str;
        }
        
        const csvContent = [
            headers.map(escapeCsvField).join(','),
            ...filteredData.map(row => headers.map(header => escapeCsvField(row[header])).join(','))
        ].join('\n');
        
        // Adicionar BOM UTF-8 para garantir codificação correta
        const utf8BOM = '\uFEFF';
        const csvWithBOM = utf8BOM + csvContent;
        
        downloadFile(csvWithBOM, 'dados_filtrados.csv', 'text/csv;charset=utf-8');
        showNotification('CSV exportado com UTF-8!', 'success');
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

    // Usar a função global showNotification
    const showNotification = window.showNotification;

    // Função para adicionar efeito neumórfico nos botões
    function addNeuWaveEffectToButtons() {
        const buttons = document.querySelectorAll('.btn-primary, .btn-secondary, .btn-success, .btn-mini');
        
        buttons.forEach(button => {
            let debounce = false;
            
            button.addEventListener('click', (e) => {
                if (debounce) return;
                debounce = true;
                
                // Animação neumórfica do botão
                button.classList.add('clicked');
                setTimeout(() => {
                    button.classList.remove('clicked');
                    debounce = false;
                }, 700);
                
                // Criar onda neumórfica
                createNeuWave(e, button);
            });
        });
    }

    // Função para criar onda neumórfica
    function createNeuWave(event, button) {
        const rect = button.getBoundingClientRect();
        const wave = document.createElement('div');
        wave.classList.add('neu-wave');
        
        // Posicionar onda no ponto do clique
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        wave.style.position = 'absolute';
        wave.style.left = (x - 10) + 'px';
        wave.style.top = (y - 10) + 'px';
        
        // Adicionar onda dentro do botão
        button.appendChild(wave);
        
        setTimeout(() => {
            if (wave.parentNode) {
                wave.parentNode.removeChild(wave);
            }
        }, 4000);
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

// Função global para notificações
window.showNotification = function(message, type = 'info') {
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
};

// Função para alternar entre tabs de saída
window.switchTab = function(tabName) {
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
};

// ===== FUNÇÕES DE NAVEGAÇÃO =====
function initializeNavigation() {
    // Ativar primeiro ícone por padrão
    activateIcon1();
}

function moveSquircleToIcon(targetIcon, rotation) {
    const iconRect = targetIcon.getBoundingClientRect();
    const squircle = document.getElementById('squircle');
    const navWrapper = document.querySelector('.nav-wrapper');
    const navWrapperRect = navWrapper.getBoundingClientRect();

    const iconCenterX = iconRect.left + iconRect.width / 2;
    const navWrapperLeft = navWrapperRect.left;
    const squircleCenterX = 40; // metade da largura do squircle (80px)

    const leftPosition = iconCenterX - navWrapperLeft - squircleCenterX;

    squircle.style.left = leftPosition + 'px';
    squircle.style.transform = `rotate(${rotation}deg)`;
}

window.activateIcon1 = function() {
    const icon1 = document.getElementById("icon-one");
    const icon2 = document.getElementById("icon-two");
    const icon3 = document.getElementById("icon-three");
    const icon4 = document.getElementById("icon-four");
    const navText = document.getElementById("nav-text");

    icon1.classList.add("active");
    icon2.classList.remove("active");
    icon3.classList.remove("active");
    icon4.classList.remove("active");

    moveSquircleToIcon(icon1, 180);
    navText.textContent = "Dashboard - Visão Geral dos Dados";
    
    showSection('dashboard-section');
    updateDashboardStats();
};

window.activateIcon2 = function() {
    const icon1 = document.getElementById("icon-one");
    const icon2 = document.getElementById("icon-two");
    const icon3 = document.getElementById("icon-three");
    const icon4 = document.getElementById("icon-four");
    const navText = document.getElementById("nav-text");

    icon1.classList.remove("active");
    icon2.classList.add("active");
    icon3.classList.remove("active");
    icon4.classList.remove("active");

    moveSquircleToIcon(icon2, 360);
    navText.textContent = "Filtros - Processamento de Dados";
    
    showSection('filters-section');
};

window.activateIcon3 = function() {
    const icon1 = document.getElementById("icon-one");
    const icon2 = document.getElementById("icon-two");
    const icon3 = document.getElementById("icon-three");
    const icon4 = document.getElementById("icon-four");
    const navText = document.getElementById("nav-text");

    icon1.classList.remove("active");
    icon2.classList.remove("active");
    icon3.classList.add("active");
    icon4.classList.remove("active");

    moveSquircleToIcon(icon3, 540);
    navText.textContent = "Relatórios - Análises Avançadas";
    
    showSection('reports-section');
};

window.activateIcon4 = function() {
    const icon1 = document.getElementById("icon-one");
    const icon2 = document.getElementById("icon-two");
    const icon3 = document.getElementById("icon-three");
    const icon4 = document.getElementById("icon-four");
    const navText = document.getElementById("nav-text");

    icon1.classList.remove("active");
    icon2.classList.remove("active");
    icon3.classList.remove("active");
    icon4.classList.add("active");

    moveSquircleToIcon(icon4, 720);
    navText.textContent = "Configurações - Personalização";
    
    showSection('settings-section');
};

function showSection(sectionId) {
    // Ocultar todas as seções
    document.querySelectorAll('.page-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Mostrar seção específica
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
    }
}

// ===== FUNÇÕES DO DASHBOARD =====
function updateDashboardStats() {
    // Verificar se originalData existe e está definido
    const hasData = window.originalData && Array.isArray(window.originalData);
    const hasFilteredData = window.filteredData && Array.isArray(window.filteredData);
    
    const totalRecords = hasData ? window.originalData.length : 0;
    const totalCities = hasData ? new Set(window.originalData.map(row => row['NM_MUNICIPIO'] || row['CIDADE'] || '')).size : 0;
    const totalAreas = hasData ? new Set(window.originalData.map(row => row['NM_GEO'] || row['AREA'] || '')).size : 0;
    const filteredRecords = hasFilteredData ? window.filteredData.length : 0;

    // Verificar se os elementos existem antes de atualizar
    const totalRecordsEl = document.getElementById('totalRecords');
    const totalCitiesEl = document.getElementById('totalCities');
    const totalAreasEl = document.getElementById('totalAreas');
    const filteredRecordsEl = document.getElementById('filteredRecords');

    if (totalRecordsEl) totalRecordsEl.textContent = totalRecords;
    if (totalCitiesEl) totalCitiesEl.textContent = totalCities;
    if (totalAreasEl) totalAreasEl.textContent = totalAreas;
    if (filteredRecordsEl) filteredRecordsEl.textContent = filteredRecords;

    // Atualizar gráficos se os dados existem
    if (hasData && window.originalData.length > 0) {
        updateCharts();
    }
}

function updateCharts() {
    // Verificar se os dados existem
    if (!window.originalData || !Array.isArray(window.originalData)) {
        return;
    }

    // Gráfico de cidades
    const cityData = {};
    window.originalData.forEach(row => {
        const city = row['NM_MUNICIPIO'] || row['CIDADE'] || 'Não informado';
        cityData[city] = (cityData[city] || 0) + 1;
    });

    drawChart('cityChart', cityData, 'Cidades');

    // Gráfico de áreas
    const areaData = {};
    window.originalData.forEach(row => {
        const area = row['NM_GEO'] || row['AREA'] || 'Não informado';
        areaData[area] = (areaData[area] || 0) + 1;
    });

    drawChart('areaChart', areaData, 'Áreas');
}

function drawChart(canvasId, data, title) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Limpar canvas
    ctx.clearRect(0, 0, width, height);

    const entries = Object.entries(data).slice(0, 10); // Top 10
    const maxValue = Math.max(...entries.map(([, value]) => value));
    const barWidth = width / entries.length - 10;
    const barMaxHeight = height - 60;

    // Desenhar barras
    entries.forEach(([label, value], index) => {
        const barHeight = (value / maxValue) * barMaxHeight;
        const x = index * (barWidth + 10) + 5;
        const y = height - 40 - barHeight;

        // Gradiente para as barras
        const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight);
        gradient.addColorStop(0, '#60a5fa');
        gradient.addColorStop(1, '#1e40af');

        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, barWidth, barHeight);

        // Valor no topo da barra
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px Inter';
        ctx.textAlign = 'center';
        ctx.fillText(value, x + barWidth / 2, y - 5);

        // Label na base
        ctx.save();
        ctx.translate(x + barWidth / 2, height - 20);
        ctx.rotate(-Math.PI / 4);
        ctx.fillText(label.substring(0, 8) + '...', 0, 0);
        ctx.restore();
    });
}

// ===== FUNÇÕES DE RELATÓRIOS =====
window.generatePerformanceReport = function() {
    if (!window.originalData || !Array.isArray(window.originalData) || window.originalData.length === 0) {
        showNotification('Nenhum dado disponível para gerar relatório!', 'error');
        return;
    }

    const reportResults = document.getElementById('reportResults');
    const reportContent = document.getElementById('reportContent');
    
    let reportHtml = '<div class="performance-report">';
    reportHtml += '<h4>📈 Relatório de Performance por Cidade</h4>';
    
    // Análise por cidade
    const cityPerformance = {};
    window.originalData.forEach(row => {
        const city = row['NM_MUNICIPIO'] || row['CIDADE'] || 'Não informado';
        if (!cityPerformance[city]) {
            cityPerformance[city] = { count: 0, activeCount: 0 };
        }
        cityPerformance[city].count++;
        if (row['STATUS'] !== 'INATIVO CIELO') {
            cityPerformance[city].activeCount++;
        }
    });

    reportHtml += '<table class="report-table">';
    reportHtml += '<tr><th>Cidade</th><th>Total</th><th>Ativos</th><th>% Ativo</th></tr>';
    
    Object.entries(cityPerformance)
        .sort(([,a], [,b]) => b.count - a.count)
        .slice(0, 10)
        .forEach(([city, data]) => {
            const percentage = ((data.activeCount / data.count) * 100).toFixed(1);
            reportHtml += `<tr><td>${city}</td><td>${data.count}</td><td>${data.activeCount}</td><td>${percentage}%</td></tr>`;
        });

    reportHtml += '</table></div>';
    
    reportContent.innerHTML = reportHtml;
    reportResults.style.display = 'block';
    showNotification('Relatório de performance gerado!', 'success');
};

window.generateTopPerformers = function() {
    if (!window.originalData || !Array.isArray(window.originalData) || window.originalData.length === 0) {
        showNotification('Nenhum dado disponível para ranking!', 'error');
        return;
    }

    const reportResults = document.getElementById('reportResults');
    const reportContent = document.getElementById('reportContent');
    
    // Top cidades por volume
    const cityData = {};
    window.originalData.forEach(row => {
        const city = row['NM_MUNICIPIO'] || row['CIDADE'] || 'Não informado';
        cityData[city] = (cityData[city] || 0) + 1;
    });

    let reportHtml = '<div class="top-performers">';
    reportHtml += '<h4>🏆 Top 10 Cidades por Volume</h4>';
    reportHtml += '<div class="ranking-list">';
    
    Object.entries(cityData)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .forEach(([city, count], index) => {
            const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}º`;
            reportHtml += `<div class="ranking-item"><span class="rank">${medal}</span> <span class="city">${city}</span> <span class="count">${count} registros</span></div>`;
        });

    reportHtml += '</div></div>';
    
    reportContent.innerHTML = reportHtml;
    reportResults.style.display = 'block';
    showNotification('Ranking de top performers gerado!', 'success');
};

window.generateComparison = function() {
    showNotification('Funcionalidade de comparação em desenvolvimento!', 'info');
};

window.openCustomReport = function() {
    showNotification('Editor de relatórios personalizados em desenvolvimento!', 'info');
};

// ===== CORREÇÃO DAS EXPORTAÇÕES =====
window.exportToExcel = function() {
    const dataToExport = window.filteredData && window.filteredData.length > 0 ? window.filteredData : window.originalData;
    if (!dataToExport || dataToExport.length === 0) {
        showNotification('Nenhum dado para exportar!', 'error');
        return;
    }

    // Implementação usando SheetJS (XLSX)
    try {
        // Preparar dados
        const currentHeaders = window.headers || Object.keys(dataToExport[0] || {});
        const worksheetData = [currentHeaders, ...dataToExport.map(row => currentHeaders.map(header => row[header] || ''))];
        
        // Criar planilha
        const ws = XLSX.utils.aoa_to_sheet(worksheetData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Dados Exportados");
        
        // Exportar
        XLSX.writeFile(wb, "dados_filtrados.xlsx");
        showNotification('Excel exportado com sucesso!', 'success');
    } catch (error) {
        // Fallback: exportar como CSV
        console.warn('Biblioteca XLSX não encontrada, exportando como CSV');
        exportToCsv();
    }
};

window.exportToPdf = function() {
    const dataToExport = window.filteredData && window.filteredData.length > 0 ? window.filteredData : window.originalData;
    if (!dataToExport || dataToExport.length === 0) {
        showNotification('Nenhum dado para exportar!', 'error');
        return;
    }

    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Título
        doc.setFontSize(16);
        doc.text('Relatório de Dados Filtrados - Cielo', 20, 20);
        
        // Data
        doc.setFontSize(10);
        doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 20, 30);
        
        // Preparar dados para a tabela (limitar a 100 linhas para performance)
        const currentHeaders = window.headers || Object.keys(dataToExport[0] || {});
        const tableData = dataToExport.slice(0, 100).map(row => 
            currentHeaders.map(header => String(row[header] || '').substring(0, 20))
        );
        
        // Adicionar tabela
        doc.autoTable({
            head: [currentHeaders.map(h => h.substring(0, 15))],
            body: tableData,
            startY: 40,
            styles: {
                fontSize: 8,
                cellPadding: 2
            },
            headStyles: {
                fillColor: [59, 130, 246],
                textColor: 255
            }
        });
        
        // Salvar arquivo
        doc.save('dados_filtrados.pdf');
        showNotification('PDF exportado com sucesso!', 'success');
    } catch (error) {
        console.error('Erro ao exportar PDF:', error);
        showNotification('Erro ao exportar PDF. Verifique se as bibliotecas estão carregadas.', 'error');
    }
};

// ===== FUNÇÕES DE CONFIGURAÇÕES =====
window.saveSettings = function() {
    const settings = {
        theme: document.getElementById('themeSelect').value,
        transparency: document.getElementById('transparencyRange').value,
        rowsPerPage: document.getElementById('rowsPerPage').value,
        autoSave: document.getElementById('autoSave').checked,
        defaultExport: document.getElementById('defaultExport').value,
        includeBOM: document.getElementById('includeBOM').checked,
        enableNotifications: document.getElementById('enableNotifications').checked,
        soundEnabled: document.getElementById('soundEnabled').checked
    };

    localStorage.setItem('cieloSettings', JSON.stringify(settings));
    applySettings(settings);
    showNotification('Configurações salvas com sucesso!', 'success');
};

window.resetSettings = function() {
    localStorage.removeItem('cieloSettings');
    loadDefaultSettings();
    showNotification('Configurações restauradas para o padrão!', 'info');
};

window.exportSettings = function() {
    const settings = localStorage.getItem('cieloSettings') || '{}';
    downloadFile(settings, 'cielo-configuracoes.json', 'application/json');
    showNotification('Configurações exportadas!', 'success');
};

window.importSettings = function() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const settings = JSON.parse(e.target.result);
                    localStorage.setItem('cieloSettings', JSON.stringify(settings));
                    loadSettings();
                    showNotification('Configurações importadas com sucesso!', 'success');
                } catch (error) {
                    showNotification('Erro ao importar configurações!', 'error');
                }
            };
            reader.readAsText(file);
        }
    };
    input.click();
};

function loadSettings() {
    const savedSettings = localStorage.getItem('cieloSettings');
    if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        applySettings(settings);
        updateSettingsUI(settings);
    } else {
        loadDefaultSettings();
    }
}

function loadDefaultSettings() {
    const defaultSettings = {
        theme: 'default',
        transparency: '0.15',
        rowsPerPage: '25',
        autoSave: true,
        defaultExport: 'csv',
        includeBOM: true,
        enableNotifications: true,
        soundEnabled: false
    };
    updateSettingsUI(defaultSettings);
    applySettings(defaultSettings);
}

function updateSettingsUI(settings) {
    if (document.getElementById('themeSelect')) document.getElementById('themeSelect').value = settings.theme;
    if (document.getElementById('transparencyRange')) document.getElementById('transparencyRange').value = settings.transparency;
    if (document.getElementById('rowsPerPage')) document.getElementById('rowsPerPage').value = settings.rowsPerPage;
    if (document.getElementById('autoSave')) document.getElementById('autoSave').checked = settings.autoSave;
    if (document.getElementById('defaultExport')) document.getElementById('defaultExport').value = settings.defaultExport;
    if (document.getElementById('includeBOM')) document.getElementById('includeBOM').checked = settings.includeBOM;
    if (document.getElementById('enableNotifications')) document.getElementById('enableNotifications').checked = settings.enableNotifications;
    if (document.getElementById('soundEnabled')) document.getElementById('soundEnabled').checked = settings.soundEnabled;
}

function applySettings(settings) {
    // Aplicar transparência
    if (settings.transparency) {
        const transparencyValue = parseFloat(settings.transparency);
        document.documentElement.style.setProperty('--transparency-level', transparencyValue);
    }
}

// Redimensionamento responsivo para o menu
window.addEventListener("resize", function () {
    const icon1 = document.getElementById("icon-one");
    const icon2 = document.getElementById("icon-two");
    const icon3 = document.getElementById("icon-three");
    const icon4 = document.getElementById("icon-four");

    if (icon1 && icon1.classList.contains("active")) moveSquircleToIcon(icon1, 180);
    else if (icon2 && icon2.classList.contains("active")) moveSquircleToIcon(icon2, 360);
    else if (icon3 && icon3.classList.contains("active")) moveSquircleToIcon(icon3, 540);
    else if (icon4 && icon4.classList.contains("active")) moveSquircleToIcon(icon4, 720);
});