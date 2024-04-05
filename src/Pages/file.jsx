import React from 'react';
import NewHeader from '../Components/header';
import NewLeftpanel from '../Components/leftPanel';
import swal from 'sweetalert2';
import axios from 'axios';
import Loading from '../Components/loader';
import '../css/file.css';
import close from '../Images/closeS.png';
import { ThemeProvider, createTheme } from "@mui/material/styles";

class FileManagementPanel extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            isDarkMode:false,
            ruPathName:null,
            is_fetching:false,
            isLoading:false,
            serverIP:process.env.REACT_APP_CLIENT_IP,
            device_id:null,download_status:null,
            sftp_download_hostname:null,sftp_download_username:null,sftp_download_password:null,sftp_download_path:null,sftp_download_file_name:'',
            get_file_list:null,
            password:'',
            openFile:false,
             active: (props.locked && props.active) || false,
            value: props.value || "",
            error: props.error || "",
            label: props.label || "O-RU Path",
            openPathPopUp:false,
            errorField:null,
        } 
        this.get_retrieve_file_list=this.get_retrieve_file_list.bind(this);
        this.fetch_file_download=this.fetch_file_download.bind(this);
        this.el = React.createRef();

    }

    get_retrieve_file_list(value){
        var temp1={"retrieve_file_list":{"@xmlns": "urn:o-ran:file-management:1.0"}}
        temp1.retrieve_file_list['logical_path']=this.state.ruPathName
        fetch(`http://${this.state.serverIP}:5004/file-management/sftp-list`, {  
        method: 'GET',
        mode: 'cors',
        headers:{'Access-Control-Allow-Origin':'http://localhost:3000',
                'Accept':'application/json',
                'Content-Type':'application/json',
                'username': sessionStorage.getItem('username'),
                'Authorization': 'Bearer ' + JSON.parse(sessionStorage.getItem('login_data')).data.access_token,
            },
        // body: JSON.stringify(temp1)    
    }) 
    .then(resp=>resp.json())
    .then(resp=>{
        console.log(resp)
            if(resp.file_list){
                this.setState({get_file_list:resp.file_list})
                console.log(this.state.get_file_list)
            }
            else{
                if(resp.message){
                    this.setState({get_file_list:[]})
                }
                else{
                    alert(resp.status)
                }
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
   

    fetch_file_download(item) {
        const url = `http://${this.state.serverIP}:5004/file-management/sftp-download/${item}`;

        axios.get(url, {
            headers: {
                'Access-Control-Allow-Origin': 'http://localhost:3000',
            },
            responseType: 'blob', // Set the response type to 'blob' for file download
        })
        .then(response => {
            // Create a temporary download link
            console.log(response,'download-response')
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', item);
            document.body.appendChild(link);

            // Trigger the download
            link.click();

            // Clean up the temporary download link
            link.parentNode.removeChild(link);
        })
        .catch(error => {
            // Handle any errors here
        });
    }

    
    
    configureSFTPserver(){
        const{sftp_download_hostname,sftp_download_username,sftp_download_password,sftp_download_path}=this.state;
        var temp={}
        if(sftp_download_hostname&&sftp_download_username&&sftp_download_password&&sftp_download_path){
            this.setState({openPathPopUp:false,is_fetching:true})
            temp['hostname']=sftp_download_hostname
            temp['username']=sftp_download_username
            temp['password']=sftp_download_password
            temp['path']=sftp_download_path
            fetch(`http://${this.state.serverIP}:5004/file-management/sftp-server-config`, {                     
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
                .then(resp=>{this.setState({file_Uploadresp:resp,is_fetching:false})
                ;
                console.log(resp,'sftp response')
                if(resp.status){
                        swal.fire({
                                title:'Success',
                                text:resp.status,
                                width: 300,
                                height: 40,
                                color: '',
                                icon: 'success',
                        })
                this.get_retrieve_file_list()
                this.setState({ruPathName:sessionStorage.getItem('path')})
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
        else{
            this.setState({errorField:'*Please fill all the fields'})
        }
          
    }
    componentDidMount(){
        this.get_retrieve_file_list()
        let device_unique_id = sessionStorage.getItem('unique_id');
        this.setState({device_id:device_unique_id,ruPathName:sessionStorage.getItem('path')})
    }
    changeValue(event) {
        const value = event.target.value;
        this.setState({ruPathName:value})
    }
    handleKeyPress(event) {
        if (event.which === 13) {
            this.updatePath(null)
        }
    }
    handleChange(e){
        const file = e.target.files[0]; // accesing file
        this.setState({file:file}); // storing file
    }
    upload_file(item){    
        const formData = new FormData();
        formData.append('file', this.state.file); // appending file
        fetch(`http://${this.state.serverIP}:5004/file-management/sftp-upload`, {
        method: 'POST',
        headers: {
            'username': sessionStorage.getItem('username'),
            'Authorization': 'Bearer ' + JSON.parse(sessionStorage.getItem('login_data')).data.access_token,
        },
        body: formData,
        onUploadProgress: (progressEvent) => {
            let progress = Math.round((progressEvent.loaded / progressEvent.total) * 100) + '%';
        }
        })    
        .then(res=>res.json())
        .then(res => {
            console.log(res,'upload response')
            if(res.status){
                this.setState({openFile:false})
                swal.fire({
                            title:'Success',
                            text:res.status,
                            width: 300,
                            height: 40,
                            color: '',
                            icon: 'success',
                        })
                    this.get_retrieve_file_list()
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
    updatePath(item){
        var path = this.state.ruPathName
        if(item!==null){
            path = path + '/' + item
        }
        this.setState({ruPathName:path})
        sessionStorage.setItem('path',path)
        var temp1 = {'path':path}
        fetch(`http://${this.state.serverIP}:5004/file-management/sftp-cd`, {  
            method: 'POST',
            mode: 'cors',
            headers:{'Access-Control-Allow-Origin':'http://localhost:3000',
                    'Accept':'application/json',
                    'Content-Type':'application/json',
                    'username': sessionStorage.getItem('username'),
                    'Authorization': 'Bearer ' + JSON.parse(sessionStorage.getItem('login_data')).data.access_token,
                },
            body: JSON.stringify(temp1)    
        }).then(resp=>{
            this.get_retrieve_file_list()
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

    renderInputField = (label, fieldName) => (
        <div style={{display:'flex'}}>
            <div className='system-update-header-key'>{label}</div>
            <input className='isis-config-module-input'  
            value={this.state[fieldName]}
            onChange={(e) => this.handleInputChange(fieldName, e.target.value)}/>
        </div>
      );
      handleInputChange = (fieldName, value) => {
        this.setState({ [fieldName]: value });
      };
      toggleDarkMode = () => {
        console.log("innetw")
        this.setState((prevState) => ({ isDarkMode: !prevState.isDarkMode }));
      };
    render(){
        const { isDarkMode } = this.state;
        const lightTheme = createTheme({
            palette: {
            background: {
                default: 'white', 
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
                  <NewLeftpanel page='file' darkMode={this.state.isDarkMode}/>
                  <div style={{flex:'4',marginLeft:"18%"}}>
                      <div  style={{backgroundColor: isDarkMode ? darkTheme.palette.background.default : lightTheme.palette.background.default}}>
                          <NewHeader header_name='File Management Panel' path='file' darkMode={this.state.isDarkMode} toggleDarkMode={this.toggleDarkMode}/>
                      </div>
                      
                      <div id="mainFile">
                        {this.state.is_fetching===true?(
                            <div><Loading/></div>
                        ):null}
                            <div className='searchFilterbox'>
                                <div className='filterbox'>
                                        <img alt="" className='tabicon' src={require('../Images/search.png')}></img>
                                        <input placeholder='Enter O-RU Path here to search for file' style={{border:'0',height:'90%',width:'272px'}}
                                            id={1}
                                            type="text"
                                            value={this.state.ruPathName}
                                            onChange={(e)=>{this.setState({ruPathName:e.target.value})}}
                                            onKeyPress={this.handleKeyPress.bind(this)}>
                                        
                                        </input>
                                </div>
                                <div className="sftpBox">
                                    <div className='tabbox' onClick={(e)=>this.setState({openPathPopUp:true})}>
                                            <img alt="" className='tabicon' src={require('../Images/report.png')}></img>
                                            Configure SFTP Server 
                                    </div>
                                    <div className='tabbox' onClick={(e)=>this.setState({openFile:true})}>
                                            <img alt="" className='tabicon' src={require('../Images/upload_file.png')}></img>
                                            Upload File
                                    </div>
                                </div>
                                {this.state.openPathPopUp?(
                                    <div className='popupSoft'>
                                        <div className='popup-innerSoft'style={{height:'fit-content'}}>
                                        <div style={{color:"#e13a3ae",fontWeight:"500"}}>Configure SFTP Server:</div>
                                            <img onClick={(e)=>this.setState({openPathPopUp:false})} className='close-buttonSoft' src={close} alt='' width={15}/>
                                            <div className='popup-contentSoft'>
                                                <div className='system-update-details'>
                                                    <div style={{display:'flex',justifyContent:'center',alignContent:'center',flexDirection:'column'}}>
                                                        <div>
                                                            <div className='fileErrorField'>{this.state.errorField}</div>
                                                            {this.renderInputField('Hostname:', 'sftp_download_hostname')}
                                                            {this.renderInputField('Username:', 'sftp_download_username')}
                                                            {this.renderInputField('Password:', 'sftp_download_password')}
                                                            {this.renderInputField('Path:', 'sftp_download_path')}

                                                        </div>
                                                        <div className='cancelRole' style={{marginTop:'9%',width:'30%',marginLeft:'67%'}} onClick={()=>this.configureSFTPserver()}>Confirm</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ):null}
                            </div>
                            {this.state.get_file_list?(
                                    <table className='fileTable'>
                                    <thead className='thead'>
                                        <tr className='tr'>
                                        <th className='th'>File Name</th>
                                        <th className='th'></th>
                                        </tr>
                                    </thead>
                                    <tbody className='tbody'>
                                    {this.state.get_file_list.map((item)=>(
                                            <tr className='tr'>
                                            <td className='td'><strong style={{cursor:'pointer'}} onClick={()=>this.updatePath(item)}>{item}</strong></td>
                                            <td className='td'>{item.includes('.')?(<div onClick={()=>this.fetch_file_download(item)}><img alt="" style={{width:'30px',height:'100%',cursor:'pointer'}} src={require('../Images/download.png')}/></div>):null}</td>
                                            </tr>
                                    ))}
                                    </tbody>
                                </table>
                            ):null}
                
                            {this.state.openFile?(
                                <div className='popupSoft'>
                                    <div className='popup-innerSoft'>
                                    <div>File Upload</div>
                                    <img onClick={(e)=>this.setState({openFile:false})} className='close-buttonSoft' src={close} alt='' width={15}/>
                                        <div className='popup-contentSoft'>
                                        <div>
                                        <div style={{display:'flex',flexDirection:'column',alignItems:'center',marginTop:'20px'}}>
                                            <img alt="" className='state_image' style={{marginTop:'10px'}} src={require('../Images/upload_dash.png')}></img>
                                            <div style={{display:'flex'}}>
                                                <p className='state_text_top' style={{marginLeft:'-30%'}}>{this.state.upload_state}</p>
                                                <input style={{width:'137px',fontSize:'9.5px',height:'22px',marginTop:'12px'}} type="file" ref={this.el} onChange={(e)=>this.handleChange(e)}>
                                                </input>
                                            </div>
                                            <div className='cancelRole' style={{marginTop:'9%',width:'30%',marginLeft:'10%'}} onClick={()=>this.upload_file(this.state.file)}>Upload</div>

                                            </div>
                                        </div>
                                        </div>
                                    </div>
                                </div>
                            ):null}
                        </div>
                  </div>
                  </div>
                  </div>
              </div>
          </ThemeProvider>
        )
    }
}
export default FileManagementPanel;