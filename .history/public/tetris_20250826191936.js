// 🎨 CIELO BACKGROUND ANIMATION - Peças flutuantes temáticas!
class CieloBackgroundAnimation {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.pieces = [];
        this.particles = [];
        this.mouseX = 0;
        this.mouseY = 0;
        this.isMouseMoving = false;
        this.lastMouseMove = 0;
        
        // Cores temáticas da Cielo - MAIS VIVAS E CONTRASTANTES
        this.colors = {
            azul: '#031f5f',
            azulVivido: '#00afee',
            verde: '#ccff00',
            rosa: '#ca00ca',
            marrom: '#c2af00',
            preto: '#000000',
            branco: '#ffffff',
            dourado: '#ffd700',
            laranja: '#ff6600',
            roxo: '#8a2be2'
        };
        
        // Peças temáticas da Cielo - MAIS VARIADAS E COLORIDAS
        this.pieceTypes = [
            {
                name: 'Cartão Premium',
                emoji: '💳',
                color: this.colors.dourado,
                shapes: [
                    [[1, 1, 1, 1, 1]], // Linha horizontal longa
                    [[1], [1], [1], [1], [1]] // Linha vertical longa
                ]
            },
            {
                name: 'Cartão Clássico',
                emoji: '💳',
                color: this.colors.azul,
                shapes: [
                    [[1, 1, 1, 1]], // Linha horizontal
                    [[1], [1], [1], [1]] // Linha vertical
                ]
            },
            {
                name: 'Maquininha Pro',
                emoji: '💻',
                color: this.colors.azulVivido,
                shapes: [
                    [[1, 1], [1, 1]], // Quadrado
                    [[1, 1, 1], [1, 1, 1]] // Retângulo 3x2
                ]
            },
            {
                name: 'Logo Cielo',
                emoji: '🏢',
                color: this.colors.verde,
                shapes: [
                    [[0, 1, 0], [1, 1, 1]], // T
                    [[1, 0, 0], [1, 1, 1]] // L
                ]
            },
            {
                name: 'PIX Turbo',
                emoji: '⚡',
                color: this.colors.rosa,
                shapes: [
                    [[1, 0, 0], [1, 1, 1]], // L
                    [[0, 1, 1], [1, 1, 0]] // S
                ]
            },
            {
                name: 'Dinheiro VIP',
                emoji: '💰',
                color: this.colors.dourado,
                shapes: [
                    [[0, 1, 1], [1, 1, 0]], // S
                    [[1, 1, 0], [0, 1, 1]] // Z
                ]
            },
            {
                name: 'Terminal Elite',
                emoji: '🖥️',
                color: this.colors.laranja,
                shapes: [
                    [[1], [1], [1], [1], [1]] // Linha vertical longa
                ]
            },
            {
                name: 'Chip Seguro',
                emoji: '🔒',
                color: this.colors.roxo,
                shapes: [
                    [[1, 1], [1, 1]], // Quadrado pequeno
                    [[1, 1, 1], [0, 1, 0]] // T invertido
                ]
            }
        ];
        
