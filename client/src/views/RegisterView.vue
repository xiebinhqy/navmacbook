<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../stores/userStore';

const router = useRouter();
const userStore = useUserStore();

const form = ref({
  username: '',
  password: '',
  confirmPassword: '',
  email: ''
});

const error = ref('');
const loading = ref(false);

const handleRegister = async () => {
  error.value = '';
  if (!form.value.username || !form.value.password) {
    error.value = '请填写用户名和密码';
    return;
  }
  if (form.value.password !== form.value.confirmPassword) {
    error.value = '两次密码不一致';
    return;
  }
  if (form.value.password.length < 6) {
    error.value = '密码长度不能少于6位';
    return;
  }
  
  loading.value = true;
  try {
    await userStore.register(form.value.username, form.value.password, form.value.email || undefined);
    router.push('/');
  } catch (err: any) {
    error.value = err.response?.data?.message || '注册失败';
  } finally {
    loading.value = false;
  }
};

const goLogin = () => {
  router.push('/login');
};
</script>

<template>
  <div class="register-container">
    <div class="register-card">
      <h1>📝 注册</h1>
      <p class="subtitle">创建新账号</p>
      
      <div class="form-group">
        <label>用户名</label>
        <input 
          type="text" 
          v-model="form.username" 
          placeholder="请输入用户名"
          @keyup.enter="handleRegister"
        />
      </div>
      
      <div class="form-group">
        <label>密码</label>
        <input 
          type="password" 
          v-model="form.password" 
          placeholder="请输入密码（至少6位）"
          @keyup.enter="handleRegister"
        />
      </div>
      
      <div class="form-group">
        <label>确认密码</label>
        <input 
          type="password" 
          v-model="form.confirmPassword" 
          placeholder="请再次输入密码"
          @keyup.enter="handleRegister"
        />
      </div>
      
      <div class="form-group">
        <label>邮箱（可选）</label>
        <input 
          type="email" 
          v-model="form.email" 
          placeholder="请输入邮箱"
          @keyup.enter="handleRegister"
        />
      </div>
      
      <div v-if="error" class="error">{{ error }}</div>
      
      <button class="register-btn" :disabled="loading" @click="handleRegister">
        {{ loading ? '注册中...' : '注册' }}
      </button>
      
      <div class="links">
        <span>已有账号？</span>
        <a @click="goLogin">立即登录</a>
      </div>
    </div>
  </div>
</template>

<style scoped>
.register-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
}

.register-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 40px;
  width: 400px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.register-card h1 {
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

.register-btn {
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

.register-btn:hover {
  background: #357abd;
}

.register-btn:disabled {
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