import React from 'react';
import Loading from './loader';
import { CSVLink } from "react-csv";
import jsPDF from "jspdf";
import "jspdf-autotable";
import sortDown from '../Images/dropDown.png'
import sortUp from '../Images/arrow-up.png';
import back from '../Images/back.png';
import close from '../Images/closeS.png';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import DatePicker from 'react-datepicker';
import Pagination from "react-js-pagination";
import { PageItem as BootstrapPageItem } from 'react-bootstrap';
import Swal from 'sweetalert2';
import downArrow from '../Images/dropDown.png';
import upArrow from '../Images/arrow-up.png';
import CustomTime from '../Components/customTime';
class SLAPerformanceStats extends React.Component{
    constructor(props){
        super(props);
        this.state={
          serverIP:process.env.REACT_APP_CLIENT_IP,
          deviceList:this.props.connectedDevices,
          showDeviceList:true,
          ipSlaStatistics:null,
          selectedDeviceList:[],
          activeFilters:[],
          uniqueColumnValues:{},
          checkedOptions:[],
          activePage: 1,
          itemsPerPage: 5,
          filteredStats:null,
          slaParamsList:{
            'average-round-trip-delay':[],
            'elapsed-time':[],
            'invalid-tests':[],
            'maximum-round-trip-delay':[],
            'minimum-round-trip-delay':[],
            'packets-lost':[],
            'packets-received':[],
            'packets-sent':[],
            'start-time':[]
          },
          selectedSlaParams:[],
          timestamp_Filter:null,
          slaCurrentData:null,
          operationsValue:['mean','max','min'],selectedOperationsValue:[],
          unique_id_sla:null,
          showMinTable: true,
          showMaxTable: true,
          showMeanTable: true
          
        };
        this.fetchIPSLAStatistics=this.fetchIPSLAStatistics.bind(this);
        this.fetchCustomizedStats=this.fetchCustomizedStats.bind(this);
        this.generateSlaPDF=this.generateSlaPDF.bind(this);
        this.dataCallBackHandler=this.dataCallBackHandler.bind(this);
        this.submitCustom=this.submitCustom.bind(this);
    }
    
    fetchIPSLAStatistics(){
        var temp={"unique_id_list":this.state.selectedDeviceList}
        console.log(temp)
  
        fetch(`http://${this.state.serverIP}:5000/configuration-management/performance-bottlenecks`,
          {
            mode: "cors",
            method: "POST",
            headers: {
              "Access-Control-Allow-Origin": "http://localhost:3000",
              'Accept':'application/json', 
              'username': sessionStorage.getItem('username'),
              'Content-Type':'application/json'  ,
            },
            body:JSON.stringify(temp)
          }
        ).then((resp) => resp.json())
          .then((resp) => {
            this.setState({is_fetching:false,showDeviceList:false})
            console.log(resp,'ip-sla-statistics')
            this.setState({ipSlaStatistics:resp})
            var finalList = [];

            Object.keys(resp).forEach((key) => {
              if (Array.isArray(resp[key])) {
                const newArray = resp[key].map((item) => ({
                  identifier: item.identifier,
                  uniqueID: key,
                  ...item["ip-sla-statistics"].state,
                }));
                finalList = finalList.concat(newArray);
              }
            });
            this.setState({filteredStats:finalList,staticStats:finalList})
            console.log(finalList, "finalList");
          })
          .catch((err) => {
            this.setState({is_fetching:false})
            if (err.response) {
              alert(err.response.data.status)
              console.log('Error Response Data:', err.response.data);
              console.log('Error Response Status:', err.response.status);
              console.log('Error Response Headers:', err.response.headers);
            }
          }); 
    }
     
    generateSLAReport(){
        this.setState({is_fetching:true});
        this.fetchIPSLAStatistics();
    }

    handlePageChange = (pageNumber) => {
      this.setState({ activePage: pageNumber });
  }

