import React from 'react';
import swal from 'sweetalert2';
import Select from 'react-select';
import 'leaflet/dist/leaflet.css';
import 'react-dropdown/style.css';
import ReactDiffViewer from 'react-diff-viewer';
import CheckboxComponent from '../Components/dynamicMap.jsx';
import 'bootstrap/dist/css/bootstrap.min.css';
import { ThemeProvider, createTheme } from "@mui/material/styles";
import Loading from "../Components/loader";
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import 'react-toastify/dist/ReactToastify.css';
import notify from '../utils/index.js';
import { Button } from '@mui/material';
import axios from 'axios';
import '../css/configuration_comparator.css';
import '../css/network_panel.css';

class ConfigurationComparator extends React.Component{
    constructor(props){
        super(props);
        this.state={
          deviceList : this.props.prop1,
          selectedOption: null,
          query: '',
          selectedDeviceList:[],
          suggestions: [],
          selectedDeviceForCompliance:[],
          selectedDevicesToCompare:[],
          is_fetching:false,inventory:null,
          serverIP:process.env.REACT_APP_CLIENT_IP, 
          isLoading:false,
          showConfigurationComparator:null,templateList:[],connectedDevices:this.props.prop1,compareMulti:false,
          validIPState:false,GoldenTemplateSelectDevice:false,TemplateName:null,checked:[], templateDetails:null,openTemplateList:false,selectedTemplateId:null,
          openTemplateTab:false, TemplateJsonData:null,selectedFile: null,showFileDetails:false, templateUploadResponse:null,errormsgGoldTemp:null,errormsgBulkConfig:null,
          checkedDevices: [], selectedKeyType:null,device_type:null,toEditDeviceType:null,
          supportedYAangs: [
            { key: '/configuration/net-inst', value: 'ipi-network-instance' },
            { key: '/configuration/interface', value: 'ipi-interface' },
            { key: '/fault/bfd', value: 'ipi-bfd' },
            { key: "/configuration/isis", value: "ipi-isis" },
            { key: "/configuration/aaa", value: "ipi-aaa"},
            { key: "/configuration/arp", value: "ipi-arp" },
            { key: "/fault/vrrp", value: "ipi-vrrp"  },
            { key: "/configuration/bgp", value: "ipi-bgp" },
            { key: "/configuration/serv-map", value: "ipi-service-map" },
            { key:  "/configuration/m-serv", value: "ipi-management-server" },
            { key:  "/configuration/l2vpn-vpls", value: "ipi-l2vpn-vpls" },
            { key:  "/fault/cfm", value: "ipi-cfm" },
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
            { key:  "/fault/mrib", value: "ipi-mrib" },
            { key:  "/fault/neighbor-disc", value: "ipi-neighbor-discovery" },
            { key:  "/performance/ospf", value: "ipi-ospf" },
            { key:  "/performance/ospfv3", value: "ipi-ospfv3" },
            { key:  "/performance/ip-sla", value: "ipi-ip-sla" },
            { key:  "/performance/pim", value: "ipi-pim" },
            { key:  "/performance/lb", value: "ipi-lb" },
            { key:  "/performance/lacp", value: "ipi-lacp" },
            { key:  "/performance/twamp", value: "ipi-twamp" },
            { key:  "/performance/pon", value: "ipi-pon" },
            { key:  "/performance/sflow", value: "ipi-sflow" },
            { key:  "/performance/components", value: "ipi-platform" },
            { key:  "/performance/hardware", value: "ipi-platform" },
            { key:  "/performance/profiles", value: "ipi-platform" },
            { key:  "/performance/ptssfp", value: "ipi-platform-transceiver-smart-sfp" },
            { key:  "/performance/ptd", value: "ipi-platform-terminal-device" },
            { key:  "/performance/sflow", value: "ipi-platform" },
            { key:  "/performance/qos", value: "ipi-qos" },
            { key:  "/performance/tfo", value: "ipi-tfo" },
            { key:  "/platform/sys", value: "ipi-system" },
            { key:  "/platform/user", value: "ipi-user-management" },
            { key:  "/platform/usm", value: "ipi-user-session-management" },
            { key:  "/platform/elk", value: "ipi-elk" },
            { key:  "/platform/em", value: "ipi-event-manager" },
            { key:  "/platform/if-ext", value: "ipi-if-extended" },
            { key:  "/platform/g8031", value: "ipi-g8031" },
            { key:  "/platform/global-te", value: "ipi-global-te" },
            { key:  "/platform/keychain", value: "ipi-keychain" },
            { key:  "/security/license", value: "ipi-license" },
            { key:  "/security/ssh", value: "ipi-ssh" },
            { key:  "/security/tacacs", value: "ipi-tacacs" },
            { key:  "/security/telnet", value: "ipi-telnet" },
            { key:  "/security/rbac", value: "ipi-role-based-access-control" },
            { key:  "/security/nsm-arp", value: "ipi-nsm-arp" },
            { key:  "/security/auth", value: "ipi-authentication" },
            { key:  "/security/auth-rad", value: "ipi-authentication-radius" },
            { key:  "/security/radius", value: "ipi-radius" },
            { key:  "/security/ipsec", value: "ipi-ipsec" },

            // Add more options here
          ],
           devices :[
            { id: 1, latitude: 17.3850, longitude: 78.4867, name: 'Device 1: 172.24.30.179' },
            { id: 2, latitude: 25.9644, longitude: 85.2722, name: 'Device 2: 172.24.30.187' },
            { id: 2, latitude: 27.0238, longitude: 74.2179, name: 'Device 3: 172.24.30.200' },
          ], openSelectDeviceList:false,
          generateReport:false,
          deviceId:null,
          isGenerating:false,
          firstRowFirstDropdown: '',
          firstRowSecondDropdown: '',
          secondRowFirstDropdown: '',
          secondRowSecondDropdown: '',
          jsonData: '',jsonData2: '',selectedKey:'', content: null,
          firstType:null,firstContent:null,secondType:null,secondContent:null
        };
        this.handleFirstRowFirstSelectChange = this.handleFirstRowFirstSelectChange.bind(this);
        this.handleFirstRowSecondSelectChange = this.handleFirstRowSecondSelectChange.bind(this);
        this.handleSecondRowFirstSelectChange = this.handleSecondRowFirstSelectChange.bind(this);
        this.handleSecondRowSecondSelectChange = this.handleSecondRowSecondSelectChange.bind(this);
        this.compareJSON = this.compareJSON.bind(this);
        this.handleLoadModule = this.handleLoadModule.bind(this);

    }

