import React from 'react';
import configuration from '../Images/configuration.png';
import alarm from '../Images/alarm.png';
import dashboard from '../Images/dashboard.png';
import performance from '../Images/performance.png';
import platform from '../Images/platform.png';
import logs from '../Images/logs.png';
import notification from '../Images/notification.png';
import security from '../Images/security.png';
import hfcl_logo from '../Images/hfcl_logo.png';
import software from '../Images/cms.png';

class Leftpanel extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
          page:this.props.page,
      
        }
     
    }
    render() { 
        return (
            <div className='pageleft' style={{zIndex:'1002'}}>
                <div id='image'>
                <div ><img src={hfcl_logo} alt=""  width= "125"/></div>
            </div>
              <div className='vl'></div>
                <div className='orusubsection'>
                    <div className={this.state.page==='dashboard'?('active_button'):('sidepannelheader')} onClick={()=>window.location.href=`/dashboard/${sessionStorage.getItem('unique_id')}`}>
                        <div className='Ru_sub_button'>
                            <div className='icons'><img src={dashboard} alt=""  width= "20"/></div>
                            <div className='ru_sub_section'>Dashboard</div>
                        </div>
                    </div>
                    <div className={this.state.page==='alarm'?('active_button'):('sidepannelheader')}  onClick={()=>window.location.href=`/alarm/${sessionStorage.getItem('unique_id')}`}>
                        <div className='Ru_sub_button'>
                            <div className='icons'><img src={alarm} alt=""  width= "20"/></div>
                            <div className='ru_sub_section'>Fault</div>
                        </div>
                    </div>
                    <div className={this.state.page==='configuration'?('active_button'):('sidepannelheader')} onClick={()=>window.location.href=`/configuration/${sessionStorage.getItem('unique_id')}`}>
                        <div className='Ru_sub_button' >
                            <div className='icons'><img src={configuration} alt=""  width= "20"/></div>
                            <div  className='ru_sub_section' >Configuration</div>
                        </div>
                    </div>
                    
                     <div className={this.state.page==='performance'?('active_button'):('sidepannelheader')} onClick={()=>window.location.href=`/performance/${sessionStorage.getItem('unique_id')}`}>
                        <div className='Ru_sub_button' >
                            <div className='icons'><img src={performance} alt=""  width= "20"/></div>
                            <div className='ru_sub_section' >Performance</div>
                        </div>                      
                    </div>
                    <div className={this.state.page==='security'?('active_button'):('sidepannelheader')} onClick={()=>window.location.href=`/security/${sessionStorage.getItem('unique_id')}`}>
                        <div className='Ru_sub_button' >
                            <div className='icons'><img src={security} alt=""  width= "20"/></div>
                            <div className='ru_sub_section' >Security</div>
                        </div>                      
                    </div>
                    <div className={this.state.page==='software'?('active_button'):('sidepannelheader')} onClick={()=>window.location.href=`/software/${sessionStorage.getItem('unique_id')}`}>
                        <div className='Ru_sub_button' >
                            <div className='icons'><img src={software} alt=""  width= "20"/></div>
                            <div className='ru_sub_section' >Software</div>
                        </div>                      
                    </div>
                    <div className={this.state.page==='platform'?('active_button'):('sidepannelheader')} onClick={()=>window.location.href=`/platform/${sessionStorage.getItem('unique_id')}`}>
                        <div className='Ru_sub_button' >
                            <div className='icons'><img src={platform} alt=""  width= "20"/></div>
                            <div className='ru_sub_section' >Platform</div>
                        </div>                      
                    </div>
                    <div className={this.state.page==='logs'?('active_button'):('sidepannelheader')} onClick={()=>window.location.href=`/logs/${sessionStorage.getItem('unique_id')}`}>
                        <div className='Ru_sub_button' >
                            <div className='icons'><img src={logs} alt=""  width= "20"/></div>
                            <div className='ru_sub_section' >Log</div>
                        </div>                      
                    </div>
                    <div className={this.state.page==='notification'?('active_button'):('sidepannelheader')} onClick={()=>window.location.href=`/notification/${sessionStorage.getItem('unique_id')}`}>
                        <div className='Ru_sub_button' >
                            <div className='icons'><img src={notification} alt=""  width= "20"/></div>
                            <div className='ru_sub_section' >Notification</div>
                        </div>                      
                    </div>
                </div>
               
            </div>
        )
        }
}
       
    

 
export default Leftpanel;