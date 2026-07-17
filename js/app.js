/**
 * 网页收藏 - 书签导航应用 (v2.0)
 * 1:1 复刻自 https://nav.iowen.cn/bookmark + 扩展功能
 * 纯前端版本，使用 localStorage 存储数据
 * 
 * 扩展功能1：多级文件夹/分类管理
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

        init() {
            const stored = localStorage.getItem(CONFIG.STORAGE_KEY);
            if (stored) {
                try { this._data = JSON.parse(stored); } catch (e) { this._data = null; }
            }
            if (!this._data) {
                this._data = this._getDefaults();
                this.save();
            }
            // 确保 root 文件夹存在
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
                    wallpaper: '',
                    blur: 0,
                    brightness: 0,
                    searchEngine: 'baidu',
                    iconSize: 60,
                    iconRadius: 18,
                    iconGapRow: 34,
                    iconGapCol: 30,
                    themeColor: '#f1404b',
                    timeColor: '#ffffff',
                    iconTextColor: '#ffffff'
                }
            };
        },

        save() {
            localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(this._data));
        },

        get() { return this._data; },

        // --- 文件夹操作 ---
        getFolders() { return this._data.folders || []; },

        getRootFolders() {
            return (this._data.folders || []).filter(f => f.parentId === null || f.parentId === 'root');
        },

        getChildFolders(parentId) {
            return (this._data.folders || []).filter(f => f.parentId === parentId);
        },

        getFolder(id) {
            return (this._data.folders || []).find(f => f.id === id);
        },

        getFolderPath(folderId) {
            const path = [];
            let current = this.getFolder(folderId);
            while (current && current.id !== 'root') {
                path.unshift(current);
                current = this.getFolder(current.parentId);
            }
            return path;
        },

        addFolder(folder) {
            folder.id = 'folder_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
            folder.order = (this._data.folders || []).length;
            if (!this._data.folders) this._data.folders = [];
            this._data.folders.push(folder);
            this.save();
            return folder;
        },

        updateFolder(id, data) {
            const idx = (this._data.folders || []).findIndex(f => f.id === id);
            if (idx > -1) {
                Object.assign(this._data.folders[idx], data);
                this.save();
            }
        },

        removeFolder(id) {
            if (id === 'root') return; // 不能删除根文件夹
            // 把文件夹内的图标移到父文件夹
            const folder = this.getFolder(id);
            const parentId = folder ? folder.parentId : 'root';
            this._data.icons.forEach(icon => {
                if (icon.category === id) icon.category = parentId || 'root';
            });
            // 递归删除子文件夹
            const children = this.getChildFolders(id);
            children.forEach(child => this.removeFolder(child.id));
            this._data.folders = this._data.folders.filter(f => f.id !== id);
            this.save();
        },

        // --- 图标操作 ---
        getIcons(folderId) {
            const cat = folderId || 'root';
            return (this._data.icons || []).filter(i => i.category === cat);
        },

        getAllIcons() { return this._data.icons || []; },

        addIcon(icon) {
            icon.id = 'icon_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
            if (!icon.order) icon.order = (this._data.icons || []).length;
            this._data.icons.push(icon);
            this.save();
            return icon;
        },

        removeIcon(id) {
            this._data.icons = this._data.icons.filter(i => i.id !== id);
            this.save();
        },

        updateIcon(id, data) {
            const idx = this._data.icons.findIndex(i => i.id === id);
            if (idx > -1) {
                Object.assign(this._data.icons[idx], data);
                this.save();
            }
        },

        updateSettings(settings) {
            Object.assign(this._data.settings, settings);
            this.save();
        },

        getSettings() { return this._data.settings; },

        reorderIcons(icons) {
            icons.forEach((icon, idx) => icon.order = idx);
            // 合并回完整列表
            this._data.icons = [
                ...icons,
                ...this._data.icons.filter(i => !icons.find(ic => ic.id === i.id))
            ];
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

        getFaviconUrl(url) {
            try {
                const u = new URL(url);
                return u.origin + '/favicon.ico';
            } catch (e) { return ''; }
        },

        debounce(fn, delay) {
            let timer;
            return function (...args) {
                clearTimeout(timer);
                timer = setTimeout(() => fn.apply(this, args), delay);
            };
        },

        getIconText(name) {
            if (!name) return '?';
            const match = name.match(/[\u4e00-\u9fa5a-zA-Z0-9]/);
            return match ? match[0].toUpperCase() : name.charAt(0).toUpperCase();
        },

        generateId(prefix) {
            return prefix + '_' + Date.now() + '_' + Math.random().toString(36).substr(2, 8);
        }
    };

    // ===== 时钟 =====
    const Clock = {
        init() {
            this.update();
            setInterval(() => this.update(), 1000);
        },
        update() {
            const now = new Date();
            $('.bm-time-text .hh').text(Utils.padZero(now.getHours()));
            $('.bm-time-text .mm').text(Utils.padZero(now.getMinutes()));
            $('.bm-time-text .ss').text(Utils.padZero(now.getSeconds()));
        }
    };

    // ===== 壁纸 =====
    const Wallpaper = {
        init() {
            const settings = DataStore.getSettings();
            const imgUrl = settings.wallpaper || Utils.getWallpaperUrl();
            $('.wallpaper-img').attr('src', imgUrl);
            this.applyBlur(settings.blur);
            this.applyBrightness(settings.brightness);
        },
        applyBlur(val) {
            document.documentElement.style.setProperty('--wallpaper-blur', val + 'px');
        },
        applyBrightness(val) {
            document.documentElement.style.setProperty('--wallpaper-brightness', val / 100);
        }
    };

    // ===== 搜索 =====
    const Search = {
        currentEngine: 'baidu',

        init() {
            const settings = DataStore.getSettings();
            this.currentEngine = settings.searchEngine || CONFIG.DEFAULT_SEARCH;
            this.renderEngineIcon();
            this.renderEngineDropdown();
            this.bindEvents();
        },

        renderEngineIcon() {
            const engine = CONFIG.SEARCH_ENGINES[this.currentEngine];
            if (engine) {
                $('.search-type-img').attr('src', engine.icon);
                $('input[name="search_type"]').val(this.currentEngine);
            }
        },

        renderEngineDropdown() {
            const $dropdown = $('.search-type-dropdown');
            $dropdown.empty();
            Object.keys(CONFIG.SEARCH_ENGINES).forEach(key => {
                const engine = CONFIG.SEARCH_ENGINES[key];
                $dropdown.append(
                    '<div class="search-type-item-btn" data-engine="' + key + '">' +
                    '<img src="' + engine.icon + '" alt="' + engine.name + '" title="' + engine.name + '">' +
                    '</div>'
                );
            });
        },

        bindEvents() {
            const $searchInput = $('#search-text');
            const $searchTypeBox = $('.search-type-box');
            const $searchTypeDropdown = $('.search-type-dropdown');
            const $searchClear = $('.search-clear');
            const $smartTips = $('.search-smart-tips');

            $searchTypeBox.on('click', (e) => {
                e.stopPropagation();
                $searchTypeDropdown.toggleClass('active');
            });

            $searchTypeDropdown.on('click', '.search-type-item-btn', (e) => {
                const engine = $(e.currentTarget).data('engine');
                this.currentEngine = engine;
                this.renderEngineIcon();
                $searchTypeDropdown.removeClass('active');
                DataStore.updateSettings({ searchEngine: engine });
            });

            $(document).on('click', () => {
                $searchTypeDropdown.removeClass('active');
                $smartTips.hide();
            });

            $searchInput.on('input', () => {
                const val = $searchInput.val().trim();
                if (val) {
                    $searchClear.show();
                    this.showSmartTips(val);
                } else {
                    $searchClear.hide();
                    $smartTips.hide();
                }
            });

            $searchClear.on('click', () => {
                $searchInput.val('').focus();
                $searchClear.hide();
                $smartTips.hide();
            });

            $searchInput.on('keydown', (e) => {
                if (e.key === 'Enter') {
                    const val = $searchInput.val().trim();
                    if (val) this.doSearch(val);
                }
                if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                    e.preventDefault();
                    this.navigateSmartTips(e.key === 'ArrowDown' ? 'down' : 'up');
                }
            });

            $smartTips.on('click', 'li', (e) => {
                const text = $(e.currentTarget).data('text') || $(e.currentTarget).text();
                $searchInput.val(text);
                $smartTips.hide();
                this.doSearch(text);
            });
        },

        doSearch(query) {
            const engine = CONFIG.SEARCH_ENGINES[this.currentEngine];
            if (engine) window.open(engine.url + encodeURIComponent(query), '_blank');
        },

        showSmartTips(query) {
            const tips = DataStore.getAllIcons().map(i => i.name).filter(n => n.includes(query)).slice(0, 8);
            const $tips = $('.search-smart-tips');
            const $ul = $tips.find('ul');
            $ul.empty();
            tips.forEach(t => $ul.append('<li data-text="' + t + '">' + t + '</li>'));
            $tips.toggle(tips.length > 0);
        },

        navigateSmartTips(dir) {
            const $items = $('.search-smart-tips li');
            if (!$items.length) return;
            let currentIdx = $items.index($('.search-smart-tips li.current'));
            $items.removeClass('current');
            currentIdx = dir === 'down'
                ? (currentIdx + 1) % $items.length
                : (currentIdx - 1 + $items.length) % $items.length;
            $items.eq(currentIdx).addClass('current');
        }
    };

    // ===== 导航栏（文件夹树） =====
    const NavBar = {
        currentFolderId: 'root',
        folderStack: [],

        init() {
            this.renderBreadcrumb();
            this.renderFolderTree();
            this.renderGrid();
            this.bindEvents();
        },

        renderBreadcrumb() {
            const path = DataStore.getFolderPath(this.currentFolderId);
            const $bread = $('#breadcrumb-nav');
            $bread.empty();
            // 根
            $bread.append('<span class="bread-item" data-folder="root"><i class="iconfont icon-home mr-1"></i>全部书签</span>');
            path.forEach(f => {
                $bread.append('<span class="bread-sep">›</span>');
                $bread.append('<span class="bread-item" data-folder="' + f.id + '">' + f.name + '</span>');
            });
        },

        renderFolderTree() {
            const $tree = $('#folder-tree');
            $tree.empty();
            const rootFolders = DataStore.getRootFolders();
            rootFolders.forEach(folder => {
                if (folder.id === 'root') return;
                const isActive = folder.id === this.currentFolderId;
                const children = DataStore.getChildFolders(folder.id);
                $tree.append(
                    '<div class="folder-tree-item' + (isActive ? ' active' : '') + '" data-folder="' + folder.id + '">' +
                    '<span class="folder-tree-icon"><i class="iconfont icon-folder' + (children.length > 0 ? '' : '-o') + '"></i></span>' +
                    '<span class="folder-tree-name">' + folder.name + '</span>' +
                    '<span class="folder-tree-count">' + DataStore.getIcons(folder.id).length + '</span>' +
                    '</div>'
                );
            });
        },

        renderGrid() {
            Icons.render(this.currentFolderId);
        },

        navigateTo(folderId) {
            this.currentFolderId = folderId;
            this.renderBreadcrumb();
            this.renderFolderTree();
            this.renderGrid();
            // 更新顶栏显示
            this.updateTopbar();
        },

        updateTopbar() {
            const folder = DataStore.getFolder(this.currentFolderId);
            const name = folder ? folder.name : '全部书签';
            if ($('#current-folder-name').length) {
                $('#current-folder-name').text(name);
            }
        },

        bindEvents() {
            // 面包屑导航
            $('#breadcrumb-nav').on('click', '.bread-item', (e) => {
                const fid = $(e.currentTarget).data('folder');
                this.navigateTo(fid);
            });

            // 文件夹树点击
            $('#folder-tree').on('click', '.folder-tree-item', (e) => {
                const fid = $(e.currentTarget).data('folder');
                this.navigateTo(fid);
            });

            // 新建文件夹按钮（顶部工具栏）
            $('#btn-new-folder').on('click', () => {
                this.createFolder();
            });

            // 侧边栏新建文件夹按钮
            $('#btn-sidebar-new-folder').on('click', () => {
                this.createFolder();
            });
        },

        createFolder() {
            const name = prompt('请输入文件夹名称：');
            if (!name || !name.trim()) return;
            const folder = {
                name: name.trim(),
                parentId: this.currentFolderId === 'root' ? null : this.currentFolderId,
                icon: null
            };
            DataStore.addFolder(folder);
            this.renderFolderTree();
            this.renderGrid();
        }
    };

    // ===== 图标网格 =====
    const Icons = {
        render(folderId) {
            const $container = $('#links_slides');
            $container.empty();

            // 添加文件夹工具栏
            const toolbar = '' +
                '<div class="folder-toolbar mb-2">' +
                '<div class="d-flex align-items-center justify-content-between" style="padding: 0 20px;">' +
                '<div id="breadcrumb-nav" class="breadcrumb-nav"></div>' +
                '<div class="folder-actions">' +
                '<button class="btn vc-l-white btn-sm mr-2" id="btn-new-folder"><i class="iconfont icon-add-o mr-1"></i>新建文件夹</button>' +
                '<button class="btn vc-l-white btn-sm" id="btn-add-icon"><i class="iconfont icon-zoom-in mr-1"></i>添加书签</button>' +
                '</div>' +
                '</div>' +
                '</div>';

            $container.append(toolbar);

            // 渲染面包屑
            NavBar.renderBreadcrumb();

            const $grid = $('<div class="d-grid grid-cols-xl-10 grid-cols-lg-8 grid-cols-md-6 grid-cols-sm-4 grid-cols-3" id="icon-grid">');

            // 获取当前文件夹的子文件夹（作为文件夹图标显示）
            const childFolders = DataStore.getChildFolders(folderId);
            childFolders.forEach(folder => {
                const $fItem = this.createFolderItem(folder);
                $grid.append($fItem);
            });

            // 获取当前文件夹的图标
            const icons = DataStore.getIcons(folderId);
            icons.forEach(icon => {
                const $item = this.createIconItem(icon);
                $grid.append($item);
            });

            $container.append($grid);

            if (childFolders.length === 0 && icons.length === 0 && folderId !== 'root') {
                $container.append('<div class="text-center py-5" style="color:rgba(255,255,255,.6);font-size:16px;text-shadow:0 2px 10px rgba(0,0,0,0.5);">此文件夹为空，拖拽书签或点击添加</div>');
            }

            // 初始化 Sortable
            if (typeof Sortable !== 'undefined') {
                Sortable.create($grid[0], {
                    animation: 150,
                    ghostClass: 'sortable-ghost',
                    group: 'bookmarks',
                    onEnd: (evt) => {
                        const items = [];
                        $grid.find('.links-item').each(function () {
                            const id = $(this).data('id');
                            const type = $(this).data('type');
                            if (type === 'icon') {
                                const icon = DataStore.getAllIcons().find(i => i.id === id);
                                if (icon) items.push(icon);
                            }
                        });
                        DataStore.reorderIcons(items);
                    },
                    onAdd: (evt) => {
                        // 从其他文件夹拖入
                        const id = $(evt.item).data('id');
                        const type = $(evt.item).data('type');
                        if (type === 'icon') {
                            DataStore.updateIcon(id, { category: folderId || 'root' });
                        }
                    }
                });
            }

            // 绑定按钮事件
            $('#btn-add-icon').off('click').on('click', () => {
                Popup.openAdd();
            });

            // 文件夹点击（打开文件夹）
            $container.on('dblclick', '.folder-item-container', (e) => {
                const fid = $(e.currentTarget).closest('.links-item').data('id');
                NavBar.navigateTo(fid);
            });
        },

        createFolderItem(folder) {
            const childIcons = DataStore.getIcons(folder.id).slice(0, 4);
            const $item = $('<div class="links-item i1x1 folder-item-container" data-id="' + folder.id + '" data-type="folder">');
            let contentHtml = '';

            if (childIcons.length > 0) {
                contentHtml = '<div class="folder-content">';
                childIcons.forEach(icon => {
                    contentHtml += '<div class="folder-item"><div class="i-body"><div class="i-font-icon" style="background:' + (icon.color || '#666') + ';font-size:10px;">' + Utils.getIconText(icon.name) + '</div></div></div>';
                });
                // 补空格
                for (let i = childIcons.length; i < 4; i++) {
                    contentHtml += '<div class="folder-item"><div class="i-body"><div class="i-font-icon" style="background:rgba(255,255,255,.2);font-size:10px;"></div></div></div>';
                }
                contentHtml += '</div>';
            } else {
                contentHtml = '<div class="i-body"><div class="i-font-icon" style="background:rgba(255,255,255,.15);"><i class="iconfont icon-folder" style="font-size:24px;"></i></div></div>';
            }

            $item.append(contentHtml);
            $item.append('<span class="i-title line1">' + folder.name + '</span>');

            // 右键菜单
            $item.on('contextmenu', (e) => {
                e.preventDefault();
                this.showFolderContextMenu(e, folder);
            });

            return $item;
        },

        createIconItem(icon) {
            const $item = $('<div class="links-item i1x1" data-id="' + icon.id + '" data-type="icon">');
            const $body = $('<a class="i-body" href="' + icon.url + '" target="_blank" title="' + icon.name + '">');

            if (icon.icon) {
                $body.append(
                    '<img class="i-img" src="' + icon.icon + '" alt="' + icon.name + '" loading="lazy" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'flex\'">' +
                    '<div class="i-font-icon" style="display:none;">' + Utils.getIconText(icon.name) + '</div>'
                );
            } else if (icon.color) {
                $body.append('<div class="i-font-icon" style="background:' + icon.color + ';">' + (icon.iconText || Utils.getIconText(icon.name)) + '</div>');
            } else {
                $body.append('<div class="i-font-icon" style="background:#666;">' + Utils.getIconText(icon.name) + '</div>');
            }

            $item.append($body);
            $item.append('<span class="i-title line1">' + icon.name + '</span>');

            $item.on('contextmenu', (e) => {
                e.preventDefault();
                this.showIconContextMenu(e, icon);
            });

            return $item;
        },

        showIconContextMenu(e, icon) {
            const $menu = $('#context-menu');
            $menu.html(
                '<div class="bm-menu-item edit-icon" data-id="' + icon.id + '"><i class="iconfont icon-edit mr-2"></i>编辑</div>' +
                '<div class="bm-menu-item move-icon"><i class="iconfont icon-folder mr-2"></i>移动到...</div>' +
                '<div class="bm-menu-item delete-icon" data-id="' + icon.id + '"><i class="iconfont icon-delete mr-2"></i>删除</div>'
            );
            $menu.css({ top: e.clientY + 'px', left: e.clientX + 'px', display: 'block' });

            $(document).one('click', () => $menu.hide());

            $menu.find('.edit-icon').on('click', () => {
                $menu.hide();
                Popup.openEdit(icon);
            });

            $menu.find('.move-icon').on('click', () => {
                $menu.hide();
                this.showMoveDialog(icon);
            });

            $menu.find('.delete-icon').on('click', () => {
                $menu.hide();
                if (confirm('确定删除 "' + icon.name + '" 吗？')) {
                    DataStore.removeIcon(icon.id);
                    Icons.render(NavBar.currentFolderId);
                }
            });
        },

        showFolderContextMenu(e, folder) {
            const $menu = $('#context-menu');
            $menu.html(
                '<div class="bm-menu-item rename-folder" data-id="' + folder.id + '"><i class="iconfont icon-edit mr-2"></i>重命名</div>' +
                '<div class="bm-menu-item delete-folder" data-id="' + folder.id + '"><i class="iconfont icon-delete mr-2"></i>删除文件夹</div>'
            );
            $menu.css({ top: e.clientY + 'px', left: e.clientX + 'px', display: 'block' });

            $(document).one('click', () => $menu.hide());

            $menu.find('.rename-folder').on('click', () => {
                $menu.hide();
                const name = prompt('请输入新名称：', folder.name);
                if (name && name.trim()) {
                    DataStore.updateFolder(folder.id, { name: name.trim() });
                    Icons.render(NavBar.currentFolderId);
                }
            });

            $menu.find('.delete-folder').on('click', () => {
                $menu.hide();
                if (confirm('确定删除文件夹 "' + folder.name + '" 吗？\n文件夹内的书签将移到上级文件夹。')) {
                    DataStore.removeFolder(folder.id);
                    Icons.render(NavBar.currentFolderId);
                }
            });
        },

        showMoveDialog(icon) {
            const folders = DataStore.getFolders().filter(f => f.id !== 'root' && f.id !== icon.category);
            if (folders.length === 0) {
                alert('没有可移动到的文件夹。请先创建文件夹。');
                return;
            }
            const options = folders.map(f => f.name).join('\n');
            const choice = prompt('选择目标文件夹（输入数字）：\n' +
                folders.map((f, i) => (i + 1) + '. ' + f.name).join('\n') +
                '\n按取消放弃移动');
            if (choice) {
                const idx = parseInt(choice) - 1;
                if (idx >= 0 && idx < folders.length) {
                    DataStore.updateIcon(icon.id, { category: folders[idx].id });
                    Icons.render(NavBar.currentFolderId);
                }
            }
        }
    };

    // ===== 添加/编辑图标弹窗 =====
    const Popup = {
        init() {
            this.bindEvents();
        },

        openAdd() {
            $('input[name="icon-id"]').val('');
            $('#link-url').val('');
            $('#link-name').val('');
            $('#link-app').prop('checked', false);
            $('#online-icon').prop('checked', true).trigger('change');
            $('.color-icon-name').val('');
            $('.link-icon-url').val('');
            $('input[name="link-color"]').val('');
            $('#bm-add-icon-popup').addClass('show').css('display', 'block');
            $('body').addClass('modal-open');
        },

        openEdit(icon) {
            $('#link-url').val(icon.url);
            $('#link-name').val(icon.name);
            $('#link-app').prop('checked', icon.isApp || false);
            $('input[name="icon-id"]').val(icon.id);
            if (icon.color) {
                $('#color-icon').prop('checked', true).trigger('change');
                $('input[name="link-color"]').val(icon.color);
                $('.color-icon-name').val(icon.iconText || '');
                $('.color-preview-img').css('background-color', icon.color).text(icon.iconText || Utils.getIconText(icon.name));
            } else if (icon.icon && icon.icon.startsWith('http')) {
                $('#online-icon').prop('checked', true).trigger('change');
                $('.link-icon-url').val('');
            } else {
                $('#link-icon').prop('checked', true).trigger('change');
                $('.link-icon-url').val(icon.icon || '');
            }
            $('#bm-add-icon-popup').addClass('show').css('display', 'block');
            $('body').addClass('modal-open');
        },

        close() {
            $('#bm-add-icon-popup').removeClass('show').css('display', 'none');
            $('body').removeClass('modal-open');
            $('.custom-icon-box').removeClass('show');
            $('.add-gadget-box').removeClass('show');
            $('#bm-add-icon-popup').removeClass('second');
            $('.default-icon-box').css('transform', '');
        },

        bindEvents() {
            $('[data-dismiss="modal"]').on('click', () => this.close());

            $('.show-custom-icon-box').on('click', () => {
                $('#bm-add-icon-popup').addClass('second');
                $('.custom-icon-box').addClass('show');
                $('.default-icon-box').css('transform', 'scale(0.9)');
                $('input[name="icon-id"]').val('');
            });

            $('.hide-custom-icon-box').on('click', () => {
                $('#bm-add-icon-popup').removeClass('second');
                $('.custom-icon-box').removeClass('show');
                $('.default-icon-box').css('transform', '');
            });

            $('.show-gadget-box').on('click', () => {
                $('#bm-add-icon-popup').addClass('second');
                $('.add-gadget-box').addClass('show');
                $('.default-icon-box').css('transform', 'scale(0.9)');
            });

            $('.hide-add-gadget-box').on('click', () => {
                $('#bm-add-icon-popup').removeClass('second');
                $('.add-gadget-box').removeClass('show');
                $('.default-icon-box').css('transform', '');
            });

            $('input[name="icon-type"]').on('change', (e) => {
                $('.icon-set-box').hide();
                const val = $(e.currentTarget).val();
                $('.icon-set-box[data-value="' + val + '"]').show();
            });

            $('.icon-set-box').hide();
            $('.icon-set-box[data-value="online-icon"]').show();

            // 颜色选择
            $('.icon-set-box').on('click', '.color-item', (e) => {
                const color = $(e.currentTarget).data('color');
                $('input[name="link-color"]').val(color);
                $('.color-preview-img').css('background-color', color);
            });

            $('.background-color-input').on('input', (e) => {
                const color = $(e.currentTarget).val();
                $('input[name="link-color"]').val(color);
                $('.color-preview-img').css('background-color', color);
            });

            $('.color-icon-name').on('input', (e) => {
                const val = $(e.currentTarget).val() || 'O';
                $('.color-preview-img').text(val.charAt(0).toUpperCase());
            });

            // 保存
            $('.add-icon-btn').on('click', () => this.saveIcon());

            // 双击空白区域打开添加
            $(document).on('dblclick', '.links-carousel', (e) => {
                if ($(e.target).closest('.folder-toolbar, .breadcrumb-nav, .btn').length === 0) {
                    this.openAdd();
                }
            });
        },

        saveIcon() {
            const url = $('#link-url').val().trim();
            const name = $('#link-name').val().trim();
            const iconType = $('input[name="icon-type"]:checked').val();
            const isApp = $('#link-app').is(':checked');
            const iconId = $('input[name="icon-id"]').val();

            if (!url) { alert('请输入链接地址'); return; }
            if (!name) { alert('请输入链接名称'); return; }

            let iconData = {
                url: url,
                name: name,
                isApp: isApp,
                category: NavBar.currentFolderId || 'root',
                order: DataStore.getAllIcons().length
            };

            switch (iconType) {
                case 'online-icon':
                    iconData.icon = Utils.getFaviconUrl(url);
                    break;
                case 'upload-icon':
                    iconData.icon = '';
                    break;
                case 'color-icon':
                    iconData.color = $('input[name="link-color"]').val() || '#666';
                    iconData.iconText = $('.color-icon-name').val() || Utils.getIconText(name);
                    break;
                case 'link-icon':
                    iconData.icon = $('.link-icon-url').val().trim() || Utils.getFaviconUrl(url);
                    break;
            }

            if (iconId) {
                DataStore.updateIcon(iconId, iconData);
            } else {
                DataStore.addIcon(iconData);
            }

            Icons.render(NavBar.currentFolderId);
            this.close();
        }
    };

    // ===== 登录弹窗 =====
    const LoginModal = {
        init() {
            setTimeout(() => {
                if (!localStorage.getItem('bm_login_dismissed')) {
                    $('.bm-login-modal').addClass('show').css('display', 'block');
                }
            }, 3000);

            $('.bm-login-modal .close').on('click', () => {
                $('.bm-login-modal').removeClass('show').css('display', 'none');
                localStorage.setItem('bm_login_dismissed', '1');
            });

            $('.login-btn').on('click', () => {
                alert('登录功能将在后续扩展中实现。\n当前为本地存储模式，所有数据保存在浏览器中。');
            });
        }
    };

    // ===== 应用初始化 =====
    const App = {
        init() {
            DataStore.init();
            NavBar.init();

            setTimeout(() => $('.full-loading').addClass('load-out'), 300);

            Clock.init();
            Wallpaper.init();
            Search.init();
            Popup.init();
            LoginModal.init();

            const settings = DataStore.getSettings();
            if (settings.themeColor) {
                document.documentElement.style.setProperty('--theme-color', settings.themeColor);
                document.documentElement.style.setProperty('--hover-color', settings.themeColor + 'dd');
            }

            console.log('📑 网页收藏导航 v2.0 - 多级文件夹功能已启用');
            console.log('💾 数据存储在 localStorage，key: ' + CONFIG.STORAGE_KEY);
        }
    };

    // 启动
    if (typeof $ !== 'undefined') {
        $(document).ready(() => App.init());
    } else {
        document.addEventListener('DOMContentLoaded', () => {
            const checkJQuery = setInterval(() => {
                if (typeof $ !== 'undefined' && typeof jQuery !== 'undefined') {
                    clearInterval(checkJQuery);
                    $(document).ready(() => App.init());
                }
            }, 100);
        });
    }

})(typeof jQuery !== 'undefined' ? jQuery : null);