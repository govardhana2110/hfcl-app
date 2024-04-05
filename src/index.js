import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import reportWebVitals from './reportWebVitals';
import 'bootstrap/dist/css/bootstrap.css';
import './css/leftpanel.css';
import './css/fault_panel.css';
import './css/performance_panel.css';
import './css/security_panel.css';
import './css/configuration_panel.css';
import './css/button.css';
import './css/accounting_panel.css';
import './css/device_panel.css';
import './css/network_panel.css';
import './css/platform_panel.css';
import './css/input_module.css';
import './css/log_management_panel.css';
import './css/test.css';
import './css/table.css';
import './css/threshold.css';
import './css/user_plane_info.css';
import './css/login.css';
import './css/dashboard.css';
import './css/software.css';
import './css/checkboxComponent.css';
import './css/policy.css';
import './css/sla_management.css';
import './css/notification.css';
import './css/vpn.css';
import RoutingPage from './Pages/routing_page';
import { SubscribeToEvents } from './sse';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer} from 'react-toastify';
const App = () => {
  return (
    <React.StrictMode>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      {/* <SubscribeToEvents /> */}
      <RoutingPage />
    </React.StrictMode>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));

reportWebVitals();
