// ==========================================
// ⚠️ 設定區
// ==========================================
const API_URL = "https://script.google.com/macros/s/AKfycbxyobOzz0lMOeSkvfOg2sR4IsNzM2MFTbNUHtIkxZZwO8aIZ3B9OflAUlRqRdqrJFtHwQ/exec";
const FALLBACK_ICON = "https://placehold.co/80x80/eee/999?text=🌸";

// 12隻動物設定
const CHARACTER_DESC = [
    { id: 'rabbit', imgUrl: 'icon/rabbit.png', name: '固執的兔子', desc: '有藍色眼睛，不喜歡吃超過八公分的胡蘿蔔，喜歡在雲層很厚的時候上廁所，無聊的時候喜歡算塔羅。' },
    { id: 'lion', imgUrl: 'icon/lion.png', name: '浪漫的獅子', desc: '有著比大部分獅子長的尾巴。喜歡在樹下乘涼，在乘涼的時候喜歡寫詩，但不會拿筆。' },
    { id: 'cat', imgUrl: 'icon/cat.png', name: '機靈的小貓', desc: '有著灰黑色的大理石紋、銳利的眼神，是剛出生不久的貓咪寶寶。最喜歡吃的食物是鮭魚，夢想是可以跳到獅子愛乘涼的樹上，然後從樹上往下看他。' },
    { id: 'elephant', imgUrl: 'icon/elephant.png', name: '無憂無慮的大象', desc: '生性樂觀、沒有煩惱，所有的動物都喜歡找他談心，但是天生只有三隻腳。有個沒動物知道的秘密是會背九九乘法表。' },
    { id: 'owl', imgUrl: 'icon/owl.png', name: '少一根筋的貓頭鷹', desc: '長得很帥、喜歡吃辣。最喜歡睡覺的地方是兔子窩邊，如果沒不小心飛錯的話。' },
    { id: 'penguin', imgUrl: 'icon/penguin.png', name: '熱愛環保的企鵝', desc: '不會游泳、走路很慢。興趣是發明好吃的素食菜單，希望菜單可以獲得固執兔子的認可，也希望有一天可以看到沒有垃圾的海灘。' },
    { id: 'koala', imgUrl: 'icon/koala.png', name: '愛睏無尾熊', desc: '一天要睡20個小時，醒著的時候都在發呆，好像很長壽，沒有動物知道他活了多久。' },
    { id: 'bear', imgUrl: 'icon/bear.png', name: '暖男大熊', desc: '有著灰棕色的毛，冬天會準備很多蜂蜜茶請大家喝。' },
    { id: 'elk', imgUrl: 'icon/elk.png', name: '容易迷路的麋鹿', desc: '角很大、方向感很差。常常一邊走一邊懷疑自己是不是走錯人生，喜歡在凌晨幫別的動物掛上聖誕燈。' },
    { id: 'bat', imgUrl: 'icon/bat.png', name: '我行我素的蝙蝠', desc: '討厭白天，也不太回訊息。對聲音特別敏感，能分辨祝福是真心還是客套。習慣在別的動物都安靜下來之後才出現。' },
    { id: 'hedgehog', imgUrl: 'icon/hedgehog.png', name: '記性很好的刺蝟', desc: '身上總是插著幾根彎掉的刺，不太擅長擁抱，但會記得每個動物喝咖啡的順序。' },
    { id: 'otter', imgUrl: 'icon/otter.png', name: '強迫症晚期海獺', desc: '會把漂在水面的雜物一一排好，連石頭都有固定的位置。別的動物找不到東西時，通常最後都會來問他。' }
];

// ==========================================
// 全域變數
// ==========================================
let myRole = null;
let flowersData = [], usedFlowers = {}, savedImageBase64 = null;
let currentMethod = '自取';
let globalZIndex = 3000; // 初始層級
let countTotal = 0;
const LIMIT_TOTAL = 6;