    generateSlaPDF(){
      const data = this.state.ipSlaStatistics;
      var currentTime = new Date().toLocaleString().replace(/:/g, '-');
      const unit = "pt";
      const size = "A4";
      const orientation = "portrait";
      const marginLeft = 40;
      const marginTop = 40;
      const doc = new jsPDF(orientation, unit, size);
    
      doc.setFontSize(15);
      doc.setTextColor(0, 0, 255);
      const title = "SLA Stats Report ";
      doc.text(title, marginLeft, marginTop);
      doc.setTextColor(0, 0, 0);
    
      const tableData = [];
    
      for (const uniqueid in data) {
        const entries = data[uniqueid];
    
        if (Array.isArray(entries)) { // Check if entries is an array
          for (const entry of entries) {
            const stats = entry["ip-sla-statistics"]["state"];
            const row = {
              uniqueID: uniqueid,
              identifier: entry.identifier, // Add identifier to the row
            };
    
            for (const prop in stats) {
              if (prop !== "name") {
                const cellValue = ` ${stats[prop]}`;
                row[prop] = cellValue;
              }
            }
    
            tableData.push(row); // Add row to the table data
          }
        }
      }
    
      console.log(tableData, 'tabledata');
      const tableColumns = Object.keys(tableData[0]);
      doc.autoTable({
        head: [tableColumns],
        body: tableData.map((row) => Object.values(row)),
        startY: marginTop + 50,
        margin: { left: marginLeft, right: marginLeft },
        styles: {
          fontSize: 4.5, // Adjust the font size here as needed
        },
      });
      const now = new Date();
      const formattedDate = now.toLocaleString().replace(/:/g, '-');
      const fileName = `SLA stats report_${formattedDate}${currentTime}.pdf`;
    
      doc.save(fileName);
    };
    
