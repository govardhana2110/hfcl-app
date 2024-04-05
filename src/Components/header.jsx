import React from "react";
import Tooltip from '@mui/material/Tooltip';
import { Popover } from 'antd';
import home from '../Images/home.png';
import policy from '../Images/privacy-policy.png';
import '../css/header.css';
import swal from 'sweetalert2';
import TextField from '@mui/material/TextField';
import Loading from '../Components/loader';
import close from '../Images/closeS.png';
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import ToggleIcon from '../Images/toggle-button.png';

class New_header extends React.Component {
   constructor(props) {
     super(props)
     this.state = { 
      isDarkMode:false,
      total_countno: 0, // Add the initial value for the total_countno state
      showPopup: false,
        header:this.props.header_name,
        path:this.props.path,
        alarms:this.props.alarms,
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
        value: 'Settings',      isOpen: false,
        icon: require('../Images/settings.png')},
        openDropdown:false,callhome_device_popup:{},get_globalfault:null,minorCount:null, majorCount:null,criticalCount:null,
      };
      this.handleRebootClick = this.handleRebootClick.bind(this);

   }

   handleRebootClick() {
    alert();
  }

   componentDidMount(){
    document.addEventListener('click', this.handleDocumentClick);
    let role = sessionStorage.getItem('role_id');
      if(role==='NETWORK-ADMIN'){
        this.setState({user_state_name:false})
      }
      else{
        this.setState({user_state_name:true})
      }
      this.notificationCount();  
      // this.fetch_callhome();
    }
    componentWillUnmount() {
      document.removeEventListener('click', this.handleDocumentClick);
    }
  notificationCount(){
    let device_unique_id = sessionStorage.getItem('unique_id');
    fetch(`http://${this.state.serverIP}:5003/notification-management/unread-count/${device_unique_id}`,
  {
      method:'GET',
      mode:'cors',
      headers:{'Access-Control-Allow-Origin':'http://localhost:3000',
      'username': sessionStorage.getItem('username'),
      'Authorization': 'Bearer ' + JSON.parse(sessionStorage.getItem('login_data')).data.access_token
    },
    })
    .then(resp=>resp.json())
    .then(resp=>{
      if(resp.message && this.state.header!='User Panel'){
        swal.fire({   
          title: resp.message,   
          text: "Upload a valid License, Redirecting to User Panel",   
          type: "Failure",   
          confirmButtonColor: "#DD6B55",   
          confirmButtonText: "OK",    })
          .then((result)=> {
            if (result.isConfirmed) 
            {   window.location.href='/user'
                } 
               
        });
      }
      else if(resp.status){
        this.setState({get_count:[]});
      }
      else{
        this.setState({get_count:resp});
      }
        this.count_Count();
    } )
    .catch((err) => {
      if (err.response) {
        alert(err.response.data.status)
        console.log('Error Response Data:', err.response.data);
        console.log('Error Response Status:', err.response.status);
        console.log('Error Response Headers:', err.response.headers);
      }
    });  
  }
  globalFaultsCounts(){
    fetch(`http://${this.state.serverIP}:5002/fault-management/get-all-buckets`,
        {
            mode:'cors',
            method:'GET',
            headers:{'Access-Control-Allow-Origin':'http://localhost:3000',
            'username': sessionStorage.getItem('username'),
            'Authorization': 'Bearer ' + JSON.parse(sessionStorage.getItem('login_data')).data.access_token
            },
        })
        .then(resp=>resp.json())
        .then(resp=>{
          console.log(resp)
          if(resp.status==="Faults list fetched successfully"){
            this.setState({get_globalfault:resp.data})
          }
        })
        .catch((err) => {
          if (err.response) {
            alert(err.response.data.status)
            console.log('Error Response Data:', err.response.data);
            console.log('Error Response Status:', err.response.status);
            console.log('Error Response Headers:', err.response.headers);
          }
        });  
        if(this.state.get_globalfault){
          var data=this.state.get_globalfault
          var major=0, minor=0, critical=0
          for(var i=0;i<data.length;i++){
              if(data[i].alarm_severity==="MAJOR"){
                  major++
              }
              else if(data[i].alarm_severity==="MINOR"){
                  minor++
              }
              else{
                  critical++
              }
          }
          this.setState({minorCount:minor,majorCount:major,criticalCount:critical})
          sessionStorage.setItem('minorCount',this.state.minorCount)  
          sessionStorage.setItem('majorCount',this.state.majorCount)
          sessionStorage.setItem('criticalCount',this.state.criticalCount)    }
  }
  count_Count(){
    var temp=this.state.get_count
    var count=0
    for(let key in temp){
        count+=parseInt(temp[key])
    }
    this.setState({total_countno:count})
    sessionStorage.setItem('notifTotalCount',this.state.total_countno)
}
    customStyles = {
      option: (provided, state) => ({
        ...provided,
        display: "flex",
        fontSize:"small",
        alignItems: "center",
        padding: "4px",
      }),
      valueContainer: (provided, state) => ({
        ...provided,
        display: "flex",
        fontSize:"small",
        alignItems: "center",
      }),
      dropdownIndicator: (provided, state) => ({
        ...provided,
        padding: "4px",
      }),
      menu: (provided, state) => ({
        ...provided,
        zIndex: 9999,
      }),
      singleValue: (provided, state) => ({
        ...provided,
        display: "flex",
        alignItems: "center",
      }),
      container: (base) => ({ ...base, width: '140px', height:'20px' }),
      indicatorSeparator: (provided, state) => ({
        ...provided,
        display: "none",
      })
    };
    fetch_callhome(){
      console.log('callhome................................................')
      fetch(`http://${this.state.serverIP}:5000/configuration-management/call-home`,
              {
                  method:'GET',
                  mode:'cors',
                  headers:{'Access-Control-Allow-Origin':'http://localhost:3000',
                  'username': sessionStorage.getItem('username'),
                  'Authorization': 'Bearer ' + JSON.parse(sessionStorage.getItem('login_data')).data.access_token
                },
              })
              .then(resp=>resp.json())
              .then(resp=>{
                console.log(resp)
                  this.setState({get_callhome:resp});
              if(resp.status.callhome==='yes' && this.state.open_callhome_popup!==true){
                // this.setState({show_callhome_call:true})
                swal.fire({   
                title: "CALLHOME REQUEST RECIEVED FROM " + resp.status.params.ip_add + ".....",   
                text: "Do You want to connect?",   
                type: "warning",   
                showCancelButton: true,   
                confirmButtonColor: "#DD6B55",   
                confirmButtonText: "Accept!",   
                cancelButtonText: "I am not sure!",   
                closeOnConfirm: false,   
                closeOnCancel: false })
                .then((result)=> {
                    if (result.isConfirmed) 
                    {   this.setState({open_callhome_popup:true})
                        } 
                       
                });
              }
              } ) 
              .catch((err) => {
                if (err.response) {
                  alert(err.response.data.status)
                  console.log('Error Response Data:', err.response.data);
                  console.log('Error Response Status:', err.response.status);
                  console.log('Error Response Headers:', err.response.headers);
                }
              });  
     }
     accept_callhome(){
      this.setState({open_callhome_popup:false})
      if(this.state.callhome_device_popup.device_name){
        var temp=this.state.callhome_device_popup
        temp["response"]="Accepted"
        console.log(temp,'callhomePOST data')
          fetch(`http://${this.state.serverIP}:5000/configuration-management/call-home`, {                     
              method: 'POST', 
              mode: 'cors',  
              headers:{'Access-Control-Allow-Origin':'http://localhost:3000',  
                      'Accept':'application/json', 
                      'Content-Type':'application/json'  ,
                      'username': sessionStorage.getItem('username'),
                        'Authorization': 'Bearer ' + JSON.parse(sessionStorage.getItem('login_data')).data.access_token
                  },
              body: JSON.stringify(temp) 
              })
              .then(resp=>resp.json())
              .then(resp=>{this.setState({callhome_response:resp})
              ;
              console.log(resp,'callhome response')
              if(resp.status==='Connection successful'){
                swal.fire("Device added!", "Your device is connected successfully!", "success");   
              }
              else{
                swal.fire("Connection Failed!", "Error while connecting...", "Failure");   
              }
              // this.setState({show_delete_confirmation_popup:false})
          })
          .catch((err) => {
            if (err.response) {
              alert(err.response.data.status)
              console.log('Error Response Data:', err.response.data);
              console.log('Error Response Status:', err.response.status);
              console.log('Error Response Headers:', err.response.headers);
            }
          });  
        }
    }
     CallHome(){
      var temp={response:"Accepted",device_name:this.state.to_update_device_name,username:this.state.to_update_username,password:this.state.to_update_password,role:this.state.user_role}
      console.log(temp,'callhomePOST data')
        fetch(`http://${this.state.serverIP}:5000/configuration-management/call-home`, {                     
            method: 'POST', 
            mode: 'cors',  
            headers:{'Access-Control-Allow-Origin':'http://localhost:3000',  
                    'Accept':'application/json', 
                    'Content-Type':'application/json'  ,
                    'username': sessionStorage.getItem('username'),
                      'Authorization': 'Bearer ' + JSON.parse(sessionStorage.getItem('login_data')).data.access_token
                },
            body: JSON.stringify(temp) 
            })
            .then(resp=>resp.json())
            .then(resp=>{this.setState({callhome_response:resp})
            ;
            console.log(resp,'callhome response')
            if(resp.status==='Connection successful'){
              this.setState({isLoading:false})
              swal.fire("Device added!", "Your device is connected successfully!", "success");
              this.setState({open_callhome_popup:false})  
              // window.location.reload(true) 
            }
            else{
              this.setState({isLoading:false})
              swal.fire("Connection Failed!", "Error while connecting...", "Failure");
              this.setState({open_callhome_popup:false})
   
            }
        })
        .catch((err) => {
          if (err.response) {
            alert(err.response.data.status)
            console.log('Error Response Data:', err.response.data);
            console.log('Error Response Status:', err.response.status);
            console.log('Error Response Headers:', err.response.headers);
          }
        });  
     }
  
    handleSelectChange = (option) => {
      this.setState({ selectedOption: option });
      this.handleOptionClick(option)
      console.log(option)
    };
    handleOptionClick = (option) => {
      console.log('Clicked option:', option);
      console.log('Redirecting to:', option.url);
      window.location.href = option.url;
    };
    getOptionLabel = (option) => (
      <div onClick={() => this.handleOptionClick(option)}>
        <img src={option.icon} alt={option.label} style={{ marginRight: '8px', height: '24px', width: '24px' }} />
        <div>{option.label}</div>
      </div>
    );
    formatOptionLabel = ({ label, icon }) => (
      <div style={{ display: "flex", alignItems: "center" }}>
        <img src={icon} alt={label} style={{ marginRight: '8px', height: '15px', width: '15px' }} />
        <div>{label}</div>
      </div>
    );
    markAllAsRead(notification_ids){
      let device_unique_id = sessionStorage.getItem('unique_id');
      var type={'notif_types':notification_ids}
      console.log(type)
      fetch(`http://${this.state.serverIP}:5003/notification-management/read-many/${device_unique_id}`, {                     
          method: 'POST', 
          mode: 'cors',  
          headers:{'Access-Control-Allow-Origin':'http://localhost:3000',  
                      'Accept':'application/json', 
                      'Content-Type':'application/json' ,
                      'username': sessionStorage.getItem('username'),
                      'Authorization': 'Bearer ' + JSON.parse(sessionStorage.getItem('login_data')).data.access_token
                  }, 
          body:JSON.stringify(type)
      })
      .then(resp=>resp.json())
      .then(resp=>{this.setState({allReadResponse:resp})
          console.log(resp,'all read response');
          if(resp.status==='All notifications of given types marked as read'){
              console.log('innnnnnnnnnnnnnn')
              this.setState({MessageRead:true})
              this.notificationCount();
          }
          })
          .catch((err) => {
            if (err.response) {
              alert(err.response.data.status)
              console.log('Error Response Data:', err.response.data);
              console.log('Error Response Status:', err.response.status);
              console.log('Error Response Headers:', err.response.headers);
            }
          });  
  }  
    renderNotificationPopup() {
      const { header, showPopup } = this.state;
      if (header !== 'Home' && showPopup) {
        const notificationContent = (
          <div className="notification-popup"
          onMouseEnter={this.handlePopupContentHover}
          onMouseLeave={this.handlePopupContentLeave}
        >
        <div 
        style={{position:'absolute',zIndex:'1',fontSize:'xx-small',right:'30px',top:'10px',cursor:'pointer',color:'grey',textDecoration:'underline'}} 
        onClick={()=>this.markAllAsRead(Object.keys(this.state.get_count))}
        >Mark All as Read</div>
            {this.state.get_count && this.state.get_count ? (
              Object.keys(this.state.get_count).map((key, index) => (
                this.state.get_count[key]!==0?(
                <div className={`notifList ${index % 2 === 0 ? 'even' : 'odd'}`} key={key} >
                  <span style={{marginLeft:"1%",fontWeight:"500"}}>{key}</span>
                  <span className="headerNotifCount">{this.state.get_count[key]}</span>
                </div>
                ):null
              ))
            ) : null}
          </div>

        );
        
        return (
          <Popover
          title="New Notifications"
          content={notificationContent}
          placement="bottom"
          visible={showPopup}
          trigger="hover"
          overlayStyle={{ width: '300px',left:'76vw' }}
          onVisibleChange={this.handlePopupVisibleChange}
          className="custom-notification-popup"
        >
            <div className="notificationPopup" style={{marginTop:'30px'}}>
              <span className="notificationCount"></span>
            </div>
          </Popover>
        );
      }
  
      return null;
    }
    handleBellIconHover = () => {
      this.setState((prevState) => ({ showPopup: !prevState.showPopup }));
    };
  
    handlePopupVisibleChange = (visible) => {
      this.setState({ showPopup: visible });
    };  
    handlePopupContentHover = () => {
      // Do nothing on hover to keep the popup visible
    };
    
    handlePopupContentLeave = () => {
      // this.setState({
      //   showPopup: false,
      // });
    };
    
  toggleDropdown = () => {
    this.setState((prevState) => ({
      isOpen: !prevState.isOpen,
    }));
  };

  handleDocumentClick = (event) => {
    if (this.dropdownRef && !this.dropdownRef.contains(event.target)) {
      this.setState({
        isOpen: false,
        showPopup:false
      });
    }
  };
  logOut(){
    var loginData=JSON.parse(sessionStorage.getItem('login_data')).data
    fetch(`http://${this.state.serverIP}:5006/user-management/logout`,
    {
        mode:'cors',
        method:'POST',
        headers:{'Access-Control-Allow-Origin':'http://localhost:3000',
        'Authorization': 'Bearer ' + loginData.access_token,
        'Accept':'application/json', 
        'username': sessionStorage.getItem('username'),
        'Content-Type':'application/json'  ,
         },
         body: JSON.stringify({"email":loginData.email})  
    })
    .then(resp=>resp.json())
    .then(resp=>{ window.location.href='/'  })
  }
  toggleDarkMode = () => {
    console.log("inhedr")
    this.setState((prevState) => ({ isDarkMode: !prevState.isDarkMode }));
  };

   render() {
    const { header, isOpen } = this.state;
    const {  darkMode, toggleDarkMode } = this.props;
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
         <div className="headerbar" 
          style={{
            ...(darkMode ? { backgroundColor: darkTheme.palette.background.default,color:"white" } : {}),
            ...(this.state.path === '' || this.state.path === 'User' || this.state.path === 'globalfaults'  || this.state.path==='securityManagement'? null : { left: '21%',top:"3%" }),
            }}
         >
            <div style={{display:'flex'}}>
              
              {this.state.path===''|| this.state.path==='User'||this.state.path==='globalfaults'||this.state.path==='securityManagement'?(
              <><img src={require('../Images/hfcl_logo_blue.png')} width='100' style={{marginLeft:'20px'}} alt=""></img><div className="horiline"></div></>

              ):null}

              {this.state.header==='Configuration Panel' || this.state.header==='Performance Panel' || this.state.header==='Security Panel' || this.state.header==='Platform Panel'?(
                <div className="header" style={{marginLeft:'20px'}}>{this.state.header} / {this.props.subHead}</div>
              ):(
                <div className="header" style={this.state.path===''|| this.state.path==='User'||this.state.path==='globalfaults'||this.state.path==='securityManagement'?({marginLeft:'2%'}):({marginLeft:'20px'})}>{this.state.header}</div>
              )}

              <div className="headerIcons" style={this.state.path !== '' && this.state.path !== 'User' && this.state.path !== 'globalfaults' && header !=='Dashboard' && this.state.path !=='securityManagement'?({marginTop:'-1%'}):null}>
              <div onClick={toggleDarkMode} className='dark-theme-toggler'>
                <Tooltip title="toggle to dark mode"><img src={ToggleIcon} alt='' width={20}/></Tooltip>
              </div>
              <Tooltip title="Policy" ><div onClick={()=>window.location.href='/policy'}><img src={policy} alt="" width={24}/></div></Tooltip>
              <div style={{marginRight:'20px'}}>
              </div>

              <Tooltip title="Dashboard" style={this.state.path==='' || this.state.path==='User'?({marginRight:'20px'}):({marginRight:'20px'})}><div onClick={()=>window.location.href='/globalDashboard'}><img src={require('../Images/globalDashboard.png')} alt=""  width= "20"/></div></Tooltip>
              <Tooltip title={
                <div>
                  Global Alarms
                </div>
                }>
                <div style={{marginRight:'20px'}} onClick={()=>window.location.href='/globalfaults'}><img src={require('../Images/faulticon.png')} alt=""  width= "20"/></div>
                </Tooltip>
                
              {header !== 'Home' && header !== 'Policy' && header !== 'User Panel'&& header !== 'Global Faults' && header !== 'Dashboard' ? (
                    <Tooltip title="" >
                      <div style={{cursor:'pointer'}} onClick={()=>window.location.href=`/notification/${sessionStorage.getItem('unique_id')}`}>
                        <img
                          src={require('../Images/bell.png')}
                          alt=""
                          width="20"
                          onMouseEnter={this.handleBellIconHover}
                        />
                      </div>
                    </Tooltip>
                  ) : null}
                  {header !== 'Home'&& header !== 'Policy' && header !== 'User Panel'&& header !== 'Global Faults'  && header !== 'Dashboard'? <div className="redDot" style={{marginRight:'10px'}}>{sessionStorage.getItem('notifTotalCount')}</div> : null}
                <Tooltip title="Home" style={{marginRight:'20px'}}><div onClick={()=>window.location.href='/network'}><img src={home} alt=""  width= "20"/></div></Tooltip>
                <div style={{backgroundColor:'grey',width:'2px',height:'30px',marginRight:'5%'}}></div>
                <div className="user-dropdown">
                  <div className="user-greeting" onClick={this.toggleDropdown} ref={(ref) => (this.dropdownRef = ref)}>
                    Hello {JSON.parse(sessionStorage.getItem('login_data')).data.first_name}
                    <img width={10} height={10} style={{ marginTop: '5%', marginLeft: '11%' }} src={require('../Images/downArrow.png')} alt="" />
                  </div>
                  {isOpen && (
                    <div className="dropdown-content-head" style={header === 'User Panel' ? { marginLeft: '-31%' } : header === 'Home' ? { marginLeft: '-32%' } : { marginLeft: '-29%' }}>
                      {header === 'User Panel' ? (
                        <a style={{ cursor: 'pointer', fontSize: 'small' }} onClick={() => (window.location.href = '/password')}>
                          Change Password
                          <img style={{ position: 'absolute', right: '14px' }} src={require('../Images/reset-password.png')} alt="" width="20" />
                        </a>
                      ) : (
                        <a style={{ cursor: 'pointer', fontSize: 'small' }} onClick={() => (window.location.href = '/user')}>
                          My Profile
                          <img style={{ position: 'absolute', right: header === 'User Panel' ? '14px' : '33px' }} src={require('../Images/userDashboard.png')} alt="" width="20" />
                        </a>
                      )}
                      <a style={{ cursor: 'pointer', fontSize: 'small' }} onClick={() => this.logOut()}>
                        Logout
                        <img style={{ position: 'absolute', right: header === 'User Panel' ? '14px' : '33px' }} src={require('../Images/logout.png')} alt="" width="20" />
                      </a>
                    </div>
                  )}
                </div>
                  {this.renderNotificationPopup()}
              </div>
            </div>
         
          {this.state.open_callhome_popup?(
            <div>
              <div className="blur-background"></div>
              <div className={'PopUp centerCol'} style={{marginTop:"8%"}}>
                  <img onClick={()=>this.setState({open_callhome_popup:false})} style={{position:'absolute',right:'4%',top:'3%',cursor:'pointer'}} src={close} alt='' width={10}/>
                  <div className='module_head'>CallHome Details:</div>
                  <div>
                      <div className="DialogInputs">
                          <TextField placeholder="Device Name" type="text"  label="Device Name" variant="standard" value={this.state.to_update_device_name}  onChange={(event) => {this.setState({to_update_device_name: event.target.value})}}/>
                      </div>
                      <div className="DialogInputs">
                          <TextField placeholder="Username" type="text"  label="Username" variant="standard" value={this.state.to_update_username}  onChange={(event) => {this.setState({to_update_username: event.target.value})}}/>
                      </div>
                      <div className="DialogInputs">
                          <TextField placeholder="Password" type="password"  label="Password" variant="standard" value={this.state.to_update_password}  onChange={(event) => {this.setState({to_update_password: event.target.value})}}/>
                      </div>
                      <div className="DialogInputs">
                          <TextField placeholder="user-role" type="roleStayway2306@
                          "  label="Role" variant="standard" value={this.state.user_role}  onChange={(event) => {this.setState({user_role: event.target.value})}}/>
                      </div>
                  </div>
                  {this.state.isLoading===true?(
                      <Loading/>
                  ):null}
                      <button 
                      style={{borderRadius:"3px",margin:"2%"}} className='btn btn-primary mb-3'
                      onClick={()=>{this.CallHome();this.setState({isLoading:true});}} 
                      >OK</button>
              </div>
            </div>
              
          ):null}
        </div>
     );
   }
 }

 export default New_header;