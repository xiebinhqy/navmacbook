import { createRouter, createWebHistory } from 'vue-router';
import { useUserStore } from '../stores/userStore';
import HomeView from '../views/HomeView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { requiresAuth: false },
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
      meta: { guest: true },
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/RegisterView.vue'),
      meta: { guest: true },
    },
    {
      path: '/admin',
      name: 'admin',
      component: () => import('../views/AdminView.vue'),
      meta: { requiresAuth: true },
    },
  ],
});

// 路由守卫
router.beforeEach((to, from, next) => {
  const userStore = useUserStore();
  
  // 确保从 localStorage 加载用户信息
  if (!userStore.isAuthenticated) {
    userStore.loadFromStorage();
  }
  
  // 需要登录的页面
  if (to.meta.requiresAuth && !userStore.isAuthenticated) {
    next({ name: 'login', query: { redirect: to.fullPath } });
    return;
  }
  
  // 已登录用户访问登录/注册页，重定向到首页
  if (to.meta.guest && userStore.isAuthenticated) {
    next({ name: 'home' });
    return;
  }
  
  next();
});

export default router;
