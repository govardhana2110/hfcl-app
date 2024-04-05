import React from "react";
import Tooltip from '@mui/material/Tooltip';
import home from '../Images/home.png';
import globalDashboard from '../Images/globalDashboard.png';
import '../css/header.css';
import hfcl_logo from '../Images/hfcl_logo_blue.png';

class FullHeader extends React.Component {
   constructor(props) {
     super(props)
     this.state = { 
      total_countno: 0, // Add the initial value for the total_countno state
      showPopup: false,
        header:this.props.header_name,
        path:this.props.path,
        serverIP:process.env.REACT_APP_CLIENT_IP,
        subHead:this.props.subHead,
        options: [
          {
            label: "My profile",
            value: "option1",
            icon: require('../Images/userDashboard.png'),
            url:'/user'
          },
          {
            label: "Change password",
            value: "option2",
            icon: require('../Images/changePassword.png'),
            url:'/password'
          },
          {
            label: "Logout",
            value: "option3",
            icon: require('../Images/logout.png'),
            url:'/'
          }
        ],
        options1: [
          {
            label: "My profile",
            value: "option1",
            icon: require('../Images/userDashboard.png'),
            url: '/user'
          },
          {
            label: "Change password",
            value: "option2",
            icon: require('../Images/changePassword.png'),
            url: '/password'
          },
          {
            label: "Reboot",
            value: "option3",
            icon: require('../Images/reboot.png'),
            url: '/network'
          },
          {
            label: "Logout",
            value: "option4",
            icon: require('../Images/logout.png'),
            url: '/'
          }
        ],
        selectedOption:null,
        defaultValue:{label: 'Settings',
        value: 'Settings',
        icon: require('../Images/settings.png')},
        openDropdown:false,callhome_device_popup:{},get_globalfault:null,minorCount:null, majorCount:null,criticalCount:null,
      };
   }
    
   render() {
     return (
      <div style={{height:'100vh',width:'100vw'}}>
         <div className="fullheader" >
          <div style={{display:'flex',marginTop:'15px',marginLeft:'20px'}}>
          <div className="logoBorder"><img src={hfcl_logo} alt=""  width= "125"/></div>
          <div className="borderLine"></div>
          <div className="header" style={{marginLeft:'20px'}}>Global Dashboard</div>
          <div className="headerIcons" style={{right:'0'}}>
            <Tooltip title="Global dash" style={{marginRight:'15px',marginLeft:''}}><div onClick={()=>window.location.href='/dash'}><img src={globalDashboard} alt=""  width= "20"/></div></Tooltip>
            <Tooltip title="My Profile" ><div onClick={()=>window.location.href='/user'}><img src={require('../Images/userDashboard.png')} alt=""  width= "20"/></div></Tooltip>
            <Tooltip title="Home" style={{marginRight:'15px',marginLeft:'12px'}}><div onClick={()=>window.location.href='/network'}><img src={home} alt=""  width= "20"/></div></Tooltip>
            <Tooltip title="Logout" style={{marginRight:'15px'}}><div onClick={()=>window.location.href='/'}><img src={require('../Images/logout.png')} alt=""  width= "20"/></div></Tooltip>
          </div>
          </div>
          
        </div>
       
      </div>
     );
   }
 }

 export default FullHeader;