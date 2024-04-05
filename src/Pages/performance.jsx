import React from "react";
import NewHeader from "../Components/header";
import NewLeftpanel from "../Components/leftPanel";
import sortDown from '../Images/dropDown.png'
import sortUp from '../Images/arrow-up.png';
import { cloneDeep } from "lodash";
import RXTXGraph from '../Components/RxTx';
import DatePicker from 'react-datepicker';
import jsPDF from 'jspdf';
import { Tabs, Tab } from 'react-bootstrap'; // Assuming you are using Bootstrap
import RoutingDetails from "../Components/forwardingTable";
import Pagination from "react-js-pagination";
import { PageItem as BootstrapPageItem } from 'react-bootstrap';
import { ThemeProvider, createTheme } from "@mui/material/styles";
import close from "../Images/closeS.png";
import { CSVLink } from "react-csv";


class PerformancePanel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isDarkMode: false,newState:{},
      activePage: 1,
      itemsPerPage: 5,
      role: null,
      isOpen:false,
      filter: {
        "bad-crc": "",
        "bandwidth-utilization": "",
        "fragments": "",
        "in-broadcast-pkts": "",
        "in-discards": "",
        "in-errors": "",
        "in-multicast-pkts": "",
        "in-octets": "",
        "in-packets": "",
        "in-unicast-pkts": "",
        "jabbers": "",
        "out-broadcast-pkts": "",
        "out-discards": "",
        "out-errors": "",
        "out-multicast-pkts": "",
        "out-octets": "",
        "out-packets": "",
        "out-unicast-pkts": "",
        "oversize": "",
        "rx-packet-rate": "",
        "rx-throughput": "",
        "tx-packet_rate": "",
        "tx-throughput": "",
        "undersize": ""
      },
      openFilterPopup: false,
      checked: [],
      selectedInterfaceData_for_filter: [],

      sortDirection: "asc", fixthHead: { cursor: 'pointer', fontSize: "small" },
      sortColumn: null,
      yangSchema: null,
      is_fetching: false,
      selectt:[],
      originalData: null, selected: null,
      serverIP: process.env.REACT_APP_CLIENT_IP,
      device_id: null,
      mainContent: true, time: '60m',
      subHead: null, errorSec: false,
      hold_alarms: null, instanceData: null,
      get_alarms: null,
      showModuleContent: false,
      index: null,
      KeyYang: null, inToggle: true, outToggle: false,
      UniqueId: null,
      moduleContent: null,
      data: [
        {
          deviceName: 'Device 1',
          clusterName: 'CSR',
          siteName: 'Site X, Cluster A',
          status: 'Active',
          memory: '4 GB',
        },
        // {
        //   deviceName: 'Device 1',
        //   clusterName: 'CSR',
        //   siteName: 'Site X, Cluster A',
        //   status: 'Active',
        //   memory: '4 GB',
        // }
      ],
      performanceYangs: [
        [
          { '/performance/ospf': 'ipi-ospf' },
          { '/performance/ospfv3': 'ipi-ospfv3' },
          { '/performance/ip-sla': 'ipi-ip-sla' },
        ],
        [
          { '/performance/pim': 'ipi-pim' },

        ],
        [
          { '/performance/lb': 'ipi-lb' },
        ],
        [
          { '/performance/lacp': 'ipi-lacp' },
          { '/performance/twamp': 'ipi-twamp' },
          { '/performance/pon': 'ipi-pon', },
          { '/performance/sflow': 'ipi-sflow' },

        ],
        [
          { '/performance/components': 'ipi-platform' },
          { '/performance/hardware': 'ipi-platform' },
          { '/performance/profiles': 'ipi-platform' },
          { '/performance/ptssfp': 'ipi-platform-transceiver-smart-sfp' },
          { '/performance/ptd': 'ipi-platform-terminal-device' },
          { '/performance/sflow': 'ipi-platform' },
        ],
        [
          { '/performance/qos': 'ipi-qos' },
        ],
        [
          { '/performance/tfo': 'ipi-tfo' },
        ]
      ],
      selectedTab: 0,
      timestamp_Filter: { start_time: new Date(), interval: null, stop_time: new Date() },
      selectedInterfaceStats: null, unitInterval: "m", stepTimeInterval: "10", selectedInterface: null, interfaceList: [], selectedInterfaceData: [],
      Topheaders: ["time", "bad-crc", "rx-throughput",  "tx-throughput", "rx-packet-rate", "tx-packet-rate", "fragments", "in-discards", "in-errors", "out-discards", "out-errors", "jabbers", "oversize", "undersize", "bandwidth-utilization", "in-broadcast-pkts", "in-multicast-pkts", "in-unicast-pkts", "in-octets", "in-packets", "out-broadcast-pkts", "out-multicast-pkts", "out-unicast-pkts", "out-octets", "out-packets"],
      showIPSLAStatistics: false, showDeviceStats: true, showRoutingLSP: false,
      ipSlaStatistics: null,
      routingData: {
        "global-ftn-table": {
          "ipv4-ftn-entry": [
            {
              "fec-prefix": "3.3.3.3/32",
              "lsp-type": "primary",
              "nhlfe-entry": [
                {
                  "administrative-status": "up",
                  "out-interface": "ge1",
                  "out-label": 1000,
                  "state": {
                    "administrative-status": "up",
                    "is-stale": false,
                    "label-op-code": "push",
                    "nexthop-address": "12.12.12.2",
                    "nhlfe-index": 2,
                    "nhlfe-owner": "cli",
                    "nhlfe-type": "primary",
                    "oper-status": "up",
                    "out-interface": "ge1",
                    "out-label": 1000
                  }
                }
              ],
              "owner": "cli",
              "state": {
                "color": 0,
                "fec-prefix": "3.3.3.3/32",
                "ftn-index": 1,
                "in-dscp-class-name": "be",
                "is-entropy-label": false,
                "is-primary": true,
                "lsp-type": "primary",
                "owner": "cli",
                "protected-lsp-id": 0,
                "qos-exp-bits": 0,
                "qos-resource-id": 0,
                "redirect-action-type": "redirect-lsp",
                "route-distance": 0,
                "tunnel-id": 0,
                "tunnel-policy-name": "none"
              },
              "tunnel-id": 0
            }
          ]
        },
        "ilm-table": {
          "ip-ilm-entry": [
            {
              "in-interface": "N/A",
              "in-label": 2001,
              "state": {
                "fec-prefix": "0.0.0.0/0",
                "ilm-index": 1,
                "in-interface": "N/A",
                "in-label": 2001,
                "is-installed-in-fib": true,
                "is-stale": false,
                "is-stitched-to-ftn": false,
                "label-op-code": "pop",
                "owner": "cli"
              }
            }
          ]
        },
        "static-lsps": {
          "ipv4-static-ftn-entries": {
            "ipv4-static-ftn-entry": [
              {
                "config": {
                  "fec-prefix": "3.3.3.3/32",
                  "nexthop-ip-address": "12.12.12.2",
                  "out-interface-name": "ge1",
                  "pushed-label": 1000
                },
                "fec-prefix": "3.3.3.3/32",
                "nexthop-ip-address": "12.12.12.2",
                "out-interface-name": "ge1",
                "pushed-label": 1000,
                "state": {
                  "fec-prefix": "3.3.3.3/32",
                  "nexthop-ip-address": "12.12.12.2",
                  "out-interface-name": "ge1",
                  "pushed-label": 1000
                }
              }
            ]
          },
          "static-ilm-entries": {
            "static-ilm-entry": [
              {
                "config": {
                  "incoming-label": 2001
                },
                "incoming-label": 2001,
                "pop": {
                  "config": {
                    "enable-pop-label": [
                      null
                    ]
                  },
                  "state": {
                    "enable-pop-label": [
                      null
                    ]
                  }
                },
                "state": {
                  "incoming-label": 2001
                }
              }
            ]
          }
        }
      }
    };

  }

  componentDidMount() {
    let role_id = sessionStorage.getItem('role_id');
    this.setState({ role: role_id });
    this.fetchPerformanceStats('hour');

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

  fetchPerformanceStats(id) {
    this.setState({ is_fetching: true })
    if (id !== 'alreadyset') {
      this.setState({ changeHeight: false })
      this.setTime(id);
    }
    if (id === 'week' || id === 'month') {
      var unitInterval = 'd'
      var stepTimeInterval = 1
    }
    else if (id === 'year') {
      unitInterval = 'w'
      stepTimeInterval = 4
    }
    else if (id === '24hour') {
      unitInterval = 'h'
      stepTimeInterval = 1
    }
    else if (id === 'hour') {
      unitInterval = 'm'
      stepTimeInterval = 10
    }
    else {
      unitInterval = this.state.unitInterval
      stepTimeInterval = this.state.stepTimeInterval
    }
    this.setState({ unitInterval: unitInterval, stepTimeInterval: stepTimeInterval })
    let UniqueId = sessionStorage.getItem('unique_id')
    const { timestamp_Filter } = this.state;
    if (unitInterval) {
      timestamp_Filter['interval'] = stepTimeInterval + unitInterval
    }
    console.log(timestamp_Filter,UniqueId)
    fetch(`http://${this.state.serverIP}:5001/performance-management/interfaces/${UniqueId}`,
      {
        mode: "cors",
        method: "POST",
        headers: {
          "Access-Control-Allow-Origin": "http://localhost:3000",
          'Accept': 'application/json',
          'username': sessionStorage.getItem('username'),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(timestamp_Filter)
      }
    ).then((resp) => resp.json())
      .then((resp) => {
        this.setState({ is_fetching: false })
        console.log(resp, 'stats')
        if (id === 'alreadyset') {
          this.setTime('custom', resp);
          this.setState({ changeHeight: true })
        }
        
        if (resp.interfaces) {
          var selectedInterfaceData = [];
          const interfaceList = [];
          for (let key in resp.interfaces) {
            for (let keyInterface in resp.interfaces[key]) {
              if (!interfaceList.includes(keyInterface)) {
                console.log(keyInterface)
                interfaceList.push(keyInterface);
              }
            }
          }
          this.setState(
            { selectedInterface: interfaceList[0], interfaceList: interfaceList },
            () => {
              for (const date in resp.interfaces) {
                resp.interfaces[date][interfaceList[0]]["time"] = date
                selectedInterfaceData.push(resp.interfaces[date][this.state.selectedInterface])
              }
              this.setState({ selectedInterfaceData: selectedInterfaceData, selectedInterfaceData_for_filter: selectedInterfaceData })
              this.findInterfaces(resp.interfaces);
            }
          )

          this.findAggregateStats(resp.aggregate);
          this.setState({ is_fetching: false, 
            performanceInterfaceData: resp.interfaces,
             performanceData: resp })
        }
        else {
          alert(resp.status)
        }
        console.log(selectedInterfaceData)
       var performanceHeaders = [
          {"label": "In CRC Errors", "key": "in-crc-errors"},
          {"label": "Bandwidth Utilization", "key": "bandwidth-utilization"},
          {"label": "Incoming Fragment Frames", "key": "in-fragment-frames"},
          {"label": "Incoming Broadcast Packets", "key": "in-broadcast-pkts"},
          {"label": "Incoming Discards", "key": "in-discards"},
          {"label": "Incoming Errors", "key": "in-errors"},
          {"label": "Incoming Multicast Packets", "key": "in-multicast-pkts"},
          {"label": "Incoming Octets", "key": "in-octets"},
          {"label": "Incoming Packets", "key": "in-packets"},
          {"label": "Incoming Unicast Packets", "key": "in-unicast-pkts"},
          {"label": "Incoming Jabber Frames", "key": "in-jabber-frames"},
          {"label": "Outgoing Broadcast Packets", "key": "out-broadcast-pkts"},
          {"label": "Outgoing Discards", "key": "out-discards"},
          {"label": "Outgoing Errors", "key": "out-errors"},
          {"label": "Outgoing Multicast Packets", "key": "out-multicast-pkts"},
          {"label": "Outgoing Octets", "key": "out-octets"},
          {"label": "Outgoing Packets", "key": "out-packets"},
          {"label": "Outgoing Unicast Packets", "key": "out-unicast-pkts"},
          {"label": "In Oversize Frames", "key": "oversize"},
          {"label": "Receive Packet Rate", "key": "rx-packet-rate"},
          {"label": "Receive Throughput", "key": "rx-throughput"},
          {"label": "Transmit Packet Rate", "key": "tx-packet-rate"},
          {"label": "Transmit Throughput", "key":  "tx-throughput"},
          {"label": "In Undersize Frames", "key": "undersize"},
          {"label": "Time", "key": "time"}
      ]
      
      var Performance = [];

      for (let i = 0; i < this.state.selectedInterfaceData.length; i++) {
        let headerDict = {
          "in-crc-errors": this.state.selectedInterfaceData[i]["in-crc-errors"],  
          "bandwidth-utilization": this.state.selectedInterfaceData[i]["bandwidth-utilization"],
          "in-fragment-frames": this.state.selectedInterfaceData[i]["in-fragment-frames"],
          "in-broadcast-pkts": this.state.selectedInterfaceData[i]["in-broadcast-pkts"],
          "in-discards": this.state.selectedInterfaceData[i]["in-discards"],
          "in-errors": this.state.selectedInterfaceData[i]["in-errors"],
          "in-multicast-pkts": this.state.selectedInterfaceData[i]["in-multicast-pkts"],
          "in-octets": this.state.selectedInterfaceData[i]["in-octets"],
          "in-packets": this.state.selectedInterfaceData[i]["in-pkts"],
          "in-unicast-pkts": this.state.selectedInterfaceData[i]["in-unicast-pkts"],
          "in-jabber-frames": this.state.selectedInterfaceData[i]["in-jabber-frames"],
          "out-broadcast-pkts": this.state.selectedInterfaceData[i]["out-broadcast-pkts"],
          "out-discards": this.state.selectedInterfaceData[i]["out-discards"],
          "out-errors": this.state.selectedInterfaceData[i]["out-errors"],
          "out-multicast-pkts": this.state.selectedInterfaceData[i]["out-multicast-pkts"],
          "out-octets": this.state.selectedInterfaceData[i]["out-octets"],
          "out-packets": this.state.selectedInterfaceData[i]["out-pkts"],
          "out-unicast-pkts": this.state.selectedInterfaceData[i]["out-unicast-pkts"],
          "oversize": this.state.selectedInterfaceData[i]["in-oversize-frames"],
          "rx-packet-rate": this.state.selectedInterfaceData[i]["rx-packet-rate"],
          "rx-throughput": this.state.selectedInterfaceData[i]["rx-throughput"],
          "tx-packet-rate": this.state.selectedInterfaceData[i]["tx-packet-rate"],
          "tx-throughput": this.state.selectedInterfaceData[i]["tx-throughput"],
          "undersize": this.state.selectedInterfaceData[i]["in-undersize-frames"],
          "time": this.state.selectedInterfaceData[i]["time"]
        };
      
        Performance.push(headerDict);
      }
      
      console.log(Performance,"headdic");
      
      this.setState({
        csvReport: {
          data: Performance,
          headers: performanceHeaders,
          filename: "Performance Stats.csv",
        },
      });
      
      })
      .catch((err) => {
        this.setState({ is_fetching: false })
        if (err.response) {
          alert(err.response.data.status)
          console.log('Error Response Data:', err.response.data);
          console.log('Error Response Status:', err.response.status);
          console.log('Error Response Headers:', err.response.headers);
        }
      });
  }
  handleCheckboxChange = (header, value) => {
    const { filter } = this.state;

    const isChecked = filter[header].includes(value);
  

    this.setState((prevState) => ({
      filter: {
        ...prevState.filter,
        [header]: isChecked
          ? prevState.filter[header].filter((item) => item !== value)
          : [...prevState.filter[header], value],
      },
    }), () => {
    });
  };

  // findInterfaces(data) {
  //   const { selectedInterface } = this.state;
  //   var InterfaceInThroughput = [], InterfaceOutThroughput = [], InterfaceBandwidth = [], InterfaceInPacket = [], InterfaceOutPacket = [], InterfaceInError = [], InterfaceOutError = [], InterfaceInDiscard = [], InterfaceOutDiscard = []

  //   for (let key2 in data) {
  //     InterfaceInThroughput.push(data[key2][selectedInterface]["rx-throughput"])
  //     InterfaceOutThroughput.push(data[key2][selectedInterface]["tx-throughput"])
  //     InterfaceBandwidth.push(data[key2][selectedInterface]["bandwidth-utilization"])
  //     InterfaceInPacket.push(data[key2][selectedInterface]["bandwidth-utilization"])
  //     InterfaceOutPacket.push(data[key2][selectedInterface]["tx-packet-rate"])
  //     InterfaceInError.push(data[key2][selectedInterface]["in-errors"])
  //     InterfaceOutError.push(data[key2][selectedInterface]["out-errors"])
  //     InterfaceInDiscard.push(data[key2][selectedInterface]["in-discards"])
  //     InterfaceOutDiscard.push(data[key2][selectedInterface]["out-discards"])
  //   }
  //   this.setState({
  //     InterfaceInThroughput: InterfaceInThroughput,
  //     InterfaceOutThroughput: InterfaceOutThroughput,
  //     InterfaceBandwidth: InterfaceBandwidth,
  //     InterfaceInPacket: InterfaceInPacket,
  //     InterfaceOutPacket: InterfaceOutPacket,
  //     InterfaceInError: InterfaceInError,
  //     InterfaceOutError: InterfaceOutError,
  //     InterfaceInDiscard: InterfaceInDiscard,
  //     InterfaceOutDecard: InterfaceOutDiscard
  //   })
  // }
  findInterfaces(data) {
    const { selectedInterface } = this.state;
    const newState = {};

    for (let key2 in data) {
        const interfaceData = data[key2][selectedInterface];
        for (let prop in interfaceData) {
            if (!newState[prop]) {
                newState[prop] = [];
            }
            newState[prop].push(interfaceData[prop]);
        }
    }

    // Update the state with newState and use a callback to check the updated state
    this.setState({ selectt: newState }, () => {
        console.log(this.state.selectt, "Updated State"); // Log the updated state
    });
}


  
  findAggregateStats(data) {
    var deviceBandwidt = [], deviceInThroughput = [], deviceOutThroughput = [], deviceInPacket = [], deviceOutPacket = [], deviceInError = [], deviceOutError = [], deviceInDiscard = [], deviceOutDiscard = []
    let entries = Object.entries(data);
    let lastEntry = entries[entries.length - 1];
    let [key, value] = lastEntry;
    for (let time in data) {
      console.log(data[time].bandwidth_utilization,"tt")
      

      deviceBandwidt.push(data[time]["bandwidth-utilization"])
      deviceInThroughput.push(data[time]["rx-throughput"])
      deviceOutThroughput.push(data[time]["tx-throughput"])
      deviceInPacket.push(data[time]["rx-packet-rate"])
      deviceOutPacket.push(data[time]["tx-packet-rate"])
      deviceInError.push(data[time]["in-errors"])
      deviceOutError.push(data[time]["out-errors"])
      deviceInDiscard.push(data[time]["in-discards"])
      deviceOutDiscard.push(data[time]["out-discards"])

    }
    console.log(deviceBandwidt,"throu")
    this.setState({
      deviceBandwidth: deviceBandwidt,
      deviceInThroughput: deviceInThroughput,
      deviceOutThroughput: deviceOutThroughput,
      deviceInPacket: deviceInPacket,
      deviceOutPacket: deviceOutPacket,
      deviceInError: deviceInError,
      deviceOutError: deviceOutError,
      deviceInDiscard: deviceInDiscard,
      deviceOutDiscard: deviceOutDiscard,
      aggergateStats: value
    })
    console.log(data,"devicedata")

    console.log(this.state.deviceBandwidth,"deviindis")

  }
  handleChangeInterface(e) {
    const { performanceInterfaceData } = this.state;
    var value = e.target.value;
    var list = [];
    for (const date in performanceInterfaceData) {
      performanceInterfaceData[date][value]["time"] = date
      list.push(performanceInterfaceData[date][value])
    }
    this.setState({ selectedInterface: value, selectedInterfaceData: list },
      () => {
        this.findInterfaces(performanceInterfaceData);
      }
    )

  }
  handlePageChange = (pageNumber) => {
    this.setState({ activePage: pageNumber });
  }
  setTime(id, data) {
    const { timestamp_Filter } = this.state;
    const currentDate = new Date();
    const AgoData = new Date(currentDate);
    var xAxis = []
    if (id === '24hour') {
      AgoData.setHours(currentDate.getHours() - 24);
      for (let i = 24; i >= 0; i--) {
        const currentTime = new Date(currentDate.getTime() - i * 60 * 60 * 1000); // 1 hour in milliseconds
        const hour = currentTime.getHours();
        const minutes = currentTime.getMinutes();
        const formattedTime = `${hour < 10 ? '0' + hour : hour}:${minutes < 10 ? '0' + minutes : minutes}`;
        xAxis.push(formattedTime);
        const formattedCurrentDate = this.convertDateFormat(currentDate);
        const formattedAgoData = this.convertDateFormat(AgoData);

        timestamp_Filter['start_time'] = formattedAgoData;
        timestamp_Filter['stop_time'] = formattedCurrentDate;
        this.setState({ timestamp_Filter });
      }
    } else if (id === 'week') {
      AgoData.setDate(currentDate.getDate() - 7);
      const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const currentDay = currentDate.getDay(); // 0 for Sunday, 1 for Monday, ...

      for (let i = 7; i >= 0; i--) {
        const dayIndex = (currentDay - i + 7) % 7; // Ensure it wraps around to the previous week
        xAxis.push(daysOfWeek[dayIndex]);
      }
      const formattedCurrentDate = this.convertDateFormat(currentDate);
      const formattedAgoData = this.convertDateFormat(AgoData);

      timestamp_Filter['start_time'] = formattedAgoData;
      timestamp_Filter['stop_time'] = formattedCurrentDate;
      this.setState({ timestamp_Filter });
    }
    else if (id === 'month') {
      AgoData.setMonth(currentDate.getMonth() - 1);
      const currentMonth = currentDate.getMonth(); // 0 for January, 1 for February, ...
      const currentYear = currentDate.getFullYear();

      // Calculate the last month's start and end dates
      const lastMonthStart = new Date(currentYear, currentMonth - 1, currentDate.getDate());
      const lastMonthEnd = new Date(currentYear, currentMonth, currentDate.getDate());

      // Generate dates for the last month
      const currentDateCopy = new Date(lastMonthStart); // Start with August 22nd
      while (currentDateCopy <= lastMonthEnd) {
        const day = currentDateCopy.getDate();
        const month = currentDateCopy.getMonth();
        let year = currentDateCopy.getFullYear(); // Declare year as a variable

        const monthName = this.getMonthName(month).slice(0, 3); // Get the first 3 letters of the month name
        xAxis.push(monthName + ' ' + day); // Get the month name and day
        currentDateCopy.setDate(day + 1); // Move to the next day

        // Check if the month has changed
        if (currentDateCopy.getMonth() !== month) {
          // Month has changed, so update the year
          year += 1;
        }
        const formattedCurrentDate = this.convertDateFormat(currentDate);
        const formattedAgoData = this.convertDateFormat(AgoData);

        timestamp_Filter['start_time'] = formattedAgoData;
        timestamp_Filter['stop_time'] = formattedCurrentDate;
        this.setState({ timestamp_Filter });
      }
    }
    else if (id === 'year') {
      AgoData.setFullYear(currentDate.getFullYear() - 1);
      const currentMonth = currentDate.getMonth(); // 0 for January, 1 for February, ...

      for (let i = -1; i < 13; i++) {
        const monthIndex = (currentMonth - i + 12) % 12; // Ensure it wraps around to the previous year
        const monthName = this.getMonthName(monthIndex).slice(0, 3); // Get the first three letters of the month name
        xAxis.push(monthName);
        const formattedCurrentDate = this.convertDateFormat(currentDate);
        const formattedAgoData = this.convertDateFormat(AgoData);

        timestamp_Filter['start_time'] = formattedAgoData;
        timestamp_Filter['stop_time'] = formattedCurrentDate;
        this.setState({ timestamp_Filter });
      }
    }
    else if (id === 'hour') {
      AgoData.setHours(currentDate.getHours() - 1);
      for (let i = 6; i >= 0; i--) {
        const currentTime = new Date(currentDate.getTime() - i * 10 * 60 * 1000); // 10 minutes in milliseconds
        const hour = currentTime.getHours();
        const minutes = currentTime.getMinutes();
        const formattedTime = `${hour < 10 ? '0' + hour : hour}:${minutes < 10 ? '0' + minutes : minutes}`;
        xAxis.push(formattedTime);
        if (id !== 'alreadyset') {
          const formattedCurrentDate = this.convertDateFormat(currentDate);
          const formattedAgoData = this.convertDateFormat(AgoData);
          timestamp_Filter['start_time'] = formattedAgoData;
          timestamp_Filter['stop_time'] = formattedCurrentDate;
          this.setState({ timestamp_Filter });
        }
      }
    }
    else {
      var section = []
      var subsection = []
      for (let i = 0; i < Object.keys(data.aggregate).length; i++) {
        if ((i % 30 !== 0 || i === 0) && i !== Object.keys(data.aggregate).length - 1) {
          subsection.push(Object.keys(data.aggregate)[i])
        }
        else {
          section.push(subsection)
          subsection = []
        }
      }
      if (section.length > 1) {
        this.setState({ subSectionData: section })
      }
      for (let i = 0; i < Object.keys(data.aggregate).length; i++) {
        // Parse the original date string
        const originalDate = new Date(Object.keys(data.aggregate)[i]);

        // Format the date as "03/11/23 (12am)"
        const formattedDate = `${formatTwoDigits(originalDate.getDate())}/${formatTwoDigits(originalDate.getMonth() + 1)}/${formatTwoDigits(originalDate.getFullYear() % 100)} (${formatAMPM(originalDate)})`;

        // Push the formatted date into the xAxis array
        xAxis.push(formattedDate);
      }

      // Function to format a number as two digits with leading zeros
      function formatTwoDigits(number) {
        return (number < 10 ? '0' : '') + number;
      }

      // Function to format time in 12-hour clock with AM/PM
      function formatAMPM(date) {
        let hours = date.getHours();
        let minutes = date.getMinutes();
        const ampm = hours >= 12 ? 'pm' : 'am';

        hours = hours % 12;
        hours = hours ? hours : 12; // Handle midnight (0 hours)

        minutes = minutes < 10 ? '0' + minutes : minutes;

        return `${hours}:${minutes}${ampm}`;
      }
    }
    this.setState({ xAxis: xAxis }, () => {
      console.log("setState completed. New xAxis:", this.state.xAxis);
  });
    }
  getMonthName(monthIndex) {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return monthNames[monthIndex];
  }
  convertDateFormat(inputDateStr) {
    const inputDate = new Date(inputDateStr);
    return inputDate.toISOString(); // Returns date in ISO 8601 format
  }
  handleStepTimeInterval(e) {
    const { unitInterval } = this.state;
    var value = e.target.value;
    if (unitInterval === "m") {
      if (value < 5) {
        alert("Step time interval in minutes should not be less than 5.");
        this.setState({ stepTimeInterval: 5 });
      } else {
        this.setState({ stepTimeInterval: value });
      }
    } else {
      if (value < 1) {
        alert("Have some sense.");
      } else {
        this.setState({ stepTimeInterval: value });
      }
    }
  }
  sortLogTable = (e, column) => {
    const { sortColumn, sortDirection, selectedInterfaceData } = this.state;
    let direction = "asc"
    if (sortColumn === column && sortDirection === 'asc') {
      direction = 'desc';
      this.setState({ sortOrder: 'desc' })
    }
    else {
      this.setState({ sortOrder: 'asc' })
    }

    const sortedItems = selectedInterfaceData.sort((a, b) => {
      if (a[column] && b[column]) {
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
      }
      return 0;
    }
    );
    this.setState({
      selectedInterfaceData: sortedItems,
      sortColumn: column,
      sortDirection: direction,
      selectedthSort: column
    });

  }
  
toggleDropdown = () => {
  this.setState((prevState) => ({
    isOpen: !prevState.isOpen,
  }));
};



  applyFilter = () => {
    const { selectedInterfaceData, filter } = this.state;
    

    const filteredLogs = selectedInterfaceData.filter((log) => {
      return (
        (!filter["tx-throughput"] || !filter["tx-throughput"].length || filter["tx-throughput"].includes(log["tx-throughput"])) &&
        (!filter.bad_crc || !filter.bad_crc.length ||filter.bad_crc.includes(log.bad_crc)) &&
        (!filter.bandwidth_utilization || !filter.bandwidth_utilization.length || filter.bandwidth_utilization.includes(log.bandwidth_utilization)) &&
        (!filter.fragments || !filter.fragments.length || filter.fragments.includes(log.fragments)) &&
        (!filter.in_broadcast_pkts || !filter.in_broadcast_pkts.length || filter.in_broadcast_pkts.includes(log.in_broadcast_pkts)) &&
(!filter.in_discards || !filter.in_discards.length || filter.in_discards.includes(log.in_discards)) &&
(!filter.in_errors || !filter.in_errors.length || filter.in_errors.includes(log.in_errors)) &&
(!filter.in_multicast_pkts || !filter.in_multicast_pkts.length || filter.in_multicast_pkts.includes(log.in_multicast_pkts)) &&
(!filter.in_octets || !filter.in_octets.length || filter.in_octets.includes(log.in_octets)) &&
(!filter.in_packets || !filter.in_packets.length || filter.in_packets.includes(log.in_packets)) &&
(!filter.in_unicast_pkts || !filter.in_unicast_pkts.length || filter.in_unicast_pkts.includes(log.in_unicast_pkts)) &&
(!filter.jabbers || !filter.jabbers.length || filter.jabbers.includes(log.jabbers)) &&
(!filter.out_broadcast_pkts || !filter.out_broadcast_pkts.length || filter.out_broadcast_pkts.includes(log.out_broadcast_pkts)) &&
(!filter.out_discards || !filter.out_discards.length || filter.out_discards.includes(log.out_discards)) &&
(!filter.out_errors || !filter.out_errors.length || filter.out_errors.includes(log.out_errors)) &&
(!filter.out_multicast_pkts || !filter.out_multicast_pkts.length || filter.out_multicast_pkts.includes(log.out_multicast_pkts)) &&
(!filter.oversize || !filter.oversize.length || filter.oversize.includes(log.oversize)) &&
(!filter.rx_packet_rate || !filter.rx_packet_rate.length || filter.rx_packet_rate.includes(log.rx_packet_rate)) &&
(!filter.rx_throughput || !filter.rx_throughput.length || filter.rx_throughput.includes(log.rx_throughput)) &&
(!filter.tx_packet_rate || !filter.tx_packet_rate.length || filter.tx_packet_rate.includes(log.tx_packet_rate)) &&
(!filter.undersize || !filter.undersize.length || filter.undersize.includes(log.undersize))&&
        (!filter.out_octets || !filter.out_octets.length || filter.out_octets.includes(log.out_octets)) &&
        (!filter.out_packets || !filter.out_packets.length || filter.out_packets.includes(log.out_packets)) &&
        (!filter.out_unicast_pkts || !filter.out_unicast_pkts.length || filter.out_unicast_pkts.includes(log.out_unicast_pkts))










      );
    });
    this.setState({ selectedInterfaceData: filteredLogs, openFilterPopup: false });
  };
  clearFilter = () => {
    // Clear the filter and show all logs
    this.setState({
      filter: Object.keys(this.state.filter).reduce((acc, key) => {
        return { ...acc, [key]: [] }; // Clear all filter values
      }, {}),
      selectedInterfaceData: this.state.selectedInterfaceData_for_filter,
      openFilterPopup: false,
    });
  };



  generatePerformancePDF = () => {
    const data = this.state.performanceInterfaceData;
    var currentTime = new Date().toLocaleString().replace(/:/g, '-');
    const unit = "pt";
    const size = "A4";
    const orientation = "portrait";
    const marginLeft = 40;
    const marginTop = 40;
    const doc = new jsPDF(orientation, unit, size);

    doc.setFontSize(15);
    doc.setTextColor(0, 0, 255);
    const title = "Performance Interfaces Report ";
    doc.text(title, marginLeft, marginTop);
    doc.setTextColor(0, 0, 0);

    const tableData = [];

    // If filtered_data is not empty, proceed with regular table generation

    for (const timestamp in data) {
      const entries = data[timestamp];

      for (const entryName in entries) {
        const entry = entries[entryName];
        const row = {
          Timestamp: timestamp,
          Name: entryName,
        };

        for (const prop in entry) {
          if (prop !== "name") {
            const cellValue = ` ${entry[prop]}`;
            row[prop] = cellValue;
          }
        }

        tableData.push(row); // Add row to the table data
      }
    }


    const tableColumns = Object.keys(tableData[0]);
    doc.autoTable({
      head: [tableColumns],
      body: tableData.map((row) => Object.values(row)),
      startY: marginTop + 50,
      margin: { left: marginLeft, right: marginLeft },
      styles: {
        fontSize: 3, // Adjust the font size here as needed
      },
    });
    const now = new Date();
    const formattedDate = now.toLocaleString().replace(/:/g, '-');
    const fileName = `PerformanceInterfaces_Report_${formattedDate}${currentTime}.pdf`;

    doc.save(fileName);
  };

  renderInputField = (label, fieldName) => (
    <div className="headsec">
      <div className="headvar">{label}</div>
      <div className="headval">{fieldName}</div>
    </div>
  );
  toggleDarkMode = () => {
    this.setState((prevState) => ({ isDarkMode: !prevState.isDarkMode }));
  };
  render() {
    const { isDarkMode,isOpen,selectt} = this.state;
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
    const { performanceInterfaceData, filter, interfaceList, performanceData, aggergateStats, activePage, itemsPerPage,
      opencustomizedTime, Topheaders, selectedInterfaceData, selectedInterfaceData_for_filter, ipSlaStatistics,
      newState
     } = this.state;

    const indexOfLastItem = activePage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    let currentItems, tableHeaders, nonFilterableColumns, uniqueOptions;

    if (selectedInterfaceData) {
      currentItems = selectedInterfaceData.slice(indexOfFirstItem, indexOfLastItem);
    }
    if (selectedInterfaceData) {

      nonFilterableColumns = [""];
      tableHeaders = [
        "bad-crc",
        "bandwidth-utilization",
        "fragments",
        "in-broadcast-pkts",
        "in-discards",
        "in-errors",
        "in-multicast-pkts",
        "in-octets",
        "in-packets",
        "in-unicast-pkts",
        "jabbers",
        "out-broadcast-pkts",
        "out-discards",
        "out-errors",
        "out-multicast-pkts",
        "out-octets",
        "out-packets",
        "out-unicast-pkts",
        "oversize",
        "rx-packet-rate",
        "rx-throughput",
        "tx-packet-rate",
         "tx-throughput",
        "undersize"
      ];
      console.log(this.state.xAxis,"xaxis")
      uniqueOptions = tableHeaders.reduce((options, header) => {
        if (!nonFilterableColumns.includes(header)) {
          options[header] = Array.from(new Set(selectedInterfaceData_for_filter.map((log) => log[header]))).filter(Boolean);
        }
        return options;
      }, {});
    }
 
    return (
      
        <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
        <div style={{height:"100vh",overflow:"hidden"}}  className={isDarkMode ? 'dark-mode' : 'light-mode'}>
            <div style={{ backgroundColor: isDarkMode ? darkTheme.palette.background.default : lightTheme.palette.background.default }}>
            <div style={{display:'flex'}}>
            <NewLeftpanel page='performance' darkMode={this.state.isDarkMode}/>
            <div style={{flex:'4',marginLeft:"18%"}}>
                <div  style={{backgroundColor: isDarkMode ? darkTheme.palette.background.default : lightTheme.palette.background.default}}>
                    <NewHeader header_name='Performance Panel' path='Config' darkMode={this.state.isDarkMode} toggleDarkMode={this.toggleDarkMode}/>
                </div>
                
                
                {this.state.mainContent ? (
                  <div className='mainContent performanceTabview' style={{height:"80vh",overflowY:"auto",overflowX:"hidden",width:"80vw",marginLeft:"19px"}}>
                    {performanceData ? (
                      <div className="deviceInfo" style={{ marginLeft: "0%" }}>
                        <Tabs defaultActiveKey="device" id="routing-tabs">
                          <Tab eventKey="device" title="Device Performance Stats">
                            <div style={{ display: 'flex', margin: "1%" }}>
                              <div className="headsec">
                                <div className="headvar">INBOUND THROUGHPUT</div>
                                <div className="headval">{aggergateStats.rx_throughput} bits/s</div>
                              </div>
                              <div className="headsec">
                                <div className="headvar">OUTBOUND THROUGHPUT</div>
                                <div className="headval">{aggergateStats.tx_throughput} bits/s</div>
                              </div>
                              <div className="headsec">
                                <div className="headvar">UPTIME</div>
                                <div className="headval">{`${performanceData.uptime}`}</div>
                              </div>
                              <div className="headsec">
                                <div className="headvar">TOTAL CAPACITY</div>
                                <div className="headval">{sessionStorage.getItem('unique_id').includes('csar') ? ('85G') : (sessionStorage.getItem('unique_id').includes('cuar') ? ('1177G') : (''))}</div>
                              </div>
                            </div>
                          </Tab>
                          <Tab eventKey="sla" title="IP SLA Statistics">
                            {ipSlaStatistics ? (
                              ipSlaStatistics.map(item => (
                                <div style={{ margin: "1%" }}>
                                  <div style={{ fontWeight: "600", color: "#294166" }}>Identifier: {item.identifier}</div>
                                  <div style={{ display: 'flex', flexWrap: "wrap", margin: "0.5%" }}>
                                    {this.renderInputField("AVG ROUND TRIP DELAY", item["ip-sla-statistics"].state["average-round-trip-delay"] + " uS")}
                                    {this.renderInputField("ELAPSED TIME", item["ip-sla-statistics"].state["elapsed-time"] + " mS")}
                                    {this.renderInputField("INVALID Tests", item["ip-sla-statistics"].state["invalid-tests"])}
                                    {this.renderInputField("MAX ROUND TRIP DELAY", item["ip-sla-statistics"].state["maximum-round-trip-delay"] + " uS")}
                                    <br></br>
                                    {this.renderInputField("MIN ROUND TRIP DELAY", item["ip-sla-statistics"].state["minimum-round-trip-delay"] + " uS")}
                                    {this.renderInputField("PACKET LOSS", item["ip-sla-statistics"].state["packets-lost"])}
                                    {this.renderInputField("PACKETS RECIEVED", item["ip-sla-statistics"].state["packets-received"])}
                                    {this.renderInputField("PACKETS SENT", item["ip-sla-statistics"].state["packets-sent"])}
                                  </div>
                                </div>
                              ))

                            ) : '*Data not found'}
                          </Tab>

                          <Tab eventKey="lsp" title="Routing LSP">
                            <div style={{ margin: "1%" }}>
                              <h1 style={{ fontSize: '1.5rem' }}>Routing Details</h1>
                              {/* <RoutingDetails data={this.state.routingData} /> */}
                            </div>
                          </Tab>
                        </Tabs>

                      </div>
                    ) : null}

                    <div className="line"></div>
                    <div className="deviceInfo">
                      <div >
                        <div style={{ display: 'flex' }}>
                          <select className="intervalLabel" style={{ width: 'fit-content', marginTop: '1%' }}
                            value={this.state.selectedUnit}
                            onChange={(event) => {
                              const selectedValue = event.target.value;

                              if (selectedValue === 'Custom Time Range') {
                                this.setState({ selectedUnit: selectedValue, opencustomizedTime: true, unitInterval: 'd' });
                              } else {
                                this.setState({ selectedUnit: selectedValue, opencustomizedTime: false });
                                this.fetchPerformanceStats(selectedValue)
                              }
                            }}
                          >
                            <option value="hour">Last Hour</option>
                            <option value="24hour">Last 24 Hour</option>
                            <option value="week">Last Week</option>
                            <option value="month">Last Month</option>
                            <option value="year">Last Year</option>
                            <option value="Custom Time Range">Custom Time Range</option>
                          </select>
                        </div>

                        {opencustomizedTime ? (
                          <div style={{ display: 'flex' }}>
                            <div>
                              <div style={{ fontWeight: "500", fontSize: 'small' }}>START:</div>
                              <form onSubmit={this.onFormSubmit}>
                                <div className="form-group">
                                  <DatePicker
                                    selected={new Date(this.state.timestamp_Filter.start_time)}
                                    onChange={(e) => {
                                      const a = { ...this.state.timestamp_Filter };
                                      const d = new Date(e);
                                      a.start_time = this.convertDateFormat(d);
                                      this.setState({ timestamp_Filter: a, setFlag: true });
                                    }}
                                    showTimeSelect
                                    timeFormat="HH:mm"
                                    timeIntervals={20}
                                    timeCaption="time"
                                    dateFormat="MMMM d, yyyy h:mm aa"
                                    placeholder="Please select a date"
                                    className="small-date-time-picker"
                                  />
                                </div>
                              </form>
                            </div>
                            <div style={{ marginLeft: '31px' }}>
                              <div style={{ fontWeight: "500", fontSize: 'small' }}>END:</div>
                              <form onSubmit={this.onFormSubmit}>
                                <div className="form-group">
                                  <DatePicker
                                    style={{ borderBottom: '0px' }}
                                    selected={new Date(this.state.timestamp_Filter.stop_time)}
                                    onChange={(e) => {
                                      const a = { ...this.state.timestamp_Filter };
                                      const d = new Date(e);
                                      a.stop_time = this.convertDateFormat(d);
                                      this.setState({ timestamp_Filter: a });
                                    }}
                                    showTimeSelect
                                    timeFormat="HH:mm"
                                    timeIntervals={20}
                                    timeCaption="time"
                                    dateFormat="MMMM d, yyyy h:mm aa"
                                    placeholder="Please select a date"
                                    className="small-date-time-picker"
                                  />
                                </div>
                              </form>
                            </div>
                            <div style={{ marginLeft: '31px', display: 'flex' }}>
                              <div>
                                <div style={{ fontWeight: "500", fontSize: 'small' }}>Interval:</div>
                                <div style={{ display: 'flex' }}>
                                  <input
                                    type="number" className="intervalLabel"
                                    value={this.state.stepTimeInterval}
                                    onChange={(event) => { this.handleStepTimeInterval(event) }}
                                  />
                                  <select className="intervalLabel" style={{ width: 'fit-content' }} value={this.state.unitInterval} onChange={(event) => { this.setState({ unitInterval: event.target.value }) }}>
                                    <option value="d">Days</option>
                                    <option value="h">Hours</option>
                                    <option value="m">Minutes</option>
                                  </select>
                                </div>
                              </div>
                            </div>
                            <button className="btn btn-primary mb-3" style={{ marginLeft: '5%', width: '10%', marginTop: '1.5%' }}
                              onClick={() => {
                                this.fetchPerformanceStats('alreadyset', this.state.selectedInterface, 'fetch');
                              }}>
                              Submit
                            </button>
                          </div>
                        ) : null}



                        <div style={{ display: 'flex', marginTop: '2%', alignItems: 'center' }}>
                          <div className="boxbound" style={this.state.inToggle ? ({ backgroundColor: 'rgb(4 119 155)', color: 'white' }) : ({ backgroundColor: 'white', color: 'black' })} onClick={() => this.setState({ inToggle: true, outToggle: false })}>Inbound</div>
                          <div className="boxbound" style={this.state.outToggle ? ({ backgroundColor: 'rgb(4 119 155)', color: 'white' }) : ({ backgroundColor: 'white', color: 'black' })} onClick={() => this.setState({ inToggle: false, outToggle: true })}>Outbound</div>
                        </div>
                      </div>
                      {this.state.xAxis? (
                        <div style={{ display: 'flex', marginTop: '0.5%', width: '100%', overflowX: 'scroll', overflowY: 'hidden' }}>
                           { <RXTXGraph unit='percentage' width='340' height={this.state.xAxis[0].length > 8 ? '330' : '230'} name={sessionStorage.getItem('unique_id')} xAxis={this.state.xAxis} data={this.state.deviceBandwidth} chartId='Throughput' heading='Bandwidth Utilization' /> }
                          { <RXTXGraph unit='bits/s' width='340' height={this.state.xAxis[0].length > 8 ? '330' : '230'} name={sessionStorage.getItem('unique_id')} xAxis={this.state.xAxis} data={this.state.inToggle ? (this.state.deviceInThroughput) : (this.state.deviceOutThroughput)} chartId='Throughput4' heading='Throughput' /> }
                          { <RXTXGraph unit='packets/s' width='340' height={this.state.xAxis[0].length > 8 ? '330' : '230'} name={sessionStorage.getItem('unique_id')} xAxis={this.state.xAxis} data={this.state.inToggle ? (this.state.deviceInPacket) : (this.state.deviceOutPacket)} chartId='Throughput5' heading='Packet rate' /> }
                          { <RXTXGraph unit='frames' width='340' height={this.state.xAxis[0].length > 8 ? '330' : '230'} name={sessionStorage.getItem('unique_id')} xAxis={this.state.xAxis} data={this.state.inToggle ? (this.state.deviceInError) : (this.state.deviceOutError)} chartId='Throughput2' heading='Interface Errors' /> }
                          { <RXTXGraph unit='packets' width='340' height={this.state.xAxis[0].length > 8 ? '330' : '230'} name={sessionStorage.getItem('unique_id')} xAxis={this.state.xAxis} data={this.state.inToggle ? (this.state.deviceInDiscard) : (this.state.deviceOutDecard)} chartId='Throughput3' heading='Discards' /> }
                         
                        </div>
                      ) : null}
                    </div>
                    {/* interface part */}
                    <div className="line"></div>
                    <div className="deviceInfo">
                      <div className="perfHead">Performance stats per Interface</div>
                      {performanceInterfaceData ? (
                        <select onChange={(e) => this.handleChangeInterface(e)} className="intervalLabel" style={{ borderRadius: '3px' }}>
                          {interfaceList.length >= 1 && interfaceList.map(item => (
                            <option value={item}>{item}</option>
                          ))}
                        </select>
                      ) : null}
                      <button className="btndel" style={{ backgroundColor: 'rgb(27 162 205)', width: '17%', height: '34px', marginTop: '2%' }}
                        onClick={() => this.state.graphPopup ? (this.setState({ graphPopup: false })) : (this.setState({ graphPopup: true }))}
                      >{this.state.graphPopup ? 'Tabular view' : 'Graphical view'}
                      </button>
                      
                      <div style={{ display: 'flex',position:"relative",left:"81%",marginTop:"-3%"}}>
                      <div
                      onClick={this.toggleDropdown}
                      ref={(ref) => (this.dropdownRef = ref)}
                      className="tabbox"
                      style={
                        this.state.showReport
                          ? { color: "#004f68", fontWeight: "bold" }
                          : null
                      }
                    >
                      <img
                        alt=""
                        className="tabicon"
                        src={require("../Images/report.png")}
                      ></img>
        Reports
        {isOpen && selectedInterfaceData? (
          selectedInterfaceData.length > 0 ? (
            <div className="downloadOptions" style={{ marginTop: "11.5%",marginLeft:"1%" }} >
          <div className="optionsBox" onClick={(e) => {this.generatePerformancePDF(); }}  >
          <img alt="" className="tabicon"  src={require("../Images/pdf.png")}></img>
                Performace stats PDF
              </div>
              {this.state.csvReport ? (
                <CSVLink {...this.state.csvReport}>
                  <div className="optionsBox" style={{color: "black", textTransform: null,}} >
                    <img alt="" className="tabicon" src={require("../Images/csv.png")}></img>
                    Performance Stats CSV
                  </div>
                </CSVLink>
                            ) : (
          <div className="optionsBox" style={{ color: "black", textTransform: null }}  >                    
            <img alt="" className="tabicon" src={require("../Images/csv.png")}                                 ></img>
                Performance Stats CSV
                              </div>
                            )}
                          </div>
                        ) : (
 <div className="downloadOptions"> No Data</div>
                        )
                      ) : null}
                    </div>
                    <div className='tabbox' onClick={(e) => this.setState(prevState => ({  openFilterPopup: !prevState.openFilterPopup
                          }))
                          }
                        >
      <img alt="" className='tabicon' src={require('../Images/filter.png')}></img>Filter
                        </div>
                        </div>
                      {this.state.openFilterPopup ? (
                        <div className="filter-popup" style={{marginTop:"3.5%",overflowX:"scroll"}}>
                          <h className="filtertext">Filter By :</h>
                          <img src={close} style={{position:"fixed"}} alt="" className='closeX' onClick={(e) => this.setState({ openFilterPopup: false })} />
                          <div style={{ display: "flex", marginLeft: '5%' }}>
                            {tableHeaders.map((header) => (
                              !nonFilterableColumns.includes(header) && (
                                <div key={header} style={{ margin: "5px" }}>
                                  {uniqueOptions[header] && uniqueOptions[header].length > 0 ? (
                                    <div style={{ alignItems: 'center' }}>
                                      <label className='filterLabels' style={{ fontSize: 'small' }}>{header}:</label>
                                      <div className="select-box">
                                        <div className="checkbox-scroll-box">
                                          {uniqueOptions[header].map((option) => (
                                            <div key={option} style={{ display: 'flex' }}>
                                              <input
                                                type="checkbox"
                                                value={option}
                                                checked={filter && filter[header] && filter[header].includes(option)}
                                                onChange={(e) =>
                                                  this.handleCheckboxChange(header, option)
                                                }
                                              />
                                              <label style={{ marginTop: '7px' }}>{String(option)}</label>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    </div>
                                  ) : null}
                                </div>
                              )
                            ))}
                          </div>
                          <div style={{ display: 'flex',marginTop:"1.5"}}>
                            <button onClick={this.applyFilter} className='btn btn-primary mb-3'>Apply</button>
                            <button onClick={this.clearFilter} className='btn btn-primary mb-3' style={{background:"red"}}>Clear</button>
                          </div>
                        </div>
                      ) : null}

                      {currentItems && performanceInterfaceData && !this.state.graphPopup ? (
                        <div style={{ marginBottom: '10%', overflowX: 'scroll' }}>
                          <table className='user_table'>
                            <thead className='user_table_head' >
                              <tr style={{ backgroundColor: '#e5e8ff', color: 'black' }}>
                                {Topheaders.map((header) => (
                                  <th onClick={(e) => this.sortLogTable(e, header)} style={this.state.selectedthSort && this.state.selectedthSort === header ? this.state.fixthHead : ({ cursor: 'pointer', fontSize: "smaller" })} key={header}>
                                    <div style={{ textTransform: 'capitalize', fontSize: 'small' }}>{header.replace(/_/g, ' ')}</div>
                                    <img alt="" src={this.state.selectedthSort === header && this.state.sortOrder === "asc" ? sortUp : sortDown} width={10} />
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {selectedInterfaceData && currentItems.reverse().map((stats, index) => (
                                <tr className={index === 0 ? 'trPerf greenBackground' : 'trPerf'} >
                                  {Topheaders.map((header) => (
                                    <td key={header}>
                                      {stats[header]}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>

                          <Pagination
                            activePage={activePage}
                            itemsCountPerPage={itemsPerPage}
                            totalItemsCount={selectedInterfaceData.length}
                            pageRangeDisplayed={5}
                            onChange={this.handlePageChange}
                            itemClass="page-item"
                            linkClass="page-link"
                            hideDisabled
                            firstPageText="First"
                            lastPageText="Last"
                            prevPageText="<<"
                            nextPageText=">>"
                            activeClass="active"
                            activeLinkClass="active-link"
                            prevPageClassName="page-item"
                            nextPageClassName="page-item"
                            prevPageLinkClassName="page-link"
                            nextPageLinkClassName="page-link"
                            pageItem={BootstrapPageItem}
                          />
                        </div>
                      ) : (
                        <div className='' style={{ width: '79%' }}>
                          <div style={{ display: 'flex', marginTop: '1%' }}>
                            <div className="perfHead center" onClick={() => this.setState({ errorSec: false })} style={!this.state.errorSec ? ({ width: '350px', backgroundColor: 'grey', color: 'white', padding: '0.5%', cursor: 'pointer', fontSize: 'small' }) : ({ width: '350px', padding: '0.5%', cursor: 'pointer', border: '0.5px solid grey', fontSize: 'small' })}>THROUGHPUT AND PACKET RATE BY INTERFACE</div>
                            <div className="perfHead center" onClick={() => this.setState({ errorSec: true })} style={this.state.errorSec ? ({ width: '350px', backgroundColor: 'grey', color: 'white', padding: '0.5%', cursor: 'pointer', fontSize: 'small' }) : ({ width: '350px', padding: '0.5%', cursor: 'pointer', border: '0.5px solid grey', fontSize: 'small' })}>ERRORS AND DISCARDS BY INTERFACE</div>
                          </div>
                          {this.state.errorSec ? (
                            <div>
                              <div style={{ display: 'flex' }}>
                                <RXTXGraph unit='frames' xAxis={this.state.xAxis} name={this.state.selectedInterface} data={selectt["in-errors"]} width='500' height={this.state.xAxis[0].length > 8 ? '295' : '195'} chartId='Inbound' heading='InBound Errors' />
                                <RXTXGraph unit='frames' xAxis={this.state.xAxis} name={this.state.selectedInterface} data={selectt["out-errors"]} width='500' height={this.state.xAxis[0].length > 8 ? '295' : '195'} chartId='Outbound' heading='OutBound Errors' />
                              </div>
                              <div style={{ display: 'flex' }}>
                                <RXTXGraph unit='packets' xAxis={this.state.xAxis} name={this.state.selectedInterface} data={selectt["in-discards"]} width='500' height={this.state.xAxis[0].length > 8 ? '295' : '195'} chartId='InDiscard' heading='InBound Discarded Packets' />
                                <RXTXGraph unit='packets' xAxis={this.state.xAxis} name={this.state.selectedInterface} data={selectt["out-discards"]} width='500' height={this.state.xAxis[0].length > 8 ? '295' : '195'} chartId='OutDiscard' heading='OutBound Discarded Packets' />
                              </div>
                            </div>
                          ) : (
                            <div>
                              <div style={{ display: 'flex' }}>
                                <RXTXGraph unit='bits/s' xAxis={this.state.xAxis} name={this.state.selectedInterface} data={selectt["rx-throughput"]} width='500' height={this.state.xAxis ? '295' : '195'} chartId='Inthroughput' heading='InBound Throughput' />
                                <RXTXGraph unit='bits/s' xAxis={this.state.xAxis} name={this.state.selectedInterface} data={selectt["tx-throughput"]} width='500' height={this.state.xAxis ? '295' : '195'} chartId='OutThroughput' heading='OutBound Throughput' />
                              </div>
                              <div style={{ display: 'flex' }}>
                                <RXTXGraph unit='packets/s' xAxis={this.state.xAxis} name={this.state.selectedInterface} data={selectt["in-pkts"]} width='500' height={this.state.xAxis ? '295' : '195'} chartId='InPacket' heading='InBound Packet Rate' />
                                <RXTXGraph unit='packets/s' xAxis={this.state.xAxis} name={this.state.selectedInterface} data={selectt["out-pkts"]} width='500' height={this.state.xAxis ? '295' : '195'} chartId='OutPacket' heading='OutBound Packet Rate' />
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ) : null}
            </div>
            </div>
            </div>
        </div>
    </ThemeProvider>
    )
  }
}
export default PerformancePanel;
