import React from "react";
import NewHeader from "../Components/header";
import Loading from "../Components/loader";
import Tooltip from "@mui/material/Tooltip";
import Toggle from '../Components/toggle';
import vpn from "../Images/vpn.png";
import "leaflet/dist/leaflet.css";
import "react-dropdown/style.css";
import NetworkTopology from "../Components/topoSample";
import LogManagementPanel from "./log";
import "bootstrap/dist/css/bootstrap.min.css";
import topology from "../Images/topology.png";
import discoveryIcon from "../Images/search.png";
import routing from "../Images/split.png";
import SLAPerformanceStats from "../Components/slaStats.jsx";
import GlobalReport from "../Components/report.jsx";
import VpnManagement from "./vpn.jsx";
import TemplatePannel from "../Components/network_template.jsx";
import WhitelistPanel from "../Components/whitelist.jsx";
import ConfigurationComparator from "../Components/configurationComparator.jsx";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import LspRouting from "../Components/lspRouting.jsx";
import Discovery from "../Components/network_discovery.jsx";
import Threshold from "../Components/threshold.jsx";
import DeviceListPanel from "../Components/deviceList.jsx";
import SoftwarePanel from "../Components/network_software.jsx";
class NetworkPanel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      deviceInventory:true,
      selectedInventoryType:"deviceList",
      isDarkMode: false,
      getWhitelist: null,
      activePage: 1,
      itemsPerPage: 5,
      topologyData: {
        "bangalore-hsr-172.24.30.205-830-ocnos-csar": {
          bgp: {
            "router-id": "3.3.3.3",
            "router-as": "100",
            peers: [
              {
                "local-interface-address": "192.168.100.2",
                "connection-state": "established",
                "remote-interface-address": "192.168.100.1",
                "remote-as": "100",
                "remote-router-id": "7.7.7.7",
                "up-time": "22:33:38",
                "remote-unique-id":
                  "bangalore-hsr-172.24.30.209-830-ocnos-csar",
                "local-interface-name": "ge1",
                "remote-interface-name": "ge1",
              },
              {
                "local-interface-address": "192.168.100.4",
                "connection-state": "established",
                "remote-interface-address": "192.168.101.7",
                "remote-as": "100",
                "remote-router-id": "4.4.4.4",
                "up-time": "22:33:38",
                "remote-unique-id":
                  "bangalore-hsr-172.24.30.206-830-ocnos-csar",
                "local-interface-name": "ge3",
                "remote-interface-name": "ge3",
              },
            ],
          },
        },
        "bangalore-hsr-172.24.30.206-830-ocnos-csar": {
          bgp: {
            "router-id": "4.4.4.4",
            "router-as": "200",
            peers: [
              {
                "local-interface-address": "192.168.101.2",
                "connection-state": "established",
                "remote-interface-address": "192.168.101.1",
                "remote-as": "100",
                "remote-router-id": "7.7.7.7",
                "up-time": "22:56:04",
                "remote-unique-id":
                  "bangalore-hsr-172.24.30.209-830-ocnos-csar",
                "local-interface-name": "ge4",
                "remote-interface-name": "ge2",
              },
              {
                "local-interface-address": "192.168.101.7",
                "connection-state": "established",
                "remote-interface-address": "192.168.100.4",
                "remote-as": "100",
                "remote-router-id": "3.3.3.3",
                "up-time": "22:56:04",
                "remote-unique-id":
                  "bangalore-hsr-172.24.30.205-830-ocnos-csar",
                "local-interface-name": "ge3",
                "remote-interface-name": "ge3",
              },
              {
                "local-interface-address": "192.168.102.6",
                "connection-state": "idle",
                "remote-interface-address": "192.168.102.7",
                "remote-as": "100",
                "remote-router-id": "3.3.3.3",
                "up-time": "22:33:38",
                "remote-unique-id":
                  "bangalore-hsr-172.24.30.205-830-ocnos-csar",
                "local-interface-name": "xe3",
                "remote-interface-name": "xe3",
              },
            ],
          },
        },
        "bangalore-hsr-172.24.30.209-830-ocnos-csar": {
          bgp: {
            "router-id": "7.7.7.7",
            "router-as": "100",
            peers: [
              {
                "local-interface-address": "192.168.100.1",
                "connection-state": "established",
                "remote-interface-address": "192.168.100.2",
                "remote-as": "100",
                "remote-router-id": "3.3.3.3",
                "up-time": "22:33:42",
                "remote-unique-id":
                  "bangalore-hsr-172.24.30.205-830-ocnos-csar",
                "local-interface-name": "ge1",
                "remote-interface-name": "ge1",
              },
              {
                "local-interface-address": "192.168.101.1",
                "connection-state": "established",
                "remote-interface-address": "192.168.101.2",
                "remote-as": "100",
                "remote-router-id": "4.4.4.4",
                "up-time": "22:56:04",
                "remote-unique-id":
                  "bangalore-hsr-172.24.30.206-830-ocnos-csar",
                "local-interface-name": "ge2",
                "remote-interface-name": "ge4",
              },
            ],
          },
        },
      },
      loggedInUserRole: "",
      selectedTabPanel: { background: "#e8ebf1", borderTopLeftRadius: "12px" },
      is_fetching: false,
      isToggled:false,
      inventory: null,
      serverIP: process.env.REACT_APP_CLIENT_IP,
      tab_disabled: true,
      user_state_name: false,
      item_sites_name: null,
      item_cluster_name: null,
      deviceGet: [],
      selectedDeviceList: [],
      show_delete_confirmation_popup: false,
      clusters: null,
      sites: null,
      routerDetails: null,
      get_network_element_info: null,
      deviceGetDelete: [],
      showDiscoveryTab: false,
      device_name: null,
      port: null,
      ip_add: null,
      username: "",
      isLoading: true,
      openDrop: null,
      showThreshold: false,
      selectedInterface: [],
      showStats: false,
      showLspStats: false,
      showConfigurationComparator: null,
      templateList: null,
      connectedDevices: null,
      TemplateList: null,
      checked: [],
      openTemplateList: false,
      checkedDevices: [],
      device_type: null,
      devices: [
        {
          id: 1,
          latitude: 17.385,
          longitude: 78.4867,
          name: "Device 1: 172.24.30.179",
        },
        {
          id: 2,
          latitude: 25.9644,
          longitude: 85.2722,
          name: "Device 2: 172.24.30.187",
        },
        {
          id: 2,
          latitude: 27.0238,
          longitude: 74.2179,
          name: "Device 3: 172.24.30.200",
        },
      ],
      content: null,
      showDeviceList: true,
      filterOptions: {
        device_name: [],
        device_type: [],
        site_name: [],
        cluster_name: [],
        ip_add: [],
        port: [],
        role: [],
        status: [],
        username: [],
      },
      showTopologyTab: false,
      allDevices:null,
      toggleConfig:false,showWhitelist:true
    };
    this.get_device_list = this.get_device_list.bind(this);
 }
 
  componentDidMount() {
    sessionStorage.setItem("Connection", false);
    let role = sessionStorage.getItem("role_id");
    this.setState({ loggedInUserRole: role });
    if (role === "NETWORK-ADMIN") {
      this.setState({ user_state_name: false });
    } else {
      this.setState({ user_state_name: true });
    }
    this.get_device_list();
  }

  get_device_list() {
    fetch( `http://${this.state.serverIP}:5005/inventory-management/device-list`,
      {
        mode: "cors",
        method: "GET",
        headers: {
          "Access-Control-Allow-Origin": "http://localhost:3000",
          "Access-Control-Request-Headers": "http://localhost:3000",
          Accept: "application/json",
          username: sessionStorage.getItem("username"),
          "Content-Type": "application/json",
          Authorization:"Bearer " + JSON.parse(sessionStorage.getItem("login_data")).data.access_token,
        },
      }
    )
      .then((resp) => resp.json())
      .then((resp) => {
        this.setState({ isLoading: false, tab_disabled: false });
        this.setState({get_network_element_info: resp,clusters: resp.clusters,sites: resp.sites});
        var role = this.state.loggedInUserRole.toLowerCase();
        let filteredDeviceListWithRole;
        let openDrop = [];
        const { filterOptions } = this.state;
        var temp = [];
        var newList=[];
        for (let i = 0; i < resp.devices.length; i++) {
          openDrop.push(false);
          newList.push(resp.devices[i].unique_id)
          if (resp.devices[i].ConnectionStatus) {
            temp.push(resp.devices[i].unique_id);
          }
        }
        sessionStorage.setItem("connectedDeviceList", temp)
        sessionStorage.setItem("ListDevice", JSON.stringify(resp.devices));
        this.setState({ openDrop: openDrop, connectedDevices: temp,allDevices:newList });
        if (role === "network-admin") {
          filteredDeviceListWithRole = resp.devices;
        } else if (role === "network-engineer") {
          filteredDeviceListWithRole = resp.devices.filter((device) => device.role !== "network-admin");
        } else if (role === "network-operator") {
          filteredDeviceListWithRole = resp.devices.filter((device) => device.role !== "network-admin" && device.role !== "network-engineer" );
        } else if (role === "network-user") {
          filteredDeviceListWithRole = resp.devices.filter((device) => device.role === "network-user");
        }

        if (filteredDeviceListWithRole.length > 0) {
          this.setState({ routerDetails: filteredDeviceListWithRole, staticDeviceList: filteredDeviceListWithRole }, 
            () => {
              const devices = this.state.routerDetails;
              ["device_name", "ip_add","device_type","role","port", "status", "username","site_name","cluster_name" ].forEach((key) => {
                if (key === "status") {
                  filterOptions[key] = [true, false];
                } else {
                  filterOptions[key] = Array.from( new Set(devices.map((device) => device[key])) );
                }
              });
            }
          );
        } else {
          this.setState({ clusters: null, sites: null });
        }
        this.setState({ filterOptions });
        const arrayString = JSON.stringify(resp.devices);
        const cluster = JSON.stringify(resp.clusters);
        sessionStorage.setItem("ClusterDevice", cluster);
        sessionStorage.setItem("clusterCount", resp.clusters.length);
        sessionStorage.setItem("deviceCount", resp.devices.length);
      })
      .catch((err) => {
        if (err.response) {
          // Try to parse the response body as JSON
          err.response
            .json()
            .then((responseData) => {
              alert(responseData.message); // Show error message to the user
            })
            .catch((jsonError) => {
              alert("Error parsing JSON response.");
            });
        } else {
          // Handle network errors
          console.error("Network Error:", err.message); // Log the error for debugging
        }
      });
  }


  fetchTemplateList() {
    fetch(
      `http://${this.state.serverIP}:5000/configuration-management/configuration-templates-list`,
      {
        mode: "cors",
        method: "GET",
        headers: {
          "Access-Control-Allow-Origin": "http://localhost:3000",
          username: sessionStorage.getItem("username"),
          Authorization:
            "Bearer " +
            JSON.parse(sessionStorage.getItem("login_data")).data.access_token,
        },
      }
    )
      .then((resp) => resp.json())
      .then((resp) => {
        if (resp.length >= 1) {
          this.setState({ TemplateList: resp });

          var temp = [];
          for (let i = 0; i < resp.length; i++) {
            temp.push(resp[i].template_name);
          }
          this.setState({ templateList: temp });
        }
      })
      .catch((err) => {
        if (err.response) {
          alert(err.response.data.status);
        }
      });
  }


  showTopTabs(id) {
    if (this.state.tab_disabled === false) {
      if (id === "device-list") {
        this.setState({
          showVpnTab: false,
          showReportTab: false,
          showTopologyTab: false,
          showDiscoveryTab: false,
          showDeviceList: true,
          showSoftwareUpgrade: false,
          showConfigurationComparator: false,
          showLogs: false,
          openTemplateList: false,
          showThreshold: false,
          showAddDeviceTab: false,
          showStats: false,
          showLspStats: false,
        });
      } else if (id === "software-upgrade") {
        this.setState({
          showVpnTab: false,
          showReportTab: false,
          showTopologyTab: false,
          showDeviceList: false,
          showDiscoveryTab: false,
          showSoftwareUpgrade: true,
          showConfigurationComparator: false,
          showLogs: false,
          openTemplateList: false,
          showThreshold: false,
          showAddDeviceTab: false,
          showStats: false,
          showLspStats: false,
        });
      } else if (id === "compare-configuration") {
        this.setState({
          showVpnTab: false,
          showReportTab: false,
          showTopologyTab: false,
          showDeviceList: false,
          showSoftwareUpgrade: false,
          showDiscoveryTab: false,
          showConfigurationComparator: true,
          showLogs: false,
          openTemplateList: false,
          showThreshold: false,
          showAddDeviceTab: false,
          showStats: false,
          showLspStats: false,
        });
      } else if (id === "logs") {
        this.setState({
          showVpnTab: false,
          showReportTab: false,
          showTopologyTab: false,
          showDeviceList: false,
          showSoftwareUpgrade: false,
          showDiscoveryTab: false,
          showConfigurationComparator: false,
          showLogs: true,
          openTemplateList: false,
          showThreshold: false,
          showAddDeviceTab: false,
          showStats: false,
          showLspStats: false,
        });
      } else if (id === "templates") {
        this.fetchTemplateList();
        this.setState({
          showVpnTab: false,
          showReportTab: false,
          showTopologyTab: false,
          showDeviceList: false,
          showDiscoveryTab: false,
          showSoftwareUpgrade: false,
          showConfigurationComparator: false,
          showLogs: false,
          openTemplateList: true,
          showThreshold: false,
          showAddDeviceTab: false,
          showStats: false,
          showLspStats: false,
        });
      }
      else if (id === "discovery") {
        this.setState({
          showDiscoveryTab : true,
          showVpnTab: false,
          showReportTab: false,
          showTopologyTab: false,
          showDeviceList: false,
          showSoftwareUpgrade: false,
          showConfigurationComparator: false,
          showLogs: false,
          openTemplateList: false,
          showThreshold: false,
          showAddDeviceTab: false,
          showStats: false,
          showLspStats: false,
        });
      } else if (id === "threshold") {
        this.setState({
          showVpnTab: false,
          showReportTab: false,
          showTopologyTab: false,
          showDeviceList: false,
          showDiscoveryTab: false,
          showSoftwareUpgrade: false,
          showConfigurationComparator: false,
          showLogs: false,
          openTemplateList: false,
          showThreshold: true,
          showAddDeviceTab: false,
          showStats: false,
          showLspStats: false,
        });
      } else if (id === "topology") {
        this.setState({
          showVpnTab: false,
          showReportTab: false,
          showDiscoveryTab: false,
          showDeviceList: false,
          showSoftwareUpgrade: false,
          showConfigurationComparator: false,
          showLogs: false,
          openTemplateList: false,
          showThreshold: false,
          showAddDeviceTab: false,
          showTopologyTab: true,
          showStats: false,
          showLspStats: false,
        });
      } else if (id === "lsp") {
        this.setState({
          showVpnTab: false,
          showReportTab: false,
          showDiscoveryTab: false,
          showDeviceList: false,
          showSoftwareUpgrade: false,
          showConfigurationComparator: false,
          showLogs: false,
          openTemplateList: false,
          showThreshold: false,
          showAddDeviceTab: false,
          showTopologyTab: false,
          showStats: false,
          showLspStats: true,
        });
      } else if (id === "report") {
        this.setState({
          showVpnTab: false,
          showDiscoveryTab: false,
          showDeviceList: false,
          showSoftwareUpgrade: false,
          showConfigurationComparator: false,
          showLogs: false,
          openTemplateList: false,
          showThreshold: false,
          showAddDeviceTab: false,
          showTopologyTab: false,
          showStats: false,
          showReportTab: true,
          showLspStats: false,
        });
      } else if (id === "stats") {
        this.setState({
          showVpnTab: false,
          showReportTab: false,
          showDiscoveryTab: false,
          showDeviceList: false,
          showSoftwareUpgrade: false,
          showConfigurationComparator: false,
          showLogs: false,
          openTemplateList: false,
          showThreshold: false,
          showAddDeviceTab: false,
          showTopologyTab: false,
          showStats: true,
          showLspStats: false,
        });
      } else if (id === "vpn") {
        this.setState({
          showVpnTab: true,
          showReportTab: false,
          showDiscoveryTab: false,
          showDeviceList: false,
          showSoftwareUpgrade: false,
          showConfigurationComparator: false,
          showLogs: false,
          openTemplateList: false,
          showThreshold: false,
          showAddDeviceTab: false,
          showTopologyTab: false,
          showStats: false,
          showLspStats: false,
        });
      } else {
        this.setState({
          showVpnTab: false,
          showReportTab: false,
          showDeviceList: false,
          showDiscoveryTab: false,
          showSoftwareUpgrade: false,
          showConfigurationComparator: false,
          showLogs: false,
          openTemplateList: false,
          showThreshold: false,
          showAddDeviceTab: true,
          showTopologyTab: false,
          showStats: false,
          showLspStats: false,
        });
      }
    } else {
      alert("Device list is being fetched");
    }
  }
  
  toggleDarkMode = () => {
    this.setState((prevState) => ({ isDarkMode: !prevState.isDarkMode }));
  };

  handleToggleChange = () => {
    console.log("in")
    this.setState(prevState => ({
      deviceInventory: !prevState.deviceInventory
    }));
  }
  render() {
    const { isDarkMode, allDevices} = this.state;
    const lightTheme = createTheme({
      palette: {
        background: {
          default: "#f4f7fe",
        },
        text: {
          primary: "#333",
        },
      },
    });

    const darkTheme = createTheme({
      palette: {
        background: {
          default: "#222",
        },
        text: {
          primary: "#fff",
        },
      },
    });
    const {
      selectedTabPanel,
      deviceInventory,
    } = this.state;
   
    return (
      <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
        <div
          style={{ height: "100vh" ,overflow:"hidden"}}
          className={isDarkMode ? "dark-mode" : "light-mode"}
        >
          <div
            style={{
              backgroundColor: isDarkMode
                ? darkTheme.palette.background.default
                : lightTheme.palette.background.default,
            }}
          >
            <div style={{ display: "flex" }}>
              <div style={{ flex: "4",width:"100%" }}>
                
                  <NewHeader
                    header_name="Home"
                    path=""
                    darkMode={this.state.isDarkMode}
                    toggleDarkMode={this.toggleDarkMode}
                  />

                <div className="mainContent">
                  {this.state.is_fetching === true ? <Loading /> : null}

                  <div className="networktopbar"
                    style={{backgroundColor: isDarkMode ? darkTheme.palette.background.default: "white", }}>
                    <div
                      className="topelement"
                      style={
                        this.state.showDeviceList ? selectedTabPanel : null
                      }
                      onClick={() => this.showTopTabs("device-list")}
                    >
                      <img
                        width={15}
                        alt=""
                        style={{ marginRight: "3%" }}
                        src={require("../Images/n0.png")}
                      ></img>
                      <div >Inventory</div>
                    </div>
                    <Tooltip title="Software Install">
                      <div
                        className="topelement"
                        style={
                          this.state.showSoftwareUpgrade
                            ? selectedTabPanel
                            : null
                        }
                        onClick={() => this.showTopTabs("software-upgrade")}
                      >
                        <img
                          width={17}
                          alt=""
                          style={{ marginRight: "5%" }}
                          src={require("../Images/n2.png")}
                        ></img>
                        <div className="text" >
                          Software
                        </div>
                      </div>
                    </Tooltip>
                    <Tooltip title="Compare Configuration">
                      <div
                        className="topelement"
                        style={
                          this.state.showConfigurationComparator
                            ? selectedTabPanel
                            : null
                        }
                        onClick={() =>
                          this.showTopTabs("compare-configuration")
                        }
                      >
                        <img
                          width={20}
                          style={{ marginRight: "5%" }}
                          alt=""
                          src={require("../Images/n3.png")}
                        ></img>
                        <div className="text" >
                          Compare
                        </div>
                      </div>
                    </Tooltip>
                    <Tooltip title="View Logs">
                      <div
                        className="topelement"
                        style={this.state.showLogs ? selectedTabPanel : null}
                        onClick={() => this.showTopTabs("logs")}
                      >
                        <img
                          width={15}
                          style={{ marginRight: "5%" }}
                          alt=""
                          src={require("../Images/n4.png")}
                        ></img>
                        <div className="text" >
                          Logs
                        </div>
                      </div>
                    </Tooltip>
                    <Tooltip title="Configuration Templates">
                      <div
                        className="topelement"
                        style={
                          this.state.openTemplateList ? selectedTabPanel : null
                        }
                        onClick={() => this.showTopTabs("templates")}
                      >
                        <img
                          width={15}
                          style={{ marginRight: "5%" }}
                          alt=""
                          src={require("../Images/n5.png")}
                        ></img>
                        <div className="text" >
                          Templates
                        </div>
                      </div>
                    </Tooltip>
                    <Tooltip title="Discovery Tab"><div
                        className="topelement"
                        style={
                          this.state.showDiscoveryTab ? selectedTabPanel : null
                        }
                        onClick={() => this.showTopTabs("discovery")}
                      >
                        <img
                          width={15}
                          style={{ marginRight: "5%" }}
                          alt=""
                          src={discoveryIcon}
                        ></img>
                        <div className="text" >
                          Discovery
                        </div>
                      </div></Tooltip>
                    <Tooltip title="threshold">
                      <div
                        className="topelement"
                        style={
                          this.state.showThreshold ? selectedTabPanel : null
                        }
                        onClick={() => this.showTopTabs("threshold")}
                      >
                        <img
                          width={15}
                          alt=""
                          style={{ marginRight: "5%" }}
                          src={require("../Images/n7.png")}
                        ></img>
                        <div className="text" >
                          Threshold
                        </div>
                      </div>
                    </Tooltip>
                    
                    <Tooltip title="Network Topology">
                      <div
                        className="topelement"
                        style={
                          this.state.showTopologyTab ? selectedTabPanel : null
                        }
                        onClick={() => this.showTopTabs("topology")}
                      >
                        <img
                          width={15}
                          style={{ marginRight: "5%" }}
                          src={topology}
                          alt=""
                        />
                        <div className="text" >
                          Topology
                        </div>
                      </div>
                    </Tooltip>
                    <Tooltip title="VPN">
                      <div
                        className="topelement"
                        style={this.state.showVpnTab ? selectedTabPanel : null}
                        onClick={() => this.showTopTabs("vpn")}
                      >
                        <img
                          width={20}
                          style={{ marginRight: "5%" }}
                          src={vpn}
                          alt=""
                        />
                        <div className="text" >
                          Vpn
                        </div>
                      </div>
                    </Tooltip>
                    <Tooltip title="Lsp Routing">
                      <div className="topelement" style={this.state.showLspStats?selectedTabPanel: null}  onClick={()=>this.showTopTabs('lsp')}><img width={15} style={{marginRight:'5%'}} src={routing} alt=''/><div className='text' style={{fontSize:'small'}}>LSP</div>
                      </div>
                      </Tooltip>
                    <Tooltip title="Customized report">
                      <div
                        className="topelement"
                        style={
                          this.state.showReportTab ? selectedTabPanel : null
                        }
                        onClick={() => this.showTopTabs("report")}
                      >
                        <img
                          width={20}
                          alt=""
                          style={{ marginRight: "3%" }}
                          src={require("../Images/downloadReport.png")}
                        ></img>
                        <div >Report</div>
                      </div>
                    </Tooltip>
                    <Tooltip title="stats">
                      <div
                        className="topelement"
                        style={this.state.showStats ? selectedTabPanel : null}
                        onClick={() => this.showTopTabs("stats")}
                      >
                        <img
                          width={17}
                          alt=""
                          style={{ marginRight: "5%" }}
                          src={require("../Images/n4.png")}
                        ></img>
                        <div className="text" style={{ fontSize: "small"}}>
                          SLA
                        </div>
                      </div>
                    </Tooltip>
                  </div>
               
                  <div style={{height:"70vh",overflowY:"auto",overflowX:"hidden"}}>
                    <div style={{marginTop:"-2%"}}>
                  {this.state.showDeviceList  ? (
                      <div style={{backgroundColor:isDarkMode? darkTheme.palette.background.default: "white",borderRadius:'20px',padding:'1%',paddingTop:"3%"}} >  
                        <Toggle toggled={deviceInventory} onChange={this.handleToggleChange} label={deviceInventory?"Device-list":"White-list"} />
                        {deviceInventory ? (
                          <DeviceListPanel />
                        ) : (
                          <WhitelistPanel />
                        )}
                      </div>
                    
                  ) : null}

                  {this.state.openTemplateList ? <TemplatePannel  routerDetails={this.state.routerDetails}/> : null}

                  {this.state.showSoftwareUpgrade ? (
                    <div
                    style={{
                      backgroundColor: isDarkMode
                        ? darkTheme.palette.background.default
                        : "white",
                      borderRadius: "20px",
                      height:"460px",overflow:"auto"
                    }} 
                    >
                      <SoftwarePanel/>
                    </div>
                  ) : null}

                  {this.state.isLoading === true ? <Loading /> : null}
                  {this.state.show_delete_confirmation_popup ? (
                    <div className="popup_show_delete" style={{ opacity: "2" }}>
                      <div className="delete_network_element_popup">
                        <div className="module_head">
                          Do you want to remove the device?
                        </div>
                        <div className="delete_buttons">
                          <button
                            onClick={() =>
                              this.remove_element_from_network(
                                this.state.item_sites_name,
                                this.state.item_cluster_name
                              )
                            }
                            className="delete_yes"
                          >
                            Apply
                          </button>
                          <button
                            onClick={() =>
                              this.setState({
                                show_delete_confirmation_popup: false,
                              })
                            }
                            className="delete_cancel"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : null}

                  {this.state.showConfigurationComparator ? (
                    <ConfigurationComparator
                      prop1={this.state.allDevices}
                      prop2={this.state.isDarkMode}
                    />
                  ) : null}

                  {this.state.showThreshold ? (
                    <Threshold allDevices={allDevices}/>
                  ) : null}

                  {this.state.showLogs ? (
                    <div
                      style={{
                        backgroundColor: isDarkMode
                          ? darkTheme.palette.background.default
                          : "white",
                        borderRadius: "20px",
                        padding: "2%",
                        paddingTop: "4%",
                        height:"460px",overflow:"auto"
                      }}
                    >
                      <div style={{ display: "flex" }}>
                        <div style={{ color: "#344767", fontWeight: "600" }}>
                          Application Logs:
                        </div>
                      </div>
                      <LogManagementPanel />
                    </div>
                  ) : null}

                  {this.state.showTopologyTab ? (
                    <div
                    style={{
                      backgroundColor: isDarkMode
                        ? darkTheme.palette.background.default
                        : "white",
                      borderRadius: "20px",
                      padding: "2%",
                      paddingTop: "4%",
                      height:"500px",overflow:"auto"
                    }}
                    >
                    <NetworkTopology topologyData={this.state.topologyData} />
                    </div>
                  ) : null}

                  {this.state.showLspStats ? (
                    <div
                      style={{
                        backgroundColor: "white",
                        borderRadius: "20px",
                        padding: "2%",
                        paddingTop: "4%",
                      }}
                    >
                      <div className="lspContent" style={{ display: "flex" }}>
                        <div style={{ color: "#344767", fontWeight: "600" }}>
                          Routing Details :
                        </div>
                      </div>
                      <LspRouting
                        connectedDevices={this.state.allDevices}
                      />
                    </div>
                  ) : null}

                  {this.state.showDiscoveryTab ? (<Discovery/>):null}

                  {this.state.showStats ? (
                    <div
                      style={{
                        backgroundColor: "white",
                        borderRadius: "20px",
                        padding: "2%",
                        paddingTop: "4%",
                      }}
                    >
                      <div className="networkmaincontent">
                      <div style={{ display: "flex" }}>
                        <div style={{ color: "#344767", fontWeight: "600" }}>
                          SLA Performance Stats :
                        </div>
                      </div>
                      </div>
                      <SLAPerformanceStats
                        connectedDevices={this.state.allDevices}
                      />
                    </div>
                  ) : null}

                  {this.state.showReportTab ? (
                    <GlobalReport
                      data={this.state.allDevices}
                      isDarkMode={this.state.isDarkMode}
                    />
                  ) : null}

                  {this.state.showVpnTab ? (
                    <div
                      style={{
                        backgroundColor: isDarkMode
                          ? darkTheme.palette.background.default
                          : "white",
                        borderRadius: "20px",
                        paddingTop: "2%",
                        height:"500px",overflow:"auto"
                      }}
                    >
                      <div style={{ display: "flex" }}></div>
                      <VpnManagement />
                    </div>
                  ) : null}

                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ThemeProvider>
    );
  }
}
export default NetworkPanel;