import React from "react";
import Tooltip from '@mui/material/Tooltip';
import home from '../Images/home.png';
import '../css/header.css';
import Select from "react-select";
import swal from 'sweetalert2';
import TextField from '@mui/material/TextField';
import Loading from '../Components/loader';

class New_header extends React.Component {
   constructor(props) {
     super(props)
     this.state = { 
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
        openDropdown:false,callhome_device_popup:{}
      };
      this.handleRebootClick = this.handleRebootClick.bind(this);

   }

   handleRebootClick() {
    alert();
  }
   componentDidMount(){
    // this.subscribeEvent()
    // var subscribed=sessionStorage.getItem("flagEvent")
    // console.log(sessionStorage.getItem('flagEvent'))
    // if(subscribed!=='subscribed'){
    //   this.subscribeEvent()
    // }    
    let role = sessionStorage.getItem('role_id');
      if(role==='admin'){
        this.setState({user_state_name:false})
      }
      else{
        this.setState({user_state_name:true})
      }
      console.log(role)
      this.fetch_callhome();  
      this.notificationCount();  
    }
  //  subscribeEvent(){
  //   console.log('inside event')
  //     const source = new EventSource(`http://${this.state.serverIP}:5000/configuration-management/notif-stream`);
  //     source.onmessage = (event) => {
  //       console.log(event);
  //       console.log(event.data);
  //       sessionStorage.setItem("flagEvent",'subscribed')
  //       const newElement = document.createElement("li");
  //       const eventList = document.getElementById("list");
  //       newElement.textContent = `message: ${event.data} id: ${event.lastEventId} type: ${event.type}`;
  //       eventList.appendChild(newElement);
  //     };
  //  }
  notificationCount(){
    let device_unique_id = sessionStorage.getItem('unique_id');
    fetch(`http://${this.state.serverIP}:5003/notification-management/count/${device_unique_id}`,
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
            this.setState({get_count:resp});
        console.log(resp.unread_count,'notof_COUNT')
        this.count_Count();
    } )
  }
  count_Count(){
    var temp=this.state.get_count.unread_count
    var count=0
    for(let key in temp){
        count+=parseInt(temp[key])
    }
    this.setState({total_countno:count})
    console.log(this.state.total_countno,'count')
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
      // console.log('callhome................................................')
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
                  this.setState({get_callhome:resp});
                console.log(resp,':get_callhome')
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
                      'username': sessionStorage.getItem('username'),
                      'Content-Type':'application/json'  ,
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
          })}
    }
     CallHome(){
      var temp={response:"Accepted",device_name:this.state.to_update_device_name,username:this.state.to_update_username,password:this.state.to_update_password}
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
              window.location.reload(true) 
            }
            else{
              this.setState({isLoading:false})
              swal.fire("Connection Failed!", "Error while connecting...", "Failure");
              this.setState({open_callhome_popup:false})
   
            }
            // this.setState({show_delete_confirmation_popup:false})
        })
     }
  
     listen_to_heartbeat(){
      // console.log('HEARTBEAT................................................')
      fetch(`http://${this.state.serverIP}:5007/notify_for_hb_fail`,
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
                console.log(resp.flag_list)
                if(resp.flag_list.length>0){
                  swal.fire({   
                    title: "Heartbeat Failed for " + resp.flag_list[0],   
                    text: "Redirecting to Network Panel",   
                    type: "Failure",   
                    confirmButtonColor: "#DD6B55",   
                    confirmButtonText: "OK",    })
                    .then((result)=> {
                      if (result.isConfirmed) 
                      {   window.location.href='/network'
                          } 
                         
                  });
                }
              } ) 
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
     
   render() {
     return (
      <div style={{background:'',width:'100%'}}>
         <div className="headerbar" style={this.state.path===''|| this.state.path==='User' ?({marginLeft:'3%',width:'94%'}):null} >
          <div style={{display:'flex',marginTop:'15px',marginLeft:'20px'}}>
          <div className="main_head_url">Test_Device / {this.state.path}</div>
          <div className="headerIcons">
          <div style={{marginRight:'20px'}}>
          {sessionStorage.getItem('role_id')==='NETWORK ADMINISTRATOR' && this.state.header!=='Network Panel' && this.state.header!=='User Panel'?(
            <Select
          options={this.state.options1}
          styles={this.customStyles}
          formatOptionLabel={this.formatOptionLabel}
          isSearchable={false}
          value={this.state.defaultValue}
          onChange={this.handleSelectChange}
          getOptionLabel={this.getOptionLabel}
        />
          ):(
            <Select
          options={this.state.options}
          styles={this.customStyles}
          formatOptionLabel={this.formatOptionLabel}
          isSearchable={false}
          value={this.state.defaultValue}
          onChange={this.handleSelectChange}
          getOptionLabel={this.getOptionLabel}
        />
          )}
          </div>
            <Tooltip title="Home"><div onClick={()=>window.location.href='/network'}><img src={home} alt=""  width= "20"/></div></Tooltip>
            {this.state.header!=='Network Panel'?(<Tooltip style={{marginLeft:'20px'}} title="Notification"><div onClick={()=>window.location.href=`/notification/${sessionStorage.getItem('unique_id')}`}><img src={require('../Images/bell.png')} alt=""  width= "20"/></div></Tooltip>):null}
            {this.state.header!=='Network Panel'?(<div className="redDot">{this.state.total_countno}</div>):null}
          </div>
          </div>
          {this.state.header==='Configuration Panel' || this.state.header==='Performance Panel' || this.state.header==='Security Panel' || this.state.header==='Platform Panel'?(
            <div className="header" style={{marginLeft:'20px'}}>{this.state.header} / {this.props.subHead}</div>
            ):(
              <div className="header" style={{marginLeft:'20px'}}>{this.state.header}</div>
            )}
            {this.state.open_callhome_popup?(
            <div className='Popupshow' style={{height:'390%'}}>
                                <div className='modalcontent' style={{width:'270px',opacity:'2',backgroundColor:'white'}}>
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
                                    </div>
                                    {this.state.isLoading===true?(
                                        <Loading/>
                                    ):null}
                                    <div className='delete_buttons'>
                                        <button onClick={()=>{this.CallHome();this.setState({isLoading:true});}} className='delete_yes' style={{marginLeft:'10px',backgroundColor:'#004f68'}}>OK</button>
                                        <button onClick={()=>this.setState({open_callhome_popup:false})} className='delete_cancel' >Cancel</button>
                                    </div>
                                </div>
                            </div>
        ):null}
        </div>
      </div>
     );
   }
 }

 export default New_header;