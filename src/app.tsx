import { Component, PropsWithChildren } from 'react';
import { useLaunch } from '@tarojs/taro';
import '@nutui/nutui-react-taro/dist/styles/themes/default.scss';
import './app.scss';

function App({ children }: PropsWithChildren<any>) {
  useLaunch(() => {
    console.log('App launched.');
  });

  return children;
}

export default App;
