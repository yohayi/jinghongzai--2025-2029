// 动态加载案例系统
class CaseLoader {
    constructor() {
        this.casesContainer = document.getElementById('casesContainer');
        this.currentFilter = 'all';
        this.casesData = [];
    }
    
    async loadCases() {
        try {
            // 从cases文件夹加载所有案例
            const categories = [
                '载体-画布与颜料',
                '载体-数字像素', 
                '形式-抽象',
                '形式-叙事',
                '历史-文艺复兴',
                '历史-现代主义'
            ];
            
            // 模拟API调用（实际应从服务器加载）
            for (const category of categories) {
                const mockCase = await this.loadCaseFromFolder(category);
                if (mockCase) {
                    this.casesData.push(mockCase);
                }
            }
            
            this.renderCases();
            
        } catch (error) {
            console.error('加载案例失败:', error);
            this.showError();
        }
    }
    
    async loadCaseFromFolder(category) {
        // 模拟从文件夹加载
        return new Promise(resolve => {
            setTimeout(() => {
                const mockCase = {
                    id: `case-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    title: this.getCaseTitle(category),
                    category: category,
                    description: this.getCaseDescription(category),
                    tags: this.getCaseTags(category),
                    image: this.getCaseImage(category),
                    type: this.getCaseType(category),
                    date: new Date().toISOString(),
                    likes: Math.floor(Math.random() * 100),
                    views: Math.floor(Math.random() * 500)
                };
                resolve(mockCase);
            }, 300);
        });
    }
    
    renderCases() {
        if (!this.casesContainer) return;
        
        // 移除加载动画
        const loadingElement = this.casesContainer.querySelector('.loading-cases');
        if (loadingElement) {
            loadingElement.remove();
        }
        
        // 渲染案例卡片
        this.casesContainer.innerHTML = this.casesData
            .filter(caseData => this.filterCase(caseData))
            .map(caseData => this.createCaseCard(caseData))
            .join('');
        
        // 添加点击事件
        this.addCaseInteractions();
    }
    
    createCaseCard(caseData) {
        return `
            <div class="case-card" data-id="${caseData.id}" data-type="${caseData.type}">
                <div class="case-image" style="background: ${this.getGradient(caseData.category)}">
                    <div class="case-category">${caseData.category.split('-')[0]}</div>
                    <div class="case-overlay">
                        <button class="case-quickview">
                            <i class="fas fa-expand"></i>
                        </button>
                    </div>
                </div>
                <div class="case-info">
                    <h3>${caseData.title}</h3>
                    <p class="case-desc">${caseData.description}</p>
                    <div class="case-tags">
                        ${caseData.tags.map(tag => `<span class="case-tag" data-tag="${tag}">#${tag}</span>`).join('')}
                    </div>
                    <div class="case-meta">
                        <span class="case-likes"><i class="fas fa-heart"></i> ${caseData.likes}</span>
                        <span class="case-views"><i class="fas fa-eye"></i> ${caseData.views}</span>
                        <span class="case-date">${this.formatDate(caseData.date)}</span>
                    </div>
                    <div class="case-actions">
                        <button class="btn-small" onclick="window.openCase('${caseData.id}')">
                            <i class="fas fa-external-link-alt"></i> 进入案例空间
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
    
    // 工具方法
    getCaseTitle(category) {
        const titles = {
            '载体-画布与颜料': '水墨的诗意流动',
            '载体-数字像素': '数字世界的色彩爆炸',
            '形式-抽象': '解构与重组的美学',
            '形式-叙事': '故事中的视觉语言',
            '历史-文艺复兴': '人文主义的觉醒',
            '历史-现代主义': '打破传统的实验'
        };
        return titles[category] || '未被定义的意境';
    }
    
    getCaseDescription(category) {
        const descriptions = {
            '载体-画布与颜料': '传统媒介在现代语境下的重新诠释，探索材料本身的诗意。',
            '载体-数字像素': '虚拟世界中的色彩构成，像素作为最小单元构建无限可能。',
            '形式-抽象': '剥离具象，直达本质，形式本身就是内容。',
            '形式-叙事': '视觉元素编织故事，观看即是阅读。',
            '历史-文艺复兴': '从神性到人性，美的标准在觉醒中重构。',
            '历史-现代主义': '传统边界的打破，艺术进入实验与反思的时代。'
        };
        return descriptions[category] || '这里没有标准答案，只有无限可能的探索。';
    }
    
    getCaseTags(category) {
        const tagMap = {
            '载体-画布与颜料': ['水墨', '油画', '丙烯', '综合材料', '实验'],
            '载体-数字像素': ['数字艺术', '生成艺术', '交互', '算法', '虚拟'],
            '形式-抽象': ['非具象', '构成', '色彩', '节奏', '情感'],
            '形式-叙事': ['故事性', '隐喻', '符号', '时间性', '记忆'],
            '历史-文艺复兴': ['人文主义', '透视', '解剖', '古典', '理想'],
            '历史-现代主义': ['实验', '反叛', '概念', '极简', '表现']
        };
        return tagMap[category] || ['探索', '未知', '意境'];
    }
    
    getGradient(category) {
        const gradients = {
            '载体': 'linear-gradient(135deg, #8a6dae, #ff9a8b)',
            '形式': 'linear-gradient(135deg, #4ecdc4, #ff6b6b)',
            '历史': 'linear-gradient(135deg, #ff9a8b, #4ecdc4)'
        };
        const type = category.split('-')[0];
        return gradients[type] || 'linear-gradient(135deg, var(--color-primary), var(--color-accent))';
    }
    
    getCaseType(category) {
        return category.split('-')[0];
    }
    
    getCaseImage(category) {
        // 返回占位图或实际图片URL
        return `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="400" height="300" fill="%238a6dae"/><text x="200" y="150" font-family="Arial" font-size="24" fill="white" text-anchor="middle">${encodeURIComponent(category)}</text></svg>')`;
    }
    
    filterCase(caseData) {
        if (this.currentFilter === 'all') return true;
        if (this.currentFilter === 'trending') return caseData.likes > 50;
        if (this.currentFilter === 'new') {
            const caseDate = new Date(caseData.date);
            const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            return caseDate > weekAgo;
        }
        if (this.currentFilter === 'interactive') {
            return caseData.tags.includes('交互') || caseData.tags.includes('互动');
        }
        return true;
    }
    
    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) return '今日';
        if (diffDays === 1) return '昨日';
        if (diffDays < 7) return `${diffDays}天前`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)}周前`;
        return date.toLocaleDateString('zh-CN');
    }
    
    addCaseInteractions() {
        // 案例卡片悬停效果
        document.querySelectorAll('.case-card').forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-8px)';
                card.style.boxShadow = '0 15px 40px rgba(0,0,0,0.15)';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = '';
                card.style.boxShadow = '';
            });
        });
        
        // 标签点击搜索
        document.querySelectorAll('.case-tag').forEach(tag => {
            tag.addEventListener('click', (e) => {
                e.stopPropagation();
                const tagText = tag.dataset.tag;
                const searchInput = document.getElementById('globalSearch');
                if (searchInput) {
                    searchInput.value = `#${tagText}`;
                    searchInput.dispatchEvent(new Event('input'));
                    searchInput.focus();
                }
            });
        });
        
        // 快速查看按钮
        document.querySelectorAll('.case-quickview').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const card = btn.closest('.case-card');
                const caseId = card.dataset.id;
                this.showQuickView(caseId);
            });
        });
    }
    
    showQuickView(caseId) {
        const caseData = this.casesData.find(c => c.id === caseId);
        if (!caseData) return;
        
        // 创建快速查看模态框
        const modal = document.createElement('div');
        modal.className = 'quickview-modal';
        modal.innerHTML = `
            <div class="quickview-content">
                <button class="close-quickview">&times;</button>
                <div class="quickview-header">
                    <h3>${caseData.title}</h3>
                    <span class="quickview-category">${caseData.category}</span>
                </div>
                <div class="quickview-body">
                    <div class="quickview-image" style="background: ${this.getGradient(caseData.category)}"></div>
                    <div class="quickview-info">
                        <p>${caseData.description}</p>
                        <div class="quickview-tags">
                            ${caseData.tags.map(tag => `<span class="tag">#${tag}</span>`).join('')}
                        </div>
                        <div class="quickview-actions">
                            <button class="btn-primary" onclick="window.openCase('${caseData.id}')">
                                <i class="fas fa-external-link-alt"></i> 进入完整案例空间
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // 关闭功能
        modal.querySelector('.close-quickview').addEventListener('click', () => {
            modal.remove();
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
        
        // 添加样式
        const style = document.createElement('style');
        style.textContent = `
            .quickview-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.8);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 2000;
                animation: fadeIn 0.3s;
            }
            
            .quickview-content {
                background: white;
                border-radius: 20px;
                width: 90%;
                max-width: 800px;
                max-height: 80vh;
                overflow-y: auto;
                animation: slideUp 0.3s;
                position: relative;
            }
            
            .close-quickview {
                position: absolute;
                top: 15px;
                right: 15px;
                background: none;
                border: none;
                font-size: 2rem;
                cursor: pointer;
                color: #666;
                z-index: 10;
            }
            
            .quickview-header {
                padding: 30px 30px 20px;
                border-bottom: 1px solid #eee;
            }
            
            .quickview-body {
                padding: 30px;
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 30px;
            }
            
            .quickview-image {
                height: 300px;
                border-radius: 15px;
            }
            
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            @keyframes slideUp {
                from { transform: translateY(50px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
            
            @media (max-width: 768px) {
                .quickview-body {
                    grid-template-columns: 1fr;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    showError() {
        if (this.casesContainer) {
            this.casesContainer.innerHTML = `
                <div class="error-loading">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>意境加载失败</h3>
                    <p>案例文件夹可能尚未创建，请先创建目录结构。</p>
                    <button onclick="window.location.reload()">
                        <i class="fas fa-redo"></i> 重新加载
                    </button>
                </div>
            `;
        }
    }
}

// 全局函数
window.openCase = function(caseId) {
    // 这里应该跳转到具体的案例页面
    // 示例：window.location.href = `case.html?id=${caseId}`;
    alert(`将跳转到案例 ${caseId} 的独立空间（此功能需要后端支持）`);
};

window.filterCases = function(filterType) {
    const loader = window.caseLoader;
    if (loader) {
        loader.currentFilter = filterType;
        loader.renderCases();
    }
};

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    const caseLoader = new CaseLoader();
    window.caseLoader = caseLoader;
    caseLoader.loadCases();
});
