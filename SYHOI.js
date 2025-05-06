/**
 * SYHOI Online Judge 主JavaScript文件
 * 修复版本：确保所有按钮功能正常
 */

// ==================== 数据存储初始化 ====================
const dataStores = {
    contests: JSON.parse(localStorage.getItem('contests')) || [],
    problems: JSON.parse(localStorage.getItem('problems')) || [],
    discussions: JSON.parse(localStorage.getItem('discussions')) || [],
    problemLists: JSON.parse(localStorage.getItem('problemLists')) || [],
    submissions: JSON.parse(localStorage.getItem('submissions')) || [],
    problemDiscussions: JSON.parse(localStorage.getItem('problemDiscussions')) || [],
    users: JSON.parse(localStorage.getItem('users')) || [
        {id: '1', name: '管理员', role: 'admin', solved: 42, submitted: 50, score: 100},
        {id: '2', name: '教师用户', role: 'teacher', solved: 35, submitted: 45, score: 85},
        {id: '3', name: '学生用户', role: 'student', solved: 20, submitted: 30, score: 65}
    ]
};

let currentState = {
    isLoggedIn: localStorage.getItem('isLoggedIn') === 'true',
    currentProblemId: null,
    selectedTags: []
};

// ==================== 核心功能函数 ====================

/**
 * 主初始化函数
 */
function initializeApp() {
    console.log("初始化应用...");
    initAuth();
    bindGlobalEvents();
    initCreationButtons();
    handleFormSubmissions();
    initPageSpecificFeatures();
    
    // 确保在初始化时调用
    if (window.location.pathname.includes('problems.html')) {
        initProblems();
    }
}

/**
 * 初始化认证系统
 */
function initAuth() {
    updateAuthUI();
    
    // 登录按钮
    safeAddEventListener('login-btn', 'click', () => {
        currentState.isLoggedIn = true;
        localStorage.setItem('isLoggedIn', 'true');
        updateAuthUI();
        location.reload();
    });
    
    // 登出按钮
    safeAddEventListener('logout-btn', 'click', () => {
        currentState.isLoggedIn = false;
        localStorage.setItem('isLoggedIn', 'false');
        updateAuthUI();
        location.reload();
    });
}

/**
 * 更新认证UI状态
 */
function updateAuthUI() {
    const loginBtn = document.getElementById('login-btn');
    const logoutBtn = document.getElementById('logout-btn');
    
    if (loginBtn && logoutBtn) {
        if (currentState.isLoggedIn) {
            loginBtn.classList.add('hidden');
            logoutBtn.classList.remove('hidden');
        } else {
            loginBtn.classList.remove('hidden');
            logoutBtn.classList.add('hidden');
        }
    }
}

/**
 * 绑定全局事件
 */
function bindGlobalEvents() {
    // 模态框关闭按钮
    document.querySelectorAll('.close').forEach(btn => {
        btn.addEventListener('click', () => {
            const modal = btn.closest('.modal');
            if (modal) modal.style.display = 'none';
        });
    });
    
    // 点击模态框外部关闭
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });
    
    // 标签页切换
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const tabId = tab.getAttribute('data-tab');
            switchTab(tabId);
        });
    });
}

/**
 * 初始化所有创建按钮
 */
function initCreationButtons() {
    // 创建比赛
    safeAddEventListener('create-contest-btn', 'click', () => {
        if (!checkLogin()) return;
        showModal('create-contest-modal');
    });
    
    // 创建讨论
    safeAddEventListener('create-discussion-btn', 'click', () => {
        if (!checkLogin()) return;
        showModal('create-discussion-modal');
    });
    
    // 创建题目
    safeAddEventListener('create-problem-btn', 'click', () => {
        if (!checkLogin()) return;
        showModal('create-problem-modal');
        initTestCases();
    });
    
    // 创建题单
    safeAddEventListener('create-problem-list-btn', 'click', () => {
        if (!checkLogin()) return;
        showModal('create-problem-list-modal');
        initProblemListOptions();
    });
    
    // 创建题目讨论
    safeAddEventListener('create-problem-discussion-btn', 'click', () => {
        if (!checkLogin()) return;
        showModal('create-problem-discussion-modal');
    });
    
    // 提交代码
    safeAddEventListener('submit-code-btn', 'click', submitSolution);
}

/**
 * 处理所有表单提交
 */