// ==========================================
// 🚀 核心：網頁載入後才執行
// ==========================================
window.onload = async function() {
    console.log("網頁載入完成，開始初始化...");
    
    // 1. 先綁定所有按鈕事件
    initEventBindings();

    // 2. 讀取 Google Sheet 資料
    try {
        const res = await fetch(API_URL);
        const data = await res.json();
        flowersData = data.flowers || [];
        document.getElementById('loading').style.display = 'none';
        
        renderRoleList(data.roles);
        renderAllDropdowns();
        renderFlowerAssets();
    } catch (e) { 
        console.error(e); 
        alert("讀取資料失敗，請檢查網路或重新整理。"); 
    }
};

// ==========================================
// 按鈕事件綁定區
// ==========================================
function initEventBindings() {
    
    // ⚠️ 新增功能：點擊包裝紙三角形，讓它浮到最上層
    // 請確保 HTML 裡的三角形圖片或 div 有 id="wrapping-paper"
    const wrapper = document.getElementById('wrapping-paper');
    if(wrapper) {
        // 設定點擊事件
        wrapper.onclick = (e) => {
            // 阻止事件冒泡（避免誤觸其他背景事件）
            e.stopPropagation();
            // 增加全域層級
            globalZIndex++;
            // 設定包裝紙為最高層級
            wrapper.style.zIndex = globalZIndex;
            console.log("包裝紙已移至最上層 (z-index: " + globalZIndex + ")");
        };
        
        // 為了讓使用者知道可以點，加個手型游標
        wrapper.style.cursor = 'pointer';
        // 確保它有相對定位或絕對定位，z-index 才會生效
        // wrapper.style.position = 'absolute'; // 如果 CSS 已經寫了這行可以註解掉
    }

    // 開場按鈕
    const btnStart = document.getElementById('btn-start');
    if(btnStart) btnStart.onclick = () => {
        document.getElementById('phase-intro').classList.add('hidden');
        document.getElementById('phase-game').classList.remove('hidden');
        window.scrollTo(0,0);
    };

    // 🔄 下一步：截圖並跳轉
    const btnNext = document.getElementById('btn-next');
    if(btnNext) btnNext.onclick = async () => {
        
        // 1. 驗證角色
        if (!myRole) return alert("⚠️ 請滑到最上面，先選擇您的「動物角色」喔！");
        
        // 2. 驗證志願序
        const ids = ['recv-1','recv-2','recv-3','give-1','give-2','give-3'];
        for(let id of ids) { 
            if(!document.getElementById(id).value) return alert("⚠️ 請將 3 個接收與 3 個贈送心願都選好喔！"); 
        }

        // 3. 驗證祝福語
        const msgInput = document.getElementById('msg-input');
        const msgVal = msgInput.value.trim();

        if (!msgVal) {
            alert("⚠️ 提醒您：\n\n第 4 步驟的「祝福語」還沒寫喔！\n這段話很重要，請寫下一些祝福再繼續吧～");
            msgInput.focus(); 
            return;
        }

        // 4. 截圖
        if(typeof html2canvas === 'undefined') {
            return alert("❌ 系統錯誤：找不到截圖工具 (html2canvas)。");
        }
        
        const btn = document.getElementById('btn-next'); 
        const txt = btn.innerText; 
        btn.innerText = "💾 儲存設計..."; 
        btn.disabled = true;
        
        try {
            const capture = await html2canvas(document.getElementById('flower-canvas'), { 
                scale: 2, 
                useCORS: true 
            });
            savedImageBase64 = capture.toDataURL("image/png");
            
            document.getElementById('phase-game').classList.add('hidden');
            document.getElementById('phase-info').classList.remove('hidden');
            window.scrollTo(0,0);
        } catch(e) { 
            console.warn("截圖失敗:", e);
            savedImageBase64 = null; 
            document.getElementById('phase-game').classList.add('hidden');
            document.getElementById('phase-info').classList.remove('hidden');
            window.scrollTo(0,0);
        } finally { 
            btn.innerText = txt; 
            btn.disabled = false; 
        }
    };

    // 上一步
    const btnBack = document.getElementById('btn-back');
    if(btnBack) btnBack.onclick = () => {
        document.getElementById('phase-info').classList.add('hidden');
        document.getElementById('phase-game').classList.remove('hidden');
    };

    // 🚀 最終送出
    const btnSubmit = document.getElementById('btn-submit');
    if(btnSubmit) btnSubmit.onclick = async () => {
        const email = document.getElementById('email-input').value;
        const phone = document.getElementById('phone-input').value;
        const name = document.getElementById('name-input').value;
        
        let pTime = "", addr = "";
        if (currentMethod === '自取') {
            pTime = document.getElementById('self-time').value;
            if(!pTime) return alert("請選擇自取時段！");
            addr = "人性空間 (自取)";
        } else {
            pTime = document.getElementById('delivery-time').value;
            addr = document.getElementById('delivery-address').value;
            if(!addr) return alert("請輸入配送地址！");
            if(!pTime) return alert("請選擇配送時段！");
            if(!addr.includes("區")) return alert("地址請包含行政區名稱！");

            const isZoneConfirmed = document.getElementById('zone-check').checked;
            if(!isZoneConfirmed) {
                return alert("⚠️ 請參考地圖，並勾選「我已確認收件地址位於橘色框線範圍內」才能送出喔！");
            }
        }

        const bankCode = document.getElementById('pay-input').value;
        if(!bankCode) return alert("請填寫匯款帳號末五碼！");
        if(!email || !name || !phone) return alert("請填寫完整資料！");
        
        const subPrefEl = document.querySelector('input[name="subPref"]:checked');
        const subPref = subPrefEl ? subPrefEl.value : "未選擇";

        const btn = document.getElementById('btn-submit'); 
        const txt = btn.innerText; 
        btn.innerText = "🚀 傳送中..."; 
        btn.disabled = true;

        const postData = {
            email, phone, roleId: myRole, ownerName: name,
            receive_1: document.getElementById('recv-1').value,
            receive_2: document.getElementById('recv-2').value,
            receive_3: document.getElementById('recv-3').value,
            give_1: document.getElementById('give-1').value,
            give_2: document.getElementById('give-2').value,
            give_3: document.getElementById('give-3').value,
            message: document.getElementById('msg-input').value,
            paymentInfo: "末五碼: " + bankCode,
            imageBase64: savedImageBase64,
            method: currentMethod, pickupTime: pTime, address: addr,
            usedFlowers: usedFlowers,
            subPref: subPref
        };

        try {
            const res = await fetch(API_URL, { method: 'POST', body: JSON.stringify(postData) });
            const result = await res.json();
            
            if(result.status === 'success') { 
                alert("🎉 報名成功！\n\n請留意：訂花確認信將於 12/24 (三) 寄至您的 Email，謝謝參與！"); 
                location.reload(); 
            } else { 
                alert("❌ 失敗：" + result.message); 
                if(!result.message.includes("Email")) location.reload(); 
            }
        } catch(e) { 
            console.error(e); 
            alert("錯誤:"+e); 
        } finally { 
            btn.innerText = txt; 
            btn.disabled = false; 
        }
    };
}

