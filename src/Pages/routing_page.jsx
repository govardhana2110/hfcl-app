import React from 'react';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import FaultPanel from './alarm';
import Leftpanel from '../Components/leftPanel';
import Login from './login';
import ConfigurationPanel from './configuration';
import NetworkPanel from './network';
import PerformancePanel from './performance';
import PlatformPanel from './platform';
import SecurityPanel from './security';
import NotificationPanel from './notification';
import LogPanel from './log';
import FilePanel from './file';
import UserPanel from './user';
import Topology from '../Components/topology';
import Test from '../Components/test';
import NewDash from './dashboard';
import UpdatePassword from '../Components/password';
import Software from './software.jsx';
import JsonCompare from '../Components/jsonComparison.jsx';
import Compare from './compareFields';
import CommonDash from '../Pages/commonDash.jsx';
import GlobalFault from './global_faults';
import Settings from './settings';
import RoutingTable from './routingTable';
import Policy from './policy.jsx';
import Vpn from './vpn.jsx';
import SecurityManagement from './SecurityManagement.jsx';
class RoutingPage extends React.Component {
    constructor(props){
        super(props);
        this.state={
            a:true,
        }
    }
    render() { 
        return (
                <BrowserRouter>
                    <Routes>
                        <Route path='/' exact element={< Login />}/>
                        <Route path='/password' exact element={< UpdatePassword />}/>
                        <Route path='/leftpanel' exact element={< Leftpanel />}/>
                        <Route path={`/dashboard/${sessionStorage.getItem('unique_id')}`} exact element={< NewDash />}/>
                        <Route path={`/alarm/${sessionStorage.getItem('unique_id')}`} exact element={< FaultPanel />}/>
                        <Route path={`/configuration/${sessionStorage.getItem('unique_id')}`} exact element={< ConfigurationPanel />}/>
                        <Route path='/network' exact element={< NetworkPanel />}/>
                        <Route path={`/performance/${sessionStorage.getItem('unique_id')}`} exact element={< PerformancePanel />}/>                        
                        <Route path={`/platform/${sessionStorage.getItem('unique_id')}`} exact element={< PlatformPanel />}/>                        
                        <Route path={`/security/${sessionStorage.getItem('unique_id')}`} exact element={< SecurityPanel />}/>    
                        <Route path={`/software/${sessionStorage.getItem('unique_id')}`} exact element={< Software />}/>                                            
                        <Route path={`/notification/${sessionStorage.getItem('unique_id')}`} exact element={< NotificationPanel />}/>                        
                        <Route path={`/logs/${sessionStorage.getItem('unique_id')}`} exact element={< LogPanel />}/>   
                        <Route path={`/file/${sessionStorage.getItem('unique_id')}`} exact element={< FilePanel />}/>                                             
                        <Route path='/user' exact element={< UserPanel />}/>
                        <Route path='/topology' exact element={< Topology />}/>
                        <Route path='/test' exact element={< Test />}/>
                        <Route path='/json' exact element={< JsonCompare />}/>
                        <Route path='/compare' exact element={< Compare />}/>
                        <Route path='/globalDashboard' exact element={< CommonDash />}/>
                        <Route path='/routing' exact element={< RoutingTable />}/>
                        <Route path='/globalfaults' exact element={< GlobalFault />}/>
                        <Route path='/policy' exact element={< Policy />}/>
                        <Route path='/vpn' exact element={< Vpn />}/>
                        <Route path={`/settings/${sessionStorage.getItem('unique_id')}`} exact element={< Settings />}/>
                        <Route path='/security-management' element={<SecurityManagement/>}/>
                    </Routes>
                </BrowserRouter>
        );
    }
}
export default RoutingPage;