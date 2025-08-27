// 🎮 CIELO TETRIS - Cartões e Maquininhas caindo!
class CieloTetris {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.gameWidth = 300;
        this.gameHeight = 600;
        this.blockSize = 30;
        this.cols = 10;
        this.rows = 20;
        this.board = [];
        this.currentPiece = null;
        this.nextPiece = null;
        this.score = 0;
        this.level = 1;
        this.lines = 0;
        this.dropTime = 0;
        this.dropInterval = 1000;
        this.gameRunning = false;
        this.lastTime = 0;
        
        // Cores temáticas da Cielo
        this.colors = {
            azul: '#031f5f',
            azulVivido: '#00afee',
            verde: '#ccff00',
            rosa: '#ca00ca',
            marrom: '#c2af00',
            preto: '#000000',
            branco: '#ffffff'
        };
        
        // Peças temáticas da Cielo
        this.pieces = {
            // Cartão de Crédito (retângulo)
            cartao: {
                shape: [
                    [1, 1, 1, 1]
                ],
                color: this.colors.azul,
                emoji: '💳',
                name: 'Cartão'
            },
            
            // Maquininha (quadrado)
            maquina: {
                shape: [
                    [1, 1],
                    [1, 1]
                ],
                color: this.colors.azulVivido,
                emoji: '💻',
                name: 'Maquininha'
            },
            
            // Logo Cielo (T)
            logo: {
                shape: [
                    [0, 1, 0],
                    [1, 1, 1]
                ],
                color: this.colors.verde,
                emoji: '🏢',
                name: 'Logo Cielo'
            },
            
            // PIX (L)
            pix: {
                shape: [
                    [1, 0, 0],
                    [1, 1, 1]
                ],
                color: this.colors.rosa,
                emoji: '⚡',
                name: 'PIX'
            },
            
            // Dinheiro (S)
            dinheiro: {
                shape: [
                    [0, 1, 1],
                    [1, 1, 0]
                ],
                color: this.colors.marrom,
                emoji: '💰',
                name: 'Dinheiro'
            },
            
            // Cartão Débito (Z)
            debito: {
                shape: [
                    [1, 1, 0],
                    [0, 1, 1]
                ],
                color: '#ff6600',
                emoji: '💳',
                name: 'Débito'
            },
            
            // Terminal (linha vertical)
            terminal: {
                shape: [
                    [1],
                    [1],
                    [1],
                    [1]
                ],
                color: '#666666',
                emoji: '🖥️',
                name: 'Terminal'
            }
        };
        
