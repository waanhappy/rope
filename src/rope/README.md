### rope

- plugin 支持
- dom 挂载操作
- server side render

#### plugin 支持

rope 通过 plugin 方式扩展项目的组件支持

- i18n 国际化
- commonData 公共数据
- env 环境变量获取
- ssr 服务端渲染
- design 装修服务支持

plugin 的组成：

- component: React.Component<T> 一个 react 组件
- props: T 组件接收的初始 props
- subscribes { [key:string]: (preload) => Promise<T> } 事件订阅
    subscribes 订阅的事件可通过 rope.trigger(key, (preState: T) => preload) 触发

```JavaScript
  // 创建rope对象
  const rope = new rope();

  // 增加 plugin
  rope.plugin({ component: Antd.Provider, props: { locale: 'zh-CN' }, });

  // 增加 commonData plugin
  rope.plugin(commonDataPlugin({ items: [{
    name: 'user',
    url: '/api/user/web/current-user',
    excludePath: ['SignUp', 'Auth'],
    // 参考 request 的 options 参数
    options: {},
    // eslint-disable-next-line no-unused-vars
    handleData(data) {
      return data || {};
    },
    // 防止重复调用
    onError() {
      return {};
    },
  },] }))

  rope.useApp(<RootAppComponent />);
```

userInfo plugin demo

```javascript
// user-info-plugin.jsx
import { createContext, useContext } from 'react';

const userContext = createContext({});

export async function plugin() {
  // 异步获取数据
  const user = await getUserFormServer();
  return {
    component: userContext.Provider,
    props: { value: user },
    // 更新用户信息
    subscribes: { updateUser: (user) => user },
  };
}

export function useUserInfo() {
  const user = useContext(userContext);
  return user;
}

// rope.js

import { rope } from '@webtanzhi/rope';
import { plugin } from '../user-info-plugin';

const rope = new rope();

rope.plugin(plugin());

export { rope };


// profile.jsx
import React from 'react';
import { useUserInfo } from '../user-info-plugin';
import { rope } from '../rope';

async function refreshUser () {
  // 从服务端获取数据
  const user = await getUserInfoFromServer();

  // 触发更新
  rope.trigger('updateUser', (preUserState) => {
    return user;
  })
}
// 使用user
export function Profile() {
  const user = useUserInfo();

  return (
    <div>
      <span>我是：{user.username}</span>
      <button onClick={}>刷新用户信息</button>
    </div>
  );
}
```
