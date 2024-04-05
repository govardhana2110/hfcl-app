import React from "react";
import Loading from "../Components/loader";
import "leaflet/dist/leaflet.css";
import "react-dropdown/style.css";
import remove from "../Images/closeS.png";
import check from "../Images/check.png";
import addButton from "../Images/addNewTrigger.png";
import copy from "../Images/copy.png";
import "bootstrap/dist/css/bootstrap.min.css";
import "../css/network_discovery.css"
import close from "../Images/closeS.png";
import axios from 'axios';
import Tooltip from "@mui/material/Tooltip";

class Discovery extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
        serverIP: process.env.REACT_APP_CLIENT_IP,
        checkedDevicesForFileUpload:[],
        networkDiscoveryData:null,
        checkedList: [],
        invalidSet:['e','+','-'],
        data: {},
        inputVal:'',
        valid_startIp: false,
         emp_startIp: true,
         valid_endIp:false,
         emp_endIp:true,
    };
    this.validIP=this.validIP.bind(this);
  }
 
  componentDidMount() {
    let role = sessionStorage.getItem("role_id");
    this.setState({ loggedInUserRole: role });
  }
 
  getNetworkDiscovery() {
    const { enableNetconfFields, enableSnmpFields, discoveryCommunity } =
      this.state;
    this.setState({ is_fetching: true });
    var temp = {
      start_ip: this.state.startIP,
      end_ip: this.state.endIP,
      protocol_types: [],
      timeout: this.state.discoveryTimeOut,
      retry_count: this.state.discoveryRetryCount,
    };
    if (enableNetconfFields) {
      temp.protocol_types.push("NETCONF");
      temp["username"] = this.state.discoveryUsername;
      temp["password"] = this.state.discoveryPassword;
    }
    if (enableSnmpFields) {
      temp.protocol_types.push("SNMP");
      temp["communities"] = [discoveryCommunity];
    }
    console.log(temp, "data");
    fetch(
      `http://${this.state.serverIP}:5000/configuration-management/network-discovery`,
      {
        mode: "cors",
        method: "POST",
        headers: {
          "Access-Control-Allow-Origin": "http://localhost:3000",
          Accept: "application/json",
          "Content-Type": "application/json",
          username: sessionStorage.getItem("username"),
          Authorization:
            "Bearer " +
            JSON.parse(sessionStorage.getItem("login_data")).data.access_token,
        },
        body: JSON.stringify(temp),
       
      }
    )
      .then((resp) => resp.json())
      .then((resp) => {
        this.setState({ is_fetching: false });
        console.log(resp, "discovery");
        if (resp.message) {
          alert(resp.status);
        } else {
          this.setState({ networkDiscoveryData: resp });
        }
      })
      .catch((err) => {
        console.log(err.response, err.message);
        if (err.response) {
          // Handle responses with status codes like 403
          console.log("Error Response Data:", err.response.data);
          console.log("Error Response Status:", err.response.status);
          console.log("Error Response Headers:", err.response.headers);
        } else {
          // Handle network errors
          console.error("Network Error:", err.message); // Log the error for debugging
          alert("Network Error: Failed to fetch data.");
        }
      });
  }
 
  containsOnlyLetters(input) {
    return /^[a-zA-Z\s]+$/.test(input);
  }
 
  containsOnlyNumbers(input) {
    // Check if the input contains only numeric characters
    return /^[0-9]+$/.test(input);
  }
 
  handleCheck = (event, item) => {
    if (event.target.checked) {
      this.setState({ checkedList: [...this.state.checkedList, item] });
    } else {
      this.setState({ checkedList: this.state.checkedList.filter(value => value !== item) });
    }
    console.log(this.state.checkedList)
  };
   inputChange = (e,fieldName) => {
 
    this.setState({[fieldName]:e.target.value.replace(/[^0-9]/g, '')});
 
  };
 