function handleFormSubmissions() {
    // 比赛表单
    safeAddEventListener('contest-form', 'submit', (e) => {
        e.preventDefault();
        createContest();
    });
    
    // 讨论表单
    safeAddEventListener('discussion-form', 'submit', (e) => {
        e.preventDefault();
        createDiscussion();
    });
    
    // 题目表单
    safeAddEventListener('problem-form', 'submit', (e) => {
        e.preventDefault();
        createProblem();
    });
    
    // 题单表单
    safeAddEventListener('problem-list-form', 'submit', (e) => {
        e.preventDefault();
        createProblemList();
    });
    
    // 题目讨论表单
    safeAddEventListener('problem-discussion-form', 'submit', (e) => {
        e.preventDefault();
        createProblemDiscussion();
    });
}

/**
 * 初始化页面特定功能
 */
function initPageSpecificFeatures() {
    const path = window.location.pathname.split('/').pop() || '';
    
    switch(path) {
        case 'rankings.html':
            initRankings();
            break;
        case 'discussions.html':
            initDiscussions();
            break;
        case 'problems.html':
            initProblems();
            break;
        case 'problem_lists.html':
            initProblemLists();
            break;
        case 'index.html':
            initHomePage();
            break;
        default:
            if (document.getElementById('problem-detail-content')) {
                initProblemDetail();
            }
    }
}

// ==================== 实用工具函数 ====================

/**
 * 安全添加事件监听
 */
function safeAddEventListener(id, event, handler) {
    const element = document.getElementById(id);
    if (element) {
        element.addEventListener(event, handler);
    } else {
        console.warn(`元素 #${id} 未找到，无法绑定 ${event} 事件`);
    }
}

/**
 * 显示模态框
 */
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
        const form = modal.querySelector('form');
        if (form) form.reset();
    } else {
        console.error(`模态框 #${modalId} 未找到`);
    }
}

/**
 * 检查登录状态
 */
function checkLogin() {
    if (!currentState.isLoggedIn) {
        alert('请先登录');
        return false;
    }
    return true;
}

/**
 * 切换标签页
 */
function switchTab(tabId) {
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.toggle('active', tab.getAttribute('data-tab') === tabId);
    });
    
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.toggle('active', content.id === tabId);
    });
}

/**
 * 保存数据到localStorage
 */
function saveData() {
    Object.keys(dataStores).forEach(key => {
        localStorage.setItem(key, JSON.stringify(dataStores[key]));
    });
}

/**
 * 生成唯一ID
 */
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// ==================== 创建功能实现 ====================

function createContest() {
    if (!checkLogin()) return;
    
    const newContest = {
        id: generateId(),
        name: getValue('contest-name'),
        difficulty: parseInt(getValue('contest-difficulty')) || 5,
        startTime: getValue('contest-start-time'),
        endTime: getValue('contest-end-time'),
        duration: getValue('contest-duration'),
        description: getValue('contest-description'),
        qa: getValue('contest-qa'),
        summary: getValue('contest-summary'),
        createdAt: new Date().toISOString()
    };
    
    dataStores.contests.push(newContest);
    saveData();
    hideModal('create-contest-modal');
    renderContests();
    alert('比赛创建成功！');
}

function createDiscussion() {
    if (!checkLogin()) return;
    
    const newDiscussion = {
        id: generateId(),
        title: getValue('discussion-title'),
        content: getValue('discussion-content'),
        tags: currentState.selectedTags,
        author: '当前用户',
        createdAt: new Date().toISOString(),
        views: 0,
        likes: 0,
        replies: []
    };
    
    dataStores.discussions.unshift(newDiscussion);
    saveData();
    hideModal('create-discussion-modal');
    renderDiscussions();
    alert('讨论创建成功！');
}

