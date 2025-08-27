// 🎨 CIELO BACKGROUND ANIMATION - Peças flutuantes temáticas!
class CieloBackgroundAnimation {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.pieces = [];
        this.particles = [];
        this.banners = [];
        this.mouseX = 0;
        this.mouseY = 0;
        this.isMouseMoving = false;
        this.lastMouseMove = 0;
        this.time = 0;
        
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
            roxo: '#8a2be2',
            ciano: '#00ffff',
            magenta: '#ff00ff'
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
            },
            {
                name: 'Cripto',
                emoji: '₿',
                color: this.colors.ciano,
                shapes: [
                    [[1, 1, 1], [1, 0, 1], [1, 1, 1]] // Quadrado com buraco
                ]
            },
            {
                name: 'Investimento',
                emoji: '📈',
                color: this.colors.magenta,
                shapes: [
                    [[0, 0, 1], [0, 1, 1], [1, 1, 1]] // Triângulo crescente
                ]
            }
        ];
        
        this.init();
    }
    
    init() {
        this.createCanvas();
        this.createPieces();
        this.createParticles();
        this.createBanners();
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
            width: 100vw;
            height: 100vh;
            z-index: -1;
            pointer-events: none;
            opacity: 1;
            transition: opacity 0.5s ease;
        `;
        
        document.body.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');
        
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // Hover effect para mostrar/esconder
        document.addEventListener('mouseenter', () => {
            this.canvas.style.opacity = '0.98';
        });
        
        document.addEventListener('mouseleave', () => {
            this.canvas.style.opacity = '0.9';
        });
    }
    
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    createPieces() {
        this.pieces = [];
        const numPieces = Math.floor(window.innerWidth / 120); // AINDA MAIS PEÇAS
        
        for (let i = 0; i < numPieces; i++) {
            const pieceType = this.pieceTypes[Math.floor(Math.random() * this.pieceTypes.length)];
            const shape = pieceType.shapes[Math.floor(Math.random() * pieceType.shapes.length)];
            
            this.pieces.push({
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight - 100,
                vx: (Math.random() - 0.5) * 1.2, // Velocidade AINDA MAIOR
                vy: Math.random() * 1.2 + 0.4, // Velocidade vertical AINDA MAIOR
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.06, // Rotação AINDA MAIS RÁPIDA
                scale: Math.random() * 0.9 + 0.7, // Escala AINDA MAIOR
                shape: shape,
                color: pieceType.color,
                emoji: pieceType.emoji,
                name: pieceType.name,
                opacity: Math.random() * 0.7 + 0.5, // Opacidade AINDA MAIOR
                wobble: Math.random() * Math.PI * 2,
                wobbleSpeed: Math.random() * 0.04 + 0.03, // Wobble AINDA MAIS RÁPIDO
                glow: Math.random() * 0.6 + 0.4, // Efeito de brilho MAIOR
                pulse: Math.random() * Math.PI * 2, // Efeito de pulso
                pulseSpeed: Math.random() * 0.05 + 0.03 // Velocidade do pulso
            });
        }
    }
    
    createParticles() {
        this.particles = [];
        const numParticles = 120; // AINDA MAIS PARTÍCULAS
        
        for (let i = 0; i < numParticles; i++) {
            this.particles.push({
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                vx: (Math.random() - 0.5) * 0.8,
                vy: (Math.random() - 0.5) * 0.8,
                size: Math.random() * 5 + 3, // Partículas AINDA MAIORES
                color: this.colors.azulVivido,
                opacity: Math.random() * 0.8 + 0.4, // Opacidade AINDA MAIOR
                life: Math.random() * 200 + 150, // Vida AINDA MAIOR
                pulse: Math.random() * Math.PI * 2, // Efeito de pulso
                trail: [] // Rastro da partícula
            });
        }
    }
    
    createBanners() {
        this.banners = [];
        const bannerTexts = [
            '💳 CARTÕES PREMIUM',
            '⚡ PIX INSTANTÂNEO',
            '💻 MAQUININHAS PRO',
            '🏢 SOLUÇÕES CIELO',
            '💰 INVESTIMENTOS',
            '🔒 SEGURANÇA TOTAL',
            '📈 CRESCIMENTO',
            '🌐 TECNOLOGIA'
        ];
        
        for (let i = 0; i < 6; i++) {
            this.banners.push({
                x: Math.random() * (window.innerWidth - 200),
                y: Math.random() * (window.innerHeight - 100),
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                text: bannerTexts[Math.floor(Math.random() * bannerTexts.length)],
                color: this.colors.verde,
                opacity: Math.random() * 0.4 + 0.3,
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.02,
                scale: Math.random() * 0.3 + 0.7,
                pulse: Math.random() * Math.PI * 2,
                pulseSpeed: Math.random() * 0.03 + 0.02
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
            if (Math.random() < 0.8) {
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
            
            this.banners.forEach(banner => {
                banner.y += window.scrollY * 0.005;
                if (banner.y > window.innerHeight + 50) {
                    banner.y = -50;
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
            x: this.mouseX + (Math.random() - 0.5) * 40,
            y: this.mouseY + (Math.random() - 0.5) * 40,
            vx: (Math.random() - 0.5) * 4,
            vy: (Math.random() - 0.5) * 4,
            size: Math.random() * 4 + 3,
            color: this.colors.verde,
            opacity: 0.95,
            life: 50,
            pulse: 0,
            trail: []
        });
    }
    
    createClickExplosion(x, y) {
        const colors = [this.colors.verde, this.colors.rosa, this.colors.azulVivido, this.colors.dourado, this.colors.ciano];
        
        for (let i = 0; i < 35; i++) { // AINDA MAIS PARTÍCULAS
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 15, // Velocidade AINDA MAIOR
                vy: (Math.random() - 0.5) * 15,
                size: Math.random() * 8 + 4, // Tamanho AINDA MAIOR
                color: colors[Math.floor(Math.random() * colors.length)],
                opacity: 1,
                life: 100, // Vida AINDA MAIOR
                pulse: Math.random() * Math.PI * 2,
                trail: []
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
            piece.pulse += piece.pulseSpeed;
            
            // Bounce nas bordas
            if (piece.x < -100 || piece.x > window.innerWidth + 100) {
                piece.vx *= -1;
            }
            
            if (piece.y > window.innerHeight + 200) {
                piece.y = -200;
                piece.x = Math.random() * window.innerWidth;
            }
            
            // Interação com mouse AINDA MAIS FORTE
            if (this.isMouseMoving && Date.now() - this.lastMouseMove < 2000) {
                const dx = piece.x - this.mouseX;
                const dy = piece.y - this.mouseY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 250) { // Raio AINDA MAIOR
                    const force = (250 - distance) / 250;
                    piece.vx += (dx / distance) * force * 0.2;
                    piece.vy += (dy / distance) * force * 0.2;
                }
            }
            
            // Limitar velocidade
            piece.vx = Math.max(-4, Math.min(4, piece.vx));
            piece.vy = Math.max(-4, Math.min(4, piece.vy));
        });
    }
    
    updateParticles() {
        this.particles.forEach((particle, index) => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life--;
            particle.pulse += 0.15;
            particle.opacity = (particle.life / 100) * 0.9 + 0.3;
            
            // Adicionar posição ao rastro
            particle.trail.push({ x: particle.x, y: particle.y, opacity: particle.opacity });
            if (particle.trail.length > 8) {
                particle.trail.shift();
            }
            
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
        if (this.particles.length < 80) {
            this.particles.push({
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                vx: (Math.random() - 0.5) * 1.2,
                vy: (Math.random() - 0.5) * 1.2,
                size: Math.random() * 4 + 3,
                color: this.colors.azulVivido,
                opacity: Math.random() * 0.6 + 0.4,
                life: Math.random() * 200 + 150,
                pulse: Math.random() * Math.PI * 2,
                trail: []
            });
        }
    }
    
    updateBanners() {
        this.banners.forEach(banner => {
            // Movimento
            banner.x += banner.vx;
            banner.y += banner.vy;
            banner.rotation += banner.rotationSpeed;
            banner.pulse += banner.pulseSpeed;
            
            // Bounce nas bordas
            if (banner.x < -150 || banner.x > window.innerWidth + 150) {
                banner.vx *= -1;
            }
            if (banner.y < -50 || banner.y > window.innerHeight + 50) {
                banner.vy *= -1;
            }
            
            // Interação com mouse
            if (this.isMouseMoving && Date.now() - this.lastMouseMove < 1500) {
                const dx = banner.x - this.mouseX;
                const dy = banner.y - this.mouseY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 180) {
                    const force = (180 - distance) / 180;
                    banner.vx += (dx / distance) * force * 0.1;
                    banner.vy += (dy / distance) * force * 0.1;
                }
            }
        });
    }
    
    drawPieces() {
        this.pieces.forEach(piece => {
            this.ctx.save();
            this.ctx.translate(piece.x, piece.y);
            this.ctx.rotate(piece.rotation);
            this.ctx.scale(piece.scale, piece.scale);
            
            // Efeito de wobble MAIS PRONUNCIADO
            const wobbleOffset = Math.sin(piece.wobble) * 6;
            this.ctx.translate(wobbleOffset, 0);
            
            // Efeito de pulso
            const pulseScale = 1 + Math.sin(piece.pulse) * 0.1;
            this.ctx.scale(pulseScale, pulseScale);
            
            // Desenhar forma da peça
            this.drawPieceShape(piece);
            
            this.ctx.restore();
        });
    }
    
    drawPieceShape(piece) {
        const blockSize = 14; // BLOCO AINDA MAIOR
        const offsetX = -(piece.shape[0].length * blockSize) / 2;
        const offsetY = -(piece.shape.length * blockSize) / 2;
        
        // Sombra MAIS PRONUNCIADA
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        this.ctx.fillRect(offsetX + 5, offsetY + 5, piece.shape[0].length * blockSize, piece.shape.length * blockSize);
        
        // Fundo da peça
        this.ctx.fillStyle = piece.color;
        this.ctx.fillRect(offsetX, offsetY, piece.shape[0].length * blockSize, piece.shape.length * blockSize);
        
        // Borda BRILHANTE
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(offsetX, offsetY, piece.shape[0].length * blockSize, piece.shape.length * blockSize);
        
        // Efeito de brilho interno
        const gradient = this.ctx.createLinearGradient(offsetX, offsetY, offsetX + piece.shape[0].length * blockSize, offsetY + piece.shape.length * blockSize);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
        gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.2)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.3)');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(offsetX + 3, offsetY + 3, piece.shape[0].length * blockSize - 6, piece.shape.length * blockSize - 6);
        
        // Emoji no centro AINDA MAIOR
        this.ctx.font = `${blockSize * 1.0}px Arial`;
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
            this.ctx.shadowBlur = 20;
            this.ctx.strokeRect(offsetX - 3, offsetY - 3, piece.shape[0].length * blockSize + 6, piece.shape.length * blockSize + 6);
            this.ctx.shadowBlur = 0;
        }
    }
    
    drawParticles() {
        this.particles.forEach(particle => {
            this.ctx.save();
            
            // Desenhar rastro
            particle.trail.forEach((trailPoint, index) => {
                const trailOpacity = (index / particle.trail.length) * particle.opacity * 0.5;
                this.ctx.globalAlpha = trailOpacity;
                
                const trailSize = particle.size * (index / particle.trail.length);
                const gradient = this.ctx.createRadialGradient(
                    trailPoint.x, trailPoint.y, 0,
                    trailPoint.x, trailPoint.y, trailSize
                );
                gradient.addColorStop(0, particle.color);
                gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
                
                this.ctx.fillStyle = gradient;
                this.ctx.beginPath();
                this.ctx.arc(trailPoint.x, trailPoint.y, trailSize, 0, Math.PI * 2);
                this.ctx.fill();
            });
            
            // Desenhar partícula principal
            this.ctx.globalAlpha = particle.opacity;
            
            // Efeito de pulso
            const pulseSize = particle.size + Math.sin(particle.pulse) * 3;
            
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
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            this.ctx.beginPath();
            this.ctx.arc(particle.x - pulseSize * 0.3, particle.y - pulseSize * 0.3, pulseSize * 0.3, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.restore();
        });
    }
    
    drawBanners() {
        this.banners.forEach(banner => {
            this.ctx.save();
            this.ctx.translate(banner.x, banner.y);
            this.ctx.rotate(banner.rotation);
            this.ctx.scale(banner.scale, banner.scale);
            
            // Efeito de pulso
            const pulseScale = 1 + Math.sin(banner.pulse) * 0.05;
            this.ctx.scale(pulseScale, pulseScale);
            
            // Sombra do banner
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
            this.ctx.fillRect(3, 3, 200, 40);
            
            // Fundo do banner
            const bannerGradient = this.ctx.createLinearGradient(0, 0, 200, 0);
            bannerGradient.addColorStop(0, banner.color);
            bannerGradient.addColorStop(1, this.colors.azulVivido);
            
            this.ctx.fillStyle = bannerGradient;
            this.ctx.fillRect(0, 0, 200, 40);
            
            // Borda do banner
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(0, 0, 200, 40);
            
            // Texto do banner
            this.ctx.font = 'bold 12px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
            this.ctx.fillText(banner.text, 100, 20);
            
            // Efeito de brilho
            this.ctx.shadowColor = banner.color;
            this.ctx.shadowBlur = 15;
            this.ctx.strokeRect(-2, -2, 204, 44);
            this.ctx.shadowBlur = 0;
            
            this.ctx.restore();
        });
    }
    
    drawGrid() {
        // Grade MAIS VISÍVEL
        this.ctx.strokeStyle = 'rgba(0, 175, 238, 0.2)';
        this.ctx.lineWidth = 1;
        
        const gridSize = 35; // Grade AINDA MAIS DENSAS
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
        
        // Desenhar banners
        this.drawBanners();
        
        // Efeito de brilho no mouse MAIS PRONUNCIADO
        if (this.isMouseMoving && Date.now() - this.lastMouseMove < 1000) {
            const gradient = this.ctx.createRadialGradient(
                this.mouseX, this.mouseY, 0,
                this.mouseX, this.mouseY, 200
            );
            gradient.addColorStop(0, 'rgba(204, 255, 0, 0.3)');
            gradient.addColorStop(0.5, 'rgba(204, 255, 0, 0.15)');
            gradient.addColorStop(1, 'rgba(204, 255, 0, 0)');
            
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
        }
    }
    
    animate() {
        this.time += 16; // 60 FPS aproximado
        
        this.updatePieces();
        this.updateParticles();
        this.updateBanners();
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