      handleFirstRowFirstSelectChange(event) {
        this.setState({
          firstRowFirstDropdown: event.target.value,
          firstRowSecondDropdown: '',
        });
        if(event.target.value==='option1'){
          this.setState({firstType:'unique_id'})
        }
        else if(event.target.value==='option2'){
          this.setState({firstType:'template_name'})
        }
        else{
          this.setState({firstType:'json'})
        }
      }
    
      handleFirstRowSecondSelectChange(event) {
        this.setState({ firstRowSecondDropdown: event.target.value });
        this.setState({firstContent:event.target.value})
      }
    
      handleSecondRowFirstSelectChange(event) {
        this.setState({ secondRowFirstDropdown: event.target.value });
        if(event.target.value==='option1'){
          this.setState({secondType:'unique_id'})
        }
        else if(event.target.value==='option2'){
          this.setState({secondType:'template_name'})
        }
        else{
          this.setState({secondType:'json'})
        }
      }
    
      handleSecondRowSecondSelectChange(event) {      
        this.setState({ secondRowSecondDropdown: event.target.value });
        this.setState({secondContent:event.target.value})
        alert(event.target.value)
      }

      handleselectedDevicesToCompare = (event, item) => {
        const { value, checked } = event.target;
        let updatedList;
        if (value === "selectAll") {
          // If "Select All" checkbox is clicked, select or deselect all devices
          updatedList = checked ? this.state.deviceList : [];
        } else {
          // Otherwise, handle individual device selection
          updatedList = checked
            ? [...this.state.selectedDeviceList, value]
            : this.state.selectedDeviceList.filter(device => device !== value);
        }
      
        this.setState({ selectedDeviceList: updatedList });
      }

