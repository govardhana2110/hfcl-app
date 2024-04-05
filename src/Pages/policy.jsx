import React from 'react';
import NewHeader from '../Components/header';
import backTab from '../Images/backTabPolicy.png';
import addTrigger from '../Images/addNewTrigger.png';
import { Tabs, Tab } from 'react-bootstrap'; // Assuming you are using Bootstrap
import Dropdown from 'react-bootstrap/Dropdown';
import Tooltip from '@mui/material/Tooltip';
import TextField from '@mui/material/TextField';
import clearExpression from '../Images/closeS.png';
import jsonData from  '../Components/ipiActionBody.json';
import downArrow from '../Images/dropDown.png';
import Swal from 'sweetalert2';
import ListOfRules from '../Components/showRules';
import Scheduler from "material-ui-cron";
import '../css/policy.css';


class PolicyRule extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      serverIP: process.env.REACT_APP_CLIENT_IP,
      selectedTriggerType: '',
      selectedOption: '',
      selectedTriggerOptionValues: null,
      selectedTriggerOption: '',
      showTriggerName:[],
      deviceTypes:["CSAR","CUAR","DUAR"],
      interfaceList:["ge1","ge2","ge3","ge4","ge5","ge6","ge7","ge8","xe23","xe25","xe27","xe29"],
      triggerOptions: ["interface_parameter","component_parameter", "notification", "schedule", "connection", "user"],
      
      NotifOptions: ["fan-status-alarm", "alarm", "fan-status-alarm-recovery", "sysSessionEnd", "sysSessionStart", "transceiver-inserted", "interface-link-state-change-notification",
        "rx-loss-of-signal", "transceiver-removed", "rx-loss-of-signal-recovery", "sys-update-download-status", "cpu-load-1min-critical", "ospfv2-interface-link-state-change"],

      interfaceOptions: ["name", "tx_throughput", "tx_packet_rate", "rx_throughput", "rx_packet_rate", "bandwidth_utilization", "bad_crc", "undersize",
        "oversize", "fragments", "jabbers", "in_errors", "out_errors", "in_discards", "out_discards", "in_octets", "out_octets", "in_packets",
        "out_packets", "in_unicast_pkts", "in_broadcast_pkts", "in_multicast_pkts", "out_unicast_pkts", "out_broadcast_pkts", "out_multicast_pkts",],
        
      componentOptions:[  'CPU','FAN-1/1','FAN-2/1','FAN-3/1','FAN-4/1','HARD-DISK','RAM','TEMPERATURE-BCM Chip','TEMPERATURE-Intel CPU Core ID 0','TEMPERATURE-Intel CPU Core ID 10',
        'TEMPERATURE-Intel CPU Core ID 12','TEMPERATURE-Intel CPU Core ID 14','TEMPERATURE-Intel CPU Core ID 2','TEMPERATURE-Intel CPU Core ID 4','TEMPERATURE-Intel CPU Core ID 6', 'TEMPERATURE-Intel CPU Core ID 8',
        'TEMPERATURE-TMP451 Local Sensor','TEMPERATURE-TMP451 Remote Sensor','TEMPERATURE-TMP75A Sensor-1','TEMPERATURE-TMP75A Sensor-2','TEMPERATURE-TMP75A Sensor-3'  
        
      ],
      user:["upload-license-file","delete-license-file","reset-password","add-user","delete-user","update-user","logout","login"],
      connection:[true,false],
        component_params:{
          "HARD-DISK":["available", "utilized"],
          "RAM":["available", "utilized"],
          "CPU":["cpu-utilization"],
          "FAN":["rpm"],
          "TEMPERATURE":["instant", "min", "max", "avg"],
          },

      triggerRows: [],
      logicalExpression: '',
      selectedTriggers: [],
      logicalOperator: 'AND',

      mapping :{
        "connect": "CONFIG_URL/connect&&POST",
        "disconnect":" CONFIG_URL/disconnect&&delete",
        "save-config-as-template": "CONFIG_URL/save-config-as-template&&POST", 
        "delete-config-template": "CONFIG_URL/delete-config-template&&DELETE", 
        "save-version-manually": "CONFIG_URL/save-version-manually&&POST",
        "delete-version": "CONFIG_URL/delete-version&&DELETE",
        "apply-version":  "CONFIG_URL/delete-version&&DELETE",
        },
      actionList:jsonData,
      selectedAction:null,
      ruleName:"",showNewRuleName:false,
      thenSections: [],
      deviceList:null,
      selectedDevices:[],
      cronExp: "0 0 * * *",
      cronError: "",
      isAdmin: true,
      totalRules:null,
    };
  } 
 
  componentDidMount(){
    this.getDeviceList();
    this.numOfRules();
  }

  numOfRules(){
    fetch(`http://${this.state.serverIP}:5007/rule-engine/rules`, {                     
      method: 'GET', 
      mode: 'cors',  
      headers:{'Access-Control-Allow-Origin':'http://localhost:3000',  
                'Accept':'application/json', 
                'Content-Type':'application/json',
                'username': sessionStorage.getItem('username'),
                //   'Authorization': 'Bearer ' + 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTY2Njc2NzE3NSwianRpIjoiODFkOTNiMGEtNDQwMS00ZDIyLWIzYmItOGM0NmZkZDBjODJiIiwidHlwZSI6ImFjY2VzcyIsInN1YiI6ImFkbWluXzEyMyIsIm5iZiI6MTY2Njc2NzE3NSwiZXhwIjoxNjY5MzU5MTc1fQ.bPHBU62WQd-2Z4cmDkEYaL-198KTSmp6w1A49i4U3a4',
            }, 
      })
      .then(resp=>resp.json())
      .then(resp=>{this.setState({getRules:resp})
      ;
      console.log(resp,'rule-response');
      if(resp.status){
        this.setState({totalRules:0})
      }
      else{
        this.setState({totalRules:Object.keys(resp).length})
      }
    })
  }

  getDeviceList(){
    fetch(`http://${this.state.serverIP}:5005/inventory-management/device-list`,
    {
        mode:'cors',
        method:'POST',
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
    console.log(resp.devices,'device-list')
    
    var temp = []
    for(let i=0;i<resp.devices.length;i++){
      if(resp.devices[i].ConnectionStatus===true){
      temp.push(resp.devices[i].unique_id)
      }
    }
    this.setState({deviceList:temp})
    })
    .catch((err) => {
      console.log(err);
    
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
  

  showPolicy(id) {
    if (id === "create-rule") {
      this.setState({ showCreateRuleTab: true, showRuleList: false })
    }
    else if (id === "rules") {
      this.setState({ showCreateRuleTab: false, showRuleList: true })
    }
  }


  handleTriggerTypeChange = (selectedType, index) => {
    const { interfaceOptions, NotifOptions, triggerRows ,componentOptions, user, connection} = this.state;

    const updatedTriggerRows = [...triggerRows];
    updatedTriggerRows[index] = {
      ...updatedTriggerRows[index],
      type: selectedType,
      selectedOption: '', // Reset selected option when type changes
    };

    this.setState({ triggerRows: updatedTriggerRows });

    if (selectedType === "interface_parameter") {
      this.setState({ selectedTriggerOptionValues: interfaceOptions });
    } else if (selectedType === "notification") {
      this.setState({ selectedTriggerOptionValues: NotifOptions });
    }
    else if (selectedType === "component_parameter") {
      this.setState({ selectedTriggerOptionValues: componentOptions });
    }
    else if (selectedType === "user") {
      this.setState({ selectedTriggerOptionValues: user });
    }
    else if (selectedType === "connection") {
      this.setState({ selectedTriggerOptionValues: connection });
    }
  };

  handleTriggerOptionChange = (selectedOption, rowIndex) => {
    const { triggerRows } = this.state;
  
    const updatedTriggerRows = triggerRows.map((row, index) => {
      if (index === rowIndex) {
        return {
          ...row,
          selectedOption,
        };
      }
      return row;
    });
  
    this.setState({ triggerRows: updatedTriggerRows });
  };

  handleConnectionTypeChange = (value, rowIndex) => {
    const { triggerRows } = this.state;
  
    const updatedTriggerRows = triggerRows.map((row, index) => {
      if (index === rowIndex) {
        return {
          ...row,
          selectedConnectionType: value,
        };
      }
      return row;
    });
  
    this.setState({ triggerRows: updatedTriggerRows });
  };
  
  
  

  addNewTrigger = () => {
    const { selectedTriggerType, selectedTriggerOptionValues } = this.state;
    const newTriggerRow = {
      type: selectedTriggerType,
      options: selectedTriggerOptionValues,
      selectedOption: '', 
      selectedDevices: [], 
    };

    this.setState(prevState => ({
      triggerRows: [...prevState.triggerRows, newTriggerRow],
    }));
  };


  saveTrigger(index){
    const { triggerRows ,triggerName,showTriggerName,cronExp} = this.state;
    triggerRows[index]["trigger-name"]=triggerName
    triggerRows[index]["showTriggerName"]=true
    console.log(triggerRows,cronExp)
    this.setState({triggerRows})
    this.setState({opentriggerTemplate:false })
    Swal.fire({
      position: 'center',
      title: 'Trigger saved successfully',
      text: triggerName,
      icon : 'success',
      showConfirmButton: false,
      timer : 15000,
      color: '#116C39',
  })
    showTriggerName.push()
  }

  handleTriggerClick = (trigger) => {
    const { logicalExpression } = this.state;
    const updatedExpression = logicalExpression + trigger;
    this.setState({ logicalExpression: updatedExpression });
  };

  handleOperatorClick = (operator) => {
    const { logicalExpression } = this.state;
    const updatedExpression = logicalExpression + ` ${operator} `;
    this.setState({ logicalExpression: updatedExpression });
  };

  handleOpenParenthesis = () => {
    const { logicalExpression } = this.state;
    const updatedExpression = logicalExpression + '(';
    this.setState({ logicalExpression: updatedExpression });
  };

  handleCloseParenthesis = () => {
    const { logicalExpression } = this.state;
    const updatedExpression = logicalExpression + ')';
    this.setState({ logicalExpression: updatedExpression });
  };

  handleClearExpression = () => {
    this.setState({ logicalExpression: '' });
  };

  generateLogicalExpression = () => {
    const { logicalExpression } = this.state;
    console.log('Generated Logical Expression:', logicalExpression);
    // You can take further actions with the generated logical expression here
  };


  handleAddThenSection = () => {
    // Add a new "then" section to the state
    this.setState((prevState) => {
      console.log('Adding new then section');
      return {
        thenSections: [...prevState.thenSections, { selectedAction: null, inputValues: {}, showContent: true }],
      };
    });
  };

  hideselectedAction = (index) => {
    this.setState((prevState) => {
      const thenSections = [...prevState.thenSections];
      thenSections[index] = { ...thenSections[index], showContent: !thenSections[index].showContent };
      console.log(thenSections[index].showContent);
      return { thenSections };
    });
  };
  
  
  
  
  handleActionChange = (selectedAction, thenIndex) => {
    // Set the selected action for the specific "then" section
    this.setState((prevState) => {
      const thenSections = [...prevState.thenSections];
      thenSections[thenIndex].selectedAction = selectedAction;
      return { thenSections };
    });
  };

  handleChange = (key, value, thenIndex) => {
    // Update the input values for the specific "then" section
    this.setState((prevState) => {
      const thenSections = [...prevState.thenSections];
      thenSections[thenIndex].inputValues = {
        ...thenSections[thenIndex].inputValues,
        [key]: value,
      };
      return { thenSections };
    });
    console.log(this.state.thenSections)
  };

  handlingSelectedUniqueID = (event, item, rowIndex) => {
    let updatedTriggerRows = [...this.state.triggerRows];
    console.log(updatedTriggerRows,rowIndex)

    let updatedDevices = [...updatedTriggerRows[rowIndex].selectedDevices];
    if (event.target.checked) {
      updatedDevices.push(item);
    } else {
      updatedDevices = updatedDevices.filter(device => device !== item);
    }
  
    updatedTriggerRows[rowIndex].selectedDevices = updatedDevices;
    this.setState({ triggerRows: updatedTriggerRows });
  }
  
 
  handleComponentParamChange = (selectedParam, rowIndex) => {
    const { triggerRows } = this.state;
    const updatedTriggerRows = triggerRows.map((row, index) => {
      if (index === rowIndex) {
        return {
          ...row,
          selectedComponentParam: selectedParam,
        };
      }
      return row;
    });
    console.log(updatedTriggerRows,'after params')
    this.setState({ triggerRows: updatedTriggerRows });
  };

  handleComparisonOperatorChange = (selectedOperator, rowIndex) => {
    const { triggerRows } = this.state;
    const updatedTriggerRows = triggerRows.map((row, index) => {
      if (index === rowIndex) {
        return {
          ...row,
          selectedComparisonOperator: selectedOperator,
        };
      }
      return row;
    });
    console.log(updatedTriggerRows,'after operator')
    this.setState({ triggerRows: updatedTriggerRows });
  };

  handleTextFieldChange = (value, index) => {
    // Update the state with the text field value
    const updatedTriggerRows = [...this.state.triggerRows];
    updatedTriggerRows[index].textFieldValue = value;
    console.log(updatedTriggerRows)
    this.setState({ triggerRows: updatedTriggerRows });
  };

  handleDeviceTypeChange = (selectedDeviceType, index) => {
    // Update the state with the selected device type
    const updatedTriggerRows = [...this.state.triggerRows];
    updatedTriggerRows[index].selectedDeviceType = selectedDeviceType;
    console.log(updatedTriggerRows,'tyoes')
    this.setState({ triggerRows: updatedTriggerRows });
  };
  
  handleInterfaceChange = (selectedInterface, index) => {
    // Update the state with the selected interface
    const updatedTriggerRows = [...this.state.triggerRows];
    updatedTriggerRows[index].selectedInterface = selectedInterface;
  
    // Update the state
    this.setState({ triggerRows: updatedTriggerRows });
  };

  createNewRule() {
    const { ruleName ,logicalExpression,
      triggerRows,thenSections
    } = this.state;
    const a=this.parseTriggers(triggerRows)
    console.log(a)
  
    var temp = { name:"", expression:"", actions: {} ,trigger_map:{}};

    for (let i = 0; i < thenSections.length; i++) {
      const selectedAction = thenSections[i].selectedAction;
      temp.actions[selectedAction] = {};
  
      Object.keys(thenSections[i].inputValues).forEach((propertyName) => {
        temp.actions[selectedAction][propertyName] = thenSections[i].inputValues[propertyName];
      });
    }  
    temp.trigger_map=a;
    temp.expression=logicalExpression;
    temp.name=ruleName
    console.log(temp,'data-to-be-sent')
    fetch(`http://${this.state.serverIP}:5007/rule-engine/add-rule`, {                     
      method: 'POST', 
      mode: 'cors',  
      headers:{'Access-Control-Allow-Origin':'http://localhost:3000',  
                'Accept':'application/json', 
                'Content-Type':'application/json',
                'username': sessionStorage.getItem('username'),
                //   'Authorization': 'Bearer ' + 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTY2Njc2NzE3NSwianRpIjoiODFkOTNiMGEtNDQwMS00ZDIyLWIzYmItOGM0NmZkZDBjODJiIiwidHlwZSI6ImFjY2VzcyIsInN1YiI6ImFkbWluXzEyMyIsIm5iZiI6MTY2Njc2NzE3NSwiZXhwIjoxNjY5MzU5MTc1fQ.bPHBU62WQd-2Z4cmDkEYaL-198KTSmp6w1A49i4U3a4',
            }, 
            body: JSON.stringify(temp)               
      })
      .then(resp=>resp.json())
      .then(resp=>{this.setState({login_role_response:resp})
      ;
      console.log(resp,'create-rule-response')
      if(resp.status){
        this.setState({showNewRuleName:false})
        Swal.fire({
          position: 'center',
          title: resp.status,
          text: "success",
          icon : 'success',
          showConfirmButton: false,
          timer : 15000,
          color: '#116C39',
      })
      }
    })
  }
  parseTriggers = (data) => {
    let result = {};
  
    data.forEach(trigger => {
      const triggerKey = trigger['trigger-name'];
      if (triggerKey && trigger["type"]==="interface_parameter"){
        result[triggerKey] = {
          type: trigger.type,
          interface: trigger.selectedInterface,
          unique_ids: trigger.selectedDevices,
          parameter: trigger.selectedOption,
          operator: trigger.selectedComparisonOperator,
          value:trigger.textFieldValue,
        };
      }
      else if(trigger["type"]==="component_parameter"){
        result[triggerKey] = {
          type: trigger.type,
          component: trigger.selectedOption,
          unique_ids: trigger.selectedDevices,
          parameter: trigger.selectedComponentParam,
          operator: trigger.selectedComparisonOperator,
          value:trigger.textFieldValue,
        };
      }
      else if(trigger["type"]==="notification"){
        result[triggerKey] = {
          type: trigger.type,
          notification: trigger.selectedOption,
          unique_ids: trigger.selectedDevices,
        };
      }
      else if(trigger["type"]==="user"){
        result[triggerKey] = {
          type: trigger.type,
          operation: trigger.selectedOption,
        };
      }
      else if(trigger["type"]==="connection"){
        result[triggerKey] = {
          type: trigger.type,
          connection: trigger.selectedConnectionType,
          unique_ids: trigger.selectedDevices,
        };

      }
      else if(trigger["type"]==="schedule"){
        result[triggerKey] = {
          type: trigger.type,
          cron_exp: this.state.cronExp,
        };
      }
    });
  
    return result;
  };


  removeTriggerRow = (index) => {
    this.setState(prevState => ({
      triggerRows: prevState.triggerRows.filter((_, i) => i !== index)
    }));
  };
  removeActionSection = (index) => {
    this.setState(prevState => ({
      thenSections: prevState.thenSections.filter((_, i) => i !== index)
    }));
  };
  handleActionTabClick = () => {
    console.log('in')
    // Display an alert when the "Action & Body" tab is clicked
    alert('Action & Body tab clicked!');
  }
  setCronExp = (value) => {
    this.setState({ cronExp: value });
  };

  setCronError = (error) => {
    this.setState({ cronError: error });
  };
        

  render() {
    const { showCreateRuleTab, triggerOptions, triggerRows  ,selectedTriggerOptionValues,opentriggerTemplate,
      logicalExpression,actionList,thenSections,deviceList,component_params,deviceTypes,interfaceList,showRuleList,
    } = this.state;

    const { cronExp, totalRules, isAdmin } = this.state;


    return (
      <div className='page' style={{ backgroundColor: '#f4f7fe', height: '100vh', overflowY: 'hidden' }}>
        <div style={{ display: 'flex' , width:"98%"}}>
          <div style={{ flex: '4' }}>
            <div className='head_cover'><NewHeader header_name='Policy/Rule Management' path='' /></div>
            <div style={{ marginTop: '9%', marginLeft: '4%', height:"90vh"}}> 
              {!(showCreateRuleTab || showRuleList) ? (
                <div className ='policyCardTab'>
                   <div className='cardDash policy_card' style={{height:'135px'}} onClick={()=>this.showPolicy("rules")}>
                        <img className='policyIcon' src={require('../Images/rule-list.png')} alt=""></img>
                        <div style={{marginLeft:'9%',marginRight:'9%'}}>
                            <div className='keyDash'>Total Rules</div>
                            <div className='valueDash'>{totalRules}</div>
                        </div>
                    </div>

                    <div className='cardDash policy_card'style={{height:'135px'}} onClick={()=>this.showPolicy("create-rule")}>
                        <img className='policyIcon' src={require('../Images/create-rule.png')} alt="" ></img>
                        <div style={{marginLeft:'9%',marginRight:'9%'}}>
                            <div className='keyDash'>Create Rule</div>
                            <div className='valueDash'></div>
                        </div>
                    </div>
                </div>
              ) : null}

              {showCreateRuleTab ? (
                <div style={{marginLeft:"-2%"}}>
                  <img onClick={() => this.setState({ showCreateRuleTab: false })} src={backTab} alt='' width={30} />
                  <div className="routing-details trigger_rule " style={opentriggerTemplate ? { opacity: 1 } :null}>
                    <Tabs defaultActiveKey="trigger" id="routing-tabs">

                      <Tab eventKey="trigger" title="Trigger Rule">
                        <div className="trigger-content">
                          <div style={{ color: "#494697", fontWeight: "500" }}>Trigger Policy
                            <span onClick={() => this.addNewTrigger()}><img src={addTrigger} alt='' width={25} style={{marginLeft:"0.25rem"}} /></span>
                          </div>
                          <div style={{display:"flex"}}>
                            <div style={{width:"100%"}}>
                              {triggerRows.map((row, index) => (
                                <div>
                                  <div key={index} className='triggerRow'>
                                
                                      <button 
                                        className="removeTriggerButton"
                                        onClick={() => this.removeTriggerRow(index)}
                                      >
                                        <img src={clearExpression} alt='' width={10}/>
                                      </button>
                                   
                                    {triggerRows[index]["showTriggerName"]?(
                                      <div className='triggerName'>
                                        {triggerRows[index]["trigger-name"]}
                                      </div>
                                    ):null}

                                    <div style={{display:"flex" ,marginLeft:"-3%"}}>
                                  
                                      <Dropdown className="custom-dropdown" style={{marginTop:"0%"}}>
                                        <Dropdown.Toggle variant="success" id={`trigger-dropdown-${index}`}>
                                          {row.type || 'Select Trigger Type'}
                                        </Dropdown.Toggle>

                                        <Dropdown.Menu>
                                          {triggerOptions.map((trigger, optionIndex) => (
                                            <Dropdown.Item key={optionIndex} onClick={() => this.handleTriggerTypeChange(trigger, index)}>
                                              {trigger}
                                            </Dropdown.Item>
                                          ))}
                                        </Dropdown.Menu>
                                      </Dropdown>

                                      {row.type === "connection" ? (
                                        <Dropdown  className="custom-dropdown" style={{marginTop:"0%"}}>
                                          <Dropdown.Toggle variant="success" id={`connection-type-dropdown-${index}`}>
                                            {row.selectedConnectionType !== undefined ? row.selectedConnectionType.toString() : 'Select Connection Type'}
                                          </Dropdown.Toggle>

                                          <Dropdown.Menu>
                                            {[true, false].map((type, optionIndex) => (
                                              <Dropdown.Item key={optionIndex} onClick={() => this.handleConnectionTypeChange(type, index)}>
                                                {type.toString()}
                                              </Dropdown.Item>
                                            ))}
                                          </Dropdown.Menu>
                                        </Dropdown>
                                      ) : null}
                                      

                                      {row.type === "interface_parameter" ? (
                                        <Dropdown  className="custom-dropdown" style={{marginTop:"0%"}}>
                                          <Dropdown.Toggle variant="success" id={`comparison-operator-dropdown-${index}`}>
                                            {row.selectedDeviceType ? row.selectedDeviceType : 'Select Type'}
                                          </Dropdown.Toggle>

                                          <Dropdown.Menu>
                                            {deviceTypes.map((type, optionIndex) => (
                                              <Dropdown.Item key={optionIndex} onClick={() => this.handleDeviceTypeChange(type, index)}>
                                                {type}
                                              </Dropdown.Item>
                                            ))}
                                          </Dropdown.Menu>
                                        </Dropdown>
                                      ) : null}

                                      {row.type==="schedule"?(
                                        <div className='schedulerCron'>
                                          <Scheduler
                                            cron={cronExp}
                                            setCron={this.setCronExp}
                                            setCronError={this.setCronError}
                                            isAdmin={isAdmin}
                                          />
                                        </div>
                                      ):null}
                                      
                                      {row.selectedDeviceType ? (
                                        <Dropdown  className="custom-dropdown" style={{marginTop:"0%"}}>
                                          <Dropdown.Toggle variant="success" id={`interface-dropdown-${index}`}>
                                            {row.selectedInterface ? row.selectedInterface : 'Select Interface'}
                                          </Dropdown.Toggle>

                                          <Dropdown.Menu>
                                            {interfaceList.map((interfaceName, optionIndex) => (
                                              <Dropdown.Item key={optionIndex} onClick={() => this.handleInterfaceChange(interfaceName, index)}>
                                                {interfaceName}
                                              </Dropdown.Item>
                                            ))}
                                          </Dropdown.Menu>
                                        </Dropdown>
                                      ) : null}

                                      {row.type && !(row.type==="schedule" || row.type==="connection") ? (
                                        <Dropdown className="custom-dropdown" style={{marginTop:"0%"}}>
                                            <Dropdown.Toggle variant="success" id={`trigger-dropdown-${index}`}>
                                            {row.selectedOption || (`Select ${row.type} option`)}
                                            </Dropdown.Toggle>

                                            <Dropdown.Menu>
                                            {selectedTriggerOptionValues ? (
                                                selectedTriggerOptionValues.map((option, optionIndex) => (
                                                <Dropdown.Item key={optionIndex} onClick={() => this.handleTriggerOptionChange(option,index)}>
                                                    {option}
                                                </Dropdown.Item>
                                                ))
                                            ) : null}
                                            </Dropdown.Menu>
                                        </Dropdown>
                                      ) : null}

                                      {row.type === "component_parameter" && row.selectedOption ? (
                                        <Dropdown  className="custom-dropdown" style={{marginTop:"0%"}}>
                                          <Dropdown.Toggle variant="success" id={`component-dropdown-${index}`}>
                                            {row.selectedComponentParam ? row.selectedComponentParam : 'Select param'}
                                          </Dropdown.Toggle>

                                          <Dropdown.Menu>
                                            {Object.keys(component_params).map((param, optionIndex) => (
                                              row.selectedOption.split("-")[0] === param ? (
                                                component_params[param].map((options) => (
                                                  <Dropdown.Item key={optionIndex} onClick={() => this.handleComponentParamChange(options, index)}>
                                                    {options}
                                                  </Dropdown.Item>
                                                ))
                                              ) : null
                                            ))}
                                          </Dropdown.Menu>
                                        </Dropdown>
                                      ) : null}

                                      {(row.type === "component_parameter" || row.type === "interface_parameter") && row.selectedOption ? (
                                        <Dropdown  className="custom-dropdown" style={{marginTop:"0%"}}>
                                          <Dropdown.Toggle variant="success" id={`comparison-operator-dropdown-${index}`}>
                                            {row.selectedComparisonOperator ? row.selectedComparisonOperator : 'Select operator'}
                                          </Dropdown.Toggle>

                                          <Dropdown.Menu>
                                            {['>', '<', '='].map((operator, optionIndex) => (
                                              <Dropdown.Item key={optionIndex} onClick={() => this.handleComparisonOperatorChange(operator, index)}>
                                                {operator}
                                              </Dropdown.Item>
                                            ))}
                                          </Dropdown.Menu>
                                        </Dropdown>
                                      ) : null}

                                      {/* Display text field when a component is selected */}
                                      {row.selectedOption && !(row.type === "notification" || row.type === "user" || row.type === "schedule")? (
                                        <div style={{ marginLeft: '%',marginTop:"-1%"}}>
                                          <TextField
                                            placeholder={`Enter ${row.selectedOption.split('-')[0]} value`}
                                            type="text"
                                            id={`text-field-${index}`}
                                            label={`Enter ${row.selectedOption.split('-')[0]} value`}
                                            variant="standard"
                                            value={row.textFieldValue || ''}
                                            onChange={(event) => this.handleTextFieldChange(event.target.value, index)}
                                          />
                                        </div>
                                      ) : null}

                                      {deviceList && !(row.type === "user" || row.type === "schedule")?(
                                          <div className='deviceListBody'>
                                          {this.state.deviceList.map((device) => (
                                            <label key={device} style={{ display: 'flex', gap:"8px" }}>
                                              <input
                                                type="checkbox"
                                                value={device}
                                                checked={row.selectedDevices.includes(device)}
                                                onChange={(e) => this.handlingSelectedUniqueID(e, device, index)}
                                              />
                                              <span>{device}</span>
                                            </label>
                                          ))}
                                        </div>
                                      ):null}

                                      <Tooltip title="save trigger">
                                          <img className='saveTrigger' src={require('../Images/saveTrigger.png')} alt="" onClick={()=>this.setState({opentriggerTemplate:true})}></img>
                                      </Tooltip>`
                                     
                                    </div>
                                      {opentriggerTemplate?(
                                              <div className='role_content' style={{width:"20%",top:"36%",marginLeft:'32%',padding:'18px',opacity:'4'}}>
                                                  <div style={{display:'flex'}}><div className='new_device_header' style={{textAlign:'center'}}>Save as Trigger:</div>
                                                  <div className="close" style={{position:'absolute',right:"30px"}} onClick={(e)=>this.setState({opentriggerTemplate:false})}>&times;</div></div>
                                                  <div className="DialogInputs">
                                                      <TextField placeholder="Name" type="text"  id="standard-basic-1" label="Template name" variant="standard" value={this.state.triggerName}  onChange={(event) => {this.setState({triggerName: event.target.value})}}/>
                                                      <p style={{fontSize:'small',color:'red'}}>{this.state.errormsgTemplateInput}</p>
                                                  </div>
                                                  <button onClick={() => this.saveTrigger(index)} className="btn btn-primary mb-3" >Confirm</button>
                                              </div>
                                      ):null}
                                  </div>
                                </div>
                              ))}
                            </div>
                            
                            
                          </div>
                        </div>
                      </Tab>

                        {/* ACTIONNNNNNNNNNNNNNNNNNNNNNN */}
                        
                        <Tab eventKey="action" title="Action & Body">
                            {triggerRows.length>=1 && triggerRows[0]["trigger-name"]?(
                              <div style={{display:"flex"}}>
                                <div className="action-content" >
                                  <div style={{display:"grid",width:"fit-content",margin:"5%"}}>
                                    {triggerRows.map((trigger,index)=>(
                                      <button
                                          key={index}
                                          className='actionRow'
                                          onClick={() => this.handleTriggerClick(trigger["trigger-name"])}
                                        >
                                          {trigger["trigger-name"]}
                                        </button>
                                    ))}
                                  </div>
                                  <div style={{marginTop:"40%",marginLeft:"10%"}}>
                                    <div>
                                      <button className='operands' onClick={() => this.handleOperatorClick('AND')}>AND</button>
                                      <button className='operands' onClick={() => this.handleOperatorClick('OR')}>OR</button>
                                    </div>

                                    <div>
                                      <button className='logicBrackets' onClick={() => this.handleOpenParenthesis()}>(</button>
                                      <button className='logicBrackets' onClick={() => this.handleCloseParenthesis()}>)</button>
                                    </div>
                                  </div>
                                </div>
                                <div className="actionListTab">
                                  <div className='ifBox'>
                                    <button className='ifCase'>if:</button> 
                                    <div style={{display:"flex"}}>
                                      <div className='textHead'>Expression:</div>
                                      <input
                                      className='expressionField'
                                        type="text"
                                        value={logicalExpression}
                                        onChange={(e) => this.setState({ logicalExpression: e.target.value })}
                                      />
                                      <span onClick={this.handleClearExpression}><img src={clearExpression} alt='' width={10}/></span>
                                    </div>
                                  </div>
                                  
                                  <div  className='thenBox'>
                                        <div style={{display:"flex"}}>
                                          <button className='thenCase'>then:</button>
                                          <Tooltip title="add action">
                                          <p onClick={this.handleAddThenSection} style={{marginLeft:"4%"}}><img src={addTrigger} alt='' width={25} /></p>
                                          </Tooltip>
                                        </div>
                                        <button 
                                          style={{position:"absolute",top:"64%",right:"4%"}}
                                        className='btn btn-primary mb-3' onClick={()=>this.setState({showNewRuleName:true})}>create rule</button>
                                        {thenSections.map((section, index) => (
                                          <div key={index}>
                                            <img onClick={() => this.hideselectedAction(index)} src={downArrow} alt='' width={10} />
                                            <Tooltip title="remove action">
                                              <button 
                                                className="removeActionSectionButton"
                                                onClick={() => this.removeActionSection(index)}
                                              >
                                                <img src={clearExpression} alt='' width={10}/>
                                              </button>
                                            </Tooltip>
                                            
                                            <Dropdown >
                                              <Dropdown.Toggle variant="success">
                                                {section.selectedAction ? section.selectedAction : 'Choose action'}
                                              </Dropdown.Toggle>

                                              <Dropdown.Menu style={{height:"120px",overflowY:"scroll"}}>
                                                {Object.keys(actionList).map((action, actionIndex) => (
                                                  <Dropdown.Item
                                                    key={actionIndex}
                                                    onClick={() => this.handleActionChange(action, index)}
                                                  >
                                                    {action}
                                                  </Dropdown.Item>
                                                ))}
                                              </Dropdown.Menu>
                                            </Dropdown>

                                            {section.selectedAction && section.showContent ? (
                                              <div className='actionBody'>
                                                {Object.keys(actionList[section.selectedAction]).map((key) => (
                                                  <div key={key} style={{ margin: '10px', marginLeft: '20px' }}>
                                                    <div style={{ display: 'flex' }}>
                                                      <p style={{ width: '140px' }}>{key}</p>
                                                      <input
                                                        className='bodyField'
                                                        value={section.inputValues[key] || ''} // Display the value from the state
                                                        onChange={(e) => this.handleChange(key, e.target.value, index)} // Handle input changes
                                                      />
                                                    </div>
                                                  </div>
                                                ))}
                                                <button
                                                  className='btn btn-primary mb-3'
                                                  style={{ position: 'relative', right: '-78%' }}
                                                >
                                                  save
                                                </button>
                                              </div>
                                            ) : null}
                                          </div>
                                        ))}

                                  </div>

                                  {this.state.showNewRuleName?(
                                          <div className='role_content' style={{width:"20%",top:"36%",marginLeft:'32%',padding:'18px',opacity:'4'}}>
                                              <div style={{display:'flex'}}><div className='new_device_header' style={{textAlign:'center'}}>Save as Rule:</div>
                                              <div className="close" style={{position:'absolute',right:"30px"}} onClick={(e)=>this.setState({showNewRuleName:false})}>&times;</div></div>
                                              <div className="DialogInputs">
                                                  <TextField placeholder="Name" type="text"  id="standard-basic-1" label="Template name" variant="standard" value={this.state.ruleName}  onChange={(event) => {this.setState({ruleName: event.target.value})}}/>
                                                  <p style={{fontSize:'small',color:'red'}}>{this.state.errormsgTemplateInput}</p>
                                              </div>
                                              <button onClick={() => this.createNewRule()} className="btn btn-primary mb-3" >Confirm</button>
                                          </div>
                                  ):null}
                                </div>
                              </div>
                            ):(
                              <div className='text-message'>**No triggers to perform action</div>
                            )}
                        </Tab>
                    </Tabs>
                  </div>
                </div>
              ) : null}

              {showRuleList?(
                <div>
                  <img onClick={() => this.setState({ showRuleList: false })} src={backTab} alt='' width={30} />
                  <ListOfRules />
                </div>
              ):null}

            </div>
          </div>
        </div>
      </div>
     
    )
  }
}
export default PolicyRule;