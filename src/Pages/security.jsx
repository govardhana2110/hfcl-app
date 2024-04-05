import React from "react";
import DynamicMapper from "../Components/mapSchema";
import NewHeader from "../Components/header";
import NewLeftpanel from "../Components/leftPanel";
import backButton from "../Images/back.png";
import { cloneDeep } from "lodash";
import Loading from '../Components/loader';
import { ThemeProvider, createTheme } from "@mui/material/styles";
import Select from 'react-select';

class SecurityPanel extends React.Component{
    constructor(props){
        super(props);
        this.state={
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
            { key: '/configuration/net-inst', value: 'ipi-network-instance' },
            { key: '/configuration/interface', value: 'ipi-interface' },
            { key: '/configuration/bfd', value: 'ipi-bfd' },
            { key: "/configuration/isis", value: "ipi-isis" },
            { key: "/configuration/aaa", value: "ipi-aaa"},
            { key: "/configuration/arp", value: "ipi-arp" },
            { key: "/configuration/vrrp", value: "ipi-vrrp"  },
            { key: "/configuration/bgp", value: "ipi-bgp" },
            { key: "/configuration/serv-map", value: "ipi-service-map" },
            { key:  "/configuration/m-serv", value: "ipi-management-server" },
            { key:  "/configuration/l2vpn-vpls", value: "ipi-l2vpn-vpls" },
            { key:  "/configuration/cfm", value: "ipi-cfm" },
            { key:  "/configuration/logging", value: "ipi-logging" },
            { key:  "/configuration/lldpv2", value: "ipi-lldpv2" },
            { key:  "/configuration/mlag", value: "ipi-mlag" },
            { key:  "/configuration/mpls", value: "ipi-mlag" },
            { key:  "/configuration/evpn-mpls", value: "ipi-evpn-mpls" },
            { key:  "/configuration/ldp", value: "ipi-ldp" },
            { key:  "/configuration/ptp", value: "ipi-ptp" },
            { key:  "/configuration/synce", value: "ipi-synce" },
            { key:  "/configuration/ntp", value: "ipi-ntp" },
            { key:  "/configuration/dns-relay", value: "ipi-dns-relay" },
            { key:  "/configuration/dns-client", value: "ipi-dns-client" },
            { key:  "/configuration/igmp", value: "ipi-igmp" },
            { key:  "/configuration/snmp", value: "ipi-snmp" },
            { key:  "/configuration/l2vpn-vpws", value: "ipi-l2vpn-vpws" },
            { key:  "/configuration/mcec", value: "ipi-mcec" },
            { key:  "/configuration/rib", value: "ipi-rib" },
            { key:  "/configuration/rsvp", value: "ipi-rsvp" },
            { key:  "/configuration/mrib", value: "ipi-mrib" },
            { key:  "/configuration/neighbor-disc", value: "ipi-neighbor-discovery" },
            { key:  "/configuration/ospf", value: "ipi-ospf" },
            { key:  "/configuration/ospfv3", value: "ipi-ospfv3" },
            { key:  "/configuration/ip-sla", value: "ipi-ip-sla" },
            { key:  "/configuration/pim", value: "ipi-pim" },
            { key:  "/configuration/lb", value: "ipi-lb" },
            { key:  "/configuration/lacp", value: "ipi-lacp" },
            { key:  "/configuration/twamp", value: "ipi-twamp" },
            { key:  "/configuration/pon", value: "ipi-pon" },
            { key:  "/configuration/sflow", value: "ipi-sflow" },
            { key:  "/configuration/components", value: "ipi-configuration" },
            { key:  "/configuration/hardware", value: "ipi-configuration" },
            { key:  "/configuration/profiles", value: "ipi-configuration" },
            { key:  "/configuration/ptssfp", value: "ipi-configuration-transceiver-smart-sfp" },
            { key:  "/configuration/ptd", value: "ipi-configuration-terminal-device" },
            { key:  "/configuration/sflow", value: "ipi-configuration" },
            { key:  "/configuration/qos", value: "ipi-qos" },
            { key:  "/configuration/tfo", value: "ipi-tfo" },
            { key:  "/configuration/sys", value: "ipi-system" },
            { key:  "/configuration/user", value: "ipi-user-management" },
            { key:  "/configuration/usm", value: "ipi-user-session-management" },
            { key:  "/configuration/elk", value: "ipi-elk" },
            { key:  "/configuration/em", value: "ipi-event-manager" },
            { key:  "/configuration/if-ext", value: "ipi-if-extended" },
            { key:  "/configuration/g8031", value: "ipi-g8031" },
            { key:  "/configuration/global-te", value: "ipi-global-te" },
            { key:  "/configuration/keychain", value: "ipi-keychain" },
            { key:  "/configuration/license", value: "ipi-license" },
            { key:  "/configuration/ssh", value: "ipi-ssh" },
            { key:  "/configuration/tacacs", value: "ipi-tacacs" },
            { key:  "/configuration/telnet", value: "ipi-telnet" },
            { key:  "/configuration/rbac", value: "ipi-role-based-access-control" },
            { key:  "/configuration/nsm-arp", value: "ipi-nsm-arp" },
            { key:  "/configuration/auth", value: "ipi-authentication" },
            { key:  "/configuration/auth-rad", value: "ipi-authentication-radius" },
            { key:  "/configuration/radius", value: "ipi-radius" },
            { key:  "/configuration/ipsec", value: "ipi-ipsec" },

            // Add more options here
          ],
          suggestions:[],
        };
      
    }
    componentDidMount(){
      const {supportedYAangs} = this.state;
        this.setState({suggestions: supportedYAangs.map(module => ({
          key: module.key,
          value: module.value,
          label: module.value
        }))})
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
        this.fetchSchema(name);
        this.setState({
          is_fetching: true,
          getConfigYangData: null,
          KeyYang: key,
          moduleContent: null,
        });
        let device_unique_id = sessionStorage.getItem("unique_id");
        this.setState({ UniqueId: device_unique_id });
          fetch(
            `http://${this.state.serverIP}:5000/configuration-management${key}/${device_unique_id}`,
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
                resp
              );
              var data3 = this.updateDataWithMissingFields(
                this.state.yangSchema,
                originalData
              );
              this.setState({ originalData: data3 });
              console.log(data2, "chatgpt");
              this.setState({ getConfigYangData: data2 });
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
      }
      updateDataWithMissingFields(schema, fetchedData) {
        let data = cloneDeep(fetchedData);
        function traverseSchema(schemaObj, dataObj, parentPath = "") {
          const { properties, type } = schemaObj;
          if (type !== "object" || !properties) {
            return;
          }
    
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
        return data;
      } 

      handleQueryChange = (newValue) => {
        const { supportedYAangs } = this.state;
      console.log(newValue);
        if (newValue.trim() === '') {
          // If input is empty, reset suggestions to all available options
          this.setState({
            query: newValue,
            suggestions: supportedYAangs.map(module => ({
              key: module.key,
              value: module.value,
              label: module.value
            }))
          });
        } else {
          // Filter suggestions based on input
          const filteredSuggestions = supportedYAangs
            .filter((module) => module.value.toLowerCase().includes(newValue.toLowerCase()))
            .map((module) => ({
              key: module.key,
              value: module.value,
              label: module.value
            }));
      
          // Update suggestions based on the filtered results
          this.setState({ query: newValue, suggestions: filteredSuggestions });
        }
      };
    
      handleSelectedOptionChange = (selectedOption, { action }) => {
        this.setState({getConfigYangData:null},()=>{
          if (action === 'select-option' && selectedOption) { 
            const selectedKey = selectedOption.key;
            this.setState({ selectedOption, selectedKey });
            if (this.state.yangSchema !== undefined) {
              this.setState({ yangSchema: {} });
            }
          }
        })
        
      };
      handleLoadModule(){
        const { selectedOption, selectedKey} = this.state;
        console.log(selectedOption,selectedKey);
        this.fetchYangContent(selectedKey, selectedOption.value);
      };

      toggleDarkMode = () => {
        console.log("innetw")
        this.setState((prevState) => ({ isDarkMode: !prevState.isDarkMode }));
      };
      
    render(){
      const { isDarkMode ,selectedOption ,suggestions} = this.state;
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
              <NewLeftpanel page='configuration' darkMode={this.state.isDarkMode}/>
              <div style={{flex:'4',marginLeft:"18%"}}>
                  <div  style={{backgroundColor: isDarkMode ? darkTheme.palette.background.default : lightTheme.palette.background.default}}>
                      <NewHeader header_name='configuration Panel' path='Config' darkMode={this.state.isDarkMode} toggleDarkMode={this.toggleDarkMode}/>
                  </div>
                  
                  <div className='mainContent'>
                    <div style={{display:"flex",gap:"1%"}}>
                      <div style={{width:"30%"}}><Select
                        value={selectedOption}
                        onChange={this.handleSelectedOptionChange}
                        onInputChange={this.handleQueryChange}
                        options={suggestions}
                        isSearchable
                        placeholder="Search..."
                      /></div>
                      <button style={{padding: "8px", borderRadius: "4px"}} onClick={()=>this.handleLoadModule()} className='btn btn-primary mb-3' >load module</button>
                    </div>

                    {this.state.getConfigYangData ? (
                        <DynamicMapper
                            schema={this.state.yangSchema}
                            data={this.state.getConfigYangData}
                            originalData={this.state.originalData}
                            KeyYang={this.state.KeyYang}
                            role={this.state.role}
                        />
                    ) : null}
                  </div>  
              </div>
            </div>
            </div>
        </div>
       </ThemeProvider>

        )
    }
}
export default SecurityPanel;