import React, { Component } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import jsPDF from "jspdf";
import "react-datepicker/dist/react-datepicker.css";
import "bootstrap/dist/css/bootstrap.min.css";
import Swal from "sweetalert2";
import Dropdown from "react-bootstrap/Dropdown";
import DropdownButton from "react-bootstrap/DropdownButton";
import Loading from "./loader";
import { Tabs, Tab } from "react-bootstrap";
import show from '../Images/downArrow.png';
import hide from '../Images/upArrow.png';
import CustomTime from "./customTime";
import "../css/report.css";
import back from '../Images/back.png'
class GlobalReport extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedReport: { background: "#0f80c7", color: "white" },
      selectedComponents: [],
      showreportTabs:true,
      unique_id_report:null,
      checked: [],
      openFilterPopup: false,
      reportTable_devices:false,
      timestamp_Filter:null,
      componentList: {
        "HARD-DISK": ["available", "utilized"],
        RAM: ["available", "utilized"],
        CPU: ["cpu-utilization"],
        FAN: ["rpm"],
        "TEMPERATURE-BCM Chip": [],
        "TEMPERATURE-Intel CPU Core ID 0": [],
        "TEMPERATURE-Intel CPU Core ID 10": [],
        "TEMPERATURE-Intel CPU Core ID 12": [],
        "TEMPERATURE-Intel CPU Core ID 14": [],
        "TEMPERATURE-Intel CPU Core ID 2": [],
        "TEMPERATURE-Intel CPU Core ID 4": [],
        "TEMPERATURE-Intel CPU Core ID 6": [],
        "TEMPERATURE-Intel CPU Core ID 8": [],
        "TEMPERATURE-TMP451 Local Sensor": [],
        "TEMPERATURE-TMP451 Remote Sensor": [],
        "TEMPERATURE-TMP75A Sensor-1": [],
        "TEMPERATURE-TMP75A Sensor-2": [],
        "TEMPERATURE-TMP75A Sensor-3": [],
      },
      selectedOptions: [],
      selectedTypeId: null,
      serverIP: process.env.REACT_APP_CLIENT_IP,
      filtered_data: null,
      getCpudata: null,
      value: "",
      unit: "d",

      interfaceList: [
        "ge1",
        "ge2",
        "ge3",
        "ge4",
        "ge5",
        "ge6",
        "ge7",
        "ge8",
        "ge9",
        "ge10",
        "ge11",
        "ge12",
        "ge13",
        "ge14",
        "ge15",
        "ge16",
        "ge17",
        "ge18",
        "ge19",
        "ge20",
        "ge21",
        "ge22",
        "ge29",
        "xe23",
        "xe24",
        "xe25",
        "xe26",
        "xe27",
        "xe28",
      ],
      selectedInterfaces: [],
      operationsValue: ["mean", "max", "min"],
      selectedOperationsValue: [],

      interfaceParams: [
        "tx-throughput",
        "tx-packet-rate",
        "rx-throughput",
        "rx-packet-rate",
        "bandwidth-utilization",
        "in-crc-errors",
        "in-undersize-frames",
        "in-oversize-frames",
        "in-fragment-frames",
        "in-jabber-frames",
        "in-errors",
        "out-errors",
        "in-discards",
        "out-discards",
        "in-octets",
        "out-octets",
        "in-pkts",
        "out-pkts",
        "in-unicast-pkts",
        "in-broadcast-pkts",
        "in-multicast-pkts",
        "out-unicast-pkts",
        "out-broadcast-pkts",
        "out-multicast-pkts",
        ],
      selectedInterfaceParams: [],
      reportList: ["device comp", "sla stats", "interfaces", "alarm", "user"],
      selectedSlaParams: [],
      reportName: "device comp",
      selectedDeviceList:[],
    };
    this.dataCallBackHandler=this.dataCallBackHandler.bind(this);
    this.submitCustom=this.submitCustom.bind(this);
  }

  dataCallBackHandler(data){
    console.log(data,"called");
    this.setState({timestamp_Filter:data})
  }
  submitCustom(data){
    console.log(data);
    this.setState({timestamp_Filter:data})
  }

  convertDateFormat(inputDateStr) {
    const inputDate = new Date(inputDateStr);
    return inputDate.toISOString();
  }

  setDefaultTime() {
    const { timestamp_Filter } = this.state;
    var currentDate = new Date();
    var oneMonthAgo = new Date(currentDate);
    oneMonthAgo.setMonth(currentDate.getMonth() - 1);
    currentDate = this.convertDateFormat(currentDate);
    oneMonthAgo = this.convertDateFormat(oneMonthAgo);
    console.log(currentDate, oneMonthAgo, "ghefdwehfiuwehf8oewfhuiwefh");
    timestamp_Filter["start_time"] = oneMonthAgo;
    timestamp_Filter["stop_time"] = currentDate;
    this.setState({ timestamp_Filter });
  }

  handleDeviceParamsChange(option) {
    if (option === "select") {
      const allComponentsSelected =
        this.state.selectedOptions.length ===
        Object.keys(this.state.componentList).length;
      if (allComponentsSelected) {
        this.setState({ selectedOptions: [] });
      } else {
        // Select all components
        this.setState({
          selectedOptions: [...Object.keys(this.state.componentList)],
        });
      }
    } else {
      const selectedOptions = [...this.state.selectedOptions];
      const index = selectedOptions.indexOf(option);
      if (index === -1) {
        selectedOptions.push(option);
      } else {
        selectedOptions.splice(index, 1);
      }
      this.setState({ selectedOptions });
    }
  }

  handleInterfaceChange(option) {
    if (option === "select") {
      const allInterfacesSelected =
        this.state.selectedInterfaces.length ===
        this.state.interfaceList.length;
      if (allInterfacesSelected) {
        // Deselect all interfaces
        this.setState({ selectedInterfaces: [] });
      } else {
        // Select all interfaces
        this.setState({ selectedInterfaces: [...this.state.interfaceList] });
      }
    } else {
      // Toggle the selection of individual interface
      const selectedInterfaces = [...this.state.selectedInterfaces];
      const index = selectedInterfaces.indexOf(option);
      if (index === -1) {
        selectedInterfaces.push(option); // Select
      } else {
        selectedInterfaces.splice(index, 1); // Deselect
      }
      this.setState({ selectedInterfaces });
    }
  }

  handleInterfaceParamsChange(option) {
    if (option === "select") {
      const allInterfacesparamsSelected =
        this.state.selectedInterfaceParams.length ===
        this.state.interfaceParams.length;
      if (allInterfacesparamsSelected) {
        // Deselect all interfaces
        this.setState({ selectedInterfaceParams: [] });
      } else {
        // Select all interfaces
        this.setState({
          selectedInterfaceParams: [...this.state.interfaceParams],
        });
      }
    } else {
      var selectedInterfaceParams = [...this.state.selectedInterfaceParams];
      var index = selectedInterfaceParams.indexOf(option);
      if (index === -1) {
        selectedInterfaceParams.push(option);
      } else {
        selectedInterfaceParams.splice(index, 1);
      }
      this.setState({ selectedInterfaceParams });
    }
  }

  handleOperationsChange(option) {
    if (option === "select") {
      const allOperationsSelected =
        this.state.selectedOperationsValue.length ===
        this.state.operationsValue.length;
      if (allOperationsSelected) {
        // Deselect all interfaces
        this.setState({ selectedOperationsValue: [] });
      } else {
        // Select all interfaces
        this.setState({
          selectedOperationsValue: [...this.state.operationsValue],
        });
      }
    } else {
      const selectedOperationsValue = [...this.state.selectedOperationsValue];
      const index = selectedOperationsValue.indexOf(option);
      if (index === -1) {
        selectedOperationsValue.push(option);
      } else {
        selectedOperationsValue.splice(index, 1);
      }
      this.setState({ selectedOperationsValue });
    }
  }
  handleSlaParamChange(option) {
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
  handleDeviceType = (device) => {
    this.setState({ selectedDevice: device });
  };
  toggleTable = (tableName) => {
    this.setState(prevState => ({
      [tableName]: !prevState[tableName]
    }));
  }

  renderTable(data) {
    const tableData = [];

    if (Object.keys(data).length >= 1) {
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

        const allSlaFields = new Set();
        tableData.forEach((rowData) => {
            Object.keys(rowData).forEach((field) => {
                if (field !== 'Time' && field !== 'SLA Type') {
                    allSlaFields.add(field);
                }
            });
        });

        const tableHeaders = ['Time', 'SLA Type', ...Array.from(allSlaFields)];

        return (
            <div style={{ maxHeight: "330px", overflow: "auto",width:"95"}}>
                <table className='entry-container' style={{ width: "100%", fontSize: "14px",overflow:"auto" }}>
                    <thead style={{ boxShadow: "2px 2px 4px rgb(120 100 100 / 10%)", fontSize: "15px", background: "#b7b1b11c", color: "#3e3b3b" }}>
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
                                    <td key={colIndex}>{rowData[header] || 'N/A'}</td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    } else {
        return (
            <div>NO DATA</div>
        );
    }
  }
  generatePDF(data) {
  const doc = new jsPDF();
  const filename = this.state.reportName;

  const maxColumns = 6; // Maximum number of columns in a table

  data.forEach((device, deviceIndex) => {
    doc.addPage();
    doc.text(20, 20, `Unique ID: ${device.unique_id}`);
    let startY = 30;

    if (device.device_info) {
      const deviceInfoTable = [["Property", "Value"]];
      Object.entries(device.device_info).forEach(([property, value]) => {
        deviceInfoTable.push([property, value]);
      });

      const deviceInfoAutoColumns = Array.from(
        { length: deviceInfoTable[0].length },
        (_, colIndex) => ({
          dataKey: colIndex.toString(),
          width: "auto",
        })
      );

      doc.autoTable({
        head: [deviceInfoTable[0]],
        body: deviceInfoTable.slice(1),
        startY: startY,
        theme: "striped",
        autoColumns: deviceInfoAutoColumns,
        margin: { top: 20 },
      });

      startY = doc.autoTable.previous.finalY + 10;
    }

    ["min", "max", "mean"].forEach((reportType) => {
      if (device.report && device.report[reportType]) {
        const reportTable = [["Time"]];
        const rows = [];
    
        Object.entries(device.report[reportType]).forEach(([timestamp, components]) => {
          if (components) {
            // Initialize the table for the component
            if (reportTable[0].length === 1) {
              reportTable[0].push(
                ...Object.keys(components).flatMap((component) =>
                  Object.keys(components[component]).map((param) => `${component}/${param}`)
                )
              );
            }
            // Build rows for the current timestamp and all components
            const row = [
              timestamp,
              ...Object.values(components).flatMap((component) =>
                Object.values(component).map((param) =>
                  param !== undefined && param !== null ? param : "N/A"
                )
              ),
            ];
            rows.push(row);
          }
        });
    
        // Add the reportTypeRow just once before creating tables
        const reportTypeRow = [
          reportType.toUpperCase(),
          ...Array(reportTable[0].length - 1).fill(""),
        ];
        const reportRows = [reportTypeRow, ...rows];
    
        // Split columns into chunks of maxColumns
        const splitColumns = [];
        for (let i = 1; i < reportTable[0].length; i += maxColumns) {
          splitColumns.push(reportTable[0].slice(i, i + maxColumns));
        }
    
        splitColumns.forEach((columnSubset, subsetIndex) => {
          const subsetRows = reportRows.map((row) => [
            row[0],
            ...row.slice(subsetIndex * maxColumns + 1, (subsetIndex + 1) * maxColumns + 1),
          ]);
    
          const columnWidths = Array(columnSubset.length).fill("auto");
    
          doc.autoTable({
            head: [["Report Type", ...columnSubset]],
            body: subsetRows,
            startY: startY,
            theme: "striped",
            margin: { top: 10 },
            columnStyles: {
              ...Object.fromEntries(
                columnWidths.map((width, index) => [
                  { width },
                ])
              ),
            },
          });
    
          // Adjust startY for the next table
          startY = doc.autoTable.previous.finalY + 10;
        });
      }
    });
  });

  this.setState({ is_fetching: false });
  try {
    doc.save(`${filename}.pdf`);
  } catch (error) {
    console.error("Error saving PDF:", error);
  }
  }

  downloadDynamicReport() {
    this.setState({ is_fetching: true });
    const {
      componentList,
      timestamp_Filter,
      selectedDeviceList,
      selectedOptions,
      selectedSlaParams,
      selectedInterfaces,
      selectedInterfaceParams,
      selectedOperationsValue,
    } = this.state;

    var temp = {
      interval: timestamp_Filter.interval,
      start_time: timestamp_Filter.start_time,
      stop_time: timestamp_Filter.stop_time,
      unique_ids: selectedDeviceList,
      measurements: [],
      fields: [],
      operations: [],
    };

    for (let i = 0; i < selectedOptions.length; i++) {
      const key = selectedOptions[i];

      if (componentList.hasOwnProperty(key)) {
        temp.measurements.push(key);
        temp.fields.push(...componentList[key]);
      }
    }

    for (let i = 0; i < selectedInterfaces.length; i++) {
      temp.measurements.push(selectedInterfaces[i]);
    }

    for (let i = 0; i < selectedOperationsValue.length; i++) {
      temp.operations.push(selectedOperationsValue[i]);
    }
    for (let i = 0; i < selectedInterfaceParams.length; i++) {
      temp.fields.push(selectedInterfaceParams[i]);
    }
    for (let i = 0; i < selectedSlaParams.length; i++) {
      temp.fields.push(selectedSlaParams[i]);
    }
    if (this.state.reportName === "sla stats") {
      temp.measurements.push("sla");
    }
    console.log(temp);

    fetch(
      `http://${this.state.serverIP}:5001/performance-management/dynamic-report`,
      {
        method: "POST",
        mode: "cors",
        headers: {
          "Access-Control-Allow-Origin": "http://localhost:3000",
          Accept: "application/json",
          "Content-Type": "application/json",
          username: sessionStorage.getItem("username"),
        },
        body: JSON.stringify(temp),
      }
    )
      .then((resp) => resp.json())
      .then((resp) => {
        this.setState({ dynamicReportData: resp ,is_fetching:false});
        console.log(resp, "dynamicReportData");

        if (resp.length >= 1) {
          this.setState({showreportTabs:false})
          // this.generatePDF(resp);
          const unique_id_report = {};
          for (let i = 0; i < resp.length; i++) {
            if (resp[i].report && resp[i]["unique_id"]) {
              unique_id_report[resp[i]["unique_id"]] = resp[i].report;
            }
          }
          this.setState({ unique_id_report });
        } else {
          alert(resp.status);
        }
      })
      .catch((err) => {
        if (err.response) {
          Swal.fire({
            position: "center",
            title: err.response.data.status,
            icon: "error",
            showConfirmButton: true,
            showCancelButton: false,
            confirmButtonText: "OK",
            confirmButtonColor: "#116C39",
            customClass: {
              title: "custom-swal-title",
            },
          });
          console.log("Error Response Data:", err.response.data);
          console.log("Error Response Status:", err.response.status);
          console.log("Error Response Headers:", err.response.headers);
        }
      });
  }

  handleselectedDevicesToCompare = (event, item) => {
    const { value, checked } = event.target;
    let updatedList;
    if (value === "selectAll") {
      // If "Select All" checkbox is clicked, select or deselect all devices
      updatedList = checked ? this.props.data : [];
    } else {
      // Otherwise, handle individual device selection
      updatedList = checked
        ? [...this.state.selectedDeviceList, value]
        : this.state.selectedDeviceList.filter(device => device !== value);
    }
  
    this.setState({ selectedDeviceList: updatedList });
  }
  render() {
    const { data, isDarkMode } = this.props;
    console.log(data,"nnnnnnnnnnn")
    const { showMinTable, showMaxTable, showMeanTable } = this.state;
    const {
      showreportTabs,
      componentList,
      selectedDevice,
      selectedOptions,
      interfaceList,
      selectedDeviceList,
      dynamicReportData,
      selectedSlaParams,
      selectedInterfaces,
      interfaceParams,
      selectedInterfaceParams,
      operationsValue,
      unique_id_report,
      selectedOperationsValue,
    } = this.state;
    return (

    <div style={{ backgroundColor: "white",padding: "2%", width:"100%",}}>

      {showreportTabs?(
        <div style={{ display: "flex",marginTop:"2%" }}>
          <div className="cardfour" style={{ width: "25%",background: isDarkMode ? null : "white", padding: "1%",}} >
            <div style={{ maxHeight: "428px", overflow: "auto" }}>
              <table className="user_table" style={{ marginTop: "auto" }}>
                <thead className="user_table_head">
                  <tr style={{ backgroundColor: "#e5e8ff", color: "black" }}>
                    <th>Device Name</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                    <tr>
                      <td>Select All</td>
                      <td><input type="checkbox" id="selectAll" name="selectAll" value="selectAll" onChange={(e) => this.handleselectedDevicesToCompare(e)} 
                          checked={selectedDeviceList.length === data.length} /></td>
                    </tr>
                    {data && data.map((item, index) => (
                        <tr key={index}>
                          <td>{item}</td>
                          <td>
                            <div className="list-container">
                              <input type="checkbox" id={item} name={item} value={item} onChange={(e) => this.handleselectedDevicesToCompare(e, item)} checked={selectedDeviceList.includes(item)} />
                            </div>
                          </td>
                        </tr>
                    ))}
                  </tbody>
              </table>
            </div>
          </div>
  
          {selectedDeviceList.length >= 1 ? (
            
            <div className="cardfour2"  style={{width:"75%",marginLeft:"2%"}}>
                <div>
                  <div className="report_tabs fontsNetwork" >
                    <Tabs defaultActiveKey="device-comp" id="Report">
                      <Tab eventKey="device-comp" title="Device comp" onClick={() => {this.setState({selectedInterfaces: [],selectedInterfaceParams: []});}}>
                      <div style={{ display: "flex" }}>
                        <DropdownButton
                          id="vpn-dropdown"
                          style={{}}
                          title={"choose device params"}
                          drop="down"
                          className="custom-dropdown"
                        >
                          <Dropdown.Item key={0} style={{ fontSize: "small" }}>
                            <div
                              key={"select"}
                              style={{ display: "flex", alignItems: "center" }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div style={{ marginRight: "10px" }}>Select All</div>
  
                              <input
                                type="checkbox"
                                value={"select"}
                                checked={
                                  this.state.selectedOptions.length ===
                                  Object.keys(this.state.componentList).length
                                }
                                onChange={(e) => {
                                  this.handleDeviceParamsChange(e.target.value);
                                }}
                              />
                            </div>
                          </Dropdown.Item>
                          {Object.keys(componentList).map((name, index) => (
                            <Dropdown.Item
                              key={index}
                              eventKey={name}
                              style={{ fontSize: "small" }}
                            >
                              <div
                                key={name}
                                style={{ display: "flex", alignItems: "center" }}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <div style={{ marginRight: "10px" }}>{name}</div>
                                <input
                                  type="checkbox"
                                  value={name}
                                  checked={selectedOptions.includes(name)}
                                  onChange={(e) => {
                                    this.handleDeviceParamsChange(e.target.value);
                                  }}
                                />
                              </div>
                            </Dropdown.Item>
                          ))}
                        </DropdownButton>
  
                        <DropdownButton
                          id="operations-dropdown"
                        
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
                        </div>
                      </Tab>
  
                      <Tab eventKey="interfaces" title="Interfaces" onClick={() => {this.setState({selectedOperationsValue: [],selectedOptions: []});}}>
                        <div style={{ display: "flex" }}>
                          <DropdownButton
                            id="interface-dropdown"
                            title={"Choose Interface"}
                            drop="down"
                            className="custom-dropdown"
                          >
                            <Dropdown.Item key={0} style={{ fontSize: "small" }}>
                              <div
                                key={"select"}
                                style={{ display: "flex", alignItems: "center" }}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <div style={{ marginRight: "10px" }}>Select All</div>
  
                                <input
                                  type="checkbox"
                                  value={"select"}
                                  checked={
                                    this.state.selectedInterfaces.length ===
                                    this.state.interfaceList.length
                                  }
                                  onChange={(e) => {
                                    this.handleInterfaceChange(e.target.value);
                                  }}
                                />
                              </div>
                            </Dropdown.Item>
                            {interfaceList.map((interfaceName, index) => (
                              <Dropdown.Item
                                key={index}
                                eventKey={interfaceName}
                                style={{ fontSize: "small" }}
                              >
                                <div
                                  key={interfaceName}
                                  style={{ display: "flex", alignItems: "center" }}
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <div style={{ marginRight: "10px" }}>
                                    {interfaceName}
                                  </div>
  
                                  <input
                                    type="checkbox"
                                    value={interfaceName}
                                    checked={selectedInterfaces.includes(
                                      interfaceName
                                    )}
                                    onChange={(e) => {
                                      this.handleInterfaceChange(e.target.value);
                                    }}
                                  />
                                </div>
                              </Dropdown.Item>
                            ))}
                          </DropdownButton>
  
                          <DropdownButton
                            id="interface-params-dropdown"
                            title={"Choose Interface Params"}
                            drop="down"
                            className="custom-dropdown"
                          >
                            <Dropdown.Item key={0} style={{ fontSize: "small" }}>
                              <div
                                key={"select"}
                                style={{ display: "flex", alignItems: "center" }}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <div style={{ marginRight: "10px" }}>Select All</div>
  
                                <input
                                  type="checkbox"
                                  value={"select"}
                                  checked={
                                    this.state.selectedInterfaceParams.length ===
                                    this.state.interfaceParams.length
                                  }
                                  onChange={(e) => {
                                    this.handleInterfaceParamsChange(e.target.value);
                                  }}
                                />
                              </div>
                            </Dropdown.Item>
  
                            {interfaceParams.map((param, index) => (
                              <Dropdown.Item
                                key={index}
                                eventKey={param}
                                style={{ fontSize: "small" }}
                              >
                                <div
                                  key={param}
                                  style={{ display: "flex", alignItems: "center" }}
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <div style={{ marginRight: "10px" }}>{param}</div>
                                  <input
                                    type="checkbox"
                                    value={param}
                                    checked={selectedInterfaceParams.includes(param)}
                                    onChange={(e) => {
                                      this.handleInterfaceParamsChange(
                                        e.target.value
                                      );
                                    }}
                                  />
                                </div>
                              </Dropdown.Item>
                            ))}
                          </DropdownButton>
  
                          <DropdownButton
                            id="operations-dropdown"
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
                        </div>
                      </Tab>
                      <Tab eventKey="sla stats" title="Sla stats">
                      <DropdownButton
                          id="sla-dropdown"
                          title={"Choose sla params"}
                          drop="down"
                          className="custom-dropdown"
                          >
                      {['average-round-trip-delay','elapsed-time','invalid-tests','maximum-round-trip-delay','minimum-round-trip-delay',
                      'packets-lost','packets-received','packets-sent','start-time'].map((param, index) => (
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
                      </Tab>
                      <Tab eventKey="alarm" title="Alarm">
                      </Tab>
                      <Tab eventKey="performance" title="Performance">
                        <DropdownButton
                          id="operations-dropdown"
                          
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
                      </Tab>
                    </Tabs>
                    <div style={{margin:"2%"}}>
                      <CustomTime dataCallBack={this.dataCallBackHandler} dateCustom = {this.submitCustom}/>
                    </div>
                    <button id="ReportButton" className="btn btn-primary mb-3 viewReport" 
                        onClick={() => {
                          this.setState({ reportTable_devices: true });
                          this.downloadDynamicReport();
                        }}
                        // disabled={selectedOperationsValue.length>=1 && timestamp_Filter && (selectedOptions.length>=1)|| selectedInterfaces.length>=1 && selectedInterfaceParams.length>=1 && selectedOperationsValue.length>=1?false:true}
                      >
                        view report
                      </button>
                  </div>
                    
                </div>
            </div>
          ) : null}
        </div> 
      ):null}
      

      {unique_id_report?(
            <div className="uniquereporttab">
              <img onClick={()=>this.setState({showreportTabs:true,unique_id_report:null})} src={back} alt='' width={20}/>
              <DropdownButton
                  id="network-dropdown"
                  title={selectedDevice || "Select Device"} 
                  onSelect={this.handleDeviceType}
                  drop="down"
                  style={{ zIndex: 1000}}
                  className="custom-dropdown"
                  >
                  {Object.keys(unique_id_report).map((device, optionIndex) => (
                      <Dropdown.Item key={optionIndex} eventKey={device}>
                      {device}
                      </Dropdown.Item>
                  ))}
              </DropdownButton>
              <button className="btn btn-primary mb-3 viewReport"
                onClick={() => {
                  this.generatePDF(dynamicReportData);
                }}
              >Download Report
              </button>

            {selectedDevice?(
              <div>
              <div style={{marginLeft:"4%",marginBottom:"1%"}}><div style={{ color: "#27545c", fontWeight: "500" }}>
                Operation : Min
                <img style={{marginLeft:"1"}} src={showMinTable ? show : hide}alt='' width={15} onClick={() => this.toggleTable('showMinTable')}/>
              </div>
              {showMinTable && this.renderTable(unique_id_report[selectedDevice].min)}</div>
              
              <div style={{marginLeft:"4%",marginBottom:"1%"}}><div style={{ color: "#27545c", fontWeight: "500" }}>
                Operation : Max
                <img style={{marginLeft:"1%"}}src={showMaxTable ? show : hide}alt='' width={15} onClick={() => this.toggleTable('showMaxTable')}/>
              </div>
              {showMaxTable && this.renderTable(unique_id_report[selectedDevice].max)}</div>
              
              <div style={{marginLeft:"4%",marginBottom:"1%"}}><div style={{ color: "#27545c", fontWeight: "500" }}>
                Operation : Mean
                <img style={{marginLeft:"1%"}} src={showMeanTable ? show : hide}alt='' width={15} onClick={() => this.toggleTable('showMeanTable')}/>
              </div>
              {showMeanTable && this.renderTable(unique_id_report[selectedDevice].mean)}</div>
            </div>
            ):null}
            </div>
      ):null}

        {this.state.is_fetching === true ? <Loading /> : null}
      </div>
    );
  }
}

export default GlobalReport;