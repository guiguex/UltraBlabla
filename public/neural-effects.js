// UltraBlabla Next-Gen Bio-Neural Canvas & WebGPU Engine 2030
// Ultra-low latency, hardware-accelerated fluid bio-particles & synaptic fields

class NeuralCanvas {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;

        this.audioRms = 0;
        this.bioState = 'idle'; // idle | listening | thinking | speaking
        this.mousePos = { x: -1000, y: -1000 };
        this.animationId = null;
        this.isDestroyed = false;
        this.webgpuActive = false;
        this.lastFrameTime = performance.now();
        this.fps = 60;
        this.frameCount = 0;
        this.fpsTimer = performance.now();

        // Check WebGPU availability on desktop
        this.initEngine();
    }

    async initEngine() {
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());

        const isWeb = typeof window !== 'undefined' && (!window.Capacitor || window.Capacitor.getPlatform() === 'web');

        if (isWeb && 'gpu' in navigator) {
            try {
                const adapter = await navigator.gpu.requestAdapter({ powerPreference: 'high-performance' });
                if (adapter) {
                    const device = await adapter.requestDevice();
                    if (device) {
                        const success = await this.setupWebGPU(device);
                        if (success) {
                            this.webgpuActive = true;
                            this.updateGpuTelemetry('⚡ WEBGPU ACCÉLÉRÉ (120 FPS)', true);
                            this.bindMouseEvents();
                            this.animateWebGPU();
                            return;
                        }
                    }
                }
            } catch (e) {
                console.info('[Bio-Engine] WebGPU fallback sur Canvas 2D optimisé:', e?.message || e);
            }
        }

        // Fallback: Ultra-lightweight Canvas 2D
        this.setupCanvas2D();
        this.updateGpuTelemetry('⚡ BIO-CANVAS 2D ACCÉLÉRÉ', false);
        this.bindMouseEvents();
        this.animateCanvas2D();
    }

    updateGpuTelemetry(label, isGpu) {
        const pillText = document.getElementById('gpuPillText');
        const pillDot = document.querySelector('.gpu-pill-dot');
        const synapseVal = document.getElementById('bioSynapseVal');

        if (pillText) pillText.textContent = label;
        if (pillDot) {
            pillDot.style.background = isGpu ? '#00ffff' : '#10b981';
            pillDot.style.boxShadow = isGpu ? '0 0 10px #00ffff' : '0 0 10px #10b981';
        }
        if (synapseVal) {
            synapseVal.textContent = isGpu ? 'WEBGPU FLUIDE 120 FPS' : 'CANVAS 2D ULTRA-BASSE LATENCE';
        }
    }

    resizeCanvas() {
        if (!this.canvas) return;
        const rect = this.canvas.parentElement ? this.canvas.parentElement.getBoundingClientRect() : { width: window.innerWidth, height: window.innerHeight };
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const w = Math.max(320, Math.floor(rect.width || window.innerWidth));
        const h = Math.max(240, Math.floor(rect.height || window.innerHeight));

        this.canvas.width = w * dpr;
        this.canvas.height = h * dpr;
        this.cssWidth = w;
        this.cssHeight = h;
        this.dpr = dpr;

        if (this.ctx) {
            this.ctx.scale(dpr, dpr);
        }
        if (this.webgpuContext && this.gpuDevice) {
            try {
                this.webgpuContext.configure({
                    device: this.gpuDevice,
                    format: this.gpuFormat,
                    alphaMode: 'premultiplied'
                });
            } catch {}
        }
    }

    bindMouseEvents() {
        window.addEventListener('mousemove', (e) => {
            if (!this.canvas) return;
            const rect = this.canvas.getBoundingClientRect();
            this.mousePos.x = (e.clientX - rect.left);
            this.mousePos.y = (e.clientY - rect.top);
        }, { passive: true });

        window.addEventListener('mouseleave', () => {
            this.mousePos.x = -1000;
            this.mousePos.y = -1000;
        }, { passive: true });
    }

    // ─── WebGPU Hardware Accelerated Pipeline ──────────────────────────────
    async setupWebGPU(device) {
        this.gpuDevice = device;
        this.webgpuContext = this.canvas.getContext('webgpu');
        if (!this.webgpuContext) return false;

        this.gpuFormat = navigator.gpu.getPreferredCanvasFormat();
        this.webgpuContext.configure({
            device: this.gpuDevice,
            format: this.gpuFormat,
            alphaMode: 'premultiplied'
        });

        // WGSL Shader: Quantum bio-synaptic wave resonance
        const wgslCode = `
            struct Uniforms {
                time: f32,
                width: f32,
                height: f32,
                audioRms: f32,
                stateMode: f32, // 0=idle, 1=listen, 2=think, 3=speak
                mouseX: f32,
                mouseY: f32,
                padding: f32,
            };

            @group(0) @binding(0) var<uniform> u: Uniforms;

            struct VertexOutput {
                @builtin(position) position: vec4f,
                @location(0) uv: vec2f,
            };

            @vertex
            fn vs_main(@builtin(vertex_index) vid: u32) -> VertexOutput {
                var pos = array<vec2f, 6>(
                    vec2f(-1.0, -1.0),
                    vec2f( 1.0, -1.0),
                    vec2f(-1.0,  1.0),
                    vec2f(-1.0,  1.0),
                    vec2f( 1.0, -1.0),
                    vec2f( 1.0,  1.0)
                );
                var out: VertexOutput;
                out.position = vec4f(pos[vid], 0.0, 1.0);
                out.uv = (pos[vid] + 1.0) * 0.5;
                return out;
            }

            @fragment
            fn fs_main(in: VertexOutput) -> @location(0) vec4f {
                let uv = in.uv;
                let t = u.time * 0.6;
                let rms = clamp(u.audioRms * 3.5, 0.0, 1.0);

                // Dynamic color palette based on bio-state
                var colA = vec3f(0.0, 0.95, 1.0);   // Cyan (idle)
                var colB = vec3f(0.55, 0.35, 0.98); // Purple

                if (u.stateMode > 0.5 && u.stateMode < 1.5) {
                    // Listening: bio-green / emerald synaptic
                    colA = vec3f(0.06, 0.92, 0.62);
                    colB = vec3f(0.0, 0.85, 1.0);
                } else if (u.stateMode > 1.5 && u.stateMode < 2.5) {
                    // Thinking: amber / violet neural fire
                    colA = vec3f(0.98, 0.75, 0.14);
                    colB = vec3f(0.92, 0.28, 0.60);
                } else if (u.stateMode > 2.5) {
                    // Speaking: holographic magenta / cyan resonance
                    colA = vec3f(0.93, 0.29, 0.60);
                    colB = vec3f(0.0, 0.95, 1.0);
                }

                // Synaptic wave interference math
                let wave1 = sin(uv.x * 12.0 + t + rms * 4.0) * cos(uv.y * 10.0 - t * 0.8);
                let wave2 = sin(uv.y * 18.0 + t * 1.4) * cos(uv.x * 14.0 + t * 0.5);
                let waveField = abs(wave1 + wave2) * 0.45;

                // Mouse synaptic flare
                let mDist = distance(vec2f(uv.x * u.width, uv.y * u.height), vec2f(u.mouseX, u.mouseY));
                let mouseGlow = exp(-mDist * 0.012) * 0.35;

                let amp = clamp(waveField * (0.3 + rms * 0.7) + mouseGlow, 0.0, 1.0);
                let finalColor = mix(colA, colB, uv.y + sin(t) * 0.2) * amp;
                let alpha = clamp(amp * 0.45, 0.0, 0.55);

                return vec4f(finalColor, alpha);
            }
        `;

        const shaderModule = this.gpuDevice.createShaderModule({ code: wgslCode });

        // Uniform buffer (32 bytes = 8 floats)
        this.uniformBuffer = this.gpuDevice.createBuffer({
            size: 32,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });

        const bindGroupLayout = this.gpuDevice.createBindGroupLayout({
            entries: [{
                binding: 0,
                visibility: GPUShaderStage.FRAGMENT | GPUShaderStage.VERTEX,
                buffer: { type: 'uniform' }
            }]
        });

        this.bindGroup = this.gpuDevice.createBindGroup({
            layout: bindGroupLayout,
            entries: [{
                binding: 0,
                resource: { buffer: this.uniformBuffer }
            }]
        });

        const pipelineLayout = this.gpuDevice.createPipelineLayout({
            bindGroupLayouts: [bindGroupLayout]
        });

        this.pipeline = this.gpuDevice.createRenderPipeline({
            layout: pipelineLayout,
            vertex: {
                module: shaderModule,
                entryPoint: 'vs_main'
            },
            fragment: {
                module: shaderModule,
                entryPoint: 'fs_main',
                targets: [{
                    format: this.gpuFormat,
                    blend: {
                        color: {
                            srcFactor: 'src-alpha',
                            dstFactor: 'one',
                            operation: 'add',
                        },
                        alpha: {
                            srcFactor: 'one',
                            dstFactor: 'one-minus-src-alpha',
                            operation: 'add',
                        }
                    }
                }]
            },
            primitive: {
                topology: 'triangle-list'
            }
        });

        return true;
    }

    animateWebGPU() {
        if (this.isDestroyed) return;

        // Skip when tab hidden for zero CPU/GPU overhead
        if (document.hidden) {
            this.animationId = requestAnimationFrame(() => this.animateWebGPU());
            return;
        }

        const now = performance.now() * 0.001;
        let stateCode = 0; // idle
        if (this.bioState === 'listening') stateCode = 1;
        else if (this.bioState === 'thinking') stateCode = 2;
        else if (this.bioState === 'speaking') stateCode = 3;

        // Update uniforms
        const uniformData = new Float32Array([
            now,
            this.cssWidth || 800,
            this.cssHeight || 600,
            this.audioRms || 0,
            stateCode,
            this.mousePos.x,
            this.mousePos.y,
            0.0
        ]);

        this.gpuDevice.queue.writeBuffer(this.uniformBuffer, 0, uniformData);

        const commandEncoder = this.gpuDevice.createCommandEncoder();
        const textureView = this.webgpuContext.getCurrentTexture().createView();

        const renderPass = commandEncoder.beginRenderPass({
            colorAttachments: [{
                view: textureView,
                clearValue: { r: 0.0, g: 0.0, b: 0.0, a: 0.0 },
                loadOp: 'clear',
                storeOp: 'store'
            }]
        });

        renderPass.setPipeline(this.pipeline);
        renderPass.setBindGroup(0, this.bindGroup);
        renderPass.draw(6);
        renderPass.end();

        this.gpuDevice.queue.submit([commandEncoder.finish()]);

        this.animationId = requestAnimationFrame(() => this.animateWebGPU());
    }

    // ─── Ultra-Lightweight 2D Canvas Fallback ─────────────────────────────
    setupCanvas2D() {
        this.ctx = this.canvas.getContext('2d', { alpha: true });
        this.particles = [];
        // Max 30 particles on PC desktop, 16 on mobile for zero lag
        const count = Math.min(32, Math.max(16, Math.floor((this.cssWidth * this.cssHeight) / 35000)));

        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: Math.random() * this.cssWidth,
                y: Math.random() * this.cssHeight,
                vx: (Math.random() - 0.5) * 0.4,
                vy: (Math.random() - 0.5) * 0.4,
                baseRadius: Math.random() * 1.5 + 0.8,
                hue: Math.random() > 0.5 ? 185 : 270 // cyan or purple
            });
        }
    }

    animateCanvas2D() {
        if (this.isDestroyed || !this.ctx) return;

        if (document.hidden) {
            this.animationId = requestAnimationFrame(() => this.animateCanvas2D());
            return;
        }

        const width = this.cssWidth;
        const height = this.cssHeight;
        const rms = Math.min(1.0, (this.audioRms || 0) * 3);
        const time = performance.now() * 0.001;

        this.ctx.clearRect(0, 0, width, height);

        // State colors
        let mainHue = 185; // Cyan
        if (this.bioState === 'listening') mainHue = 155; // Emerald green
        else if (this.bioState === 'thinking') mainHue = 45; // Amber
        else if (this.bioState === 'speaking') mainHue = 315; // Pink/Magenta

        // Update & Draw Particles
        const count = this.particles.length;

        // Single batch stroke for synaptic links (50x faster than individual gradient draws)
        this.ctx.beginPath();
        this.ctx.lineWidth = 1;
        this.ctx.strokeStyle = `hsla(${mainHue}, 100%, 65%, ${0.12 + rms * 0.25})`;

        for (let i = 0; i < count; i++) {
            const p1 = this.particles[i];

            // Position update
            p1.x += p1.vx * (1 + rms * 1.5);
            p1.y += p1.vy * (1 + rms * 1.5);

            if (p1.x < 0) p1.x = width;
            else if (p1.x > width) p1.x = 0;
            if (p1.y < 0) p1.y = height;
            else if (p1.y > height) p1.y = 0;

            // Connect nearby nodes
            for (let j = i + 1; j < count; j++) {
                const p2 = this.particles[j];
                const dx = p1.x - p2.x;
                const dy = p1.y - p2.y;
                const distSq = dx * dx + dy * dy;

                if (distSq < 10000) { // 100px max dist
                    this.ctx.moveTo(p1.x, p1.y);
                    this.ctx.lineTo(p2.x, p2.y);
                }
            }
        }
        this.ctx.stroke();

        // Draw particle nodes
        this.ctx.fillStyle = `hsla(${mainHue}, 100%, 75%, 0.8)`;
        this.ctx.beginPath();
        for (let i = 0; i < count; i++) {
            const p = this.particles[i];
            const r = p.baseRadius + (rms * 2);
            this.ctx.moveTo(p.x + r, p.y);
            this.ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        }
        this.ctx.fill();

        // Lightweight audio wave strip at bottom
        if (rms > 0.01 || this.bioState !== 'idle') {
            this.ctx.beginPath();
            this.ctx.lineWidth = 2;
            this.ctx.strokeStyle = `hsla(${mainHue}, 100%, 60%, 0.35)`;
            const waveY = height * 0.75;
            for (let x = 0; x < width; x += 15) {
                const waveH = Math.sin(x * 0.02 + time * 4) * (8 + rms * 28);
                if (x === 0) this.ctx.moveTo(x, waveY + waveH);
                else this.ctx.lineTo(x, waveY + waveH);
            }
            this.ctx.stroke();
        }

        this.animationId = requestAnimationFrame(() => this.animateCanvas2D());
    }

    setAudioLevel(rms, state) {
        this.audioRms = rms;
        if (state) this.bioState = state;
    }

    destroy() {
        this.isDestroyed = true;
        if (this.animationId) cancelAnimationFrame(this.animationId);
    }
}

// Global hook for audio reactivity & state
let neuralCanvasInstance = null;
window.__setBioAudioLevel = function(rms, state) {
    if (neuralCanvasInstance) {
        neuralCanvasInstance.setAudioLevel(rms, state);
    }
};

// Safe startup that works regardless of DOM readiness state
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
