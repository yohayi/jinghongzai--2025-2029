// 主页面核心功能
document.addEventListener('DOMContentLoaded', function() {
    // 设置当前年份
    document.getElementById('currentYear').textContent = new Date().getFullYear();
    
    // 动态文本效果
    const dynamicText = document.getElementById('dynamicText');
    const textVariations = [
        "这里没有边界，只有流动的定义",
        "美在呼吸间，在意境中苏醒",
        "每个瞬间都是未被书写的诗",
        "定义是牢笼，美是自由的翅膀"
    ];
    
    let textIndex = 0;
    setInterval(() => {
        dynamicText.style.opacity = 0;
        setTimeout(() => {
            textIndex = (textIndex + 1) % textVariations.length;
            dynamicText.innerHTML = textVariations[textIndex].replace(
                /流动的定义|意境|诗|自由的翅膀/g,
                '<span class="text-rainbow">$&</span>'
            );
            dynamicText.style.opacity = 1;
        }, 500);
    }, 4000);
    
    // 粒子文字效果
    const particleWords = document.getElementById('particleWords');
    const words = [
        "意境", "流动", "解构", "新生", "诗性",
        "混沌", "韵律", "空白", "呼吸", "生长"
    ];
    
    function showParticleWord() {
        const word = words[Math.floor(Math.random() * words.length)];
        particleWords.textContent = word;
        particleWords.style.opacity = 1;
        particleWords.style.transform = 'translateY(0)';
        
        setTimeout(() => {
            particleWords.style.opacity = 0;
            particleWords.style.transform = 'translateY(-10px)';
        }, 2000);
    }
    
    setInterval(showParticleWord, 2500);
    showParticleWord();
    
    // 搜索功能
    const searchInput = document.getElementById('globalSearch');
    const searchResults = document.getElementById('searchResults');
    
    searchInput.addEventListener('input', debounce(function(e) {
        const query = e.target.value.trim();
        if (query.length < 2) {
            searchResults.style.display = 'none';
            return;
        }
        
        // 模拟搜索（实际应从cases文件夹加载）
        const mockResults = [
            { type: '作品', title: '晨曦水墨', category: '载体-水墨', path: 'cases/载体-水墨/晨曦水墨' },
            { type: '标签', title: '#抽象表现', count: 24, path: 'tags/抽象表现' },
            { type: '案例', title: '数字像素的流动', category: '形式-数字', path: 'cases/形式-数字/流动像素' }
        ];
        
        const filteredResults = mockResults.filter(item => 
            item.title.toLowerCase().includes(query.toLowerCase()) ||
            item.category?.toLowerCase().includes(query.toLowerCase())
        );
        
        if (filteredResults.length > 0) {
            searchResults.innerHTML = filteredResults.map(item => `
                <div class="search-result-item" data-path="${item.path}">
                    <div class="result-type">${item.type}</div>
                    <div class="result-content">
                        <strong>${item.title}</strong>
                        ${item.category ? `<span class="result-category">${item.category}</span>` : ''}
                        ${item.count ? `<span class="result-count">${item.count}项</span>` : ''}
                    </div>
                </div>
            `).join('');
            searchResults.style.display = 'block';
        } else {
            searchResults.innerHTML = '<div class="no-results">未找到相关意境</div>';
            searchResults.style.display = 'block';
        }
    }, 300));
    
    // 点击外部关闭搜索
    document.addEventListener('click', function(e) {
        if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
            searchResults.style.display = 'none';
        }
    });
    
    // 快速标签点击
    document.querySelectorAll('.tag').forEach(tag => {
        tag.addEventListener('click', function() {
            const tagText = this.dataset.tag;
            searchInput.value = `#${tagText}`;
            searchInput.dispatchEvent(new Event('input'));
            searchInput.focus();
        });
    });
    
    // 案例过滤
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            const filter = this.dataset.filter;
            // 这里会与案例加载器联动
            window.filterCases && window.filterCases(filter);
        });
    });
    
    // 用户投稿表单交互
    const titleInput = document.getElementById('contributeTitle');
    const descInput = document.getElementById('contributeDesc');
    const titleCount = document.getElementById('titleCount');
    const descCount = document.getElementById('descCount');
    const tagInput = document.getElementById('newTag');
    const tagPreview = document.getElementById('tagPreview');
    const uploadArea = document.getElementById('uploadArea');
    const uploadPreview = document.getElementById('uploadPreview');
    const imageUpload = document.getElementById('imageUpload');
    const clearFormBtn = document.getElementById('clearForm');
    const submitBtn = document.getElementById('submitContribution');
    
    let userTags = [];
    let uploadedImage = null;
    
    // 字符计数
    titleInput.addEventListener('input', () => {
        titleCount.textContent = titleInput.value.length;
    });
    
    descInput.addEventListener('input', () => {
        descCount.textContent = descInput.value.length;
    });
    
    // 标签输入
    tagInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && this.value.trim()) {
            const tag = this.value.trim();
            if (!userTags.includes(tag)) {
                userTags.push(tag);
                updateTagPreview();
            }
            this.value = '';
            e.preventDefault();
        }
    });
    
    function updateTagPreview() {
        tagPreview.innerHTML = userTags.map(tag => `
            <span class="preview-tag">
                ${tag}
                <button type="button" class="remove-tag" data-tag="${tag}">×</button>
            </span>
        `).join('');
        
        // 移除标签事件
        document.querySelectorAll('.remove-tag').forEach(btn => {
            btn.addEventListener('click', function() {
                const tagToRemove = this.dataset.tag;
                userTags = userTags.filter(t => t !== tagToRemove);
                updateTagPreview();
            });
        });
    }
    
    // 图片上传预览
    imageUpload.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = function(e) {
                uploadedImage = e.target.result;
                uploadPreview.innerHTML = `
                    <div class="preview-image">
                        <img src="${e.target.result}" alt="预览">
                        <button type="button" class="remove-image">×</button>
                    </div>
                `;
                
                // 移除图片事件
                document.querySelector('.remove-image').addEventListener('click', function() {
                    uploadPreview.innerHTML = '';
                    uploadedImage = null;
                    imageUpload.value = '';
                });
            };
            reader.readAsDataURL(file);
        }
    });
    
    // 拖放上传
    uploadArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        this.style.borderColor = 'var(--color-primary)';
        this.style.backgroundColor = 'rgba(var(--color-primary-rgb), 0.1)';
    });
    
    uploadArea.addEventListener('dragleave', function(e) {
        e.preventDefault();
        this.style.borderColor = '';
        this.style.backgroundColor = '';
    });
    
    uploadArea.addEventListener('drop', function(e) {
        e.preventDefault();
        this.style.borderColor = '';
        this.style.backgroundColor = '';
        
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            imageUpload.files = dataTransfer.files;
            imageUpload.dispatchEvent(new Event('change'));
        }
    });
    
    // 清空表单
    clearFormBtn.addEventListener('click', function() {
        titleInput.value = '';
        descInput.value = '';
        tagInput.value = '';
        userTags = [];
        uploadedImage = null;
        uploadPreview.innerHTML = '';
        imageUpload.value = '';
        titleCount.textContent = '0';
        descCount.textContent = '0';
        updateTagPreview();
    });
    
    // 提交投稿
    submitBtn.addEventListener('click', async function() {
        const title = titleInput.value.trim();
        const description = descInput.value.trim();
        const category = document.getElementById('contributeCategory').value;
        
        if (!title && !description && !uploadedImage) {
            alert('请至少提供标题、描述或图片中的一项');
            return;
        }
        
        // 生成用户ID（实际应用中应从登录系统获取）
        const userId = localStorage.getItem('userId') || `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('userId', userId);
        
        // 创建投稿数据
        const contribution = {
            id: `contribution_${Date.now()}`,
            userId: userId,
            title: title || '未命名作品',
            description: description,
            category: category || '自定义',
            tags: userTags,
            image: uploadedImage,
            timestamp: new Date().toISOString(),
            likes: 0,
            views: 0
        };
        
        // 显示加载状态
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 发布中...';
        submitBtn.disabled = true;
        
        try {
            // 模拟API调用（实际应保存到服务器）
            await simulateAPICall(contribution);
            
            // 更新用户空间路径显示
            document.getElementById('userSpacePath').textContent = 
                `${userId}/contributions/${contribution.id}/`;
            
            // 显示成功消息
            showNotification('作品已保存到您的独立空间！', 'success');
            
            // 清空表单
            clearFormBtn.click();
            
            // 可选：立即显示在页面上
            addContributionToView(contribution);
            
        } catch (error) {
            showNotification('发布失败，请稍后重试', 'error');
            console.error('投稿失败:', error);
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });
    
    // 实时统计数据
    updateLiveStats();
    setInterval(updateLiveStats, 30000); // 每30秒更新
    
    // 导出数据功能
    document.getElementById('exportData').addEventListener('click', function() {
        const userId = localStorage.getItem('userId');
        if (!userId) {
            alert('请先创建至少一个作品以生成您的空间数据');
            return;
        }
        
        // 模拟导出
        this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 导出中...';
        setTimeout(() => {
            this.innerHTML = '<i class="fas fa-download"></i> 导出我的空间';
            showNotification('空间数据已准备下载', 'info');
        }, 1500);
    });
    
    // 备份功能
    document.getElementById('backupBtn').addEventListener('click', function() {
        showNotification('意境数据已备份到本地', 'success');
    });
    
    // 查看我的空间链接
    document.querySelectorAll('#myContributions, #myTags, #myCollections, #mySettings').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const userId = localStorage.getItem('userId');
            if (!userId) {
                alert('请先创建您的第一个作品来初始化个人空间');
                return;
            }
            window.location.href = `user-space.html?user=${userId}&tab=${this.id.replace('my', '').toLowerCase()}`;
        });
    });
});

// 工具函数
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function simulateAPICall(data) {
    return new Promise((resolve) => {
        setTimeout(() => {
            // 模拟保存到localStorage
            const key = `contribution_${data.id}`;
            localStorage.setItem(key, JSON.stringify(data));
            resolve({ success: true, id: data.id });
        }, 1000);
    });
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    // 触发动画
    setTimeout(() => notification.classList.add('show'), 10);
    
    // 自动消失
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function addContributionToView(contribution) {
    // 将新投稿添加到动态案例区域
    const casesContainer = document.getElementById('casesContainer');
    if (casesContainer && !casesContainer.querySelector('.loading-cases')) {
        const contributionElement = document.createElement('div');
        contributionElement.className = 'case-card user-contribution';
        contributionElement.innerHTML = `
            <div class="case-image" style="background: linear-gradient(135deg, var(--color-primary), var(--color-accent))">
                ${contribution.image ? `<img src="${contribution.image}" alt="${contribution.title}">` : 
                  `<div class="text-preview">${contribution.title.charAt(0)}</div>`}
            </div>
            <div class="case-info">
                <h3>${contribution.title}</h3>
                <p class="case-desc">${contribution.description || '意境描述留白...'}</p>
                <div class="case-tags">
                    ${contribution.tags.map(tag => `<span class="case-tag">#${tag}</span>`).join('')}
                </div>
                <div class="case-meta">
                    <span class="case-user"><i class="fas fa-user"></i> 您</span>
                    <span class="case-time">刚刚</span>
                </div>
            </div>
        `;
        casesContainer.prepend(contributionElement);
    }
}

function updateLiveStats() {
    // 模拟实时数据
    const stats = {
        cases: Math.floor(120 + Math.random() * 10),
        users: Math.floor(85 + Math.random() * 5),
        tags: Math.floor(230 + Math.random() * 15),
        contributions: Math.floor(512 + Math.random() * 20)
    };
    
    document.getElementById('liveStats').innerHTML = 
        `${stats.cases}个案例 · ${stats.users}位探索者 · ${stats.tags}种标签`;
    
    document.getElementById('lastUpdate').textContent = 
        new Date().toLocaleTimeString('zh-CN', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
}

// 通知样式
const notificationStyle = document.createElement('style');
notificationStyle.textContent = `
    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        background: white;
        padding: 15px 20px;
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        display: flex;
        align-items: center;
        gap: 10px;
        z-index: 9999;
        transform: translateX(120%);
        transition: transform 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    }
    
    .notification.show {
        transform: translateX(0);
    }
    
    .notification-success {
        border-left: 4px solid #4CAF50;
    }
    
    .notification-error {
        border-left: 4px solid #f44336;
    }
    
    .notification-info {
        border-left: 4px solid #2196F3;
    }
    
    .notification i {
        font-size: 1.2rem;
    }
    
    .notification-success i { color: #4CAF50; }
    .notification-error i { color: #f44336; }
    .notification-info i { color: #2196F3; }
`;
document.head.appendChild(notificationStyle);