// ==========================================
// 邏輯函式
// ==========================================
function renderRoleList(sheetData) {
    const container = document.getElementById('role-list'); container.innerHTML = '';
    CHARACTER_DESC.forEach(char => {
        const status = sheetData.find(d => d.id === char.id);
        const isTaken = status ? status.taken : false;
        const card = document.createElement('div'); 
        card.className = `role-card ${isTaken ? 'disabled' : ''}`;
        if (!isTaken) card.onclick = () => selectRole(card, char.id);
        card.innerHTML = `
            <img class="role-icon-img" src="${char.imgUrl}" alt="${char.name}" onerror="this.src='${FALLBACK_ICON}'">
            <div class="role-info">
                <h3>${char.name}</h3>
                <p class="role-desc">${char.desc}</p>
            </div>` + (isTaken ? '<div style="margin-left:auto;color:red;font-size:12px;">(已額滿)</div>' : '');
        container.appendChild(card);
    });
}

function selectRole(el, id) {
    document.querySelectorAll('.role-card').forEach(c => c.classList.remove('selected'));
    el.classList.add('selected'); 
    myRole = id; 
    renderAllDropdowns();
}

function renderAllDropdowns() {
    const ids = ['recv-1','recv-2','recv-3','give-1','give-2','give-3'];
    ids.forEach(id => {
        const el = document.getElementById(id); el.innerHTML = '<option value="">請選擇...</option>';
        CHARACTER_DESC.forEach(char => {
            let opt = document.createElement('option'); opt.value = char.id; 
            opt.text = char.name; opt.dataset.text = opt.text;
            if(myRole === char.id) { opt.disabled = true; opt.text += " (你自己)"; opt.dataset.self = "true"; }
            el.appendChild(opt);
        });
    });
    updateWishes('recv'); updateWishes('give');
}

