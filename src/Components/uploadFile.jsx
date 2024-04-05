import React, { Component } from 'react';
import axios from 'axios';

class Upload extends Component {
  constructor(props) {
    super(props);
    this.state = {
      file: '', // storing the uploaded file
      fileUploadResponse: '', // storing the received file from backend
      progress: 0, // progress bar
      serverIP: process.env.REACT_APP_CLIENT_IP,
      inventory:this.props.inventory,
      type:this.props.type,
      closeTab:false,
      selectedFile:null,
    };
    this.el = React.createRef(); // accessing input element
  }

  handleChange = (e) => {
    this.setState({ progress: 0 });
    const selectedFile = e.target.files[0]; // accessing file
    console.log(selectedFile);
    this.setState({ file: selectedFile }); // storing file
  };

  uploadFile = () => {
    const { file } = this.state;
    const formData = new FormData();
    formData.append('file', file); // appending file
    console.log(...formData);
    axios
      .post(`http://${this.state.serverIP}:5005/inventory-management/${this.state.inventory}`, formData, {
        onUploadProgress: (progressEvent) => {
          let progress = Math.round((progressEvent.loaded / progressEvent.total) * 100);
          this.setState({ progress });
        },
        headers: {
          Authorization:
            'Bearer ' + JSON.parse(sessionStorage.getItem('login_data')).data.access_token ,
        },
      })
      .then((res) => {
        const fileUploadResponse = res;
        this.setState({ fileUploadResponse });
        console.log(res);
        if (res && res.data) {
          this.showAlert(res.data);
        }
      })
      .catch((err) => {if(err.response){
        console.log(err.response.data.status)
        alert(err.response.data.status)
      }} );
  };
  uploadFileForUser = () => {
    const { file } = this.state;
    const formData = new FormData();
    formData.append('file', file); // appending file
    console.log(...formData);
    axios
      .post(`http://${this.state.serverIP}:5006/user-management/upload-license-file`, formData, {
        onUploadProgress: (progressEvent) => {
          let progress = Math.round((progressEvent.loaded / progressEvent.total) * 100);
          this.setState({ progress });
        },
        headers: {
          Authorization:
            'Bearer ' + JSON.parse(sessionStorage.getItem('login_data')).data.access_token ,
        },
      })
      .then((res) => {
        const fileUploadResponse = res;
        this.setState({ fileUploadResponse });
        console.log(res);
        alert(res.data.status)
        window.location.reload()
        if (res && res.data) {
          this.showAlert(res.data);
        }
      })
      .catch((err) => {
        console.log(err.response)
        if (err.response) {
          if(err.response.data.message){
            alert("Only .txt files allowed to upload")
          }
          else{
            alert(err.response.data.status)
          }
          console.log('Error Response Data:', err.response.data);
          console.log('Error Response Status:', err.response.status);
          console.log('Error Response Headers:', err.response.headers);
        }
      });       
  };
  showAlert = (data) => {
    const { message, status } = data;
    const devicesAdded = status['devices added'];
    const devicesExist = status['devices already exist'];

    let alertMessage = message;
    if (devicesAdded.length > 0) {
      alertMessage += '\nDevices Added:\n' + devicesAdded.join('\n');
    }
    if (devicesExist.length > 0) {
      alertMessage += '\nDevices Already Exist:\n' + devicesExist.join('\n');
    }

    alert(alertMessage);
    window.location.reload(true)
  };
  render() {
    return (
      !this.state.closeTab?(
        this.props.type==='userPanel'?(
          <div style={{marginTop:'5%'}}>
            <div className="popup-content" style={{display:'flex',flexDirection:'column',justifyContent:'center',alignItems:'center',width:'189px',height:'33px',fontSize:'xx-small'}}>
              <input type="file" ref={this.el} onChange={this.handleChange} style={{margin:'0',height:'fit-content',borderBottom:'2px solid grey'}}/>
              <div onClick={this.state.type?(this.uploadFileForUser):(this.uploadFile)} style={{color:'rgb(8, 62, 94)',cursor:'pointer',fontWeight:'700'}}>Click here to Upload {this.state.inventory?'(CSV)':null}File</div>
            </div>
          </div>
        ):(
          <div style={{marginTop:'5%',display:'flex',justifyContent:'center'}}>
            <div className="popup-content" style={{display:'flex',flexDirection:'column',justifyContent:'center',alignItems:'center',width:'310px',height:'154px',fontSize:'small'}}>
              <input type="file" ref={this.el} onChange={this.handleChange} style={{margin:'0',height:'fit-content',borderBottom:'2px solid grey'}}/>
              <p className='fileInfoTag'>*only CSV files allowed</p>
              <div  onClick={this.state.type?(this.uploadFileForUser):(this.uploadFile)}>
                <button type="submit"  class="btn btn-primary mb-3">Upload</button>
              </div>
            </div>
          </div>
        )

      ):null
    );
  }
}

export default Upload;
