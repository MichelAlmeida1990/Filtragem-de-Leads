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
    
    // Elementos de filtros avançados
    const addFilterBtn = document.getElementById('addFilterBtn');
    const clearAllFiltersBtn = document.getElementById('clearAllFiltersBtn');
    const advancedFiltersContainer = document.getElementById('advancedFiltersContainer');
    
    // Elementos de ordenação
    const sortColumn = document.getElementById('sortColumn');
    const sortOrder = document.getElementById('sortOrder');
    const applySortBtn = document.getElementById('applySortBtn');
    
    // Elementos de informação do arquivo
    const fileInfoDisplay = document.getElementById('fileInfoDisplay');
    const displayFileName = document.getElementById('displayFileName');
    const displaySheetName = document.getElementById('displaySheetName');
    const displayTotalRows = document.getElementById('displayTotalRows');
    const displayFilteredRows = document.getElementById('displayFilteredRows');
    
    // Elementos de exportação
    const exportCsvBtn = document.getElementById('exportCsvBtn');
    const exportExcelBtn = document.getElementById('exportExcelBtn');
    const exportPdfBtn = document.getElementById('exportPdfBtn');
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
    exportPdfBtn.addEventListener('click', exportToPdf);
    copyToClipboardBtn.addEventListener('click', copyToClipboard);
    
    // Event listeners para filtros avançados
    addFilterBtn.addEventListener('click', addAdvancedFilter);
    clearAllFiltersBtn.addEventListener('click', clearAllFilters);
    applySortBtn.addEventListener('click', applySorting);

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
        sortColumn.innerHTML = '<option value="">Selecionar coluna</option>';
        
        // Debug: mostrar todas as colunas encontradas
        console.log('Headers encontrados:', headers);
        console.log('Primeiros 5 registros para análise:', originalData.slice(0, 5));
        
        // Find city and area columns - procurar por colunas que contenham os valores MAUA/SP/SAO PAULO
        let cityColumn = null;
        let areaColumn = null;
        
        // Verificar cada coluna para encontrar onde estão os valores de cidade e rota
        headers.forEach((header, index) => {
            const uniqueValues = [...new Set(originalData.map(row => row[header]).filter(val => val && val.trim()))];
            console.log(`Coluna "${header}":`, uniqueValues.slice(0, 10)); // Mostrar primeiros 10 valores únicos
            
            // Se a coluna contém MAUA, SAO PAULO ou SP, é a coluna de cidade
            if (uniqueValues.some(val => 
                val === 'MAUA' || 
                val === 'SP' || 
                val === 'SAO PAULO' ||
                val === 'SANTO ANDRE'
            )) {
                cityColumn = header;
                console.log('Coluna de cidade encontrada:', header, 'com valores:', uniqueValues.filter(val => 
                    val === 'MAUA' || val === 'SP' || val === 'SAO PAULO' || val === 'SANTO ANDRE'
                ));
            }
            
            // Se a coluna contém ROTA, é a coluna de área
            if (uniqueValues.some(val => val && val.toString().startsWith('ROTA'))) {
                areaColumn = header;
                console.log('Coluna de área/rota encontrada:', header, 'com valores:', uniqueValues.filter(val => 
                    val && val.toString().startsWith('ROTA')
                ));
            }
            
            // Adicionar todas as colunas ao dropdown de ordenação
            const sortOption = document.createElement('option');
            sortOption.value = header;
            sortOption.textContent = header;
            sortColumn.appendChild(sortOption);
        });
        
        // Fallback: procurar por nomes de colunas específicos
        if (!cityColumn) {
            cityColumn = headers.find(h => 
                h.toLowerCase().includes('cidade') || 
                h.toLowerCase().includes('city') ||
                h.toLowerCase().includes('municipio') ||
                h.toLowerCase().includes('local') ||
                h.toLowerCase().includes('nm_municipio') ||
                h.toLowerCase().includes('sg_so_uf')
            );
        }
        
        if (!areaColumn) {
            areaColumn = headers.find(h => 
                h.toLowerCase().includes('area') || 
                h.toLowerCase().includes('bairro') ||
                h.toLowerCase().includes('zona') ||
                h.toLowerCase().includes('regiao') ||
                h.toLowerCase().includes('nm_geo') ||
                h.toLowerCase().includes('rota')
            );
        }
        
        console.log('Coluna de cidade final:', cityColumn);
        console.log('Coluna de área final:', areaColumn);
        
        // Armazenar as colunas globalmente para uso posterior
        window.cityColumn = cityColumn;
        window.areaColumn = areaColumn;
        
        if (cityColumn) {
            // Pegar todos os valores únicos da coluna de cidade
            const allCities = [...new Set(originalData.map(row => row[cityColumn]).filter(city => {
                if (!city || city.trim() === '') return false;
                const cityValue = city.toString().trim();
                
                // Incluir apenas cidades válidas
                return ['MAUA', 'SAO PAULO', 'SANTO ANDRE', 'SP'].includes(cityValue);
            }))];
            
            console.log('Cidades encontradas:', allCities);
            
            allCities.sort().forEach(city => {
                const option = document.createElement('option');
                option.value = city;
                option.textContent = city;
                cityFilter.appendChild(option);
            });
        }
        
        // Popular todas as áreas inicialmente
        populateAreasForCity('');
        
        // Adicionar event listener para atualizar áreas quando cidade mudar
        cityFilter.addEventListener('change', function() {
            const selectedCity = this.value;
            populateAreasForCity(selectedCity);
            // Limpar seleção de área quando cidade mudar
            areaFilter.value = '';
        });
    }
    
    function populateAreasForCity(selectedCity) {
        if (!window.areaColumn) return;
        
        // Limpar opções existentes
        areaFilter.innerHTML = '<option value="">Todas as áreas</option>';
        
        // Filtrar dados baseado na cidade selecionada
        let filteredData = originalData;
        if (selectedCity && window.cityColumn) {
            filteredData = originalData.filter(row => row[window.cityColumn] === selectedCity);
        }
        
        console.log(`Populando áreas para cidade "${selectedCity}":`, filteredData.length, 'registros');
        
        // Pegar todas as rotas únicas dos dados filtrados - LÓGICA SIMPLIFICADA
        const allAreas = [...new Set(filteredData.map(row => row[window.areaColumn]).filter(area => {
            if (!area || area.trim() === '') return false;
            
            const areaValue = area.toString().trim();
            
            // Incluir ROTAs especificamente - esta é a principal mudança
            if (areaValue.startsWith('ROTA')) return true;
            
            // Incluir também códigos de área que contêm "CN - MAUA"
            if (areaValue.includes('CN - MAUA')) return true;
            
            // Excluir apenas valores que claramente não são áreas
            if (/^SEMANA/.test(areaValue)) return false; // Valores que começam com "SEMANA"
            if (/^INATIVO/.test(areaValue)) return false; // Valores que começam com "INATIVO"
            if (/^FRANQUIAS/.test(areaValue)) return false; // Valores que começam com "FRANQUIAS"
            
            // Incluir valores que parecem nomes de áreas (pelo menos 3 caracteres)
            return areaValue.length >= 3;
        }))];
        
        console.log(`Áreas encontradas para "${selectedCity}":`, allAreas);
        
        allAreas.sort().forEach(area => {
            const option = document.createElement('option');
            option.value = area;
            option.textContent = area;
            areaFilter.appendChild(option);
        });
    }

    // Funções para filtros avançados
    function addAdvancedFilter() {
        const filterRow = document.createElement('div');
        filterRow.className = 'filter-row';
        filterRow.innerHTML = `
            <select class="filter-select filter-column">
                <option value="">Selecionar coluna</option>
                ${headers.map(header => `<option value="${header}">${header}</option>`).join('')}
            </select>
            <select class="filter-select filter-operator">
                <option value="equals">Igual a</option>
                <option value="contains">Contém</option>
                <option value="starts_with">Começa com</option>
                <option value="ends_with">Termina com</option>
                <option value="greater_than">Maior que</option>
                <option value="less_than">Menor que</option>
                <option value="greater_equal">Maior ou igual</option>
                <option value="less_equal">Menor ou igual</option>
                <option value="not_equals">Diferente de</option>
            </select>
            <input type="text" class="filter-input filter-value" placeholder="Valor...">
            <select class="filter-select filter-logic">
                <option value="AND">E (AND)</option>
                <option value="OR">OU (OR)</option>
            </select>
            <button class="remove-filter-btn" onclick="removeFilter(this)">✕</button>
        `;
        
        advancedFiltersContainer.appendChild(filterRow);
    }

    function removeFilter(button) {
        button.parentElement.remove();
    }

    function clearAllFilters() {
        advancedFiltersContainer.innerHTML = '';
        cityFilter.value = '';
        areaFilter.value = '';
        searchFilter.value = '';
        sortColumn.value = '';
        sortOrder.value = 'asc';
    }

    function applySorting() {
        const column = sortColumn.value;
        const order = sortOrder.value;
        
        if (!column) {
            showNotification('Selecione uma coluna para ordenar!', 'warning');
            return;
        }
        
        if (filteredData) {
            filteredData.sort((a, b) => {
                let aVal = a[column] || '';
                let bVal = b[column] || '';
                
                // Tentar converter para número se possível
                const aNum = parseFloat(aVal);
                const bNum = parseFloat(bVal);
                
                if (!isNaN(aNum) && !isNaN(bNum)) {
                    aVal = aNum;
                    bVal = bNum;
                } else {
                    // Comparação de strings
                    aVal = aVal.toString().toLowerCase();
                    bVal = bVal.toString().toLowerCase();
                }
                
                if (order === 'asc') {
                    return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
                } else {
                    return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
                }
            });
            
            displayResults();
            showNotification(`Dados ordenados por ${column} (${order === 'asc' ? 'crescente' : 'decrescente'})`, 'success');
        }
    }

    function applyFilters() {
        if (!originalData) return;
        
        let filtered = [...originalData];
        
        // Usar as colunas globais já detectadas
        const cityColumn = window.cityColumn;
        const areaColumn = window.areaColumn;
        
        console.log('=== APLICANDO FILTROS ===');
        console.log('Coluna cidade:', cityColumn, 'Coluna área:', areaColumn);
        console.log('Total de registros originais:', originalData.length);
        
        // Filter by city
        const selectedCity = cityFilter.value;
        if (selectedCity && cityColumn) {
            console.log('Filtrando por cidade:', selectedCity, 'na coluna:', cityColumn);
            
            // Mostrar alguns exemplos de valores na coluna de cidade
            const cityValues = [...new Set(originalData.map(row => row[cityColumn]).filter(val => val && val.trim()))];
            console.log('Valores únicos na coluna de cidade:', cityValues);
            
            filtered = filtered.filter(row => row[cityColumn] === selectedCity);
            console.log('Registros após filtro de cidade:', filtered.length);
            
            // Mostrar alguns exemplos dos registros filtrados
            if (filtered.length > 0) {
                console.log('Exemplos de registros filtrados por cidade:', filtered.slice(0, 3));
            }
        }
        
        // Filter by area
        const selectedArea = areaFilter.value;
        if (selectedArea && areaColumn) {
            console.log('Filtrando por área:', selectedArea, 'na coluna:', areaColumn);
            
            // Mostrar alguns exemplos de valores na coluna de área
            const areaValues = [...new Set(filtered.map(row => row[areaColumn]).filter(val => val && val.trim()))];
            console.log('Valores únicos na coluna de área (após filtro de cidade):', areaValues);
            
            filtered = filtered.filter(row => row[areaColumn] === selectedArea);
            console.log('Registros após filtro de área:', filtered.length);
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
        
        // Aplicar filtros avançados
        const advancedFilters = advancedFiltersContainer.querySelectorAll('.filter-row');
        if (advancedFilters.length > 0) {
            console.log('Aplicando filtros avançados...');
            
            advancedFilters.forEach((filterRow, index) => {
                const column = filterRow.querySelector('.filter-column').value;
                const operator = filterRow.querySelector('.filter-operator').value;
                const value = filterRow.querySelector('.filter-value').value;
                const logic = filterRow.querySelector('.filter-logic').value;
                
                if (column && value) {
                    console.log(`Filtro ${index + 1}: ${column} ${operator} "${value}" (${logic})`);
                    
                    filtered = filtered.filter(row => {
                        const cellValue = row[column] || '';
                        let matches = false;
                        
                        // Aplicar operador
                        switch (operator) {
                            case 'equals':
                                matches = cellValue.toString() === value;
                                break;
                            case 'contains':
                                matches = cellValue.toString().toLowerCase().includes(value.toLowerCase());
                                break;
                            case 'starts_with':
                                matches = cellValue.toString().toLowerCase().startsWith(value.toLowerCase());
                                break;
                            case 'ends_with':
                                matches = cellValue.toString().toLowerCase().endsWith(value.toLowerCase());
                                break;
                            case 'greater_than':
                                matches = parseFloat(cellValue) > parseFloat(value);
                                break;
                            case 'less_than':
                                matches = parseFloat(cellValue) < parseFloat(value);
                                break;
                            case 'greater_equal':
                                matches = parseFloat(cellValue) >= parseFloat(value);
                                break;
                            case 'less_equal':
                                matches = parseFloat(cellValue) <= parseFloat(value);
                                break;
                            case 'not_equals':
                                matches = cellValue.toString() !== value;
                                break;
                        }
                        
                        return matches;
                    });
                    
                    console.log(`Registros após filtro ${index + 1}:`, filtered.length);
                }
            });
        }
        
        filteredData = filtered;
        console.log('=== RESULTADO FINAL ===');
        console.log('Total de registros filtrados:', filtered.length);
        
        displayResults();
        
        // Mostrar resumo dos filtros aplicados
        const totalFilters = (selectedCity ? 1 : 0) + (selectedArea ? 1 : 0) + (searchTerm ? 1 : 0) + advancedFilters.length;
        if (totalFilters > 0) {
            showNotification(`${totalFilters} filtro(s) aplicado(s) - ${filtered.length} registros encontrados`, 'success');
        }
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

    function exportToPdf() {
        if (!filteredData || filteredData.length === 0) {
            showNotification('Nenhum dado para exportar!', 'error');
            return;
        }
        
        try {
            // Criar nova instância do jsPDF
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            
            // Configurar título
            const title = 'Relatório de Dados Filtrados - Cielo';
            const subtitle = `Gerado em: ${new Date().toLocaleString('pt-BR')}`;
            const totalRecords = `Total de registros: ${filteredData.length}`;
            
            // Adicionar título
            doc.setFontSize(18);
            doc.setFont('helvetica', 'bold');
            doc.text(title, 20, 20);
            
            // Adicionar subtítulo
            doc.setFontSize(12);
            doc.setFont('helvetica', 'normal');
            doc.text(subtitle, 20, 30);
            doc.text(totalRecords, 20, 40);
            
            // Preparar dados para a tabela
            const tableData = filteredData.map(row => 
                headers.map(header => row[header] || '')
            );
            
            // Configurar a tabela
            const tableConfig = {
                head: [headers],
                body: tableData,
                startY: 50,
                styles: {
                    fontSize: 8,
                    cellPadding: 2,
                    overflow: 'linebreak',
                    halign: 'left'
                },
                headStyles: {
                    fillColor: [0, 102, 204],
                    textColor: 255,
                    fontStyle: 'bold'
                },
                alternateRowStyles: {
                    fillColor: [245, 245, 245]
                },
                margin: { top: 50 }
            };
            
            // Gerar a tabela
            doc.autoTable(tableConfig);
            
            // Adicionar rodapé
            const pageCount = doc.internal.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setFontSize(10);
                doc.text(`Página ${i} de ${pageCount}`, 20, doc.internal.pageSize.height - 10);
            }
            
            // Salvar o PDF
            const filename = `dados_filtrados_${new Date().toISOString().split('T')[0]}.pdf`;
            doc.save(filename);
            
            showNotification('Arquivo PDF exportado com sucesso!', 'success');
        } catch (error) {
            console.error('Erro ao gerar PDF:', error);
            showNotification('Erro ao gerar PDF: ' + error.message, 'error');
        }
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
        
        // Limpar variáveis globais
        window.cityColumn = null;
        window.areaColumn = null;
        
        // Limpar filtros avançados
        advancedFiltersContainer.innerHTML = '';
        sortColumn.value = '';
        sortOrder.value = 'asc';
        
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