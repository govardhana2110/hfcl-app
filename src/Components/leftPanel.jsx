import React from 'react';
import configuration from '../Images/configuration.png';
import alarm from '../Images/alarm.png';
import dashboard from '../Images/dashboard.png';
import performance from '../Images/performance.png';
import platform from '../Images/platform.png';
import security from '../Images/security.png';
import hfcl_logo from '../Images/hfcl_logo.png';
import software from '../Images/cms.png';
import file from '../Images/folder.png';
import settings from '../Images/setting.png';
import { ThemeProvider, createTheme } from "@mui/material/styles";

class Leftpanel extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
          page:this.props.page,
          role:null,
        }
    }
    componentDidMount(){
        let role_id=sessionStorage.getItem('role_id')
        this.setState({role:role_id})
    }
    redirectPath(id) {
        const { role } = this.state;
        console.log(role);
      
      if (role === 'NETWORK-OPERATOR') {
        sessionStorage.setItem("disableInputs",true)
        document.querySelectorAll('input').forEach(input => {
            input.disabled = true;
          });
        alert('You have read-only access');
        window.location.href = `/${id}/${sessionStorage.getItem('unique_id')}`;

      } else if (role === 'NETWORK-USER') {
        if (id !== 'alarm' && id !== 'performance') {
          alert('You do not have access for this section');
        } else {
          window.location.href = `/${id}/${sessionStorage.getItem('unique_id')}`;
        }
      } else {
        window.location.href = `/${id}/${sessionStorage.getItem('unique_id')}`;
      }
      
    }
    
    render() {
        const { darkMode } = this.props;
        const lightTheme = createTheme({
            palette: {
            background: {
                default: '#004f68', 
            },
            text: {
                primary: '#333',
            },
            },
        });
        
        const darkTheme = createTheme({
            palette: {
            background: {
                default: '#222', 
            },
            text: {
                primary: '#fff',
            },
            },
        });
        return (
            <div className='pageleft' style={{zIndex:'1002',overflow:'hidden',backgroundColor: darkMode ? darkTheme.palette.background.default : lightTheme.palette.background.default }}>
                <div id='image'>
                <div ><img src={hfcl_logo} alt=""  width= "125"/></div>
            </div>
              <div className='vl'></div>
                <div className='orusubsection'>
                    <div className={this.state.page==='dashboard'?('active_button'):('sidepannelheader')} onClick={()=>this.redirectPath('dashboard')}>
                        <div className='Ru_sub_button'>
                            <div className='icons'><img src={dashboard} alt=""  width= "20"/></div>
                            <div className='ru_sub_section'>Dashboard</div>
                        </div>
                    </div>
                    <div className={this.state.page==='alarm'?('active_button'):('sidepannelheader')}  onClick={()=>this.redirectPath('alarm')}>
                        <div className='Ru_sub_button'>
                            <div className='icons'><img src={alarm} alt=""  width= "20"/></div>
                            <div className='ru_sub_section'>Fault</div>
                        </div>
                    </div>
                    <div className={this.state.page==='configuration'?('active_button'):('sidepannelheader')} onClick={()=>this.redirectPath('configuration')}>
                        <div className='Ru_sub_button' >
                            <div className='icons'><img src={configuration} alt=""  width= "20"/></div>
                            <div  className='ru_sub_section' >Configuration</div>
                        </div>
                    </div>
                    
                     <div className={this.state.page==='performance'?('active_button'):('sidepannelheader')} onClick={()=>this.redirectPath('performance')}>
                        <div className='Ru_sub_button' >
                            <div className='icons'><img src={performance} alt=""  width= "20"/></div>
                            <div className='ru_sub_section' >Performance</div>
                        </div>                      
                    </div>
                    <div className={this.state.page==='security'?('active_button'):('sidepannelheader')} onClick={()=>this.redirectPath('security')}>
                        <div className='Ru_sub_button' >
                            <div className='icons'><img src={security} alt=""  width= "20"/></div>
                            <div className='ru_sub_section' >Security</div>
                        </div>                      
                    </div>
                    <div className={this.state.page==='software'?('active_button'):('sidepannelheader')} onClick={()=>this.redirectPath('software')}>
                        <div className='Ru_sub_button' >
                            <div className='icons'><img src={software} alt=""  width= "20"/></div>
                            <div className='ru_sub_section' >Software</div>
                        </div>                      
                    </div>
                    <div className={this.state.page==='file'?('active_button'):('sidepannelheader')} onClick={()=>this.redirectPath('file')}>
                        <div className='Ru_sub_button' >
                            <div className='icons'><img src={file} alt=""  width= "20"/></div>
                            <div className='ru_sub_section' >File</div>
                        </div>                      
                    </div>
                    <div className={this.state.page==='platform'?('active_button'):('sidepannelheader')} onClick={()=>this.redirectPath('platform')}>
                        <div className='Ru_sub_button' >
                            <div className='icons'><img src={platform} alt=""  width= "20"/></div>
                            <div className='ru_sub_section' >Platform</div>
                        </div>                      
                    </div>
                    <div className={this.state.page==='settings'?('active_button'):('sidepannelheader')} onClick={()=>this.redirectPath('settings')}>
                        <div className='Ru_sub_button' >
                            <div className='icons'><img src={settings} alt=""  width= "20"/></div>
                            <div className='ru_sub_section' >Settings</div>
                        </div>                      
                    </div>
                </div>
            </div>
        )
        }
}
       
    

 
export default Leftpanel;