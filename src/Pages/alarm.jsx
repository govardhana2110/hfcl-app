import React from "react";
import NewHeader from "../Components/header";
import NewLeftpanel from "../Components/leftPanel";
import DatePicker from "react-datepicker";
import close from "../Images/closeS.png";
import closeS from "../Images/closeS.png";
import sortDown from "../Images/dropDown.png";
import sortUp from "../Images/arrow-up.png";
import AlarmMonth from "../Components/lineChart";
import EquipPie from "../Components/equipPie";
import AlarmPie from "../Components/piechartInAlarm";
import ReactSpeedometer from "react-d3-speedometer";
import Dropdown from "react-dropdown";
import ThermalGuage from "../Components/Thermal";
import Pagination from "react-js-pagination";
import { PageItem as BootstrapPageItem } from "react-bootstrap";
import { CSVLink } from "react-csv";
import jsPDF from "jspdf";
import "jspdf-autotable";
import Loading from "../Components/loader";
import { Tooltip } from "antd";
import enabled from "../Images/power-on.png";
import disabled from "../Images/power-off.png";


import { ThemeProvider, createTheme } from "@mui/material/styles";

class FaultPanel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      uniqueId:null,enable_fault:null,fault_stats:null,disableFaultstats:false,
      windowWidth: window.innerWidth,
      width:0,
      height:0,
      isDarkMode: false,
      searchTerm: "",
      searchCount: 0,
      currentIndex: 0,
      sortedField: "id",
      setFlag: false,
      sortDirection: "asc",
      isOpen: false,
      selectedthSort: null,
      fixthHead: { color: "#297c97e3", cursor: "pointer", position: "static" },
      selectedSeverityFilters: [],
      get_alarms: [],
      get_historyAlarms: [],
      get_filtered_alarms: [],
      get_filtered_historyAlarms: [],
      get_filteredTransitionAlarms: [],
      checkedColumns:[],
      activePage_current: 1,
      isOpenShelve: false,
      itemsPerPage_current: 5,
      activePage_history: 1,
      itemsPerPage_history: 5,
      tempData: null,
      selectedSeverityFilter: { backgroundColor: "#004f68c4", color: "white" },
      is_fetching: false,
      serverIP: process.env.REACT_APP_CLIENT_IP,
      device_id: null,
      StatusValue: 0,
      deviceData: null,
      hold_alarms: null,
      options: null,
      selectedOption: "",
      alarm_history: null,
      equipStatus: [[], []],
      severity: {
        critical: { color: "red", textAlign: "center", fontWeight: "500" },
        minor: { color: "#7d8d0f", textAlign: "center", fontWeight: "500" },
        major: { color: "orange", textAlign: "center", fontWeight: "500" },
        warning: { color: "lightblue", textAlign: "center", fontWeight: "500" },
      },
      show_filter_popup: false,
      filter_by_key: null,
      showAlarm: true,
      showGraph: false,
      showThermal: false,
      showAlarmCurrent: true,
      openFilterPopup: false,
      typeIDavailable: ["AIS", "EQPT", "LOS", "OTS", "OPWR"],
      checked: [],
      Alarmdata: null,
      pdfDataHistory: null,
      Alarmheaders: null,
      showReportOptions: false,
      timestamp_Filter: { start_time: new Date(), stop_time: new Date() },
      csvReport: null,
      pdfData: null,
      csvReportHistory: null,
      showAlarmHistory: false,
      showAlarmTransition: false,
      disableFaultstats:false,
      showClearAllAlarmsPopup: false,
      timeDuration: { start_time: "-365d", stop_time: "now()" },
      showColumns: {
        "id": true,
        "type-id": true,
        "resource": true,
        "text": true,
        "alarm-reported-timestamp": true,
        "alarm-severity": true,
      },
    };
    this._onSelect = this._onSelect.bind(this);
    this.open_filter_popup = this.open_filter_popup.bind(this);
    this.filter_alarms = this.filter_alarms.bind(this);
    this.fetch_active_alarms = this.fetch_active_alarms.bind(this);
    this.sort = this.sort.bind(this);
    this.handleResize = this.handleResize.bind(this);
    this.updateDimensions = this.updateDimensions.bind(this);
  }



  componentDidMount() {
    window.addEventListener('resize', this.handleResize);
    this.updateDimensions();
    window.addEventListener("resize", this.updateDimensions);
    document.addEventListener("click", this.handleDocumentClick);
    const id = sessionStorage.getItem("unique_id");
    this.setState({ uniqueId: id }, () => {
      this.fetchFaultstats();
    });
    this.setDefaultTime();
    this.fetch_active_alarms();
    this.fetchHistoryAlarms();
    this.fetchThermal();
  }

  fetchThermal() {
    fetch(
      `http://${
        this.state.serverIP
      }:5000/configuration-management/device-dashboard/${sessionStorage.getItem(
        "unique_id"
      )}`,
      {
        mode: "cors",
        method: "GET",
        headers: {
          "Access-Control-Allow-Origin": "http://localhost:3000",
          "Content-Type": "application/json",
          username: sessionStorage.getItem("username"),
        },
      }
    )
      .then((resp) => resp.json())
      .then((resp) => {
        console.log(resp);
        this.setState({
          tempData: resp.device_health["device-info"].sensor,
          deviceData: resp.device_health,
        });
        var temp = [];
        for (
          let i = 0;
          i < resp.device_health["device-info"].sensor.length;
          i++
        ) {
          temp.push(resp.device_health["device-info"].sensor[i].name);
        }
        this.setState({ options: temp });
        const equipStatus = [[], []];

        for (const item in resp.device_health["device-info"]) {
          if (item !== "CHASSIS") {
            if (resp.device_health["device-info"].hasOwnProperty(item)) {
              for (const element of resp.device_health["device-info"][item]) {
                if (element.state["ipi-alarms:component-alarm"]) {
                  if (
                    element.state["ipi-alarms:component-alarm"][
                      "equipment-failure"
                    ] === false
                  ) {
                    equipStatus[1].push(element.name);
                  } else {
                    equipStatus[0].push(element.name);
                  }
                }
              }
            }
          }
        }
        this.setState({ equipStatus: equipStatus });
      })
      .catch((err) => {
        if (err.response) {
          alert(err.response.data.status);
          console.log("Error Response Data:", err.response.data);
          console.log("Error Response Status:", err.response.status);
          console.log("Error Response Headers:", err.response.headers);
        }
      });
  }

  handleResize() {
    this.setState({
      windowWidth: window.innerWidth
    });
  }

  fetch_active_alarms() {
    this.setState({ is_fetching: true });
    let device_unique_id = sessionStorage.getItem("unique_id");
    fetch(
      `http://${this.state.serverIP}:5000/configuration-management/configuration/alarms/${device_unique_id}`,
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
        console.log(resp["ipi-alarms:alarms"], "active-alarm-list1");
        this.setState({ is_fetching: false });

        if (Object.keys(resp).length === 0) {
          alert(
            "No Active Alarms present or Fault Management module is disabled"
          );
        } else if (resp.status) {
          alert(resp.status);
          this.setState({ get_alarms: [] });
        } else {
          const alarms = resp["ipi-alarms:alarms"].alarm;

          if (alarms && alarms.length > 0) {
            const alarmStates = alarms.map((alarm) => alarm.state);
            this.setState({ get_alarms: alarmStates });
            this.setState({ get_filtered_alarms: alarmStates });
          } else {
            alert(
              "No Active Alarms present or Fault Management module is disabled"
            );
            this.setState({ get_alarms: [] });
            this.setState({ get_filtered_alarms: [] });
          }
        }
        // this.setState({get_filtered_alarms:this.state.get_alarms})

        var Alarmheaders = [
          {
            label: "Alarm Reported Timestamp",
            key: "alarm_reported_timestamp",
          },
          { label: "Alarm Severity", key: "alarm_severity" },
          { label: "ID", key: "id" },
          { label: "Resource", key: "resource" },
          { label: "Text", key: "text" },
          { label: "Time Created", key: "time_created" },
          { label: "Type ID", key: "type_id" },
        ];
        var Alarmdata = [];

        for (let i = 0; i < this.state.get_alarms.length; i++) {
          let headerDict = {};
          headerDict = {
            alarm_reported_timestamp:
              this.state.get_alarms[i].state["alarm-reported-timestamp"],
            alarm_severity: this.state.get_alarms[i].state["alarm-severity"],
            id: this.state.get_alarms[i].state["id"],
            resource: this.state.get_alarms[i].state["resource"],
            text: this.state.get_alarms[i].state["text"],
            time_created: this.state.get_alarms[i].state["time-created"],
            type_id: this.state.get_alarms[i].state["type-id"],
          };
          Alarmdata.push(headerDict);
        }
        this.setState({ pdfData: Alarmdata });
        this.setState({
          csvReport: {
            data: Alarmdata,
            headers: Alarmheaders,
            filename: "AlarmReport.csv",
          },
        });
      })
      .catch((err) => {
        if (err.response) {
          alert(err.response.data.status);
          console.log("Error Response Data:", err.response.data);
          console.log("Error Response Status:", err.response.status);
          console.log("Error Response Headers:", err.response.headers);
        }
      });
  }

  fetchHistoryAlarms() {
    const { timestamp_Filter } = this.state;
    let device_unique_id = sessionStorage.getItem("unique_id");
    fetch(
      `http://${this.state.serverIP}:5002/fault-management/history-alarms/${device_unique_id}`,
      {
        mode: "cors",
        method: "POST",
        headers: {
          "Access-Control-Allow-Origin": "http://localhost:3000",
          Accept: "application/json",
          "Content-Type": "application/json",
          username: sessionStorage.getItem("username"),
          Authorization:
            "Bearer " +
            JSON.parse(sessionStorage.getItem("login_data")).data.access_token,
        },
        body: JSON.stringify(timestamp_Filter),
      }
    )
      .then((resp) => resp.json())
      .then((resp) => {
        console.log(resp, "alarms HISTROY fetched");
        if (resp.status) {
          this.setState({ get_historyAlarms: [] });
        } else {
          this.setState({ get_historyAlarms: resp });
        }
        this.setState({ get_filtered_historyAlarms: resp });
        var Alarmheaders = [
          {
            label: "Alarm Reported Timestamp",
            key: "alarm_reported_timestamp",
          },
          { label: "Alarm Severity", key: "alarm_severity" },
          { label: "ID", key: "id" },
          { label: "Resource", key: "resource" },
          { label: "Text", key: "text" },
          { label: "Time Created", key: "time_created" },
          { label: "Type ID", key: "type_id" },
        ];
        var Alarmdata = [];

        for (let i = 0; i < this.state.get_historyAlarms.length; i++) {
          let headerDict = {};
          headerDict = {
            alarm_reported_timestamp:
              this.state.get_historyAlarms[i]["alarm_reported_timestamp"],
            alarm_severity: this.state.get_historyAlarms[i]["alarm_severity"],
            id: this.state.get_historyAlarms[i]["id"],
            resource: this.state.get_historyAlarms[i]["resource"],
            text: this.state.get_historyAlarms[i]["text"],
            time_created: this.state.get_historyAlarms[i]["time_created"],
            type_id: this.state.get_historyAlarms[i]["type_id"],
          };
          Alarmdata.push(headerDict);
        }
        this.setState({ pdfDataHistory: Alarmdata });
        this.setState({
          csvReportHistory: {
            data: Alarmdata,
            headers: Alarmheaders,
            filename: "AlarmHistoryReport.csv",
          },
        });
      })
      .catch((err) => {
        if (err.response) {
          alert(err.response.data.status);
          console.log("Error Response Data:", err.response.data);
          console.log("Error Response Status:", err.response.status);
          console.log("Error Response Headers:", err.response.headers);
        }
      });
  }

  

  handleColumnHideCheck(e) {
    let updatedColHideList = [...this.state.checkedColumns];
    if (e.target.checked) {
      updatedColHideList = [...this.state.checkedColumns, e.target.value];
    } else {
      updatedColHideList.splice(this.state.checkedColumns.indexOf(e.target.value), 1);
    }
    this.setState({ checkedColumns: updatedColHideList },(()=>{
      console.log(this.state.checkedColumns, "dfsdgdged");
    }));
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

  filter_handlechange(e) {
    var fetched_alarm = this.state.hold_alarms_bf;
    var fetched_alarmh = this.state.hold_alarmsh_bf;
    var value = e.target.value;
    this.setState({ filter_by: e.target.value });
    if (!value) {
      this.setState({
        get_alarms: fetched_alarm,
        get_listOfAlarms: fetched_alarmh,
      });
      // this.fetch_active_alarms()
    }
  }

  open_filter_popup(id) {
    this.setState({ show_filter_popup: true, filter_by_key: id });
  }

  filter_alarms() {
    const { showAlarmCurrent, showColumns, checkedColumns } = this.state;
    const severityFilters = this.state.selectedSeverityFilters;
    const typeFilter = this.state.checked;
    const timestampFilter = this.state.timestamp_Filter;

    if (showAlarmCurrent) {
      var filteredData = this.state.get_alarms;
      // apply severity filters
      if (severityFilters.length) {
        filteredData = filteredData.filter((item) => {
          return severityFilters.includes(item["alarm-severity"]);
        });
      }

       // Apply hide column filter
       for (let key in showColumns) {
         if (checkedColumns.includes(key)) {
           showColumns[key] = false;
         } else {
           showColumns[key] = true;
         }
       }
       this.setState(showColumns);

      // apply type filter
      if (typeFilter.length) {
        filteredData = filteredData.filter((item) => {
          return typeFilter.includes(item["type-id"]);
        });
      }
      if (this.state.setFlag) {
        filteredData = filteredData.filter((item) => {
          const timestamp = this.convertDateFormat(
            new Date(item["alarm-reported-timestamp"])
          );
          return (
            timestamp >= new Date(timestampFilter.start) &&
            timestamp <= new Date(timestampFilter.end)
          );
        });
      }
      this.setState({ get_filtered_alarms: filteredData });
    } else {
      filteredData = this.state.get_historyAlarms;
      if (this.state.setFlag) {
        this.fetchHistoryAlarms();
      }
      // apply severity filters
      if (severityFilters.length) {
        filteredData = filteredData.filter((item) => {
          return severityFilters.includes(item["alarm-severity"]);
        });
      }

        // Apply hide column filter
        for (let key in showColumns) {
          if (checkedColumns.includes(key)) {
            showColumns[key] = false;
          } else {
            showColumns[key] = true;
          }
        }
        this.setState(showColumns);
        
      // apply type filter
      if (typeFilter.length) {
        filteredData = filteredData.filter((item) => {
          return typeFilter.includes(item["type-id"]);
        });
      }
      if (timestampFilter.start && timestampFilter.end) {
        filteredData = filteredData.filter((item) => {
          const timestamp = new Date(item["alarm-reported-timestamp"]);
          return (
            timestamp >= new Date(timestampFilter.start) &&
            timestamp <= new Date(timestampFilter.end)
          );
        });
      }
      this.setState({
        get_filtered_historyAlarms: filteredData,     
      });
    }
    this.setState({
      openFilterPopup: false,
    })
  }

  clearAllfilter() {
    const { showAlarmCurrent,showColumns } = this.state;

    this.setState({checkedColumns:[]});
    for (let key in showColumns) {
      showColumns[key] = true;
    }
    this.setState(showColumns);
    this.setState({ checked: [] });
    this.setDefaultTime();
    this.setState({ selectedSeverityFilters: [], openFilterPopup: false });
    if (showAlarmCurrent) {
      this.setState({ get_filtered_alarms: this.state.get_alarms });
    } else {
      this.setState({
        get_filtered_historyAlarms: this.state.get_historyAlarms,
      });
    }
  }

  sort(type, category) {
    var unsorted_alarm = this.state.hold_alarms;
    if (type === "unsort") {
      if (category === "active") {
        this.setState({ get_alarms: unsorted_alarm });
      } else {
        this.setState({ get_listOfAlarms: unsorted_alarm });
      }
    } else {
      if (category === "active") {
        let sorted_alarm = this.state.get_alarms.sort((a, b) => {
          if (type === "dsc") {
            return b.fault_id - a.fault_id;
          } else {
            return a.fault_id - b.fault_id;
          }
        });
        this.setState({ get_alarms: sorted_alarm });
      } else {
        let sorted_alarm = this.state.get_listOfAlarms.sort((a, b) => {
          if (type === "dsc") {
            return b.fault_id - a.fault_id;
          } else {
            return a.fault_id - b.fault_id;
          }
        });
        this.setState({ get_listOfAlarms: sorted_alarm });
      }
    }
  }

  _onSelect(selectedOption) {
    this.setState({ selectedOption: selectedOption }, () => {
      for (
        let i = 0;
        i < this.state.deviceData["device-info"].sensor.length;
        i++
      ) {
        if (this.state.deviceData["device-info"].sensor[i].state.temperature) {
          if (
            this.state.deviceData["device-info"].sensor[i].name ===
            this.state.selectedOption.value
          ) {
            if (
              this.state.deviceData["device-info"].sensor[i].state.temperature[
                "alarm-severity"
              ] === "indeterminate"
            ) {
              this.setState({ StatusValue: 125 });
            } else if (
              this.state.deviceData["device-info"].sensor[i].state.temperature[
                "alarm-severity"
              ] === "minor"
            ) {
              this.setState({ StatusValue: 375 });
            } else if (
              this.state.deviceData["device-info"].sensor[i].state.temperature[
                "alarm-severity"
              ] === "major"
            ) {
              this.setState({ StatusValue: 625 });
            } else {
              this.setState({ StatusValue: 875 });
            }
          }
        }
      }
    });
  }

  handlePageChange_current = (pageNumber_current) => {
    this.setState({ activePage_current: pageNumber_current });
  };

  handlePageChange_history = (pageNumber_history) => {
    this.setState({ activePage_history: pageNumber_history });
  };

  handleSearch(event) {
    const searchTerm = event.target.value;
    this.setState({ searchTerm });
    this.updateFilteredNotificationWithSearchTerm(searchTerm);
  }

  updateFilteredNotificationWithSearchTerm(searchTerm) {
    const {
      get_alarms,
      showAlarmCurrent,
      showAlarmHistory,
      get_historyAlarms,
    } = this.state;
    if (showAlarmCurrent) {
      if (!searchTerm) {
        this.setState({ get_filtered_alarms: get_alarms,activePage_current  :1,activePage_history:1 });
      } else {
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        const filteredAlarms = get_alarms.filter((notification) => {
          for (const key in notification) {
            if (
              typeof notification[key] === "string" &&
              notification[key].toLowerCase().includes(lowerCaseSearchTerm)
            ) {
              return true;
            }
          }
          return false;
        });
        this.setState({ get_filtered_alarms: filteredAlarms,activePage_current :1 ,activePage_history:1});
      }
    } else if (showAlarmHistory) {
      if (!searchTerm) {
        this.setState({ get_filtered_historyAlarms: get_historyAlarms ,activePage_current  : 1,activePage_history:1});
      } else {
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        const filteredAlarms = get_historyAlarms.filter((notification) => {
          for (const key in notification) {
            if (
              typeof notification[key] === "string" &&
              notification[key].toLowerCase().includes(lowerCaseSearchTerm)
            ) {
              return true;
            }
          }
          return false;
        });
        this.setState({ get_filtered_historyAlarms: filteredAlarms, activePage_current : 1 ,activePage_history:1});
      }
    }
  }

  sortTable = (column) => {
    if (this.state.showAlarmHistory === false) {
      const { sortColumn, sortDirection, get_filtered_alarms } = this.state;
      let direction = "asc";
      if (sortColumn === column && sortDirection === "asc") {
        direction = "desc";
        this.setState({ sortOrder: "desc" });
      } else {
        this.setState({ sortOrder: "asc" });
      }
      if (column === "timestamp") {
        const sortedItems = get_filtered_alarms.sort((a, b) => {
          const aValue = a["alarm-reported-timestamp"];
          const bValue = b["alarm-reported-timestamp"];

          const aDate = new Date(
            Date.parse(aValue.replace(/(\d\d)\s(\w\w\w)\s(\d{4})/, "$2 $1 $3"))
          );
          const bDate = new Date(
            Date.parse(bValue.replace(/(\d\d)\s(\w\w\w)\s(\d{4})/, "$2 $1 $3"))
          );
          const diff = aDate - bDate;
          if (direction === "asc") {
            return diff;
          } else {
            return -diff;
          }
        });
        this.setState({
          get_filtered_alarms: sortedItems,
          sortColumn: column,
          sortDirection: direction,
          selectedthSort: column,
        });
      } else {
        const sortedItems = get_filtered_alarms.sort((a, b) => {
          const aValue = a[column].toString().toLowerCase();
          const bValue = b[column].toString().toLowerCase();

          const aMatch = aValue.match(/^(\D*)(\d*(?:\.\d*)?)(.*)$/);
          const bMatch = bValue.match(/^(\D*)(\d*(?:\.\d*)?)(.*)$/);

          const aChars = aMatch[1];
          const bChars = bMatch[1];

          if (aChars < bChars) {
            return direction === "asc" ? -1 : 1;
          }
          if (aChars > bChars) {
            return direction === "asc" ? 1 : -1;
          }

          const aNum = parseFloat(aMatch[2]);
          const bNum = parseFloat(bMatch[2]);

          if (aNum < bNum) {
            return direction === "asc" ? -1 : 1;
          }
          if (aNum > bNum) {
            return direction === "asc" ? 1 : -1;
          }

          const aRemainder = aMatch[3];
          const bRemainder = bMatch[3];

          if (aRemainder < bRemainder) {
            return direction === "asc" ? -1 : 1;
          }
          if (aRemainder > bRemainder) {
            return direction === "asc" ? 1 : -1;
          }
          return 0;
        });

        this.setState({
          get_filtered_alarms: sortedItems,
          sortColumn: column,
          sortDirection: direction,
          selectedthSort: column,
        });
      }
    } else {
      const { sortColumn, sortDirection, get_filtered_historyAlarms } =
        this.state;
      let direction = "asc";
      if (sortColumn === column && sortDirection === "asc") {
        direction = "desc";
        this.setState({ sortOrder: "desc" });
      } else {
        this.setState({ sortOrder: "asc" });
      }
      if (column === "timestamp") {
        const sortedItems = get_filtered_historyAlarms.sort((a, b) => {
          const aValue = a["alarm-reported-timestamp"];
          const bValue = b["alarm-reported-timestamp"];

          const aDate = new Date(
            Date.parse(aValue.replace(/(\d\d)\s(\w\w\w)\s(\d{4})/, "$2 $1 $3"))
          );
          const bDate = new Date(
            Date.parse(bValue.replace(/(\d\d)\s(\w\w\w)\s(\d{4})/, "$2 $1 $3"))
          );
          const diff = aDate - bDate;
          if (direction === "asc") {
            return diff;
          } else {
            return -diff;
          }
        });
        this.setState({
          get_filtered_historyAlarms: sortedItems,
          sortColumn: column,
          sortDirection: direction,
          selectedthSort: column,
        });
      } else {
        const sortedItems = get_filtered_historyAlarms.sort((a, b) => {
          if (a[column] && b[column]) {
            const aValue = a[column].toString().toLowerCase();
            const bValue = b[column].toString().toLowerCase();

            const aMatch = aValue.match(/^(\D*)(\d*(?:\.\d*)?)(.*)$/);
            const bMatch = bValue.match(/^(\D*)(\d*(?:\.\d*)?)(.*)$/);

            const aChars = aMatch[1];
            const bChars = bMatch[1];

            if (aChars < bChars) {
              return direction === "asc" ? -1 : 1;
            }
            if (aChars > bChars) {
              return direction === "asc" ? 1 : -1;
            }

            const aNum = parseFloat(aMatch[2]);
            const bNum = parseFloat(bMatch[2]);

            if (aNum < bNum) {
              return direction === "asc" ? -1 : 1;
            }
            if (aNum > bNum) {
              return direction === "asc" ? 1 : -1;
            }

            const aRemainder = aMatch[3];
            const bRemainder = bMatch[3];

            if (aRemainder < bRemainder) {
              return direction === "asc" ? -1 : 1;
            }
            if (aRemainder > bRemainder) {
              return direction === "asc" ? 1 : -1;
            }

            return 0;
          }
        });

        this.setState({
          get_filtered_historyAlarms: sortedItems,
          sortColumn: column,
          sortDirection: direction,
          selectedthSort: column,
        });
      }
    }
  };

  exportPDF = (id) => {
    var currentTime = new Date().toLocaleString().replace(/:/g, "-");
    const unit = "pt";
    const size = "A4"; // Use A1, A2, A3 or A4
    const orientation = "portrait"; // portrait or landscape
    const marginLeft = 40;
    const doc = new jsPDF(orientation, unit, size);
    doc.setFontSize(15);
    const title = "Alarm Report";
    const headers = [
      [
        "Alarm Reported Timestamp",
        "Alarm Severity",
        "ID",
        "Resource",
        "Text",
        "Time Created",
        "Type ID",
      ],
    ];
    if (id !== "history") {
      var data = this.state.get_filtered_alarms.map((elt) => [
        elt.state["alarm-reported-timestamp"],
        elt.state["alarm-severity"],
        elt.id,
        elt.state.resource,
        elt.state.text,
        elt.state["time-created"],
        elt.state["type-id"],
      ]);
    } else {
      data = this.state.get_filtered_historyAlarms.map((elt) => [
        elt.alarm_reported_timestamp,
        elt.alarm_severity,
        elt.id,
        elt.resource,
        elt.text,
        elt.time_created,
        elt.type_id,
      ]);
    }

    let content = {
      startY: 50,
      head: headers,
      body: data,
    };

    doc.text(title, marginLeft, 40);
    doc.autoTable(content);
    if (id !== "history") {
      doc.save(`AlarmReport ${currentTime}.pdf`);
    } else {
      doc.save(`AlarmHistoryReport ${currentTime}.pdf`);
    }
  };

  showAlarmState(type) {
    if (type === "current") {
      this.setState({
        showAlarmCurrent: true,
        showAlarmHistory: false,
        showAlarmTransition: false,
      });
    } else if (type === "history") {
      this.setState({
        showAlarmCurrent: false,
        showAlarmHistory: true,
        showAlarmTransition: false,
      });
    } else {
      this.setState({
        showAlarmCurrent: false,
        showAlarmHistory: false,
        showAlarmTransition: true,
      });
    }
  }

  setDefaultTime() {
    const { timestamp_Filter } = this.state;
    var currentDate = new Date();
    var oneYearAgo = new Date(currentDate);
    oneYearAgo.setFullYear(currentDate.getFullYear() - 1);
    currentDate = this.convertDateFormat(currentDate);
    oneYearAgo = this.convertDateFormat(oneYearAgo);
    timestamp_Filter["start_time"] = oneYearAgo;
    timestamp_Filter["stop_time"] = currentDate;
    this.setState({ timestamp_Filter });
  }

  convertDateFormat(inputDateStr) {
    const inputDate = new Date(inputDateStr);
    return inputDate.toISOString(); // Returns date in ISO 8601 format
  }

  clearAllAlarms() {
    let deviceID = sessionStorage.getItem("unique_id");
    var temp = { "@xmlns": "http://www.ipinfusion.com/yang/ocnos/ipi-logging" };
    fetch(
      `http://${this.state.serverIP}:5000/configuration-management/rpc/logging-fms-flush-db/${deviceID}`,
      {
        method: "POST",
        mode: "cors",
        headers: {
          "Access-Control-Allow-Origin": "http://localhost:3000",
          Accept: "application/json",
          "Content-Type": "application/json",
          username: sessionStorage.getItem("username"),
          //   'Authorization': 'Bearer ' + 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTY2Njc2NzE3NSwianRpIjoiODFkOTNiMGEtNDQwMS00ZDIyLWIzYmItOGM0NmZkZDBjODJiIiwidHlwZSI6ImFjY2VzcyIsInN1YiI6ImFkbWluXzEyMyIsIm5iZiI6MTY2Njc2NzE3NSwiZXhwIjoxNjY5MzU5MTc1fQ.bPHBU62WQd-2Z4cmDkEYaL-198KTSmp6w1A49i4U3a4',
        },
        body: JSON.stringify(temp),
      }
    )
      .then((resp) => resp.json())
      .then((resp) => {
        console.log(resp, "disable-alarm-response");
        this.fetch_active_alarms();
      })
      .catch((err) => {
        if (err.response) {
          alert(err.response.data.status);
          console.log("Error Response Data:", err.response.data);
          console.log("Error Response Status:", err.response.status);
          console.log("Error Response Headers:", err.response.headers);
        }
      });
  }

  callAlarmClose(id) {
    let deviceID = sessionStorage.getItem("unique_id");
    var temp = {
      "@xmlns": "http://www.ipinfusion.com/yang/ocnos/ipi-logging",
      "active-alarm-id": id,
    };
    console.log(temp, "alarm-close");
    fetch(
      `http://${this.state.serverIP}:5000/configuration-management/rpc/logging-fms-close/${deviceID}`,
      {
        method: "POST",
        mode: "cors",
        headers: {
          "Access-Control-Allow-Origin": "http://localhost:3000",
          Accept: "application/json",
          "Content-Type": "application/json",
          username: sessionStorage.getItem("username"),
          //   'Authorization': 'Bearer ' + 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTY2Njc2NzE3NSwianRpIjoiODFkOTNiMGEtNDQwMS00ZDIyLWIzYmItOGM0NmZkZDBjODJiIiwidHlwZSI6ImFjY2VzcyIsInN1YiI6ImFkbWluXzEyMyIsIm5iZiI6MTY2Njc2NzE3NSwiZXhwIjoxNjY5MzU5MTc1fQ.bPHBU62WQd-2Z4cmDkEYaL-198KTSmp6w1A49i4U3a4',
        },
        body: JSON.stringify(temp),
      }
    )
      .then((resp) => resp.json())
      .then((resp) => {
        console.log(resp, "alarm-close-response");
        if (resp.status) {
          if (resp.status["rpc-reply"]) {
            alert("SUCCESS");
            this.fetch_active_alarms();
          } else {
            alert(resp.status.message);
          }
        }
      })
      .catch((err) => {
        if (err.response) {
          alert(err.response.data.status);
          console.log("Error Response Data:", err.response.data);
          console.log("Error Response Status:", err.response.status);
          console.log("Error Response Headers:", err.response.headers);
        }
      });
  }

  showAlarmPanelTabs(type) {
    if (type === "alarm-list") {
      this.setState({ showAlarm: true, showGraph: false, showThermal: false });
    } else if (type === "alarm-graphs") {
      this.setState({
        showAlarm: false,
        showGraph: true,
        showThermal: false,
        openFilterPopup: false,
      });
    } else if (type === "alarm-thermal") {
      this.setState({
        showAlarm: false,
        showGraph: false,
        showThermal: true,
        openFilterPopup: false,
      });
    } else if (type === "alarm-shelve") {
      this.setState({
        openFilterPopup: false,
        showShelveOptions: true,
        showReportOptions: false,
      });
    } else if (type === "alarm-filter") {
      if (this.state.openFilterPopup) {
        this.setState({ openFilterPopup: false });
      } else {
        this.setState({ openFilterPopup: true });
      }
      this.setState({ showShelveOptions: false, showReportOptions: false });
    } else if (type === "alarm-report") {
      this.setState({
        openFilterPopup: false,
        showShelveOptions: false,
        showReportOptions: true,
      });
    }
  }

  toggleDropdown = () => {
    this.setState((prevState) => ({
      isOpen: !prevState.isOpen,
    }));
  };

  toggleDropdownShelve = () => {
    this.setState((prevState) => ({
      isOpenShelve: !prevState.isOpenShelve,
    }));
  };

  handleDocumentClick = (event) => {
    if (this.dropdownRef && !this.dropdownRef.contains(event.target)) {
      this.setState({
        isOpen: false,
      });
    }
    if (this.dropdownRef1 && !this.dropdownRef1.contains(event.target)) {
      this.setState({
        isOpenShelve: false,
      });
    }
  };

  componentWillUnmount() {
    document.removeEventListener("click", this.handleDocumentClick);
    window.removeEventListener("resize", this.updateDimensions);
  }
  
  toggleDarkMode = () => {
    console.log("innetw");
    this.setState((prevState) => ({ isDarkMode: !prevState.isDarkMode }));
  };

  updateDimensions(){
    let width, height;

    if(window.innerWidth === 1024){
      width = 185;
      height = 165;
    }
    else if(window.innerWidth === 768){
      width = 280;
      height = 200;
    }
    else if(window.innerWidth === 1440){
      width = 270;
      height = 189;
    }
    else if(window.innerWidth === 1366){
      width = 240;
      height = 189;
    }
    else if(window.innerWidth === 1920){
      width = 340;
      height = 295;
    }
    this.setState({ width, height });

  }

  async fetchFaultstats() {
    const { uniqueId,is_fetching,enable_fault } = this.state;
    this.setState({is_fetching:true})
    try {
        const response = await fetch(
            `http://${this.state.serverIP}:5000/configuration-management/configuration/logging/${uniqueId}`,
            {
                mode: "cors",
                method: "GET",
                headers: {
                    "Access-Control-Allow-Origin": "http://localhost:3000",
                    'username': sessionStorage.getItem('username'),
                    'Authorization': 'Bearer ' + JSON.parse(sessionStorage.getItem('login_data')).data.access_token
                },
                
            }
        );
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        this.setState({ fault_stats: data });
        console.log("yess", data);
       
    } catch (err) {
        alert(err.message);
        console.error('Error:', err);
    }
    this.setState({ is_fetching: false,disableFaultstats:false });
  }

  async  disableFaultManagement() {
    const { uniqueId ,fault_stats ,fault_enabled} = this.state;
    this.setState({is_fetching:true})
    const url = `http://${this.state.serverIP}:5000/configuration-management/configuration/logging/${uniqueId}`;

    if(fault_enabled){
      var temp={
        'ipi-logging:logging':{
          "@xmlns:ipi-logging":"http://www.ipinfusion.com/yang/ocnos/ipi-logging",
          "fault-management":{
            "@nc:operation":"delete"
          }
      }}
    }

    else{
       temp = {
        "ipi-logging:logging": {
          "@xmlns:ipi-logging":"http://www.ipinfusion.com/yang/ocnos/ipi-logging",
          "fault-management": {
              "config": {
                  "enable-fault-management": [
                      null
                  ]
              }
      }
    }
  }
}
    if (!fault_stats) {
        console.error("Fault stats object is not available.");
        return;
    }
    // if (!fault_stats['ipi-logging:logging'] || !fault_stats['ipi-logging:logging']['fault-management'] || !fault_stats['ipi-logging:logging']['fault-management']['config']) {
    //     console.error("The necessary structure does not exist in the fault stats object.");
    //     return;
    // }
    
    const requestOptions = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': 'http://localhost:3000',
            'username': sessionStorage.getItem('username'),
            'Authorization': 'Bearer ' + JSON.parse(sessionStorage.getItem('login_data')).data.access_token
        },
        body: JSON.stringify(temp)
    };

    try {
        console.log('Request Body:', temp);
        const response = await fetch(url, requestOptions);
        this.fetchFaultstats();
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const responseData = await response.json();
    } catch (error) {
        console.error('Error sending modified data:', error);    
    }
    this.setState({is_fetching:false,disableFaultstats:false})
  
 }

  render() {
    const { isDarkMode,windowWidth ,fault_stats} = this.state;

    const lightTheme = createTheme({
      palette: {
        background: {
          default: "white",
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
      isOpenShelve,
      isOpen,
      searchTerm,
      searchCount,
      currentIndex,
      showColumns,
      checkedColumns, width, height
    } = this.state;
    const currentResultIndex = currentIndex > 0 ? currentIndex : searchCount;
    const {
      activePage_current,
      activePage_history,
      itemsPerPage_current,
      itemsPerPage_history,
      get_filtered_alarms,
      get_filtered_historyAlarms,
      get_filteredTransitionAlarms,
    } = this.state;
    const indexOfLastItem_current = activePage_current * itemsPerPage_current;
    const indexOfFirstItem_current =
      indexOfLastItem_current - itemsPerPage_current;
    const indexOfLastItem_history = activePage_history * itemsPerPage_history;
    const indexOfFirstItem_history =
      indexOfLastItem_history - itemsPerPage_history;
    const currentItems = get_filtered_alarms.slice(
      indexOfFirstItem_current,
      indexOfLastItem_current
    );
    const currentHistoryItems = get_filtered_historyAlarms.slice(
      indexOfFirstItem_history,
      indexOfLastItem_history
    );
    const currentAlarmTransition = get_filteredTransitionAlarms.slice(
      indexOfFirstItem_history,
      indexOfLastItem_history
    );

    var shelveType = [];

    if (get_filtered_alarms.length > 0) {
      for (let i = 0; i < get_filtered_alarms.length; i++) {
        var type = get_filtered_alarms[i]["id"].split("::")[0];
        if (!shelveType.includes(type)) {
          shelveType.push(type);
        }
      }
    }

    var enabledFsm=fault_stats &&
    fault_stats['ipi-logging:logging'] && 
    fault_stats['ipi-logging:logging']['fault-management'] && 
    fault_stats['ipi-logging:logging']['fault-management']["config"]["enable-fault-management"] &&
    JSON.stringify(fault_stats['ipi-logging:logging']['fault-management']["config"]["enable-fault-management"])==="[null]"?true:false

    return (
       <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
       <div style={{height:"100vh",overflow:"hidden"}}  className={isDarkMode ? 'dark-mode' : 'light-mode'}>
           <div style={{ backgroundColor: isDarkMode ? darkTheme.palette.background.default : lightTheme.palette.background.default }}>
           <div style={{display:'flex'}}>
           <NewLeftpanel page='alarm' darkMode={this.state.isDarkMode}/>
           <div style={{flex:'4',marginLeft:"18%"}}>
               <div  style={{backgroundColor: isDarkMode ? darkTheme.palette.background.default : lightTheme.palette.background.default}}>
                   <NewHeader header_name='Alarm Panel' path='Alarm' darkMode={this.state.isDarkMode} toggleDarkMode={this.toggleDarkMode}/>
               </div>
               
                   <div className='mainContent' style={{height:"90vh"}}>
                   {this.state.is_fetching === true ? <Loading /> : null}
                  <div className="buttonDiv">
                    <section
                      // className="fault_header"
                      style={
                        this.state.showAlarm
                          ? {
                              display: "flex",
                              flexWrap: "wrap",
                              gap:"10px",
                              paddingTop: "2px",
                              position: "fixed",
                              height: "40px",
                              width: "110vw",
                              background: isDarkMode
                                ? darkTheme.palette.background.default
                                : "white",
                                // marginLeft:`${windowWidth<1440 ?'5.5%':'0'}`
                            }
                          : { display: "flex" }
                      }
                    >
                      <div
                        className="tabbox"
                        style={
                          this.state.showAlarm
                            ? { color: "#004f68", fontWeight: "bold" }
                            : null
                        }
                        onClick={() => this.showAlarmPanelTabs("alarm-list")}
                      >
                        <img
                          alt=""
                          className="tabicon"
                          src={require("../Images/alarmList.png")}
                        ></img>
                        Alarm List
                      </div>
                      <div
                        className="tabbox"
                        style={
                          this.state.showGraph
                            ? { color: "#004f68", fontWeight: "bold" }
                            : null
                        }
                        onClick={() => this.showAlarmPanelTabs("alarm-graphs")}
                      >
                        <img
                          alt=""
                          className="tabicon"
                          src={require("../Images/Graphs.png")}
                        ></img>
                        Graphs
                      </div>
                      <div
                        className="tabbox"
                        style={
                          this.state.showThermal
                            ? { color: "#004f68", fontWeight: "bold" }
                            : null
                        }
                        onClick={() => this.showAlarmPanelTabs("alarm-thermal")}
                      >
                        <img
                          alt=""
                          className="tabicon"
                          src={require("../Images/ThermalAlarm.png")}
                        ></img>
                        Thermal Alarm
                      </div>
                      {this.state.showAlarm ? (
                        <div
                          className="tabbox"
                          style={
                            this.state.showThermal
                              ? { color: "#004f68", fontWeight: "bold" }
                              : null
                          }
                          onClick={(e) =>
                            this.setState({ showClearAllAlarmsPopup: true })
                          }
                        >
                          <img
                            alt=""
                            className="tabicon"
                            src={require("../Images/broom.png")}
                          ></img>
                          Clear All Alarms
                        </div>
                      ) : null}
                      {this.state.showAlarm ? (
                        <div style={{display:"flex"}}>
                          <div
                            className="tabbox"
                            onClick={this.toggleDropdownShelve}
                            ref={(ref) => (this.dropdownRef1 = ref)}
                            style={
                              this.state.showReport
                                ? { color: "#004f68", fontWeight: "bold" }
                                : null
                            }
                          >
                            <img
                              alt=""
                              className="tabicon"
                              src={require("../Images/stop.png")}
                            ></img>
                            Shelve
                            {isOpenShelve ? (
                              shelveType.length > 0 ? (
                                <div
                                  className="downloadOptions"
                                  style={{ marginTop: "11.5%" }}
                                >
                                  {shelveType.map((item) => (
                                    <div className="optionsBox">
                                      <img alt="" className="tabicon"></img>
                                      {item}
                                    </div>
                                  ))}
                                </div>
                              ) : null
                            ) : null}
                          </div>
                          <div
                            className="tabbox"
                            style={
                              this.state.showFilter
                                ? { color: "#004f68", fontWeight: "bold" }
                                : null
                            }
                            onClick={() =>
                              this.showAlarmPanelTabs("alarm-filter")
                            }
                          >
                            <img
                              alt=""
                              className="tabicon"
                              src={require("../Images/filter.png")}
                            ></img>
                            Filter
                          </div>
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
                            {isOpen ? (
                              <div
                                className="downloadOptions"
                                style={{ marginTop: "10.5%",marginLeft:"4%" }}
                              >
                                <div
                                  className="optionsBox"
                                  onClick={(e) => {
                                    this.exportPDF();
                                  }}
                                >
                                  <img
                                    alt=""
                                    className="tabicon"
                                    src={require("../Images/pdf.png")}
                                  ></img>
                                  Alarm List PDF
                                </div>
                                <div
                                  className="optionsBox"
                                  onClick={(e) => {
                                    this.exportPDF("history");
                                  }}
                                >
                                  <img
                                    alt=""
                                    className="tabicon"
                                    src={require("../Images/pdfRed.png")}
                                  ></img>
                                  History Alarm List PDF
                                </div>
                                <div className="optionsBox">
                                  {this.state.csvReport ? (
                                    <CSVLink {...this.state.csvReport}>
                                      <div
                                        className="optionsBox"
                                        style={{
                                          color: "black",
                                          textTransform: null,
                                          marginTop: "0",
                                        }}
                                      >
                                        <img
                                          alt=""
                                          className="tabicon"
                                          src={require("../Images/csv.png")}
                                        ></img>
                                        Alarm List CSV
                                      </div>
                                    </CSVLink>
                                  ) : (
                                    <div
                                      className="optionsBox"
                                      style={{
                                        color: "black",
                                        textTransform: null,
                                        marginTop: "0",
                                      }}
                                    >
                                      <img
                                        alt=""
                                        className="tabicon"
                                        src={require("../Images/csv.png")}
                                      ></img>
                                      Alarm List CSV
                                    </div>
                                  )}
                                </div>
                                <div className="optionsBox">
                                  {this.state.csvReportHistory ? (
                                    <CSVLink {...this.state.csvReportHistory}>
                                      <div
                                        className="optionsBox"
                                        style={{
                                          color: "black",
                                          textTransform: null,
                                          marginTop: "0",
                                        }}
                                      >
                                        <img
                                          alt=""
                                          className="tabicon"
                                          src={require("../Images/csvRed.png")}
                                        ></img>
                                        History Alarm List CSV
                                      </div>
                                    </CSVLink>
                                  ) : (
                                    <div
                                      className="optionsBox"
                                      style={{
                                        color: "black",
                                        textTransform: null,
                                        marginTop: "0",
                                      }}
                                    >
                                      <img
                                        alt=""
                                        className="tabicon"
                                        src={require("../Images/csvRed.png")}
                                      ></img>
                                      History Alarm List CSV
                                    </div>
                                  )}
                                </div>
                              </div>
                            ) : null}
                          </div>
                          <div>
                            <div style={{ marginRight: "0px" }}>
                              <div
                               className="search-tabbox"
                              >
                                <img
                                  alt=""
                                  className="tabicon"
                                  src={require("../Images/search.png")}
                                  
                                ></img>
                                <input
                                  placeholder="Search"
                                  style={{
                                    border:"none"
                                  }}
                                  value={searchTerm}
                                  onChange={this.handleSearch.bind(this)}
                                />
                              </div>
                              {searchCount > 0 && (
                                <div
                                  style={{
                                    display: "flex",
                                    position: "fixed",
                                    right: "2%",
                                    bottom: "66%",
                                  }}
                                >
                                  <p>
                                    {currentResultIndex}/{searchCount}
                                  </p>
                                  <div>
                                    <button
                                      onClick={this.goToNextResult.bind(this)}
                                      className="searchNext"
                                    >
                                      <img
                                        alt=""
                                        src={require("../Images/down-arrow.png")}
                                        width="15"
                                      ></img>
                                    </button>
                                    <button
                                      className="searchNext"
                                      onClick={this.goToPreviousResult.bind(
                                        this
                                      )}
                                    >
                                      <img
                                        alt=""
                                        src={require("../Images/up-arrow.png")}
                                        width="15"
                                      ></img>
                                    </button>
                                    <button
                                      onClick={this.resetSearch.bind(this)}
                                      className="searchNext"
                                    >
                                      <img
                                        alt=""
                                        src={require("../Images/close.png")}
                                        width="12"
                                      ></img>
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ) : null}
                    </section>
                    {this.state.showClearAllAlarmsPopup ? (
                      <div
                        className="popup_show_delete"
                        style={{ opacity: "2" }}
                      >
                        <div className="delete_network_element_popup">
                          <div className="module_head">
                            Do you want to clear all alarms?
                          </div>
                          <div className="delete_buttons">
                            <button
                              onClick={() => {
                                this.clearAllAlarms();
                                this.setState({
                                  showClearAllAlarmsPopup: false,
                                });
                              }}
                              className="delete_yes"
                            >
                              OK
                            </button>
                            <button
                              onClick={() =>
                                this.setState({
                                  showClearAllAlarmsPopup: false,
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

                    
                  </div>
                  {this.state.openFilterPopup ? (
                    <div
                      className="filterpopup"
                      style={{ boxShadow: "none", paddingTop: "3%" }}
                    >
                      <div style={{ display: "flex", paddingTop: "4px" }}>
                        <div
                          style={{
                            color: "rgb(0,79,104)",
                            fontWeight: "bold",
                            marginLeft: "1%",
                          }}
                        >
                          Filter By:
                        </div>
                        <img
                          src={close}
                          alt="5%"
                          width="1%"
                          height="1%"
                          style={{
                            marginLeft: "90.5%",
                            marginTop: "1%",
                            cursor: "pointer",
                          }}
                          onClick={(e) =>
                            this.setState({ openFilterPopup: false })
                          }
                        />
                      </div>
                      <div style={{ display: "flex" }}>
                        <div>
                          <div
                            className="filterpopupHeader"
                            style={{ marginLeft: "2%" }}
                          >
                            Severity
                          </div>
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              marginTop: "3%",
                            }}
                          >
                            <div
                              className="severitybutton"
                              style={
                                this.state.selectedSeverityFilters.includes(
                                  "CRITICAL"
                                )
                                  ? this.state.selectedSeverityFilter
                                  : null
                              }
                              onClick={(e) => {
                                const filters = [
                                  ...this.state.selectedSeverityFilters,
                                ];
                                const index = filters.indexOf("CRITICAL");
                                if (index !== -1) {
                                  filters.splice(index, 1);
                                } else {
                                  filters.push("CRITICAL");
                                }
                                this.setState({
                                  selectedSeverityFilters: filters,
                                });
                              }}
                            >
                              CRITICAL
                            </div>
                            <div
                              className="severitybutton"
                              style={
                                this.state.selectedSeverityFilters.includes(
                                  "MAJOR"
                                )
                                  ? this.state.selectedSeverityFilter
                                  : null
                              }
                              onClick={(e) => {
                                const filters = [
                                  ...this.state.selectedSeverityFilters,
                                ];
                                const index = filters.indexOf("MAJOR");
                                if (index !== -1) {
                                  filters.splice(index, 1);
                                } else {
                                  filters.push("MAJOR");
                                }
                                this.setState({
                                  selectedSeverityFilters: filters,
                                });
                              }}
                            >
                              MAJOR
                            </div>
                            <div
                              className="severitybutton"
                              style={
                                this.state.selectedSeverityFilters.includes(
                                  "MINOR"
                                )
                                  ? this.state.selectedSeverityFilter
                                  : null
                              }
                              onClick={(e) => {
                                const filters = [
                                  ...this.state.selectedSeverityFilters,
                                ];
                                const index = filters.indexOf("MINOR");
                                if (index !== -1) {
                                  filters.splice(index, 1);
                                } else {
                                  filters.push("MINOR");
                                }
                                this.setState({
                                  selectedSeverityFilters: filters,
                                });
                              }}
                            >
                              MINOR
                            </div>
                            <div
                              className="severitybutton"
                              style={
                                this.state.selectedSeverityFilters.includes(
                                  "WARNING"
                                )
                                  ? this.state.selectedSeverityFilter
                                  : null
                              }
                              onClick={(e) => {
                                const filters = [
                                  ...this.state.selectedSeverityFilters,
                                ];
                                const index = filters.indexOf("WARNING");
                                if (index !== -1) {
                                  filters.splice(index, 1);
                                } else {
                                  filters.push("WARNING");
                                }
                                this.setState({
                                  selectedSeverityFilters: filters,
                                });
                              }}
                            >
                              WARNING
                            </div>
                            <div
                              className="severitybutton"
                              style={
                                this.state.selectedSeverityFilters.includes(
                                  "UNKNOWN"
                                )
                                  ? this.state.selectedSeverityFilter
                                  : null
                              }
                              onClick={(e) => {
                                const filters = [
                                  ...this.state.selectedSeverityFilters,
                                ];
                                const index = filters.indexOf("UNKNOWN");
                                if (index !== -1) {
                                  filters.splice(index, 1);
                                } else {
                                  filters.push("UNKNOWN");
                                }
                                this.setState({
                                  selectedSeverityFilters: filters,
                                });
                              }}
                            >
                              UNKNOWN
                            </div>
                          </div>
                        </div>
                        <div
                          className="vertiline"
                          style={{ marginRight: "1%", marginLeft: "1%" }}
                        ></div>
                        <div
                          className="checkbox-scroll-box"
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            margin: "7px -10px 0px 5px",
                          }}
                        >
                          <div
                            className="filterpopupHeader"
                            style={{ marginLeft: "4%" }}
                          >
                            Hide Column
                          </div>
                          {Object.keys(showColumns).map((columnName) => (
                            <label
                              key={columnName}
                              style={{
                                margin: "5px 10px 0px 5px",
                                fontSize: "14px",
                              }}
                            >
                              <input
                                style={{ height: "11px", marginRight: "4px" }}
                                type="checkbox"
                                value={columnName}
                                checked={checkedColumns.includes(columnName)}
                                onChange={(e) => this.handleColumnHideCheck(e)}
                              />
                              {columnName}
                            </label>
                          ))}
                        </div>
                        <div
                          className="vertiline"
                          style={{ marginRight: "1%", marginLeft: "1%" }}
                        ></div>
                        <div>
                          <div
                            className="filterpopupHeader"
                            style={{ marginLeft: "18%" }}
                          >
                            TypeID
                          </div>
                          <div>
                            <div
                              className="list-container"
                              style={{ display: "flex", flexWrap: "wrap" }}
                            >
                              {this.state.typeIDavailable.map((item, index) => (
                                <div key={index} style={{ width: "50%" }}>
                                  <input
                                    style={{ marginLeft: "0%", height: "10px" }}
                                    value={item}
                                    checked={this.state.checked.includes(item)}
                                    type="checkbox"
                                    onChange={(e) => this.handleCheck(e)}
                                  />
                                  <span
                                    style={{
                                      fontSize: "smaller",
                                      marginLeft: "5%",
                                    }}
                                  >
                                    {item}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div
                          className="vertiline"
                          style={{ marginRight: "1%", marginLeft: "1%" }}
                        ></div>
                        <div style={{ marginLeft: "-3%" }}>
                          <div
                            className="filterpopupHeader"
                            style={{ marginLeft: "6%" }}
                          >
                            Timestamp
                          </div>
                          <div style={{ display: "flex", marginLeft: "6%" }}>
                            <div>
                              <div style={{ fontSize: "small" }}>
                                Select Begin Time:
                              </div>
                              <form onSubmit={this.onFormSubmit}>
                                <div className="form-group">
                                  <DatePicker
                                    selected={
                                      new Date(
                                        this.state.timestamp_Filter.start_time
                                      )
                                    }
                                    onChange={(e) => {
                                      const a = {
                                        ...this.state.timestamp_Filter,
                                      };
                                      const d = new Date(e);
                                      a.start_time = this.convertDateFormat(d);
                                      console.log(a, "dddddddddddddddd");
                                      this.setState({
                                        timestamp_Filter: a,
                                        setFlag: true,
                                      });
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
                            <div style={{ marginLeft: "2%" }}>
                              <div style={{ fontSize: "small" }}>
                                Select End Time:
                              </div>
                              <form onSubmit={this.onFormSubmit}>
                                <div className="form-group">
                                  <DatePicker
                                    style={{ borderBottom: "0px" }}
                                    selected={
                                      new Date(
                                        this.state.timestamp_Filter.stop_time
                                      )
                                    }
                                    onChange={(e) => {
                                      const a = {
                                        ...this.state.timestamp_Filter,
                                      };
                                      const d = new Date(e);
                                      a.stop_time = this.convertDateFormat(d);
                                      console.log(a, "dddddddddddddddd");
                                      this.setState({
                                        timestamp_Filter: a,
                                        setFlag: true,
                                      });
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
                            <div
                              className="applyResetBox"
                              style={{ marginRight: "60px" }}
                            >
                              <div
                                className="btn btn-primary mb3"
                                style={{marginRight:"5px"}}
                                onClick={(e) => {
                                  this.filter_alarms();
                                }}
                              >
                                Apply
                              </div>
                              <div
                                className="btn btn-primary mb3"
                                style={{
                                  background: "rgba(123, 124, 131, 0.87)",
                                  borderColor: "#7b7c83de",
                                }}
                                onClick={(e) => {
                                  this.clearAllfilter();
                                }}
                              >
                                Reset
                              </div>
                              
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : null}
                  {this.state.showAlarm ? (
                    <div  className="alarm_mainContent"style={{ paddingTop: "2.5%" }}>
                      <div className="tableTabs">
                        <div
                          className="subsechead"
                          style={
                            this.state.showAlarmCurrent
                              ? {
                                  fontWeight: "bolder",
                                  backgroundColor: "#e5e8ff",
                                }
                              : null
                          }
                          onClick={(e) => this.showAlarmState("current")}
                        >
                          Current
                          <img  alt="" width={20}

                            onClick={(e) =>
                              this.setState({ disableFaultstats: true ,fault_enabled:enabledFsm})
                            }
                            src={
                              enabledFsm?
                              enabled:disabled
                            }
                           />
                        </div>
                        <div
                          className="subsechead"
                          style={
                            this.state.showAlarmHistory
                              ? {
                                  fontWeight: "bolder",
                                  backgroundColor: "#e5e8ff",
                                }
                              : null
                          }
                          onClick={(e) => this.showAlarmState("history")}
                        >
                          History
                        </div>
                       
                      </div>

                      {this.state.showAlarmCurrent ? (
                        this.state.get_filtered_alarms ? (
                          <div className="fault_table_scroll">
                            <table className="user_table">
                              <thead className="user_table_head">
                                <tr
                                  style={{
                                    backgroundColor: "#e5e8ff",
                                    color: "black",
                                    position: "sticky",
                                  }}
                                >
                                  <th>S No</th>
                                  {Object.keys(showColumns).map(
                                    (columnName) =>
                                      showColumns[columnName] && (
                                        <th
                                          key={columnName}
                                          onClick={() =>
                                            this.sortTable(columnName)
                                          }
                                          style={
                                            this.state.selectedthSort &&
                                            this.state.selectedthSort ===
                                              columnName
                                              ? this.state.fixthHead
                                              : {
                                                  cursor: "pointer",
                                                  position: "static",
                                                }
                                          }
                                        >
                                          {columnName}
                                          <img
                                            alt=""
                                            style={{
                                              marginLeft: "8px",
                                              marginTop: "3px",
                                            }}
                                            src={
                                              this.state.selectedthSort ===
                                                columnName &&
                                              this.state.sortOrder === "asc"
                                                ? sortUp
                                                : sortDown
                                            }
                                            width={10}
                                          />
                                        </th>
                                      )
                                  )}
                                  <th></th>
                                </tr>
                              </thead>
                              {currentItems.map((item, index) => (
                                <tbody key={index}>
                                  <tr>
                                    <td>{++index}</td>
                                    {Object.keys(showColumns).map(
                                      (columnName) =>
                                        showColumns[columnName] && (
                                          <td
                                            key={columnName}
                                            className={
                                              columnName === "alarm-severity"
                                                ? "severity_color"
                                                : ""
                                            }
                                            style={{
                                              color:
                                                columnName !== "alarm-severity"
                                                  ? "black"
                                                  : item["alarm-severity"] ===
                                                    "CRITICAL"
                                                  ? "red"
                                                  : item["alarm-severity"] ===
                                                    "MINOR"
                                                  ? "#7D8D0F"
                                                  : item["alarm-severity"] ===
                                                    "MAJOR"
                                                  ? "orange"
                                                  : "lightblue",
                                              fontWeight:
                                                columnName !== "alarm-severity"
                                                  ? ""
                                                  : "500",
                                              textAlign: "center",
                                            }}
                                          >
                                            {item[columnName]}
                                          </td>
                                        )
                                    )}
                                    <Tooltip title="clear">
                                      <td
                                        onClick={() =>
                                          this.callAlarmClose(item["id"])
                                        }
                                      >
                                        <img alt="" width={10} src={closeS} onClick="addtotransition()" />
                                      </td>
                                    </Tooltip>
                                  </tr>
                                </tbody>
                              ))}
                            </table>
                            <Pagination
                              activePage={activePage_current}
                              itemsCountPerPage={itemsPerPage_current}
                              totalItemsCount={get_filtered_alarms.length}
                              pageRangeDisplayed={5}
                              onChange={this.handlePageChange_current}
                              itemClass="page-item"
                              linkClass="page-link"
                              hideDisabled
                              firstPageText="First"
                              lastPageText="Last"
                              pre
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
                        ) : null
                      ) : null}
                      {this.state.showAlarmHistory ? (
                        <div
                        className="fault_table_scroll" 
                        >
                          <table className="user_table">
                            <thead className="user_table_head">
                              <tr
                                style={{
                                  backgroundColor: "#e5e8ff",
                                  color: "black",
                                }}
                              >
                                <th>S No</th>
                                {Object.keys(showColumns).map(
                                  (columnName) =>
                                    showColumns[columnName] && (
                                      <th
                                        key={columnName}
                                        onClick={() =>
                                          this.sortTable(columnName)
                                        }
                                        style={
                                          this.state.selectedthSort &&
                                          this.state.selectedthSort ===
                                            columnName
                                            ? this.state.fixthHead
                                            : {
                                                cursor: "pointer",
                                                position: "static",
                                              }
                                        }
                                      >
                                        {columnName}
                                        <img
                                          alt=""
                                          style={{
                                            marginLeft: "8px",
                                            marginTop: "3px",
                                          }}
                                          src={
                                            this.state.selectedthSort ===
                                              columnName &&
                                            this.state.sortOrder === "asc"
                                              ? sortUp
                                              : sortDown
                                          }
                                          width={10}
                                        />
                                      </th>
                                    )
                                )}
                              </tr>
                            </thead>
                            {currentHistoryItems.map((item, index) => (
                              <tbody key={index}>
                                <tr>
                                  <td>{++index}</td>
                                  {Object.keys(showColumns).map(
                                    (columnName) =>
                                      showColumns[columnName] && (
                                        <td
                                          key={columnName}
                                          className={
                                            columnName === "alarm-severity"
                                              ? "severity_color"
                                              : ""
                                          }
                                          style={{
                                            color:
                                              columnName !== "alarm-severity"
                                                ? "black"
                                                : item["alarm-severity"] ===
                                                  "CRITICAL"
                                                ? "red"
                                                : item["alarm-severity"] ===
                                                  "MINOR"
                                                ? "#7D8D0F"
                                                : item["alarm-severity"] ===
                                                  "MAJOR"
                                                ? "orange"
                                                : "lightblue",
                                            fontWeight:
                                              columnName !== "alarm-severity"
                                                ? ""
                                                : "500",
                                            textAlign: "center",
                                          }}
                                        >
                                          {item[columnName]}
                                        </td>
                                      )
                                  )}
                                </tr>
                              </tbody>
                            ))}
                          </table>
                          <Pagination
                            activePage={activePage_history}
                            itemsCountPerPage={itemsPerPage_history}
                            totalItemsCount={get_filtered_historyAlarms.length}
                            pageRangeDisplayed={5}
                            onChange={this.handlePageChange_history}
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
                      ) : null}
                      {this.state.showAlarmTransition ? (
                        <div className="fault_table_scroll">
                          <table className="user_table">
                            <thead className="user_table_head">
                              <tr
                                style={{
                                  backgroundColor: "#e5e8ff",
                                  color: "black",
                                }}
                              >
                                <th>S No</th>
                                <th>Alarm ID</th>
                                <th>Current Severity</th>
                                <th>Last Severity</th>
                                <th>Timestamp</th>
                                <th>Transition</th>
                              </tr>
                            </thead>
                            {currentAlarmTransition.map((item, index) =>
                              Object.keys(item).map((key) => (
                                <tbody key={index}>
                                  <tr>
                                    <td>{++index}</td>
                                    <td>{key}</td>
                                    <td>
                                      {item[key]["alarm_current_severity"]}
                                    </td>
                                    <td>{item[key]["alarm_last_severity"]}</td>
                                    <td>
                                      {item[key]["alarm_reported_timestamp"]}
                                    </td>
                                    <td>{item[key]["transition"]}</td>
                                  </tr>
                                </tbody>
                              ))
                            )}
                          </table>
                          <Pagination
                            activePage={activePage_history}
                            itemsCountPerPage={itemsPerPage_history}
                            totalItemsCount={
                              get_filteredTransitionAlarms.length
                            }
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
                      ) : null}
                    </div>
                  ) : null}
                  {this.state.showGraph ? (
                    <div style={{height:"85vh",overflow:"auto"}}>
                      <div className=" main_cardAlarm"style={{ display: "flex"}}>
                        <div className="cardAlarm" >
                          <div 
                            style={{
                              marginTop: "10px",
                              fontWeight: "medium",
                              color: "#004f68",
                              textAlign: "center",
                              fontSize: "small",
                              marginBottom: "14px",
                            }}
                          >
                            Equipment Status
                          </div>
                          <div style={{ display: "flex" }}>
                            <EquipPie data={this.state.equipStatus} />
                            <div className="failed_equip">
                              <div className="failed_list" 
                                style={{marginTop: "10px" }}
                              >{`List of Failed Equipment (${this.state.equipStatus[0].length})`}</div>
                              <div
                                style={{
                                  maxHeight: "33%",
                                  overflowY: "scroll",
                                  marginTop: "10px",
                                }}
                              >
                                {this.state.equipStatus[0].map(
                                  (item, index) => (
                                    <div
                                      key={index}
                                      style={{ fontSize: "xx-small" }}
                                    >
                                      -{item}
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="cardAlarm">
                          <div
                            style={{
                              marginTop: "10px",
                              fontWeight: "medium",
                              color: "#004f68",
                              textAlign: "center",
                              fontSize: "small",
                              marginBottom: "15px",
                            }}
                          >
                            Thermal Status
                          </div>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                              flexDirection: "column",
                            }}
                          >
                            <ReactSpeedometer
                              height={height}
                              width={width}
                              needleHeightRatio={0.7}
                              value={parseInt(this.state.StatusValue)}
                              customSegmentStops={[0, 250, 500, 750, 1000]}
                              segmentColors={[
                                "#84e0fd",
                                "yellow",
                                "orange",
                                "red",
                              ]}
                              currentValueText={` `}
                              labelFontSize="5px"
                              fontSize="5px"
                              valueTextFontWeight="lighter"
                              valueTextFontSize="12px"
                              customSegmentLabels={[
                                {
                                  text: "Indeterminate",
                                  position: "OUTSIDE",
                                  color: "black",
                                  fontSize: "10px",
                                },
                                {
                                  text: "Minor",
                                  position: "OUTSIDE",
                                  color: "black",
                                  fontSize: "10px",
                                },
                                {
                                  text: "Major",
                                  position: "OUTSIDE",
                                  color: "black",
                                  fontSize: "10px",
                                },
                                {
                                  text: "Critical",
                                  position: "OUTSIDE",
                                  color: "black",
                                  fontSize: "10px",
                                },
                              ]}
                              ringWidth={40}
                              needleTransitionDuration={3333}
                              needleTransition="easeElastic"
                              needleColor={"#a7ff83"}
                              textColor={"black"}
                            />
                            {this.state.options ? (
                              <div
                              className="thermal_speedmeter"
                                style={{
                                  width: "92%",
                                  fontSize: "10px",
                                }}
                              >
                                <Dropdown
                                  options={this.state.options}
                                  onChange={this._onSelect}
                                  value={this.state.selectedOption}
                                  placeholder="Select an option"
                                />
                              </div>
                            ) : null}
                          </div>
                        </div>

                        <div className="cardAlarm">
                          <div
                            style={{
                              marginTop: "10px",
                              fontWeight: "medium",
                              color: "#004f68",
                              textAlign: "center",
                              fontSize: "small",
                              marginBottom: "14px",
                            }}
                          >
                            Alarm Status
                          </div>
                          {this.state.get_alarms ? (
                            <AlarmPie data={this.state.get_alarms} />
                          ) : null}
                        </div>
                      </div>
                      <div className="wideCard">
                        {this.state.get_alarms ? (
                          <AlarmMonth data={this.state.get_alarms} />
                        ) : null}
                      </div>
                    </div>
                  ) : null}
                  {this.state.showThermal ? (
                    <div className="ThermalCard">
                      {this.state.tempData ? (
                        <ThermalGuage data={this.state.tempData} />
                      ) : null}
                    </div>
                  ) : null}

                  {this.state.disableFaultstats ? (
                      <div
                        className="popup_show_delete"
                        style={{ opacity: "2" }}
                      >
                        <div className="delete_network_element_popup">
                          
                          <div className="module_head">
                           {enabledFsm ? "Do you want to disable fault management" : "Do you want to enable fault management"}
                          </div>
                          <div className="delete_buttons">
                            <button
                              onClick={() => {
                                this.disableFaultManagement();
                              }}
                              className="delete_yes"
                            >
                              Yes
                            </button>
                            <button
                              onClick={() =>
                                this.setState({
                                  disableFaultstats: false,
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
           </div>
           </div>
           </div>
       </div>
       </div>
  
   </ThemeProvider>
  )}
}
export default FaultPanel;
