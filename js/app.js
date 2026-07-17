/**
 * 网页收藏 - 书签导航应用 (v2.0)
 * 1:1 复刻自 https://nav.iowen.cn/bookmark + 扩展功能
 * 纯前端版本，使用 localStorage 存储数据
 * 
 * 扩展功能1：多级文件夹/分类管理
 * 扩展功能2：深色/亮色主题切换
 * 扩展功能3：批量导入/导出书签
 */
(function ($) {
    'use strict';

    // ===== 配置常量 =====
    const CONFIG = {
        WALLPAPER_BASE: 'https://nav.iowen.cn/wp-content/uploads/wallpapers/images/',
        WALLPAPER_COUNT: 30,
        STORAGE_KEY: 'bm_data_v2',
        DEFAULT_SEARCH: 'baidu',
        SEARCH_ENGINES: {
            baidu: { name: '百度', url: 'https://www.baidu.com/s?wd=', icon: 'assets/search-icons/baidu.svg' },
            google: { name: 'Google', url: 'https://www.google.com/search?q=', icon: 'assets/search-icons/google.svg' },
            bing: { name: 'Bing', url: 'https://www.bing.com/search?q=', icon: 'assets/search-icons/bing.svg' },
            sogou: { name: '搜狗', url: 'https://www.sogou.com/web?query=', icon: 'assets/search-icons/sogou.svg' },
            '360': { name: '360', url: 'https://www.so.com/s?q=', icon: 'assets/search-icons/360.svg' },
            duckduckgo: { name: 'DuckDuckGo', url: 'https://duckduckgo.com/?q=', icon: 'assets/search-icons/duckduckgo.svg' }
        },
        DEFAULT_ICONS: [
            { id: 'bm_1', name: '百度', url: 'https://www.baidu.com', icon: 'https://www.baidu.com/favicon.ico', category: 'root' },
            { id: 'bm_2', name: 'Google', url: 'https://www.google.com', icon: 'https://www.google.com/favicon.ico', category: 'root' },
            { id: 'bm_3', name: 'B站', url: 'https://www.bilibili.com', icon: 'https://www.bilibili.com/favicon.ico', category: 'root' },
            { id: 'bm_4', name: 'GitHub', url: 'https://github.com', icon: 'https://github.com/favicon.ico', category: 'root' },
            { id: 'bm_5', name: '知乎', url: 'https://www.zhihu.com', icon: 'https://www.zhihu.com/favicon.ico', category: 'root' },
            { id: 'bm_6', name: '微博', url: 'https://weibo.com', icon: 'https://weibo.com/favicon.ico', category: 'root' },
            { id: 'bm_7', name: 'CSDN', url: 'https://www.csdn.net', icon: 'https://www.csdn.net/favicon.ico', category: 'root' },
            { id: 'bm_8', name: '淘宝', url: 'https://www.taobao.com', icon: 'https://www.taobao.com/favicon.ico', category: 'root' }
        ]
    };

    // ===== 数据模型 =====
    // Folder: { id, name, parentId: null|string, order: number, icon: string|null }
    // Icon (Bookmark): { id, name, url, icon, category: folderId|'root', order: number, isApp: bool, color: string, iconText: string }

    // ===== 数据管理 =====
    const DataStore = {
        _data: null,
        // ... (existing DataStore methods - omitted for brevity)

        init() {
            const stored = localStorage.getItem(CONFIG.STORAGE_KEY);
            if (stored) {
                try { this._data = JSON.parse(stored); } catch (e) { this._data = null; }
            }
            if (!this._data) {
                this._data = this._getDefaults();
                this.save();
            }
            if (!this._data.folders) this._data.folders = [];
            if (!this._data.folders.find(f => f.id === 'root')) {
                this._data.folders.unshift({ id: 'root', name: '全部书签', parentId: null, order: 0, icon: null });
                this.save();
            }
            return this._data;
        },

        _getDefaults() {
            return {
                icons: CONFIG.DEFAULT_ICONS.map(icon => ({ ...icon, order: 0 })),
                folders: [
                    { id: 'root', name: '全部书签', parentId: null, order: 0, icon: null }
                ],
                settings: {
                    wallpaper: '', blur: 0, brightness: 0, searchEngine: 'baidu',
                    iconSize: 60, iconRadius: 18, iconGapRow: 34, iconGapCol: 30,
                    themeColor: '#f1404b', timeColor: '#ffffff', iconTextColor: '#ffffff'
                }
            };
        },

        save() { localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(this._data)); },
        get() { return this._data; },

        getFolders() { return this._data.folders || []; },
        getRootFolders() { return (this._data.folders || []).filter(f => f.parentId === null || f.parentId === 'root'); },
        getChildFolders(parentId) { return (this._data.folders || []).filter(f => f.parentId === parentId); },
        getFolder(id) { return (this._data.folders || []).find(f => f.id === id); },

        getFolderPath(folderId) {
            const path = [];
            let current = this.getFolder(folderId);
            while (current && current.id !== 'root') { path.unshift(current); current = this.getFolder(current.parentId); }
            return path;
        },

        addFolder(folder) {
            folder.id = 'folder_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
            folder.order = (this._data.folders || []).length;
            if (!this._data.folders) this._data.folders = [];
            this._data.folders.push(folder);
            this.save(); return folder;
        },

        updateFolder(id, data) {
            const idx = (this._data.folders || []).findIndex(f => f.id === id);
            if (idx > -1) { Object.assign(this._data.folders[idx], data); this.save(); }
        },

        removeFolder(id) {
            if (id === 'root') return;
            const folder = this.getFolder(id);
            const parentId = folder ? folder.parentId : 'root';
            this._data.icons.forEach(icon => { if (icon.category === id) icon.category = parentId || 'root'; });
            const children = this.getChildFolders(id);
            children.forEach(child => this.removeFolder(child.id));
            this._data.folders = this._data.folders.filter(f => f.id !== id);
            this.save();
        },

        getIcons(folderId) { const cat = folderId || 'root'; return (this._data.icons || []).filter(i => i.category === cat); },
        getAllIcons() { return this._data.icons || []; },

        addIcon(icon) {
            icon.id = 'icon_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
            if (!icon.order) icon.order = (this._data.icons || []).length;
            this._data.icons.push(icon); this.save(); return icon;
        },

        removeIcon(id) { this._data.icons = this._data.icons.filter(i => i.id !== id); this.save(); },

        updateIcon(id, data) {
            const idx = this._data.icons.findIndex(i => i.id === id);
            if (idx > -1) { Object.assign(this._data.icons[idx], data); this.save(); }
        },

        updateSettings(settings) { Object.assign(this._data.settings, settings); this.save(); },
        getSettings() { return this._data.settings; },

        reorderIcons(icons) {
            icons.forEach((icon, idx) => icon.order = idx);
            this._data.icons = [...icons, ...this._data.icons.filter(i => !icons.find(ic => ic.id === i.id))];
            this.save();
        }
    };

    // ===== 工具函数 =====
    const Utils = {
        padZero(n) { return n < 10 ? '0' + n : '' + n; },
        getWallpaperUrl(index) {
            index = index || Math.floor(Math.random() * CONFIG.WALLPAPER_COUNT) + 1;
            return CONFIG.WALLPAPER_BASE + String(index).padStart(3, '0') + '.jpg';
        },
        getFaviconUrl(url) { try { const u = new URL(url); return u.origin + '/favicon.ico'; } catch (e) { return ''; } },
        debounce(fn, delay) { let timer; return function (...args) { clearTimeout(timer); timer = setTimeout(() => fn.apply(this, args), delay); }; },
        getIconText(name) { if (!name) return '?'; const match = name.match(/[\u4e00-\u9fa5a-zA-Z0-9]/); return match ? match[0].toUpperCase() : name.charAt(0).toUpperCase(); },
        generateId(prefix) { return prefix + '_' + Date.now() + '_' + Math.random().toString(36).substr(2, 8); },

        // 文件下载
        downloadFile(content, filename, mimeType) {
            const blob = new Blob([content], { type: mimeType || 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url; a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        },

        // 文件上传读取
        readFileAsText(file) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = e => resolve(e.target.result);
                reader.onerror = reject;
                reader.readAsText(file);
            });
        }
    };

    // ===== 时钟 =====
    const Clock = {
        init() { this.update(); setInterval(() => this.update(), 1000); },
        update() { const now = new Date(); $('.bm-time-text .hh').text(Utils.padZero(now.getHours())); $('.bm-time-text .mm').text(Utils.padZero(now.getMinutes())); $('.bm-time-text .ss').text(Utils.padZero(now.getSeconds())); }
    };

    // ===== 壁纸 =====
    const Wallpaper = {
        init() { const s = DataStore.getSettings(); $('.wallpaper-img').attr('src', s.wallpaper || Utils.getWallpaperUrl()); this.applyBlur(s.blur); this.applyBrightness(s.brightness); },
        applyBlur(val) { document.documentElement.style.setProperty('--wallpaper-blur', val + 'px'); },
        applyBrightness(val) { document.documentElement.style.setProperty('--wallpaper-brightness', val / 100); }
    };

    // ===== 搜索 =====
    const Search = {
        currentEngine: 'baidu',
        init() { const s = DataStore.getSettings(); this.currentEngine = s.searchEngine || CONFIG.DEFAULT_SEARCH; this.renderEngineIcon(); this.renderEngineDropdown(); this.bindEvents(); },
        renderEngineIcon() { const e = CONFIG.SEARCH_ENGINES[this.currentEngine]; if (e) { $('.search-type-img').attr('src', e.icon); $('input[name="search_type"]').val(this.currentEngine); } },
        renderEngineDropdown() { const $d = $('.search-type-dropdown'); $d.empty(); Object.keys(CONFIG.SEARCH_ENGINES).forEach(k => { const e = CONFIG.SEARCH_ENGINES[k]; $d.append('<div class="search-type-item-btn" data-engine="' + k + '"><img src="' + e.icon + '" alt="' + e.name + '" title="' + e.name + '"></div>'); }); },
        bindEvents() {
            const $i = $('#search-text'), $tb = $('.search-type-box'), $td = $('.search-type-dropdown'), $c = $('.search-clear'), $st = $('.search-smart-tips');
            $tb.on('click', e => { e.stopPropagation(); $td.toggleClass('active'); });
            $td.on('click', '.search-type-item-btn', e => { const eng = $(e.currentTarget).data('engine'); this.currentEngine = eng; this.renderEngineIcon(); $td.removeClass('active'); DataStore.updateSettings({ searchEngine: eng }); });
            $(document).on('click', () => { $td.removeClass('active'); $st.hide(); });
            $i.on('input', () => { const v = $i.val().trim(); v ? ($c.show(), this.showSmartTips(v)) : ($c.hide(), $st.hide()); });
            $c.on('click', () => { $i.val('').focus(); $c.hide(); $st.hide(); });
            $i.on('keydown', e => { if (e.key === 'Enter') { const v = $i.val().trim(); if (v) this.doSearch(v); } if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); this.navigateSmartTips(e.key === 'ArrowDown' ? 'down' : 'up'); } });
            $st.on('click', 'li', e => { const t = $(e.currentTarget).data('text') || $(e.currentTarget).text(); $i.val(t); $st.hide(); this.doSearch(t); });
        },
        doSearch(q) { const e = CONFIG.SEARCH_ENGINES[this.currentEngine]; if (e) window.open(e.url + encodeURIComponent(q), '_blank'); },
        showSmartTips(q) { const tips = DataStore.getAllIcons().map(i => i.name).filter(n => n.includes(q)).slice(0, 8); const $st = $('.search-smart-tips'); const $u = $st.find('ul'); $u.empty(); tips.forEach(t => $u.append('<li data-text="' + t + '">' + t + '</li>')); $st.toggle(tips.length > 0); },
        navigateSmartTips(dir) { const $i = $('.search-smart-tips li'); if (!$i.length) return; let idx = $i.index($('.search-smart-tips li.current')); $i.removeClass('current'); idx = dir === 'down' ? (idx + 1) % $i.length : (idx - 1 + $i.length) % $i.length; $i.eq(idx).addClass('current'); }
    };

    // ===== 导航栏 =====
    const NavBar = {
        currentFolderId: 'root', folderStack: [],
        init() { this.renderBreadcrumb(); this.renderFolderTree(); this.renderGrid(); this.bindEvents(); },
        renderBreadcrumb() { const path = DataStore.getFolderPath(this.currentFolderId); const $b = $('#breadcrumb-nav'); $b.empty(); $b.append('<span class="bread-item" data-folder="root"><i class="iconfont icon-home mr-1"></i>全部书签</span>'); path.forEach(f => { $b.append('<span class="bread-sep">›</span>'); $b.append('<span class="bread-item" data-folder="' + f.id + '">' + f.name + '</span>'); }); },
        renderFolderTree() { const $t = $('#folder-tree'); $t.empty(); DataStore.getRootFolders().forEach(f => { if (f.id === 'root') return; const a = f.id === this.currentFolderId; const c = DataStore.getChildFolders(f.id); $t.append('<div class="folder-tree-item' + (a ? ' active' : '') + '" data-folder="' + f.id + '"><span class="folder-tree-icon"><i class="iconfont icon-folder' + (c.length > 0 ? '' : '-o') + '"></i></span><span class="folder-tree-name">' + f.name + '</span><span class="folder-tree-count">' + DataStore.getIcons(f.id).length + '</span></div>'); }); },
        renderGrid() { Icons.render(this.currentFolderId); },
        navigateTo(folderId) { this.currentFolderId = folderId; this.renderBreadcrumb(); this.renderFolderTree(); this.renderGrid(); this.updateTopbar(); },
        updateTopbar() { const f = DataStore.getFolder(this.currentFolderId); const n = f ? f.name : '全部书签'; if ($('#current-folder-name').length) $('#current-folder-name').text(n); },
        bindEvents() {
            $('#breadcrumb-nav').on('click', '.bread-item', e => { this.navigateTo($(e.currentTarget).data('folder')); });
            $('#folder-tree').on('click', '.folder-tree-item', e => { this.navigateTo($(e.currentTarget).data('folder')); });
            $('#btn-new-folder, #btn-sidebar-new-folder').on('click', () => { this.createFolder(); });
        },
        createFolder() { const n = prompt('请输入文件夹名称：'); if (!n || !n.trim()) return; DataStore.addFolder({ name: n.trim(), parentId: this.currentFolderId === 'root' ? null : this.currentFolderId, icon: null }); this.renderFolderTree(); this.renderGrid(); }
    };

    // ===== 图标网格 =====
    const Icons = {
        render(folderId) {
            const $c = $('#links_slides'); $c.empty();
            $c.append('<div class="folder-toolbar mb-2"><div class="d-flex align-items-center justify-content-between" style="padding: 0 20px;"><div id="breadcrumb-nav" class="breadcrumb-nav"></div><div class="folder-actions"><button class="btn vc-l-white btn-sm mr-2" id="btn-new-folder"><i class="iconfont icon-add-o mr-1"></i>新建文件夹</button><button class="btn vc-l-white btn-sm mr-2" id="btn-import"><i class="iconfont icon-download mr-1"></i>导入</button><button class="btn vc-l-white btn-sm" id="btn-export"><i class="iconfont icon-upload mr-1"></i>导出</button></div></div></div>');
            NavBar.renderBreadcrumb();

            const $grid = $('<div class="d-grid grid-cols-xl-10 grid-cols-lg-8 grid-cols-md-6 grid-cols-sm-4 grid-cols-3" id="icon-grid">');
            DataStore.getChildFolders(folderId).forEach(f => $grid.append(this.createFolderItem(f)));
            DataStore.getIcons(folderId).forEach(icon => $grid.append(this.createIconItem(icon)));
            $c.append($grid);

            if (DataStore.getChildFolders(folderId).length === 0 && DataStore.getIcons(folderId).length === 0 && folderId !== 'root') {
                $c.append('<div class="text-center py-5" style="color:rgba(255,255,255,.6);font-size:16px;">此文件夹为空</div>');
            }

            if (typeof Sortable !== 'undefined') {
                Sortable.create($grid[0], { animation: 150, ghostClass: 'sortable-ghost', group: 'bookmarks',
                    onEnd: () => { const items = []; $grid.find('.links-item[data-type="icon"]').each(function () { const id = $(this).data('id'); const icon = DataStore.getAllIcons().find(i => i.id === id); if (icon) items.push(icon); }); DataStore.reorderIcons(items); },
                    onAdd: evt => { const id = $(evt.item).data('id'); const type = $(evt.item).data('type'); if (type === 'icon') DataStore.updateIcon(id, { category: folderId || 'root' }); }
                });
            }

            $('#btn-add-icon').off('click').on('click', () => Popup.openAdd());
            $('#btn-import').off('click').on('click', () => ImportExport.import());
            $('#btn-export').off('click').on('click', () => ImportExport.export());

            $c.on('dblclick', '.folder-item-container', e => { this.navigateTo($(e.currentTarget).closest('.links-item').data('id')); });
        },
        navigateTo(fid) { NavBar.navigateTo(fid); },

        createFolderItem(folder) {
            const icons = DataStore.getIcons(folder.id).slice(0, 4);
            const $item = $('<div class="links-item i1x1 folder-item-container" data-id="' + folder.id + '" data-type="folder">');
            let html = icons.length > 0
                ? '<div class="folder-content">' + icons.map(ic => '<div class="folder-item"><div class="i-body"><div class="i-font-icon" style="background:' + (ic.color || '#666') + ';font-size:10px;">' + Utils.getIconText(ic.name) + '</div></div></div>').join('') + '</div>'
                : '<div class="i-body"><div class="i-font-icon" style="background:rgba(255,255,255,.15);"><i class="iconfont icon-folder" style="font-size:24px;"></i></div></div>';
            $item.append(html);
            $item.append('<span class="i-title line1">' + folder.name + '</span>');
            $item.on('contextmenu', e => { e.preventDefault(); this.showFolderContextMenu(e, folder); });
            return $item;
        },

        createIconItem(icon) {
            const $item = $('<div class="links-item i1x1" data-id="' + icon.id + '" data-type="icon">');
            const $body = $('<a class="i-body" href="' + icon.url + '" target="_blank" title="' + icon.name + '">');
            if (icon.icon) {
                $body.append('<img class="i-img" src="' + icon.icon + '" alt="' + icon.name + '" loading="lazy" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'flex\'"><div class="i-font-icon" style="display:none;">' + Utils.getIconText(icon.name) + '</div>');
            } else if (icon.color) {
                $body.append('<div class="i-font-icon" style="background:' + icon.color + ';">' + (icon.iconText || Utils.getIconText(icon.name)) + '</div>');
            } else {
                $body.append('<div class="i-font-icon" style="background:#666;">' + Utils.getIconText(icon.name) + '</div>');
            }
            $item.append($body);
            $item.append('<span class="i-title line1">' + icon.name + '</span>');
            $item.on('contextmenu', e => { e.preventDefault(); this.showIconContextMenu(e, icon); });
            return $item;
        },

        showIconContextMenu(e, icon) {
            const $m = $('#context-menu');
            $m.html('<div class="bm-menu-item edit-icon" data-id="' + icon.id + '"><i class="iconfont icon-edit mr-2"></i>编辑</div><div class="bm-menu-item move-icon"><i class="iconfont icon-folder mr-2"></i>移动到...</div><div class="bm-menu-item delete-icon" data-id="' + icon.id + '"><i class="iconfont icon-delete mr-2"></i>删除</div>');
            $m.css({ top: e.clientY + 'px', left: e.clientX + 'px', display: 'block' });
            $(document).one('click', () => $m.hide());
            $m.find('.edit-icon').on('click', () => { $m.hide(); Popup.openEdit(icon); });
            $m.find('.move-icon').on('click', () => { $m.hide(); this.showMoveDialog(icon); });
            $m.find('.delete-icon').on('click', () => { $m.hide(); if (confirm('确定删除 "' + icon.name + '" 吗？')) { DataStore.removeIcon(icon.id); Icons.render(NavBar.currentFolderId); } });
        },

        showFolderContextMenu(e, folder) {
            const $m = $('#context-menu');
            $m.html('<div class="bm-menu-item rename-folder" data-id="' + folder.id + '"><i class="iconfont icon-edit mr-2"></i>重命名</div><div class="bm-menu-item delete-folder" data-id="' + folder.id + '"><i class="iconfont icon-delete mr-2"></i>删除文件夹</div>');
            $m.css({ top: e.clientY + 'px', left: e.clientX + 'px', display: 'block' });
            $(document).one('click', () => $m.hide());
            $m.find('.rename-folder').on('click', () => { $m.hide(); const n = prompt('请输入新名称：', folder.name); if (n && n.trim()) { DataStore.updateFolder(folder.id, { name: n.trim() }); Icons.render(NavBar.currentFolderId); } });
            $m.find('.delete-folder').on('click', () => { $m.hide(); if (confirm('确定删除文件夹 "' + folder.name + '" 吗？\n文件夹内的书签将移到上级文件夹。')) { DataStore.removeFolder(folder.id); Icons.render(NavBar.currentFolderId); } });
        },

        showMoveDialog(icon) {
            const folders = DataStore.getFolders().filter(f => f.id !== 'root' && f.id !== icon.category);
            if (folders.length === 0) { alert('没有可移动到的文件夹。请先创建文件夹。'); return; }
            const choice = prompt('选择目标文件夹（输入数字）：\n' + folders.map((f, i) => (i + 1) + '. ' + f.name).join('\n') + '\n按取消放弃移动');
            if (choice) { const idx = parseInt(choice) - 1; if (idx >= 0 && idx < folders.length) { DataStore.updateIcon(icon.id, { category: folders[idx].id }); Icons.render(NavBar.currentFolderId); } }
        }
    };

    // ===== 添加/编辑图标弹窗 =====
    const Popup = {
        init() { this.bindEvents(); },
        openAdd() { $('input[name="icon-id"]').val(''); $('#link-url, #link-name').val(''); $('#link-app').prop('checked', false); $('#online-icon').prop('checked', true).trigger('change'); $('.color-icon-name, .link-icon-url').val(''); $('input[name="link-color"]').val(''); $('#bm-add-icon-popup').addClass('show').css('display', 'block'); $('body').addClass('modal-open'); },
        openEdit(icon) { $('#link-url').val(icon.url); $('#link-name').val(icon.name); $('#link-app').prop('checked', icon.isApp || false); $('input[name="icon-id"]').val(icon.id); if (icon.color) { $('#color-icon').prop('checked', true).trigger('change'); $('input[name="link-color"]').val(icon.color); $('.color-icon-name').val(icon.iconText || ''); $('.color-preview-img').css('background-color', icon.color).text(icon.iconText || Utils.getIconText(icon.name)); } else if (icon.icon && icon.icon.startsWith('http')) { $('#online-icon').prop('checked', true).trigger('change'); $('.link-icon-url').val(''); } else { $('#link-icon').prop('checked', true).trigger('change'); $('.link-icon-url').val(icon.icon || ''); } $('#bm-add-icon-popup').addClass('show').css('display', 'block'); $('body').addClass('modal-open'); },
        close() { $('#bm-add-icon-popup').removeClass('show').css('display', 'none'); $('body').removeClass('modal-open'); $('.custom-icon-box, .add-gadget-box').removeClass('show'); $('#bm-add-icon-popup').removeClass('second'); $('.default-icon-box').css('transform', ''); },
        bindEvents() {
            $('[data-dismiss="modal"]').on('click', () => this.close());
            $('.show-custom-icon-box').on('click', () => { $('#bm-add-icon-popup').addClass('second'); $('.custom-icon-box').addClass('show'); $('.default-icon-box').css('transform', 'scale(0.9)'); $('input[name="icon-id"]').val(''); });
            $('.hide-custom-icon-box').on('click', () => { $('#bm-add-icon-popup').removeClass('second'); $('.custom-icon-box').removeClass('show'); $('.default-icon-box').css('transform', ''); });
            $('.show-gadget-box').on('click', () => { $('#bm-add-icon-popup').addClass('second'); $('.add-gadget-box').addClass('show'); $('.default-icon-box').css('transform', 'scale(0.9)'); });
            $('.hide-add-gadget-box').on('click', () => { $('#bm-add-icon-popup').removeClass('second'); $('.add-gadget-box').removeClass('show'); $('.default-icon-box').css('transform', ''); });
            $('input[name="icon-type"]').on('change', e => { $('.icon-set-box').hide(); $('.icon-set-box[data-value="' + $(e.currentTarget).val() + '"]').show(); });
            $('.icon-set-box').hide(); $('.icon-set-box[data-value="online-icon"]').show();
            $('.icon-set-box').on('click', '.color-item', e => { const c = $(e.currentTarget).data('color'); $('input[name="link-color"]').val(c); $('.color-preview-img').css('background-color', c); });
            $('.background-color-input').on('input', e => { const c = $(e.currentTarget).val(); $('input[name="link-color"]').val(c); $('.color-preview-img').css('background-color', c); });
            $('.color-icon-name').on('input', e => { const v = $(e.currentTarget).val() || 'O'; $('.color-preview-img').text(v.charAt(0).toUpperCase()); });
            $('.add-icon-btn').on('click', () => this.saveIcon());
            $(document).on('dblclick', '.links-carousel', e => { if ($(e.target).closest('.folder-toolbar, .breadcrumb-nav, .btn').length === 0) this.openAdd(); });
        },
        saveIcon() {
            const url = $('#link-url').val().trim(), name = $('#link-name').val().trim(), iconType = $('input[name="icon-type"]:checked').val(), isApp = $('#link-app').is(':checked'), iconId = $('input[name="icon-id"]').val();
            if (!url) { alert('请输入链接地址'); return; } if (!name) { alert('请输入链接名称'); return; }
            let data = { url, name, isApp, category: NavBar.currentFolderId || 'root', order: DataStore.getAllIcons().length };
            switch (iconType) { case 'online-icon': data.icon = Utils.getFaviconUrl(url); break; case 'upload-icon': data.icon = ''; break; case 'color-icon': data.color = $('input[name="link-color"]').val() || '#666'; data.iconText = $('.color-icon-name').val() || Utils.getIconText(name); break; case 'link-icon': data.icon = $('.link-icon-url').val().trim() || Utils.getFaviconUrl(url); break; }
            iconId ? DataStore.updateIcon(iconId, data) : DataStore.addIcon(data);
            Icons.render(NavBar.currentFolderId); this.close();
        }
    };

    // ===== 主题管理 =====
    const ThemeManager = {
        currentTheme: 'dark',
        init() { const s = localStorage.getItem('bm_theme') || 'dark'; this.currentTheme = s; this.applyTheme(s); this.bindEvents(); },
        applyTheme(theme) { this.currentTheme = theme; $('body').removeClass('dark-mode light-mode').addClass(theme === 'dark' ? 'dark-mode' : 'light-mode'); $('#theme-toggle-btn i').attr('class', theme === 'dark' ? 'iconfont icon-moon' : 'iconfont icon-sun'); localStorage.setItem('bm_theme', theme); DataStore.updateSettings({ theme }); },
        toggle() { this.applyTheme(this.currentTheme === 'dark' ? 'light' : 'dark'); },
        bindEvents() { $('#theme-toggle-btn').on('click', () => this.toggle()); }
    };

    // ===== 批量导入/导出 =====
    const ImportExport = {
        import() {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json,.html';
            input.onchange = async (e) => {
                const file = e.target.files[0];
                if (!file) return;
                try {
                    const content = await Utils.readFileAsText(file);
                    if (file.name.endsWith('.json')) {
                        this.importJSON(content);
                    } else if (file.name.endsWith('.html')) {
                        this.importBrowserBookmarks(content);
                    }
                } catch (err) {
                    alert('导入失败：' + err.message);
                }
            };
            input.click();
        },

        importJSON(content) {
            try {
                const data = JSON.parse(content);
                let count = 0;
                if (data.icons && Array.isArray(data.icons)) {
                    data.icons.forEach(ic => { DataStore.addIcon({ name: ic.name, url: ic.url, icon: ic.icon, category: ic.category || 'root', color: ic.color, iconText: ic.iconText }); count++; });
                }
                if (data.folders && Array.isArray(data.folders)) {
                    data.folders.forEach(f => { if (f.id !== 'root') DataStore.addFolder({ name: f.name, parentId: f.parentId || null }); });
                }
                Icons.render(NavBar.currentFolderId);
                alert('成功导入 ' + count + ' 个书签！');
            } catch (e) {
                alert('JSON 格式错误：' + e.message);
            }
        },

        importBrowserBookmarks(htmlContent) {
            const parser = new DOMParser();
            const doc = parser.parseFromString(htmlContent, 'text/html');
            let count = 0;
            const processList = (list, parentCategory) => {
                $(list).find('> DT').each(function () {
                    const $dt = $(this);
                    const $h3 = $dt.children('H3');
                    const $a = $dt.children('A');
                    if ($h3.length) {
                        const folderName = $h3.text().trim();
                        const folder = DataStore.addFolder({ name: folderName, parentId: parentCategory === 'root' ? null : parentCategory });
                        const $dl = $dt.children('DL');
                        if ($dl.length) processList($dl[0], folder.id);
                    } else if ($a.length) {
                        const name = $a.text().trim() || '未命名';
                        const url = $a.attr('href') || '';
                        if (url && !url.startsWith('place:')) {
                            DataStore.addIcon({ name, url, icon: Utils.getFaviconUrl(url), category: parentCategory || 'root' });
                            count++;
                        }
                    }
                });
            };
            const $dl = $(doc).find('DL').first();
            if ($dl.length) processList($dl[0], 'root');
            Icons.render(NavBar.currentFolderId);
            alert('成功导入 ' + count + ' 个书签！');
        },

        export() {
            const data = DataStore.get();
            const exportData = {
                version: '2.0',
                exportDate: new Date().toISOString(),
                folders: data.folders.filter(f => f.id !== 'root').map(f => ({ name: f.name, parentId: f.parentId })),
                icons: data.icons.map(ic => ({ name: ic.name, url: ic.url, icon: ic.icon, category: ic.category, color: ic.color, iconText: ic.iconText, isApp: ic.isApp }))
            };
            const json = JSON.stringify(exportData, null, 2);
            const filename = 'bookmarks-backup-' + new Date().toISOString().slice(0, 10) + '.json';
            Utils.downloadFile(json, filename, 'application/json');
        }
    };

    // ===== 登录弹窗 =====
    const LoginModal = {
        init() {
            setTimeout(() => { if (!localStorage.getItem('bm_login_dismissed')) $('.bm-login-modal').addClass('show').css('display', 'block'); }, 3000);
            $('.bm-login-modal .close').on('click', () => { $('.bm-login-modal').removeClass('show').css('display', 'none'); localStorage.setItem('bm_login_dismissed', '1'); });
            $('.login-btn').on('click', () => { alert('登录功能将在后续扩展中实现。\n当前为本地存储模式，所有数据保存在浏览器中。'); });
        }
    };

    // ===== 应用初始化 =====
    const App = {
        init() {
            DataStore.init();
            NavBar.init();
            setTimeout(() => $('.full-loading').addClass('load-out'), 300);
            ThemeManager.init();
            Clock.init();
            Wallpaper.init();
            Search.init();
            Popup.init();
            LoginModal.init();
            const s = DataStore.getSettings();
            if (s.themeColor) { document.documentElement.style.setProperty('--theme-color', s.themeColor); document.documentElement.style.setProperty('--hover-color', s.themeColor + 'dd'); }
            console.log('📑 网页收藏导航 v2.0'); console.log('💾 数据存储在 localStorage，key: ' + CONFIG.STORAGE_KEY);
        }
    };

    if (typeof $ !== 'undefined') { $(document).ready(() => App.init()); }
    else {
        document.addEventListener('DOMContentLoaded', () => {
            const check = setInterval(() => { if (typeof $ !== 'undefined' && typeof jQuery !== 'undefined') { clearInterval(check); $(document).ready(() => App.init()); } }, 100);
        });
    }
})(typeof jQuery !== 'undefined' ? jQuery : null);