        this.init();
    }
    
    init() {
        this.createCanvas();
        this.createPieces();
        this.createParticles();
        this.addEventListeners();
        this.animate();
    }
    
    createCanvas() {
        // Remover canvas existente se houver
        const existingCanvas = document.getElementById('cieloBackground');
        if (existingCanvas) {
            existingCanvas.remove();
        }
        
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'cieloBackground';
        this.canvas.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: -1;
            pointer-events: none;
            opacity: 0.8;
            transition: opacity 0.5s ease;
        `;
        
        document.body.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');
        
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // Hover effect para mostrar/esconder
        document.addEventListener('mouseenter', () => {
            this.canvas.style.opacity = '0.95';
        });
        
        document.addEventListener('mouseleave', () => {
            this.canvas.style.opacity = '0.8';
        });
    }
    
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    createPieces() {
        this.pieces = [];
        const numPieces = Math.floor(window.innerWidth / 150); // MAIS PEÇAS - uma a cada 150px
        
        for (let i = 0; i < numPieces; i++) {
            const pieceType = this.pieceTypes[Math.floor(Math.random() * this.pieceTypes.length)];
            const shape = pieceType.shapes[Math.floor(Math.random() * pieceType.shapes.length)];
            
            this.pieces.push({
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight - 100,
                vx: (Math.random() - 0.5) * 0.8, // Velocidade horizontal MAIOR
                vy: Math.random() * 0.8 + 0.3, // Velocidade vertical MAIOR
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.04, // Rotação MAIS RÁPIDA
                scale: Math.random() * 0.8 + 0.6, // Escala MAIOR
                shape: shape,
                color: pieceType.color,
                emoji: pieceType.emoji,
                name: pieceType.name,
                opacity: Math.random() * 0.6 + 0.4, // Opacidade MAIOR
                wobble: Math.random() * Math.PI * 2,
                wobbleSpeed: Math.random() * 0.03 + 0.02, // Wobble MAIS RÁPIDO
                glow: Math.random() * 0.5 + 0.5 // Efeito de brilho
            });
        }
    }
    
    createParticles() {
        this.particles = [];
        const numParticles = 80; // MAIS PARTÍCULAS
        
        for (let i = 0; i < numParticles; i++) {
            this.particles.push({
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                size: Math.random() * 4 + 2, // Partículas MAIORES
                color: this.colors.azulVivido,
                opacity: Math.random() * 0.7 + 0.3, // Opacidade MAIOR
                life: Math.random() * 150 + 100, // Vida MAIOR
                pulse: Math.random() * Math.PI * 2 // Efeito de pulso
            });
        }
    }
    
    addEventListeners() {
        // Mouse tracking para interatividade
        document.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
            this.isMouseMoving = true;
            this.lastMouseMove = Date.now();
            
            // Criar partículas de rastro MAIS FREQUENTES
            if (Math.random() < 0.6) {
                this.createMouseTrail();
            }
        });
        
        // Click para criar explosão de partículas MAIOR
        document.addEventListener('click', (e) => {
            this.createClickExplosion(e.clientX, e.clientY);
        });
        
        // Scroll para efeito parallax
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            this.pieces.forEach(piece => {
                piece.y += window.scrollY * 0.01;
                if (piece.y > window.innerHeight + 100) {
                    piece.y = -100;
                }
            });
            
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                this.isMouseMoving = false;
            }, 100);
        });
    }
    
    createMouseTrail() {
        this.particles.push({
            x: this.mouseX + (Math.random() - 0.5) * 30,
            y: this.mouseY + (Math.random() - 0.5) * 30,
            vx: (Math.random() - 0.5) * 3,
            vy: (Math.random() - 0.5) * 3,
            size: Math.random() * 3 + 2,
            color: this.colors.verde,
            opacity: 0.9,
            life: 40,
            pulse: 0
        });
    }
    
    createClickExplosion(x, y) {
        const colors = [this.colors.verde, this.colors.rosa, this.colors.azulVivido, this.colors.dourado];
        
        for (let i = 0; i < 25; i++) { // MAIS PARTÍCULAS
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 12, // Velocidade MAIOR
                vy: (Math.random() - 0.5) * 12,
                size: Math.random() * 6 + 3, // Tamanho MAIOR
                color: colors[Math.floor(Math.random() * colors.length)],
                opacity: 1,
                life: 80, // Vida MAIOR
                pulse: Math.random() * Math.PI * 2
            });
        }
    }
    
    updatePieces() {
        this.pieces.forEach(piece => {
            // Movimento
            piece.x += piece.vx;
            piece.y += piece.vy;
            piece.rotation += piece.rotationSpeed;
            piece.wobble += piece.wobbleSpeed;
            
            // Bounce nas bordas
            if (piece.x < -80 || piece.x > window.innerWidth + 80) {
                piece.vx *= -1;
            }
            
            if (piece.y > window.innerHeight + 150) {
                piece.y = -150;
                piece.x = Math.random() * window.innerWidth;
            }
            
            // Interação com mouse MAIS FORTE
            if (this.isMouseMoving && Date.now() - this.lastMouseMove < 1500) {
                const dx = piece.x - this.mouseX;
                const dy = piece.y - this.mouseY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 200) { // Raio MAIOR
                    const force = (200 - distance) / 200;
                    piece.vx += (dx / distance) * force * 0.15;
                    piece.vy += (dy / distance) * force * 0.15;
                }
            }
            
            // Limitar velocidade
            piece.vx = Math.max(-3, Math.min(3, piece.vx));
            piece.vy = Math.max(-3, Math.min(3, piece.vy));
        });
    }
    
    updateParticles() {
        this.particles.forEach((particle, index) => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life--;
            particle.pulse += 0.1;
            particle.opacity = (particle.life / 100) * 0.8 + 0.2;
            
            // Remover partículas mortas
            if (particle.life <= 0) {
                this.particles.splice(index, 1);
            }
            
            // Bounce nas bordas
            if (particle.x < 0 || particle.x > window.innerWidth) {
                particle.vx *= -0.8;
            }
            if (particle.y < 0 || particle.y > window.innerHeight) {
                particle.vy *= -0.8;
            }
        });
        
        // Adicionar novas partículas se necessário
        if (this.particles.length < 50) {
            this.particles.push({
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                vx: (Math.random() - 0.5) * 0.8,
                vy: (Math.random() - 0.5) * 0.8,
                size: Math.random() * 3 + 2,
                color: this.colors.azulVivido,
                opacity: Math.random() * 0.5 + 0.3,
                life: Math.random() * 150 + 100,
                pulse: Math.random() * Math.PI * 2
            });
        }
    }
    
    drawPieces() {
        this.pieces.forEach(piece => {
            this.ctx.save();
            this.ctx.translate(piece.x, piece.y);
            this.ctx.rotate(piece.rotation);
            this.ctx.scale(piece.scale, piece.scale);
            
            // Efeito de wobble MAIS PRONUNCIADO
            const wobbleOffset = Math.sin(piece.wobble) * 4;
            this.ctx.translate(wobbleOffset, 0);
            
            // Desenhar forma da peça
            this.drawPieceShape(piece);
            
            this.ctx.restore();
        });
    }
    
    drawPieceShape(piece) {
        const blockSize = 12; // BLOCO MAIOR
        const offsetX = -(piece.shape[0].length * blockSize) / 2;
        const offsetY = -(piece.shape.length * blockSize) / 2;
        
        // Sombra MAIS PRONUNCIADA
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(offsetX + 4, offsetY + 4, piece.shape[0].length * blockSize, piece.shape.length * blockSize);
        
        // Fundo da peça
        this.ctx.fillStyle = piece.color;
        this.ctx.fillRect(offsetX, offsetY, piece.shape[0].length * blockSize, piece.shape.length * blockSize);
        
        // Borda BRILHANTE
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(offsetX, offsetY, piece.shape[0].length * blockSize, piece.shape.length * blockSize);
        
        // Efeito de brilho interno
        const gradient = this.ctx.createLinearGradient(offsetX, offsetY, offsetX + piece.shape[0].length * blockSize, offsetY + piece.shape.length * blockSize);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
        gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.1)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.2)');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(offsetX + 2, offsetY + 2, piece.shape[0].length * blockSize - 4, piece.shape.length * blockSize - 4);
        
        // Emoji no centro MAIOR
        this.ctx.font = `${blockSize * 0.9}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillStyle = 'rgba(255, 255, 255, 1)';
        this.ctx.fillText(
            piece.emoji,
            offsetX + (piece.shape[0].length * blockSize) / 2,
            offsetY + (piece.shape.length * blockSize) / 2
        );
        
        // Efeito de brilho ao redor
        if (piece.glow > 0.3) {
            this.ctx.shadowColor = piece.color;
            this.ctx.shadowBlur = 15;
            this.ctx.strokeRect(offsetX - 2, offsetY - 2, piece.shape[0].length * blockSize + 4, piece.shape.length * blockSize + 4);
            this.ctx.shadowBlur = 0;
        }
    }
    
    drawParticles() {
        this.particles.forEach(particle => {
            this.ctx.save();
            this.ctx.globalAlpha = particle.opacity;
            
            // Efeito de pulso
            const pulseSize = particle.size + Math.sin(particle.pulse) * 2;
            
            // Gradiente para partículas MAIS ELABORADO
            const gradient = this.ctx.createRadialGradient(
                particle.x, particle.y, 0,
                particle.x, particle.y, pulseSize
            );
            gradient.addColorStop(0, particle.color);
            gradient.addColorStop(0.7, particle.color);
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, pulseSize, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Brilho interno
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            this.ctx.beginPath();
            this.ctx.arc(particle.x - pulseSize * 0.3, particle.y - pulseSize * 0.3, pulseSize * 0.3, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.restore();
        });
    }
    
    drawGrid() {
        // Grade MAIS VISÍVEL
        this.ctx.strokeStyle = 'rgba(0, 175, 238, 0.15)';
        this.ctx.lineWidth = 1;
        
        const gridSize = 40; // Grade MAIS DENSAS
        for (let x = 0; x < window.innerWidth; x += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, window.innerHeight);
            this.ctx.stroke();
        }
        
        for (let y = 0; y < window.innerHeight; y += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(window.innerWidth, y);
            this.ctx.stroke();
        }
    }
    
    draw() {
        // Limpar canvas
        this.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        
        // Desenhar grade de fundo
        this.drawGrid();
        
        // Desenhar partículas
        this.drawParticles();
        
        // Desenhar peças
        this.drawPieces();
        
        // Efeito de brilho no mouse MAIS PRONUNCIADO
        if (this.isMouseMoving && Date.now() - this.lastMouseMove < 800) {
            const gradient = this.ctx.createRadialGradient(
                this.mouseX, this.mouseY, 0,
                this.mouseX, this.mouseY, 150
            );
            gradient.addColorStop(0, 'rgba(204, 255, 0, 0.2)');
            gradient.addColorStop(0.5, 'rgba(204, 255, 0, 0.1)');
            gradient.addColorStop(1, 'rgba(204, 255, 0, 0)');
            
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
        }
    }
    
    animate() {
        this.updatePieces();
        this.updateParticles();
        this.draw();
        
        requestAnimationFrame(() => this.animate());
    }
    
    destroy() {
        if (this.canvas) {
            this.canvas.remove();
        }
    }
}

// Instância global da animação
let cieloBackground = null;

// Função para iniciar a animação
function startCieloBackground() {
    if (cieloBackground) {
        cieloBackground.destroy();
    }
    cieloBackground = new CieloBackgroundAnimation();
}

// Função para parar a animação
function stopCieloBackground() {
    if (cieloBackground) {
        cieloBackground.destroy();
        cieloBackground = null;
    }
}

// Auto-iniciar quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        startCieloBackground();
    }, 1000);
});

// Exportar para uso global
window.startCieloBackground = startCieloBackground;
window.stopCieloBackground = stopCieloBackground;