        this.pieceTypes = Object.keys(this.pieces);
        this.init();
    }
    
    init() {
        this.createCanvas();
        this.initBoard();
        this.spawnPiece();
        this.gameLoop();
    }
    
    createCanvas() {
        // Remover canvas existente se houver
        const existingCanvas = document.getElementById('tetrisCanvas');
        if (existingCanvas) {
            existingCanvas.remove();
        }
        
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'tetrisCanvas';
        this.canvas.width = this.gameWidth;
        this.canvas.height = this.gameHeight;
        this.canvas.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 1;
            border: 3px solid ${this.colors.azulVivido};
            border-radius: 15px;
            background: rgba(0, 0, 0, 0.8);
            box-shadow: 0 10px 30px rgba(0, 175, 238, 0.3);
            opacity: 0.7;
            transition: opacity 0.3s ease;
        `;
        
        // Hover effect
        this.canvas.addEventListener('mouseenter', () => {
            this.canvas.style.opacity = '1';
        });
        
        this.canvas.addEventListener('mouseleave', () => {
            this.canvas.style.opacity = '0.7';
        });
        
        this.ctx = this.canvas.getContext('2d');
        document.body.appendChild(this.canvas);
        
        // Adicionar controles
        this.addControls();
    }
    
    addControls() {
        document.addEventListener('keydown', (e) => {
            if (!this.gameRunning) return;
            
            switch(e.key) {
                case 'ArrowLeft':
                    this.movePiece(-1, 0);
                    break;
                case 'ArrowRight':
                    this.movePiece(1, 0);
                    break;
                case 'ArrowDown':
                    this.movePiece(0, 1);
                    break;
                case 'ArrowUp':
                case ' ':
                    this.rotatePiece();
                    break;
            }
        });
        
        // Controles touch para mobile
        this.canvas.addEventListener('click', () => {
            if (this.gameRunning) {
                this.rotatePiece();
            }
        });
    }
    
    initBoard() {
        this.board = [];
        for (let r = 0; r < this.rows; r++) {
            this.board[r] = [];
            for (let c = 0; c < this.cols; c++) {
                this.board[r][c] = 0;
            }
        }
    }
    
    spawnPiece() {
        const randomType = this.pieceTypes[Math.floor(Math.random() * this.pieceTypes.length)];
        const piece = this.pieces[randomType];
        
        this.currentPiece = {
            shape: piece.shape,
            color: piece.color,
            emoji: piece.emoji,
            name: piece.name,
            x: Math.floor(this.cols / 2) - Math.floor(piece.shape[0].length / 2),
            y: 0
        };
        
        // Verificar game over
        if (this.checkCollision(this.currentPiece, 0, 0)) {
            this.gameOver();
        }
        
        this.gameRunning = true;
    }
    
    movePiece(dx, dy) {
        if (!this.checkCollision(this.currentPiece, dx, dy)) {
            this.currentPiece.x += dx;
            this.currentPiece.y += dy;
            return true;
        }
        return false;
    }
    
    rotatePiece() {
        const rotated = this.rotateMatrix(this.currentPiece.shape);
        const originalShape = this.currentPiece.shape;
        this.currentPiece.shape = rotated;
        
        if (this.checkCollision(this.currentPiece, 0, 0)) {
            this.currentPiece.shape = originalShape; // Reverter se colidiu
        }
    }
    
    rotateMatrix(matrix) {
        const rows = matrix.length;
        const cols = matrix[0].length;
        const rotated = [];
        
        for (let i = 0; i < cols; i++) {
            rotated[i] = [];
            for (let j = 0; j < rows; j++) {
                rotated[i][j] = matrix[rows - 1 - j][i];
            }
        }
        return rotated;
    }
    
    checkCollision(piece, dx, dy) {
        const newX = piece.x + dx;
        const newY = piece.y + dy;
        
        for (let r = 0; r < piece.shape.length; r++) {
            for (let c = 0; c < piece.shape[r].length; c++) {
                if (piece.shape[r][c]) {
                    const boardX = newX + c;
                    const boardY = newY + r;
                    
                    if (boardX < 0 || boardX >= this.cols || 
                        boardY >= this.rows || 
                        (boardY >= 0 && this.board[boardY][boardX])) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
    
    placePiece() {
        for (let r = 0; r < this.currentPiece.shape.length; r++) {
            for (let c = 0; c < this.currentPiece.shape[r].length; c++) {
                if (this.currentPiece.shape[r][c]) {
                    const boardX = this.currentPiece.x + c;
                    const boardY = this.currentPiece.y + r;
                    
                    if (boardY >= 0) {
                        this.board[boardY][boardX] = {
                            color: this.currentPiece.color,
                            emoji: this.currentPiece.emoji,
                            name: this.currentPiece.name
                        };
                    }
                }
            }
        }
        
        this.clearLines();
        this.spawnPiece();
    }
    
    clearLines() {
        let linesCleared = 0;
        
        for (let r = this.rows - 1; r >= 0; r--) {
            let fullLine = true;
            for (let c = 0; c < this.cols; c++) {
                if (!this.board[r][c]) {
                    fullLine = false;
                    break;
                }
            }
            
            if (fullLine) {
                this.board.splice(r, 1);
                this.board.unshift(new Array(this.cols).fill(0));
                linesCleared++;
                r++; // Verificar a mesma linha novamente
            }
        }
        
        if (linesCleared > 0) {
            this.lines += linesCleared;
            this.score += linesCleared * 100 * this.level;
            this.level = Math.floor(this.lines / 10) + 1;
            this.dropInterval = Math.max(100, 1000 - (this.level - 1) * 100);
            
            // Efeito visual quando limpa linha
            this.showLinesClearedEffect(linesCleared);
        }
    }
    
    showLinesClearedEffect(lines) {
        // Criar elemento de notificação
        const notification = document.createElement('div');
        notification.textContent = `${lines} linha${lines > 1 ? 's' : ''} eliminada${lines > 1 ? 's' : ''}! 🎉`;
        notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: ${this.colors.verde};
            color: ${this.colors.preto};
            padding: 15px 25px;
            border-radius: 10px;
            font-weight: bold;
            font-size: 18px;
            z-index: 9999;
            animation: fadeInOut 2s ease;
            pointer-events: none;
        `;
        
        // Adicionar animação CSS
        if (!document.getElementById('tetrisNotificationStyle')) {
            const style = document.createElement('style');
            style.id = 'tetrisNotificationStyle';
            style.textContent = `
                @keyframes fadeInOut {
                    0% { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
                    20% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
                    80% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                    100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 2000);
    }
    
    gameOver() {
        this.gameRunning = false;
        
        // Overlay de game over
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 10000;
            color: ${this.colors.verde};
            font-family: Arial, sans-serif;
        `;
        
        overlay.innerHTML = `
            <div style="text-align: center; background: ${this.colors.azul}; padding: 30px; border-radius: 15px; border: 3px solid ${this.colors.azulVivido};">
                <h2 style="margin: 0 0 20px 0; color: ${this.colors.verde}; font-size: 2em;">🎮 GAME OVER!</h2>
                <p style="margin: 10px 0; font-size: 1.2em;">Pontuação: <strong>${this.score}</strong></p>
                <p style="margin: 10px 0; font-size: 1.2em;">Linhas: <strong>${this.lines}</strong></p>
                <p style="margin: 10px 0; font-size: 1.2em;">Nível: <strong>${this.level}</strong></p>
                <button onclick="cieloTetris.restart(); this.parentElement.parentElement.remove();" 
                        style="margin-top: 20px; padding: 15px 30px; background: ${this.colors.verde}; color: ${this.colors.preto}; border: none; border-radius: 8px; font-size: 16px; font-weight: bold; cursor: pointer;">
                    🔄 Jogar Novamente
                </button>
                <button onclick="this.parentElement.parentElement.remove();" 
                        style="margin: 20px 0 0 15px; padding: 15px 30px; background: ${this.colors.rosa}; color: white; border: none; border-radius: 8px; font-size: 16px; font-weight: bold; cursor: pointer;">
                    ❌ Fechar
                </button>
            </div>
        `;
        
        document.body.appendChild(overlay);
    }
    
    restart() {
        this.score = 0;
        this.level = 1;
        this.lines = 0;
        this.dropTime = 0;
        this.dropInterval = 1000;
        this.initBoard();
        this.spawnPiece();
    }
    
    update(deltaTime) {
        if (!this.gameRunning) return;
        
        this.dropTime += deltaTime;
        
        if (this.dropTime >= this.dropInterval) {
            if (!this.movePiece(0, 1)) {
                this.placePiece();
            }
            this.dropTime = 0;
        }
    }
    
    draw() {
        // Limpar canvas
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
        this.ctx.fillRect(0, 0, this.gameWidth, this.gameHeight);
        
        // Desenhar grade
        this.drawGrid();
        
        // Desenhar peças no tabuleiro
        this.drawBoard();
        
        // Desenhar peça atual
        if (this.currentPiece) {
            this.drawPiece(this.currentPiece);
        }
        
        // Desenhar HUD
        this.drawHUD();
    }
    
    drawGrid() {
        this.ctx.strokeStyle = 'rgba(0, 175, 238, 0.2)';
        this.ctx.lineWidth = 1;
        
        // Linhas verticais
        for (let c = 0; c <= this.cols; c++) {
            this.ctx.beginPath();
            this.ctx.moveTo(c * this.blockSize, 0);
            this.ctx.lineTo(c * this.blockSize, this.gameHeight);
            this.ctx.stroke();
        }
        
        // Linhas horizontais
        for (let r = 0; r <= this.rows; r++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, r * this.blockSize);
            this.ctx.lineTo(this.gameWidth, r * this.blockSize);
            this.ctx.stroke();
        }
    }
    
    drawBoard() {
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                if (this.board[r][c]) {
                    this.drawBlock(c, r, this.board[r][c].color, this.board[r][c].emoji);
                }
            }
        }
    }
    
    drawPiece(piece) {
        for (let r = 0; r < piece.shape.length; r++) {
            for (let c = 0; c < piece.shape[r].length; c++) {
                if (piece.shape[r][c]) {
                    this.drawBlock(piece.x + c, piece.y + r, piece.color, piece.emoji);
                }
            }
        }
    }
    
    drawBlock(x, y, color, emoji) {
        const pixelX = x * this.blockSize;
        const pixelY = y * this.blockSize;
        
        // Fundo do bloco
        this.ctx.fillStyle = color;
        this.ctx.fillRect(pixelX + 1, pixelY + 1, this.blockSize - 2, this.blockSize - 2);
        
        // Borda com gradiente
        const gradient = this.ctx.createLinearGradient(pixelX, pixelY, pixelX + this.blockSize, pixelY + this.blockSize);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.3)');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(pixelX + 1, pixelY + 1, this.blockSize - 2, this.blockSize - 2);
        
        // Emoji no centro
        this.ctx.font = `${this.blockSize * 0.6}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillText(
            emoji, 
            pixelX + this.blockSize / 2, 
            pixelY + this.blockSize / 2
        );
    }
    
    drawHUD() {
        // Fundo do HUD
        this.ctx.fillStyle = 'rgba(3, 31, 95, 0.8)';
        this.ctx.fillRect(this.gameWidth - 100, 10, 90, 120);
        
        // Textos do HUD
        this.ctx.font = '12px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillStyle = this.colors.verde;
        
        this.ctx.fillText('SCORE', this.gameWidth - 95, 30);
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillText(this.score.toString(), this.gameWidth - 95, 45);
        
        this.ctx.fillStyle = this.colors.verde;
        this.ctx.fillText('LINHAS', this.gameWidth - 95, 65);
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillText(this.lines.toString(), this.gameWidth - 95, 80);
        
        this.ctx.fillStyle = this.colors.verde;
        this.ctx.fillText('NÍVEL', this.gameWidth - 95, 100);
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillText(this.level.toString(), this.gameWidth - 95, 115);
    }
    
    gameLoop(currentTime = 0) {
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        this.update(deltaTime);
        this.draw();
        
        requestAnimationFrame((time) => this.gameLoop(time));
    }
    
    destroy() {
        if (this.canvas) {
            this.canvas.remove();
        }
        this.gameRunning = false;
    }
}

// Instância global do jogo
let cieloTetris = null;

// Função para iniciar o jogo
function startCieloTetris() {
    if (cieloTetris) {
        cieloTetris.destroy();
    }
    cieloTetris = new CieloTetris();
}

// Função para parar o jogo
function stopCieloTetris() {
    if (cieloTetris) {
        cieloTetris.destroy();
        cieloTetris = null;
    }
}

// Auto-iniciar quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        startCieloTetris();
        
        // Mostrar instruções
        setTimeout(() => {
            if (cieloTetris && cieloTetris.gameRunning) {
                showTetrisInstructions();
            }
        }, 2000);
    }, 3000);
});

function showTetrisInstructions() {
    const instructions = document.createElement('div');
    instructions.style.cssText = `
        position: fixed;
        top: 20px;
        left: 20px;
        background: rgba(3, 31, 95, 0.95);
        color: #ccff00;
        padding: 20px;
        border-radius: 15px;
        border: 2px solid #00afee;
        z-index: 1000;
        font-family: Arial, sans-serif;
        font-size: 14px;
        max-width: 300px;
        box-shadow: 0 10px 30px rgba(0, 175, 238, 0.3);
    `;
    
    instructions.innerHTML = `
        <h3 style="margin: 0 0 15px 0; color: #ccff00;">🎮 CIELO TETRIS</h3>
        <p><strong>Controles:</strong></p>
        <p>⬅️➡️ Mover<br>
        ⬇️ Acelerar<br>
        ⬆️/Espaço Girar<br>
        🖱️ Clique para girar</p>
        <p><strong>Peças:</strong><br>
        💳 Cartões • 💻 Maquininhas<br>
        🏢 Logo • ⚡ PIX • 💰 Dinheiro</p>
        <button onclick="this.parentElement.remove();" 
                style="margin-top: 15px; padding: 8px 15px; background: #ccff00; color: #000; border: none; border-radius: 5px; cursor: pointer; font-weight: bold;">
            ✅ Entendi!
        </button>
    `;
    
    document.body.appendChild(instructions);
    
    // Auto-remover após 10 segundos
    setTimeout(() => {
        if (instructions.parentElement) {
            instructions.remove();
        }
    }, 10000);
}

// Exportar para uso global
window.startCieloTetris = startCieloTetris;
window.stopCieloTetris = stopCieloTetris;