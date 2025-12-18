// 意境调节器 - 双圆盘日夜晴雨控制器
class MoodController {
    constructor() {
        this.timeRing = document.getElementById('timeRing');
        this.weatherRing = document.getElementById('weatherRing');
        this.currentMood = document.getElementById('currentMood');
        this.canvas = document.getElementById('artisticBackground');
        this.ctx = this.canvas.getContext('2d');
        
        // 意境状态
        this.state = {
            time: 0.5,      // 0-1: 深夜到正午
            weather: 1,     // 1:晴, 2:多云, 3:雨, 4:雪
            isDragging: false,
            activeRing: null,
            startAngle: 0
        };
        
        // 意境映射
        this.timeMap = {
            0: { name: '深夜', color: '#1a1a2e', light: 0.2, hue: 240 },
            0.25: { name: '黎明', color: '#4a4a8c', light: 0.4, hue: 280 },
            0.5: { name: '清晨', color: '#87ceeb', light: 0.7, hue: 200 },
            0.75: { name: '正午', color: '#f0f8ff', light: 1.0, hue: 180 },
            1: { name: '黄昏', color: '#ff7e5f', light: 0.6, hue: 20 }
        };
        
        this.weatherMap = {
            1: { name: '晴', icon: '☀️', particle: 'sunbeam', blur: 0, saturation: 1.2 },
            2: { name: '多云', icon: '☁️', particle: 'cloud', blur: 2, saturation: 0.8 },
            3: { name: '雨', icon: '🌧️', particle: 'rain', blur: 5, saturation: 0.7 },
            4: { name: '雪', icon: '❄️', particle: 'snow', blur: 3, saturation: 0.9 }
        };
        
        this.particles = [];
        this.init();
    }
    
    init() {
        this.setupCanvas();
        this.setupEventListeners();
        this.updateMoodDisplay();
        this.animate();
    }
    
    setupCanvas() {
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    }
    
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    setupEventListeners() {
        // 圆盘拖拽事件
        this.timeRing.addEventListener('mousedown', (e) => this.startDrag(e, 'time'));
        this.weatherRing.addEventListener('mousedown', (e) => this.startDrag(e, 'weather'));
        
        document.addEventListener('mousemove', (e) => this.handleDrag(e));
        document.addEventListener('mouseup', () => this.stopDrag());
        
        // 触摸事件支持
        this.timeRing.addEventListener('touchstart', (e) => this.startDrag(e, 'time'));
        this.weatherRing.addEventListener('touchstart', (e) => this.startDrag(e, 'weather'));
        document.addEventListener('touchmove', (e) => this.handleDrag(e));
        document.addEventListener('touchend', () => this.stopDrag());
        
        // 点击标记点快速切换
        document.querySelectorAll('.marker-dot').forEach(dot => {
            dot.addEventListener('click', (e) => {
                e.stopPropagation();
                const time = e.target.dataset.time;
                this.setTimeByMarker(time);
            });
        });
        
        document.querySelectorAll('.weather-icon i').forEach(icon => {
            icon.addEventListener('click', (e) => {
                e.stopPropagation();
                const weather = e.target.dataset.weather;
                this.setWeatherByIcon(weather);
            });
        });
    }
    
    startDrag(e, ringType) {
        e.preventDefault();
        this.state.isDragging = true;
        this.state.activeRing = ringType;
        
        const rect = e.currentTarget.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const clientX = e.clientX || e.touches[0].clientX;
        const clientY = e.clientY || e.touches[0].clientY;
        
        this.state.startAngle = Math.atan2(clientY - centerY, clientX - centerX);
    }
    
    handleDrag(e) {
        if (!this.state.isDragging || !this.state.activeRing) return;
        
        e.preventDefault();
        
        const ring = this.state.activeRing === 'time' ? this.timeRing : this.weatherRing;
        const rect = ring.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const clientX = e.clientX || e.touches[0].clientX;
        const clientY = e.clientY || e.touches[0].clientY;
        
        const currentAngle = Math.atan2(clientY - centerY, clientX - centerX);
        const angleDiff = currentAngle - this.state.startAngle;
        
        if (this.state.activeRing === 'time') {
            // 外环：时间控制
            this.state.time = (this.state.time + angleDiff / (2 * Math.PI)) % 1;
            if (this.state.time < 0) this.state.time += 1;
        } else {
            // 内环：天气控制
            this.state.weather = Math.max(1, Math.min(4, 
                this.state.weather + Math.round(angleDiff / (Math.PI / 2))
            ));
        }
        
        this.updateMoodDisplay();
        this.updateCSSVariables();
        this.generateParticles();
    }
    
