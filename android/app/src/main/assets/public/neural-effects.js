// UltraBlabla - Constellation Vivante & Effets Holographiques
// Système de particules quantiques et constellation interactive

class NeuralCanvas {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;

        this.ctx = this.canvas.getContext('2d', { alpha: true });
        this.particles = [];
        this.mousePos = { x: -1000, y: -1000 };
        this.animationId = null;
        this.isDestroyed = false;
        this.audioRms = 0;
        this.bioState = 'idle';

        this.setupCanvas();
        this.createParticles();
        this.bindEvents();
        this.animate();
    }

    setupCanvas() {
        this.resizeCanvas();
        window.addEventListener('resize', () => {
            this.resizeCanvas();
            this.createParticles();
        });
    }

    resizeCanvas() {
        if (!this.canvas) return;
        const rect = this.canvas.parentElement 
            ? this.canvas.parentElement.getBoundingClientRect() 
            : { width: window.innerWidth, height: window.innerHeight };
        this.canvas.width = rect.width || window.innerWidth;
        this.canvas.height = rect.height || window.innerHeight;
    }

    createParticles() {
        const particleCount = Math.min(75, Math.max(25, Math.floor(this.canvas.width * this.canvas.height / 18000)));
        this.particles = [];

        for (let i = 0; i < particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                size: Math.random() * 2 + 0.6,
                opacity: Math.random() * 0.8 + 0.2,
                color: this.getRandomColor(),
                pulsePhase: Math.random() * Math.PI * 2,
                connectionRange: 120 + Math.random() * 80
            });
        }
    }

    getRandomColor() {
        const colors = [
            'rgba(0, 255, 255, ',    // Cyan néon
            'rgba(139, 92, 246, ',   // Violet synaptique
            'rgba(236, 72, 153, ',   // Rose néon
            'rgba(16, 185, 129, ',   // Vert émeraude
            'rgba(59, 130, 246, '    // Bleu quantique
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    bindEvents() {
        window.addEventListener('mousemove', (e) => {
            if (!this.canvas) return;
            const rect = this.canvas.getBoundingClientRect();
            this.mousePos.x = e.clientX - rect.left;
            this.mousePos.y = e.clientY - rect.top;
        }, { passive: true });

        window.addEventListener('mouseleave', () => {
            this.mousePos.x = -1000;
            this.mousePos.y = -1000;
        }, { passive: true });
    }

    updateParticles() {
        const width = this.canvas.width;
        const height = this.canvas.height;
        const rms = Math.min(1.0, (this.audioRms || 0) * 3);

        this.particles.forEach(particle => {
            // Interaction gravitationnelle avec la souris
            const dx = this.mousePos.x - particle.x;
            const dy = this.mousePos.y - particle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 160) {
                const force = (160 - distance) / 160;
                particle.vx += (dx / distance) * force * 0.03;
                particle.vy += (dy / distance) * force * 0.03;
            }

            // Déplacement avec réactivité audio subtile
            const speedBoost = 1 + rms * 1.5;
            particle.x += particle.vx * speedBoost;
            particle.y += particle.vy * speedBoost;

            // Rebond doux sur les parois
            if (particle.x < 0 || particle.x > width) {
                particle.vx *= -0.85;
                particle.x = Math.max(0, Math.min(width, particle.x));
            }
            if (particle.y < 0 || particle.y > height) {
                particle.vy *= -0.85;
                particle.y = Math.max(0, Math.min(height, particle.y));
            }

            // Amortissement de vélocité
            particle.vx *= 0.99;
            particle.vy *= 0.99;

            // Pulsation vivante de la particule
            particle.pulsePhase = (particle.pulsePhase || 0) + 0.04;
            const baseSize = particle.size + (rms * 1.8);
            particle.currentSize = Math.max(0.2, baseSize + Math.sin(particle.pulsePhase) * 0.6);
            particle.currentOpacity = Math.max(0.1, Math.min(1, particle.opacity + Math.sin(particle.pulsePhase * 0.7) * 0.25));
        });
    }

    drawParticles() {
        this.particles.forEach(particle => {
            if (!isFinite(particle.x) || !isFinite(particle.y) || 
                !isFinite(particle.currentSize) || particle.currentSize <= 0) {
                return;
            }

            this.ctx.save();

            // Lueur radiale de chaque particule
            const radius = Math.max(1, particle.currentSize * 7);
            const gradient = this.ctx.createRadialGradient(
                particle.x, particle.y, 0,
                particle.x, particle.y, radius
            );
            gradient.addColorStop(0, particle.color + particle.currentOpacity + ')');
            gradient.addColorStop(0.4, particle.color + (particle.currentOpacity * 0.4) + ')');
            gradient.addColorStop(1, particle.color + '0)');

            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, radius, 0, Math.PI * 2);
            this.ctx.fill();

            // Cœur brillant de l'étoile
            this.ctx.fillStyle = particle.color + Math.min(1, particle.currentOpacity * 1.2) + ')';
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.currentSize, 0, Math.PI * 2);
            this.ctx.fill();

            this.ctx.restore();
        });
    }

    drawConnections() {
        const timeNow = Date.now();
        const pulseAnim = 0.5 + Math.sin(timeNow * 0.003) * 0.3;

        for (let i = 0; i < this.particles.length; i++) {
            const p1 = this.particles[i];

            for (let j = i + 1; j < this.particles.length; j++) {
                const p2 = this.particles[j];
                const dx = p1.x - p2.x;
                const dy = p1.y - p2.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const maxDist = Math.min(p1.connectionRange, p2.connectionRange);

                if (distance < maxDist) {
                    const opacity = (1 - distance / maxDist) * 0.35;

                    // Ligne de connexion de constellation
                    this.ctx.save();
                    this.ctx.strokeStyle = `rgba(0, 255, 255, ${opacity})`;
                    this.ctx.lineWidth = 1;
                    this.ctx.beginPath();
                    this.ctx.moveTo(p1.x, p1.y);
                    this.ctx.lineTo(p2.x, p2.y);
                    this.ctx.stroke();

                    // Impulsion synaptique vivante qui glisse le long des liaisons
                    const pulseX = p1.x + (p2.x - p1.x) * pulseAnim;
                    const pulseY = p1.y + (p2.y - p1.y) * pulseAnim;

                    const gradient = this.ctx.createRadialGradient(
                        pulseX, pulseY, 0,
                        pulseX, pulseY, 5
                    );
                    gradient.addColorStop(0, `rgba(0, 255, 255, ${opacity * 2.2})`);
                    gradient.addColorStop(1, 'rgba(0, 255, 255, 0)');

                    this.ctx.fillStyle = gradient;
                    this.ctx.beginPath();
                    this.ctx.arc(pulseX, pulseY, 5, 0, Math.PI * 2);
                    this.ctx.fill();

                    this.ctx.restore();
                }
            }
        }
    }

    drawQuantumWaves() {
        const time = Date.now() * 0.001;
        this.ctx.save();

        // Onde 1 - Violette
        this.ctx.strokeStyle = 'rgba(139, 92, 246, 0.18)';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();

        const step = 8;
        const w = this.canvas.width;
        const h = this.canvas.height;

        for (let x = 0; x <= w; x += step) {
            const y = h * 0.5 + 
                     Math.sin(x * 0.008 + time) * 28 +
                     Math.sin(x * 0.016 + time * 1.5) * 14;

            if (x === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        }
        this.ctx.stroke();

        // Onde 2 - Rose néon
        this.ctx.strokeStyle = 'rgba(236, 72, 153, 0.14)';
        this.ctx.beginPath();

        for (let x = 0; x <= w; x += step) {
            const y = h * 0.35 + 
                     Math.sin(x * 0.012 + time * 0.8) * 22 +
                     Math.sin(x * 0.022 + time * 2) * 10;

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
        if (this.isDestroyed || !this.ctx) return;

        if (document.hidden) {
            this.animationId = requestAnimationFrame(() => this.animate());
            return;
        }

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.drawQuantumWaves();
        this.drawConnections();
        this.updateParticles();
        this.drawParticles();

        this.animationId = requestAnimationFrame(() => this.animate());
    }

    setAudioLevel(rms, state) {
        this.audioRms = rms;
        if (state) this.bioState = state;
    }

    destroy() {
        this.isDestroyed = true;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        window.removeEventListener('resize', this.resizeCanvas);
    }
}

// Hook global pour l'animation & l'audio réactivité
let neuralCanvasInstance = null;
window.__setBioAudioLevel = function(rms, state) {
    if (neuralCanvasInstance) {
        neuralCanvasInstance.setAudioLevel(rms, state);
    }
};

function bootNeuralEffects() {
    if (!neuralCanvasInstance) {
        neuralCanvasInstance = new NeuralCanvas('neural-canvas');
        window.__neuralCanvas = neuralCanvasInstance;
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootNeuralEffects);
} else {
    bootNeuralEffects();
}
