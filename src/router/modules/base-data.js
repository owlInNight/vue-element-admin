
import Layout from '@/layout'

const baseData = {
  path: '/baseData', // 基础数据管理
  component: Layout,
  redirect: '/baseData/user',
  alwaysShow: false,
  name: 'BaseData',
  meta: {
    title: '基础信息管理',
    icon: 'table',
    roles: ['admin']
  },
  children: [
    //  子菜单
    {
      //    路径
      path: 'user',
      component: () => import('@/views/base-data/user/user'),
      name: 'User',
      meta: {
        icon: 'peoples',
        title: '用户管理',
        roles: ['admin']
      }
    },
    //  子菜单
    {
      //    路径
      path: 'role',
      component: () => import('@/views/base-data/role/list'),
      name: 'Role',
      meta: {
        icon: 'lock',
        title: '权限管理',
        roles: ['admin']
      }
    }
  ]
}
export default baseData;
