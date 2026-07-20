<script setup lang="ts">
import { computed } from 'vue';
import { useSettingsStore } from '../stores/settingsStore';

const settingsStore = useSettingsStore();

const isOpen = computed(() => settingsStore.showSettingsPanel);
const activeTab = computed(() => settingsStore.settingsTab);

function setTab(tab: string) {
  settingsStore.setSettingsTab(tab);
}

function closePanel() {
  settingsStore.closeSettingsPanel();
}

function updateSetting(key: string, value: any) {
  settingsStore.updateSettings({ [key]: value });
}

function resetSettings() {
  settingsStore.resetSettings();
}
</script>

<template>
  <div v-if="isOpen" class="settings-overlay" @click="closePanel">
    <div class="settings-panel" @click.stop>
      <!-- 头部 -->
      <div class="settings-header">
        <h2>⚙️ 设置</h2>
        <button class="close-btn" @click="closePanel">×</button>
      </div>

      <!-- Tab 导航 -->
      <div class="tab-nav">
        <button 
          :class="{ active: activeTab === 'basic' }" 
          @click="setTab('basic')"
        >基础</button>
        <button 
          :class="{ active: activeTab === 'appearance' }" 
          @click="setTab('appearance')"
        >外观</button>
        <button 
          :class="{ active: activeTab === 'search' }" 
          @click="setTab('search')"
        >搜索</button>
        <button 
          :class="{ active: activeTab === 'bookmark' }" 
          @click="setTab('bookmark')"
        >书签</button>
      </div>

      <!-- 内容区 -->
      <div class="tab-content">
        <!-- 基础设置 -->
        <div v-if="activeTab === 'basic'" class="setting-section">
          <h3>时间显示</h3>
          <div class="setting-item">
            <label>显示时钟</label>
            <label class="switch">
              <input type="checkbox" v-model="settingsStore.settings.showClock" @change="updateSetting('showClock', $event.target.checked)">
              <span class="slider"></span>
            </label>
          </div>
          <div class="setting-item">
            <label>时钟颜色</label>
            <input 
              type="color" 
              v-model="settingsStore.settings.clockColor" 
              @change="updateSetting('clockColor', ($event.target as HTMLInputElement).value)"
            />
          </div>

          <h3>主题</h3>
          <div class="setting-item">
            <label>主题模式</label>
            <select v-model="settingsStore.settings.theme" @change="updateSetting('theme', ($event.target as HTMLSelectElement).value)">
              <option value="light">浅色</option>
              <option value="dark">深色</option>
            </select>
          </div>
        </div>

        <!-- 外观设置 -->
        <div v-if="activeTab === 'appearance'" class="setting-section">
          <h3>图标设置</h3>
          <div class="setting-item">
            <label>图标尺寸: {{ settingsStore.settings.iconSize }}px</label>
            <input 
              type="range" 
              min="32" 
              max="128" 
              v-model.number="settingsStore.settings.iconSize"
              @input="updateSetting('iconSize', ($event.target as HTMLInputElement).valueAsNumber)"
            />
          </div>
          <div class="setting-item">
            <label>圆角: {{ settingsStore.settings.iconBorderRadius }}px</label>
            <input 
              type="range" 
              min="0" 
              max="32" 
              v-model.number="settingsStore.settings.iconBorderRadius"
              @input="updateSetting('iconBorderRadius', ($event.target as HTMLInputElement).valueAsNumber)"
            />
          </div>

          <h3>壁纸</h3>
          <div class="setting-item">
            <label>壁纸URL</label>
            <input 
              type="text" 
              v-model="settingsStore.settings.wallpaperUrl"
              @input="updateSetting('wallpaperUrl', ($event.target as HTMLInputElement).value)"
              placeholder="https://example.com/wallpaper.jpg"
            />
          </div>
          <div class="setting-item">
            <label>壁纸模式</label>
            <select v-model="settingsStore.settings.wallpaperMode" @change="updateSetting('wallpaperMode', ($event.target as HTMLSelectElement).value)">
              <option value="cover">覆盖</option>
              <option value="contain">包含</option>
              <option value="center">居中</option>
            </select>
          </div>
        </div>

        <!-- 搜索设置 -->
        <div v-if="activeTab === 'search'" class="setting-section">
          <h3>搜索功能</h3>
          <div class="setting-item">
            <label>启用搜索栏</label>
            <label class="switch">
              <input type="checkbox" v-model="settingsStore.settings.enableSearch" @change="updateSetting('enableSearch', $event.target.checked)">
              <span class="slider"></span>
            </label>
          </div>
          <div class="setting-item">
            <label>搜索建议</label>
            <label class="switch">
              <input type="checkbox" v-model="settingsStore.settings.enableSearchSuggestion" @change="updateSetting('enableSearchSuggestion', $event.target.checked)">
              <span class="slider"></span>
            </label>
          </div>
          <div class="setting-item">
            <label>搜索历史</label>
            <label class="switch">
              <input type="checkbox" v-model="settingsStore.settings.enableSearchHistory" @change="updateSetting('enableSearchHistory', $event.target.checked)">
              <span class="slider"></span>
            </label>
          </div>
        </div>

        <!-- 书签设置 -->
        <div v-if="activeTab === 'bookmark'" class="setting-section">
          <h3>分页设置</h3>
          <div class="setting-item">
            <label>每页显示数量: {{ settingsStore.settings.itemsPerPage }}</label>
            <input 
              type="range" 
              min="10" 
              max="100" 
              step="10"
              v-model.number="settingsStore.settings.itemsPerPage"
              @input="updateSetting('itemsPerPage', ($event.target as HTMLInputElement).valueAsNumber)"
            />
          </div>
        </div>
      </div>

      <!-- 底部 -->
      <div class="settings-footer">
        <button class="reset-btn" @click="resetSettings">重置所有设置</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.settings-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.settings-panel {
  background: var(--bg-secondary, #1e1e1e);
  border-radius: 16px;
  width: 480px;
  max-width: 90vw;
  max-height: 80vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

.settings-header {
  padding: 20px 24px;
  border-bottom: 1px solid var(--border-color, rgba(255,255,255,0.1));
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.settings-header h2 {
  margin: 0;
  font-size: 20px;
  color: var(--text-primary, #fff);
}

.close-btn {
  background: none;
  border: none;
  color: var(--text-secondary, #888);
  font-size: 24px;
  cursor: pointer;
  padding: 4px 8px;
}

.close-btn:hover {
  color: var(--text-primary, #fff);
}

.tab-nav {
  display: flex;
  padding: 0 24px;
  border-bottom: 1px solid var(--border-color, rgba(255,255,255,0.1));
}

.tab-nav button {
  flex: 1;
  padding: 12px;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  color: var(--text-secondary, #888);
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.tab-nav button:hover {
  color: var(--text-primary, #fff);
}

.tab-nav button.active {
  color: var(--accent-color, #4a9eff);
  border-bottom-color: var(--accent-color, #4a9eff);
}

.tab-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px 24px;
}

.setting-section h3 {
  margin: 0 0 16px 0;
  font-size: 14px;
  color: var(--text-secondary, #888);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.setting-item label:first-child {
  color: var(--text-primary, #fff);
  font-size: 14px;
}

.setting-item input[type="text"] {
  flex: 1;
  margin-left: 16px;
  padding: 8px 12px;
  border: 1px solid var(--border-color, rgba(255,255,255,0.2));
  border-radius: 6px;
  background: var(--bg-tertiary, #2a2a2a);
  color: var(--text-primary, #fff);
  font-size: 14px;
}

.setting-item input[type="color"] {
  width: 40px;
  height: 32px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.setting-item select {
  padding: 8px 12px;
  border: 1px solid var(--border-color, rgba(255,255,255,0.2));
  border-radius: 6px;
  background: var(--bg-tertiary, #2a2a2a);
  color: var(--text-primary, #fff);
  font-size: 14px;
}

.setting-item input[type="range"] {
  flex: 1;
  margin-left: 16px;
  max-width: 200px;
}

/* Toggle Switch */
.switch {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--bg-tertiary, #444);
  transition: 0.3s;
  border-radius: 24px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.3s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: var(--accent-color, #4a9eff);
}

input:checked + .slider:before {
  transform: translateX(20px);
}

.settings-footer {
  padding: 16px 24px;
  border-top: 1px solid var(--border-color, rgba(255,255,255,0.1));
}

.reset-btn {
  width: 100%;
  padding: 10px;
  background: rgba(255, 107, 107, 0.1);
  border: 1px solid rgba(255, 107, 107, 0.3);
  border-radius: 8px;
  color: #ff6b6b;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.reset-btn:hover {
  background: rgba(255, 107, 107, 0.2);
}
</style>