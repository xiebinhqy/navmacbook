<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../stores/userStore';

const router = useRouter();
const userStore = useUserStore();

const form = ref({
  username: '',
  password: ''
});

const error = ref('');
const loading = ref(false);

const handleLogin = async () => {
  error.value = '';
  if (!form.value.username || !form.value.password) {
    error.value = '请填写用户名和密码';
    return;
  }
  
  loading.value = true;
  try {
    await userStore.login(form.value.username, form.value.password);
    router.push('/');
  } catch (err: any) {
    error.value = err.response?.data?.message || '登录失败';
  } finally {
    loading.value = false;
  }
};

const goRegister = () => {
  router.push('/register');
};
</script>

<template>
  <div class="login-container">
    <div class="login-card">
      <h1>🔐 登录</h1>
      <p class="subtitle">书签管理系统</p>
      
      <div class="form-group">
        <label>用户名</label>
        <input 
          type="text" 
          v-model="form.username" 
          placeholder="请输入用户名"
          @keyup.enter="handleLogin"
        />
      </div>
      
      <div class="form-group">
        <label>密码</label>
        <input 
          type="password" 
          v-model="form.password" 
          placeholder="请输入密码"
          @keyup.enter="handleLogin"
        />
      </div>
      
      <div v-if="error" class="error">{{ error }}</div>
      
      <button class="login-btn" :disabled="loading" @click="handleLogin">
        {{ loading ? '登录中...' : '登录' }}
      </button>
      
      <div class="links">
        <span>还没有账号？</span>
        <a @click="goRegister">立即注册</a>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
}

.login-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 40px;
  width: 400px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.login-card h1 {
  margin: 0 0 8px 0;
  font-size: 28px;
  color: #fff;
}

.subtitle {
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 30px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 8px;
}

.form-group input {
  width: 100%;
  padding: 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  font-size: 14px;
}

.form-group input:focus {
  outline: none;
  border-color: #4a9eff;
}

.error {
  color: #ff6b6b;
  margin-bottom: 16px;
  font-size: 14px;
}

.login-btn {
  width: 100%;
  padding: 12px;
  background: #4a9eff;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.3s;
}

.login-btn:hover {
  background: #357abd;
}

.login-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.links {
  margin-top: 20px;
  text-align: center;
  color: rgba(255, 255, 255, 0.6);
}

.links a {
  color: #4a9eff;
  cursor: pointer;
  text-decoration: none;
}

.links a:hover {
  text-decoration: underline;
}
</style>