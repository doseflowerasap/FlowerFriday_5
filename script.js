// ==========================================
    // ⚠️ 設定區
    // ==========================================
    const API_URL = "https://script.google.com/macros/s/AKfycbxyobOzz0lMOeSkvfOg2sR4IsNzM2MFTbNUHtIkxZZwO8aIZ3B9OflAUlRqRdqrJFtHwQ/exec"; 
    const FALLBACK_ICON = "https://placehold.co/80x80/eee/999?text=🌸";

    // 12隻動物
    const CHARACTER_DESC = [
        { id: 'rabbit', icon: '🐰', name: '固執的兔子', desc: '有藍色眼睛，不喜歡吃超過八公分的胡蘿蔔，喜歡在雲層很厚的時候上廁所，無聊的時候喜歡算塔羅。' },
        { id: 'lion', icon: '🦁', name: '浪漫的獅子', desc: '有著比大部分獅子長的尾巴。喜歡在樹下乘涼，在乘涼的時候喜歡寫詩，但不會拿筆。' },
        { id: 'cat', icon: '🐱', name: '機靈的小貓', desc: '有著灰黑色的大理石紋、銳利的眼神，是剛出生不久的貓咪寶寶。最喜歡吃的食物是鮭魚，夢想是可以跳到獅子愛乘涼的樹上，然後從樹上往下看他。' },
        { id: 'elephant', icon: '🐘', name: '無憂無慮的大象', desc: '生性樂觀、沒有煩惱，所有的動物都喜歡找他談心，但是天生只有三隻腳。有個沒動物知道的秘密是會背九九乘法表。' },
        { id: 'owl', icon: '🦉', name: '少一根筋的貓頭鷹', desc: '長得很帥、喜歡吃辣。最喜歡睡覺的地方是兔子窩邊，如果沒不小心飛錯的話。' },
        { id: 'penguin', icon: '🐧', name: '熱愛環保的企鵝', desc: '不會游泳、走路很慢。興趣是發明好吃的素食菜單，希望菜單可以獲得固執兔子的認可，也希望有一天可以看到沒有垃圾的海灘。' },
        { id: 'koala', icon: '🐨', name: '愛睏無尾熊', desc: '一天要睡20個小時，醒著的時候都在發呆，好像很長壽，沒有動物知道他活了多久。' },
        { id: 'bear', icon: '🐻', name: '暖男大熊', desc: '有著灰棕色的毛，冬天會準備很多蜂蜜茶請大家喝。' },
        { id: 'elk', icon: '🦌', name: '容易迷路的麋鹿', desc: '角很大、方向感很差。常常一邊走一邊懷疑自己是不是走錯人生，喜歡在凌晨幫別的動物掛上聖誕燈。' },
        { id: 'bat', icon: '🦇', name: '我行我素的蝙蝠', desc: '討厭白天，也不太回訊息。對聲音特別敏感，能分辨祝福是真心還是客套。習慣在別的動物都安靜下來之後才出現。' },
        { id: 'hedgehog', icon: '🦔', name: '記性很好的刺蝟', desc: '身上總是插著幾根彎掉的刺，不太擅長擁抱，但會記得每個動物喝咖啡的順序。' },
        { id: 'otter', icon: '🦦', name: '強迫症晚期海獺', desc: '會把漂在水面的雜物一一排好，連石頭都有固定的位置。別的動物找不到東西時，通常最後都會來問他。' }
    ];

    let myRole = null;
    let flowersData = [], usedFlowers = {}, savedImageBase64 = null;
    let currentMethod = '自取';
    let globalZIndex = 100; // 初始層級
    
    // 計數器
    let countGeneral = 0;
    let countSpecial = 0;
    const LIMIT_GENERAL = 3;
    const LIMIT_SPECIAL = 2;

    window.onload = async function() {
        try {
            const res = await fetch(API_URL);
            const data = await res.json();
            flowersData = data.flowers || [];
            document.getElementById('loading').style.display = 'none';
            renderRoleList(data.roles);
            renderAllDropdowns();
            renderFlowerAssets();
        } catch (e) { console.error(e); alert("讀取資料失敗"); }
    };

    document.getElementById('btn-start').onclick = () => {
        document.getElementById('phase-intro').classList.add('hidden');
        document.getElementById('phase-game').classList.remove('hidden');
        window.scrollTo(0,0);
    };

    // --- 志願序邏輯 ---
    function renderAllDropdowns() {
        const ids = ['recv-1','recv-2','recv-3','give-1','give-2','give-3'];
        ids.forEach(id => {
            const el = document.getElementById(id); el.innerHTML = '<option value="">請選擇...</option>';
            CHARACTER_DESC.forEach(char => {
                let opt = document.createElement('option'); opt.value = char.id; opt.text = char.icon + " " + char.name; opt.dataset.text = opt.text;
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
    function renderRoleList(sheetData) {
        const container = document.getElementById('role-list'); container.innerHTML = '';
        CHARACTER_DESC.forEach(char => {
            const status = sheetData.find(d => d.id === char.id);
            const isTaken = status ? status.taken : false;
            const card = document.createElement('div'); card.className = `role-card ${isTaken ? 'disabled' : ''}`;
            if (!isTaken) card.onclick = () => selectRole(card, char.id);
            card.innerHTML = `<div class="role-icon">${char.icon}</div><div class="role-info"><h3>${char.name}</h3><p class="role-desc">${char.desc}</p></div>` + (isTaken?'<div style="margin-left:auto;color:red;font-size:12px;">(已額滿)</div>':'');
            container.appendChild(card);
        });
    }
    function selectRole(el, id) {
        document.querySelectorAll('.role-card').forEach(c => c.classList.remove('selected'));
        el.classList.add('selected'); myRole = id; renderAllDropdowns();
    }

    // --- 花藝邏輯 (升級版 v2 - 含雙擊刪除) ---
    function renderFlowerAssets() { 
        const c=document.getElementById('asset-list'); c.innerHTML=''; 
        flowersData.forEach(f=>{ 
            const d=document.createElement('div'); 
            const isSoldOut = f.remaining<=0; 
            const typeClass = f.category === 'special' ? 'type-special' : 'type-general';
            const typeName = f.category === 'special' ? '特殊' : '一般';
            
            d.className=`asset-item ${typeClass} ${isSoldOut?'disabled':''}`; 
            if(!isSoldOut) d.onclick=()=>addItem(f); 
            d.innerHTML=`
                <div class="asset-tag">${typeName}</div>
                <img src="${f.url||FALLBACK_ICON}" onerror="this.src='${FALLBACK_ICON}'">
                <div class="asset-info"><div>${f.name}</div><div class="asset-count">剩 ${f.remaining}</div></div>`; 
            c.appendChild(d); 
        }); 
    }

    function addItem(f) { 
        if(usedFlowers[f.id] >= f.remaining) return alert("這個花材的庫存用完了喔！"); 
        
        if (f.category === 'special') {
            if (countSpecial >= LIMIT_SPECIAL) return alert(`特殊花材只能選 ${LIMIT_SPECIAL} 支喔！`);
            countSpecial++;
        } else {
            if (countGeneral >= LIMIT_GENERAL) return alert(`一般花材只能選 ${LIMIT_GENERAL} 支喔！`);
            countGeneral++;
        }
        updateCounters();

        const el = document.createElement('div');
        el.className='draggable-item';
        el.dataset.category = f.category || 'general'; 
        el.dataset.id = f.id; // 紀錄 ID 以便刪除時對照

        const img = document.createElement('img');
        img.src = f.url || FALLBACK_ICON;
        img.onerror = function(){this.src=FALLBACK_ICON;this.onerror=null;};
        el.appendChild(img);
        
        el.style.left = (Math.random()*40 + 30) + '%';
        el.style.top = (Math.random()*40 + 20) + '%';
        
        if(!usedFlowers[f.id]) usedFlowers[f.id]=0; usedFlowers[f.id]++;
        
        // --- 新增：雙擊刪除事件 ---
        el.addEventListener('dblclick', function() {
            // 1. 從畫布移除
            el.remove();
            // 2. 更新計數器
            if (f.category === 'special') { countSpecial--; } else { countGeneral--; }
            updateCounters();
            // 3. 更新庫存紀錄
            usedFlowers[f.id]--;
            if(usedFlowers[f.id] <= 0) delete usedFlowers[f.id];
        });
        // -----------------------

        makeDraggable(el);
        document.getElementById('flower-canvas').appendChild(el); 
    }

    function updateCounters() {
        const elGen = document.getElementById('cnt-general');
        const elSpec = document.getElementById('cnt-special');
        elGen.innerText = `${countGeneral}/${LIMIT_GENERAL}`;
        elSpec.innerText = `${countSpecial}/${LIMIT_SPECIAL}`;
        elGen.className = countGeneral >= LIMIT_GENERAL ? 'count-val count-full' : 'count-val';
        elSpec.className = countSpecial >= LIMIT_SPECIAL ? 'count-val count-full' : 'count-val';
    }

    function makeDraggable(el){ 
        let isDragging=false;
        let startX, startY, initialLeft, initialTop;
        const start = (e) => {
            isDragging = true;
            globalZIndex++; el.style.zIndex = globalZIndex;
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            startX = clientX; startY = clientY;
            initialLeft = el.offsetLeft; initialTop = el.offsetTop;
            e.preventDefault(); 
        };
        const move = (e) => {
            if(!isDragging) return;
            e.preventDefault();
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            const dx = clientX - startX; const dy = clientY - startY;
            el.style.left = (initialLeft + dx) + 'px'; el.style.top = (initialTop + dy) + 'px';
        };
        const end = () => { isDragging = false; };
        el.addEventListener('mousedown', start); el.addEventListener('touchstart', start, {passive: false});
        document.addEventListener('mousemove', move); document.addEventListener('touchmove', move, {passive: false});
        document.addEventListener('mouseup', end); document.addEventListener('touchend', end);
    }

    function clearCanvas(){
        const canvas = document.getElementById('flower-canvas');
        // 只移除花朵 (draggable-item)，保留背景和計數器
        const items = canvas.querySelectorAll('.draggable-item');
        items.forEach(i => i.remove());
        usedFlowers={}; countGeneral = 0; countSpecial = 0; updateCounters();
    }

    // --- 換頁與送出 ---
    function toggleMethod(m){
        document.getElementById('opt-self').classList.toggle('active',m=='self');
        document.getElementById('opt-delivery').classList.toggle('active',m=='delivery');
        document.getElementById('block-self').classList.toggle('hidden',m!='self');
        document.getElementById('block-delivery').classList.toggle('hidden',m!='delivery');
        currentMethod = m=='self'?'自取':'運送';
        updatePrice();
    }
    function updatePrice() {
        const priceEl = document.getElementById('total-price');
        const detailEl = document.getElementById('price-detail');
        if (currentMethod === '運送') { priceEl.innerText = "850"; detailEl.innerText = "(花束 $650 + 運費 $200)"; } 
        else { priceEl.innerText = "650"; detailEl.innerText = "(花束 $650)"; }
    }

    document.getElementById('btn-next').onclick = async () => {
        if (!myRole) return alert("請先選角色！");
        const ids = ['recv-1','recv-2','recv-3','give-1','give-2','give-3'];
        for(let id of ids) { if(!document.getElementById(id).value) return alert("請將 3 個接收與 3 個贈送心願都選好喔！"); }
        
        const btn = document.getElementById('btn-next'); const txt = btn.innerText; btn.innerText="💾 儲存設計..."; btn.disabled=true;
        try {
            const capture = await html2canvas(document.getElementById('flower-canvas'), { scale: 2, useCORS: true });
            savedImageBase64 = capture.toDataURL("image/png");
            document.getElementById('phase-game').classList.add('hidden');
            document.getElementById('phase-info').classList.remove('hidden');
            window.scrollTo(0,0);
        } catch(e) { alert("截圖失敗"); } finally { btn.innerText=txt; btn.disabled=false; }
    };
    
    document.getElementById('btn-back').onclick = () => {
        document.getElementById('phase-info').classList.add('hidden');
        document.getElementById('phase-game').classList.remove('hidden');
    };

    document.getElementById('btn-submit').onclick = async () => {
        const email = document.getElementById('email-input').value;
        const phone = document.getElementById('phone-input').value;
        const name = document.getElementById('name-input').value;
        
        let pTime = "", addr = "";
        if (currentMethod === '自取') {
            pTime = document.getElementById('self-time').value;
            if(!pTime) return alert("請選擇自取時段！");
            addr = "人性空間 (自取)";
        } else {
            // --- 🚚 運送模式檢查 ---
            pTime = document.getElementById('delivery-time').value;
            addr = document.getElementById('delivery-address').value;
            
            if(!addr) return alert("請輸入配送地址！");
            if(!pTime) return alert("請選擇配送時段！");

            // 1. 關鍵字初篩 (可以保留原本的幾個大區，或是乾脆拿掉這行，完全依賴人工確認)
            // 建議保留幾個絕對不可能送到的關鍵字做反向排除，或是維持正向檢查
            // 這裡示範放寬標準，只要有寫「區」就好，主要依賴 checkbox
            if(!addr.includes("區")) return alert("地址請包含行政區名稱！");

            // 2. 檢查是否有勾選確認框
            const isZoneConfirmed = document.getElementById('zone-check').checked;
            if(!isZoneConfirmed) {
                return alert("⚠️ 請參考地圖，並勾選「我已確認收件地址位於橘色框線範圍內」才能送出喔！");
            }
        }

        const bankCode = document.getElementById('pay-input').value;
        if(!bankCode) return alert("請填寫匯款帳號末五碼！");
        if(!email || !name || !phone) return alert("請填寫完整資料！");
        
        const subPref = document.querySelector('input[name="subPref"]:checked').value;

        const btn = document.getElementById('btn-submit'); const txt = btn.innerText; btn.innerText = "🚀 傳送中..."; btn.disabled = true;

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
                // 🎉 這裡修改了成功訊息
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