    stopDrag() {
        this.state.isDragging = false;
        this.state.activeRing = null;
    }
    
    setTimeByMarker(marker) {
        const timeMap = {
            'dawn': 0.25,
            'noon': 0.75,
            'dusk': 0.9,
            'night': 0
        };
        
        if (timeMap[marker] !== undefined) {
            this.state.time = timeMap[marker];
            this.updateMoodDisplay();
            this.updateCSSVariables();
            this.generateParticles();
        }
    }
    
    setWeatherByIcon(weather) {
        const weatherMap = {
            'clear': 1,
            'cloudy': 2,
            'rain': 3,
            'snow': 4
        };
        
        if (weatherMap[weather] !== undefined) {
            this.state.weather = weatherMap[weather];
            this.updateMoodDisplay();
            this.updateCSSVariables();
            this.generateParticles();
        }
    }
    
    updateMoodDisplay() {
        const time = this.getNearestTime(this.state.time);
        const weather = this.weatherMap[this.state.weather];
        
        const timeName = this.timeMap[time].name;
        const weatherName = weather.name;
        
        this.currentMood.textContent = `意境：${timeName}·${weatherName}`;
        
        // 更新标记点状态
        document.querySelectorAll('.marker-dot').forEach(dot => {
            const dotTime = dot.dataset.time;
            const isActive = Math.abs(this.state.time - (this.getTimeValue(dotTime) || 0)) < 0.1;
            dot.classList.toggle('active', isActive);
        });
        
        // 更新天气图标状态
        document.querySelectorAll('.weather-icon i').forEach(icon => {
            const iconWeather = icon.dataset.weather;
            const isActive = this.state.weather === this.getWeatherValue(iconWeather);
            icon.classList.toggle('active', isActive);
        });
    }
    
    updateCSSVariables() {
        const time = this.getNearestTime(this.state.time);
        const weather = this.weatherMap[this.state.weather];
        
        const timeData = this.timeMap[time];
        const weatherData = weather;
        
        // 计算中间值
        const lightness = timeData.light;
        const hue = timeData.hue;
        const saturation = weatherData.saturation;
        const blur = weatherData.blur;
        
        // 更新CSS变量
        document.documentElement.style.setProperty('--意境亮度', lightness);
        document.documentElement.style.setProperty('--意境饱和度', saturation);
        document.documentElement.style.setProperty('--意境对比度', 1 + (1 - lightness) * 0.5);
        document.documentElement.style.setProperty('--意境色调-旋转', `${hue}deg`);
        document.documentElement.style.setProperty('--意境模糊', `${blur}px`);
        
        // 更新日夜和天气变量
        document.documentElement.style.setProperty('--time-of-day', this.state.time);
        document.documentElement.style.setProperty('--weather-type', this.state.weather);
    }
    
    generateParticles() {
        const weather = this.weatherMap[this.state.weather];
        const particleType = weather.particle;
        
        this.particles = [];
        
        switch(particleType) {
            case 'sunbeam':
                this.createSunbeams();
                break;
            case 'cloud':
                this.createClouds();
                break;
            case 'rain':
                this.createRain();
                break;
            case 'snow':
                this.createSnow();
                break;
        }
    }
    
    createSunbeams() {
        for (let i = 0; i < 5; i++) {
            this.particles.push({
                type: 'sunbeam',
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                length: 100 + Math.random() * 200,
                angle: Math.random() * Math.PI * 2,
                speed: 0.5 + Math.random() * 0.5,
                opacity: 0.1 + Math.random() * 0.2
            });
        }
    }
    
    createClouds() {
        for (let i = 0; i < 3; i++) {
            this.particles.push({
                type: 'cloud',
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height * 0.3,
                size: 100 + Math.random() * 150,
                speed: 0.1 + Math.random() * 0.2,
                density: 0.3 + Math.random() * 0.4
            });
        }
    }
    
