import React from 'react';
import ReactDOM from 'react-dom';

import './styles/index.css';
import { GlobalStyles } from './styles/global';

import App from './components/App';
import { MqttProvider } from "./utils/react-mqtt";

import * as serviceWorker from './serviceWorker';

ReactDOM.render(
  <React.StrictMode>
    <GlobalStyles />
    <MqttProvider>
      <App />
    </MqttProvider>
  </React.StrictMode>,
  document.getElementById('root')
);

serviceWorker.unregister();