function updateWishes(type) {
    const ids = [1, 2, 3].map(i => `${type}-${i}`);
    const selects = ids.map(id => document.getElementById(id));
    const values = selects.map(s => s.value);
    selects.forEach((sel, idx) => {
        Array.from(sel.options).forEach(opt => {
            if(opt.value === "" || opt.dataset.self === "true") return;
            let isTaken = values.some((v, vIdx) => vIdx !== idx && v === opt.value && v !== "");
            opt.disabled = isTaken; opt.text = isTaken ? opt.dataset.text + " (已選)" : opt.dataset.text;
        });
    });
}

function renderFlowerAssets() { 
    const c = document.getElementById('asset-list'); c.innerHTML = ''; 
    
    flowersData.forEach(f => { 
        const d = document.createElement('div'); 
        const isSoldOut = f.remaining <= 0; 
        
        d.className = `asset-item ${isSoldOut ? 'disabled' : ''}`; 
        if(!isSoldOut) d.onclick = () => addItem(f); 
        
        d.innerHTML = `
            <img src="${f.url||FALLBACK_ICON}" onerror="this.src='${FALLBACK_ICON}'">
            <div class="asset-info">
                <div>${f.name}</div>
                <div class="asset-count">剩 ${f.remaining}</div>
            </div>`; 
        c.appendChild(d); 
    }); 
}

function addItem(f) { 
    if(usedFlowers[f.id] >= f.remaining) return alert("這個花材的庫存用完了喔！"); 
    if (countTotal >= LIMIT_TOTAL) return alert(`花束最多只能選 ${LIMIT_TOTAL} 支喔！`);
    
    countTotal++;
    updateCounters();

    const el = document.createElement('div');
    el.className = 'draggable-item';
    el.dataset.id = f.id; 
    
    el.style.zIndex = globalZIndex; 

    const img = document.createElement('img');
    img.src = f.url || FALLBACK_ICON;
    
    img.onerror = function(){ 
        this.src = FALLBACK_ICON; 
        this.onerror = null; 
    };
    
    el.appendChild(img);
    
    el.style.left = (Math.random() * 40 + 30) + '%';
    el.style.top = (Math.random() * 40 + 20) + '%';
    
    if(!usedFlowers[f.id]) usedFlowers[f.id] = 0; usedFlowers[f.id]++;
    
    el.addEventListener('dblclick', function() {
        el.remove();
        countTotal--; updateCounters();
        usedFlowers[f.id]--;
        if(usedFlowers[f.id] <= 0) delete usedFlowers[f.id];
    });

    makeDraggable(el);
    addPinchZoom(el);

    document.getElementById('flower-canvas').appendChild(el); 
}

function updateCounters() {
    document.getElementById('cnt-total').innerText = `目前數量: ${countTotal} / ${LIMIT_TOTAL}`;
}