    createRain() {
        for (let i = 0; i < 50; i++) {
            this.particles.push({
                type: 'rain',
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                length: 10 + Math.random() * 20,
                speed: 2 + Math.random() * 3,
                angle: Math.PI / 4
            });
        }
    }
    
    createSnow() {
        for (let i = 0; i < 30; i++) {
            this.particles.push({
                type: 'snow',
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: 2 + Math.random() * 4,
                speed: 0.5 + Math.random() * 1,
                sway: 0.5 + Math.random() * 1
            });
        }
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        // 清空画布
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制背景渐变
        this.drawBackground();
        
        // 更新和绘制粒子
        this.particles.forEach((particle, index) => {
            this.updateParticle(particle);
            this.drawParticle(particle);
            
            // 移除屏幕外的粒子
            if (particle.y > this.canvas.height + 100 || 
                particle.x < -100 || 
                particle.x > this.canvas.width + 100) {
                this.particles.splice(index, 1);
            }
        });
        
        // 补充新粒子
        if (this.particles.length < this.getTargetParticleCount()) {
            this.generateParticles();
        }
    }
    
    drawBackground() {
        // 根据时间创建渐变背景
        const time = this.getNearestTime(this.state.time);
        const timeData = this.timeMap[time];
        
        const gradient = this.ctx.createLinearGradient(
            0, 0, 
            this.canvas.width, this.canvas.height
        );
        
        gradient.addColorStop(0, timeData.color);
        gradient.addColorStop(1, this.lightenColor(timeData.color, 0.3));
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 添加纹理
        this.drawTexture();
    }
    
    drawTexture() {
        const time = this.state.time;
        const weather = this.state.weather;
        
        // "孙悟空"元素：飘逸的线条
        if (weather === 1 || weather === 4) { // 晴或雪天显示
            this.ctx.strokeStyle = `rgba(255, 255, 255, ${0.1 * time})`;
            this.ctx.lineWidth = 1;
            
            for (let i = 0; i < 5; i++) {
                this.ctx.beginPath();
                const startX = Math.random() * this.canvas.width;
                const startY = Math.random() * this.canvas.height * 0.5;
                
                this.ctx.moveTo(startX, startY);
                
                // 创建飘逸曲线
                for (let j = 0; j < 10; j++) {
                    const cpX = startX + Math.sin(j) * 50;
                    const cpY = startY + j * 20 + Math.cos(j) * 30;
                    const endX = startX + Math.sin(j + 1) * 50;
                    const endY = startY + (j + 1) * 20 + Math.cos(j + 1) * 30;
                    
                    this.ctx.quadraticCurveTo(cpX, cpY, endX, endY);
                }
                
                this.ctx.stroke();
            }
        }
        
        // "海带"元素：波浪形背景
        this.ctx.strokeStyle = `rgba(255, 255, 255, ${0.05 + 0.05 * time})`;
        this.ctx.lineWidth = 2;
        
        for (let i = 0; i < 3; i++) {
            this.ctx.beginPath();
            const amplitude = 30 + i * 20;
            const frequency = 0.01 + i * 0.005;
            const yOffset = 200 + i * 100;
            
            for (let x = 0; x < this.canvas.width; x += 10) {
                const y = yOffset + Math.sin(x * frequency + Date.now() * 0.001) * amplitude;
                
                if (x === 0) {
                    this.ctx.moveTo(x, y);
                } else {
                    this.ctx.lineTo(x, y);
                }
            }
            
            this.ctx.stroke();
        }
        
        // "踩点式"元素：节奏性点阵
        this.ctx.fillStyle = `rgba(255, 255, 255, ${0.1 * time})`;
        
        for (let i = 0; i < 20; i++) {
            for (let j = 0; j < 10; j++) {
                const x = (i / 20) * this.canvas.width + Math.sin(Date.now() * 0.001 + j) * 10;
                const y = (j / 10) * this.canvas.height + Math.cos(Date.now() * 0.001 + i) * 10;
                const radius = 2 + Math.sin(Date.now() * 0.002 + i + j) * 1.5;
                
                this.ctx.beginPath();
                this.ctx.arc(x, y, radius, 0, Math.PI * 2);
                this.ctx.fill();
            }
        }
    }
    
