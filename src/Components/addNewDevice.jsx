import React from "react";
import TextField from "@mui/material/TextField";
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Upload from "../Components/uploadFile";
import "leaflet/dist/leaflet.css";
import "react-dropdown/style.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { Tabs, Tab } from 'react-bootstrap'; // Assuming you are using Bootstrap
import SnmpComponent from "./snmpPage";
import close from "../Images/closeS.png"
class AddNewDeviceForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      inventory: null,
      serverIP: process.env.REACT_APP_CLIENT_IP,
      showSingle: true,
      cluster_name: "",
      enter_site_name: "",
      device_name: null,
      port: null,
      ip_add: null,
      errormsgPort: null,
      device_add_response: null,
      device_remove_response: null,
      username: "",
      password: "",
      errormsg: null,
      validIPState: false,
      roles : ["NETWORK-ENGINEER","NETWORK-OPERATOR","NETWORK-ADMIN","NETWORK-USER"],
      errormsgIP_add: "*required",
      errormsgName: "*required",
      selectedRole:null,
      snmpDetails:{version: [], security_level: "", communityV1:[''], communityV2:[''], userName: "" , authKey: "", authProtocol:"", privKey:"", privProtocol: ""}
    };
  }

  updateSnmpDetails=(data)=>{
    this.setState({snmpDetails:data})
  }

  validIP(ip) {
    let regexExp =
      /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/gi;
    console.log(regexExp.test(ip), "validation");
    this.setState({ validIPState: regexExp.test(ip) });
    return regexExp.test(ip);
  }

  containsOnlyNumbers(input) {
    // Check if the input contains only numeric characters
    return /^[0-9]+$/.test(input);
  }

  setDetails = async (e) => {
    var updatedValue = e.target.value;
    var whitelist = this.props.getWhitelist;
    this.setState({cluster_name: null, enter_site_name: null,});
    for (let i = 0; i < whitelist.length; i++) {
      if (updatedValue === whitelist[i]._id) {
        this.setState({cluster_name: whitelist[i].cluster_name,enter_site_name: whitelist[i].site_name,});
      }
    }
  };

  submitDeviceDetails() {
    const { errormsgName, errormsgIP_add, errormsgPort } = this.state;
    const { device_name, ip_add, port, username, password, selectedRole}=this.state;
    const { snmpDetails } = this.state;

    const temp = {
      device_name: device_name, ip_add :ip_add, port: port, username: username,  password: password, role: selectedRole,
      snmp_details: {
        version: snmpDetails.version, security_level: snmpDetails.security_level, 
        communityV1: snmpDetails.communityV1.filter(community => community !== ''), communityV2: snmpDetails.communityV2.filter(community => community !== ''), 
        userName: snmpDetails.userName, authKey: snmpDetails.authKey, authProtocol: snmpDetails.authProtocol, privKey: snmpDetails.privKey, privProtocol: snmpDetails.privProtocol
      }
    }

     if(!errormsgName && !errormsgIP_add && !errormsgPort){
      this.props.addDevice(temp);
     }
     this.props.handleModal(); 
    
  }

  render() {   
    const {handleModal } = this.props
    const {device_name, ip_add, port, roles,  selectedRole,username,password} = this.state;
    return (
      <div className="device_content" style={this.state.showUserVerificationTab ? { opacity: "20%" }: { top: "20%" }}>
        <div className="add-Device">
          <div> Add New Device</div>
          <div style={{display:"flex"}}>
            <div className="tabbox"style={ this.state.showSingle ? { color: "#2189c9" } : null } onClick={(e) => { this.setState({ showSingle: true });}}>
              Single
            </div>
            <div className="tabbox"style={ !this.state.showSingle ? { color: "#2189c9" } : null } onClick={(e) => { this.setState({showSingle: false,inventory: "bulk-add-device", });}}>
              Bulk
            </div>
          </div>
        </div>

        <img className="closeAddDevicePopUp" onClick={handleModal} src={close} alt="" width={10} height={10}/>
        
        {this.state.showSingle ? (
          <div style={{marginTop:"4%"}}>
            <Tabs defaultActiveKey="netconf" id="routing-tabs" style={{fontSize:"smaller"}}>
              <Tab eventKey="netconf" title="NETCONF">
                <div className="singleDeviceInput" style={{height:"250px",overflow:"auto", scrollbarWidth:"thin",marginLeft:"3%"}}>
                  <div className="DialogInputsB">
                    <TextField placeholder="Name" type="text" id="standard-basic-1" label="Name*" variant="standard" value={device_name}
                      onChange={(event) => {const inputValue = event.target.value;
                      this.setState({ device_name: inputValue,errormsgName:inputValue.trim() === "" ? "*required" : null, });
                      }}
                    />
                    <p style={{ color: "red", fontSize: "small" }}> {this.state.errormsgName}</p>
                  </div>
                  <div className="DialogInputsB">
                      <TextField placeholder="xxx.xxx.xxx.xxx" type="ipadd" id="standard-basic-2" label="IP-Address*" variant="standard" value={ip_add}
                          onChange={(event) => {
                          const inputValue = event.target.value;
                          const isValidIP = this.validIP(inputValue);
                          this.setState({ ip_add: inputValue, errormsgIP_add:inputValue.trim() === ""? "*required" : isValidIP? null : "Invalid IP",});
                          this.setDetails(event);
                          }}
                      />
                      <p style={{ color: "red", fontSize: "small" }}>{this.state.errormsgIP_add} </p>
                  </div>
                  <div className="DialogInputsB">
                      <TextField placeholder="Port" type="number" id="standard-basic-3" label="Port*" variant="standard" value={port}
                        onChange={(event) => { var isValidPort = this.containsOnlyNumbers(event.target.value );
                          if (isValidPort) {
                            this.setState({ port: event.target.value,errormsgPort: null,});
                          } else if ( event.target.value.length === 0) 
                          {
                            this.setState({ port: event.target.value,errormsgPort: null,});
                          } else {
                            this.setState({ errormsgPort: "Invalid Port number", });
                          }
                        }}
                      />
                      <p style={{ color: "red", fontSize: "small" }}> {this.state.errormsgPort}</p>
                  </div> 
                  <div className="DialogInputsB">
                      <TextField placeholder="Username" type="text" id="standard-basic-4" label="Username*" variant="standard" value={username}
                          onChange={(event) => {const inputValue = event.target.value;
                            this.setState({ username: inputValue, errormsgName:inputValue.trim() === "" ? "*required" : null, });
                          }}
                      />
                      <p style={{ color: "red", fontSize: "small" }}> {this.state.errormsgPort}</p>
                  </div> 
                  <div className="DialogInputsB">
                      <TextField placeholder="Password" type="password" id="standard-basic-5" label="Password*" variant="standard" value={password}
                          onChange={(event) => { const inputValue = event.target.value;
                            this.setState({ password: inputValue, errormsgName:inputValue.trim() === "" ? "*required" : null, });
                          }}
                      />
                      <p style={{ color: "red", fontSize: "small" }}> {this.state.errormsgPort}</p>
                  </div> 
                  <DropdownButton
                    id="role" className='custom-dropdown'  drop="down" title={selectedRole || "Choose Role"} 
                    onSelect={(e)=>this.setState({selectedRole:e})}
                  >
                    {roles.map((role, optionIndex) => (
                      <Dropdown.Item key={optionIndex} eventKey={role}>
                        {role}
                      </Dropdown.Item>
                    ))}
                  </DropdownButton>            
                  
                  <div style={{color: "darkgoldenrod", fontSize: "12px",}}> {this.state.displayErrorMessage}</div>

                  {this.state.cluster_name ? (
                    <div className="DialogInputs">
                      <div style={{ fontWeight: "400" }}>Cluster: {this.state.cluster_name}</div>
                    </div>
                  ) : null}

                  {this.state.enter_site_name ? (
                    <div className="DialogInputs">
                      <div style={{ fontWeight: "400" }}> Site: {this.state.enter_site_name}</div>
                    </div>
                  ) : null}
                </div>
              </Tab>

              <Tab eventKey="snmp" title="SNMP">
                  <SnmpComponent onUpdateSnmpDetails={this.updateSnmpDetails}/>
              </Tab>
            </Tabs>

            <div style={{ marginTop: "10%" , marginLeft:"80%"}}>
              <button className="btn btn-primary mb-3"disabled={device_name && ip_add && port ? false : true } onClick={() => this.submitDeviceDetails()}>Submit</button>
            </div>  
          </div>     
        ) : (
          <div className="singleDeviceInput">
            <Upload inventory={this.state.inventory} />
          </div>
        )}
      </div>           
    );
  }
}
export default AddNewDeviceForm;