    handleselectedDevicesToCompare = (event, item) => {
      const { value, checked } = event.target;
      let updatedList;
    console.log(checked)
      if (value === "selectAll") {
        console.log("insie")
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
    
    openFilterTab = (header) => {
      this.setState((prevState) => ({
        activeFilters: {
          ...prevState.activeFilters,
          [header]: true,
        },
      }), () => {
        const values = this.getUniqueColumnValues(this.state.filteredStats, header);
        this.setState((prevState) => ({
          uniqueColumnValues: {
            ...prevState.uniqueColumnValues,
            [header]: values,
          },
        }));
      });
    };
  
    closeFilterTab = (header) => {
      this.setState((prevState) => ({
        activeFilters: {
          ...prevState.activeFilters,
          [header]: false, 
        },
      }));
    };
 
  getUniqueColumnValues = (data, column) => {
    const uniqueValues = new Set();

    (data).forEach((entry) => {
      uniqueValues.add(entry[column]);
      
    });

    return Array.from(uniqueValues);
  };

  handleCheckboxFoFilter = (option) => {
    const updatedCheckedOptions = [...this.state.checkedOptions];
    const optionIndex = updatedCheckedOptions.indexOf(option);
    if (optionIndex === -1) {
      updatedCheckedOptions.push(option);
    } else {
      updatedCheckedOptions.splice(optionIndex, 1)
    }
    this.setState({ checkedOptions: updatedCheckedOptions });
  };
  
  sortTable = (e, key, sortOrder) => {
    const { filteredStats } = this.state;
  
    const sortedItems = filteredStats.slice(0); // Create a copy to avoid mutating the original data
  
    sortedItems.sort((a, b) => {
      const aValue = a[key];
      const bValue = b[key];
  
      if (sortOrder === 'asc') {
        if (aValue < bValue) return -1;
        if (aValue > bValue) return 1;
      } else if (sortOrder === 'desc') {
        if (aValue < bValue) return 1;
        if (aValue > bValue) return -1;
      }
      return 0;
    });
    this.closeFilterTab(key)
    this.setState({
      filteredStats: sortedItems,
      sortColumn: key,
      sortDirection: sortOrder,
      selectedthSort: key,
    });
  
  };

  applyFilter = (header) => {
    const {checkedOptions ,filteredStats, staticStats} = this.state;
    console.log(checkedOptions,filteredStats,header)
    if (checkedOptions.length > 0) {
      const filteredTable = filteredStats.filter((stat) => {
        return checkedOptions.includes(stat[header]);
      });
  
      this.setState({ filteredStats:filteredTable });
    } else {
      this.setState({ filteredStats: staticStats });
    }
    this.closeFilterTab(header)
    };

  handleStatsType = (statsType) => {
      console.log(statsType)
      this.setState({ selectedStatsType: statsType });
  };
  handleDeviceType = (device) => {
    this.setState({ selectedDevice: device });
  };

  handleSlaParamChange(option) {
    if(option === "select"){
      const allParamsSelected = this.state.selectedSlaParams.length === Object.keys(this.state.slaParamsList).length;
      if (allParamsSelected) {
          this.setState({ selectedSlaParams: [] });
      } else {
          // Select all components
          this.setState({ selectedSlaParams: [...Object.keys(this.state.slaParamsList)] });
      }
    }
    else{
      const selectedSlaParams = [...this.state.selectedSlaParams];
      const index = selectedSlaParams.indexOf(option);
      if (index === -1) {
          selectedSlaParams.push(option);
      } else {
          selectedSlaParams.splice(index, 1);
      }
      console.log(selectedSlaParams);
      this.setState({ selectedSlaParams });
    }
   
  }

  handleOperationsChange(option) {
    if (option === "select") {
      const allOperationsSelected = this.state.selectedOperationsValue.length === this.state.operationsValue.length;
      if (allOperationsSelected) {
          // Deselect all interfaces
          this.setState({ selectedOperationsValue: [] });
      } else {
          // Select all interfaces
          this.setState({ selectedOperationsValue: [...this.state.operationsValue] });
      }
    } else{
        const selectedOperationsValue = [...this.state.selectedOperationsValue];
        const index = selectedOperationsValue.indexOf(option);
        if (index === -1) {
            selectedOperationsValue.push(option);
        } else {
            selectedOperationsValue.splice(index, 1);
        }
        console.log(selectedOperationsValue);
        this.setState({ selectedOperationsValue });
      }
  }
   

  fetchCustomizedStats() {
    this.setState({is_fetching:true})
    const { timestamp_Filter, selectedSlaParams, selectedDeviceList ,selectedOperationsValue } = this.state;

    var temp = {
        start_time:timestamp_Filter.start_time,
        stop_time:timestamp_Filter.stop_time,
        interval:timestamp_Filter.interval,
        unique_ids: selectedDeviceList,
        measurements: [],
        fields: [],
        operations: [],
    };
    temp.measurements.push("sla");
    for (let i = 0; i < selectedSlaParams.length; i++) {
        temp.fields.push(selectedSlaParams[i]);
    }
    for (let i = 0; i < selectedOperationsValue.length; i++) {
      temp.operations.push(selectedOperationsValue[i]);
    }
    console.log(temp,"post-body")
    fetch(`http://${this.state.serverIP}:5001/performance-management/dynamic-report`, {
        method: 'POST',
        mode: 'cors',
        headers: {
        'Access-Control-Allow-Origin': 'http://localhost:3000',
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'username': sessionStorage.getItem('username'),
        },
        body: JSON.stringify(temp)
    })
    .then(resp => resp.json())
    .then(resp => {
        this.setState({ slaCurrentData: resp ,is_fetching:false});
        console.log(resp, 'slarCurrentDataa');
        if (resp.length >= 1) {
          const unique_id_sla = {};
          for (let i = 0; i < resp.length; i++) {
            if (resp[i].report && resp[i]["unique_id"]) {
              unique_id_sla[resp[i]["unique_id"]] = resp[i].report;
            }
          }
          console.log(unique_id_sla)
          this.setState({ unique_id_sla });
        }
        
    })
    .catch((err) => {
        if (err.response) {
        Swal.fire({
            position: 'center',
            title: err.response.data.status,
            icon: 'error',
            showConfirmButton: true,
            showCancelButton: false,
            confirmButtonText: 'OK',
            confirmButtonColor: '#116C39',
            customClass: {
            title: 'custom-swal-title',
            },
        });
        console.log('Error Response Data:', err.response.data);
        console.log('Error Response Status:', err.response.status);
        console.log('Error Response Headers:', err.response.headers);
        }
    });

  }

  renderTable(data) {
    console.log(data, "table");
    const tableData = [];
    if(Object.keys(data).length>=1){
      const slaTypes = new Set();
      Object.values(data).forEach((timeData) => {
          Object.keys(timeData).forEach((slaType) => {
              slaTypes.add(slaType);
          });
      });

      Object.entries(data).forEach(([time, timeData]) => {
          Object.entries(timeData).forEach(([slaType, slaData]) => {
              const rowData = {
                  Time: time,
                  'SLA Type': slaType,
              };
              // Adding fields present in slaData
              Object.assign(rowData, slaData);
              tableData.push(rowData);
          });
      });

    const slaFields = Object.keys(tableData[0]).filter(field => field !== 'Time' && field !== 'SLA Type');
    const tableHeaders = ['Time', 'SLA Type', ...slaFields];

    return (
      <div style={{maxHeight:"350px",overflow:"auto"}}>
        <table className='entry-container' style={{width:"100%",fontSize:"14px"}}>
            <thead style={{boxShadow:"2px 2px 4px rgb(120 100 100 / 10%",fontSize:"15px",background:"#b7b1b11c",color:"#3e3b3b"}}>
                <tr>
                    {tableHeaders.map((header, index) => (
                        <th key={index}>{header}</th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {tableData.map((rowData, rowIndex) => (
                    <tr key={rowIndex}>
                        {tableHeaders.map((header, colIndex) => (
                            <td key={colIndex}>{rowData[header]}</td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
      </div>
    );
    }
    else{
      return(
        <div>NO DATA</div>
      )
    }
  }

  toggleTable = (tableName) => {
    this.setState(prevState => ({
      [tableName]: !prevState[tableName]
    }));
  }

  dataCallBackHandler(data){
    console.log(data);
    this.setState({timestamp_Filter:data})
  }
  submitCustom(data){
    console.log(data);
    this.setState({timestamp_Filter:data})
  }
  
  render() {
    
      const{activePage,slaParamsList,itemsPerPage,deviceList,showDeviceList,ipSlaStatistics,selectedDeviceList,activeFilters,uniqueColumnValues,filteredStats,
        selectedStatsType,selectedSlaParams,operationsValue,selectedOperationsValue,unique_id_sla,selectedDevice,
      }=this.state;
      const { showMinTable, showMaxTable, showMeanTable } = this.state;
      const tableHeaders = ['uniqueID',"identifier",'average-round-trip-delay','elapsed-time','invalid-tests','maximum-round-trip-delay','minimum-round-trip-delay','packets-lost','packets-received','packets-sent','start-time'];
      const indexOfLastItem = activePage * itemsPerPage;
      const indexOfFirstItem = indexOfLastItem - itemsPerPage;
      let currentItems;
      if(filteredStats)
      {
      currentItems = filteredStats.slice(indexOfFirstItem, indexOfLastItem);
      }
      
      return (
          <div style={{backgroundColor:'white',margin:'1%',width:'98%'}}>

              {!unique_id_sla && deviceList && showDeviceList?(
                <div style={{display:"flex"}}>
                  <div className='deviceListCheckbox' >
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
                              <div style={{paddingLeft:"37%"}}>Select All</div>
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

                  <div className='sla-Stats-Box' >
                    {selectedDeviceList.length>=1?( 
                    <div>                        
                      <div style={{display:"flex",marginTop:"4%"}}>
                        <DropdownButton
                            id="network-dropdown"
                            title={selectedStatsType || "Choose Type"} 
                            onSelect={this.handleStatsType}
                            drop="down"
                            style={{ zIndex: 1000,marginLeft:"-10px"}}
                            className="custom-dropdown"
                            >
                            {["Current Stats", "Customized Stats"].map((statsType, optionIndex) => (
                                <Dropdown.Item key={optionIndex} eventKey={statsType}>
                                {statsType}
                                </Dropdown.Item>
                            ))}
                        </DropdownButton>

                        {selectedStatsType==="Customized Stats"?(
                          <>
                            <DropdownButton
                            id="stats-dropdown"
                            title={"Choose SLA Params"}
                            drop="down"
                            style={{ marginLeft: "5%"}}
                            className="custom-dropdown"
                            >
                            <Dropdown.Item key={0}  style={{ fontSize: "small" }}>
                                <div key={"select"} style={{ display: 'flex', alignItems: 'center'}} onClick={(e) => e.stopPropagation()}>
                                    <div style={{ marginRight: '10px' }}>Select All</div>
                                    <input
                                        type="checkbox"
                                        value={"select"}
                                        checked={this.state.selectedSlaParams.length === Object.keys(this.state.slaParamsList).length}
                                        onChange={(e) => {
                                          this.handleSlaParamChange(e.target.value);
                                        }}
                                    />
                                </div>
                            </Dropdown.Item> 
                            {Object.keys(slaParamsList).map((param, index) => (
                                <Dropdown.Item key={index} eventKey={param} style={{ fontSize: "small" }}>
                                    <div key={param} style={{ display: 'flex', alignItems: 'center'}} onClick={(e) => e.stopPropagation()}>
                                        <div style={{ marginRight: '10px' }}>{param}</div>
                                        <input
                                            type="checkbox"
                                            value={param}
                                            checked={selectedSlaParams.includes(param)}
                                            onChange={(e) => {
                                                this.handleSlaParamChange(e.target.value);
                                            }}
                                        />
                                    </div>
                                </Dropdown.Item>
                            ))}
                            </DropdownButton>

                            <DropdownButton
                                  id="operations-dropdown"
                                  style={{ marginLeft: "5%"}}
                                  title={"Choose Operation"}
                                  drop="down"
                                  className="custom-dropdown"
                                  >
                                    <Dropdown.Item key={0}  style={{ fontSize: "small" }}>
                                        <div key={"select"} style={{ display: 'flex', alignItems: 'center'}} onClick={(e) => e.stopPropagation()}>
                                            <div style={{ marginRight: '10px' }}>Select All</div>
                                            
                                            <input
                                                type="checkbox"
                                                value={"select"}
                                                checked={this.state.selectedOperationsValue.length === this.state.operationsValue.length}
                                                onChange={(e) => {
                                                    this.handleOperationsChange(e.target.value);
                                                }}
                                            />
                                        </div>
                                    </Dropdown.Item> 
                                  {operationsValue.map((operation, index) => (
                                      <Dropdown.Item key={index} eventKey={operation} style={{ fontSize: "small" }}>
                                          <div key={operation} style={{ display: 'flex', alignItems: 'center'}} onClick={(e) => e.stopPropagation()}>
                                              <div style={{ marginRight: '10px' }}>{operation}</div>
                                              <input
                                                  type="checkbox"
                                                  value={operation}
                                                  checked={selectedOperationsValue.includes(operation)}
                                                  onChange={(e) => {
                                                      this.handleOperationsChange(e.target.value);
                                                  }}
                                              />
                                          </div>
                                      </Dropdown.Item>
                                  ))}
                            </DropdownButton>
                          </>
                        ):null}

                        <div>
                          <button className='cancelRole getslastatsbutton'  style={{position:"absolute",right:"1%",marginTop:"1%"}}  disabled={((selectedDeviceList.length>=1 && selectedStatsType) || (selectedStatsType === "Customized Stats" && selectedSlaParams.length>=1 && selectedOperationsValue.length>=1))? false:true}
                            onClick={() => {
                                if (selectedStatsType !== "Customized Stats") { this.generateSLAReport(); } 
                                else { this.fetchCustomizedStats();}
                              }}>Get Stats</button>
                        </div>
                      </div>
                      {selectedStatsType==="Customized Stats"?(
                        <div style={{margin:"2%"}}>
                          <CustomTime dataCallBack={this.dataCallBackHandler} dateCustom = {this.submitCustom}/>
                        </div>
                      ):null}                        
                    </div>
                    ):(
                      <div style={{color:"gray",fontFamily:"auto" ,fontSize:"20px",fontWeight:"bold", marginTop:"2%"}}>
                        **Please select devices to Generate SLA Perfromance Stats**
                      </div>               
                    )}       
                  </div>     
                </div>     
              ):null}

              {ipSlaStatistics?(
                <div>
                  <img onClick={()=>this.setState({ipSlaStatistics:false,showDeviceList:true})} src={back} alt='' width={20}/>
                  <button onClick={()=>this.generateSlaPDF()} className="btn btn-primary mb-3" style={{position:"absolute",right:"9%",top:"30%"}}>Generate Report</button>
                  <div className="custom-scrollbar" style={{ height: "428px"}}>
                  <table className='user_table'>
                      <thead className='user_table_head'> 
                        <tr style={{backgroundColor:'#e5e8ff',color:'black'}}>
                          {tableHeaders.map((header) => (
                          <th key={header} style={{ position: 'relative' }}>
                            <div  onClick={()=>this.openFilterTab(header)} key={header}>
                              {header}
                              <img alt="" style={{marginLeft:'8px',marginTop:'3px'}} src={this.state.selectedthSort === header && this.state.sortOrder === "asc" ? sortUp : sortDown} width={10} />
                            </div>
                            {activeFilters[header] && (
                              <div className='filter-th-tab' >
                                <img style={{position:"absolute",right:"9px",top:"2px"}} onClick={()=>this.closeFilterTab(header)} src={close} alt='' width={10}/>
                                <div className='filter-th-tab-option' onClick={(e)=>this.sortTable(e,header,"asc")}>sort by asc</div>
                                <div className='filter-th-tab-option' onClick={(e)=>this.sortTable(e,header,"desc")}>sort by desc</div>
                                <div className='sortTabCheckBoxColumn'>
                                    {uniqueColumnValues&& uniqueColumnValues[header] && uniqueColumnValues[header].map((option, index) => (
                                      <div key={index} style={{display:'flex'}}>
                                          <input type="checkbox" onClick={(e) => e.stopPropagation()} 
                                            checked={this.state.checkedOptions.includes(option)}
                                            onChange={() => this.handleCheckboxFoFilter(option)}
                                            /><span style={{margin:'5px'}}>{option}</span>
                                      </div>
                                    ))}
                                  </div>
                                  <div style={{display:'flex',justifyContent:"space-between"}}>
                                    <button  className='deviceOkFilterButton'  onClick={()=>this.applyFilter(header)}>Apply</button>
                                    <button  className='deviceOkFilterButton'  onClick={()=>
                                      {this.setState({filteredStats:this.state.staticStats});this.closeFilterTab(header)}
                                      }>Clear
                                    </button>
                                  </div>
                                </div>
                            )}
                          </th>                           
                          ))}
                        </tr>
                      </thead>
                      <tbody>

                      {currentItems && currentItems.map(item=>(
                        <tr >
                          {tableHeaders.map((header) => (
                            <td key={header}>
                              {item[header]}
                            </td>
                          ))}
                        </tr>
                      ))}
                      </tbody>
                    </table>
                    {currentItems?(
                    <Pagination
                      activePage={activePage}
                      itemsCountPerPage={itemsPerPage}
                      totalItemsCount={filteredStats.length}
                      pageRangeDisplayed={5}
                      onChange={this.handlePageChange}
                      itemClass="page-item"
                      linkClass="page-link"
                      hideDisabled
                      firstPageText="First"
                      lastPageText="Last" prevPageText="<<"
                      nextPageText=">>"
                      activeClass="active"
                      activeLinkClass="active-link"
                      prevPageClassName="page-item"
                      nextPageClassName="page-item"
                      prevPageLinkClassName="page-link"
                      nextPageLinkClassName="page-link"
                      pageItem={BootstrapPageItem}
                    />
                    ):null}
                  </div>
                </div>
              ):null}

              {unique_id_sla?(
                <div>
                <img onClick={()=>this.setState({unique_id_sla:false,showDeviceList:true})} src={back} alt='' width={20} style={{marginBottom:"0.75%"}}/>
                  <DropdownButton
                      id="network-dropdown"
                      title={selectedDevice || "Select Device"} 
                      onSelect={this.handleDeviceType}
                      drop="down"
                      style={{ zIndex: 1000}}
                      className="custom-dropdown"
                      >
                      {Object.keys(unique_id_sla).map((device, optionIndex) => (
                        <Dropdown.Item key={optionIndex} eventKey={device}>
                        {device}
                        </Dropdown.Item>
                      ))}
                  </DropdownButton>

                  {selectedDevice?(
                    <div style={{ overflowX: "auto" }}>
                      <div style={{margin:"2%"}}>
                        <div style={{ color: "#27545c", fontWeight: "500" }}>
                          Operation : Min
                          <img style={{marginLeft:"1.5%"}} src={showMinTable ?  upArrow : downArrow}alt='' width={15} onClick={() => this.toggleTable('showMinTable')}/>
                        </div>
                        {showMinTable && this.renderTable(unique_id_sla[selectedDevice].min)}
                      </div>
                      
                      <div style={{margin:"2%"}}>
                        <div style={{ color: "#27545c", fontWeight: "500" }}>
                          Operation : Max
                          <img style={{marginLeft:"1.5%"}}src={showMaxTable ?  upArrow : downArrow}alt='' width={15} onClick={() => this.toggleTable('showMaxTable')}/>
                        </div>
                        {showMaxTable && this.renderTable(unique_id_sla[selectedDevice].max)}
                      </div>
                      
                      <div style={{margin:"2%"}}>
                        <div style={{ color: "#27545c", fontWeight: "500" }}>
                          Operation : Mean
                          <img style={{marginLeft:"1.5%"}} src={showMeanTable ?  upArrow : downArrow}alt='' width={15} onClick={() => this.toggleTable('showMeanTable')}/>
                        </div>
                        {showMeanTable && this.renderTable(unique_id_sla[selectedDevice].mean)}
                      </div>
                    </div>
                  ):null}                    
                </div>
              ):null}

              {this.state.is_fetching===true?(
                <Loading/>
              ):null}
          </div>
      );
  }
      
}
export default SLAPerformanceStats;