      handleFileChange = (event) => {   
        const file = event.target.files[0];
        const reader = new FileReader();
    
        reader.onload = (e) => {
          try {
            const parsedData = JSON.parse(e.target.result);
            // this.setState({ jsonData: e.target.result });
            this.setState({firstContent:parsedData})
          } catch (error) {
            console.error('Error parsing JSON file:', error);
          }
        };
    
        reader.readAsText(file);
      };

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
        if (action === 'select-option' && selectedOption) { 
          const selectedKey = selectedOption.key;
          this.setState({ selectedOption, selectedKey });
          if (this.state.yangSchema !== undefined) {
            this.setState({ yangSchema: {} });
          }
        }
      };


      compareJSON(firstType,firstContent,secondType,secondContent){
        if(firstType && firstContent && secondType && secondContent){
          this.setState({is_fetching:true,notSelected:false})
          var dict = {
            'first-type': firstType,
            'first-content': firstContent,
            'second-type': secondType,
            'second-content': secondContent
          }
          fetch(`http://${this.state.serverIP}:5000/configuration-management/generic-json-compare`,
            {
                mode:'cors',
                method:'POST',
                headers:{'Access-Control-Allow-Origin':'http://localhost:3000',
                'Accept':'application/json', 
                'Content-Type':'application/json' ,
                'username': sessionStorage.getItem('username'),
                'Authorization': 'Bearer ' + JSON.parse(sessionStorage.getItem('login_data')).data.access_token,
                 },
                 body: JSON.stringify(dict)                    
                })
            .then(resp=>resp.json())
            .then(resp=>{
              this.setState({is_fetching:false})

                if(resp.status==='API failed'){
                  swal.fire({
                    title:resp.status,
                    text:resp.message,
                    width: 300,
                    height: 40,
                    color: 'red',
                    icon: 'failure',
                })
                }
                else{
                  this.setState({compareTable:resp,jsonData:JSON.stringify(resp['1st json'], null, 2),jsonData2:JSON.stringify(resp['2nd json'], null, 2)})
                }
          })
          .catch((err) => {
            if (err.response) {
              alert(err.response.data.status)
            }
          });  
        }
        else{
          this.setState({notSelected:true})
        }
        
      }

      handleLoadModule(){
        const { selectedOption, selectedKey} = this.state;
        if (selectedOption) {
          this.setState({ isLoading: true });
          this.fetchYangContent(selectedKey, selectedOption.value);
          setTimeout(() => {
            const fetchedContent = `Content for ${selectedOption.value}`;
            this.setState({content: fetchedContent });
          }, 2000);
        }
      };
     
      async fetchSchema(key) {
        const {uniqueId}=this.state;
        const schemaModule = await import(`../csar-schemas/${key}.json`); 
        const schema = schemaModule.default;
        this.setState({ isLoading: false });
        this.setState({ yangSchema: schema });
      }
      
      fetchYangContent(key, name) {
        this.fetchSchema(name);
      }

      handleCheckboxChange = (event,item) => {
        this.setState({selectedDeviceList:this.state.imageList[item]})
        const {checked } = event.target;
        if (checked) {
          this.setState((prevState) => ({
            checkedDevices: [...prevState.checkedDevices, item],
          }));
        }
      };

      fetchTemplateList(){
        fetch(`http://${this.state.serverIP}:5000/configuration-management/configuration-templates-list`,
        {
          mode:'cors',
          method:'GET',
          headers:{'Access-Control-Allow-Origin':'http://localhost:3000',
          'username': sessionStorage.getItem('username'),
          'Authorization': 'Bearer ' + JSON.parse(sessionStorage.getItem('login_data')).data.access_token,
           },
        })
        .then(resp=>resp.json())
        .then(resp=>{
          if(resp.length>=1){
            this.setState({templateList:resp})
            var temp = []
            for(let i=0;i<resp.length;i++){
              temp.push(resp[i].template_name)
            }
            this.setState({templateList:temp})
          }
         
        })
        .catch((err) => {
          if (err.response) {
            alert(err.response.data.status)
          }
        });  
      }

      componentDidMount()
      {
        const {supportedYAangs} = this.state;
        this.setState({suggestions: supportedYAangs.map(module => ({
          key: module.key,
          value: module.value,
          label: module.value
        }))})
        this.fetchTemplateList();
      }

      handleDeviceListForCompliance(option) {
        if (option === "select") {
          const allOperationsSelected = this.state.selectedDeviceForCompliance.length === this.state.connectedDevices.length;
          if (allOperationsSelected) {
              // Deselect all interfaces
              this.setState({ selectedDeviceForCompliance: [] });
          } else {
              // Select all interfaces
              this.setState({ selectedDeviceForCompliance: [...this.state.connectedDevices],secondRowSecondDropdown:option });
          }
        } else{
            const selectedDeviceForCompliance = [...this.state.selectedDeviceForCompliance];
            const index = selectedDeviceForCompliance.indexOf(option);
            if (index === -1) {
                selectedDeviceForCompliance.push(option);
            } else {
                selectedDeviceForCompliance.splice(index, 1);
            }
            this.setState({ selectedDeviceForCompliance });
          }
      }
       
      generateComplianceReport(id){
        const {selectedDeviceForCompliance}=this.state;
        this.setState({is_fetching:true})
        const temp={"unique_ids":selectedDeviceForCompliance}
        fetch(`http://${this.state.serverIP}:5000/configuration-management/initiate-bulk-compliance/${id}`,
            {
                mode:'cors',
                method:'POST',
                headers:{'Access-Control-Allow-Origin':'http://localhost:3000',
                'Accept':'application/json', 
                'Content-Type':'application/json' ,
                'username': sessionStorage.getItem('username'),
                'Authorization': 'Bearer ' + JSON.parse(sessionStorage.getItem('login_data')).data.access_token,
                 },
                 body: JSON.stringify(temp)                    
                })
            .then(resp=>resp.json())
            .then(resp=>{
              notify(resp.status,'info')
              this.setState({is_fetching:false})
          })
          .catch((err) => {
            if (err.response) {
              alert(err.response.data.status)
            }
          });
      }

      fetchBulkStatus = async() =>{
      try{
      const res = await axios.get(`http://${this.state.serverIP}:5000/configuration-management/bulk-operation-status`)
      notify(res?.data?.status,"info");
      }catch(err){
        notify(err.toString(),'warning')
      }
      }
      
      render(){	
      const { isDarkMode } = this.props.prop2;
      const lightTheme = createTheme({
        palette: {
          background: {
            default: '#f4f7fe', 
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
      const {
          supportedYAangs,firstRowFirstDropdown, selectedOption,firstRowSecondDropdown, secondRowFirstDropdown, secondRowSecondDropdown,isLoading,content,
          templateList,connectedDevices,suggestions,selectedDeviceList,deviceList
        } = this.state;

        return(
            <div style={{backgroundColor: this.props.prop2===true ? darkTheme.palette.background.default : "white" ,borderRadius:'20px',padding:'2%',paddingTop:'4%'}}>
              <div  className="main">
                <div style={{ color: '#344767', fontWeight: '600', }}>Configuration Comparator</div>
                <div
                  className='tabbox'
                  onClick={(e) => this.setState(this.state.compareMulti?({ compareMulti: false}):({ compareMulti: true}))}
                >
                  <img alt="" className='tabicon' src={require('../Images/compareb.png')}></img>
                  {this.state.compareMulti?('Compare Multiple Types'):('Parameter Filtered Multiple Device Comparator')}
                </div>
              </div>
              {!this.state.compareMulti?(
                <div>
                  <div style={{ marginTop: '2%' }}>
                    <label htmlFor="firstRowFirstDropdown" style={{fontSize:'small'}}>Select Configuration type to Compare:</label>
                    <div style={{display:"flex",justifyContent:"space-between",width:"40%"}}>
                      <select
                        className='compare-dropdowns configurationDropdown'
                        id="firstRowFirstDropdown"
                        value={firstRowFirstDropdown}
                        onChange={this.handleFirstRowFirstSelectChange}
                      >
                        <option value="">Select</option>
                        <option value="option1">Devices</option>
                        <option value="option2">Saved Templates</option>
                        <option value="option3">Upload JSON</option>
                      </select>
                      <div>vs</div>
                      <select
                        className='compare-dropdowns configurationDropdown'
                        id="secondRowFirstDropdown"
                        value={secondRowFirstDropdown}
                        onChange={this.handleSecondRowFirstSelectChange}
                      >
                        <option value="">Select</option>
                        <option value="option1">Devices</option>
                        <option value="option2">Saved Templates</option>
                        <option value="option3">Upload JSON</option>
                      </select>
                    </div>
                  </div>

                  {connectedDevices ? (
                    <div>
                                       <div style={{ marginTop: '2%' }}>
                    <label htmlFor="secondRowFirstDropdown" style={{fontSize:'small'}}>Select</label>
                    <div style={{display:"flex",justifyContent:"space-between",width:"40%"}}>
                          {firstRowFirstDropdown === 'option3' ? (
                            <input style={{marginRight:'3%'}} type="file" onChange={this.handleFileChange} />
                          ):
                          <select
                          className='compare-dropdowns configurationDropdown'
                              id="firstRowSecondDropdown"
                              value={firstRowSecondDropdown}
                              onChange={this.handleFirstRowSecondSelectChange}
                            >
                              <option value="">Select</option>
                              {firstRowFirstDropdown === 'option1' && (
                                <>
                                {connectedDevices.map((item)=>(
                                    <option value={item}>{item}</option>
                                  ))}
                                </>
                              )}
                              {firstRowFirstDropdown === 'option2' && (
                                <>
                                {templateList.map((item)=>(
                                    <option value={item}>{item}</option>
                                  ))}
                                </>
                              )}
                          </select>
                          }
                          <div >vs</div>
                          <div>
                            {firstRowSecondDropdown==="Golden template" && secondRowFirstDropdown === 'option1'?(
                              <DropdownButton
                                id="operations-dropdown"
                                style={{ marginLeft: "5%"}}
                                title={"Choose device"}
                                drop="down"
                                className="custom-dropdown"
                                >
                                  <Dropdown.Item key={0}  style={{ fontSize: "small" }}>
                                      <div key={"select"} style={{ display: 'flex', alignItems: 'center'}} onClick={(e) => e.stopPropagation()}>
                                          <div style={{ marginRight: '10px' }}>Select All</div>
                                          <input
                                            type="checkbox"
                                            value={"select"}
                                            checked={this.state.selectedDeviceForCompliance.length === this.state.connectedDevices.length}
                                            onChange={(e) => {
                                              this.handleDeviceListForCompliance(e.target.value);
                                            }}
                                          />
                                      </div>
                                  </Dropdown.Item> 
                                {connectedDevices.map((device, index) => (
                                    <Dropdown.Item key={index} eventKey={device} style={{ fontSize: "small" }}>
                                        <div key={device} style={{ display: 'flex', alignItems: 'center'}} onClick={(e) => e.stopPropagation()}>
                                            <div style={{ marginRight: '10px' }}>{device}</div>
                                            <input
                                              type="checkbox"
                                              value={device}
                                              checked={this.state.selectedDeviceForCompliance.includes(device)}
                                              onChange={(e) => {
                                                this.handleDeviceListForCompliance(e.target.value);
                                              }}
                                            />
                                        </div>
                                    </Dropdown.Item>
                                ))}
                              </DropdownButton>

                            ):(
                              <div>
                                {secondRowFirstDropdown === 'option3' ? (
                                  <input style={{marginRight:'3%'}} type="file" onChange={this.handleFileChange1} />
                                ) : (
                                  <select
                                  className='compare-dropdowns configurationDropdown'
                                    id="secondRowSecondDropdown"
                                    value={secondRowSecondDropdown}
                                    onChange={this.handleSecondRowSecondSelectChange}
                                  >
                                    <option value="">Select</option>
                                    {secondRowFirstDropdown === 'option1' && (
                                      <>
                                      {connectedDevices.map((item)=>(
                                        <option value={item}>{item}</option>
                                      ))}
                                      </>
                                    )}
                                    {secondRowFirstDropdown === 'option2' && (
                                      <>
                                      {templateList.map((item)=>(
                                        <option value={item}>{item}</option>
                                      ))}
                                      </>
                                    )}
                                  </select>
                                )}
                              </div>
                            )}
                            
                          </div>
                      </div>
                      
                      {firstRowSecondDropdown==="Golden template" && secondRowFirstDropdown === 'option1'?(
                        <div className='btn btn-primary mb-3' style={{borderRadius:"3px",marginTop:'2%'}}
                            onClick={()=>this.generateComplianceReport(firstRowSecondDropdown)}>
                          generate compliance report
                        </div>
                      ):(
                        <div className='btn btn-primary mb-3' style={{borderRadius:"3px", marginTop:'2%'}}
                          onClick={()=>this.compareJSON(this.state.firstType,this.state.firstContent,this.state.secondType,this.state.secondContent)}>
                          Compare
                        </div>
                      )}
                      {
                        firstRowSecondDropdown==='Golden template' && this.state.secondRowSecondDropdown==='select'&&
                        <Button variant='outlined' 
                        style={{margin:'2% 0 0 0',borderRadius:'2px', color:'#004f68', border:'1px solid #004f68'}} 
                        onClick={this.fetchBulkStatus}
                        >check status </Button>
                      }
                      
                      <span className='alert_message'>{this.state.notSelected?'*Select all the fields first':null}</span>
                    </div>
                    </div>
                  ):null}

                  {this.state.jsonData!=='' && this.state.jsonData2!==''?(
                  <div style={{marginTop:'2%'}}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <h6 style={{ marginTop: '1%' }}>Differences</h6>
                    <div
                      className='tabbox'
                      style={this.state.showAlarm ? { color: '#004f68', fontWeight: 'bold' } : null}
                      onClick={(e) => this.setState(this.state.openCompareTable?({ openCompareTable: false}):({ openCompareTable: true}))}
                    >
                      <img alt="" className='tabicon' src={require('../Images/alarmList.png')}></img>
                      {this.state.openCompareTable?('View in JSON form'):('View in Tabular Form')}
                    </div>
                  </div>
                  {!this.state.openCompareTable?(
                    <div className='react-diff-viewer'>
                    <ReactDiffViewer
                      oldValue={this.state.jsonData}
                      newValue={this.state.jsonData2}
                      splitView={true}
                      useDarkTheme={true}
                    />
                    </div>
                  ):null}
                  </div>
                  ):null}

                  {this.state.openCompareTable && this.state.compareTable ? (
                  <div style={{marginTop:'2%'}}>
                  <div className='header'>Differences (in Tabular Format)</div>
                    <table className='user_table'>
                      <thead  id='panels'  className='user_table_head'>
                        <tr style={{backgroundColor:'#e5e8ff',color:'black'}}>
                          <th className='th'>Key</th>
                          <th className='th'>{typeof this.state.firstContent !='object'?(this.state.firstContent):('JSON-1')}</th>
                          <th className='th'>{typeof this.state.secondContent !='object'?(this.state.secondContent):('JSON-2')}</th>
                        </tr>
                      </thead>
                      <tbody  id='panels'>
                      {Object.keys(this.state.compareTable['compared-data']['different-values']).map((key, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'even-row tr' : 'odd-row tr'}>
                          <td >{key}</td>
                          <td >
                          {typeof this.state.compareTable['compared-data']['different-values'][key][0][0] === 'object' &&
                              Array.isArray(this.state.compareTable['compared-data']['different-values'][key][0])
                              ? JSON.stringify(this.state.compareTable['compared-data']['different-values'][key][0])
                                : JSON.stringify(this.state.compareTable['compared-data']['different-values'][key][0])}
                          </td>
                          <td >
                          {typeof this.state.compareTable['compared-data']['different-values'][key][0][1] === 'object' &&
                              Array.isArray(this.state.compareTable['compared-data']['different-values'][key][1])
                              ? JSON.stringify(this.state.compareTable['compared-data']['different-values'][key][1])
                                : JSON.stringify(this.state.compareTable['compared-data']['different-values'][key][1])}
                          </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className='header' style={{marginTop:'2%'}}>Present in {typeof this.state.firstContent !='object'?(this.state.firstContent):('JSON-1')} only</div>
                    <table className='user_table'>
                    <thead  id='panels' className='user_table_head'>
                        <tr style={{backgroundColor:'#e5e8ff',color:'black'}}>
                          <th className='th'>Key</th>
                          <th className='th'>{typeof this.state.firstContent !='object'?(this.state.firstContent):('JSON-1')}</th>
                        </tr>
                      </thead>
                      <tbody  id='panels'>
                      {Object.keys(this.state.compareTable['compared-data']['only-in-first']).map((key, index) => (
                        <tr key={index} className={index % 2 === 0 ? 'even-row tr' : 'odd-row tr'}>
                          <td>{key}</td>
                          <td >
                          {typeof this.state.compareTable['compared-data']['only-in-first'][key] === 'object' &&
                              Array.isArray(this.state.compareTable['compared-data']['only-in-first'][key])
                                ? JSON.stringify(this.state.compareTable['compared-data']['only-in-first'][key][0])
                                : JSON.stringify(this.state.compareTable['compared-data']['only-in-first'][key])}
                          </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className='header' style={{marginTop:'2%'}}>Present in {typeof this.state.secondContent !='object'?(this.state.secondContent):('JSON-2')} only</div>
                    <table className='user_table'>
                    <thead  id='panels' className='user_table_head'>
                        <tr style={{backgroundColor:'#e5e8ff',color:'black'}}>
                          <th className='th'>Key</th>
                          <th className='th'>{typeof this.state.secondContent !='object'?(this.state.secondContent):('JSON-2')}</th>
                        </tr>
                      </thead>
                      <tbody  id='panels'>
                      {Object.keys(this.state.compareTable['compared-data']['only-in-second']).map((key, index) => (
                        <tr key={index} className={index % 2 === 0 ? 'even-row tr' : 'odd-row tr'}>
                          <td >{key}</td>
                          <td>
                          {typeof this.state.compareTable['compared-data']['only-in-second'][key] === 'object' &&
                              Array.isArray(this.state.compareTable['compared-data']['only-in-second'][key])
                                ? JSON.stringify(this.state.compareTable['compared-data']['only-in-second'][key][0])
                                : JSON.stringify(this.state.compareTable['compared-data']['only-in-second'][key])}
                          </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  ): null}
                </div>
              ):(
                <div style={{display:'flex'}} >
                    {this.state.connectedDevices?(
                      <div className='deviceListCheckbox' style={{width:"290px",maxHeight:"342px"}} >
                        <table className='user_table'>
                            <thead className='user_table_head'> 
                              <tr style={{backgroundColor:'#e5e8ff',color:'black'}}>
                                <th>Device Name</th>
                                <th></th>                                   
                              </tr>                
                            </thead>
                            <tbody>
                              <tr>
                                <td style={{display:"flex"}}>
                                  <div style={{paddingLeft:"6.5rem"}}>Select All</div>
                                </td>
                                <td>
                                  <input
                                      type="checkbox"
                                      id="selectAll"
                                      name="selectAll"
                                      value="selectAll"
                                      onChange={(e) => this.handleselectedDevicesToCompare(e)}
                                      checked={this.state.selectedDeviceList.length === this.state.deviceList.length}
                                  />
                                </td>
                              </tr>                         
                              {this.state.deviceList.map((item, index) => (
                              <tr key={index}>
                                  <td>{item}</td>
                                  <td>
                                      <label style={{display:'flex'}} htmlFor={item} className='checkboxes'>
                                        <input
                                          type="checkbox"
                                          id={item}
                                          name={item}
                                          value={item}
                                          onChange={(e) => this.handleselectedDevicesToCompare(e, item)}
                                          checked={this.state.selectedDeviceList.includes(item)}
                                        />                                                
                                      </label>
                                  </td>                                       
                              </tr>
                              ))}
                            </tbody>
                        </table>
                      </div>
                    ):null}
                  <div className="cardfour2"  style={{backgroundColor: this.props.prop2===true ? darkTheme.palette.background.default : "white",width:"75%",marginLeft:"2%",height:"380px",padding:"1.5%"}}>
                      <div className='yang-module-loader'>
                        <div>
                        <Select
                          value={selectedOption}
                          onChange={this.handleSelectedOptionChange}
                          onInputChange={this.handleQueryChange}
                          options={suggestions}
                          isSearchable
                          placeholder="Search..."
                        />
                        </div>
                        <div style={{marginLeft:"80px"}}><button style={{padding: "8px", borderRadius: "4px"}} onClick={()=>this.handleLoadModule()} className='btn btn-primary mb-3' >load module</button></div>
                      </div>
                    {content && 
                      <CheckboxComponent selectedKey={this.state.selectedKey} deviceList={this.state.selectedDeviceList} schema={this.state.yangSchema} />
                    }
                  </div>
                  
                </div>
              )}
              {this.state.isLoading === true? <Loading/> : null}
            </div>
        )
      } 
}
export default ConfigurationComparator;