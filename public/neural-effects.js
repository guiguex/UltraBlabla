// Neural Canvas Effects - Ultra Modern 2030
// Quantum particle system and holographic effects

class NeuralCanvas {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.connections = [];
        this.mousePos = { x: 0, y: 0 };
        this.animationId = null;
        
        this.setupCanvas();
        this.createParticles();
        this.bindEvents();
        this.animate();
    }
    
    setupCanvas() {
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    }
    
    resizeCanvas() {
        const rect = this.canvas.parentElement.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
    }
    
    createParticles() {
        const particleCount = Math.min(80, Math.floor(this.canvas.width * this.canvas.height / 15000));
        this.particles = [];
        
        for (let i = 0; i < particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                size: Math.random() * 2 + 0.5,
                opacity: Math.random() * 0.8 + 0.2,
                color: this.getRandomColor(),
                pulsePhase: Math.random() * Math.PI * 2,
                connectionRange: 120 + Math.random() * 80
            });
        }
    }
    
    getRandomColor() {
        const colors = [
            'rgba(0, 255, 255, ', // Cyan
            'rgba(139, 92, 246, ', // Purple  
            'rgba(236, 72, 153, ', // Pink
            'rgba(16, 185, 129, ', // Green
            'rgba(59, 130, 246, '  // Blue
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    bindEvents() {
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mousePos.x = e.clientX - rect.left;
            this.mousePos.y = e.clientY - rect.top;
        });
        
        this.canvas.addEventListener('mouseleave', () => {
            this.mousePos.x = -1000;
            this.mousePos.y = -1000;
        });
    }
    
    updateParticles() {
        this.particles.forEach(particle => {
            // Mouse interaction
            const dx = this.mousePos.x - particle.x;
            const dy = this.mousePos.y - particle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 150) {
                const force = (150 - distance) / 150;
                particle.vx += (dx / distance) * force * 0.02;
                particle.vy += (dy / distance) * force * 0.02;
            }
            
            // Update position
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            // Boundary bounce
            if (particle.x < 0 || particle.x > this.canvas.width) {
                particle.vx *= -0.8;
                particle.x = Math.max(0, Math.min(this.canvas.width, particle.x));
            }
            if (particle.y < 0 || particle.y > this.canvas.height) {
                particle.vy *= -0.8;
                particle.y = Math.max(0, Math.min(this.canvas.height, particle.y));
            }
            
            // Velocity dampening
            particle.vx *= 0.99;
            particle.vy *= 0.99;
            
            // Pulse animation avec validation
            particle.pulsePhase = (particle.pulsePhase || 0) + 0.05;
            particle.currentSize = Math.max(0.1, particle.size + Math.sin(particle.pulsePhase) * 0.5);
            particle.currentOpacity = Math.max(0, Math.min(1, particle.opacity + Math.sin(particle.pulsePhase * 0.7) * 0.2));
        });
    }
    
    drawParticles() {
        this.particles.forEach(particle => {
            // Validation des valeurs pour éviter les erreurs non-finite
            if (!isFinite(particle.x) || !isFinite(particle.y) || 
                !isFinite(particle.currentSize) || particle.currentSize <= 0) {
                return; // Skip cette particule si les valeurs sont invalides
            }
            
            this.ctx.save();
            
            // Particle glow avec validation
            const radius = Math.max(1, particle.currentSize * 8);
            const gradient = this.ctx.createRadialGradient(
                particle.x, particle.y, 0,
                particle.x, particle.y, radius
            );
            gradient.addColorStop(0, particle.color + particle.currentOpacity + ')');
            gradient.addColorStop(0.4, particle.color + (particle.currentOpacity * 0.4) + ')');
            gradient.addColorStop(1, particle.color + '0)');
            
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.currentSize * 8, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Particle core
            this.ctx.fillStyle = particle.color + particle.currentOpacity + ')';
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.currentSize, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.restore();
        });
    }
    
    drawConnections() {
        this.particles.forEach((particle, i) => {
            for (let j = i + 1; j < this.particles.length; j++) {
                const other = this.particles[j];
                const dx = particle.x - other.x;
                const dy = particle.y - other.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < Math.min(particle.connectionRange, other.connectionRange)) {
                    const opacity = (1 - distance / particle.connectionRange) * 0.3;
                    
                    // Connection line
                    this.ctx.save();
                    this.ctx.strokeStyle = `rgba(0, 255, 255, ${opacity})`;
                    this.ctx.lineWidth = 1;
                    this.ctx.beginPath();
                    this.ctx.moveTo(particle.x, particle.y);
                    this.ctx.lineTo(other.x, other.y);
                    this.ctx.stroke();
                    
                    // Connection pulse
                    const pulsePos = 0.5 + Math.sin(Date.now() * 0.003) * 0.3;
                    const pulseX = particle.x + (other.x - particle.x) * pulsePos;
                    const pulseY = particle.y + (other.y - particle.y) * pulsePos;
                    
                    const gradient = this.ctx.createRadialGradient(
                        pulseX, pulseY, 0,
                        pulseX, pulseY, 6
                    );
                    gradient.addColorStop(0, `rgba(0, 255, 255, ${opacity * 2})`);
                    gradient.addColorStop(1, 'rgba(0, 255, 255, 0)');
                    
                    this.ctx.fillStyle = gradient;
                    this.ctx.beginPath();
                    this.ctx.arc(pulseX, pulseY, 6, 0, Math.PI * 2);
                    this.ctx.fill();
                    
                    this.ctx.restore();
                }
            }
        });
    }
    
    drawQuantumWaves() {
        const time = Date.now() * 0.001;
        this.ctx.save();
        
        // Wave 1
        this.ctx.strokeStyle = 'rgba(139, 92, 246, 0.2)';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        
        for (let x = 0; x <= this.canvas.width; x += 5) {
            const y = this.canvas.height / 2 + 
                     Math.sin(x * 0.01 + time) * 30 +
                     Math.sin(x * 0.02 + time * 1.5) * 15;
            
            if (x === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        }
        this.ctx.stroke();
        
        // Wave 2
        this.ctx.strokeStyle = 'rgba(236, 72, 153, 0.15)';
        this.ctx.beginPath();
        
        for (let x = 0; x <= this.canvas.width; x += 5) {
            const y = this.canvas.height / 3 + 
                     Math.sin(x * 0.015 + time * 0.8) * 25 +
                     Math.sin(x * 0.025 + time * 2) * 10;
            
            if (x === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        }
        this.ctx.stroke();
        
        this.ctx.restore();
    }
    
    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.drawQuantumWaves();
        this.drawConnections();
        this.updateParticles();
        this.drawParticles();
        
        this.animationId = requestAnimationFrame(() => this.animate());
    }
    
    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        window.removeEventListener('resize', this.resizeCanvas);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize neural canvas
    const neuralCanvas = new NeuralCanvas('neural-canvas');
    
    // Add quantum scanning effect to buttons
    const recordBtn = document.getElementById('recordBtn');
    const clearBtn = document.getElementById('clearBtn');
    
    if (recordBtn) {
        recordBtn.addEventListener('mouseenter', () => {
            recordBtn.style.filter = 'hue-rotate(30deg) brightness(1.2)';
        });
        
        recordBtn.addEventListener('mouseleave', () => {
            recordBtn.style.filter = 'none';
        });
    }
    
    // Add typing effect to status text
    const statusText = document.querySelector('.status-text');
    if (statusText) {
        const messages = [
            'NEURAL LINK INITIALIZING...',
            'QUANTUM PROCESSORS ONLINE...',
            'VOICE MATRIX CALIBRATED...',
            'AI SYSTEMS READY...',
            'NEURAL INTERFACE ACTIVE'
        ];
        
        let messageIndex = 0;
        let charIndex = 0;
        let currentMessage = '';
        
        const typeMessage = () => {
            if (charIndex < messages[messageIndex].length) {
                currentMessage += messages[messageIndex][charIndex];
                statusText.textContent = currentMessage;
                charIndex++;
                setTimeout(typeMessage, 50);
            } else {
                setTimeout(() => {
                    messageIndex = (messageIndex + 1) % messages.length;
                    charIndex = 0;
                    currentMessage = '';
                    setTimeout(typeMessage, 1000);
                }, 2000);
            }
        };
        
        setTimeout(typeMessage, 1000);
    }
    
    // Quantum particles for tech specs
    const techSpecs = document.querySelectorAll('.spec-item');
    techSpecs.forEach((spec, index) => {
        spec.addEventListener('mouseenter', () => {
            spec.style.transform = 'translateY(-5px) scale(1.02)';
            spec.style.boxShadow = '0 15px 35px rgba(0, 255, 255, 0.3)';
        });
        
        spec.addEventListener('mouseleave', () => {
            spec.style.transform = 'translateY(0) scale(1)';
            spec.style.boxShadow = 'none';
        });
    });
});