renderInputField = (label, fieldName, type) => {
  if (fieldName === 'discoveryTimeOut' || fieldName === 'discoveryRetryCount') {
    return (
      <div className='isis-instance-labels'>
        <div className='customPopupLabel'>{label}</div>
        <input
          style={{ fontSize: "small", margin: "0px"}}
          value={this.state[fieldName]}
          onChange={(e) => this.inputChange(e,fieldName)}
          onKeyDown={(e) =>
            this.state.invalidSet.includes(e.key) ? e.preventDefault() : null
          }
          type="number"
        />
      </div>
    );
  }
   else {
    return (
      <div className='isis-instance-labels'>
      <div className='customPopupLabel'>{label}</div>
      <input
        style={{ fontSize: "small", margin: "0px"}}
        className='isis-config-module-input'
        type={type}
        value={this.state[fieldName]}
        onChange={(e) => this.handleInputChange(fieldName, e.target.value, type)}
      />
      </div>
    );
  }
};
 
validIP(ip, fieldName) {
  let regexExp =/^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/gi;
   
  const isValid = regexExp.test(ip);

  const stateKey = fieldName === "startIP" ? "valid_startIp" : "valid_endIp";
  this.setState({ [stateKey]: isValid });
}

 
  handleInputChange = (fieldName, value, type) => {
    value = value.trim(); // Trim the value

     if (fieldName === "startIP")
     {
        
     this.validIP(value,fieldName);
      if(value !== '')
      {
        this.setState({emp_startIp:false})
      }
      else
      {
        this.setState({emp_startIp:true})
      }
    
     }
     else  if (fieldName === "endIP")
     {
        
     this.validIP(value,fieldName);
      if(value !== '')
      {
        this.setState({emp_endIp:false})
      }
      else
      {
        this.setState({emp_endIp:true})
      }
    
     }
     
    this.setState({ [fieldName]: value });
  };
 
  handleSave = () => {
    const { data, checkedList ,serverIP} = this.state;
    const newData = checkedList.map(ip => ({
        ip_add: ip,
        ...data[ip]
    }));
    console.log(newData);
    fetch(
      `http://${serverIP}:5005/inventory-management/add-multiple-devices`,
      {
        method: "POST",
        mode: "cors",
        headers: {
          "Access-Control-Allow-Origin": "http://localhost:3000",
          Accept: "application/json",
          "Content-Type": "application/json",
          username: sessionStorage.getItem("username"),
          Authorization:
            "Bearer " +
            JSON.parse(sessionStorage.getItem("login_data")).data
              .access_token,
        },
        body: JSON.stringify(newData),
      }
    )
      .then((resp) => resp.json())
      .then((resp) => {
        console.log(resp,"add-response")
        this.setState({ whitelistresponse: resp,showAddTab:false });
        alert(resp.message);
        if(resp.message && this.state.checkedDevicesForFileUpload.length>=1){
          this.onFileUpload(resp["status"]["devices_added_devicelist"])
        }
      })
      .catch((err) => {
        if (err.response) {
          alert(err.response.data.status);
          console.log("Error Response Data:", err.response.data);
          console.log("Error Response Status:", err.response.status);
          console.log("Error Response Headers:", err.response.headers);
        }
      });
   
  };
 
  handleCircleChange = (ip, value) => {
    this.setState(prevState => ({
        data: {
            ...prevState.data,
            [ip]: {
                ...prevState.data[ip],
                circle: value
            }
        }
    }));
};
    handleClusterChange = (ip, value) => {
        this.setState(prevState => ({
            data: {
                ...prevState.data,
                [ip]: {
                    ...prevState.data[ip],
                    cluster_name: value
                }
            }
        }));
    };
 
    handleSiteChange = (ip, value) => {
        this.setState(prevState => ({
            data: {
                ...prevState.data,
                [ip]: {
                    ...prevState.data[ip],
                    site_name: value
                }
            }
        }));
    };
 
    handleDeviceTypeChange = (ip, value) => {
      this.setState(prevState => ({
          data: {
              ...prevState.data,
              [ip]: {
                  ...prevState.data[ip],
                  device_type: value
              }
          }
      }));
  };
  handleDevicePortChange = (ip, value) => {
    this.setState(prevState => ({
        data: {
            ...prevState.data,
            [ip]: {
                ...prevState.data[ip],
                port: value
            }
        }
    }));
  };
  handleDeviceNameChange = (ip, value) => {
    this.setState(prevState => ({
        data: {
            ...prevState.data,
            [ip]: {
                ...prevState.data[ip],
                device_name: value
            }
        }
    }));
  };
  handleUsernameChange = (ip, value) => {
    this.setState(prevState => ({
        data: {
            ...prevState.data,
            [ip]: {
                ...prevState.data[ip],
                username: value
            }
        }
    }));
  };
  handlePasswordChange = (ip, value) => {
    this.setState(prevState => ({
        data: {
            ...prevState.data,
            [ip]: {
                ...prevState.data[ip],
                password: value
            }
        }
    }));
  };
  handleRoleChange = (ip, value) => {
    this.setState(prevState => ({
        data: {
            ...prevState.data,
            [ip]: {
                ...prevState.data[ip],
                role: value
            }
        }
    }));
  };
 
 
    handleCoordinateChange = (ip, value) => {
        this.setState(prevState => ({
            data: {
                ...prevState.data,
                [ip]: {
                    ...prevState.data[ip],
                    coordinates: value
                }
            }
        }));
    };
 
    copyValue = (field) => {
      const { data, checkedList } = this.state;
      const copiedValue = data[checkedList[0]] ? data[checkedList[0]][field] : ''; // Get value from the first row
      checkedList.forEach(ip => {
          this.setState(prevState => ({
              data: {
                  ...prevState.data,
                  [ip]: {
                      ...prevState.data[ip],
                      [field]: copiedValue
                  }
              }
          }));
      });
    };
 
    handleCheckInitialConfig = (ip, isChecked) => {
      const {checkedDevicesForFileUpload}=this.state;
      console.log(`Checkbox for IP ${ip} is checked: ${isChecked}`);
      if(isChecked && !checkedDevicesForFileUpload.includes(ip)){
        checkedDevicesForFileUpload.push(ip)
      }
      this.setState({checkedDevicesForFileUpload})
      console.log(checkedDevicesForFileUpload)
    }

    onFileChange = (e) => {
      const file = e.target.files[0]; // accesing file
      console.log(e.target.files);
      this.setState({ selectedFile: file }); // storing file
    };
  
    onFileUpload = (deviceList) => {
      if (this.state.selectedFile !== null) {
        const formData = new FormData();
        formData.append('file', this.state.selectedFile);
        formData.append("unique_ids",JSON.stringify(deviceList));
        console.log(...formData)
        axios.post(`http://${this.state.serverIP}:5000/configuration-management/bulk-config-file-upload`, formData, {
          headers: {
            'Access-Control-Allow-Origin': 'http://localhost:3000',
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'username': sessionStorage.getItem('username'),
            'Authorization': 'Bearer ' + JSON.parse(sessionStorage.getItem('login_data')).data.access_token,
          }
        })
        .then(res => {
          console.log(res.data, 'bulk-config-file-upload-response');
          this.showOperationResponse(res.data)
  
        }).catch(err => {
          alert("Error");
        })
      }
      else {
        alert("*Please choose a file")
      }
    };

    showOperationResponse(resp){
      console.log("called")
      var temp={};
      Object.keys(resp).map((key)=>{
        temp[key]= resp[key]["rpc-reply"]?"success":resp[key]["status"]+ "  message:"+resp[key]["message"]
      })
      alert(JSON.stringify(temp,null,2))
    }
 
  render() {
    const {networkDiscoveryData ,checkedList ,data ,showAddTab, initialCheckedState,emp_startIp,valid_startIp,emp_endIp,valid_endIp} =this.state;
    return (
      <div style={{backgroundColor:'white',borderRadius:'20px',padding:'2%'}}>
        <div className="title">Network Discovery:</div>
          <div style={{display:"flex"}}>
            <div className="fields">
                <div style={{ display: "flex", margin: "7%" }}>
                <div>
                    <div>
                        { this.renderInputField('Start IP', 'startIP',"ip")}
                        <p className="error_fields_discovery">{emp_startIp ? (null) : !valid_startIp ? ("Invalid IP") : null}</p>
                        { this.renderInputField('End IP', 'endIP',"ip")}
                        <p className="error_fields_discovery">{emp_endIp ? (null) : !valid_endIp ? ("Invalid IP") : null}</p>
                    </div>
                    <div style={{ display: "flex" }}>
                    <div className="customPopupLabel">Protocols:</div>
                    <div>
                        <div style={{ display: "flex" }}>
                        <input
                            id="swal-netconf"
                            type="checkbox"
                            onChange={(e) =>
                            e.target.checked
                                ? this.setState({
                                    enableNetconfFields: true,
                                })
                                : this.setState({
                                    enableNetconfFields: false,
                                })
                            }
                        />
                        <label
                            className="protocolLabel"
                            for="swal-netconf"
                        >
                            NETCONF
                        </label>
                        </div>
                        <div style={{ display: "flex" }}>
                        <input
                            id="swal-snmp"
                            type="checkbox"
                            onChange={(e) =>
                            e.target.checked
                                ? this.setState({
                                    enableSnmpFields: true,
                                })
                                : this.setState({
                                    enableSnmpFields: false,
                                })
                            }
                        />
                        <label
                            className="protocolLabel"
                            for="swal-snmp"
                        >
                            SNMP
                        </label>
                        </div>
                    </div>
                    </div>
                    {this.state.enableNetconfFields ? (
                    <div>
                        { this.renderInputField('Username', 'discoveryUsername',"text")}
                        { this.renderInputField('Password', 'discoveryPassword',"text")}
                    </div>
                    ) : null}
 
                    {this.state.enableSnmpFields ? (
                        this.renderInputField('Community', 'discoveryCommunity',"text")
                    ) : null}
 
                    {this.renderInputField('Timeout', 'discoveryTimeOut',"number")}
                    {this.renderInputField('Retry Count', 'discoveryRetryCount',"number")}
                    
                    <button
                    className="btn btn-primary mb-3"
                    style={{ marginTop: "5%" }}
                    onClick={() => this.getNetworkDiscovery()}
                    disabled={
                        this.state.startIP && this.state.endIP
                        ? false
                        : true
                    }
                    >
                    Submit
                    </button>
                </div>
                </div>
            </div>
 
            {networkDiscoveryData ? (
                <div style={{ width: "70%",maxHeight: "400px",backgroundColor: "white",marginLeft: "3%", overflowY: "scroll",
                boxShadow: "0px 0px 10px rgba(224, 224, 224, 0.9), inset 1px 1px 0px rgba(255, 255, 255, 0.3)",borderRadius: "8px",
                      opacity:showAddTab?"0.1":null
                }}>
                  <div style={{ display: "flex", margin: "3%" }}>
                      <table style={{ fontSize: "small", width: "100%" }}>
                      <thead style={{ fontSize: "medium" }}>
                          <tr>
                          <th>IP</th>
                          <th>NETCONF</th>
                          <th style={{ width: "40%" }}>SNMP</th>
                          <th>Ping time(ms)</th>
                          <Tooltip title="ZTP Configuration">
                          <th onClick={()=>this.setState({showAddTab:true})}><img src={addButton} alt="" width={20}/></th>
                          </Tooltip>
                          </tr>
                      </thead>
                      <tbody style={{ fontSize: "14px" }}>
                          {Object.keys(networkDiscoveryData).map((ip) => (
                          <tr>
                              <td>{ip}</td>
                              <td>
                                {networkDiscoveryData[ip]["netconf"] ? (<img src={check} alt="" width={10} />) : (<img src={remove} alt="" width={10} /> )}
                              </td>
                              <td>
                                {networkDiscoveryData[ip][ "snmp"] || (<img src={remove} alt="" width={10} /> )}
                              </td>
                              <td>
                                {this.state.networkDiscoveryData[ip]["ping"] || (<img src={remove} alt="" width={10} />)}
                              </td>
                              <td>
                                  <input type="checkbox" value={ip}
                                      disabled={networkDiscoveryData[ip]["netconf"] || networkDiscoveryData[ip]["snmp"]?false:true}
                                      onChange={e => {this.handleCheck(e, e.target.value);}}
                                  />
                              </td>
                          </tr>
                          ))}
                      </tbody>
                      </table>
                  </div>
                </div>
            ) : null}
          </div>
 
            {showAddTab ? (
              <div className="PopUp" style={{top:"30%",left:"14%",opacity:"1",width:"73%",maxHeight:"350px",overflow:"auto"}}>
                <div style={{ color: "#344767", fontWeight: "600",display:"flex",position:"fixed" }}>
                  <div style={{fontSize:"17px"}}>Add Routers To WhiteList:</div>
                  <input style={{marginLeft:"25px",fontSize:"smaller"}} type="file" onChange={this.onFileChange} />
                  <img style={{right:"-126%",position:"relative"}} src={close} alt="" width={10} height={10} onClick={()=>this.setState({showAddTab:false})}/>
                </div>

                  <table className="myTable" style={{marginTop:"5%"}}>
                    <thead style={{ fontSize: "medium" }}>
                        <tr>
                          <th>IP</th>
                          <th>Circle<span onClick={() => this.copyValue('circle')}><img src={copy} alt="" width={15} /></span></th>
                          <th>Cluster<span onClick={() => this.copyValue('cluster_name')}><img src={copy} alt="" width={15} /></span></th>
                          <th>Site<span onClick={() => this.copyValue('site_name')}><img src={copy} alt="" width={15} /></span></th>
                          <th>Device type<span onClick={() => this.copyValue('device_type')}><img src={copy} alt="" width={15} /></span></th>
                          <th>Port<span onClick={() => this.copyValue('port')}><img src={copy} alt="" width={15} /></span></th>
                          <th>Name<span onClick={() => this.copyValue('device_name')}><img src={copy} alt="" width={15} /></span></th>
                          <th>Username<span onClick={() => this.copyValue('username')}><img src={copy} alt="" width={15} /></span></th>
                          <th>Password<span onClick={() => this.copyValue('password')}><img src={copy} alt="" width={15} /></span></th>
                          <th>Role<span onClick={() => this.copyValue('role')}><img src={copy} alt="" width={15} /></span></th>
                          <th>Coordinate<span onClick={() => this.copyValue('coordinates')}><img src={copy} alt="" width={15} /></span></th>
                          <th>Default configuration</th>
 
                        </tr>
                    </thead>
                    <tbody style={{ fontSize: "14px" }}>
                        {checkedList.map(ip => (
                            <tr key={ip}>
                                <td>{ip}</td>
                                <td><input className="isis-config-module-input" type="text" value={data[ip]?.circle || ''} onChange={(e) => this.handleCircleChange(ip, e.target.value)} /></td>
                                <td><input className="isis-config-module-input" type="text" value={data[ip]?.cluster_name || ''} onChange={(e) => this.handleClusterChange(ip, e.target.value)} /></td>
                                <td><input className="isis-config-module-input" type="text" value={data[ip]?.site_name || ''} onChange={(e) => this.handleSiteChange(ip, e.target.value)} /></td>
                                <td><input className="isis-config-module-input" type="text" value={data[ip]?.device_type || ''} onChange={(e) => this.handleDeviceTypeChange(ip, e.target.value)} /></td>
                                <td><input className="isis-config-module-input" type="text" value={data[ip]?.port || ''} onChange={(e) => this.handleDevicePortChange(ip, e.target.value)} /></td>
                                <td><input className="isis-config-module-input" type="text" value={data[ip]?.device_name || ''} onChange={(e) => this.handleDeviceNameChange(ip, e.target.value)} /></td>
                                <td><input className="isis-config-module-input" type="text" value={data[ip]?.username || ''} onChange={(e) => this.handleUsernameChange(ip, e.target.value)} /></td>
                                <td><input className="isis-config-module-input" type="text" value={data[ip]?.password || ''} onChange={(e) => this.handlePasswordChange(ip, e.target.value)} /></td>
                                <td><input className="isis-config-module-input" type="text" value={data[ip]?.role || ''} onChange={(e) => this.handleRoleChange(ip, e.target.value)} /></td>
                                <td><input className="isis-config-module-input" type="text" value={data[ip]?.coordinates || ''} onChange={(e) => this.handleCoordinateChange(ip, e.target.value)} /></td>
                                <td><input type="checkbox" checked={initialCheckedState} onChange={(e) => this.handleCheckInitialConfig(ip, e.target.checked)} /></td>
                            </tr>
                        ))}
                    </tbody>
                  </table>
                  
                  <div style={{paddingBottom:"3%"}}><button className="btn btn-primary mb-3" onClick={this.handleSave} style={{position:"fixed",right:"15%",borderRadius:"3px"}}>Submit</button></div>
              </div>
            ) : null}
 
            {this.state.is_fetching === true ? <Loading /> : null}
      </div>
    );
  }
}
export default Discovery;