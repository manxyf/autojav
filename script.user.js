// ==UserScript==
// @name         JAVLibrary - 自动更新
// @namespace    http://tampermonkey.net/
// @version      3.7.5
// @description  
// @author       manxyf
// @match        *://www.f101w.com/cn/*
// @grant        none
// @run-at       document-end
// @updateURL    https://raw.githubusercontent.com/manxyf/autojav/main/script.user.js
// @downloadURL  https://raw.githubusercontent.com/manxyf/autojav/main/script.user.js
// ==/UserScript==

(function() {
    'use strict';

    // ====================== 配置区：在这里修改你的账号密码 ======================
    const AUTO_FILL_USERNAME = "manxyf";
    const AUTO_FILL_PASSWORD = "";
    // =========================================================================

    // 辅助延时函数
    const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

    // 1. 创建搜索按钮容器（初始隐藏）
    const searchContainer = document.createElement('div');
    searchContainer.style.cssText = `
        position: absolute;
        background: #fff;
        border: 1px solid #ccc;
        border-radius: 4px;
        padding: 4px;
        z-index: 999999;
        display: none;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        user-select: none;
        -webkit-user-select: none;
    `;

    // 2. 创建站内搜索按钮
    const siteSearchBtn = document.createElement('button');
    siteSearchBtn.innerText = '站内搜索';
    siteSearchBtn.style.cssText = `
        padding: 4px 8px;
        margin: 0 4px;
        border: none;
        background: #409eff;
        color: #fff;
        border-radius: 2px;
        cursor: pointer;
        font-size: 12px;
        line-height: 1;
    `;

    // 3. 创建磁力搜索按钮
    const magnetSearchBtn = document.createElement('button');
    magnetSearchBtn.innerText = '磁力搜索';
    magnetSearchBtn.style.cssText = `
        padding: 4px 8px;
        margin: 0 4px;
        border: none;
        background: #67c23a;
        color: #fff;
        border-radius: 2px;
        cursor: pointer;
        font-size: 12px;
        line-height: 1;
    `;

    // 3.5 创建MissAV搜索按钮
    const missavSearchBtn = document.createElement('button');
    missavSearchBtn.innerText = 'MissAV搜索';
    missavSearchBtn.style.cssText = `
        padding: 4px 8px;
        margin: 0 4px;
        border: none;
        background: #ff4757;
        color: #fff;
        border-radius: 2px;
        cursor: pointer;
        font-size: 12px;
        line-height: 1;
    `;

    // 4. 创建划词“插图”按钮
    const insertSelectionBtn = document.createElement('button');
    insertSelectionBtn.innerText = '插图';
    insertSelectionBtn.style.cssText = `
        padding: 4px 8px;
        margin: 0 4px;
        border: none;
        background: #e6a23c;
        color: #fff;
        border-radius: 2px;
        cursor: pointer;
        font-size: 12px;
        line-height: 1;
    `;

    // 组装容器并添加到页面
    searchContainer.appendChild(siteSearchBtn);
    searchContainer.appendChild(magnetSearchBtn);
    searchContainer.appendChild(missavSearchBtn); // 添加新按钮到容器中
    searchContainer.appendChild(insertSelectionBtn);
    document.body.appendChild(searchContainer);

    // ====================== 登录自动填充函数 ======================
    function autoFillLogin() {
        const usernameInput = document.getElementById('userid');
        const passwordInput = document.getElementById('password');

        if (usernameInput && passwordInput) {
            usernameInput.value = AUTO_FILL_USERNAME;
            passwordInput.value = AUTO_FILL_PASSWORD;
            console.log('✅ 账号密码已自动填充');
        }
    }
    autoFillLogin();

    // UTF8字符串转Base64
    function utf8ToBase64(str) {
        return btoa(unescape(encodeURIComponent(str))).replace(/=+$/, '');
    }

    // 5. 监听鼠标划词事件
    let selectedText = '';
    document.addEventListener('mouseup', (e) => {
        selectedText = window.getSelection().toString().trim();
        if (selectedText) {
            const x = e.pageX + 10;
            const y = e.pageY + 10;
            searchContainer.style.left = `${x}px`;
            searchContainer.style.top = `${y}px`;
            searchContainer.style.display = 'block';
        } else {
            searchContainer.style.display = 'none';
        }
    });

    // 6. 点击非按钮区域隐藏容器
    document.addEventListener('mousedown', (e) => {
        if (!searchContainer.contains(e.target)) {
            searchContainer.style.display = 'none';
        }
    });

    // 7. 站内搜索按钮点击事件
    siteSearchBtn.addEventListener('click', () => {
        if (selectedText) {
            // 💡 已优化：硬编码域名改为了 window.location.origin
            const siteUrl = `${window.location.origin}/cn/vl_searchbyid.php?keyword=${encodeURIComponent(selectedText)}`;
            window.open(siteUrl, '_blank');
            searchContainer.style.display = 'none';
        }
    });

    // 8. 磁力搜索按钮点击事件
    magnetSearchBtn.addEventListener('click', () => {
        if (selectedText) {
            const base64Str = utf8ToBase64(selectedText);
            const magnetUrl = `https://clm.cc/search?word=${base64Str}`;
            window.open(magnetUrl, '_blank');
            searchContainer.style.display = 'none';
        }
    });

    // 8.5 MissAV搜索按钮点击事件
    missavSearchBtn.addEventListener('click', () => {
        if (selectedText) {
            const missavUrl = `https://missav.ws/search/${encodeURIComponent(selectedText)}`;
            window.open(missavUrl, '_blank');
            searchContainer.style.display = 'none';
        }
    });


    // ====================== 右键及划词插图底层功能 ======================

    // 创建右键自定义菜单容器
    const customCtxMenu = document.createElement('div');
    customCtxMenu.style.cssText = `
        position: absolute;
        background: #ffffff;
        border: 1px solid #dddddd;
        border-radius: 4px;
        padding: 4px 0;
        z-index: 999999;
        display: none;
        box-shadow: 0 2px 10px rgba(0,0,0,0.15);
        font-size: 13px;
        font-family: sans-serif;
        min-width: 120px;
        user-select: none;
        -webkit-user-select: none;
    `;

    const insertImgItem = document.createElement('div');
    insertImgItem.innerText = '🖼️ 自动插图';
    insertImgItem.style.cssText = `
        padding: 8px 16px;
        cursor: pointer;
        color: #333333;
        transition: background 0.15s;
    `;
    insertImgItem.addEventListener('mouseenter', () => insertImgItem.style.backgroundColor = '#f5f5f5');
    insertImgItem.addEventListener('mouseleave', () => insertImgItem.style.backgroundColor = 'transparent');

    customCtxMenu.appendChild(insertImgItem);
    document.body.appendChild(customCtxMenu);

    let activePostTable = null;

    // 监听全局右键点击事件
    document.addEventListener('contextmenu', (e) => {
        const postTable = e.target.closest('table.post');
        if (postTable) {
            e.preventDefault();
            activePostTable = postTable;
            customCtxMenu.style.left = `${e.pageX}px`;
            customCtxMenu.style.top = `${e.pageY}px`;
            customCtxMenu.style.display = 'block';
        } else {
            customCtxMenu.style.display = 'none';
        }
    });

    document.addEventListener('mousedown', (e) => {
        if (!customCtxMenu.contains(e.target)) {
            customCtxMenu.style.display = 'none';
        }
    });

    // 带自动重试的网络请求包装器
    async function fetchWithRetry(url, retries = 2, delay = 800) {
        for (let i = 0; i <= retries; i++) {
            try {
                const response = await fetch(url);
                if (response.ok) return response;
                if (response.status === 503 || response.status === 429) {
                    await sleep(delay * 2);
                }
            } catch (e) {
                if (i === retries) throw e;
            }
            if (i < retries) await sleep(delay);
        }
        return null;
    }

    // 智能分析文本节点并分组，确保备注等描述性文本不被强行分离
    let matchCounter = 0;
    function walkAndReplace(node, matchesToFetch) {
        if (node.nodeType === Node.TEXT_NODE) {
            const text = node.nodeValue;
            const regex = /\b[a-zA-Z0-9]*[a-zA-Z]+[a-zA-Z0-9]*-[a-zA-Z0-9]+\b/gi;

            const matches = [];
            let match;
            while ((match = regex.exec(text)) !== null) {
                matches.push({
                    text: match[0],
                    index: match.index,
                    length: match[0].length
                });
            }

            if (matches.length > 0) {
                const fragments = [];

                if (matches[0].index > 0) {
                    fragments.push(document.createTextNode(text.substring(0, matches[0].index)));
                }

                for (let i = 0; i < matches.length; i++) {
                    const currentMatch = matches[i];
                    const upperMatchText = currentMatch.text.toUpperCase();
                    const blockEndIndex = (i + 1 < matches.length) ? matches[i+1].index : text.length;

                    const blockText = text.substring(currentMatch.index, blockEndIndex);
                    fragments.push(document.createTextNode(blockText));

                    const container = document.createElement('div');
                    container.className = 'inserted-jacket-container';
                    container.style.cssText = 'margin: 8px 0; display: block;';

                    const placeholder = document.createElement('span');
                    const matchId = `jacket-placeholder-${matchCounter++}`;
                    placeholder.id = matchId;
                    placeholder.className = 'inserted-jacket-placeholder';
                    placeholder.style.cssText = 'color: #888; font-size: 11px; display: block; margin: 4px 0; font-style: italic;';
                    placeholder.innerText = `[🔍 正在获取 ${upperMatchText} 的插图...]`;

                    container.appendChild(placeholder);
                    fragments.push(container);

                    matchesToFetch.push({
                        code: upperMatchText,
                        placeholderId: matchId
                    });
                }

                const parent = node.parentNode;
                fragments.forEach(frag => {
                    parent.insertBefore(frag, node);
                });
                parent.removeChild(node);
            }
        } else {
            if (
                node.nodeName !== 'SCRIPT' &&
                node.nodeName !== 'STYLE' &&
                node.nodeName !== 'TEXTAREA' &&
                !node.classList?.contains('inserted-jacket-container')
            ) {
                const children = Array.from(node.childNodes);
                children.forEach(child => walkAndReplace(child, matchesToFetch));
            }
        }
    }

    // 针对指定文本节点数组执行智能分析替换（适用于划词分析）
    function walkAndReplaceNodes(textNodes, matchesToFetch) {
        textNodes.forEach(node => {
            const text = node.nodeValue;
            const regex = /\b[a-zA-Z0-9]*[a-zA-Z]+[a-zA-Z0-9]*-[a-zA-Z0-9]+\b/gi;

            const matches = [];
            let match;
            while ((match = regex.exec(text)) !== null) {
                matches.push({
                    text: match[0],
                    index: match.index,
                    length: match[0].length
                });
            }

            if (matches.length > 0) {
                const fragments = [];

                if (matches[0].index > 0) {
                    fragments.push(document.createTextNode(text.substring(0, matches[0].index)));
                }

                for (let i = 0; i < matches.length; i++) {
                    const currentMatch = matches[i];
                    const upperMatchText = currentMatch.text.toUpperCase();
                    const blockEndIndex = (i + 1 < matches.length) ? matches[i+1].index : text.length;

                    const blockText = text.substring(currentMatch.index, blockEndIndex);
                    fragments.push(document.createTextNode(blockText));

                    const container = document.createElement('div');
                    container.className = 'inserted-jacket-container';
                    container.style.cssText = 'margin: 8px 0; display: block;';

                    const placeholder = document.createElement('span');
                    const matchId = `jacket-placeholder-${matchCounter++}`;
                    placeholder.id = matchId;
                    placeholder.className = 'inserted-jacket-placeholder';
                    placeholder.style.cssText = 'color: #888; font-size: 11px; display: block; margin: 4px 0; font-style: italic;';
                    placeholder.innerText = `[🔍 正在获取 ${upperMatchText} 的插图...]`;

                    container.appendChild(placeholder);
                    fragments.push(container);

                    matchesToFetch.push({
                        code: upperMatchText,
                        placeholderId: matchId
                    });
                }

                const parent = node.parentNode;
                if (parent) {
                    fragments.forEach(frag => {
                        parent.insertBefore(frag, node);
                    });
                    parent.removeChild(node);
                }
            }
        });
    }

    // 网络图片获取逻辑
    async function fetchSingleImage(code) {
        // 💡 已优化：硬编码域名改为了 window.location.origin
        const searchBaseUrl = `${window.location.origin}/cn/vl_searchbyid.php?keyword=${encodeURIComponent(code)}`;
        const response = await fetchWithRetry(searchBaseUrl, 2, 800);
        if (!response) return null;
        const htmlText = await response.text();

        const parser = new DOMParser();
        let doc = parser.parseFromString(htmlText, 'text/html');
        let imgEl = doc.querySelector('#video_jacket_img');

        if (!imgEl) {
            const videoEls = doc.querySelectorAll('.videos .video');
            let targetHref = null;

            for (const videoEl of videoEls) {
                const idEl = videoEl.querySelector('.id');
                if (idEl) {
                    const videoIdText = idEl.textContent.trim().toUpperCase();
                    if (videoIdText === code.toUpperCase()) {
                        const anchor = videoEl.querySelector('a');
                        if (anchor) {
                            targetHref = anchor.getAttribute('href');
                            break;
                        }
                    }
                }
            }

            if (targetHref) {
                const nextUrl = new URL(targetHref, searchBaseUrl).href;
                await sleep(500); // 详情跳转缓冲延时
                const nextResponse = await fetchWithRetry(nextUrl, 2, 800);
                if (nextResponse) {
                    const nextHtmlText = await nextResponse.text();
                    const nextDoc = parser.parseFromString(nextHtmlText, 'text/html');
                    imgEl = nextDoc.querySelector('#video_jacket_img');
                }
            }
        }

        if (imgEl) {
            let src = imgEl.getAttribute('src');
            if (src) {
                if (src.startsWith('//')) {
                    src = 'https:' + src;
                } else if (src.startsWith('/')) {
                    src = window.location.origin + src;
                }
                return src;
            }
        }
        return null;
    }

    // 图片交互配置（单击放大，双击磁力，防止冲突）
    function setupImageInteraction(img, code) {
        let clickTimeout = null;

        img.addEventListener('click', () => {
            clearTimeout(clickTimeout);
            clickTimeout = setTimeout(() => {
                toggleImageZoom(img);
            }, 250); // 250ms 用于拦截单击，使双击能够优先执行
        });

        img.addEventListener('dblclick', (e) => {
            clearTimeout(clickTimeout);
            e.preventDefault();
            // 双击逻辑：自动进行 Base64 编码转换并跳转磁力搜索
            const base64Str = utf8ToBase64(code);
            const magnetUrl = `https://clm.cc/search?word=${base64Str}`;
            window.open(magnetUrl, '_blank');
        });
    }

    // 单击放大遮罩弹窗（大尺寸优化版）
    function toggleImageZoom(img) {
        let overlay = document.getElementById('jacket-zoom-overlay');
        if (overlay) {
            overlay.remove();
            return;
        }

        overlay = document.createElement('div');
        overlay.id = 'jacket-zoom-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.85);
            z-index: 10000000;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: zoom-out;
        `;

        const zoomImg = document.createElement('img');
        zoomImg.src = img.src;
        // 使用相对视口的 vw/vh 单位配合 object-fit，强制将原本偏小的封面高保真缩放至接近 150% 观感
        zoomImg.style.cssText = `
            width: 75vw;
            height: 85vh;
            object-fit: contain;
            border-radius: 4px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.5);
        `;

        overlay.appendChild(zoomImg);
        document.body.appendChild(overlay);

        overlay.addEventListener('click', () => {
            overlay.remove();
        });
    }

    // 严格串行单线程队列处理（防止 Cloudflare 1015）
    async function startImageFetchQueue(matchesToFetch) {
        const queue = [...matchesToFetch];
        const imgCache = {};

        while (queue.length > 0) {
            const task = queue.shift();
            if (!task) continue;

            const { code, placeholderId } = task;
            const placeholderEl = document.getElementById(placeholderId);

            try {
                let imgUrl = imgCache[code];
                if (imgUrl === undefined) {
                    // 核心逻辑：在每一次真实的请求前添加 1500ms ~ 2500ms 的纯串行伪随机等待
                    await sleep(1500 + Math.random() * 1000);
                    imgUrl = await fetchSingleImage(code);
                    imgCache[code] = imgUrl;
                }

                if (placeholderEl) {
                    if (imgUrl) {
                        const img = document.createElement('img');
                        img.src = imgUrl;
                        img.className = 'inserted-jacket-img';
                        img.style.cssText = 'max-width: 100%; max-height: 400px; display: block; border-radius: 4px; box-shadow: 0 1px 5px rgba(0,0,0,0.15); cursor: zoom-in; transition: transform 0.2s, opacity 0.3s;';

                        setupImageInteraction(img, code);
                        placeholderEl.parentNode.replaceChild(img, placeholderEl);
                    } else {
                        placeholderEl.style.color = '#ff4d4f';
                        placeholderEl.style.fontWeight = 'bold';
                        placeholderEl.innerText = `[❌ 未找到 ${code} 的封面图片]`;
                    }
                }
            } catch (e) {
                console.error(`[插图失败] 代码: ${code}`, e);
                if (placeholderEl) {
                    placeholderEl.style.color = '#ff4d4f';
                    placeholderEl.style.fontWeight = 'bold';
                    placeholderEl.innerText = `[⚠️ 获取 ${code} 出错]`;
                }
            }
        }
    }


    // ====================== 触发逻辑 ======================

    // 自动批量插图右键菜单触发入口
    insertImgItem.addEventListener('click', () => {
        customCtxMenu.style.display = 'none';
        if (!activePostTable) return;

        activePostTable.querySelectorAll('.inserted-jacket-container').forEach(el => el.remove());

        const postTextEl = activePostTable.querySelector('.posttext');
        if (!postTextEl) {
            alert('未能在该帖子内定位到正文容器！');
            return;
        }

        const matchesToFetch = [];
        walkAndReplace(postTextEl, matchesToFetch);

        if (matchesToFetch.length > 0) {
            // 启动防 Cloudflare 串行请求队列
            startImageFetchQueue(matchesToFetch);
        } else {
            alert('未在此帖子中找到符合规则的代码。');
        }
    });

    // 划词多/单对象插图悬浮按钮触发入口（升级版：支持精准单选和模糊多选）
    insertSelectionBtn.addEventListener('click', () => {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);

            // 1. 拆分边界上的文本节点，避免破坏选区外的 DOM
            let startNode = range.startContainer;
            let startOffset = range.startOffset;
            let endNode = range.endContainer;
            let endOffset = range.endOffset;

            if (startNode.nodeType === Node.TEXT_NODE && startOffset > 0) {
                const nextNode = startNode.splitText(startOffset);
                if (endNode === startNode) {
                    endNode = nextNode;
                    endOffset = endOffset - startOffset;
                }
                startNode = nextNode;
                startOffset = 0;
            }
            if (endNode.nodeType === Node.TEXT_NODE && endOffset < endNode.nodeValue.length) {
                endNode.splitText(endOffset);
            }

            // 2. 创建精确定位选区的临时 Range
            const newRange = document.createRange();
            newRange.setStart(startNode, 0);
            if (endNode.nodeType === Node.TEXT_NODE) {
                newRange.setEnd(endNode, endNode.nodeValue.length);
            } else {
                newRange.setEnd(endNode, endOffset);
            }

            // 3. 收集该 Range 范围内的所有文本节点
            const textNodes = [];
            const commonAncestor = newRange.commonAncestorContainer;

            // 核心修复：如果选区已经收缩到单一文本节点内部，则直接使用它，不再使用 TreeWalker 遍历子节点
            if (commonAncestor.nodeType === Node.TEXT_NODE) {
                textNodes.push(commonAncestor);
            } else {
                const walker = document.createTreeWalker(
                    commonAncestor,
                    NodeFilter.SHOW_TEXT,
                    {
                        acceptNode: function(node) {
                            if (newRange.intersectsNode(node)) {
                                return NodeFilter.FILTER_ACCEPT;
                            }
                            return NodeFilter.FILTER_REJECT;
                        }
                    }
                );

                let currentNode = walker.nextNode();
                while (currentNode) {
                    textNodes.push(currentNode);
                    currentNode = walker.nextNode();
                }
            }

            // 4. 分析、提取并生成插图占位符
            const matchesToFetch = [];
            walkAndReplaceNodes(textNodes, matchesToFetch);

            if (matchesToFetch.length > 0) {
                // 启动防 Cloudflare 串行请求队列进行拉取
                startImageFetchQueue(matchesToFetch);
            } else {
                alert('未在选中的文本中找到符合规则的代码。');
            }

            // 清理选区避免干扰后续操作
            selection.removeAllRanges();
        }
        searchContainer.style.display = 'none';
    });
    // ==================================================================

})();
