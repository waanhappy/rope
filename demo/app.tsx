import React, { useContext } from 'react';
import { rope } from './rope';
import { demoCtx } from './plugin';

export function App() {
  function handleChange(e) {
    rope
      .trigger('changeData', () => {
        return { name: e.target.value };
      })
      .then(() => {
        console.log('状态已更新');
      });
  }

  return (
    <div>
      <select onChange={handleChange}>
        <option value="abc">ABC</option>
        <option value="名称1">名称1</option>
        <option value="名称2">名称2</option>
        <option value="名称3">名称3</option>
      </select>
      <ValueShower />
    </div>
  );
}

function ValueShower() {
  const { name } = useContext(demoCtx);
  return <div>当前值:{name}</div>;
}
