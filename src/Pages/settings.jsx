import React from 'react';
import NewHeader from '../Components/header';
import NewLeftpanel from '../Components/leftPanel';
import ConfigDetailsPopup from '../Components/configDetails'; // Adjust the import path based on your project structure
import swal from 'sweetalert2';
import Tooltip from '@mui/material/Tooltip';
import Toggle from '../Components/toggle';
import axios from 'axios';
import Loading from '../Components/loader';
import Swal from 'sweetalert2';
import '../css/settings.css';
import { ThemeProvider, createTheme } from "@mui/material/styles";

class ConfigurationPanel extends React.Component{
    constructor(props){
        super(props);
        this.state={
            isDarkMode:false,
         serverIP:process.env.REACT_APP_CLIENT_IP,
         showConfigDetails:false,
         is_fetching:false
        };
    }
    componentDidMount(){
    this.fetchConfigVersions()
    }
    fetchConfigVersions(){
    this.setState({is_fetching:true})
    var deviceId = sessionStorage.getItem('unique_id')
    fetch(`http://${this.state.serverIP}:5000/configuration-management/version-list/${deviceId}`,
    {
        mode:'cors',
        method:'GET',
        headers:{'Access-Control-Allow-Origin':'http://localhost:3000',
        'username': sessionStorage.getItem('username'),
        'Authorization': 'Bearer ' + JSON.parse(sessionStorage.getItem('login_data')).data.access_token,
        },
    })
    .then(resp=>resp.json())
    .then(resp=>{console.log(resp,'version-list');
                this.setState({versionList:resp,is_fetching:false})
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
    saveCurrentVersion(){
    this.setState({is_fetching:true})
    var deviceId = sessionStorage.getItem('unique_id')
    fetch(`http://${this.state.serverIP}:5000/configuration-management/save-version-manually/${deviceId}`,
    {
        mode:'cors',
        method:'POST',
        headers:{'Access-Control-Allow-Origin':'http://localhost:3000',
        'username': sessionStorage.getItem('username'),
        'Authorization': 'Bearer ' + JSON.parse(sessionStorage.getItem('login_data')).data.access_token,
        },
    })
    .then(resp=>resp.json())
    .then(resp=>{console.log(resp,'save-current-version-response');
        if(resp.status){
            Swal.fire({
                position: 'center',
                title: resp.status,
                icon : 'success',
                showConfirmButton: false,
                timer : 15000,
                color: '#116C39',
            })
        }
        this.fetchConfigVersions();
        this.setState({is_fetching:false})

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
    deleteSavedVersion(id){
        console.log("Entered");
    this.setState({is_fetching:false})
    swal.fire({   
        title: "Are you sure you want to Delete the Saved Configuration?",   
        text: "",   
        type: "warning",   
        showCancelButton: true,   
        confirmButtonColor: "#DD6B55",   
        confirmButtonText: "Ok",   
        cancelButtonText: "Cancel",   
        closeOnConfirm: false,   
        closeOnCancel: false })
        .then((result)=> {
            if (result.isConfirmed) {
                console.log("delete");
                this.setState({is_fetching:true})
                fetch(`http://${this.state.serverIP}:5000/configuration-management/delete-version/${id}`,
                {
                    mode:'cors',
                    method:'DELETE',
                    headers:{'Access-Control-Allow-Origin':'http://localhost:3000',
                    'username': sessionStorage.getItem('username'),
                    'Authorization': 'Bearer ' + JSON.parse(sessionStorage.getItem('login_data')).data.access_token,
                    },
                })
                .then(resp=>resp.json())
                .then(resp=>{console.log(resp,'delete-version-response');
                this.setState({is_fetching:false});
                //  resp.status && alert(resp.status)
                
                    if(resp.status){
                        setTimeout(()=>{alert(resp.status)},300)
                        // alert(resp.status)
                    }
                    this.fetchConfigVersions();
                    this.setState({is_fetching:false})
                })
            }
        else{
            this.setState({is_fetching:false})
        }})
        .catch((err) => {
            if (err.response) {
                alert(err.response.data.status)
                console.log('Error Response Data:', err.response.data);
                console.log('Error Response Status:', err.response.status);
                console.log('Error Response Headers:', err.response.headers);
            }
            });  
    }
    viewConfigDetails(id){
    this.setState({is_fetching:true})
    var deviceId = sessionStorage.getItem('unique_id')
    fetch(`http://${this.state.serverIP}:5000/configuration-management/version-details/${deviceId}`,
    {
        mode:'cors',
        method:'POST',
        headers:{'Access-Control-Allow-Origin':'http://localhost:3000',
        'username': sessionStorage.getItem('username'),
        'Accept':'application/json', 
        'Content-Type':'application/json',
        'Authorization': 'Bearer ' + JSON.parse(sessionStorage.getItem('login_data')).data.access_token,
        },
        body:JSON.stringify({'version_id':id})
    })
    .then(resp=>resp.json())
    .then(resp=>{console.log(resp,'VIEW-version-response');
    if(!resp.status){
        const data=resp.rw_data.data
        this.setState({showConfigDetails:true,configDetails:data,is_fetching:false})
    }
    else{
        alert(resp.status)
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
    applyConfiguration(id){
    this.setState({is_fetching:true})
    var deviceId = sessionStorage.getItem('unique_id')
    fetch(`http://${this.state.serverIP}:5000/configuration-management/apply-version/${deviceId}`,
    {
        mode:'cors',
        method:'POST',
        headers:{'Access-Control-Allow-Origin':'http://localhost:3000',
        'username': sessionStorage.getItem('username'),
        'Accept':'application/json', 
        'Content-Type':'application/json',
        'Authorization': 'Bearer ' + JSON.parse(sessionStorage.getItem('login_data')).data.access_token,
        },
        body:JSON.stringify({'version_id':id})
    })
    .then(resp=>resp.json())
    .then(resp=>{console.log(resp,'apply-version-response');
        this.setState({is_fetching:false})
        if(resp.status['rpc-reply']){
            alert('SUCCESS')
        }
        else{
            alert('FAILED')
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
    closePopup = () => {
    this.setState({ showConfigDetails: false }); 
    };
    submit = (id) => {
        let device_unique_id = sessionStorage.getItem('unique_id');
        if(id === 'freeze'){
            swal.fire({   
                title: "Device in Freezed Mode",   
                text: "Are you sure you want to unfreeze the device?",   
                type: "warning",   
                showCancelButton: true,   
                confirmButtonColor: "#DD6B55",   
                confirmButtonText: "Unfreeze",   
                cancelButtonText: "Cancel",   
                closeOnConfirm: false,   
                closeOnCancel: false })
                .then((result)=> {
                    if (result.isConfirmed) {
                        fetch(`http://${this.state.serverIP}:5000/configuration-management/unlock-config/${device_unique_id}`, { 
                            method:'GET',  
                            mode: 'cors',  
                            headers:{'Access-Control-Allow-Origin':'http://localhost:3000',  
                                        'Accept':'application/json', 
                                        'Content-Type':'application/json'  ,
                                        'username': sessionStorage.getItem('username'),
                                        'Authorization': 'Bearer ' + JSON.parse(sessionStorage.getItem('login_data')).data.access_token
                                    },  
                                    
                            }).then(resp=>resp.json())
                            .then(resp=>{
                                console.log(resp)
                                if(resp.status==='Device configuration unlocked'){
                                    sessionStorage.setItem('status_lock',false)
                                    swal.fire({   
                                        title: 'Device Configuration Unlocked',   
                                        text: "",   
                                        type: "success",   
                                        showCancelButton: true,   
                                        confirmButtonColor: "#DD6B55",   
                                        closeOnConfirm: false,   
                                        closeOnCancel: false })
                                        .then((result)=>{
                                            if(result.isConfirmed){
                                                window.location.reload();
                                            }
                                        })
                                }
                            })
                    }})
                    .catch((err) => {
                        if (err.response) {
                            alert(err.response.data.status)
                            console.log('Error Response Data:', err.response.data);
                            console.log('Error Response Status:', err.response.status);
                            console.log('Error Response Headers:', err.response.headers);
                        }
                        });  
        }
        else{
            swal.fire({   
                title: "Device in Unfreezed Mode",   
                text: "Are you sure you want to freeze the device?",   
                type: "warning",   
                showCancelButton: true,   
                confirmButtonColor: "#DD6B55",   
                confirmButtonText: "Freeze",   
                cancelButtonText: "Cancel",   
                closeOnConfirm: false,   
                closeOnCancel: false })
                .then((result)=> {
                    if (result.isConfirmed) {
                        fetch(`http://${this.state.serverIP}:5000/configuration-management/lock-config/${device_unique_id}`, { 
                            method:'GET',  
                            mode: 'cors',  
                            headers:{'Access-Control-Allow-Origin':'http://localhost:3000',  
                                        'Accept':'application/json', 
                                        'Content-Type':'application/json'  ,
                                        'username': sessionStorage.getItem('username'),
                                        'Authorization': 'Bearer ' + JSON.parse(sessionStorage.getItem('login_data')).data.access_token
                                    },  
                            }).then(resp=>resp.json())
                            .then(resp=>{
                                console.log(resp)
                                if(resp.status==='Device configuration locked'){
                                    sessionStorage.setItem('status_lock',true)
                                    swal.fire({   
                                        title: 'Device Configuration Locked',   
                                        text: "",   
                                        type: "success",   
                                        showCancelButton: true,   
                                        confirmButtonColor: "#DD6B55",   
                                        closeOnConfirm: false,   
                                        closeOnCancel: false })
                                        .then((result)=>{
                                            if(result.isConfirmed){
                                                window.location.reload();
                                            }
                                        })
                                }
                            })
                    }})
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
    handleChange(e){
        const file = e.target.files[0]; // accesing file
        console.log(file);
        this.setState({file:file}); // storing file
        this.setState({upload_state:`${file.name} is selected`})
    }
    upload_file(){
        let device_unique_id = sessionStorage.getItem('unique_id');
        const formData = new FormData();        
        formData.append('file', this.state.file); // appending file
        console.log(...formData)
        axios.post(`http://${this.state.serverIP}:5000/configuration-management/config-file-upload/${device_unique_id}`, formData, {
            headers: {
                'Authorization': 'Bearer ' + JSON.parse(sessionStorage.getItem('login_data')).data.access_token,
            }
        }).then(res => {
            const file_upload_response=res
            // setFile_upload_response(file_upload_response)
            console.log(file_upload_response);
            if(file_upload_response.data.result.status!=='Operation failed'){
                swal.fire({
                    title:'Success',
                    text:'Initial Configuration Successful',
                    width: 300,
                    height: 40,
                    color: 'black',
                    icon: 'success',
            });
                this.setState({upload_state:'File Uploaded'})
                
            }
            else{
                swal.fire({
                    title:file_upload_response.data.result.status,
                    text:file_upload_response.data.result.message,
                    width: 300,
                    height: 40,
                    color: 'black',
                    icon: 'warning',
            });
            }
        }).catch((err) => {
            // alert(err.response.data.status)
            window.swal = swal;
            swal.fire({
                title:'Bad File Request',
                text:err.response.data.status,
                width: 300,
                height: 40,
                color: 'black',
                icon: 'warning',
        });
            console.log(err.response.data,'err.response.data'); 
        })
    }
    saveRunningConfigToStartUp(){
        this.setState({toggleConfig:true})
        this.setState({is_fetching:true})
        var deviceId = sessionStorage.getItem('unique_id')
        fetch(`http://${this.state.serverIP}:5000/configuration-management/running-startup/${deviceId}`,
        {
            mode:'cors',
            method:'POST',
            headers:{'Access-Control-Allow-Origin':'http://localhost:3000',
            'username': sessionStorage.getItem('username'),
            'Authorization': 'Bearer ' + JSON.parse(sessionStorage.getItem('login_data')).data.access_token,
            },
        })
        .then(resp=>resp.json())
        .then(resp=>{console.log(resp,'save-running-config-startup-response');
            if(resp.status){
                alert(resp.status)
                this.setState({toggleConfig:false})
                window.location.reload();
            }
            this.setState({is_fetching:false})
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
    toggleDarkMode = () => {
        console.log("innetw")
        this.setState((prevState) => ({ isDarkMode: !prevState.isDarkMode }));
      };

    render(){
        const { isDarkMode } = this.state;
        const lightTheme = createTheme({
            palette: {
            background: {
                // default: '#f4f7fe', 
                default:"white"
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
        return(
          
        <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
        <div style={{height:"100vh",overflow:"hidden"}}  className={isDarkMode ? 'dark-mode' : 'light-mode'}>
            <div style={{ backgroundColor: isDarkMode ? darkTheme.palette.background.default : lightTheme.palette.background.default }}>
            <div style={{display:'flex'}}>
            <NewLeftpanel page='settings' darkMode={this.state.isDarkMode}/>
            <div style={{flex:'4',marginLeft:"18%"}}>
                <div  style={{backgroundColor: isDarkMode ? darkTheme.palette.background.default : lightTheme.palette.background.default}}>
                    <NewHeader header_name='Settings' path='Settings' darkMode={this.state.isDarkMode} toggleDarkMode={this.toggleDarkMode}/>
                </div>
                
                {this.state.versionList?(
                            <div id="main">
                            <div className='subContent'>
                                <div className='cardFour'>
                                <div style={{ color: '#344767', fontWeight: '600',width:'100%'}}>General Settings</div>
                                <p style={{fontSize:'small',marginBottom:'0'}}>Device Specific Settings</p>
                                <div class="boxS">
                                <div class="rowS">
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: '600', marginBottom: '1%', width: '100%', fontSize: 'small' }}>Save Configuration</div>
                                    <p style={{ fontSize: 'x-small', marginTop: '2%', marginBottom: '0' }}>Click to save the current running configuration</p>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => this.saveRunningConfigToStartUp()}>
                                        <div style={{ marginTop: '2%', display: 'flex', alignItems: 'center' }}>
                                            <Toggle toggled={this.state.toggleConfig} />
                                        </div>
                                </div>
                                </div>
                                    <div class="dividerS"></div>
                                    <div class="rowS">
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: '600', width: '100%', fontSize: 'small' }}>Device Status</div>
                                        {sessionStorage.getItem('status_lock') === 'true' ? (
                                        <p style={{ fontSize: 'x-small', marginTop: '2%', marginBottom: '0' }}>Device is in Freeze mode. Click to Unlock</p>
                                        ) : (
                                        <p style={{ fontSize: 'x-small', marginTop: '2%', marginBottom: '0' }}>Device is in Unlocked mode. Click to Freeze</p>
                                        )}
                                    </div>
                                    {sessionStorage.getItem('status_lock') === 'true' ? (
                                        <Tooltip title='Click to Unlock'>
                                        <div style={{ marginTop: '2%', display: 'flex', alignItems: 'center'}} onClick={() => this.submit('freeze')}>
                                            <Toggle toggled={false} />
                                        </div>
                                        </Tooltip>
                                    ) : (
                                        <Tooltip title='Click to Freeze'>
                                        <div style={{ marginTop: '2%', display: 'flex', alignItems: 'center' }} onClick={() => this.submit('unfreeze')}>
                                            <Toggle toggled={true} />
                                        </div>
                                        </Tooltip>
                                    )}
                                    </div>
                                </div>
                                <div style={{ color: '#344767', fontWeight: '600',width:'100%',marginTop:'12%'}}>Initial Configuration</div>
                                <p style={{fontSize:'small',marginBottom:'0'}}>Upload an XML file to configure the whole device.</p>
                                <div style={{display:'flex'}}>
                                <input style={{width:'75%',fontSize:'9.5px',height:'22px',marginTop:'2%'}} type="file" ref={this.el} onChange={(e)=>this.handleChange(e)}></input>
                                <p className='btndel' style={{cursor:'pointer',marginTop:'2%',marginLeft:'2%',textAlign:'center',backgroundColor:'#385c8e',fontSize:'xx-small'}} onClick={()=>this.upload_file()}>Upload</p>
                                </div>
                                <div style={{ color: '#344767', fontWeight: '600',width:'100%',marginTop:'12%'}}>User Guide</div>
                                <p style={{fontSize:'small',marginBottom:'0'}}>Access the user guide for instructions and information by downloading the PDF below</p>
                                <div className='cancelRole' style={{height:'30px',marginTop:'3%',fontSize:'small'}}>Download User Guide</div>
                                </div>
                                <div className='cardFour2'>
                                    <div style={{ color: '#344767', fontWeight: '600',marginBottom:'1%',width:'100%'}}>Backup/Restore</div>
                                    <div className='table_scroll'>
                                    <table className='user_table'>
                                    <thead className='user_table_head'> 
                                    <tr style={{backgroundColor:'#e5e8ff',color:'black'}}>
                                                <th className='thPerf'>Type</th>
                                                <th className='thPerf'>Added By</th>
                                                <th className='thPerf'>Data Added</th>
                                                <th className='thPerf' ></th>
                                                <th  className='thPerf'></th>
                                                <th className='thPerf' ></th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {this.state.versionList.map((item,index)=>(
                                                <tr className='trPerf'>
                                                    <td className='tdPerf'>{item.type}</td>
                                                    <td className='tdPerf'>{item.username}</td>
                                                    <td className='tdPerf'>{item.date_added}</td>
                                                    <td className='tdPerf'><Tooltip title="View Configuration"><img style={{cursor:"pointer"}} alt="" width={20} src={require('../Images/view.png')} onClick={()=>this.viewConfigDetails(item._id)}></img></Tooltip></td>
                                                    <td className='tdPerf'><Tooltip title="Apply Configuration"><img style={{cursor:"pointer"}} alt="" width={20} src={require('../Images/check.png')} onClick={()=>this.applyConfiguration(item._id)}></img></Tooltip></td>
                                                    <td className='tdPerf'><Tooltip title="Delete Configuration"><img style={{cursor:"pointer"}} alt="" width={15} src={require('../Images/closeS.png')} onClick={()=>this.deleteSavedVersion(item._id)}></img></Tooltip></td>
                                                </tr>
                                            ))}
                                            </tbody>
                                        </table>
                                        <div
                                            className='tabbox'
                                            style={{marginTop:'2%'}}
                                            onClick={() =>this.saveCurrentVersion() }
                                        >
                                            <img alt="" className='tabicon' src={require('../Images/n5.png')}></img>
                                            Click Here To Save The Current Version
                                        </div>
                                        {this.state.showConfigDetails?(
                                                <ConfigDetailsPopup configDetails={this.state.configDetails} closePopup={this.closePopup}/>
                                        ):null}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ):null}

                    {this.state.is_fetching===true?(<Loading/>):null}
            </div>
            </div>
            </div>
        </div>
    </ThemeProvider>
    )}
}
export default ConfigurationPanel;