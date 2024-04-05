import React from 'react';
import NewHeader from '../Components/header';
import NewLeftpanel from '../Components/leftPanel';
import DatePicker from 'react-datepicker';
import close from '../Images/close.png';
import closeS from '../Images/closeS.png';
import sortDown from '../Images/dropDown.png'
import sortUp from '../Images/arrow-up.png';
import AlarmMonth from '../Components/lineChart';
import EquipPie from '../Components/equipPie';
import AlarmPie from '../Components/piechartInAlarm';
import ReactSpeedometer from "react-d3-speedometer";
import Dropdown from 'react-dropdown';
import ThermalGuage from '../Components/Thermal';
import Pagination from "react-js-pagination";
import { PageItem as BootstrapPageItem } from 'react-bootstrap';
import { CSVLink } from "react-csv";
import jsPDF from "jspdf";
import "jspdf-autotable";
import Loading from '../Components/loader';
import { Tooltip } from 'antd';
import { ThemeProvider, createTheme } from "@mui/material/styles";

class FaultPanel extends React.Component{
    constructor(props){
        super(props);
        this.state={
            isDarkMode:false,
            searchTerm: '',
            searchCount: 0,
            currentIndex: 0,
            sortedField: "id",
            setFlag:false,
            sortDirection: "asc",isOpen:false,
            selectedthSort:null,fixthHead:{color:'#297c97e3',cursor:'pointer',position:'static'},
            selectedSeverityFilters:[],
            get_alarms: [],
            get_historyAlarms:[],	
            get_filtered_alarms:[],
            get_filtered_historyAlarms:[],
            get_filteredTransitionAlarms:[],
            activePage_current: 1,isOpenShelve:false,
            itemsPerPage_current: 6,
            activePage_history:1,
            itemsPerPage_history: 6,
            tempData:null, 
            selectedSeverityFilter:{backgroundColor:'#004f68c4',color:'white'},
         is_fetching:false,
         serverIP:process.env.REACT_APP_CLIENT_IP,
         device_id:null,StatusValue:0,deviceData:null,
         hold_alarms:null,options:null,selectedOption: '',
         alarm_history:null,equipStatus:[[],[]],
         severity:{critical:{color:'red',textAlign:'center',fontWeight:'500'},minor:{color:'#7d8d0f',textAlign:'center',fontWeight:'500'},major:{color:'orange',textAlign:'center',fontWeight:'500'},warning:{color:'lightblue',textAlign:'center',fontWeight:'500'}},
         show_filter_popup:false,filter_by_key:null,showAlarm:true,showGraph:false,showThermal:false,showAlarmCurrent:true,
         openFilterPopup:false,typeIDavailable:["AIS","EQPT","LOS","OTS","OPWR"], checked:[],
            Alarmdata:null,pdfDataHistory:null,
          Alarmheaders:null,showReportOptions:false,timestamp_Filter:{start_time:new Date(),stop_time:new Date()},
           csvReport: null,  pdfData: null,csvReportHistory:null,
           showAlarmHistory:false,showAlarmTransition:false,showClearAllAlarmsPopup:false,
           timeDuration:{start_time:"-365d",stop_time:"now()"}
        };
        this._onSelect = this._onSelect.bind(this);
        this.open_filter_popup=this.open_filter_popup.bind(this);
        this.filter_alarms=this.filter_alarms.bind(this);
        this.fetch_active_alarms=this.fetch_active_alarms.bind(this);
        this.sort=this.sort.bind(this);
    }
    componentDidMount(){
        document.addEventListener('click', this.handleDocumentClick);
        this.setDefaultTime()
        this.fetch_active_alarms();
        this.fetchHistoryAlarms();
        this.fetchThermal();
    }
    fetchThermal(){
        fetch(`http://${this.state.serverIP}:5000/configuration-management/device-dashboard/${sessionStorage.getItem('unique_id')}`,
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
        .then(resp =>{ 
        console.log(resp)
            this.setState({tempData:resp.device_health['device-info'].sensor,deviceData:resp.device_health})
        console.log(this.state.tempData)
        var temp = []
            for(let i=0;i<resp.device_health['device-info'].sensor.length;i++){
                temp.push(resp.device_health['device-info'].sensor[i].name)
            }
            this.setState({options:temp})
            console.log(temp)
            const equipStatus = [[], []]; 

            for (const item in resp.device_health['device-info']) {
                if(item!=='CHASSIS'){
                    if (resp.device_health['device-info'].hasOwnProperty(item)) {
                        for (const element of resp.device_health['device-info'][item]) {
                            if(element.state['ipi-alarms:component-alarm']){
                                if (element.state['ipi-alarms:component-alarm']['equipment-failure'] === false) {
                                    equipStatus[1].push(element.name);
                                  } 
                                  else {
                                    equipStatus[0].push(element.name);
                                  }
                            }
                        }
                      }
                }
            }
            this.setState({equipStatus:equipStatus})           
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
    fetch_active_alarms(){
        this.setState({is_fetching:true})
        let device_unique_id = sessionStorage.getItem('unique_id');
        fetch(`http://${this.state.serverIP}:5000/configuration-management/fault/alarms/${device_unique_id}`,
        {
            mode:'cors',
            method:'GET',
            headers:{'Access-Control-Allow-Origin':'http://localhost:3000',
            'username': sessionStorage.getItem('username'),
            'Authorization': 'Bearer ' + JSON.parse(sessionStorage.getItem('login_data')).data.access_token
            },
        })
        .then(resp => resp.json())
        .then(resp => {
    console.log(resp['ipi-alarms:alarms'], 'active-alarm-list1');
    this.setState({ is_fetching: false });

    if (Object.keys(resp).length === 0) {
        alert("No Active Alarms present or Fault Management module is disabled");
    } else if (resp.status) {
        alert(resp.status);
        this.setState({ get_alarms: [] });
    } else {
        const alarms = resp['ipi-alarms:alarms'].alarm;

        if (alarms && alarms.length > 0) {
            const alarmStates = alarms.map(alarm => alarm.state);
            this.setState({ get_alarms: alarmStates });
            this.setState({ get_filtered_alarms: alarmStates });
        } else {
            alert("No Active Alarms present or Fault Management module is disabled");
            this.setState({ get_alarms: [] });
            this.setState({ get_filtered_alarms: [] });
        }
    }
        // this.setState({get_filtered_alarms:this.state.get_alarms})
       
        var Alarmheaders=[
            { label: "Alarm Reported Timestamp", key: "alarm_reported_timestamp" },
            { label: "Alarm Severity", key: "alarm_severity" },
            { label: "ID", key: "id" },
            { label: "Resource", key: "resource" },
            { label: "Text", key: "text" },
            { label: "Time Created", key: "time_created" },
            { label: "Type ID", key: "type_id" }          
        ];
        var Alarmdata = []

        for(let i=0;i<this.state.get_alarms.length;i++){
            let headerDict = {}
            headerDict = {
                alarm_reported_timestamp: this.state.get_alarms[i].state['alarm-reported-timestamp'],
                alarm_severity: this.state.get_alarms[i].state['alarm-severity'],
                id: this.state.get_alarms[i].state['id'],
                resource: this.state.get_alarms[i].state['resource'],
                text: this.state.get_alarms[i].state['text'],
                time_created: this.state.get_alarms[i].state['time-created'],
                type_id: this.state.get_alarms[i].state['type-id']

            }
            Alarmdata.push(headerDict);
        }
        this.setState({pdfData:Alarmdata})
        this.setState({csvReport:{
            data: Alarmdata,
            headers: Alarmheaders,
            filename: 'AlarmReport.csv'
          }})
            } )  
            .catch((err) => {
                if (err.response) {
                  alert(err.response.data.status)
                  console.log('Error Response Data:', err.response.data);
                  console.log('Error Response Status:', err.response.status);
                  console.log('Error Response Headers:', err.response.headers);
                }
              });   
    }
    fetchHistoryAlarms(){
        const {timestamp_Filter}=this.state
        console.log(timestamp_Filter,'time-duration');
        let device_unique_id = sessionStorage.getItem('unique_id');
        fetch(`http://${this.state.serverIP}:5002/fault-management/history-alarms/${device_unique_id}`,
        {
            mode:'cors',
            method:'POST',
            headers:{'Access-Control-Allow-Origin':'http://localhost:3000',
            'Accept':'application/json', 
            'Content-Type':'application/json',
            'username': sessionStorage.getItem('username'),
            'Authorization': 'Bearer ' + JSON.parse(sessionStorage.getItem('login_data')).data.access_token
            },
            body:JSON.stringify(timestamp_Filter)
        })
        .then(resp=>resp.json())    
        .then(resp=>{
            console.log(resp,'alarms HISTROY fetched')	
            if(resp.status){
                this.setState({get_historyAlarms:[]	})	
            }
            else{
                this.setState({get_historyAlarms:resp})	
            }
            this.setState({get_filtered_historyAlarms:resp})	
            var Alarmheaders=[
                { label: "Alarm Reported Timestamp", key: "alarm_reported_timestamp" },
                { label: "Alarm Severity", key: "alarm_severity" },
                { label: "ID", key: "id" },
                { label: "Resource", key: "resource" },
                { label: "Text", key: "text" },
                { label: "Time Created", key: "time_created" },
                { label: "Type ID", key: "type_id" }          
            ];
            var Alarmdata = []
    
            for(let i=0;i<this.state.get_historyAlarms.length;i++){
                let headerDict = {}
                headerDict = {
                    alarm_reported_timestamp: this.state.get_historyAlarms[i]['alarm_reported_timestamp'],
                    alarm_severity: this.state.get_historyAlarms[i]['alarm_severity'],
                    id: this.state.get_historyAlarms[i]['id'],
                    resource: this.state.get_historyAlarms[i]['resource'],
                    text: this.state.get_historyAlarms[i]['text'],
                    time_created: this.state.get_historyAlarms[i]['time_created'],
                    type_id: this.state.get_historyAlarms[i]['type_id']
    
                }
                Alarmdata.push(headerDict);
            }
            this.setState({pdfDataHistory:Alarmdata})
            this.setState({csvReportHistory:{
                data: Alarmdata,
                headers: Alarmheaders,
                filename: 'AlarmHistoryReport.csv'
              }})
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
    fetchAlarmTransition(){
        let device_unique_id = sessionStorage.getItem('unique_id');
        fetch(`http://${this.state.serverIP}:5002/fault-management/alarm-transition/${device_unique_id}`,
              {
                  method:'GET',
                  mode:'cors',
                  headers:{'Access-Control-Allow-Origin':'http://localhost:3000',
                  'username': sessionStorage.getItem('username'),
                  'Authorization': 'Bearer ' + JSON.parse(sessionStorage.getItem('login_data')).data.access_token
                  },
              })
              .then(resp=>resp.json())
              .then(resp=>{
                  console.log(resp,'alarm-transition')
                  if(resp.status){
                    this.setState({alarmTransition:[],get_filteredTransitionAlarms:[]})
                    alert("No Transition Data")
                  }
                  else{
                    this.setState({alarmTransition:resp,get_filteredTransitionAlarms:resp})
                  }
              } ) 
              .catch((err) => {
                if (err.response) {
                  alert(err.response.data.status)
                  console.log('Error Response Data:', err.response.data);
                  console.log('Error Response Status:', err.response.status);
                  console.log('Error Response Headers:', err.response.headers);
                }
              });  
    }
    handleCheck(event) {
        let updatedList = [...this.state.checked];
        if (event.target.checked) {
          updatedList = [...this.state.checked, event.target.value];
        } else {
          updatedList.splice(this.state.checked.indexOf(event.target.value), 1);
        }
        this.setState({ checked: updatedList });
      }
    isChecked(item) {
        return this.state.checked.includes(item)
          ? "checked-item"
          : "not-checked-item";
    }
    clearAllfilter(){
        const {showAlarmCurrent , showAlarmHistory}=this.state
        this.setState({checked:[]})
        this.setDefaultTime()
        this.setState({selectedSeverityFilters:[],openFilterPopup:false})
        if(showAlarmCurrent){this.setState({get_filtered_alarms:this.state.get_alarms})}
        else{this.setState({get_filtered_historyAlarms:this.state.get_historyAlarms})}
    }
    filter_handlechange(e){
        var fetched_alarm=this.state.hold_alarms_bf
        var fetched_alarmh=this.state.hold_alarmsh_bf
        var value=e.target.value
        this.setState({filter_by:e.target.value})
        if(!value){
            this.setState({get_alarms:fetched_alarm,get_listOfAlarms:fetched_alarmh})
            // this.fetch_active_alarms()
        }
    }
    open_filter_popup(id){
        this.setState({show_filter_popup:true,filter_by_key:id})
    }
    filter_alarms() {
        const {showAlarmCurrent, showAlarmHistory}=this.state
        const severityFilters = this.state.selectedSeverityFilters;
        const typeFilter = this.state.checked;
        const timestampFilter=this.state.timestamp_Filter;
        if(showAlarmCurrent){
            var filteredData = this.state.get_alarms;
            // apply severity filters
            console.log(filteredData,"hey");
            if (severityFilters.length) {
                filteredData = filteredData.filter((item) => {
                console.log(item,"hi");
                return severityFilters.includes(item['alarm-severity']);
                });
            }
            // apply type filter
            if (typeFilter.length) {
                filteredData = filteredData.filter((item) => {
                return typeFilter.includes(item['type-id']);
                });
            }
            if (this.state.setFlag) {
                console.log(filteredData,'bhoku')
                filteredData = filteredData.filter((item) => {
                const timestamp = this.convertDateFormat(new Date(item['alarm-reported-timestamp']));
                return timestamp >= new Date(timestampFilter.start) && timestamp <= new Date(timestampFilter.end);
                });
            }
            this.setState({get_filtered_alarms: filteredData})
        }
        else{
            filteredData = this.state.get_historyAlarms;
            if (this.state.setFlag) {
                this.fetchHistoryAlarms()
            }
             // apply severity filters
             if (severityFilters.length) {
                filteredData = filteredData.filter((item) => {
                return severityFilters.includes(item['alarm-severity']);
                });
                console.log('in',filteredData,severityFilters)

            }
            // apply type filter
            if (typeFilter.length) {
                filteredData = filteredData.filter((item) => {
                return typeFilter.includes(item['type-id']);
                });
            }
            if (timestampFilter.start && timestampFilter.end) {
                filteredData = filteredData.filter((item) => {
                    const timestamp = new Date(item['alarm-reported-timestamp']);
                return timestamp >= new Date(timestampFilter.start) && timestamp <= new Date(timestampFilter.end);
                });
            }
            this.setState({
                get_filtered_historyAlarms:filteredData
            });
        }
        // set filtered data in state
        this.setState({
          openFilterPopup: false
        });
    }
    sort(type,category){
        var unsorted_alarm=this.state.hold_alarms
        if(type==='unsort'){
            console.log('in',unsorted_alarm)
            if(category==='active'){
            this.setState({get_alarms:unsorted_alarm})
            }
            else{
         this.setState({get_listOfAlarms:unsorted_alarm})
        }
        }
        else{
            if(category==='active'){
            let sorted_alarm = this.state.get_alarms.sort((a, b) => {
                if(type==='dsc'){ return (b.fault_id-a.fault_id);}
                else{ return (a.fault_id-b.fault_id);}
            });
            this.setState({get_alarms: sorted_alarm  });
        }
        else{
            let sorted_alarm = this.state.get_listOfAlarms.sort((a, b) => {
                if(type==='dsc'){ return (b.fault_id-a.fault_id);}
                else{ return (a.fault_id-b.fault_id);}
            });
            this.setState({get_listOfAlarms: sorted_alarm  });
        }
        }
       
    }
    _onSelect(selectedOption) {
        this.setState({ selectedOption: selectedOption }, () => {
                for(let i=0;i<this.state.deviceData['device-info'].sensor.length;i++){
                    if(this.state.deviceData['device-info'].sensor[i].state.temperature){
                    if(this.state.deviceData['device-info'].sensor[i].name===this.state.selectedOption.value){
                        if(this.state.deviceData['device-info'].sensor[i].state.temperature['alarm-severity']==='indeterminate'){
                            this.setState({StatusValue:125})
                        }
                        else if(this.state.deviceData['device-info'].sensor[i].state.temperature['alarm-severity']==='minor'){
                            this.setState({StatusValue:375})
                        }
                        else if(this.state.deviceData['device-info'].sensor[i].state.temperature['alarm-severity']==='major'){
                            this.setState({StatusValue:625})
                        }
                        else{
                            this.setState({StatusValue:875})
                        }
                    }
                }
            }
        });
    }
    handlePageChange_current = (pageNumber_current) => {
        this.setState({ activePage_current: pageNumber_current });
    }
    handlePageChange_history = (pageNumber_history) => {
        this.setState({ activePage_history: pageNumber_history });
    }
      
    handleSearch(event) {
        const searchTerm = event.target.value;
        this.setState({ searchTerm });
        this.updateFilteredNotificationWithSearchTerm(searchTerm)
    }  

    updateFilteredNotificationWithSearchTerm(searchTerm) {
        const { get_alarms,showAlarmCurrent,showAlarmHistory,get_historyAlarms} = this.state;
        if(showAlarmCurrent){
            if (!searchTerm) {
                this.setState({ get_filtered_alarms: get_alarms });
            } else {
                const lowerCaseSearchTerm = searchTerm.toLowerCase();
                const filteredAlarms = get_alarms.filter(notification => {
                    for (const key in notification) {
                        if (typeof notification[key] === 'string' && notification[key].toLowerCase().includes(lowerCaseSearchTerm)) {
                            return true;
                        }
                    }
                    return false;
                });
                this.setState({ get_filtered_alarms: filteredAlarms});
            }
        }
        else if(showAlarmHistory){
            if (!searchTerm) {
                this.setState({ get_filtered_historyAlarms: get_historyAlarms });
            } else {
                const lowerCaseSearchTerm = searchTerm.toLowerCase();
                const filteredAlarms = get_historyAlarms.filter(notification => {
                    for (const key in notification) {
                        if (typeof notification[key] === 'string' && notification[key].toLowerCase().includes(lowerCaseSearchTerm)) {
                            return true;
                        }
                    }
                    return false;
                });
                this.setState({ get_filtered_historyAlarms: filteredAlarms});
            }
        }  
    }
        
    sortTable = (column) => {
        if(this.state.showAlarmHistory === false)
        {
 
    const { sortColumn, sortDirection, get_filtered_alarms } = this.state;
    console.log(get_filtered_alarms,"hey");
    let direction = 'asc';
    if (sortColumn === column && sortDirection === 'asc') {
        direction = 'desc';
        this.setState({sortOrder:'desc'})
    }
    else{
        this.setState({sortOrder:'asc'})
    }
    if(column === "timestamp"){
        const sortedItems = get_filtered_alarms.sort((a, b) => {
            
            const aValue = a["alarm-reported-timestamp"]
            const bValue = b["alarm-reported-timestamp"]
           
            const aDate = new Date(Date.parse(aValue.replace(/(\d\d)\s(\w\w\w)\s(\d{4})/, "$2 $1 $3")));
            const bDate = new Date(Date.parse(bValue.replace(/(\d\d)\s(\w\w\w)\s(\d{4})/, "$2 $1 $3")));
            const diff= aDate - bDate;;
            if (direction === 'asc') {
            return diff;
            } else {
            return -diff;
            }
    });
        this.setState({
            get_filtered_alarms: sortedItems,
            sortColumn: column,
            sortDirection: direction,
            selectedthSort: column
            });        
    }
        else{
        const sortedItems = get_filtered_alarms.sort((a, b) => {
            console.log(a,"a");
            console.log(b,"Hey im B");
          
            const aValue = a[column].toString().toLowerCase();
            const bValue = b[column].toString().toLowerCase();
        
            const aMatch = aValue.match(/^(\D*)(\d*(?:\.\d*)?)(.*)$/);
            const bMatch = bValue.match(/^(\D*)(\d*(?:\.\d*)?)(.*)$/);
        
            const aChars = aMatch[1];
            const bChars = bMatch[1];
        
            if (aChars < bChars) {
            return direction === 'asc' ? -1 : 1;
            }
            if (aChars > bChars) {
            return direction === 'asc' ? 1 : -1;
            }
        
            const aNum = parseFloat(aMatch[2]);
            const bNum = parseFloat(bMatch[2]);
        
            if (aNum < bNum) {
            return direction === 'asc' ? -1 : 1;
            }
            if (aNum > bNum) {
            return direction === 'asc' ? 1 : -1;
            }
        
            const aRemainder = aMatch[3];
            const bRemainder = bMatch[3];
        
            if (aRemainder < bRemainder) {
            return direction === 'asc' ? -1 : 1;
            }
            if (aRemainder > bRemainder) {
            return direction === 'asc' ? 1 : -1;
            }
            return 0;
        });
        
        this.setState({
            get_filtered_alarms: sortedItems,
            sortColumn: column,
            sortDirection: direction,
            selectedthSort: column
        });
    }  
}
    
else{ 
        const { sortColumn, sortDirection,get_filtered_historyAlarms } = this.state;
        console.log("fil",get_filtered_historyAlarms);
        let direction = 'asc';
        if (sortColumn === column && sortDirection === 'asc') {
            direction = 'desc';
            this.setState({sortOrder:'desc'})
        }
        else{
            this.setState({sortOrder:'asc'})
        }
        if(column === "timestamp"){
            const sortedItems = get_filtered_historyAlarms.sort((a, b) => {
                
                const aValue = a["alarm-reported-timestamp"]
                const bValue = b["alarm-reported-timestamp"]
            
                const aDate = new Date(Date.parse(aValue.replace(/(\d\d)\s(\w\w\w)\s(\d{4})/, "$2 $1 $3")));
                const bDate = new Date(Date.parse(bValue.replace(/(\d\d)\s(\w\w\w)\s(\d{4})/, "$2 $1 $3")));
                const diff= aDate - bDate;;
                if (direction === 'asc') {
                return diff;
                } else {
                return -diff;
                }
            });
            this.setState({
                get_filtered_historyAlarms: sortedItems,
                sortColumn: column,
                sortDirection: direction,
                selectedthSort: column
                });
            }
            else{
            const sortedItems = get_filtered_historyAlarms.sort((a, b) => {
                console.log(a,"a");
                console.log(b,"Hey im B");
                if (a[column] && b[column])
                {
                const aValue = a[column].toString().toLowerCase();
                const bValue = b[column].toString().toLowerCase();
            
                const aMatch = aValue.match(/^(\D*)(\d*(?:\.\d*)?)(.*)$/);
                const bMatch = bValue.match(/^(\D*)(\d*(?:\.\d*)?)(.*)$/);
            
                const aChars = aMatch[1];
                const bChars = bMatch[1];
            
                if (aChars < bChars) {
                return direction === 'asc' ? -1 : 1;
                }
                if (aChars > bChars) {
                return direction === 'asc' ? 1 : -1;
                }
            
                const aNum = parseFloat(aMatch[2]);
                const bNum = parseFloat(bMatch[2]);
            
                if (aNum < bNum) {
                return direction === 'asc' ? -1 : 1;
                }
                if (aNum > bNum) {
                return direction === 'asc' ? 1 : -1;
                }
            
                const aRemainder = aMatch[3];
                const bRemainder = bMatch[3];
            
                if (aRemainder < bRemainder) {
                return direction === 'asc' ? -1 : 1;
                }           
                if (aRemainder > bRemainder) {
                return direction === 'asc' ? 1 : -1;
                }
            
                return 0;
            }});
            
            this.setState({
                get_filtered_historyAlarms: sortedItems,
                sortColumn: column,
                sortDirection: direction,
                selectedthSort: column
            });
                  }
    }
}

    exportPDF = (id) => {
    var currentTime=new Date().toLocaleString().replace(/:/g, '-');
    const unit = "pt";
    const size = "A4"; // Use A1, A2, A3 or A4
    const orientation = "portrait"; // portrait or landscape
    const marginLeft = 40;
    const doc = new jsPDF(orientation, unit, size);
    doc.setFontSize(15);
    const title = "Alarm Report";
    const headers = [["Alarm Reported Timestamp", "Alarm Severity","ID","Resource","Text","Time Created","Type ID"]];
    console.log(this.state.get_filtered_historyAlarms)
    if(id!=='history'){
        var data = this.state.get_filtered_alarms.map(elt=> [elt.state["alarm-reported-timestamp"], elt.state["alarm-severity"], elt.id, elt.state.resource, elt.state.text, elt.state["time-created"], elt.state["type-id"]]);
    }
    else{
        data = this.state.get_filtered_historyAlarms.map(elt=> [elt.alarm_reported_timestamp, elt.alarm_severity, elt.id, elt.resource, elt.text, elt.time_created, elt.type_id ]);
    }

    let content = {
        startY: 50,
        head: headers,
        body: data
    };

    doc.text(title, marginLeft, 40);
    doc.autoTable(content);
    if(id!=='history'){
        doc.save(`AlarmReport ${currentTime}.pdf`)
    }
    else{
        doc.save(`AlarmHistoryReport ${currentTime}.pdf`)
    }
    }
    showAlarmState(type){
        console.log(this.state.showAlarmCurrent,type)
        if(type==="current"){this.setState({showAlarmCurrent:true,showAlarmHistory:false,showAlarmTransition:false})}
        else if(type==="history"){this.setState({showAlarmCurrent:false,showAlarmHistory:true,showAlarmTransition:false})}
        else{
            this.fetchAlarmTransition();
            this.setState({showAlarmCurrent:false,showAlarmHistory:false,showAlarmTransition:true})}
    }
    setDefaultTime(){
        const {timestamp_Filter}=this.state
        var currentDate = new Date();
        var oneYearAgo = new Date(currentDate);
        oneYearAgo.setFullYear(currentDate.getFullYear() - 1);
        currentDate=this.convertDateFormat(currentDate);
        oneYearAgo=this.convertDateFormat(oneYearAgo);
        timestamp_Filter["start_time"]=oneYearAgo
        timestamp_Filter["stop_time"]=currentDate
        this.setState({timestamp_Filter})
    }
    convertDateFormat(inputDateStr) {
        const inputDate = new Date(inputDateStr);
        return inputDate.toISOString(); // Returns date in ISO 8601 format
    }
    clearAllAlarms(){
        let deviceID = sessionStorage.getItem('unique_id');
        var temp={"@xmlns":"http://www.ipinfusion.com/yang/ocnos/ipi-logging"}
        fetch(`http://${this.state.serverIP}:5000/configuration-management/rpc/logging-fms-flush-db/${deviceID}`, {                     
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
        .then(resp=>{
            console.log(resp,'disable-alarm-response')        
            this.fetch_active_alarms()   
            } )
            .catch((err) => {
                if (err.response) {
                  alert(err.response.data.status)
                  console.log('Error Response Data:', err.response.data);
                  console.log('Error Response Status:', err.response.status);
                  console.log('Error Response Headers:', err.response.headers);
                }
              });     
    } 
    callAlarmClose(id){
        let deviceID = sessionStorage.getItem('unique_id');
        var temp={
            "@xmlns":"http://www.ipinfusion.com/yang/ocnos/ipi-logging",
            "active-alarm-id":id
        }
        console.log(temp,'alarm-close')
        fetch(`http://${this.state.serverIP}:5000/configuration-management/rpc/logging-fms-close/${deviceID}`, {                     
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
        .then(resp=>{
            console.log(resp,'alarm-close-response')   
            if(resp.status){
                if(resp.status['rpc-reply']){
                    alert('SUCCESS');
                    this.fetch_active_alarms()
                }
                else{
                    alert(resp.status.message)
                }
            }        
            } )  
            .catch((err) => {
                if (err.response) {
                  alert(err.response.data.status)
                  console.log('Error Response Data:', err.response.data);
                  console.log('Error Response Status:', err.response.status);
                  console.log('Error Response Headers:', err.response.headers);
                }
              });  
    }
    showAlarmPanelTabs(type){
        if(type==='alarm-list'){
            this.setState({showAlarm:true,showGraph:false,showThermal:false})
        }
        else if(type==='alarm-graphs'){
            this.setState({showAlarm:false,showGraph:true,showThermal:false,openFilterPopup:false})
        }
        else if(type==='alarm-thermal'){
            this.setState({showAlarm:false,showGraph:false,showThermal:true,openFilterPopup:false})
        }
        else if(type==='alarm-shelve'){
            this.setState({openFilterPopup:false,showShelveOptions:true,showReportOptions:false})
        }
        else if(type==='alarm-filter'){
            if(this.state.openFilterPopup){
                this.setState({openFilterPopup:false})
            }
            else{
                this.setState({openFilterPopup:true})
            }
            this.setState({showShelveOptions:false,showReportOptions:false})

        }
        else if(type==='alarm-report'){
            this.setState({openFilterPopup:false,showShelveOptions:false,showReportOptions:true})
        }

    }
    toggleDropdown = () => {
        this.setState((prevState) => ({
          isOpen: !prevState.isOpen
        }));
    };
    toggleDropdownShelve = () => {
    this.setState((prevState) => ({
        isOpenShelve:!prevState.isOpenShelve
    }));
    };
    
    handleDocumentClick = (event) => {
        if (this.dropdownRef && !this.dropdownRef.contains(event.target)) {
          this.setState({
            isOpen: false
          });
        }
        if (this.dropdownRef1 && !this.dropdownRef1.contains(event.target)) {
            this.setState({
                isOpenShelve: false
            });
      };
    }
    componentWillUnmount() {
        document.removeEventListener('click', this.handleDocumentClick);
    }
    toggleDarkMode = () => {
        console.log("innetw")
        this.setState((prevState) => ({ isDarkMode: !prevState.isDarkMode }));
      };
    render(){
        const { isDarkMode } = this.state;
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
        const { isOpenShelve,isOpen,searchTerm, searchCount, currentIndex } = this.state;
        const currentResultIndex = currentIndex > 0 ? currentIndex : searchCount;
        const { activePage_current,activePage_history,itemsPerPage_current,itemsPerPage_history,get_filtered_alarms, get_filtered_historyAlarms ,get_filteredTransitionAlarms } = this.state;	
        const indexOfLastItem_current = activePage_current * itemsPerPage_current;
        const indexOfFirstItem_current = indexOfLastItem_current - itemsPerPage_current;
        const indexOfLastItem_history = activePage_history * itemsPerPage_history;
        const indexOfFirstItem_history = indexOfLastItem_history - itemsPerPage_history;
        const currentItems = get_filtered_alarms.slice(indexOfFirstItem_current, indexOfLastItem_current);
        const currentHistoryItems = get_filtered_historyAlarms.slice(indexOfFirstItem_history, indexOfLastItem_history);
        const currentAlarmTransition = get_filteredTransitionAlarms.slice(indexOfFirstItem_history, indexOfLastItem_history);
        var shelveType=[];
        if (get_filtered_alarms.length > 0) {
            for (let i = 0; i < get_filtered_alarms.length; i++) {
                var type = get_filtered_alarms[i]['id'].split("::")[0];
                if (!shelveType.includes(type)) {
                    shelveType.push(type);
                }
            }
        }
        return(
            <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
                <div style={{height:"100vh"}}  className={isDarkMode ? 'dark-mode' : 'light-mode'}>
                    <div style={{ backgroundColor: isDarkMode ? darkTheme.palette.background.default : lightTheme.palette.background.default }}>
                    <div style={{display:'flex'}}>
                    <NewLeftpanel page='file' darkMode={this.state.isDarkMode}/>
                    <div style={{flex:'4'}}>
                        <div className='head_cover' style={{ backgroundColor: isDarkMode ? darkTheme.palette.background.default : lightTheme.palette.background.default}}>
                            <NewHeader header_name='File Management Panel' path='file' darkMode={this.state.isDarkMode} toggleDarkMode={this.toggleDarkMode}/>
                        </div>
                        
                        <div className='mainContent' style={{marginLeft:'21%',marginTop:'9%',height:'100%',backgroundColor:'white'}}>
                        {this.state.is_fetching===true?(
                            <div><Loading/></div>
                        ):null}
                            <div style={{display:'flex',padding:'10px'}}>
                                <div className='tabbox'>
                                        <img alt="" className='tabicon' src={require('../Images/search.png')}></img>
                                        <input placeholder='Enter O-RU Path here to search for file' style={{border:'0',height:'90%',width:'272px'}}
                                            id={1}
                                            type="text"
                                            value={this.state.ruPathName}
                                            onChange={(e)=>{this.setState({ruPathName:e.target.value})}}
                                            onKeyPress={this.handleKeyPress.bind(this)}>
                                        
                                        </input>
                                </div>
                                <div style={{display:'flex',marginLeft:'34%'}}>
                                    <div className='tabbox' onClick={(e)=>this.setState({openPathPopUp:true})}>
                                            <img alt="" className='tabicon' src={require('../Images/report.png')}></img>
                                            Enter SFTP Server Details
                                    </div>
                                    <div className='tabbox' onClick={(e)=>this.setState({openFile:true})}>
                                            <img alt="" className='tabicon' src={require('../Images/upload_file.png')}></img>
                                            Upload File
                                    </div>
                                </div>
                                {this.state.openPathPopUp?(
                                    <div className='popupSoft'>
                                        <div className='popup-innerSoft'style={{height:'fit-content'}}>
                                        <div style={{color:"#e13a3ae",fontWeight:"500"}}>Configure SFTP Server:</div>
                                            <img onClick={(e)=>this.setState({openPathPopUp:false})} className='close-buttonSoft' src={close} alt='' width={15}/>
                                            <div className='popup-contentSoft'>
                                                <div className='system-update-details'>
                                                    <div style={{display:'flex',justifyContent:'center',alignContent:'center',flexDirection:'column'}}>
                                                        <div>
                                                            <div className='fileErrorField'>{this.state.errorField}</div>
                                                            {this.renderInputField('Hostname:', 'sftp_download_hostname')}
                                                            {this.renderInputField('Username:', 'sftp_download_username')}
                                                            {this.renderInputField('Password:', 'sftp_download_password')}
                                                            {this.renderInputField('Path:', 'sftp_download_path')}

                                                        </div>
                                                        <div className='cancelRole' style={{marginTop:'9%',width:'30%',marginLeft:'67%'}} onClick={()=>this.configureSFTPserver()}>Confirm</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ):null}
                            </div>
                            {this.state.get_file_list?(
                                    <table className='fileTable'>
                                    <thead className='thead'>
                                        <tr className='tr'>
                                        <th className='th'>File Name</th>
                                        <th className='th'></th>
                                        </tr>
                                    </thead>
                                    <tbody className='tbody'>
                                    {this.state.get_file_list.map((item)=>(
                                            <tr className='tr'>
                                            <td className='td'><strong style={{cursor:'pointer'}} onClick={()=>this.updatePath(item)}>{item}</strong></td>
                                            <td className='td'>{item.includes('.')?(<div onClick={()=>this.fetch_file_download(item)}><img alt="" style={{width:'30px',height:'100%',cursor:'pointer'}} src={require('../Images/download.png')}/></div>):null}</td>
                                            </tr>
                                    ))}
                                    </tbody>
                                </table>
                            ):null}
                
                            {this.state.openFile?(
                                <div className='popupSoft'>
                                    <div className='popup-innerSoft'>
                                    <div>File Upload</div>
                                    <img onClick={(e)=>this.setState({openFile:false})} className='close-buttonSoft' src={close} alt='' width={15}/>
                                        <div className='popup-contentSoft'>
                                        <div>
                                        <div style={{display:'flex',flexDirection:'column',alignItems:'center',marginTop:'20px'}}>
                                            <img alt="" className='state_image' style={{marginTop:'10px'}} src={require('../Images/upload_dash.png')}></img>
                                            <div style={{display:'flex'}}>
                                                <p className='state_text_top' style={{marginLeft:'-30%'}}>{this.state.upload_state}</p>
                                                <input style={{width:'137px',fontSize:'9.5px',height:'22px',marginTop:'12px'}} type="file" ref={this.el} onChange={(e)=>this.handleChange(e)}>
                                                </input>
                                            </div>
                                            <div className='cancelRole' style={{marginTop:'9%',width:'30%',marginLeft:'10%'}} onClick={()=>this.upload_file(this.state.file)}>Upload</div>

                                            </div>
                                        </div>
                                        </div>
                                    </div>
                                </div>
                            ):null}
                        </div>
                    </div>
                    </div>
                    </div>
                </div>
            </ThemeProvider>
        )
    }
}
export default FaultPanel;