// 增强的创建题目函数
function createProblem() {
    if (!checkLogin()) return;
    
    try {
        // 1. 收集测试用例
        const testCases = [];
        const testCaseElements = document.querySelectorAll('#test-cases-container .test-case');
        
        testCaseElements.forEach(testCase => {
            const input = testCase.querySelector('.test-case-input')?.value || '';
            const output = testCase.querySelector('.test-case-output')?.value || '';
            if (input || output) {
                testCases.push({ input, output });
            }
        });

        // 2. 验证必填字段
        const problemName = document.getElementById('problem-name').value;
        if (!problemName) {
            alert('题目名称不能为空');
            return;
        }

        // 3. 创建题目对象
        const newProblem = {
            id: generateId(),
            name: problemName,
            difficulty: parseInt(document.getElementById('problem-difficulty').value) || 1,
            type: document.getElementById('problem-type').value,
            source: document.getElementById('problem-source').value || '无',
            description: document.getElementById('problem-description').value || '无描述',
            inputDescription: document.getElementById('problem-input').value || '无输入描述',
            outputDescription: document.getElementById('problem-output').value || '无输出描述',
            timeLimit: parseInt(document.getElementById('problem-time-limit').value) || 1000,
            memoryLimit: parseInt(document.getElementById('problem-memory-limit').value) || 256,
            sampleInput: document.getElementById('problem-sample-input').value || '无',
            sampleOutput: document.getElementById('problem-sample-output').value || '无',
            hint: document.getElementById('problem-hint').value || '无提示',
            testCases,
            createdAt: new Date().toISOString()
        };

        // 4. 保存数据
        dataStores.problems.push(newProblem);
        localStorage.setItem('problems', JSON.stringify(dataStores.problems));
        
        // 5. 更新UI
        hideModal('create-problem-modal');
        renderProblems(); // 确保这个函数能正确刷新题目列表
        
        // 6. 显示成功提示
        showAlert('题目创建成功！', 'success');
        
        // 7. 重置表单
        resetProblemForm();
        
    } catch (error) {
        console.error('创建题目失败:', error);
        showAlert('创建题目失败，请检查控制台', 'error');
    }
}

function initProblems() {
    renderProblems();
    
    // 添加测试用例按钮
    safeAddEventListener('add-test-case-btn', 'click', addTestCase);
    safeAddEventListener('edit-add-test-case-btn', 'click', addTestCase);
}

function renderProblems() {
    const tableBody = document.getElementById('problems-table-body');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    dataStores.problems.forEach(problem => {
        const row = document.createElement('tr');
        row.className = 'hover:bg-gray-50';
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${problem.id}</td>
            <td class="px-6 py-4 whitespace-nowrap">
                <a href="#" class="text-sm font-medium text-blue-600 hover:text-blue-800" 
                   onclick="showProblemDetail('${problem.id}')">${problem.name}</a>
                ${problem.type === 'written' ? '<span class="problem-type-badge">笔试题</span>' : ''}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                ${getDifficultyBadge(problem.difficulty)}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${problem.source || '无'}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">0%</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ${currentState.isLoggedIn ? `
                <button class="text-yellow-600 hover:text-yellow-800 mr-3" 
                        onclick="openEditProblemModal('${problem.id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="text-red-600 hover:text-red-800" 
                        onclick="deleteProblem('${problem.id}')">
                    <i class="fas fa-trash"></i>
                </button>
                ` : ''}
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.style.display = 'none';
}

function getDifficultyBadge(difficulty) {
    let colorClass, text;
    if (difficulty <= 3) {
        colorClass = 'bg-green-100 text-green-800';
        text = '简单';
    } else if (difficulty <= 7) {
        colorClass = 'bg-yellow-100 text-yellow-800';
        text = '中等';
    } else {
        colorClass = 'bg-red-100 text-red-800';
        text = '困难';
    }
    return `<span class="difficulty-badge ${colorClass}">${text}</span>`;
}

function addTestCase() {
    const container = document.getElementById('test-cases-container');
    if (!container) return;
    
    const count = container.querySelectorAll('.test-case').length + 1;
    
    const testCaseDiv = document.createElement('div');
    testCaseDiv.className = 'test-case mb-4 border border-gray-200 rounded-md';
    testCaseDiv.innerHTML = `
        <div class="test-case-header flex justify-between items-center bg-gray-50 p-2 border-b">
            <span class="text-sm font-medium">测试点 #${count}</span>
            <button type="button" class="text-red-500 hover:text-red-700 text-sm" onclick="removeTestCase(this)">
                <i class="fas fa-times"></i> 删除
            </button>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
            <div>
                <label class="block text-xs font-medium text-gray-500 mb-1">输入</label>
                <textarea class="test-case-input w-full px-2 py-1 text-xs font-mono border border-gray-300 rounded-md" rows="3"></textarea>
            </div>
            <div>
                <label class="block text-xs font-medium text-gray-500 mb-1">输出</label>
                <textarea class="test-case-output w-full px-2 py-1 text-xs font-mono border border-gray-300 rounded-md" rows="3"></textarea>
            </div>
        </div>
    `;
    
    container.appendChild(testCaseDiv);
}

function removeTestCase(button) {
    const testCase = button.closest('.test-case');
    if (testCase) {
        testCase.remove();
        // 重新编号剩余的测试用例
        const container = document.getElementById('test-cases-container');
        const testCases = container.querySelectorAll('.test-case');
        testCases.forEach((tc, index) => {
            tc.querySelector('.test-case-header span').textContent = `测试点 #${index + 1}`;
        });
    }
}
function showProblemDetail(problemId) {
    const problem = dataStores.problems.find(p => p.id === problemId);
    if (!problem) return;
    
    currentState.currentProblemId = problemId;
    
    // 更新UI显示题目详情
    document.getElementById('problem-detail-title').textContent = problem.name;
    document.getElementById('problem-type-badge').textContent = problem.type === 'written' ? '笔试题' : '上机题';
    document.getElementById('time-limit').textContent = `${problem.timeLimit}ms`;
    document.getElementById('memory-limit').textContent = `${problem.memoryLimit}MB`;
    document.getElementById('problem-difficulty').innerHTML = getDifficultyBadge(problem.difficulty);
    
    // 设置题目内容
    document.getElementById('problem-description').innerHTML = problem.description;
    document.getElementById('input-sample').textContent = problem.sampleInput;
    document.getElementById('output-sample').textContent = problem.sampleOutput;
    document.getElementById('problem-hint').innerHTML = problem.hint;
    
    // 设置问题讨论的问题ID
    document.getElementById('problem-discussion-problem-id').value = problemId;
    
    // 切换到题目详情视图
    document.querySelector('div.ml-[20%]').classList.add('hidden');
    document.getElementById('problem-detail-content').classList.remove('hidden');
    
    // 渲染问题讨论
    renderProblemDiscussions(problemId);
}

