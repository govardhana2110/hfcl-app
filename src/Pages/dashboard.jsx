import React from 'react';
import NewHeader from '../Components/header';
import NewLeftpanel from '../Components/leftPanel';
import Barchart from '../Components/barGraph';
import ReactSpeedometer from "react-d3-speedometer";
import { CircularProgressbarWithChildren } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import Tooltip from '@mui/material/Tooltip';

import 'react-dropdown/style.css';
import LinearGaugeChart from '../Components/linearGauge';
import IndividualAlarm from '../Components/individualAlarms'
import Loading from '../Components/loader';
import { ThemeProvider, createTheme } from "@mui/material/styles";

class DevicePanel extends React.Component{
    constructor(props){
        super(props);
        this.state={
            isDarkMode:false,
        is_fetching:false,
         serverIP:process.env.REACT_APP_CLIENT_IP,
         device_id:null,runTime:null,interfaceData:null,
         hold_alarms:null,openPopFan:false,boldText:null,
         get_alarms:null,openPopup:false,getDeviceInfo:null,
         severity:{critical:{color:'red',textAlign:'center',fontWeight:'700',fontSize:'large'},minor:{color:'orange',textAlign:'center',fontWeight:'700',fontSize:'large'},major:{color:'yellow',textAlign:'center',fontWeight:'700',fontSize:'large'},warning:{color:'#a98a19',textAlign:'center',fontWeight:'700',fontSize:'large'}},
         show_filter_popup:false,filter_by_key:null,s_features: true,fanData:null,
         ns_features:false,selected_supported_features_color:{fontWeight:'bold'},show_popup:false,selectedFeature:true,options:null,frontView:true,internalView:null,
         selected_not_supported_features_color:{fontWeight:'bold'},dev_supported:null,dev_notsupported:null,fix_selected_features_color:{color:'red',cursor:'pointer'},statusKey:[true,false,false,false,false,false,false,false],StatusName:'CPU',StatusValue:null,
         deviceInfoKeys: ['product-name', 'mfg-name', 'firmware-version', 'hardware-version', 'software-version', 'serial-no', 'description', 'mfg-date', 'name', 'oper-status', 'parent', 'part-no', 'removable']    }
}
    componentDidMount(){
        this.setState({is_fetching:true})
        let device_unique_id = sessionStorage.getItem('unique_id');
        fetch(`http://${this.state.serverIP}:5000/configuration-management/fault/alarms/${device_unique_id}`,
        {
            mode:'cors',
            headers:{'Access-Control-Allow-Origin':'http://localhost:3000',
            'username': sessionStorage.getItem('username'),
            'Authorization': 'Bearer ' + JSON.parse(sessionStorage.getItem('login_data')).data.access_token,
            },
        })
        .then(resp=>resp.json())
        .then(resp=>{
            console.log(resp)
            if(resp.status){
                this.setState({get_alarms:[]})
            }
            else{
                this.setState({get_alarms:resp['ipi-alarms:alarms'].alarm})
                let minorCount = 0;
                let majorCount = 0;
                let criticalCount = 0;
                let warningCount = 0;
                for(let i=0; i<resp['ipi-alarms:alarms'].alarm.length; i++){
                    if(resp['ipi-alarms:alarms'].alarm[i].state['alarm-severity'] === 'MINOR'){ 
                        minorCount = minorCount + 1;
                    } 
                    if(resp['ipi-alarms:alarms'].alarm[i].state['alarm-severity'] === 'MAJOR'){  
                        majorCount = majorCount + 1;
                    }            
                    if(resp['ipi-alarms:alarms'].alarm[i].state['alarm-severity'] === 'CRITICAL'){  
                        criticalCount = criticalCount + 1;
                    }         
                    if(resp['ipi-alarms:alarms'].alarm[i].state['alarm-severity'] === 'WARNING'){
                        warningCount = warningCount + 1;
                    }
                }
                this.setState({warningCount:warningCount,minorCount:minorCount,majorCount:majorCount,criticalCount:criticalCount})
            }
    console.log(this.state.get_alarms)})
    .catch((err) => {
        if (err.response) {
          alert(err.response.data.status)
          console.log('Error Response Data:', err.response.data);
          console.log('Error Response Status:', err.response.status);
          console.log('Error Response Headers:', err.response.headers);
        }
      });  

        fetch(`http://${this.state.serverIP}:5000/configuration-management/device-dashboard/${device_unique_id}`,
        {
            mode: 'cors',
            method: 'GET',
            headers: {
                'Access-Control-Allow-Origin': 'http://localhost:3000',
                'Content-Type': 'application/json',
                'username': sessionStorage.getItem('username'),
              },
        })
        .then(resp => resp.json())
        .then(resp => {
            console.log(resp)
            if(resp.device_health && resp.interfaces_status && resp.interfaces_status.interfaces){
                this.setState({getDeviceInfo: resp.device_health,interfaceData:resp.interfaces_status.interfaces,is_fetching:false});
                var ticks = resp.device_health['device-info']['CHASSIS'][1].state['up-time']
                const seconds = ticks / 100;
                const uptime = new Date(seconds * 1000);
    
                const days = Math.floor(seconds / (3600 * 24));
                const hours = uptime.getUTCHours().toString().padStart(2, '0');
                const minutes = uptime.getUTCMinutes().toString().padStart(2, '0');
                this.setState({runTime:`${days}d${hours}h${minutes}m`})
                if(resp.device_health['device-info']['CHASSIS'][1].state['cpu_status']==='Normal'){
                    this.setState({StatusValue:125})
                }
                else if(resp.device_health['device-info']['CHASSIS'][1].state['cpu_status']==='Minor-Fault'){
                    this.setState({StatusValue:500})
                }
                else{
                    this.setState({StatusValue:875})
                }    
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
      
    
    StatusBar(key,index){
        var name = key.split('_')[0].toUpperCase()
        this.setState({StatusName:name})
        var tempStatus = this.state.statusKey
        tempStatus = [false,false,false,false,false,false,false,false]
        tempStatus[index] = true
        this.setState({statusKey:tempStatus})
        // this.setState({statusKey[index]})
        if(this.state.getDeviceInfo['device-info']['CHASSIS'][1].state[key]==='Normal'){
                this.setState({StatusValue:125})
        }
        else if(this.state.getDeviceInfo['device-info']['CHASSIS'][1].state[key]==='Minor-Fault'){
            this.setState({StatusValue:500})
        }
        else{
            this.setState({StatusValue:875})
        }
    }

    toggleDarkMode = () => {
        console.log("innetw")
        this.setState((prevState) => ({ isDarkMode: !prevState.isDarkMode }));
      };
    render(){
        const { isDarkMode ,interfaceData ,getDeviceInfo} = this.state;
        const lightTheme = createTheme({
            palette: {
            background: {
                default: 'white', 
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
                    <NewLeftpanel page='dashboard' darkMode={this.state.isDarkMode}/>
                    <div style={{flex:'4',marginLeft:"18%"}}>
                        <div  style={{backgroundColor: isDarkMode ? darkTheme.palette.background.default : lightTheme.palette.background.default}}>
                            <NewHeader header_name='Device Dashboard' path='Dashboard' darkMode={this.state.isDarkMode} toggleDarkMode={this.toggleDarkMode}/>
                        </div>
                        
                        {getDeviceInfo && interfaceData?(
                            <div className='mainContent' id='mainContent' 
                            style={{height:"80vh",overflow:"auto", color: isDarkMode ? "red" : null }}>
                                <div className='secone'>
                                <div className='device_info' style={{backgroundColor: isDarkMode ? darkTheme.palette.background.default : lightTheme.palette.background.default,width:"24%",paddingLeft:"1px",paddingTop:"2px",paddingRight:"0px",paddingBottom:"1px"}}>
                                    {this.state.deviceInfoKeys.map((key, index) => (
                                   <div key={index} className='modelInfo'>
                                        <div className='deviceKey'>{key.split('-').join(' ').toUpperCase()} </div>
                                        <div className='limit-text'> {getDeviceInfo['device-info']['CHASSIS'][0][key] !== undefined ? 
            `: ${getDeviceInfo['device-info']['CHASSIS'][0][key]}` : 
            ": NA"}</div>
                                        <div className='vl-1'></div>
                                   </div>
                                   ))}
                                </div>
        
                        
                                    
                                       
                                            <div className='seconepartbottom1' style={{ backgroundColor: isDarkMode ? darkTheme.palette.background.default : lightTheme.palette.background.default }}>
                                                
                                                <div className='centerElement'>
                                                {this.state.getDeviceInfo &&
                                                    <div className="progress_bars"style={{marginTop:'5px'}}>
                                                    <div className='datahead'>Memory Usage</div>
                                                    <div  style={{display:'flex',justifyContent:'center',marginTop:'2%'}}>
                                                    <div style={{width:'120px',marginRight:'10px'}}>
                                                        <CircularProgressbarWithChildren value={((this.state.getDeviceInfo['device-info'].storage[0].storage.state['used-memory'])/(parseInt(this.state.getDeviceInfo['device-info'].storage[0].storage.state['free-memory'])+parseInt(this.state.getDeviceInfo['device-info'].storage[0].storage.state['used-memory'])))*100}>
                                                        <div style={{ fontSize: 20, justifyContent:'center', display:'flex', alignItems:'center',flexDirection:'column' }}>
                                                            <strong>{`${parseFloat(((this.state.getDeviceInfo['device-info'].storage[0].storage.state['used-memory'])/(parseInt(this.state.getDeviceInfo['device-info'].storage[0].storage.state['free-memory'])+parseInt(this.state.getDeviceInfo['device-info'].storage[0].storage.state['used-memory']))).toFixed(2))*100}`}%</strong> 
                                                            <div style={{fontSize:'10px'}}>Hard-Disk</div>
                                                        </div>
                                                        </CircularProgressbarWithChildren>
                                                        </div>
                                                        <div style={{width:'120px',marginLeft:'10px'}}>
                                                        <CircularProgressbarWithChildren value={((this.state.getDeviceInfo['device-info'].ram[0].ram.state['used-memory'])/(this.state.getDeviceInfo['device-info'].ram[0].ram.state['total-memory']))*100}>
                                                        <div style={{ fontSize: 20, justifyContent:'center', display:'flex', alignItems:'center',flexDirection:'column' }}>
                                                        <strong>{`${parseFloat(((this.state.getDeviceInfo['device-info'].ram[0].ram.state['used-memory'])/(this.state.getDeviceInfo['device-info'].ram[0].ram.state['total-memory'])).toFixed(2))*100}`}%</strong> 
                                                            <div style={{fontSize:'10px'}}>RAM</div>
                                                        </div>
                                                        </CircularProgressbarWithChildren>
                                                        </div>
                                                    </div>
                                                    <div style={{display:'flex',marginTop:this.state.get_alarms?'15%':'13%',justifyContent:'center',alignItems:'center'}}>
                                                                    <div className='memoryusage_params' style={{display:'flex'}}>
                                                                <img alt="" className='map' src={require('../Images/clock.png')}></img>
                                                                {this.state.runTime?(<Tooltip title={`${parseInt(this.state.runTime.slice(0, this.state.runTime.indexOf('d')), 10)} days, ${parseInt(this.state.runTime.slice(this.state.runTime.indexOf('d') + 1, this.state.runTime.indexOf('h')), 10)} hours, ${parseInt(this.state.runTime.slice(this.state.runTime.indexOf('h') + 1, this.state.runTime.indexOf('m')), 10)} minutes`} arrow placement="left"><div style={{fontSize:'9px',width:'40px'}}>{`${this.state.runTime} Runtime`}</div></Tooltip>):null}
                                                            </div>
                                                            <div style={{display:'flex',marginLeft:'10%'}}>
                                                                <img alt="" className='map' src={require('../Images/port.png')}></img>
                                                                <Tooltip title={`${this.state.getDeviceInfo['ports'].used_ports} Ports are Connected`}>
                                                                <div style={{fontSize:'9px',width:'40px'}}>{`${this.state.getDeviceInfo['ports'].used_ports}/${parseInt(this.state.getDeviceInfo['ports'].used_ports) + parseInt(this.state.getDeviceInfo['ports'].unused_ports)} ports`}</div>
                                                                </Tooltip>
                                                            </div>
                                                            <div style={{display:'flex',marginLeft:'10%',cursor:'pointer'}} onClick={() => { window.open(`https://www.google.com/maps?q=${sessionStorage.getItem('latitude')},${sessionStorage.getItem('longitude')}`, "_blank") }}>
                                                                <img alt="" className='map' src={require('../Images/pin.png')}></img>
                                                                <div style={{fontSize:'9px',width:'40px'}}>View In Map</div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    }
                                                
                                                </div>
                                                
                                            </div>
                                            <div className='seconepartbottom1' style={{ backgroundColor: isDarkMode ? darkTheme.palette.background.default : lightTheme.palette.background.default }}>
                                            <div style={{display:'flex',marginTop:'4%'}}>
                                            <Tooltip title={`Total Overall ${this.state.StatusName} status`}>
                                                    <div className='cpu_status' style={{marginRight:'25px'}}>
                                                    <ReactSpeedometer
                                                        height={130}
                                                        width={210}
                                                        needleHeightRatio={0.7}
                                                        value={parseInt(this.state.StatusValue)}
                                                        customSegmentStops={[0, 250, 750, 1000]}
                                                        segmentColors={['#84e0fd', 'yellow', 'red']}
                                                        currentValueText={`${this.state.StatusName} Status`}
                                                        labelFontSize='5px'
                                                        fontSize='5px'
                                                        valueTextFontWeight='medium'
                                                        valueTextFontSize='12px'
                                                        customSegmentLabels={[
                                                        {
                                                            text: 'Normal',
                                                            position: 'OUTSIDE',
                                                            color: 'black',
                                                            fontSize:'10px',
                                                            fontWeight:'lighter'
                                                        },
                                                        {
                                                            text: 'Minor',
                                                            position: 'OUTSIDE',
                                                            color: 'black',
                                                            fontSize:'10px',
                                                            fontWeight:'lighter'

                                                        },
                                                        {
                                                            text: 'Major',
                                                            position: 'OUTSIDE',
                                                            color: 'black',
                                                            fontSize:'10px',
                                                            fontWeight:'lighter'
                                                        },
                                                        ]}
                                                        ringWidth={40}
                                                        needleTransitionDuration={3333}
                                                        needleTransition="easeElastic"
                                                        needleColor={'#a7ff83'}
                                                        textColor={'black'}
                                                    />
                                                    </div>
                                                    </Tooltip>
                                                    <div>
                                                    <div className='dataheadmeter' style={{textAlign:'right',cursor:'pointer'}} onClick={()=>this.StatusBar('cpu_status',0)}><div style={this.state.statusKey[0]?({fontWeight:'900',color:'red'}):({fontWeight:'500'})}>CPU</div></div>
                                                    <div className='vl-1'></div>
                                                    <div className='dataheadmeter' style={{textAlign:'right',cursor:'pointer'}} onClick={()=>this.StatusBar('fan_status',1)}><div style={this.state.statusKey[1]?({fontWeight:'900',color:'red'}):({fontWeight:'500'})}>FAN</div></div>
                                                    <div className='vl-1'></div>
                                                    <div className='dataheadmeter' style={{textAlign:'right',cursor:'pointer'}} onClick={()=>this.StatusBar('psu_status',2)}><div style={this.state.statusKey[2]?({fontWeight:'900',color:'red'}):({fontWeight:'500'})}>PSU</div></div>
                                                    <div className='vl-1'></div>
                                                    <div className='dataheadmeter' style={{textAlign:'right',cursor:'pointer'}} onClick={()=>this.StatusBar('ram_status',3)}><div style={this.state.statusKey[3]?({fontWeight:'900',color:'red'}):({fontWeight:'500'})}>RAM</div></div>
                                                    <div className='vl-1'></div>
                                                    <div className='dataheadmeter' style={{textAlign:'right',cursor:'pointer'}} onClick={()=>this.StatusBar('storage_status',4)}><div style={this.state.statusKey[4]?({fontWeight:'900',color:'red'}):({fontWeight:'500'})}>Storage</div></div>
                                                    <div className='vl-1'></div>
                                                    <div className='dataheadmeter' style={{textAlign:'right',cursor:'pointer'}} onClick={()=>this.StatusBar('system_status',5)}><div style={this.state.statusKey[5]?({fontWeight:'900',color:'red'}):({fontWeight:'500'})}>System</div></div>
                                                    <div className='vl-1'></div>
                                                    <div className='dataheadmeter' style={{textAlign:'right',cursor:'pointer'}} onClick={()=>this.StatusBar('temperature_status',6)}><div style={this.state.statusKey[6]?({fontWeight:'900',color:'red'}):({fontWeight:'500'})}>Temperature</div></div>
                                                    <div className='vl-1'></div>
                                                    <div className='dataheadmeter' style={{textAlign:'right',cursor:'pointer'}} onClick={()=>this.StatusBar('software_status',7)}><div style={this.state.statusKey[7]?({fontWeight:'900',color:'red'}):({fontWeight:'500'})}>Software</div></div>
                                                    </div>
                                            </div>
                                            <div style={{marginTop:'9%'}}>
                                            {this.state.get_alarms?(
                                                        <div>
                                                        <div className='datahead'>Alarm Status</div>
                                                        <div style={{height:'60px',marginTop:'-9%'}}>
                                                        {this.state.criticalCount || this.state.majorCount || this.state.minorCount || this.state.warningCount?(
                                                            <IndividualAlarm  chartId={`dashChart`} critical={this.state.criticalCount} major={this.state.majorCount} minor={this.state.minorCount} warning={this.state.warningCount}/>
                                                        ):<div className='datahead'>No Alarms Present</div>}
                                                        </div>
                                                        </div>
                                            ):null}   
                                            </div>
                                            </div>
                                        
                                    
                                </div> 

                                <div className='secPort'>
                                    <div style={{display:'flex',justifyContent:'flex-end',width:'95%'}}>
                                            <div onClick={() => this.setState(this.state.frontView?({ frontView: false }):({ frontView: true }))} className='redLinks'>{this.state.frontView?('View Back Panel'):('View Front Panel')}</div>
                                            <div style={{marginLeft:'2%'}} onClick={() => this.setState({ internalView: true })} className='redLinks'>View Internal Panel</div>
                                    </div>  

                                    <div style={{width:'100%'}}>
                                        {sessionStorage.getItem('unique_id').includes('csar')?(
                                        this.state.frontView?(
                                            <div className='innerBox' style={{height:'100%'}}>
                                            <div style={{display:'flex',marginLeft:'-9%'}}>                
                                            <div style={{ position: 'relative', display: 'inline-block',marginRight:'1%' }}>
                                        <Tooltip title={
                                            <div>
                                            <div style={{textTransform:'uppercase',fontWeight:'bolder',marginBottom:'5px'}}>PSU-1</div>
                                            {Object.entries(this.state.getDeviceInfo['device-info']['power-supply'][0]['power-supply'].state).map(([key, value])=>(
                                                <div style={{textTransform:'capitalize'}}>{key}: {value} </div>        
                                            ))}
                                            </div>
                                        }>
                                        <img width='80' style={{borderRadius:'10px',marginRight:'1%'}} src={require('../Images/power-plug.png')} alt=""></img>
                                        </Tooltip>
                                        <div className={this.state.getDeviceInfo['device-info']['power-supply'][0]['power-supply'].state['operational-status']==='faulty'?('blinking-circle-red'):('blinking-circle')}></div>
                                        </div>
                                        <div style={{ position: 'relative', display: 'inline-block',marginLeft:'1%'  }}>
                                        <Tooltip title={
                                            <div>
                                            <div style={{textTransform:'uppercase',fontWeight:'bolder',marginBottom:'5px'}}>PSU-2</div>
                                            {Object.entries(this.state.getDeviceInfo['device-info']['power-supply'][1]['power-supply'].state).map(([key, value])=>(
                                                <div style={{textTransform:'capitalize'}}>{key}: {value} </div>        
                                            ))}       
                                            </div>
                                        }>
                                        <img width='80' style={{borderRadius:'10px',marginRight:'1%'}} src={require('../Images/power-plug.png')} alt=""></img>
                                        </Tooltip>                         
                                        <div className={this.state.getDeviceInfo['device-info']['power-supply'][1]['power-supply'].state['operational-status']==='faulty'?('blinking-circle-red'):('blinking-circle')}></div>
                                        </div>
                                        <Tooltip title={
                                            <div>
                                            <div style={{fontWeight:'bolder',marginBottom:'5px'}}>{this.state.interfaceData[28].name}</div>
                                            {Object.entries(this.state.interfaceData[28]).map(([key, value])=>(
                                                key!=='transceiver-details' && key!=='name'?(
                                                    <div style={{textTransform:'capitalize'}}>{key}: {value} </div>        
                                                ):null
                                            ))}
                                            {Object.entries(this.state.interfaceData[28]['transceiver-details']).map(([key, value])=>(
                                                <div style={{textTransform:'capitalize'}}>{key}: {value} </div>        
                                            ))}       
                                            </div>
                                        }>
                                        <img className={`portIm`} style={{marginLeft:'2%'}} src={this.state.interfaceData[28]['oper-status']==='up' ? require('../Images/portg.png') : require('../Images/porty.png')} alt='' />
                                        </Tooltip>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', columnGap: '4%', marginLeft: '2%' }}>
                                        {this.state.interfaceData
                                            .slice(0, 4)
                                            .filter((item, index) => index % 2 === 0)
                                            .map((item, index) => {
                                            const originalIndex = index * 2; // Calculate the original index in the unfiltered array

                                            return (
                                                <Tooltip
                                                key={originalIndex}
                                                placement = 'top'
                                                title={
                                                    <div>
                                                    <div style={{ fontWeight: 'bolder', marginBottom: '5px' }}>
                                                        {this.state.interfaceData[originalIndex].name}
                                                    </div>
                                                    {Object.entries(this.state.interfaceData[originalIndex]).map(([key, value]) =>
                                                        key !== 'name' ? (
                                                        <div style={{ textTransform: 'capitalize' }}>
                                                            {key}: {value}
                                                        </div>
                                                        ) : null
                                                    )}
                                                    </div>
                                                }
                                                >
                                                <img
                                                    style={{
                                                    height: '35px',
                                                    width: '40px',
                                                    transform: `rotate(180deg)`,
                                                    }}
                                                    src={
                                                    this.state.interfaceData[originalIndex]['oper-status'] === 'up'
                                                        ? require('../Images/upport.png')
                                                        : require('../Images/downport.png')
                                                    }
                                                    alt=''
                                                />
                                                </Tooltip>
                                            );
                                            })}
                                            <div style={{ gridColumn: '1 / -1', textAlign: 'center',fontSize:'xx-small' }}>
                                                RJ45 Ethernet
                                            </div>
                                        {/* Second Column */}
                                        {this.state.interfaceData
                                            .slice(0, 4)
                                            .filter((item, index) => index % 2 !== 0)
                                            .map((item, index) => {
                                            const originalIndex = index * 2 + 1; // Calculate the original index in the unfiltered array

                                            return (
                                                <Tooltip
                                                key={originalIndex}
                                                title={
                                                    <div>
                                                    <div style={{ fontWeight: 'bolder', marginBottom: '5px' }}>
                                                        {this.state.interfaceData[originalIndex].name}
                                                    </div>
                                                    {Object.entries(this.state.interfaceData[originalIndex]).map(([key, value]) =>
                                                        key !== 'name' ? (
                                                        <div style={{ textTransform: 'capitalize' }}>
                                                            {key}: {value}
                                                        </div>
                                                        ) : null
                                                    )}
                                                    </div>
                                                }
                                                >
                                                <img
                                                    style={{
                                                    height: '35px',
                                                    width: '40px',
                                                    transform: `rotate(0deg)`,
                                                    }}
                                                    src={
                                                    this.state.interfaceData[originalIndex]['oper-status'] === 'up'
                                                        ? require('../Images/upport.png')
                                                        : require('../Images/downport.png')
                                                    }
                                                    alt=''
                                                />
                                                </Tooltip>
                                            );
                                            })}
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(9, 1fr)', gridGap: '0px', gridRowGap: '0px', marginLeft: '2%' }}>
                                        {this.state.interfaceData
                                            .slice(4, 22)
                                            .filter((item, index) => index % 2 === 0)
                                            .map((item, index) => {
                                            const originalIndex = index * 2 + 4; // Calculate the original index in the unfiltered array

                                            return (
                                                <Tooltip
                                                key={originalIndex}
                                                placement = 'top'
                                                title={
                                                    <div>
                                                    <div style={{fontWeight: 'bolder', marginBottom: '5px' }}>
                                                        {this.state.interfaceData[originalIndex].name}
                                                    </div>
                                                    {Object.entries(this.state.interfaceData[originalIndex]).map(([key, value]) =>
                                                        key !== 'transceiver-details' && key !== 'name' ? (
                                                        <div style={{ textTransform: 'capitalize' }}>
                                                            {key}: {value}
                                                        </div>
                                                        ) : null
                                                    )}
                                                    {Object.entries(this.state.interfaceData[originalIndex]['transceiver-details']).map(([key, value]) => (
                                                        <div style={{ textTransform: 'capitalize' }}>
                                                        {key}: {value}
                                                        </div>
                                                    ))}
                                                    </div>
                                                }
                                                >
                                                <img
                                                    className='portIm'
                                                    style={{
                                                        transform: `rotate(0deg)`,
                                                    }}
                                                    src={this.state.interfaceData[originalIndex]['oper-status'] === 'up' ? require('../Images/portg.png') : require('../Images/porty.png')}
                                                    alt=''
                                                />
                                                </Tooltip>
                                            );
                                            })}
                                            <div style={{ gridColumn: '1 / -1', textAlign: 'center',fontSize:'xx-small' }}>
                                                Gigabit Ethernet (ge)
                                            </div>
                                        {/* Second Column */}
                                        {this.state.interfaceData
                                            .slice(4, 22)
                                            .filter((item, index) => index % 2 !== 0)
                                            .map((item, index) => {
                                            const originalIndex = index * 2 + 5; // Calculate the original index in the unfiltered array

                                            return (
                                                <Tooltip
                                                key={originalIndex}
                                                placement = 'bottom'
                                                title={
                                                    <div>
                                                    <div style={{ fontWeight: 'bolder', marginBottom: '5px' }}>
                                                        {this.state.interfaceData[originalIndex].name}
                                                    </div>
                                                    {Object.entries(this.state.interfaceData[originalIndex]).map(([key, value]) =>
                                                        key !== 'transceiver-details' && key !== 'name' ? (
                                                        <div style={{ textTransform: 'capitalize' }}>
                                                            {key}: {value}
                                                        </div>
                                                        ) : null
                                                    )}
                                                    {Object.entries(this.state.interfaceData[originalIndex]['transceiver-details']).map(([key, value]) => (
                                                        <div style={{ textTransform: 'capitalize' }}>
                                                        {key}: {value}
                                                        </div>
                                                    ))}
                                                    </div>
                                                }
                                                >
                                                <img
                                                    className='portIm'
                                                    style={{
                                                        transform: `rotate(180deg)`,
                                                    }}
                                                    src={this.state.interfaceData[originalIndex]['oper-status'] === 'up' ? require('../Images/portg.png') : require('../Images/porty.png')}
                                                    alt=''
                                                />
                                                </Tooltip>
                                            );
                                            })}
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gridGap: '0px', gridRowGap: '0px', marginLeft: '2%' }}>
                                        {this.state.interfaceData
                                            .slice(23, 29)
                                            .filter((item, index) => index % 2 === 0)
                                            .map((item, index) => {
                                            const originalIndex = index * 2 + 23 - 1; // Calculate the original index in the unfiltered array

                                            return (
                                                <Tooltip
                                                key={originalIndex}
                                                placement = 'top'
                                                title={
                                                    <div>
                                                    <div style={{fontWeight: 'bolder', marginBottom: '5px' }}>
                                                        {this.state.interfaceData[originalIndex].name}
                                                    </div>
                                                    {Object.entries(this.state.interfaceData[originalIndex]).map(([key, value]) =>
                                                        key !== 'transceiver-details' && key !== 'name' ? (
                                                        <div style={{ textTransform: 'capitalize' }}>
                                                            {key}: {value}
                                                        </div>
                                                        ) : null
                                                    )}
                                                    {Object.entries(this.state.interfaceData[originalIndex]['transceiver-details']).map(([key, value]) => (
                                                        <div style={{ textTransform: 'capitalize' }}>
                                                        {key}: {value}
                                                        </div>
                                                    ))}
                                                    </div>
                                                }
                                                >
                                                <img
                                                    className='portIm'
                                                    style={{
                                                        transform: `rotate(0deg)`,
                                                    }}
                                                    src={this.state.interfaceData[originalIndex]['oper-status'] === 'up' ? require('../Images/portg.png') : require('../Images/porty.png')}
                                                    alt=''
                                                />
                                                </Tooltip>
                                            );
                                            })}
                                            <div style={{ gridColumn: '1 / -1', textAlign: 'center' ,fontSize:'xx-small'}}>
                                                10 bit Gigabit Ethernet (xe)
                                            </div>
                                        {/* Second Column */}
                                        {this.state.interfaceData
                                            .slice(23, 29)
                                            .filter((item, index) => index % 2 !== 0)
                                            .map((item, index) => {
                                            const originalIndex = index * 2 + 23; // Calculate the original index in the unfiltered array

                                            return (
                                                <Tooltip
                                                key={originalIndex}
                                                placement = 'bottom'
                                                title={
                                                    <div>
                                                    <div style={{fontWeight: 'bolder', marginBottom: '5px' }}>
                                                        {this.state.interfaceData[originalIndex].name}
                                                    </div>
                                                    {Object.entries(this.state.interfaceData[originalIndex]).map(([key, value]) =>
                                                        key !== 'transceiver-details' && key !== 'name' ? (
                                                        <div style={{ textTransform: 'capitalize' }}>
                                                            {key}: {value}
                                                        </div>
                                                        ) : null
                                                    )}
                                                    {Object.entries(this.state.interfaceData[originalIndex]['transceiver-details']).map(([key, value]) => (
                                                        <div style={{ textTransform: 'capitalize' }}>
                                                        {key}: {value}
                                                        </div>
                                                    ))}
                                                    </div>
                                                }
                                                >
                                                <img
                                                    className='portIm'
                                                    style={{
                                                        transform: `rotate(180deg)`,
                                                    }}
                                                    src={this.state.interfaceData[originalIndex]['oper-status'] === 'up' ? require('../Images/portg.png') : require('../Images/porty.png')}
                                                    alt=''
                                                />
                                                </Tooltip>
                                            );
                                            })}
                                        </div>
                                        </div>
                                        <div style={{marginTop:'1%',display:'flex',marginLeft:'33%'}}>
                                                <div className="smallBox" style={this.state.getDeviceInfo['device-info'].fan[0].fan.state['fan-status']==='running'?({backgroundColor:'#a6f9a6'}):({backgroundColor:'#f57a7a'})}>F1</div>
                                                <div className="smallBox" style={this.state.getDeviceInfo['device-info'].fan[1].fan.state['fan-status']==='running'?({backgroundColor:'#a6f9a6'}):({backgroundColor:'#f57a7a'})}>F2</div>
                                                <div className="smallBox" style={this.state.getDeviceInfo['device-info'].fan[2].fan.state['fan-status']==='running'?({backgroundColor:'#a6f9a6'}):({backgroundColor:'#f57a7a'})}>F3</div>
                                                <div className="smallBox" style={this.state.getDeviceInfo['device-info'].fan[3].fan.state['fan-status']==='running'?({backgroundColor:'#a6f9a6'}):({backgroundColor:'#f57a7a'})}>F4</div>
                                                <div className="smallBox" style={this.state.getDeviceInfo['device-info']['power-supply'][0]['power-supply'].state['operational-status']==='running'?({backgroundColor:'#a6f9a6'}):({backgroundColor:'#f57a7a'})}>PSU1</div>
                                                <div className="smallBox" style={this.state.getDeviceInfo['device-info']['power-supply'][1]['power-supply'].state['operational-status']==='running'?({backgroundColor:'#a6f9a6'}):({backgroundColor:'#f57a7a'})}>PSU2</div>
                                                <div className="smallBox" style={this.state.getDeviceInfo['device-info']['power-supply'][1]['power-supply'].state['operational-status']===''?({backgroundColor:'#a6f9a6'}):({backgroundColor:'#f57a7a'})}>SYS</div>
                                                <div className="smallBox" style={this.state.getDeviceInfo['device-info']['power-supply'][1]['power-supply'].state['operational-status']===''?({backgroundColor:'#a6f9a6'}):({backgroundColor:'#f57a7a'})}>SYS</div>
                                                <div className="smallBox" style={this.state.getDeviceInfo['device-info']['power-supply'][1]['power-supply'].state['operational-status']===''?({backgroundColor:'#a6f9a6'}):({backgroundColor:'#f57a7a'})}>SYS</div>
                                            </div> 
                                        </div>
                                        ):(
                                            <div className='innerBox'  style={{height:'114px'}}>                     
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gridGap: '63px',marginLeft:'-1%'}}>
                                        {this.state.getDeviceInfo['device-info'].fan.map((fan, index) => (
                                            <div key={index} style={{display:'flex'}}>
                                            {fan.fan.state['fan-status']==='running'?(
                                                <Tooltip title={`Fan ${index+1}`}>
                                                <img alt="" className='fanImage' style={{ '--rotation-time': `${20000/(this.state.getDeviceInfo['device-info'].fan[0].fan.state.rpm)}s` }} src={require('../Images/fan.png')}></img>
                                                </Tooltip>
                                                    ):(
                                                        <Tooltip title={`Fan ${index+1}`}>
                                                        <img alt="" className='fanImageStop'  src={require('../Images/fan.png')}></img>
                                                        </Tooltip>
                                                    )}
                                            <div style={{marginTop:'10%',width:'110px',marginLeft:'10px'}}>
                                                {fan.fan.state ? (
                                                Object.entries(fan.fan.state).map(([key, value]) => (
                                                    key==='maximum-rpm' || key ==='minimum-rpm' || key==='rpm' ? (
                                                        <div key={key} style={{marginTop:'-10%'}}>
                                                        <span className='rpmValue' style={{textTransform:'capitalize'}}>{key}: </span>
                                                        <span className='rpmValue' style={{textTransform:'capitalize'}}>{value}</span>
                                                        </div>
                                                    ) : null
                                                ))
                                                ) : null}
                                            </div>
                                            </div>
                                        ))}
                                        </div>

                                        </div>
                                        )
                                        ):null}
                                        {sessionStorage.getItem('unique_id').includes('cuar')?(
                                            this.state.frontView?(
                                            <div className='innerBox' style={{height:'100%',display:'block'}}>
                                            <div style={{display:'flex',marginLeft:'1%',marginTop:'1%'}}>
                                            <div style={{ position: 'relative', display: 'inline-block',marginRight:'1%' }}>
                                        <Tooltip title={
                                            <div>
                                            <div style={{textTransform:'uppercase',fontWeight:'bolder',marginBottom:'5px'}}>PSU-1</div>
                                            {Object.entries(this.state.getDeviceInfo['device-info']['power-supply'][0]['power-supply'].state).map(([key, value])=>(
                                                <div style={{textTransform:'capitalize'}}>{key}: {value} </div>        
                                            ))}
                                            </div>
                                        }>
                                        <img width='80' style={{borderRadius:'10px',marginRight:'1%'}} src={require('../Images/power-plug.png')} alt=""></img>
                                        </Tooltip>
                                        <div className={this.state.getDeviceInfo['device-info']['power-supply'][0]['power-supply'].state['operational-status']==='faulty'?('blinking-circle-red'):('blinking-circle')}></div>
                                        </div>
                                        <div style={{ position: 'relative', display: 'inline-block' }}>
                                        <Tooltip title={
                                            <div>
                                            <div style={{textTransform:'uppercase',fontWeight:'bolder',marginBottom:'5px'}}>PSU-2</div>
                                            {Object.entries(this.state.getDeviceInfo['device-info']['power-supply'][1]['power-supply'].state).map(([key, value])=>(
                                                <div style={{textTransform:'capitalize'}}>{key}: {value} </div>        
                                            ))}       
                                            </div>
                                        }>
                                        <img width='80' style={{borderRadius:'10px',marginRight:'1%'}} src={require('../Images/power-plug.png')} alt=""></img>
                                        </Tooltip>                         
                                        <div className={this.state.getDeviceInfo['device-info']['power-supply'][1]['power-supply'].state['operational-status']==='faulty'?('blinking-circle-red'):('blinking-circle')}></div>
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', columnGap: '4%', marginLeft: '1%' }}>
                                        {this.state.interfaceData
                                            .slice(0, 4)
                                            .filter((item, index) => index % 2 === 0)
                                            .map((item, index) => {
                                            const originalIndex = index * 2; // Calculate the original index in the unfiltered array

                                            return (
                                                <img
                                                    style={{
                                                    height: '35px',
                                                    width: '40px',
                                                    transform: `rotate(180deg)`,
                                                    }}
                                                    src={
                                                    this.state.interfaceData[originalIndex]['oper-status'] === 'up'
                                                        ? require('../Images/upport.png')
                                                        : require('../Images/downport.png')
                                                    }
                                                    alt=''
                                                />
                                            );
                                            })}
                                            <div style={{ gridColumn: '1 / -1', textAlign: 'center',fontSize:'xx-small' }}>
                                                RJ45 Ethernet
                                            </div>
                                        {/* Second Column */}
                                        {this.state.interfaceData
                                            .slice(0, 4)
                                            .filter((item, index) => index % 2 !== 0)
                                            .map((item, index) => {
                                            const originalIndex = index * 2 + 1; // Calculate the original index in the unfiltered array

                                            return (
                                                <img
                                                    style={{
                                                    height: '35px',
                                                    width: '40px',
                                                    transform: `rotate(0deg)`,
                                                    }}
                                                    src={
                                                    this.state.interfaceData[originalIndex]['oper-status'] === 'up'
                                                        ? require('../Images/upport.png')
                                                        : require('../Images/downport.png')
                                                    }
                                                    alt=''
                                                />
                                            );
                                            })}
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gridGap: '0px', gridRowGap: '0px', marginLeft: '1%' }}>
                                        {this.state.interfaceData
                                            .slice(0, 6)
                                            .filter((item, index) => index % 2 === 0)
                                            .map((item, index) => {
                                            const originalIndex = index * 2; // Calculate the original index in the unfiltered array

                                            return (
                                                <Tooltip
                                                key={originalIndex}
                                                placement = 'top'
                                                title={
                                                    <div>
                                                    <div style={{fontWeight: 'bolder', marginBottom: '5px' }}>
                                                        {this.state.interfaceData[originalIndex].name}
                                                    </div>
                                                    {Object.entries(this.state.interfaceData[originalIndex]).map(([key, value]) =>
                                                        key !== 'transceiver-details' && key !== 'name' ? (
                                                        <div style={{ textTransform: 'capitalize' }}>
                                                            {key}: {value}
                                                        </div>
                                                        ) : null
                                                    )}
                                                    {Object.entries(this.state.interfaceData[originalIndex]['transceiver-details']).map(([key, value]) => (
                                                        <div style={{ textTransform: 'capitalize' }}>
                                                        {key}: {value}
                                                        </div>
                                                    ))}
                                                    </div>
                                                }
                                                >
                                                <img
                                                    className='portIm'
                                                    style={{
                                                        transform: `rotate(0deg)`,
                                                    }}
                                                    src={this.state.interfaceData[originalIndex]['oper-status'] === 'up' ? require('../Images/portg.png') : require('../Images/porty.png')}
                                                    alt=''
                                                />
                                                </Tooltip>
                                            );
                                            })}
                                            <div style={{ gridColumn: '1 / -1', textAlign: 'center',fontSize:'xx-small' }}>
                                                100g CE
                                            </div>
                                        {/* Second Column */}
                                        {this.state.interfaceData
                                            .slice(0, 6)
                                            .filter((item, index) => index % 2 !== 0)
                                            .map((item, index) => {
                                            const originalIndex = index * 2 + 1; // Calculate the original index in the unfiltered array

                                            return (
                                                <Tooltip
                                                key={originalIndex}
                                                placement = 'bottom'
                                                title={
                                                    <div>
                                                    <div style={{ fontWeight: 'bolder', marginBottom: '5px' }}>
                                                        {this.state.interfaceData[originalIndex].name}
                                                    </div>
                                                    {Object.entries(this.state.interfaceData[originalIndex]).map(([key, value]) =>
                                                        key !== 'transceiver-details' && key !== 'name' ? (
                                                        <div style={{ textTransform: 'capitalize' }}>
                                                            {key}: {value}
                                                        </div>
                                                        ) : null
                                                    )}
                                                    {Object.entries(this.state.interfaceData[originalIndex]['transceiver-details']).map(([key, value]) => (
                                                        <div style={{ textTransform: 'capitalize' }}>
                                                        {key}: {value}
                                                        </div>
                                                    ))}
                                                    </div>
                                                }
                                                >
                                                <img
                                                    className='portIm'
                                                    style={{
                                                        transform: `rotate(180deg)`,
                                                    }}
                                                    src={this.state.interfaceData[originalIndex]['oper-status'] === 'up' ? require('../Images/portg.png') : require('../Images/porty.png')}
                                                    alt=''
                                                />
                                                </Tooltip>
                                            );
                                            })}
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gridGap: '0px', gridRowGap: '0px', marginLeft: '1%' }}>
                                        {this.state.interfaceData
                                            .slice(0, 2)
                                            .filter((item, index) => index % 2 === 0)
                                            .map((item, index) => {
                                            const originalIndex = index * 2 + 6; // Calculate the original index in the unfiltered array

                                            return (
                                                <Tooltip
                                                key={originalIndex}
                                                placement = 'top'
                                                title={
                                                    <div>
                                                    <div style={{fontWeight: 'bolder', marginBottom: '5px' }}>
                                                        {this.state.interfaceData[originalIndex].name}
                                                    </div>
                                                    {Object.entries(this.state.interfaceData[originalIndex]).map(([key, value]) =>
                                                        key !== 'transceiver-details' && key !== 'name' ? (
                                                        <div style={{ textTransform: 'capitalize' }}>
                                                            {key}: {value}
                                                        </div>
                                                        ) : null
                                                    )}
                                                    {Object.entries(this.state.interfaceData[originalIndex]['transceiver-details']).map(([key, value]) => (
                                                        <div style={{ textTransform: 'capitalize' }}>
                                                        {key}: {value}
                                                        </div>
                                                    ))}
                                                    </div>
                                                }
                                                >
                                                <img
                                                    className='portIm'
                                                    style={{
                                                        transform: `rotate(0deg)`,
                                                    }}
                                                    src={this.state.interfaceData[originalIndex]['oper-status'] === 'up' ? require('../Images/portg.png') : require('../Images/porty.png')}
                                                    alt=''
                                                />
                                                </Tooltip>
                                            );
                                            })}
                                            <div style={{ gridColumn: '1 / -1', textAlign: 'center',fontSize:'xx-small' }}>
                                                50g CE
                                            </div>
                                        {/* Second Column */}
                                        {this.state.interfaceData
                                            .slice(0, 2)
                                            .filter((item, index) => index % 2 !== 0)
                                            .map((item, index) => {
                                            const originalIndex = index * 2 + 7; // Calculate the original index in the unfiltered array

                                            return (
                                                <Tooltip
                                                key={originalIndex}
                                                placement = 'bottom'
                                                title={
                                                    <div>
                                                    <div style={{ fontWeight: 'bolder', marginBottom: '5px' }}>
                                                        {this.state.interfaceData[originalIndex].name}
                                                    </div>
                                                    {Object.entries(this.state.interfaceData[originalIndex]).map(([key, value]) =>
                                                        key !== 'transceiver-details' && key !== 'name' ? (
                                                        <div style={{ textTransform: 'capitalize' }}>
                                                            {key}: {value}
                                                        </div>
                                                        ) : null
                                                    )}
                                                    {Object.entries(this.state.interfaceData[originalIndex]['transceiver-details']).map(([key, value]) => (
                                                        <div style={{ textTransform: 'capitalize' }}>
                                                        {key}: {value}
                                                        </div>
                                                    ))}
                                                    </div>
                                                }
                                                >
                                                <img
                                                    className='portIm'
                                                    style={{
                                                        transform: `rotate(180deg)`,
                                                    }}
                                                    src={this.state.interfaceData[originalIndex]['oper-status'] === 'up' ? require('../Images/portg.png') : require('../Images/porty.png')}
                                                    alt=''
                                                />
                                                </Tooltip>
                                            );
                                            })}
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gridGap: '0px', gridRowGap: '0px', marginLeft: '1%' }}>
                                        {this.state.interfaceData
                                            .slice(0, 20)
                                            .filter((item, index) => index % 2 === 0)
                                            .map((item, index) => {
                                            const originalIndex = index * 2 + 8;

                                            return (
                                                <Tooltip
                                                key={originalIndex}
                                                placement = 'top'
                                                title={
                                                    <div>
                                                    <div style={{fontWeight: 'bolder', marginBottom: '5px' }}>
                                                        {this.state.interfaceData[originalIndex].name}
                                                    </div>
                                                    {Object.entries(this.state.interfaceData[originalIndex]).map(([key, value]) =>
                                                        key !== 'transceiver-details' && key !== 'name' ? (
                                                        <div style={{ textTransform: 'capitalize' }}>
                                                            {key}: {value}
                                                        </div>
                                                        ) : null
                                                    )}
                                                    {Object.entries(this.state.interfaceData[originalIndex]['transceiver-details']).map(([key, value]) => (
                                                        <div style={{ textTransform: 'capitalize' }}>
                                                        {key}: {value}
                                                        </div>
                                                    ))}
                                                    </div>
                                                }
                                                >
                                                <img
                                                    className='portIm'
                                                    style={{
                                                        transform: `rotate(0deg)`,
                                                    }}
                                                    src={this.state.interfaceData[originalIndex]['oper-status'] === 'up' ? require('../Images/portg.png') : require('../Images/porty.png')}
                                                    alt=''
                                                />
                                                </Tooltip>
                                            );
                                            })}
                                            <div style={{ gridColumn: '1 / -1', textAlign: 'center',fontSize:'xx-small' }}>
                                                25g XE
                                            </div>
                                        {this.state.interfaceData
                                            .slice(0, 20)
                                            .filter((item, index) => index % 2 !== 0)
                                            .map((item, index) => {
                                            const originalIndex = index * 2 + 9; 

                                            return (
                                                <Tooltip
                                                key={originalIndex}
                                                placement = 'bottom'
                                                title={
                                                    <div>
                                                    <div style={{ fontWeight: 'bolder', marginBottom: '5px' }}>
                                                        {this.state.interfaceData[originalIndex].name}
                                                    </div>
                                                    {Object.entries(this.state.interfaceData[originalIndex]).map(([key, value]) =>
                                                        key !== 'transceiver-details' && key !== 'name' ? (
                                                        <div style={{ textTransform: 'capitalize' }}>
                                                            {key}: {value}
                                                        </div>
                                                        ) : null
                                                    )}
                                                    {Object.entries(this.state.interfaceData[originalIndex]['transceiver-details']).map(([key, value]) => (
                                                        <div style={{ textTransform: 'capitalize' }}>
                                                        {key}: {value}
                                                        </div>
                                                    ))}
                                                    </div>
                                                }
                                                >
                                                <img
                                                    className='portIm'
                                                    style={{
                                                        transform: `rotate(180deg)`,
                                                    }}
                                                    src={this.state.interfaceData[originalIndex]['oper-status'] === 'up' ? require('../Images/portg.png') : require('../Images/porty.png')}
                                                    alt=''
                                                />
                                                </Tooltip>
                                            );
                                            })}
                                        </div>
                                            </div>  
                                            <div style={{marginTop:'1%',display:'flex',marginLeft:'49.5%',marginBottom:'0.4%'}}>
                                            <div className="smallBox" style={this.state.getDeviceInfo['device-info'].fan[0].fan.state['fan-status']==='running'?({backgroundColor:'#a6f9a6'}):({backgroundColor:'#f57a7a'})}>F1</div>
                                                <div className="smallBox" style={this.state.getDeviceInfo['device-info'].fan[1].fan.state['fan-status']==='running'?({backgroundColor:'#a6f9a6'}):({backgroundColor:'#f57a7a'})}>F2</div>
                                                <div className="smallBox" style={this.state.getDeviceInfo['device-info'].fan[2].fan.state['fan-status']==='running'?({backgroundColor:'#a6f9a6'}):({backgroundColor:'#f57a7a'})}>F3</div>
                                                <div className="smallBox" style={this.state.getDeviceInfo['device-info'].fan[3].fan.state['fan-status']==='running'?({backgroundColor:'#a6f9a6'}):({backgroundColor:'#f57a7a'})}>F4</div>
                                                {this.state.getDeviceInfo['device-info'].fan[4]?(<div className="smallBox" style={this.state.getDeviceInfo['device-info'].fan[4].fan.state['fan-status']==='running'?({backgroundColor:'#a6f9a6'}):({backgroundColor:'#f57a7a'})}>F5</div>):null}
                                                <div className="smallBox" style={this.state.getDeviceInfo['device-info']['power-supply'][0]['power-supply'].state['operational-status']==='running'?({backgroundColor:'#a6f9a6'}):({backgroundColor:'#f57a7a'})}>PSU1</div>
                                                <div className="smallBox" style={this.state.getDeviceInfo['device-info']['power-supply'][1]['power-supply'].state['operational-status']==='running'?({backgroundColor:'#a6f9a6'}):({backgroundColor:'#f57a7a'})}>PSU2</div>
                                                <div className="smallBox" style={this.state.getDeviceInfo['device-info']['power-supply'][1]['power-supply'].state['operational-status']===''?({backgroundColor:'#a6f9a6'}):({backgroundColor:'#f57a7a'})}>SYS</div>
                                                <div className="smallBox" style={this.state.getDeviceInfo['device-info']['power-supply'][1]['power-supply'].state['operational-status']===''?({backgroundColor:'#a6f9a6'}):({backgroundColor:'#f57a7a'})}>GNSS</div>
                                                <div className="smallBox" style={this.state.getDeviceInfo['device-info']['power-supply'][1]['power-supply'].state['operational-status']===''?({backgroundColor:'#a6f9a6'}):({backgroundColor:'#f57a7a'})}>SYNC</div>
                                            </div>                  
                                            </div>
                                        ):(
                                        <div className='innerBox'  style={{height:'114px'}}>                     
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gridGap: '6px',marginLeft:'-1%'}}>
                                        {this.state.getDeviceInfo['device-info'].fan.map((fan, index) => (
                                            <div key={index} style={{display:'flex'}}>
                                            {fan.fan.state['fan-status']==='running'?(
                                                <Tooltip title={`Fan ${index+1}`}>
                                                <img alt="" className='fanImage' style={{ '--rotation-time': `${20000/(this.state.getDeviceInfo['device-info'].fan[0].fan.state.rpm)}s` }} src={require('../Images/fan.png')}></img>
                                                </Tooltip>
                                                    ):(
                                                        <Tooltip title={`Fan ${index+1}`}>
                                                        <img alt="" className='fanImageStop'  src={require('../Images/fan.png')}></img>
                                                        </Tooltip>
                                                    )}
                                            <div style={{marginTop:'10%',width:'110px',marginLeft:'10px'}}>
                                                {fan.fan.state ? (
                                                Object.entries(fan.fan.state).map(([key, value]) => (
                                                    key==='maximum-rpm' || key ==='minimum-rpm' || key==='rpm' ? (
                                                        <div key={key} style={{marginTop:'-10%'}}>
                                                        <span className='rpmValue' style={{textTransform:'capitalize'}}>{key}: </span>
                                                        <span className='rpmValue' style={{textTransform:'capitalize'}}>{value}</span>
                                                        </div>
                                                    ) : null
                                                ))
                                                ) : null}
                                            </div>
                                            </div>
                                        ))}
                                        </div>

                                        </div>
                                        )
                                        ):null}

                                        {sessionStorage.getItem('unique_id').includes('duar')?(
                                            this.state.frontView?(
                                                <div className='innerBox' style={{display:'block'}}>
                                                    <div style={{display:'flex',marginLeft:'1%',marginTop:'1%'}}>
                                                    <div style={{ position: 'relative', display: 'inline-block',marginRight:'1%' }}>
                                                    <Tooltip title={
                                                        <div>
                                                        <div style={{textTransform:'uppercase',fontWeight:'bolder',marginBottom:'5px'}}>PSU-1</div>
                                                        {Object.entries(this.state.getDeviceInfo['device-info']['power-supply'][0]['power-supply'].state).map(([key, value])=>(
                                                            <div style={{textTransform:'capitalize'}}>{key}: {value} </div>        
                                                        ))}
                                                        </div>
                                                    }>
                                                    <img width='80' style={{borderRadius:'10px',marginRight:'1%'}} src={require('../Images/power-plug.png')} alt=""></img>
                                                    </Tooltip>
                                                    <div className={this.state.getDeviceInfo['device-info']['power-supply'][0]['power-supply'].state['operational-status']==='faulty'?('blinking-circle-red'):('blinking-circle')}></div>
                                                    </div>
                                                    <div style={{ position: 'relative', display: 'inline-block' }}>
                                                    <Tooltip title={
                                                        <div>
                                                        <div style={{textTransform:'uppercase',fontWeight:'bolder',marginBottom:'5px'}}>PSU-2</div>
                                                        {Object.entries(this.state.getDeviceInfo['device-info']['power-supply'][1]['power-supply'].state).map(([key, value])=>(
                                                            <div style={{textTransform:'capitalize'}}>{key}: {value} </div>        
                                                        ))}       
                                                        </div>
                                                    }>
                                                    <img width='80' style={{borderRadius:'10px',marginRight:'1%'}} src={require('../Images/power-plug.png')} alt=""></img>
                                                    </Tooltip>                         
                                                    <div className={this.state.getDeviceInfo['device-info']['power-supply'][1]['power-supply'].state['operational-status']==='faulty'?('blinking-circle-red'):('blinking-circle')}></div>
                                                    </div>
                                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', columnGap: '4%', marginLeft: '1%' }}>
                                                    {interfaceData
                                                        .slice(0, 4)
                                                        .filter((item, index) => index % 2 === 0)
                                                        .map((item, index) => {
                                                        const originalIndex = index * 2; // Calculate the original index in the unfiltered array

                                                        return (
                                                            <img
                                                                style={{
                                                                height: '35px',
                                                                width: '40px',
                                                                transform: `rotate(180deg)`,
                                                                }}
                                                                src={
                                                                this.state.interfaceData[originalIndex]['oper-status'] === 'up'
                                                                    ? require('../Images/upport.png')
                                                                    : require('../Images/downport.png')
                                                                }
                                                                alt=''
                                                            />
                                                        );
                                                        })}
                                                        <div style={{ gridColumn: '1 / -1', textAlign: 'center',fontSize:'xx-small' }}>
                                                            RJ45 Ethernet
                                                        </div>
                                                    {/* Second Column */}
                                                    {this.state.interfaceData
                                                        .slice(0, 4)
                                                        .filter((item, index) => index % 2 !== 0)
                                                        .map((item, index) => {
                                                        const originalIndex = index * 2 + 1; // Calculate the original index in the unfiltered array

                                                        return (
                                                            <img
                                                                style={{
                                                                height: '35px',
                                                                width: '40px',
                                                                transform: `rotate(0deg)`,
                                                                }}
                                                                src={
                                                                this.state.interfaceData[originalIndex]['oper-status'] === 'up'
                                                                    ? require('../Images/upport.png')
                                                                    : require('../Images/downport.png')
                                                                }
                                                                alt=''
                                                            />
                                                        );
                                                        })}
                                                    </div>
                                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gridGap: '0px', gridRowGap: '0px', marginLeft: '1%' }}>
                                                    {this.state.interfaceData
                                                        .slice(0, 6)
                                                        .filter((item, index) => index % 2 === 0)
                                                        .map((item, index) => {
                                                        const originalIndex = index * 2; // Calculate the original index in the unfiltered array

                                                        return (
                                                            <Tooltip
                                                            key={originalIndex}
                                                            placement = 'top'
                                                            title={
                                                                <div>
                                                                <div style={{fontWeight: 'bolder', marginBottom: '5px' }}>
                                                                    {this.state.interfaceData[originalIndex].name}
                                                                </div>
                                                                {Object.entries(this.state.interfaceData[originalIndex]).map(([key, value]) =>
                                                                    key !== 'transceiver-details' && key !== 'name' ? (
                                                                    <div style={{ textTransform: 'capitalize' }}>
                                                                        {key}: {value}
                                                                    </div>
                                                                    ) : null
                                                                )}
                                                                {Object.entries(this.state.interfaceData[originalIndex]['transceiver-details']).map(([key, value]) => (
                                                                    <div style={{ textTransform: 'capitalize' }}>
                                                                    {key}: {value}
                                                                    </div>
                                                                ))}
                                                                </div>
                                                            }
                                                            >
                                                            <img
                                                                className='portIm'
                                                                style={{
                                                                    transform: `rotate(0deg)`,
                                                                }}
                                                                src={this.state.interfaceData[originalIndex]['oper-status'] === 'up' ? require('../Images/portg.png') : require('../Images/porty.png')}
                                                                alt=''
                                                            />
                                                            </Tooltip>
                                                        );
                                                        })}
                                                        <div style={{ gridColumn: '1 / -1', textAlign: 'center',fontSize:'xx-small' }}>
                                                            100g CE
                                                        </div>
                                                    {/* Second Column */}
                                                    {this.state.interfaceData
                                                        .slice(0, 6)
                                                        .filter((item, index) => index % 2 !== 0)
                                                        .map((item, index) => {
                                                        const originalIndex = index * 2 + 1; // Calculate the original index in the unfiltered array

                                                        return (
                                                            <Tooltip
                                                            key={originalIndex}
                                                            placement = 'bottom'
                                                            title={
                                                                <div>
                                                                <div style={{ fontWeight: 'bolder', marginBottom: '5px' }}>
                                                                    {this.state.interfaceData[originalIndex].name}
                                                                </div>
                                                                {Object.entries(this.state.interfaceData[originalIndex]).map(([key, value]) =>
                                                                    key !== 'transceiver-details' && key !== 'name' ? (
                                                                    <div style={{ textTransform: 'capitalize' }}>
                                                                        {key}: {value}
                                                                    </div>
                                                                    ) : null
                                                                )}
                                                                {Object.entries(this.state.interfaceData[originalIndex]['transceiver-details']).map(([key, value]) => (
                                                                    <div style={{ textTransform: 'capitalize' }}>
                                                                    {key}: {value}
                                                                    </div>
                                                                ))}
                                                                </div>
                                                            }
                                                            >
                                                            <img
                                                                className='portIm'
                                                                style={{
                                                                    transform: `rotate(180deg)`,
                                                                }}
                                                                src={this.state.interfaceData[originalIndex]['oper-status'] === 'up' ? require('../Images/portg.png') : require('../Images/porty.png')}
                                                                alt=''
                                                            />
                                                            </Tooltip>
                                                        );
                                                        })}
                                                    </div>
                                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gridGap: '0px', gridRowGap: '0px', marginLeft: '1%' }}>
                                                    {this.state.interfaceData
                                                        .slice(0, 2)
                                                        .filter((item, index) => index % 2 === 0)
                                                        .map((item, index) => {
                                                        const originalIndex = index * 2 + 6; // Calculate the original index in the unfiltered array

                                                        return (
                                                            <Tooltip
                                                            key={originalIndex}
                                                            placement = 'top'
                                                            title={
                                                                <div>
                                                                <div style={{fontWeight: 'bolder', marginBottom: '5px' }}>
                                                                    {this.state.interfaceData[originalIndex].name}
                                                                </div>
                                                                {Object.entries(this.state.interfaceData[originalIndex]).map(([key, value]) =>
                                                                    key !== 'transceiver-details' && key !== 'name' ? (
                                                                    <div style={{ textTransform: 'capitalize' }}>
                                                                        {key}: {value}
                                                                    </div>
                                                                    ) : null
                                                                )}
                                                                {Object.entries(this.state.interfaceData[originalIndex]['transceiver-details']).map(([key, value]) => (
                                                                    <div style={{ textTransform: 'capitalize' }}>
                                                                    {key}: {value}
                                                                    </div>
                                                                ))}
                                                                </div>
                                                            }
                                                            >
                                                            <img
                                                                className='portIm'
                                                                style={{
                                                                    transform: `rotate(0deg)`,
                                                                }}
                                                                src={this.state.interfaceData[originalIndex]['oper-status'] === 'up' ? require('../Images/portg.png') : require('../Images/porty.png')}
                                                                alt=''
                                                            />
                                                            </Tooltip>
                                                        );
                                                        })}
                                                        <div style={{ gridColumn: '1 / -1', textAlign: 'center',fontSize:'xx-small' }}>
                                                            25g XE
                                                        </div>
                                                    {/* Second Column */}
                                                    {this.state.interfaceData
                                                        .slice(0, 2)
                                                        .filter((item, index) => index % 2 !== 0)
                                                        .map((item, index) => {
                                                        const originalIndex = index * 2 + 7; // Calculate the original index in the unfiltered array

                                                        return (
                                                            <Tooltip
                                                            key={originalIndex}
                                                            placement = 'bottom'
                                                            title={
                                                                <div>
                                                                <div style={{ fontWeight: 'bolder', marginBottom: '5px' }}>
                                                                    {this.state.interfaceData[originalIndex].name}
                                                                </div>
                                                                {Object.entries(this.state.interfaceData[originalIndex]).map(([key, value]) =>
                                                                    key !== 'transceiver-details' && key !== 'name' ? (
                                                                    <div style={{ textTransform: 'capitalize' }}>
                                                                        {key}: {value}
                                                                    </div>
                                                                    ) : null
                                                                )}
                                                                {Object.entries(this.state.interfaceData[originalIndex]['transceiver-details']).map(([key, value]) => (
                                                                    <div style={{ textTransform: 'capitalize' }}>
                                                                    {key}: {value}
                                                                    </div>
                                                                ))}
                                                                </div>
                                                            }
                                                            >
                                                            <img
                                                                className='portIm'
                                                                style={{
                                                                    transform: `rotate(180deg)`,
                                                                }}
                                                                src={this.state.interfaceData[originalIndex]['oper-status'] === 'up' ? require('../Images/portg.png') : require('../Images/porty.png')}
                                                                alt=''
                                                            />
                                                            </Tooltip>
                                                        );
                                                        })}
                                                    </div>
                                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gridGap: '0px', gridRowGap: '0px', marginLeft: '1%' }}>
                                                    {this.state.interfaceData
                                                        .slice(0, 20)
                                                        .filter((item, index) => index % 2 === 0)
                                                        .map((item, index) => {
                                                        const originalIndex = index * 2 + 8; // Calculate the original index in the unfiltered array

                                                        return (
                                                            <Tooltip
                                                            key={originalIndex}
                                                            placement = 'top'
                                                            title={
                                                                <div>
                                                                <div style={{fontWeight: 'bolder', marginBottom: '5px' }}>
                                                                    {this.state.interfaceData[originalIndex].name}
                                                                </div>
                                                                {Object.entries(this.state.interfaceData[originalIndex]).map(([key, value]) =>
                                                                    key !== 'transceiver-details' && key !== 'name' ? (
                                                                    <div style={{ textTransform: 'capitalize' }}>
                                                                        {key}: {value}
                                                                    </div>
                                                                    ) : null
                                                                )}
                                                                {Object.entries(this.state.interfaceData[originalIndex]['transceiver-details']).map(([key, value]) => (
                                                                    <div style={{ textTransform: 'capitalize' }}>
                                                                    {key}: {value}
                                                                    </div>
                                                                ))}
                                                                </div>
                                                            }
                                                            >
                                                            <img
                                                                className='portIm'
                                                                style={{
                                                                    transform: `rotate(0deg)`,
                                                                }}
                                                                src={this.state.interfaceData[originalIndex]['oper-status'] === 'up' ? require('../Images/portg.png') : require('../Images/porty.png')}
                                                                alt=''
                                                            />
                                                            </Tooltip>
                                                        );
                                                        })}
                                                        <div style={{ gridColumn: '1 / -1', textAlign: 'center',fontSize:'xx-small' }}>
                                                            25g XE
                                                        </div>
                                                    {/* Second Column */}
                                                    
                                                    {interfaceData
                                                        .slice(0, 20)
                                                        .filter((item, index) => index % 2 !== 0)
                                                        .map((item, index) => {
                                                        const originalIndex = index * 2 + 9; 
                                                       if(interfaceData[originalIndex]&& interfaceData[originalIndex]["name"]){
                                                        console.log( interfaceData[originalIndex].name,originalIndex)
                                                        return (
                                                            <Tooltip
                                                            key={originalIndex}
                                                            placement = 'bottom'
                                                            title={
                                                                <div>
                                                                <div style={{ fontWeight: 'bolder', marginBottom: '5px' }}>
                                                                    {interfaceData[originalIndex].name}
                                                                </div>
                                                                {Object.entries(interfaceData[originalIndex]).map(([key, value]) =>
                                                                    key !== 'transceiver-details' && key !== 'name' ? (
                                                                    <div style={{ textTransform: 'capitalize' }}>
                                                                        {key}: {value}
                                                                    </div>
                                                                    ) : null
                                                                )}
                                                                {Object.entries(interfaceData[originalIndex]['transceiver-details']).map(([key, value]) => (
                                                                    <div style={{ textTransform: 'capitalize' }}>
                                                                    {key}: {value}
                                                                    </div>
                                                                ))}
                                                                </div>
                                                            }
                                                            >
                                                            <img className='portIm'
                                                                style={{transform: `rotate(180deg)`, }}
                                                                src={interfaceData[originalIndex]['oper-status'] === 'up' ? require('../Images/portg.png') : require('../Images/porty.png')}
                                                                alt=''
                                                            />
                                                            </Tooltip>
                                                        );
                                                       }
                                                       
                                                        })}
                                                    </div>
                                                    </div> 

                                                    {/* <div style={{marginTop:'1%',display:'flex',marginLeft:'49.5%',marginBottom:'0.4%'}}>
                                                    <div className="smallBox" style={this.state.getDeviceInfo['device-info'].fan[0].fan.state['fan-status']==='running'?({backgroundColor:'#a6f9a6'}):({backgroundColor:'#f57a7a'})}>F1</div>
                                                        <div className="smallBox" style={this.state.getDeviceInfo['device-info'].fan[1].fan.state['fan-status']==='running'?({backgroundColor:'#a6f9a6'}):({backgroundColor:'#f57a7a'})}>F2</div>
                                                        <div className="smallBox" style={this.state.getDeviceInfo['device-info'].fan[2].fan.state['fan-status']==='running'?({backgroundColor:'#a6f9a6'}):({backgroundColor:'#f57a7a'})}>F3</div>
                                                        <div className="smallBox" style={this.state.getDeviceInfo['device-info'].fan[3].fan.state['fan-status']==='running'?({backgroundColor:'#a6f9a6'}):({backgroundColor:'#f57a7a'})}>F4</div>
                                                        <div className="smallBox" style={this.state.getDeviceInfo['device-info'].fan[4].fan.state['fan-status']==='running'?({backgroundColor:'#a6f9a6'}):({backgroundColor:'#f57a7a'})}>F5</div>
                                                        <div className="smallBox" style={this.state.getDeviceInfo['device-info']['power-supply'][0]['power-supply'].state['operational-status']==='running'?({backgroundColor:'#a6f9a6'}):({backgroundColor:'#f57a7a'})}>PSU1</div>
                                                        <div className="smallBox" style={this.state.getDeviceInfo['device-info']['power-supply'][1]['power-supply'].state['operational-status']==='running'?({backgroundColor:'#a6f9a6'}):({backgroundColor:'#f57a7a'})}>PSU2</div>
                                                        <div className="smallBox" style={this.state.getDeviceInfo['device-info']['power-supply'][1]['power-supply'].state['operational-status']===''?({backgroundColor:'#a6f9a6'}):({backgroundColor:'#f57a7a'})}>SYS</div>
                                                        <div className="smallBox" style={this.state.getDeviceInfo['device-info']['power-supply'][1]['power-supply'].state['operational-status']===''?({backgroundColor:'#a6f9a6'}):({backgroundColor:'#f57a7a'})}>GNSS</div>
                                                        <div className="smallBox" style={this.state.getDeviceInfo['device-info']['power-supply'][1]['power-supply'].state['operational-status']===''?({backgroundColor:'#a6f9a6'}):({backgroundColor:'#f57a7a'})}>SYNC</div>
                                                    </div>  */}

                                                </div>
                                            ):(
                                            <div className='innerBox' style={{height:'114px'}}>                     
                                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gridGap: '6px',marginLeft:'-1%'}}>
                                            {this.state.getDeviceInfo['device-info'].fan.map((fan, index) => (
                                                <div key={index} style={{display:'flex'}}>
                                                {fan.fan.state['fan-status']==='running'?(
                                                    <Tooltip title={`Fan ${index+1}`}>
                                                    <img alt="" className='fanImage' style={{ '--rotation-time': `${20000/(this.state.getDeviceInfo['device-info'].fan[0].fan.state.rpm)}s` }} src={require('../Images/fan.png')}></img>
                                                    </Tooltip>
                                                        ):(
                                                            <Tooltip title={`Fan ${index+1}`}>
                                                            <img alt="" className='fanImageStop'  src={require('../Images/fan.png')}></img>
                                                            </Tooltip>
                                                        )}
                                                <div style={{marginTop:'10%',width:'110px',marginLeft:'10px'}}>
                                                    {fan.fan.state ? (
                                                    Object.entries(fan.fan.state).map(([key, value]) => (
                                                        key==='maximum-rpm' || key ==='minimum-rpm' || key==='rpm' ? (
                                                            <div key={key} style={{marginTop:'-10%'}}>
                                                            <span className='rpmValue' style={{textTransform:'capitalize'}}>{key}: </span>
                                                            <span className='rpmValue' style={{textTransform:'capitalize'}}>{value}</span>
                                                            </div>
                                                        ) : null
                                                    ))
                                                    ) : null}
                                                </div>
                                                </div>
                                            ))}
                                            </div>

                                            </div>
                                            )
                                            ):null}
                                    </div>

                                    {this.state.openFullDeviceView ? (
                                        <div className="popup-overlay">
                                            <div className='popuphere' style={{width:'95%'}}>
                                            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                                <span style={{ cursor: 'pointer' }} onClick={()=>this.setState({openFullDeviceView:false})}>X</span>
                                            </div>
                                            <div style={{display:'flex'}}>
                                            <div className='tabbox' style={this.state.openFrontView?({color:'#004f68',fontWeight:'bold'}):null} onClick={()=>this.setState({openFrontView:true,openBackView:false})}>
                                            Front View</div>
                                            <div className='tabbox' style={this.state.openBackView?({color:'#004f68',fontWeight:'bold'}):null} onClick={()=>this.setState({openFrontView:false,openBackView:true})}>
                                            Back View</div>
                                            </div>
                                            <div style={{margin:'2%'}}>
                                            {this.state.openFrontView?(<div><img width='100%' src={require('../Images/backview.png')} alt=""></img></div>):null}
                                            {this.state.openBackView?(<div><img width='100%' src={require('../Images/frontView.png')} alt=""></img></div>):null}
                                            </div>
                                            </div>
                                        </div>
                                    ) : null}
                                </div> 

                                <div className='sectwo'>
                                    <div className='cpu'>
                                    <div style={{margin:'20px',fontWeight:"bold",fontSize:'small'}}>CPU Load Usage (in %)
                                        <div onClick={()=>this.setState({openPopHelp:true})} className='redLinks' style={{marginLeft:'93%',marginTop:'-20px'}}>Help</div>
                                    </div>
                                    {this.state.openPopHelp?(
                                            <div class="popup-overlay">
                                                <div className='popuphere'>
                                            <div style={{textAlign:'right',margin:'10px',cursor:'pointer',position:'fixed',marginLeft:'85%'}} onClick={(e)=>this.setState({openPopHelp:false})}>X</div>
                                                <div>
                                                    <div style={{fontSize:'15px',marginLeft:'20px',textDecoration:'underline'}}>Help</div>
                                                    <div style={{marginLeft:'5%'}}>
                                                    <div style={{display:'flex',marginTop:'20px'}}>
                                                    <div className='datasub' style={{margin:'0'}}>Instant:</div>
                                                    <div className='datasub' style={{fontWeight:'light',margin:'0px',marginLeft:'20%',position:'absolute'}}>CPU Load percentage at the current instance</div>
                                                    </div>
                                                    <div style={{display:'flex'}}>
                                                    <div className='datasub' style={{margin:'0'}}>1min:</div>
                                                    <div className='datasub' style={{fontWeight:'light',margin:'0px',marginLeft:'20%',position:'absolute'}}>CPU Load percentage at 1 minute time interval</div>
                                                    </div><div style={{display:'flex'}}>
                                                    <div className='datasub' style={{margin:'0'}}>5min:</div>
                                                    <div className='datasub' style={{fontWeight:'light',margin:'0px',marginLeft:'20%',position:'absolute'}}>CPU Load percentage at 5 minute time interval</div>
                                                    </div><div style={{display:'flex'}}>
                                                    <div className='datasub' style={{margin:'0'}}>15min:</div>
                                                    <div className='datasub' style={{fontWeight:'light',margin:'0px',marginLeft:'20%',position:'absolute'}}>CPU Load percentage at 15 minute time interval</div>
                                                    </div>
                                                    </div>
                                                </div>
                                                </div>
                                            </div>
                                            ):null}
                                    {this.state.internalView?(
                                                <div class="popup-overlay">
                                                <div className='popuphere'>
                                            <div style={{textAlign:'right',margin:'10px',cursor:'pointer',position:'fixed',marginLeft:'85%'}} onClick={(e)=>this.setState({internalView:false})}>X</div>
                                                </div>
                                            </div>
                                    ):null}
                                    {this.state.getDeviceInfo?(
                                        <Barchart data={this.state.getDeviceInfo['device-info'].cpu[0].cpu.state}/>
                                    ):null}
                                    </div>
                                   
                                </div> 
                            </div>   
                        ):null}


                            {this.state.is_fetching===true?(
                                <Loading/>
                            ):null}
                    </div>
                    </div>
                    </div>
                </div>
            </ThemeProvider>
        )
    }
}
export default DevicePanel;