function makeDraggable(el){ 
    let isDragging = false;
    let startX, startY, initialLeft, initialTop;
    
    const start = (e) => {
        // 如果是兩指操作（準備縮放），就不啟動拖曳
        if (e.touches && e.touches.length > 1) return;

        globalZIndex++; el.style.zIndex = globalZIndex; 
        isDragging = true;
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        startX = clientX; startY = clientY;
        initialLeft = el.offsetLeft; initialTop = el.offsetTop;
        if (e.cancelable) e.preventDefault(); 
    };
    
    const move = (e) => {
        if(!isDragging) return;
        if (e.touches && e.touches.length > 1) return;

        if (e.cancelable) e.preventDefault();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        el.style.left = (initialLeft + clientX - startX) + 'px'; 
        el.style.top = (initialTop + clientY - startY) + 'px';
    };
    
    const end = () => { isDragging = false; };
    
    el.addEventListener('mousedown', start); el.addEventListener('touchstart', start, {passive: false});
    document.addEventListener('mousemove', move); document.addEventListener('touchmove', move, {passive: false});
    document.addEventListener('mouseup', end); document.addEventListener('touchend', end);
}

function clearCanvas(){
    document.querySelectorAll('.draggable-item').forEach(i => i.remove());
    usedFlowers = {}; countTotal = 0; updateCounters();
}

function toggleMethod(m){
    document.getElementById('opt-self').classList.toggle('active', m=='self');
    document.getElementById('opt-delivery').classList.toggle('active', m=='delivery');
    document.getElementById('block-self').classList.toggle('hidden', m!='self');
    document.getElementById('block-delivery').classList.toggle('hidden', m!='delivery');
    currentMethod = m=='self' ? '自取' : '運送';
    
    const priceEl = document.getElementById('total-price');
    const detailEl = document.getElementById('price-detail');
    if (m === 'delivery') { 
        priceEl.innerText = "850"; 
        detailEl.innerText = "(花束 $650 + 運費 $200)"; 
    } else { 
        priceEl.innerText = "650"; 
        detailEl.innerText = "(花束 $650)"; 
    }
}

// ==========================================
// 🔎 雙指縮放 (Pinch to Zoom) 邏輯區
// ==========================================
function addPinchZoom(element) {
    let initialDistance = 0;
    let initialScale = 1;
    let currentScale = 1;

    // 1. 手指放上去 (Touch Start)
    element.addEventListener('touchstart', function(e) {
        if (e.touches.length === 2) {
            e.preventDefault(); 
            initialDistance = getDistance(e.touches[0], e.touches[1]);
            
            const currentTransform = window.getComputedStyle(element).transform;
            initialScale = getScaleFromTransform(currentTransform) || 1;
        }
    }, { passive: false });

    // 2. 手指移動 (Touch Move)
    element.addEventListener('touchmove', function(e) {
        if (e.touches.length === 2) {
            e.preventDefault();

            const newDistance = getDistance(e.touches[0], e.touches[1]);
            const scaleFactor = newDistance / initialDistance;
            currentScale = initialScale * scaleFactor;

            currentScale = Math.min(Math.max(0.5, currentScale), 3);

            updateElementTransform(element, currentScale);
        }
    }, { passive: false });
}

function getDistance(touch1, touch2) {
    return Math.hypot(touch1.pageX - touch2.pageX, touch1.pageY - touch2.pageY);
}

function getScaleFromTransform(transformValue) {
    if (transformValue === 'none') return 1;
    const matrix = new DOMMatrix(transformValue);
    return matrix.a; 
}

function updateElementTransform(element, newScale) {
    let currentTransform = element.style.transform;
    
    if (!currentTransform.includes('scale')) {
        element.style.transform = `${currentTransform} scale(${newScale})`;
    } else {
        element.style.transform = currentTransform.replace(/scale\([0-9.]+\)/, `scale(${newScale})`);
    }
}