    updateParticle(particle) {
        switch(particle.type) {
            case 'sunbeam':
                particle.angle += 0.01;
                break;
            case 'cloud':
                particle.x += particle.speed;
                if (particle.x > this.canvas.width + particle.size) {
                    particle.x = -particle.size;
                }
                break;
            case 'rain':
                particle.x += Math.cos(particle.angle) * particle.speed;
                particle.y += Math.sin(particle.angle) * particle.speed;
                
                if (particle.y > this.canvas.height) {
                    particle.y = -particle.length;
                    particle.x = Math.random() * this.canvas.width;
                }
                break;
            case 'snow':
                particle.x += Math.sin(Date.now() * 0.001 + particle.sway) * 0.5;
                particle.y += particle.speed;
                
                if (particle.y > this.canvas.height) {
                    particle.y = -particle.size;
                    particle.x = Math.random() * this.canvas.width;
                }
                break;
        }
    }
    
    drawParticle(particle) {
        this.ctx.save();
        
        switch(particle.type) {
            case 'sunbeam':
                this.ctx.strokeStyle = `rgba(255, 255, 200, ${particle.opacity})`;
                this.ctx.lineWidth = 2;
                this.ctx.lineCap = 'round';
                
                this.ctx.beginPath();
                this.ctx.moveTo(particle.x, particle.y);
                this.ctx.lineTo(
                    particle.x + Math.cos(particle.angle) * particle.length,
                    particle.y + Math.sin(particle.angle) * particle.length
                );
                this.ctx.stroke();
                break;
                
            case 'cloud':
                this.ctx.fillStyle = `rgba(255, 255, 255, ${particle.density})`;
                
                this.ctx.beginPath();
                this.ctx.arc(particle.x, particle.y, particle.size * 0.5, 0, Math.PI * 2);
                this.ctx.arc(particle.x + particle.size * 0.3, particle.y - particle.size * 0.2, 
                           particle.size * 0.4, 0, Math.PI * 2);
                this.ctx.arc(particle.x - particle.size * 0.3, particle.y - particle.size * 0.2, 
                           particle.size * 0.4, 0, Math.PI * 2);
                this.ctx.fill();
                break;
                
            case 'rain':
                this.ctx.strokeStyle = `rgba(150, 200, 255, 0.6)`;
                this.ctx.lineWidth = 1;
                this.ctx.lineCap = 'round';
                
                this.ctx.beginPath();
                this.ctx.moveTo(particle.x, particle.y);
                this.ctx.lineTo(
                    particle.x + Math.cos(particle.angle) * particle.length,
                    particle.y + Math.sin(particle.angle) * particle.length
                );
                this.ctx.stroke();
                break;
                
            case 'snow':
                this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                
                this.ctx.beginPath();
                this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                this.ctx.fill();
                break;
        }
        
        this.ctx.restore();
    }
    
    getTargetParticleCount() {
        const weather = this.weatherMap[this.state.weather];
        switch(weather.particle) {
            case 'sunbeam': return 5;
            case 'cloud': return 3;
            case 'rain': return 50;
            case 'snow': return 30;
            default: return 0;
        }
    }
    
    getNearestTime(value) {
        const times = Object.keys(this.timeMap).map(Number).sort((a, b) => a - b);
        let nearest = times[0];
        
        for (const time of times) {
            if (Math.abs(time - value) < Math.abs(nearest - value)) {
                nearest = time;
            }
        }
        
        return nearest;
    }
    
    getTimeValue(marker) {
        const map = { dawn: 0.25, noon: 0.75, dusk: 0.9, night: 0 };
        return map[marker];
    }
    
    getWeatherValue(weather) {
        const map = { clear: 1, cloudy: 2, rain: 3, snow: 4 };
        return map[weather];
    }
    
    lightenColor(color, factor) {
        // 简化版本的颜色变亮函数
        return color;
    }
}

// 初始化意境调节器
document.addEventListener('DOMContentLoaded', () => {
    const moodController = new MoodController();
    window.moodController = moodController; // 暴露到全局
});
