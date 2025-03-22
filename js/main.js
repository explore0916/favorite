// 全局变量
let tools = [];
let categories = new Set();
let currentCategory = 'all';
let favorites = new Set(JSON.parse(localStorage.getItem('favorites') || '[]'));
let showingFavorites = false;

// DOM 元素
const toolsGrid = document.getElementById('toolsGrid');
const categoryList = document.getElementById('categoryList');
const searchInput = document.getElementById('searchInput');
const themeToggle = document.getElementById('themeToggle');
const showFavorites = document.getElementById('showFavorites');
const toolsTitle = document.getElementById('toolsTitle');
const loading = document.getElementById('loading');

// 初始化
async function init() {
    try {
        // 显示加载动画
        loading.style.display = 'flex';
        
        // 读取数据
        const response = await fetch('data/tools.json');
        tools = await response.json();
        
        // 提取分类
        tools.forEach(tool => {
            if (tool.category) {
                categories.add(tool.category);
            }
        });
        
        // 渲染分类
        renderCategories();
        
        // 渲染工具
        renderTools();
        
        // 初始化主题
        initTheme();
        
    } catch (error) {
        console.error('初始化失败:', error);
        showError('数据加载失败，请刷新页面重试');
    } finally {
        // 隐藏加载动画
        loading.style.display = 'none';
    }
}

// 渲染分类
function renderCategories() {
    const categoriesArray = Array.from(categories);
    const categoryCounts = {};
    
    // 计算每个分类的工具数量
    tools.forEach(tool => {
        if (tool.category) {
            categoryCounts[tool.category] = (categoryCounts[tool.category] || 0) + 1;
        }
    });
    
    categoryList.innerHTML = `
        <li>
            <button class="${currentCategory === 'all' ? 'active' : ''}" 
                    onclick="filterByCategory('all')">
                <i class="fas fa-globe"></i>
                全部
                <span>(${tools.length})</span>
            </button>
        </li>
        ${categoriesArray.map(category => `
            <li>
                <button class="${currentCategory === category ? 'active' : ''}" 
                        onclick="filterByCategory('${category}')">
                    <i class="fas fa-folder"></i>
                    ${category}
                    <span>(${categoryCounts[category]})</span>
                </button>
            </li>
        `).join('')}
    `;
}

// 渲染工具卡片
function renderTools(filteredTools = tools) {
    // 首先根据收藏状态筛选
    const displayTools = showingFavorites 
        ? filteredTools.filter(tool => favorites.has(tool.id))
        : filteredTools;
    
    if (displayTools.length === 0) {
        toolsGrid.innerHTML = `
            <div class="no-tools">
                <i class="fas fa-search"></i>
                <p>没有找到匹配的工具</p>
            </div>
        `;
        // 即使没有工具也要更新计数
        updateToolsCount(displayTools.length);
        return;
    }
    
    toolsGrid.innerHTML = displayTools.map(tool => `
        <div class="tool-card">
            <div>
                <span class="category-tag">
                    <i class="fas fa-tag"></i>
                    ${tool.category}
                </span>
                <h3>${tool.name}</h3>
                <p>${tool.description || '暂无描述'}</p>
            </div>
            <div class="tool-actions">
                <a href="${tool.url}" target="_blank" rel="noopener noreferrer">
                    <i class="fas fa-external-link-alt"></i>
                    访问网站
                </a>
                <button onclick="toggleFavorite('${tool.id}')" 
                        class="${favorites.has(tool.id) ? 'favorite' : ''}"
                        title="${favorites.has(tool.id) ? '取消收藏' : '添加到收藏夹'}">
                    <i class="fas fa-star"></i>
                </button>
            </div>
        </div>
    `).join('');
    
    // 更新工具计数，传入当前显示的工具数量
    updateToolsCount(displayTools.length);
}

// 按分类筛选
function filterByCategory(category) {
    currentCategory = category;
    renderCategories();
    
    const filteredTools = category === 'all' 
        ? tools 
        : tools.filter(tool => tool.category === category);
    
    // 如果在收藏夹视图中，只显示已收藏的工具
    if (showingFavorites) {
        renderTools(filteredTools.filter(tool => favorites.has(tool.id)));
    } else {
        renderTools(filteredTools);
    }
}

// 搜索功能
function searchTools(query) {
    const searchQuery = query.toLowerCase();
    const filteredTools = tools.filter(tool => 
        tool.name.toLowerCase().includes(searchQuery) ||
        (tool.description && tool.description.toLowerCase().includes(searchQuery)) ||
        tool.category.toLowerCase().includes(searchQuery)
    );
    renderTools(filteredTools);
}

// 切换收藏夹显示
function toggleFavorites() {
    showingFavorites = !showingFavorites;
    showFavorites.classList.toggle('active');
    
    // 触发当前分类的重新筛选
    filterByCategory(currentCategory);
}

// 收藏功能
function toggleFavorite(toolId) {
    // 更新收藏状态
    if (favorites.has(toolId)) {
        favorites.delete(toolId);
    } else {
        favorites.add(toolId);
    }
    localStorage.setItem('favorites', JSON.stringify(Array.from(favorites)));
    
    // 触发当前分类的重新筛选
    filterByCategory(currentCategory);
}

// 更新工具计数
function updateToolsCount(count) {
    // 设置标题文本
    const icon = showingFavorites ? 'fa-star' : 'fa-tools';
    const title = showingFavorites ? '收藏的工具' : 
                 (currentCategory === 'all' ? '全部' : `分类：${currentCategory}`);
    
    // 更新标题和计数
    toolsTitle.innerHTML = `<i class="fas ${icon}"></i> ${title} <span>(${count})</span>`;
}

// 主题切换
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
    const icon = themeToggle.querySelector('i');
    icon.className = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
}

// 错误提示
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.innerHTML = `
        <i class="fas fa-exclamation-circle"></i>
        ${message}
    `;
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
        errorDiv.remove();
    }, 3000);
}

// 事件监听
searchInput.addEventListener('input', (e) => {
    searchTools(e.target.value);
});

themeToggle.addEventListener('click', toggleTheme);
showFavorites.addEventListener('click', toggleFavorites);

// 初始化应用
init(); 
