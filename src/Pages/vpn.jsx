import React from 'react';
import NewHeader from '../Components/header';
import { Tabs, Tab } from 'react-bootstrap'; // Assuming you are using Bootstrap
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import 'bootstrap/dist/css/bootstrap.min.css';   
import VpnConfiguration from '../Components/vpnComponent';
import VpnTopology from '../Components/vpnTopology'
class VpnPanel extends React.Component{
    constructor(props){
        super(props);
        this.state={
            serverIP:process.env.REACT_APP_CLIENT_IP,
            deviceID:null,
            selectedNetworkType:null,
            selectedVpnType:null,
            routerTypes:{},
            loadVpnConfiguration:false,
            connectedDevices:[
                "bangalore-hsr-172.24.30.223-830-ocnos-csar","bangalore-hsr-172.24.30.188-830-ocnos-cuar","bangalore-hsr-172.24.30.146-830-ocnos-csar",
                "bangalore-hsr-172.24.30.190-830-ocnos-csar","bangalore-marathalli-172.24.30.148-830-ocnos-csar","bangalore-hsr-172.24.30.189-830-ocnos-csar"
        ],
        };
    }
   
    get_device_list(){
        fetch(`http://${this.state.serverIP}:5005/inventory-management/device-list`,
        {
            mode:'cors',
            method:'GET',
            headers:{'Access-Control-Allow-Origin':'http://localhost:3000',
            'Access-Control-Request-Headers':'http://localhost:3000',
            'Accept':'application/json', 
            'username': sessionStorage.getItem('username'),
            'Content-Type':'application/json'  ,
            'Authorization': 'Bearer ' + JSON.parse(sessionStorage.getItem('login_data')).data.access_token,
             },
        })
        .then(resp=>resp.json())
        .then(resp=>{
            if(resp.devices){
                console.log(resp.devices)
                this.setState({connectedDevices:resp.devices})
            }
        })
        .catch((err) => {
        
          if (err.response) {
            // Handle responses with status codes like 403
            console.log('Error Response Data:', err.response.data);
            console.log('Error Response Status:', err.response.status);
            console.log('Error Response Headers:', err.response.headers);
        
            // Try to parse the response body as JSON
            err.response.json().then((responseData) => {
              console.log('Error Response Message:', responseData.message);
              alert(responseData.message); // Show error message to the user
            }).catch((jsonError) => {
              console.error('Error parsing JSON response:', jsonError);
              alert('Error parsing JSON response.');
            });
          } else {
            // Handle network errors
            console.error('Network Error:', err.message); // Log the error for debugging
          }
        });
    }

    updateLineCoordinates = () => {
        const networkDropdown = document.getElementById("network-dropdown");
        const vpnDropdown = document.getElementById("vpn-dropdown");
    
        if (networkDropdown && vpnDropdown) {
        const networkRect = networkDropdown.getBoundingClientRect();
        const vpnRect = vpnDropdown.getBoundingClientRect();
    
        console.log(networkRect.left,networkRect.top,networkRect.height)
        console.log(vpnRect.left,vpnRect.top,vpnRect.height)
        const lineCoordinates = {
            x1: networkRect.right,
            y1: networkRect.top + networkRect.height / 2,
            x2: vpnRect.left,
            y2: vpnRect.top + vpnRect.height / 2,
        };
    
        this.setState({ lineCoordinates });
        }
    };
    
    componentDidMount() {
        this.get_device_list()
        this.updateLineCoordinates();
    }

    componentDidUpdate(prevProps, prevState) {
    if (
        prevState.selectedNetworkType !== this.state.selectedNetworkType ||
        prevState.selectedVpnType !== this.state.selectedVpnType
    ) {
        this.updateLineCoordinates();
    }
    }

    handleSelectNetwork = (networkType) => {
        this.setState({ selectedNetworkType: networkType });
    };

    handleSelectVpn = (vpnType) => {
    this.setState({ selectedVpnType: vpnType });
    };

