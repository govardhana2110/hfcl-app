import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Tabs, Tab } from "react-bootstrap";
import show from "../Images/downArrow.png";
import hide from "../Images/upArrow.png";
import notify from '../utils';
import Loading from "../Components/loader";
import close from "../Images/closeS.png";
import save from "../Images/floppy-disk.png";
import InterfaceConfiguration from "./interfaceConfiguration";
import Tooltip from "@mui/material/Tooltip";
import TopologyVpnCreation from "./l3VpnConfiguration";

class VpnConfiguration extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      serverIP: process.env.REACT_APP_CLIENT_IP,
      deviceID: null,
      visibility: {
        CE: true,
        P: true,
        PE: true,
      },
      configuringRouters: [],
      changedNames: [],
      labelSwitching: [],
      ceConfig: null,
      checkedInterfaces: [],
      routerData: {},
      changedInterfacesData: [],
      dataFetchedForRouter: {},
      savedTemplateJson:null,
      labelSwitchResponse:[],isisData:{},vrfData:{},labelSwitchResponse:[],labelSwitchingData:{},bgpConfigurationData:{},
    };
    this.toggleVisibility = this.toggleVisibility.bind(this);
    this.handleConfigureClick = this.handleConfigureClick.bind(this);
    this.renderRouterItem = this.renderRouterItem.bind(this);
  }

  handleInputChange = (fieldName, value) => {
    this.setState({ [fieldName]: value });
  };

  renderInputField = (label, fieldName) => (
    <div className="isis-instance-labels">
      <div className="isis-config-module">{label}</div>
      <input
        type="text"
        value={this.state[fieldName]}
        onChange={(e) => this.handleInputChange(fieldName, e.target.value)}
      />
    </div>
  );

  renderRouterItem(router, type) {
    const {
      selectedRouter,labelSwitchResponse,bgpConfigurationData,labelSwitchingData,isisData,vrfData,
      configuringRouters,
      routerData,
    } = this.state;
    return (
      <div className="configuring-tab">

        <div key={router} className="router-item">
          <div className="router-item-name">{router}</div>
          <div style={{ display: "flex", position: "relative", right: "-19%" }}>
            <button
              className="vpn-start-configure-button"
              onClick={() => this.handleConfigureClick(router)}
            >
              {configuringRouters.includes(router) ? "hide" : "setup vpn"}
            </button>
          </div>
        </div>
        
        {configuringRouters.includes(router) ? (
          <div className="configured-content">
            {type !== "CE" ? (
              <TopologyVpnCreation
                routerType={type}
                routerData={routerData}
                selectedRouter={selectedRouter}
                labelSwitchResponse={labelSwitchResponse}
                bgpConfigurationData={bgpConfigurationData}
                labelSwitchData={labelSwitchingData}
                interfaceData={
                  routerData && routerData["ipi-interface:interfaces"]
                    ? routerData["ipi-interface:interfaces"]["interface"]
                    : []
                }
                isisData={isisData}
                vrfDataResponse={vrfData}
                postData={this.finalDataToPost}

              ></TopologyVpnCreation>
              
            ) : (
              

              <div className="configured-content">
                <Tabs defaultActiveKey="interface" id="routing-tabs">
                  <Tab eventKey="interface" title="Interface">
                    <div className="configured-content-body">
                      <p style={{ fontSize: "smaller" }}>
                        PE & P: configure interfaces with ip address <br></br>
                        Note: Give IP to only PE-P, P-P interfaces(not PE-CE
                        interfaces, thats last step)
                      </p>
                      <div  >
                        {routerData&&routerData[router]&&routerData[router]['data'] ?
                            <InterfaceConfiguration  data={routerData[router]['data']} routerid={router} saveConfiguration={this.saveCEInterfaceConfig}/>
                          :null}
                      </div>
                    </div>
                  </Tab>

                  <Tab eventKey="rib" title="RIB">
                    <div className="configured-content-body">
                      <p style={{ fontSize: "smaller" }}>
                        CE: set static route to other CE<br></br>
                        Note: destination is other side's pe router's interface[only
                        prefix i.e. 0/24]<br></br>
                        Note: gateway is this side's pe router's interface (to which
                        this CE is joined)
                      </p>
                      {this.renderInputField(
                        "Destination Prefix",
                        "destination_prefix"
                      )}
                      {this.renderInputField("Gateway Address", "gateway_address")}
                      <button
                        className="btn btn-primary mb-3 bootstarapModificationButton"
                        style={{ position: "relatove", left: "41%" }}
                        onClick={() => this.saveRibConfig(router)}
                      >
                        save
                      </button>
                    </div>
                  </Tab>
                </Tabs>
              </div>
            )}
          </div>
        ) : null}
      </div>
    )
  }

  renderRouterTypes(type) {
    const { routerTypes } = this.props;
    const { visibility } = this.state;
    if(type!=="CE"){
      return (
        <div className="routerTypes">
          <div className="routerTypes-head">
            {`${type} Routers`}
            <div
              onClick={() => this.toggleVisibility(type)}
              className="showHideVpn"
            >
              {visibility[type] ? (
                <img src={show} alt="" width={20} />
              ) : (
                <img src={hide} alt="" width={20} />
              )}
            </div>
          </div>
          {visibility[type] ? (
            <div className="vpn-router-list">
              {Object.keys(routerTypes).map((router) =>
                routerTypes[router] === type
                  ? this.renderRouterItem(router, type)
                  : null
              )}
            </div>
          ) : null}
        </div>
      );
    }
  }

  handleConfigureClick(router) {
    this.setState(
      (prevState) => {
        const isConfiguring = prevState.configuringRouters.includes(router);
        const configuringRouters = isConfiguring
          ? prevState.configuringRouters.filter((r) => r !== router)
          : [...prevState.configuringRouters, router];

        return { configuringRouters };
      },
      () => {
        if (!this.state.dataFetchedForRouter[router]) {
          this.fetchInterfaces(router);
        }
      }
    );
  }

  fetchInterfaces(id) {
    fetch(
      `http://${process.env.REACT_APP_CLIENT_IP}:5000/configuration-management/interface-ip/${id}`,
      {
        mode: "cors",
        method: "GET",
        headers: {
          "Access-Control-Allow-Origin": "http://localhost:3000",
        },
      }
    )
      .then((resp) => resp.json())
      .then((resp) => {
          this.getVrfData(id);
          this.getIsisData(id);
        this.getLabelSwitchingData(id);

        if (resp && resp.status === "API failed") {
          alert("api failed")
          this.setState({routerData:{}})
        } else if (resp && resp.status !== "API failed") {
          this.setState({routerData:resp})
          this.setState({selectedRouter:id})
          this.getBgpDetails(id);
        } else {
         alert("api failed")
        }
      });
  }

  getIsisData = (router) => {
    fetch(
      `http://${process.env.REACT_APP_CLIENT_IP}:5000/configuration-management/configuration/isis/${router}`,
      {
        mode: "cors",
        method: "GET",
        headers: {
          "Access-Control-Allow-Origin": "http://localhost:3000",
        },
      }
    )
      .then((resp) => resp.json())
      .then((resp) => {
        console.log(resp,"isis-resp")
        const isisResponse = resp["ipi-isis:isis"] && resp["ipi-isis:isis"]["interfaces"] ? resp["ipi-isis:isis"] : null;
        this.setState({isisData:isisResponse})
      });
  };

  getBgpDetails = (selectedRouter) => {

    fetch(
      `http://${process.env.REACT_APP_CLIENT_IP}:5000/configuration-management/configuration/bgp/${selectedRouter}`,
      {
        mode: "cors",
        method: "GET",
        headers: {
          "Access-Control-Allow-Origin": "http://localhost:3000",
        },
      }
    )
      .then((resp) => resp.json())
      .then((resp) => {
        console.log(resp,"get-bgp")
        if (
          resp["ipi-bgp:bgp"] &&
          resp["ipi-bgp:bgp"]["bgp-instances"]["bgp-instance"][0]
        ) {
          this.setState({bgpConfigurationData:resp["ipi-bgp:bgp"]["bgp-instances"]["bgp-instance"][0]})
        } 
        else{
          this.setState({bgpConfigurationData:null})
        }
      });
  };

  getLabelSwitchingData = (router) => {
    fetch(
      `http://${process.env.REACT_APP_CLIENT_IP}:5000/configuration-management/configuration/mpls/${router}`,
      {
        mode: "cors",
        method: "GET",
        headers: {
          "Access-Control-Allow-Origin": "http://localhost:3000",
        },
      }
    )
      .then((resp) => resp.json())
      .then((resp) => {
        const labelSwitchingData = resp["ipi-mpls:mpls"]
          ? resp["ipi-mpls:mpls"] && resp["ipi-mpls:mpls"]["interfaces"] && resp["ipi-mpls:mpls"]["interfaces"]["interface"]
          : [];
        this.setState({labelSwitchResponse:labelSwitchingData})
      });
  };

  getVrfData = (router) => {
    fetch(
      `http://${process.env.REACT_APP_CLIENT_IP}:5000/configuration-management/configuration/net-inst/${router}`,
      {
        mode: "cors",
        method: "GET",
        headers: {
          "Access-Control-Allow-Origin": "http://localhost:3000",
        },
      }
    )
      .then((resp) => resp.json())
      .then((resp) => {
        console.log(resp,"vrf-resp")
        const vrfResponse = resp["ipi-network-instance:network-instances"] && 
        resp["ipi-network-instance:network-instances"]["network-instance"] && 
        resp["ipi-network-instance:network-instances"]["network-instance"][2]&&
        resp["ipi-network-instance:network-instances"]["network-instance"][2]["ipi-vrf:vrf"]
          ? resp["ipi-network-instance:network-instances"]["network-instance"]
          : [];
        this.setState({vrfData:vrfResponse})
      });
  };

  finalDataToPost=(totalData,type,id)=>{
    const data = this.removeKeysRecursively(totalData);
    this.callPostVpnConfiguration(data,type)
    this.setState({uniqueIDVpn:id}) 
 
  }

 
  removeKeysRecursively = (obj) => {
    let keysToRemove = ["rib", "state", "vrf-peers", "peer-index"];
    if (Array.isArray(obj)) {
      return obj.map((item) => this.removeKeysRecursively(item));
    }

    if (typeof obj === "object" && obj !== null) {
      const newObj = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          if (keysToRemove.includes(key)) {
            delete newObj[key];
          } else {
            newObj[key] = this.removeKeysRecursively(obj[key]);
          }
        }
      }
      return newObj;
    }

    return obj;
  };

  toggleVisibility(type) {
    this.setState((prevState) => ({
      visibility: {
        ...prevState.visibility,
        [type]: !prevState.visibility[type],
      },
    }));
  }

  saveCEInterfaceConfig=(data,id)=>{
    const {changedInterfacesData}=this.state;
    this.setState(
      (prevState) => ({
        changedInterfacesData: {
          ...prevState.changedInterfacesData,
          [id]: {
            interfaceList: data,
          },
        },
      }),
      () => {
        notify("Interafce configuration saved",'success');
        
      }
    );
  }

  saveRibConfig(router) {
    const { destination_prefix, gateway_address } = this.state;
    const ceConfig = {
      "ipi-rib:routing": {
        "@xmlns:ipi-rib": "http://www.ipinfusion.com/yang/ocnos/ipi-rib",
        "static-routes": {
          ipv4: {
            routes: {
              route: [
                {
                  config: {
                    "destination-prefix": destination_prefix,
                    "gateway-address": gateway_address,
                  },
                  "destination-prefix": destination_prefix,
                  "gateway-address": gateway_address,
                },
              ],
            },
          },
        },
      },
    };
    this.setState(
      (prevState) => ({
        changedInterfacesData: {
          ...prevState.changedInterfacesData,
          [router]: {
            ...prevState.changedInterfacesData[router],
            peCeConfig: ceConfig,
          },
        },
      }),
      () => {
        notify("RIB confiug saved",'success');

        console.log("updated", this.state.changedInterfacesData);
      }
    );
  }

  saveRouterConfig(id, type) {
    const {changedInterfacesData} = this.state;
    const data = this.removeKeysRecursively(changedInterfacesData);
    this.callPostVpnConfiguration(data,type)
  }

  setForCeType(data) {
    let unique_id = "";
    let temp = {}; // Properly initialized here
    for (let key in data) {
        unique_id = key;
        Object.keys(data[key]).map(item => (
            temp = { ...temp, ...data[key][item] } // Corrected data[key][item]
        ));
    }
    this.setState({ verificationTab: true, verificationTabBody: temp, uniqueIDVpn: unique_id ,setType:"CE"});
}


  callPostVpnConfiguration(data,type){
    console.log(data,"passes=final")
    if(type==="CE"){
      this.setForCeType(data)
    }
    else{
      var temp={};
      for(let key in data){
            if((key==="attachToVrfData" || key==='enableLabelSwitch') && temp.hasOwnProperty('ipi-interface:interfaces') ){
              temp={...temp, ...temp['ipi-interface:interfaces']['interface'].push(...data[key]['ipi-interface:interfaces']['interface'])}
            }
            else{
              temp={...temp,...data[key]}
            }
      }
      console.log(temp,"attach-interface")
      this.setState({verificationTab:true,verificationTabBody:temp}) 
    }
   
  }

  configureVpn(){
    const {verificationTabBody,uniqueIDVpn,setType}=this.state;
    if(setType){
      fetch(`http://${this.state.serverIP}:5000/configuration-management/configuration/rib/${uniqueIDVpn}`, {
        mode: 'cors',
        method: 'POST',
        headers: {
          'Access-Control-Allow-Origin': 'http://localhost:3000',
          'Content-Type': 'application/json',
          'username': sessionStorage.getItem('username'),
        },
        body: JSON.stringify(verificationTabBody)
      })
      .then(resp => resp.json())
      .then(resp => {
        this.setState({isLoading:false})
        if(resp.status&& resp.status['rpc-reply']){
          console.log(resp, 'post-rib-response');
        }
        else {
          notify(resp.status.message,'error')
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
      if(verificationTabBody .hasOwnProperty("ipi-network-instance:network-instances") && Object.keys(verificationTabBody).length>1){
        const vrfConfigData={"ipi-network-instance:network-instances":verificationTabBody["ipi-network-instance:network-instances"]}
        fetch(`http://${this.state.serverIP}:5000/configuration-management/configuration/net-inst/${uniqueIDVpn}`, {
          mode: 'cors',
          method: 'POST',
          headers: {
            'Access-Control-Allow-Origin': 'http://localhost:3000',
            'Content-Type': 'application/json',
            'username': sessionStorage.getItem('username'),
          },
          body: JSON.stringify(vrfConfigData)
        })
        .then(resp => resp.json())
        .then(resp => {
          console.log(resp, 'post-vrf-config-response');
          if(resp.status["rpc-reply"]){
            this.callPostVpnConfigurationTotal(verificationTabBody,uniqueIDVpn)  
          }
          else {
            notify(resp.status.message,'error')
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
            this.callPostVpnConfigurationTotal(verificationTabBody,uniqueIDVpn)  
     }

    }
  } 

  callPostVpnConfigurationTotal(data,id){
    fetch(`http://${this.state.serverIP}:5000/configuration-management/configuration/bgp/${id}`, {
      mode: 'cors',
      method: 'POST',
      headers: {
        'Access-Control-Allow-Origin': 'http://localhost:3000',
        'Content-Type': 'application/json',
        'username': sessionStorage.getItem('username'),
      },
      body: JSON.stringify(data)
    })
    .then(resp => resp.json())
    .then(resp => {
      console.log(resp, 'post-vpn-response');
      this.setState({isLoading:false})
      if(resp.status&& resp.status['rpc-reply']){
        notify('Configured succssfully','success')
      }
      else {
        notify(resp.status.message,'error')
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


  displayNestedObject(data) {
    const array = ["ipi-interface:interfaces", "ipi-mpls:mpls", "ipi-isis:isis", "ipi-ldp:ldp", "ipi-network-instance:network-instances", "ipi-bgp:bgp"];
  
    const renderTree = (obj, depth = 0) => {
      // Check if obj is null or undefined
      if (obj == null) {
        return null;
      }
  
      return Object.entries(obj).map(([key, value]) => {
        const indent = '  '.repeat(depth); // indentation for nested levels
        const formattedValue = typeof value === 'object' ? renderTree(value, depth + 1) : JSON.stringify(value);
        
        // Define inline CSS for highlighting
        const highlightStyle = {
          color: array.includes(key) ? '#af2727' : '#a58422',
          fontWeight:array.includes(key) ? 'bold' : 'null',
          padding: '2px',
        };
  
        return (
          <div key={key} style={{ marginLeft: "8px"}}>
            {indent}
            <span style={highlightStyle}>{key}</span>: {formattedValue}
          </div>
        );
      });
    };
  
    return (
      <div className="nested-object-tree">
        {renderTree(data)}
      </div>
    );
  }
  
  

  render() {
    const routerTypeKeys = Object.keys(this.state.visibility);
    const {verificationTab,verificationTabBody}=this.state;
    return (
      <div>
        <div>{routerTypeKeys.map((type) => this.renderRouterTypes(type))}</div>
        {verificationTab?(
          <div className="role_content" style={{width:"53%",height:"400px",overflow:"scroll",fontSize:"smaller"}}>
           
            <img src={close} onClick={()=>this.setState({verificationTab:false})} alt="" width={10}  style={{ position: "fixed",right: "25%",cursor: "pointer"}}/>
            <div style={{margin:"2%"}}>
              {this.displayNestedObject(verificationTabBody)}
              <div style={{
                display:'flex',
                gap:"10px",
                position:'fixed',
                bottom:"24%",
                right:"22%"
              }}>
                <Tooltip title="save template">
                  <img  onClick={()=>this.setState({savedTemplateJson:verificationTabBody})} src={save} width={30} height={37} alt="save"/>
                </Tooltip>
                <button 
                  className="btn btn-primary mb-3 bootstarapModificationButton"
                  
                  onClick={()=>{this.configureVpn();this.setState({verificationTab:false,isLoading:true})}}>submit
                </button>
              </div>
            </div>
          </div>
        ):null}

      {this.state.isLoading === true ? <Loading /> : null}

      </div>
    );
  }
}

export default VpnConfiguration;
