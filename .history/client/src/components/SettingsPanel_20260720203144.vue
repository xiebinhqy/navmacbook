<script setup lang="ts">
import { computed } from 'vue';
import { useSettingsStore } from '../stores/settingsStore';
import { searchEngines, type SearchEngine } from '../types';

const settingsStore = useSettingsStore();

const showSettings = computed(() => settingsStore.showSettingsPanel);
const currentTab = computed(() => settingsStore.settingsTab);