    handleChangeRouterType = (event, uniqueID) => {
        const selectedRouterType = event.target.value;
    
        this.setState((prevState) => ({
          routerTypes: {
            ...prevState.routerTypes,
            [uniqueID]: selectedRouterType,
          },
        }));
        console.log(this.state.routerTypes)
    };
    
    render(){
        const { selectedNetworkType ,selectedVpnType,lineCoordinates,connectedDevices} = this.state;
        const { routerTypes, loadVpnConfiguration } = this.state;
        return(
            <div className="vpnContent">
                    <Tabs defaultActiveKey="provision" id="routing-tabs">
                        <Tab eventKey="provision" title="VPN Provisioning">
                            <div className="provision-content" style={{marginTop:"-10px"}}>
                                <div style={{display:"flex", color: "#494697", fontWeight: "500" }}>
                                    <DropdownButton
                                        // id="network-dropdown"
                                        title={selectedNetworkType || "Choose Type"} 
                                        onSelect={this.handleSelectNetwork}
                                        drop="down"
                                        style={{ zIndex: 1000}}
                                        className='custom-dropdown'
                                        >
                                        {["site-to-site-vpn", "remote-access-vpn"].map((networkType, optionIndex) => (
                                            <Dropdown.Item key={optionIndex} eventKey={networkType}>
                                            {networkType}
                                            </Dropdown.Item>
                                        ))}
                                    </DropdownButton>

                                    {selectedNetworkType &&  selectedNetworkType==="site-to-site-vpn"? (
                                    <DropdownButton
                                        id="vpn-dropdown"
                                        style={{ marginLeft: "5%", zIndex: 1000}}
                                        title={selectedVpnType || "Choose Vpn Type"} 
                                        onSelect={this.handleSelectVpn}
                                        drop="down" 
                                        className='custom-dropdown'
                                    >
                                        {["MPLSL3VPN", "MPLSL2VPN"].map((vpnType, optionIndex) => (
                                        <Dropdown.Item key={optionIndex} eventKey={vpnType}>
                                            {vpnType}
                                        </Dropdown.Item>
                                        ))}
                                    </DropdownButton>
                                    ) : null}

                                    {selectedVpnType && selectedVpnType==="MPLSL3VPN"? (
                                        <DropdownButton
                                            id="vpn-dropdown"
                                            style={{ marginLeft: "5%", zIndex: 1000}}
                                            title={ "Identify PE/P/CE Routers"} 
                                            drop="down" 
                                            className='custom-dropdown'
                                        >
                                            {connectedDevices && connectedDevices.map((device,index) => (
                                                <Dropdown.Item key={index} eventKey={device.unique_id} style={{fontSize:"small"}}>
                                                    <div key={device.unique_id} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                                                        <div style={{ marginRight: '10px' }}>{device.unique_id}</div>
                                                        <select
                                                            className="intervalLabel"
                                                            style={{ borderRadius: '3px' }}
                                                            onChange={(e) => this.handleChangeRouterType(e, device.unique_id)}
                                                            onClick={(e) => e.stopPropagation()}
                                                            >
                                                            <option value={null}>select</option>	
                                                            {["CE", "PE", "P"].map((item, index) => (
                                                                <option value={item} key={index} disabled={item==="CE"} style={{background:item==="CE"?'#c4c3bc':'white'}}>
                                                                {item}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </Dropdown.Item>
                                            ))}
                                        </DropdownButton>
                                    ) : null}

                                    <div style={{margin:"2%"}} onClick={()=>this.setState({loadVpnConfiguration:true})}>
                                        <button className='btn btn-primary mb-3 bootstarapModificationButton' disabled={ Object.keys(routerTypes).length>=1?false:true}>load</button>
                                    </div>

                                </div>
                                {loadVpnConfiguration?(
                                    <VpnConfiguration routerTypes={routerTypes}/>
                                ):null}
                                
                            </div>
                        </Tab>

                    
                        <Tab eventKey="modify" title="Modify VPN Network">
                            <VpnTopology/>
                        </Tab>
                    </Tabs>
                </div>
        )
    }
}
export default VpnPanel;