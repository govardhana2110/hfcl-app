import React from "react";
import DynamicMapper from "../Components/mapSchema";
import NewHeader from "../Components/header";
import NewLeftpanel from "../Components/leftPanel";
import backButton from "../Images/back.png";
import { cloneDeep } from "lodash";
import Loading from '../Components/loader';
import { ThemeProvider, createTheme } from "@mui/material/styles";

class ConfigurationPanel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isDarkMode:false,
      role:null,uniqueId:null,
      yangSchema: null,
        is_fetching: false,
      originalData: null,
      serverIP: process.env.REACT_APP_CLIENT_IP,
      device_id: null,
      mainContent: true,
      subHead: null,
      hold_alarms: null,
      get_alarms: null,
      showModuleContent: false,
      index: null,
      KeyYang: null,
      UniqueId: null,
      moduleContent: null,
      supportedYAangs: [
        [
          { "/configuration/net-inst": "ipi-network-instance" },
          { "/configuration/interface": "ipi-interface" },
          { "/configuration/isis": "ipi-isis" },
          { "/configuration/aaa": "ipi-aaa" },
          { "/configuration/arp": "ipi-arp" },
          { "/fault/bfd": "ipi-bfd" },
          { "/fault/vrrp": "ipi-vrrp" },
          { "/configuration/bgp": "ipi-bgp" },
          { "/configuration/serv-map": "ipi-service-map" },
          { "/configuration/m-serv": "ipi-management-server" },
          { "/configuration/acl": "ipi-acl" },
          { "/configuration/vlan": "ipi-vlan" },
          { "/performance/qos": "ipi-qos" },
          { "/performance/ospf": "ipi-ospf" },

        ],
        [
          { "/configuration/l2vpn-vpls": "ipi-l2vpn-vpls" },
          { "/fault/cfm": "ipi-cfm" },
        ],
        [{ "/configuration/logging": "ipi-logging" }],
        [
          { "/configuration/lldpv2": "ipi-lldpv2" },
          { "/configuration/mlag": "ipi-mlag" },
        ],
        [
          { "/configuration/mpls": "ipi-mpls" },
          { "/configuration/evpn-mpls": "ipi-evpn-mpls" },
          { "/configuration/ldp": "ipi-ldp" },
        ],
        [
          { "/configuration/ptp": "ipi-ptp" },
          { "/performance/synce": "ipi-synce" },
        ],
        [
          { "/configuration/ntp": "ipi-ntp" },
          { "/configuration/dns-relay": "ipi-dns-relay" },
          { "/configuration/dns-client": "ipi-dns-client" },
          { "/configuration/igmp": "ipi-igmp" },
          { "/configuration/snmp": "ipi-snmp" },
          { "/configuration/l2vpn-vpws": "ipi-l2vpn-vpws" },
          { "/configuration/mcec": "ipi-mcec" },
          { "/fault/mrib": "ipi-mrib" },
          { "/fault/neighbor-disc": "ipi-neighbor-discovery" },
          { "/configuration/rib": "ipi-rib" },
          { "/configuration/rsvp": "ipi-rsvp" },
          { "/configuration/sys-mgmt": "ipi-sys-mgmt" },
          { "/performance/ip-sla": "ipi-ip-sla" },
          { "/configuration/trange": "ipi-time-range" },


        ],
      ],
    };
  }
  componentDidMount(){
    let role_id=sessionStorage.getItem('role_id')
    this.setState({role:role_id});
    let id = sessionStorage.getItem("unique_id");
    this.setState({ uniqueId: id });
  }
  getRouterType(uniqueid) {
    const segments = uniqueid.split('-');
    const routerType = segments[segments.length - 1];
    return routerType;
  }
  async fetchSchema(key) {
    const {uniqueId}=this.state;
    const routerType = this.getRouterType(uniqueId);
    console.log(routerType,'type');
    const schemaModule = await import(`../${routerType}-schemas/${key}.json`);
    const schema = schemaModule.default;
    console.log(schema, "sche,a");
    this.setState({ yangSchema: schema });
  }

  fetchYangContent(key, name) {
    const {uniqueId}=this.state
    this.fetchSchema(name);
    this.setState({
      showModuleContent: true,
      is_fetching: true,
      getConfigYangData: null,
      KeyYang: key,
      moduleContent: null,
    });
    
    if (key !== "/fault/watchdog") {
      fetch(
        `http://${this.state.serverIP}:5000/configuration-management${key}/${uniqueId}`,
        {
          mode: "cors",
          method: "GET",
          headers: {
            "Access-Control-Allow-Origin": "http://localhost:3000",
            'username': sessionStorage.getItem('username'),
            'Authorization': 'Bearer ' + JSON.parse(sessionStorage.getItem('login_data')).data.access_token
          },
        }
      )
        .then((resp) => resp.json())
        .then((resp) => {
          const originalData = JSON.parse(JSON.stringify(resp));
          this.setState({ getData: resp, getconfigmodule: resp, originalData });
          this.setState({ is_fetching: false });
          console.log(resp, "yangadata", this.state.yangSchema);
          var data2 = this.updateDataWithMissingFields(
            this.state.yangSchema,
            resp,
            originalData
          );
          console.log( "dat2oru",data2);
          this.setState({ originalData: data2['originalData'] });
          this.setState({ getConfigYangData: data2['fetchedData'] });
          if (resp.status && resp.status!=="Requested last saved state not present") {
            alert(resp.status);
            this.setState({ showModuleContent: false });
          }
        })
        .catch((err) => {
          if (err.response) {
            alert(err.response.data.status)
            console.log('Error Response Data:', err.response.data);
            console.log('Error Response Status:', err.response.status);
            console.log('Error Response Headers:', err.response.headers);
          }
        });  ;
    } else {
      this.setState({  is_fetching: false });
    }
  }
  updateDataWithMissingFields(schema, fetchedData, originalData) {
    let data = cloneDeep(fetchedData);
    let original = cloneDeep(originalData);
    function traverseSchema(schemaObj, dataObj, parentPath = "",isOriginalData = false) {
        const { properties, type, oneOf } = schemaObj;
        if (type !== "object" || !properties) {
            return;
        }
        // Check for missing keys in properties and add title from oneOf if applicable
        for (let key in dataObj) {
            const hasProperty = Object.prototype.hasOwnProperty.call(properties, key);
            if (!hasProperty && oneOf) {
                for (let oneOfSet of oneOf) {
                    if (oneOfSet.properties && Object.prototype.hasOwnProperty.call(oneOfSet.properties, key)) {
                        dataObj.title = oneOfSet.title;

                        // Add properties from selected title to the main properties
                        if(isOriginalData){
                            const selectedProperties = oneOfSet.properties;
                            for (let propKey in selectedProperties) {
                                properties[propKey] = selectedProperties[propKey];
                            }
                            break;
                        }
                        
                    }
                }
            }
        }

        // Continue with traversing properties
        Object.entries(properties).forEach(([key, value]) => {
            const fullPath = parentPath ? `${parentPath}.${key}` : key;
            const hasData = Object.prototype.hasOwnProperty.call(dataObj, key);

            if (!hasData) {
                if (value.type === "object") {
                    dataObj[key] = {};
                    traverseSchema(value, dataObj[key], fullPath);
                } else if (value.type === "array") {
                    dataObj[key] = [];
                    // Add empty object with required keys in the array
                    const itemSchema = value.items;
                    const newItem = {};
                    traverseSchema(itemSchema, newItem);
                    if (value["items"].type === "object") {
                        dataObj[key].push(newItem);
                    }
                } else {
                    dataObj[key] = "";
                }
            } else if (value.type === "object") {
                traverseSchema(value, dataObj[key], fullPath);
            } else if (value.type === "array" && Array.isArray(dataObj[key])) {
                const arrayData = dataObj[key];
                arrayData.forEach((item, index) => {
                    if (typeof item === "object") {
                        traverseSchema(value.items, item, `${fullPath}[${index}]`);
                    }
                });
            }
        });
    }

    traverseSchema(schema, data);
    traverseSchema(schema, original ,true);
    return {
        originalData: original,
        fetchedData: data
    };
}
toggleDarkMode = () => {
  console.log("innetw")
  this.setState((prevState) => ({ isDarkMode: !prevState.isDarkMode }));
};

  render() {
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
    return (
     
        <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
        <div style={{height:"100vh",overflow:"hidden"}}  className={isDarkMode ? 'dark-mode' : 'light-mode'}>
            <div style={{ backgroundColor: isDarkMode ? darkTheme.palette.background.default : lightTheme.palette.background.default }}>
            <div style={{display:'flex'}}>
            <NewLeftpanel page='configuration' darkMode={this.state.isDarkMode}/>
            <div style={{flex:'4',marginLeft:"18%"}}>
                <div  style={{backgroundColor: isDarkMode ? darkTheme.palette.background.default : lightTheme.palette.background.default}}>
                    <NewHeader header_name='Configuration Panel' path='Config' darkMode={this.state.isDarkMode} toggleDarkMode={this.toggleDarkMode}/>
                </div>
                
                {!this.state.showModuleContent &&
                  !this.state.mainContent ? (
                    <div>
                    <div className="configurationMain">
                        {this.state.supportedYAangs[parseInt(this.state.index)].map(
                          (item) =>
                            Object.keys(item).map((key) => (
                              <div
                                className="Ru_sub_button"
                                onClick={() => this.fetchYangContent(key, item[key])}
                              >
                                <div className="notification_id" style={{ backgroundColor: isDarkMode ? darkTheme.palette.background.default : "white"}}>
                                  <div className="notification_type_text">
                                    {item[key].split("ipi-")}
                                  </div>
                                </div>
                              </div>
                            ))
                        )}
                      <div
                        style={{ marginLeft: "21%", marginTop: "30px", zIndex: "1" }}
                        onClick={() =>
                          this.setState({
                            mainContent: true,
                            showModuleContent: false,
                            is_fetching: false,
                            subHead: null,
                          })
                        }
                      >
                        <img className="arrowconfig"
                          
                          src={backButton}
                          alt=""
                          width="30"
                        />
                      </div>
                    </div>
                    </div>
                  ) : null}
                {this.state.showModuleContent ? (
    <div>
        <div className="backArrow"
            
            onClick={() =>
                this.setState({
                    showModuleContent: false,
                    is_fetching: false,
                })
            }
        >
            <img
                style={{
                    marginBottom: "6px",
                    cursor: "pointer",
                    position: "fixed",
                    marginTop:"-36px",
                    marginLeft:"13px",

                }}
                src={backButton}
                alt=""
                width="20"
            />
        </div>

        <div className="yangKeycontainer">
            <span>
                {this.state.getConfigYangData ? (
                    <DynamicMapper
                        schema={this.state.yangSchema}
                        data={this.state.getConfigYangData}
                        originalData={this.state.originalData}
                        KeyYang={this.state.KeyYang}
                        role={this.state.role}
                    />
                ) : null}
            </span>
        </div>
    </div>
) : null}

                  {this.state.mainContent ? (
                    <div
                      className="mainContent"
                      style={{ marginLeft: '-1%', marginTop: '3%', height: "80vh", overflow: "auto" }}                    >
                      <div className="subb" style={{
                        display: "flex",
                        flexWrap: "wrap", // Allow wrapping of flex items to new rows
                        justifyContent: "center", // Center items horizontally
                        gap: "20px", // Add some spacing between items
                        rowGap:'40px'
                      }}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "center",
                            flexDirection: "column",
                            alignItems: "center",
                          }}
                        >
                          <div
                            className="configBoxes"
                            onClick={() => {
                              this.setState({
                                index: 0,
                                mainContent: false,
                                subHead: "Layer-3 Routing",
                              });
                            }}
                          >
                            <img
                              alt=""
                              className="configGear"
                              src={require("../Images/path.png")}
                            ></img>
                          </div>
                          <div className="nameConfig">Layer-3 Routing</div>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "center",
                            flexDirection: "column",
                            alignItems: "center",
                          }}
                        >
                          <div
                            className="configBoxes"
                            onClick={() =>
                              this.setState({
                                index: 1,
                                mainContent: false,
                                subHead: "Carrier Ethernet",
                              })
                            }
                          >
                            <img
                              alt=""
                              className="configGear"
                              src={require("../Images/carrierethernet.png")}
                            ></img>
                          </div>
                          <div className="nameConfig">Carrier Ethernet</div>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "center",
                            flexDirection: "column",
                            alignItems: "center",
                          }}
                        >
                          <div
                            className="configBoxes"
                            onClick={() =>
                              this.setState({
                                index: 2,
                                mainContent: false,
                                subHead: "Multicast Routing",
                              })
                            }
                          >
                            <img
                              alt=""
                              className="configGear"
                              src={require("../Images/multicast.png")}
                            ></img>
                          </div>
                          <div className="nameConfig">Multicast Routing</div>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "center",
                            flexDirection: "column",
                            alignItems: "center",
                          }}
                        >
                          <div
                            className="configBoxes"
                            onClick={() =>
                              this.setState({
                                index: 3,
                                mainContent: false,
                                subHead: "Layer-2 Switching",
                              })
                            }
                          >
                            <img
                              alt=""
                              className="configGear"
                              src={require("../Images/l2switching.png")}
                            ></img>
                          </div>
                          <div className="nameConfig">Layer-2 Switching</div>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "center",
                            flexDirection: "column",
                            alignItems: "center",
                          }}
                        >
                          <div
                            className="configBoxes"
                            onClick={() =>
                              this.setState({
                                index: 4,
                                mainContent: false,
                                subHead: "MPLS",
                              })
                            }
                          >
                            <img
                              alt=""
                              className="configGear"
                              src={require("../Images/mpls.png")}
                            ></img>
                          </div>
                          <div className="nameConfig">MPLS</div>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "center",
                            flexDirection: "column",
                            alignItems: "center",
                          }}
                        >
                          <div
                            className="configBoxes"
                            onClick={() =>
                              this.setState({
                                index: 5,
                                mainContent: false,
                                subHead: "Timing & Sync",
                              })
                            }
                          >
                            <img
                              alt=""
                              className="configGear"
                              src={require("../Images/timing.png")}
                            ></img>
                          </div>
                          <div className="nameConfig">Timing & Sync</div>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "center",
                            flexDirection: "column",
                            alignItems: "center",
                          }}
                        >
                          <div
                            className="configBoxes"
                            onClick={() =>
                              this.setState({
                                index: 6,
                                mainContent: false,
                                subHead: "Management",
                              })
                            }
                          >
                            <img
                              alt=""
                              className="configGear"
                              src={require("../Images/management.png")}
                            ></img>
                          </div>
                          <div className="nameConfig">Management</div>
                        </div>
                      </div>

                    </div>
                  ) : null}
                  {this.state.is_fetching === true ? (
                    <Loading/>
                  ) : null}
            </div>
            </div>
            </div>
        </div>
    </ThemeProvider>
    );
  }
}
export default ConfigurationPanel;