function resetProblemForm() {
    document.getElementById('problem-form').reset();
    document.getElementById('test-cases-container').innerHTML = '';
    addTestCase(); // 重新添加一个空的测试用例
}

// 渲染题目列表函数 (确保存在且正确)
function renderProblems() {
    const tableBody = document.getElementById('problems-table-body');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    dataStores.problems.forEach(problem => {
        const row = document.createElement('tr');
        row.className = 'hover:bg-gray-50';
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${problem.id}</td>
            <td class="px-6 py-4 whitespace-nowrap">
                <a href="#" class="text-sm font-medium text-blue-600 hover:text-blue-800" 
                   onclick="showProblemDetail('${problem.id}')">${problem.name}</a>
                ${problem.type === 'written' ? '<span class="problem-type-badge">笔试题</span>' : ''}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                ${getDifficultyBadge(problem.difficulty)}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${problem.source}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">0%</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ${currentState.isLoggedIn ? `
                <button class="text-yellow-600 hover:text-yellow-800 mr-3" 
                        onclick="openEditProblemModal('${problem.id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="text-red-600 hover:text-red-800" 
                        onclick="deleteProblem('${problem.id}')">
                    <i class="fas fa-trash"></i>
                </button>
                ` : ''}
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// 重置题目表单
function resetProblemForm() {
    document.getElementById('problem-form').reset();
    document.getElementById('test-cases-container').innerHTML = '';
    addTestCase(); // 重新添加一个空的测试用例
}

// 显示提示信息
function showAlert(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `fixed top-4 right-4 p-4 rounded-md shadow-lg 
                         ${type === 'success' ? 'bg-green-100 text-green-800' : 
                          type === 'error' ? 'bg-red-100 text-red-800' : 
                          'bg-blue-100 text-blue-800'}`;
    alertDiv.textContent = message;
    document.body.appendChild(alertDiv);
    
    setTimeout(() => {
        alertDiv.remove();
    }, 3000);
}

// ==================== 启动应用 ====================
document.addEventListener('DOMContentLoaded', initializeApp);

// ==================== 全局导出函数 ====================
window.showProblemDetail = showProblemDetail;
window.deleteProblem = deleteProblem;
window.removeTestCase = removeTestCase;
window.deleteDiscussion = deleteDiscussion;
window.deleteProblemDiscussion = deleteProblemDiscussion;
window.switchTab = switchTab;
