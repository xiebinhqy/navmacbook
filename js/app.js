/**
 * Bookmark Desktop - macOS 桌面风格书签导航
 * v3.0 - 全新 macOS 风格 UI
 */
(function ($) {
    'use strict';

    const STORAGE_KEY = 'bm_data_v3';

    const DEFAULT_ICONS = [
        { id: 'bm_1', name: '百度', url: 'https://www.baidu.com', icon: 'assets/search-icons/baidu.svg', folder: 'root' },
        { id: 'bm_2', name: 'Google', url: 'https://www.google.com', icon: 'assets/search-icons/google.svg', folder: 'root' },
        { id: 'bm_3', name: 'B站', url: 'https://www.bilibili.com', icon: 'assets/search-icons/bing.svg', folder: 'root' },
        { id: 'bm_4', name: 'GitHub', url: 'https://github.com', icon: 'assets/search-icons/duckduckgo.svg', folder: 'root' },
        { id: 'bm_5', name: '知乎', url: 'https://www.zhihu.com', icon: 'assets/search-icons/sogou.svg', folder: 'root' },
        { id: 'bm_6', name: '微博', url: 'https://weibo.com', icon: 'assets/search-icons/360.svg', folder: 'root' },
    ];

    // ===== DataStore =====
    const Store = {
        _data: null,
        init() {
            try { this._data = JSON.parse(localStorage.getItem(STORAGE_KEY)); } catch(e) {}
            if (!this._data) {
                this._data = {
                    folders: [{ id: 'root', name: '全部', parent: null }],
                    icons: DEFAULT_ICONS.map(i => ({...i})),
                    settings: { theme: 'dark', wallpaper: '', blur: 0, brightness: 0 }
                };
                this.save();
            }
            if (!this._data.folders.find(f => f.id === 'root')) {
                this._data.folders.unshift({ id: 'root', name: '全部', parent: null });
            }
            return this._data;
        },
        save() { localStorage.setItem(STORAGE_KEY, JSON.stringify(this._data)); },
        get() { return this._data; },
        getFolders() { return this._data.folders || []; },
        getRootFolders() { return this._data.folders.filter(f => f.parent === null || f.parent === 'root'); },
        getChildFolders(pid) { return this._data.folders.filter(f => f.parent === pid); },
        getFolder(id) { return this._data.folders.find(f => f.id === id); },

        addFolder(f) {
            f.id = 'f_' + Date.now() + '_' + Math.random().toString(36).substr(2,4);
            this._data.folders.push(f);
            this.save(); return f;
        },
        updateFolder(id, data) {
            const idx = this._data.folders.findIndex(f => f.id === id);
            if (idx > -1) { Object.assign(this._data.folders[idx], data); this.save(); }
        },
        removeFolder(id) {
            if (id === 'root') return;
            const f = this.getFolder(id);
            const pid = f ? f.parent : 'root';
            this._data.icons.forEach(ic => { if (ic.folder === id) ic.folder = pid || 'root'; });
            this.getChildFolders(id).forEach(c => this.removeFolder(c.id));
            this._data.folders = this._data.folders.filter(f => f.id !== id);
            this.save();
        },

        getIcons(folderId) { const f = folderId || 'root'; return this._data.icons.filter(i => i.folder === f); },
        getAllIcons() { return this._data.icons || []; },
        addIcon(ic) {
            ic.id = 'ic_' + Date.now() + '_' + Math.random().toString(36).substr(2,6);
            this._data.icons.push(ic);
            this.save(); return ic;
        },
        removeIcon(id) { this._data.icons = this._data.icons.filter(i => i.id !== id); this.save(); },
        updateIcon(id, data) {
            const idx = this._data.icons.findIndex(i => i.id === id);
            if (idx > -1) { Object.assign(this._data.icons[idx], data); this.save(); }
        },
        getSettings() { return this._data.settings; },
        updateSettings(s) { Object.assign(this._data.settings, s); this.save(); },

        reorderIcons(icons) {
            icons.forEach((ic, i) => ic.order = i);
            this._data.icons = [...icons, ...this._data.icons.filter(ic => !icons.find(x => x.id === ic.id))];
            this.save();
        }
    };

    // ===== Utils =====
    const U = {
        pad(n) { return n < 10 ? '0' + n : '' + n; },
        iconText(name) {
            if (!name) return '?';
            const m = name.match(/[\u4e00-\u9fa5a-zA-Z0-9]/);
            return m ? m[0].toUpperCase() : name[0].toUpperCase();
        },
        favicon(url) { try { return new URL(url).origin + '/favicon.ico'; } catch(e) { return ''; } },
        download(content, fn, type) {
            const blob = new Blob([content], { type: type || 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url; a.download = fn;
            document.body.appendChild(a); a.click(); document.body.removeChild(a);
            URL.revokeObjectURL(url);
        },
        readFile(file) {
            return new Promise((res, rej) => {
                const r = new FileReader();
                r.onload = e => res(e.target.result);
                r.onerror = rej;
                r.readAsText(file);
            });
        }
    };

    // ===== App State =====
    let currentFolder = 'root';
    let currentTheme = 'dark';

    // ===== Render Desktop =====
    function renderDesktop(folderId) {
        const fid = folderId || currentFolder;
        currentFolder = fid;
        const $grid = $('#desktopGrid');
        $grid.empty();

        // Folders
        Store.getChildFolders(fid).forEach(f => {
            const icons = Store.getIcons(f.id).slice(0, 4);
            const $div = $('<div class="desktop-icon folder-item" data-id="' + f.id + '" data-type="folder">');
            let inner = icons.length
                ? '<div class="icon-wrap">' + icons.map(ic =>
                    '<div class="mini-icon" style="background:' + (ic.color || 'rgba(255,255,255,.08)') + '">' + U.iconText(ic.name) + '</div>'
                ).join('') + '</div>'
                : '<div class="icon-wrap"><i class="iconfont icon-folder" style="font-size:28px;color:rgba(255,255,255,.6);"></i></div>';
            $div.append(inner);
            $div.append('<span class="icon-label">' + f.name + '</span>');
            $grid.append($div);
        });

        // Icons
        Store.getIcons(fid).forEach(ic => {
            const $div = $('<div class="desktop-icon" data-id="' + ic.id + '" data-type="icon">');
            let inner = '';
            if (ic.icon) {
                inner = '<div class="icon-wrap"><img src="' + ic.icon + '" alt="" onerror="this.style.display=\'none\';this.nextSibling.style.display=\'flex\'"><div class="i-font" style="display:none;background:' + (ic.color || '#666') + '">' + U.iconText(ic.name) + '</div></div>';
            } else if (ic.color) {
                inner = '<div class="icon-wrap"><div class="i-font" style="background:' + ic.color + '">' + (ic.iconText || U.iconText(ic.name)) + '</div></div>';
            } else {
                inner = '<div class="icon-wrap"><div class="i-font" style="background:#666">' + U.iconText(ic.name) + '</div></div>';
            }
            $div.append(inner);
            $div.append('<span class="icon-label">' + ic.name + '</span>');
            $grid.append($div);
        });

        // Folder chips in menu
        renderFolderChips(fid);
        renderDock();
    }

    // ===== Render Folder Chips (Menu Center) =====
    function renderFolderChips(fid) {
        const $c = $('#folderChips');
        $c.empty();

        // Root chip
        const $root = $('<span class="folder-chip' + (fid === 'root' ? ' active' : '') + '" data-id="root">📁 全部</span>');
        $c.append($root);

        // Path chips
        let current = Store.getFolder(fid);
        const path = [];
        while (current && current.id !== 'root') {
            path.unshift(current);
            current = Store.getFolder(current.parent);
        }
        path.forEach(f => {
            $c.append('<span class="folder-chip-sep">›</span>');
            $c.append('<span class="folder-chip' + (f.id === fid ? ' active' : '') + '" data-id="' + f.id + '">' + f.name + '</span>');
        });

        $c.find('.folder-chip').on('click', function () {
            renderDesktop($(this).data('id'));
        });
    }

    // ===== Render Dock =====
    function renderDock() {
        const $dock = $('#dock');
        $dock.empty();
        const folders = Store.getRootFolders();
        folders.forEach(f => {
            if (f.id === 'root') return;
            const $item = $('<div class="dock-item" data-id="' + f.id + '">');
            $item.append('<div class="dock-icon"><i class="iconfont icon-folder" style="font-size:20px;color:rgba(255,255,255,.7);"></i></div>');
            $item.append('<span class="dock-label">' + f.name + '</span>');
            $dock.append($item);
        });
        if (folders.filter(f => f.id !== 'root').length > 0) {
            $dock.append('<div class="dock-sep"></div>');
        }
        $dock.append('<div class="dock-item" id="dockNewFolder"><div class="dock-icon"><i class="iconfont icon-add-o" style="font-size:20px;color:rgba(255,255,255,.7);"></i></div><span class="dock-label">新建文件夹</span></div>');

        $dock.find('.dock-item').on('click', function () {
            const id = $(this).data('id');
            if (id) renderDesktop(id);
        });
    }

    // ===== Clock =====
    function updateClock() {
        const d = new Date();
        $('#clockDisplay').text(U.pad(d.getHours()) + ':' + U.pad(d.getMinutes()));
    }

    // ===== Theme =====
    function setTheme(theme) {
        currentTheme = theme;
        $('body').removeClass('dark-mode light-mode').addClass(theme === 'dark' ? 'dark-mode' : 'light-mode');
        const $i = $('#themeBtn i');
        $i.attr('class', theme === 'dark' ? 'iconfont icon-moon' : 'iconfont icon-sun');
        localStorage.setItem('bm_theme_v3', theme);
        Store.updateSettings({ theme });
    }
    function toggleTheme() { setTheme(currentTheme === 'dark' ? 'light' : 'dark'); }

    // ===== Wallpaper =====
    function setWallpaper(url) {
        if (!url) {
            const n = Math.floor(Math.random() * 30) + 1;
            url = 'https://nav.iowen.cn/wp-content/uploads/wallpapers/images/' + String(n).padStart(3,'0') + '.jpg';
        }
        $('.wallpaper-img').attr('src', url);
    }
    function applyBlur(val) { document.documentElement.style.setProperty('--wp-blur', val + 'px'); }
    function applyBrightness(val) { document.documentElement.style.setProperty('--wp-brightness', val / 100); }

    // ===== Window (Finder) =====
    let winVisible = false;
    let winZIndex = 100;

    function openWindow(title, folderId) {
        const $win = $('#macWindow');
        winZIndex++;
        $win.css('z-index', winZIndex);
        $('#winTitle').text(title);
        const $c = $('#winContent');
        $c.empty();

        const folders = Store.getChildFolders(folderId);
        const icons = Store.getIcons(folderId);

        const $grid = $('<div class="d-grid">');
        folders.forEach(f => {
            $grid.append(
                '<div class="win-icon-item" data-id="' + f.id + '" data-type="folder">' +
                '<div class="wi-wrap"><i class="iconfont icon-folder" style="font-size:22px;color:#666;"></i></div>' +
                '<span class="wi-label">' + f.name + '</span></div>'
            );
        });
        icons.forEach(ic => {
            let img = ic.icon
                ? '<img src="' + ic.icon + '" alt="" onerror="this.style.display=\'none\';this.nextSibling.style.display=\'flex\'"><div class="wi-font" style="display:none;background:' + (ic.color || '#666') + '">' + U.iconText(ic.name) + '</div>'
                : '<div class="wi-font" style="background:' + (ic.color || '#666') + '">' + U.iconText(ic.name) + '</div>';
            $grid.append(
                '<div class="win-icon-item" data-id="' + ic.id + '" data-type="icon" data-url="' + (ic.url || '') + '">' +
                '<div class="wi-wrap">' + img + '</div>' +
                '<span class="wi-label">' + ic.name + '</span></div>'
            );
        });

        $c.append($grid);

        // Click handlers
        $c.find('.win-icon-item[data-type="folder"]').on('dblclick', function () {
            openWindow($(this).find('.wi-label').text(), $(this).data('id'));
        });
        $c.find('.win-icon-item[data-type="icon"]').on('dblclick', function () {
            const url = $(this).data('url');
            if (url) window.open(url, '_blank');
        });

        // Position
        if (!winVisible) {
            const w = Math.min(700, $(window).width() - 60);
            const h = Math.min(450, $(window).height() - 120);
            $win.css({ top: Math.max(60, ($(window).height() - h) / 2), left: Math.max(20, ($(window).width() - w) / 2), width: w, height: h });
        }
        $win.addClass('show');
        winVisible = true;
    }

    function closeWindow() {
        $('#macWindow').removeClass('show');
        winVisible = false;
    }

    // ===== Modal =====
    let editIconId = null;

    function openModal(icon) {
        editIconId = icon ? icon.id : null;
        $('#modalTitle').text(icon ? '编辑书签' : '新建书签');
        $('#mUrl').val(icon ? icon.url : '');
        $('#mName').val(icon ? icon.name : '');
        $('#mColor').val(icon && icon.color ? icon.color : '#007AFF');
        $('#mIconText').val(icon ? (icon.iconText || '') : '');
        $('#mLinkIcon').val(icon && icon.icon && !icon.icon.startsWith('http') ? icon.icon : '');
        $('#modalOverlay').addClass('show');
        // Set active type
        $('#iconTypeGroup .type-btn').removeClass('active');
        if (icon && icon.color) {
            $('[data-type="color"]').addClass('active');
            $('#colorGroup, #textGroup').toggle(true, false);
        } else if (icon && icon.icon && !icon.icon.startsWith('http')) {
            $('[data-type="text"]').addClass('active');
            $('#colorGroup, #textGroup').toggle(false, true);
        } else {
            $('[data-type="url"]').addClass('active');
            $('#colorGroup, #textGroup').hide();
        }
    }

    function closeModal() {
        $('#modalOverlay').removeClass('show');
        editIconId = null;
    }

    // ===== Context Menu =====
    function showCtxMenu(x, y, items) {
        const $m = $('#ctxMenu');
        $m.empty();
        items.forEach(item => {
            if (item.sep) {
                $m.append('<div class="ctx-sep"></div>');
            } else {
                $m.append('<div class="ctx-item" data-action="' + item.action + '">' + item.label + '</div>');
            }
        });
        $m.css({ top: y + 'px', left: x + 'px' });
        $m.addClass('show');
        $(document).one('click', () => $m.removeClass('show'));
    }

    // ===== Import/Export =====
    function doImport() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json,.html';
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            try {
                const content = await U.readFile(file);
                if (file.name.endsWith('.json')) {
                    const data = JSON.parse(content);
                    if (data.icons) data.icons.forEach(ic => Store.addIcon({ name: ic.name, url: ic.url, icon: ic.icon, folder: ic.folder || 'root', color: ic.color }));
                    if (data.folders) data.folders.forEach(f => { if (f.id !== 'root') Store.addFolder({ name: f.name, parent: f.parent || null }); });
                } else {
                    const doc = new DOMParser().parseFromString(content, 'text/html');
                    let count = 0;
                    (function proc(list, pf) {
                        $(list).find('> DT').each(function () {
                            const $h = $(this).children('H3'), $a = $(this).children('A');
                            if ($h.length) {
                                const folder = Store.addFolder({ name: $h.text().trim(), parent: pf === 'root' ? null : pf });
                                const $dl = $(this).children('DL');
                                if ($dl.length) proc($dl[0], folder.id);
                            } else if ($a.length) {
                                const url = $a.attr('href') || '';
                                if (url && !url.startsWith('place:')) { Store.addIcon({ name: $a.text().trim() || '未命名', url, icon: U.favicon(url), folder: pf || 'root' }); count++; }
                            }
                        });
                    })($(doc).find('DL').first(), 'root');
                    alert('导入完成！共 ' + count + ' 个书签');
                }
                renderDesktop(currentFolder);
            } catch(err) { alert('导入失败：' + err.message); }
        };
        input.click();
    }

    function doExport() {
        const data = Store.get();
        const out = {
            version: '3.0', exportDate: new Date().toISOString(),
            folders: data.folders.filter(f => f.id !== 'root').map(f => ({ name: f.name, parent: f.parent })),
            icons: data.icons.map(ic => ({ name: ic.name, url: ic.url, icon: ic.icon, folder: ic.folder, color: ic.color, iconText: ic.iconText }))
        };
        U.download(JSON.stringify(out, null, 2), 'bookmarks-backup-' + new Date().toISOString().slice(0,10) + '.json');
    }

    // ===== Search =====
    function searchBookmarks(q) {
        if (!q.trim()) { $('#searchTips').removeClass('show'); return; }
        const results = Store.getAllIcons().filter(ic => ic.name.includes(q)).slice(0, 8);
        const $ul = $('#searchTips ul');
        $ul.empty();
        results.forEach(ic => {
            $ul.append('<li class="st-item" data-url="' + (ic.url || '') + '">' + ic.name + '</li>');
        });
        $('#searchTips').toggleClass('show', results.length > 0);
    }

    // ===== Init =====
    function init() {
        Store.init();

        // Load settings
        const s = Store.getSettings();
        currentTheme = s.theme || 'dark';
        setTheme(currentTheme);
        setWallpaper(s.wallpaper);
        applyBlur(s.blur || 0);
        applyBrightness(s.brightness || 0);

        // Render
        renderDesktop('root');
        updateClock();
        setInterval(updateClock, 1000);

        // Wallpaper image onerror
        $('.wallpaper-img').on('error', function () {
            $(this).attr('src', 'https://nav.iowen.cn/wp-content/uploads/wallpapers/images/001.jpg');
        });

        // ===== Menu Events =====
        $('#menuNewFolder').on('click', () => {
            const name = prompt('文件夹名称：');
            if (name && name.trim()) {
                Store.addFolder({ name: name.trim(), parent: currentFolder === 'root' ? null : currentFolder });
                renderDesktop(currentFolder);
            }
        });

        $('#menuNewBookmark').on('click', () => openModal(null));

        // ===== Desktop Click =====
        $('#desktopGrid').on('dblclick', '.desktop-icon[data-type="folder"]', function () {
            const id = $(this).data('id');
            const f = Store.getFolder(id);
            if (f) openWindow(f.name, id);
        });

        $('#desktopGrid').on('dblclick', '.desktop-icon[data-type="icon"]', function () {
            const id = $(this).data('id');
            const ic = Store.getAllIcons().find(i => i.id === id);
            if (ic && ic.url) window.open(ic.url, '_blank');
        });

        // ===== Desktop Right Click =====
        $('#desktopGrid').on('contextmenu', '.desktop-icon', function (e) {
            e.preventDefault();
            e.stopPropagation();
            const id = $(this).data('id');
            const type = $(this).data('type');
            const x = e.clientX, y = e.clientY;

            if (type === 'folder') {
                showCtxMenu(x, y, [
                    { label: '打开', action: 'open' },
                    { label: '重命名', action: 'rename' },
                    { label: '删除文件夹', action: 'delete' },
                ]);
                $('#ctxMenu .ctx-item').off('click').on('click', function () {
                    const act = $(this).data('action');
                    if (act === 'open') {
                        const f = Store.getFolder(id);
                        if (f) openWindow(f.name, id);
                    } else if (act === 'rename') {
                        const f = Store.getFolder(id);
                        const n = prompt('新名称：', f ? f.name : '');
                        if (n && n.trim()) { Store.updateFolder(id, { name: n.trim() }); renderDesktop(currentFolder); }
                    } else if (act === 'delete') {
                        if (confirm('确定删除此文件夹？')) { Store.removeFolder(id); renderDesktop(currentFolder); }
                    }
                });
            } else {
                showCtxMenu(x, y, [
                    { label: '编辑', action: 'edit' },
                    { label: '删除', action: 'delete' },
                ]);
                $('#ctxMenu .ctx-item').off('click').on('click', function () {
                    const act = $(this).data('action');
                    const ic = Store.getAllIcons().find(i => i.id === id);
                    if (act === 'edit' && ic) {
                        openModal(ic);
                    } else if (act === 'delete') {
                        if (confirm('确定删除？')) { Store.removeIcon(id); renderDesktop(currentFolder); }
                    }
                });
            }
        });

        // ===== Desktop Background Right Click =====
        $('#desktopGrid').on('contextmenu', function (e) {
            if ($(e.target).closest('.desktop-icon').length) return;
            e.preventDefault();
            showCtxMenu(e.clientX, e.clientY, [
                { label: '新建文件夹', action: 'newFolder' },
                { label: '新建书签', action: 'newBookmark' },
            ]);
            $('#ctxMenu .ctx-item').off('click').on('click', function () {
                const act = $(this).data('action');
                if (act === 'newFolder') {
                    const n = prompt('文件夹名称：');
                    if (n && n.trim()) { Store.addFolder({ name: n.trim(), parent: currentFolder === 'root' ? null : currentFolder }); renderDesktop(currentFolder); }
                } else if (act === 'newBookmark') {
                    openModal(null);
                }
            });
        });

        // ===== Window Controls =====
        $('#winClose').on('click', closeWindow);
        $('#winMinimize').on('click', () => { $('#macWindow').removeClass('show'); winVisible = false; });
        $('#winMaximize').on('click', function () {
            const $w = $('#macWindow');
            if ($w.hasClass('fullscreen')) {
                $w.removeClass('fullscreen');
            } else {
                $w.addClass('fullscreen');
            }
        });

        // ===== Theme =====
        $('#themeBtn').on('click', toggleTheme);

        // ===== Import/Export =====
        $('#importBtn').on('click', doImport);
        $('#exportBtn').on('click', doExport);

        // ===== Search =====
        $('#menuSearch').on('input', function () { searchBookmarks($(this).val()); });
        $('#menuSearch').on('keydown', function (e) {
            if (e.key === 'Enter') {
                const q = $(this).val().trim();
                if (q) {
                    const results = Store.getAllIcons().filter(ic => ic.name.includes(q));
                    if (results.length > 0 && results[0].url) window.open(results[0].url, '_blank');
                }
                $('#searchTips').removeClass('show');
            }
            if (e.key === 'Escape') $('#searchTips').removeClass('show');
        });
        $('#searchTips').on('click', '.st-item', function () {
            const url = $(this).data('url');
            if (url) window.open(url, '_blank');
            $('#searchTips').removeClass('show');
        });
        $(document).on('click', function (e) {
            if (!$(e.target).closest('.search-box, #searchTips').length) $('#searchTips').removeClass('show');
        });

        // ===== Dock =====
        $('#dockNewFolder').on('click', () => {
            const n = prompt('文件夹名称：');
            if (n && n.trim()) { Store.addFolder({ name: n.trim(), parent: null }); renderDesktop(currentFolder); }
        });

        // ===== Modal =====
        $('#iconTypeGroup .type-btn').on('click', function () {
            $('#iconTypeGroup .type-btn').removeClass('active');
            $(this).addClass('active');
            const t = $(this).data('type');
            $('#colorGroup, #textGroup').hide();
            if (t === 'color') $('#colorGroup').show();
            else if (t === 'text') $('#textGroup').show();
        });

        $('#modalSave').on('click', function () {
            const url = $('#mUrl').val().trim();
            const name = $('#mName').val().trim();
            if (!url) { alert('请输入链接地址'); return; }
            if (!name) { alert('请输入链接名称'); return; }

            const type = $('#iconTypeGroup .type-btn.active').data('type');
            let iconData = { name, url, folder: currentFolder || 'root' };
            if (type === 'color') {
                iconData.color = $('#mColor').val();
                iconData.iconText = $('#mIconText').val() || U.iconText(name);
            } else if (type === 'text') {
                iconData.icon = $('#mLinkIcon').val().trim() || U.favicon(url);
            } else {
                iconData.icon = U.favicon(url);
            }

            if (editIconId) {
                Store.updateIcon(editIconId, iconData);
            } else {
                Store.addIcon(iconData);
            }
            closeModal();
            renderDesktop(currentFolder);
        });

        $('#modalCancel').on('click', closeModal);
        $('#modalOverlay').on('click', function (e) {
            if (e.target === this) closeModal();
        });

        // ===== Window dragging =====
        let drag = false, dx, dy, $win = $('#macWindow');
        $win.find('.win-titlebar').on('mousedown', function (e) {
            if ($(e.target).closest('.traffic-lights').length) return;
            drag = true;
            dx = e.clientX - $win.offset().left;
            dy = e.clientY - $win.offset().top;
        });
        $(document).on('mousemove', function (e) {
            if (!drag) return;
            $win.css({ left: e.clientX - dx + 'px', top: e.clientY - dy + 'px' });
        }).on('mouseup', function () { drag = false; });

        // ===== Sortable =====
        if (typeof Sortable !== 'undefined') {
            Sortable.create(document.getElementById('desktopGrid'), {
                animation: 150, ghostClass: 'sortable-ghost',
                onEnd: function () {
                    const items = [];
                    $('#desktopGrid .desktop-icon[data-type="icon"]').each(function () {
                        const id = $(this).data('id');
                        const ic = Store.getAllIcons().find(i => i.id === id);
                        if (ic) items.push(ic);
                    });
                    if (items.length) Store.reorderIcons(items);
                }
            });
        }

        console.log('✅ Bookmark Desktop v3.0 macOS风格已启动');
    }

    // ===== Bootstrap =====
    if (typeof $ !== 'undefined') $(document).ready(init);
    else {
        document.addEventListener('DOMContentLoaded', () => {
            const check = setInterval(() => { if (typeof $ !== 'undefined') { clearInterval(check); $(document).ready(init); } }, 100);
        });
    }
})(typeof jQuery !== 'undefined' ? jQuery : null);