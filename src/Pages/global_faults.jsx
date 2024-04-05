import React from "react";
import NewHeader from "../Components/header";
import DatePicker from "react-datepicker";
import close from "../Images/closeS.png";
import sortDown from "../Images/dropDown.png";
import sortUp from "../Images/arrow-up.png";
import Pagination from "react-js-pagination";
import { PageItem as BootstrapPageItem } from "react-bootstrap";
import { CSVLink } from "react-csv";
import jsPDF from "jspdf";
import "jspdf-autotable";
import Tooltip from "@mui/material/Tooltip";
import "react-datepicker/dist/react-datepicker.css";
import "bootstrap/dist/css/bootstrap.min.css";
import Loading from "../Components/loader";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { filter } from "d3";

class GlobalFault extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      sortedField: "id",
      get_active_filtered_alarms: null,
      showHistory: true,
      showActive: false,
      sortDirection: "asc",
      isOpen: false,
      selectedthSort: null,
      fixthHead: { color: "#297c97e3", cursor: "pointer" },
      selectedSeverityFilters: [],
      get_globalfault: [],
      get_historyAlarms: [],
      get_filtered_alarms: [],
      get_filtered_historyAlarms: [],
      activePage: 1,
      itemsPerPage: 5,
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
      checkedColumns: [],
      searchTerm: null,
      Alarmdata: null,
      pdfDataHistory: null,
      Alarmheaders: null,
      showReportOptions: false,
      csvReport: null,
      pdfData: null,
      csvReportHistory: null,
      MinorAlarmCount: null,
      MajorAlarmCount: null,
      CriticalAlarmCount: null,
      timestamp_Filter: { start_time: new Date(), stop_time: new Date() },
      setFlag: false,
      clearedAlarmRow: { backgroundColor: "rgb(121 175 121)" },
      capturingUniqueID: null,
      selectedOptions: [],
      tableHeaders: {
        "id": true,
        "type-id": true,
        "unique_id": true,
        "resource": true,
        "text": true,
        "alarm-reported-timestamp": true,
        "alarm-severity": true,
      },
    };
    this._onSelect = this._onSelect.bind(this);
    this.open_filter_popup = this.open_filter_popup.bind(this);
    this.filter_alarms = this.filter_alarms.bind(this);
    this.fetchGlobalHistoryAlarms = this.fetchGlobalHistoryAlarms.bind(this);
    this.sort = this.sort.bind(this);
  }

  componentDidMount() {
    document.addEventListener("click", this.handleDocumentClick);
    sessionStorage.setItem("Connection", false);
    this.setState({ is_fetching: true, setFlag: false });
    this.setDefaultTime();
    this.fetchGlobalHistoryAlarms();
    this.fetchGlobalActiveAlarms();
  }

  fetchGlobalHistoryAlarms() {
    const { timestamp_Filter } = this.state;
    fetch(
      `http://${this.state.serverIP}:5002/fault-management/history-alarms/all-devices`,
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
        this.setState({ is_fetching: false });
        if (resp.status === "No faults present in the database") {
          this.setState({ get_globalfault: [], get_filtered_alarms: [] });
        } else {
          var list = [];

          Object.keys(resp).forEach((key) => {
            if (Array.isArray(resp[key])) {
              const newArray = resp[key].map((item) => ({
                ...item,
                unique_id: key,
              }));
              list = list.concat(newArray);
            }
          });

          this.setState({
            get_globalfault: list,
            get_filtered_alarms: list,
            capturingUniqueID: resp,
          });
          this.countBasedOnSeverity();
        }

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

        for (let i = 0; i < this.state.get_globalfault.length; i++) {
          let headerDict = {};
          headerDict = {
            alarm_reported_timestamp:
              this.state.get_globalfault[i]["alarm-reported-timestamp"],
            alarm_severity: this.state.get_globalfault[i]["alarm_severity"],
            id: this.state.get_globalfault[i]["id"],
            resource: this.state.get_globalfault[i]["resource"],
            text: this.state.get_globalfault[i]["text"],
            time_created: this.state.get_globalfault[i]["time-created"],
            type_id: this.state.get_globalfault[i]["type_id"],
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
      });
  }
  fetchGlobalActiveAlarms() {
    console.log("in");
    fetch(
      `http://${this.state.serverIP}:5000/configuration-management/fetch-active-alarms`,
      {
        mode: "cors",
        method: "GET",
        headers: {
          "Access-Control-Allow-Origin": "http://localhost:3000",
          Accept: "application/json",
          "Content-Type": "application/json",
          username: sessionStorage.getItem("username"),
          Authorization:
            "Bearer " +
            JSON.parse(sessionStorage.getItem("login_data")).data.access_token,
        },
      }
    )
      .then((resp) => resp.json())
      .then((resp) => {
        console.log(resp, "global-active-alarm-list================================");
        if (resp.status === "No faults present in the database") {
          this.setState({
            get_global_active_alarms: [],
            get_active_filtered_alarms: [],
          });
        } else {
          this.setState({ activeUniqueIds: resp })
          var list = [];

          Object.keys(resp).forEach((key) => {
            if (Array.isArray(resp[key])) {
              const newArray = resp[key].map((item) => ({
                ...item,
                unique_id: key,
              }));
              list = list.concat(newArray);
            }
          });
          console.log(list);
          this.setState({
            get_global_active_alarms: list,
            get_active_filtered_alarms: list,
          });
        }
      });
  }
  countBasedOnSeverity() {
    var data = this.state.get_filtered_alarms;
    if (this.state.get_filtered_alarms) {
      var major = 0,
        minor = 0,
        critical = 0;
      for (var i = 0; i < data.length; i++) {
        if (data[i]["alarm-severity"] === "MAJOR") {
          major++;
        } else if (data[i]["alarm-severity"] === "MINOR") {
          minor++;
        } else {
          critical++;
        }
      }
      this.setState({
        MinorAlarmCount: minor,
        MajorAlarmCount: major,
        CriticalAlarmCount: critical,
      });
    }
    console.log(major, minor, critical);
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

  handleColumnHideCheck(e) {
    let updatedColHideList = [...this.state.checkedColumns];
    if (e.target.checked) {
      updatedColHideList = [...this.state.checkedColumns, e.target.value];
    } else {
      updatedColHideList.splice(this.state.checkedColumns.indexOf(e.target.value), 1);
    }
    this.setState({ checkedColumns: updatedColHideList });
  }

  isChecked(item) {
    return this.state.checked.includes(item)
      ? "checked-item"
      : "not-checked-item";
  }

  open_filter_popup(id) {
    this.setState({
      show_filter_popup: true,
      filter_by_key: id,
      setFlag: false,
    });
  }

  // takemethere
  filter_alarms() {

    const { selectedOptions, get_globalfault, get_global_active_alarms, showActive, showHistory, checkedColumns,checked, tableHeaders, timestamp_Filter } = this.state;
    let data;
    if (showActive) {
      data = get_global_active_alarms;
    } else {
      data = get_globalfault;
    }
    const severityFilters = this.state.selectedSeverityFilters;
    const typeFilter = this.state.checked;

    let filteredData = data;


    if (selectedOptions.length > 0) {
      filteredData = filteredData.filter((item) => {
        return selectedOptions.includes(item["unique_id"]);
      });
    }

    // apply severity filters
    if (severityFilters.length > 0) {
      filteredData = filteredData.filter((item) => 
         severityFilters.includes(item["alarm-severity"])
      );
    }

    // apply type filter
    if (typeFilter.length) {
      filteredData = filteredData.filter((item) => {
        return typeFilter.includes(item["type-id"]);
      });
    }

    

    // Apply hide column filter
    for (let key in tableHeaders) {
      if (checkedColumns.includes(key)) {
        tableHeaders[key] = false;
      } else {
        tableHeaders[key] = true;
      }
    }
    this.setState(tableHeaders);
    let func = (data, timestamp_Filter) => {
      const startTime = new Date(timestamp_Filter.start_time);
      const stopTime = new Date(timestamp_Filter.stop_time);

      const filteredAlarms = data.filter(alarm => {
        const alarmTimestamp = new Date(alarm["alarm-reported-timestamp"]);
        return alarmTimestamp >= startTime && alarmTimestamp <= stopTime;
      });

      return filteredAlarms;
    }
    console.log(filteredData,"2222222222222222222");

    filteredData = func(filteredData, timestamp_Filter);
    console.log(filteredData,"33333333333333333333333333333333333333")

    this.setState({
      get_filtered_alarms: filteredData,
      openFilterPopup: false,
      activePage: 1
    });
  }

  clearAllfilter() {
    const { tableHeaders } = this.state;

    for (let key in tableHeaders) {
      tableHeaders[key] = true;
    }
    console.log(this.state.get_globalfault, "glob")
    this.setState({ checkedColumns: [] });
    this.setState(tableHeaders);
    this.setState({ checked: [], selectedOptions: [] });
    this.setDefaultTime();
    this.setState({ selectedSeverityFilters: [] });
    if (this.state.showActive) {
      this.setState({
        get_filtered_alarms: this.state.get_global_active_alarms,
        openFilterPopup: false,
      }
      );
    }
    else {
      this.setState({
        get_filtered_alarms: this.state.get_globalfault,
        openFilterPopup: false,
      }
      );
    }
  }
  sort(type, category) {
    var unsorted_alarm = this.state.hold_alarms;
    if (type === "unsort") {
      console.log("in", unsorted_alarm);
      if (category === "active") {
        this.setState({ get_globalfault: unsorted_alarm });
      } else {
        this.setState({ get_listOfAlarms: unsorted_alarm });
      }
    } else {
      if (category === "active") {
        let sorted_alarm = this.state.get_globalfault.sort((a, b) => {
          if (type === "dsc") {
            return b.fault_id - a.fault_id;
          } else {
            return a.fault_id - b.fault_id;
          }
        });
        this.setState({ get_globalfault: sorted_alarm });
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
        if (
          this.state.deviceData["device-info"].sensor[i].name ===
          this.state.selectedOption.value
        ) {
          if (
            this.state.deviceData["device-info"].sensor[i].state.temperature[
            "alarm_severity"
            ] === "indeterminate"
          ) {
            this.setState({ StatusValue: 125 });
          } else if (
            this.state.deviceData["device-info"].sensor[i].state.temperature[
            "alarm_severity"
            ] === "minor"
          ) {
            this.setState({ StatusValue: 375 });
          } else if (
            this.state.deviceData["device-info"].sensor[i].state.temperature[
            "alarm_severity"
            ] === "major"
          ) {
            this.setState({ StatusValue: 625 });
          } else {
            this.setState({ StatusValue: 875 });
          }
        }
      }
    });
  }
  handlePageChange = (pageNumber) => {
    this.setState({ activePage: pageNumber });
  };
  handleSearch(event) {
    this.setState({ searchTerm: event.target.value });
    this.updateWithSearchTerm(event.target.value);
  }
  updateWithSearchTerm(searchTerm) {
    if (this.state.showActive) {
      const { get_global_active_alarms } = this.state;
      if (!searchTerm) {
        this.setState({ get_filtered_alarms: get_global_active_alarms, activePage: 1 });
      } else {
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        const filteredAlarms = get_global_active_alarms.filter((notification) => {
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
        this.setState({ get_filtered_alarms: filteredAlarms, activePage: 1 });
      }
    }
    else {
      const { get_globalfault } = this.state;
      if (!searchTerm) {
        this.setState({ get_filtered_alarms: get_globalfault, activePage: 1 });
      } else {
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        const filteredAlarms = get_globalfault.filter((notification) => {
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
        this.setState({ get_filtered_alarms: filteredAlarms, activePage: 1 });
      }
    }
  }

  sortTable = (column) => {
    const { sortColumn, sortDirection, get_filtered_alarms } = this.state;
    let direction = "asc";
    if (sortColumn === column && sortDirection === "asc") {
      direction = "desc";
      this.setState({ sortOrder: "desc" });
    } else {
      this.setState({ sortOrder: "asc" });
    }
    if (column === "timestamp") {
      console.log("time");
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
  };
  exportPDF = (id) => {
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
    console.log(this.state.pdfData);
    var data = this.state.get_filtered_alarms.map((elt) => [
      elt["alarm-reported-timestamp"],
      elt["alarm_severity"],
      elt.id,
      elt.resource,
      elt.text,
      elt["time-created"],
      elt["type_id"],
    ]);

    let content = {
      startY: 50,
      head: headers,
      body: data,
    };

    doc.text(title, marginLeft, 40);
    doc.autoTable(content);
    if (id !== "history") {
      doc.save("AlarmReport.pdf");
    } else {
      doc.save("AlarmHistoryReport.pdf");
    }
  };

  setDefaultTime() {
    const { timestamp_Filter } = this.state;
    var currentDate = new Date();
    var oneMonthAgo = new Date(currentDate);
    oneMonthAgo.setMonth(currentDate.getMonth() - 1);
    currentDate = this.convertDateFormat(currentDate);
    oneMonthAgo = this.convertDateFormat(oneMonthAgo);
    timestamp_Filter["start_time"] = oneMonthAgo;
    timestamp_Filter["stop_time"] = currentDate;
    this.setState({ timestamp_Filter });
  }
  convertDateFormat(inputDateStr) {
    const inputDate = new Date(inputDateStr);
    return inputDate.toISOString(); // Returns date in ISO 8601 format
  }
  toggleDropdown = () => {
    this.setState((prevState) => ({
      isOpen: !prevState.isOpen,
    }));
  };

  handleDocumentClick = (event) => {
    if (this.dropdownRef && !this.dropdownRef.contains(event.target)) {
      this.setState({
        isOpen: false,
      });
    }
  };
  componentWillUnmount() {
    document.removeEventListener("click", this.handleDocumentClick);
  }
  openFilterBox() {
    if (this.state.openFilterPopup) {
      this.setState({ openFilterPopup: false });
    } else {
      this.setState({ openFilterPopup: true });
    }
    this.setState({ setFlag: true });
  }
  handleCheckboxChange(option) {
    const selectedOptions = [...this.state.selectedOptions];
    const index = selectedOptions.indexOf(option);
    if (index === -1) {
      selectedOptions.push(option);
    } else {
      selectedOptions.splice(index, 1);
    }
    console.log(selectedOptions);
    this.setState({ selectedOptions });
  }
  toggleDarkMode = () => {
    console.log("innetw");
    this.setState((prevState) => ({ isDarkMode: !prevState.isDarkMode }));
  };

  sortTableWithSeverity(severity, reset = false) {
    const {
      get_globalfault,
      get_global_active_alarms,
      showHistory,
      showActive,
    } = this.state;
    let data = get_globalfault;
    if (showActive) {
      data = get_global_active_alarms;
    }

    let filteredData;
    if (!reset) {
      filteredData = data.filter((item) => {
        return item["alarm-severity"] === severity;
      });
    } else {
      filteredData = data;

      if (showActive) {
        this.setState({ get_global_active_alarms: filteredData });
      } else {
        this.setState({ get_globalfault: filteredData });
      }
    }

    console.log(filteredData.length, "length");
    this.setState({ get_filtered_alarms: filteredData }, () => {
      console.log("set", this.state.get_filtered_alarms);
    });
  }
 
  renderSeverityOptions() {
    const severityOptions = [
      { severity: "CRITICAL", count: this.state.CriticalAlarmCount, style: this.state.severity.critical },
      { severity: "MAJOR", count: this.state.MajorAlarmCount, style: this.state.severity.major },
      { severity: "MINOR", count: this.state.MinorAlarmCount, style: this.state.severity.minor },
      { severity: "RESET", image: require('../Images/reset.png') }
    ];

    return severityOptions.map((option, index) => (
      <div key={index} style={{ display: "inline-block", margin: "0% 2.5%" }}>
        <div style={option.style} onClick={() => this.sortTableWithSeverity(option.severity, option.severity === "RESET")}>
          {option.severity === "RESET" ? (
            <Tooltip title="reset">
              <img src={option.image} alt="" width="20" />
            </Tooltip>
          ) : `${option.severity}:`}
          <span>{option.count}</span>
        </div>
      </div>
    ));
  }

  render() {
    const { isDarkMode } = this.state;
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
      activePage,
      itemsPerPage,
      get_filtered_alarms,
      capturingUniqueID,
      selectedOptions,
      tableHeaders,
      checkedColumns,get_active_filtered_alarms
    } = this.state;
    const indexOfLastItem = activePage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = get_filtered_alarms.slice(
      indexOfFirstItem,
      indexOfLastItem
    );
    console.log(get_filtered_alarms,"length")
    const { isOpen } = this.state;
    // console.log(this.state.selectedSeverityFilters, "selected filter")
    return (
      <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
        <div
          style={{ height: "100vh" }}
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
              <div style={{ flex: "4" }}>
                <div
                  className="head_cover"
                  style={{
                    backgroundColor: isDarkMode
                      ? darkTheme.palette.background.default
                      : "white",
                  }}
                >
                  <NewHeader
                    header_name="Global Faults"
                    path="globalfaults"
                    darkMode={this.state.isDarkMode}
                    toggleDarkMode={this.toggleDarkMode}
                  />
                </div>

                <div
                  className="mainContent"
                  style={{ marginLeft: "3%", marginTop: "9%", width: "94%", background: isDarkMode ? null : "white" }}
                >
                  <section
                    className="sectionback"
                    style={{
                      display: "flex",
                      position: "fixed",
                      width: "95vw",
                      height: "9.5%",
                      marginTop: "-0.5%",
                      zIndex: "10000",
                      alignItems: "center",
                    }}
                  >
                    <div className="tabboxx" style={{ width: "30%" }} >
                      {this.renderSeverityOptions()}
                    </div>

                    <div style={{ display: "flex", width: "25%" }}>
                      <div>
                        <input
                          style={{ height: "12px", marginRight: "5px" }}
                          type="checkbox"
                          checked={this.state.showHistory}
                          onChange={() => {
                            this.setState(
                              {
                                get_filtered_alarms: this.state.get_globalfault,
                                showHistory: true,
                                showActive: false,
                                activePage: 1
                              },
                              () => {
                                this.countBasedOnSeverity();
                              }
                            );
                          }}
                        />
                        <span style={{ fontSize: "12.5px" }}>
                          Alarm History
                        </span>
                      </div>
                      <div style={{ marginLeft: "15px" }}>
                        <input
                          type="checkbox"
                          style={{ height: "12px" }}
                          checked={this.state.showActive}
                          disabled={!this.state.get_active_filtered_alarms}
                          onChange={() => {
                            this.setState(
                              {
                                get_filtered_alarms:
                                  this.state.get_active_filtered_alarms,
                                showHistory: false,
                                showActive: true,
                                activePage: 1
                              },
                              () => {
                                this.countBasedOnSeverity();
                                this.setState({ capturingUniqueID: this.state.activeUniqueIds })
                              }
                            );
                          }}
                        />

                        <span style={{ fontSize: "12.5px", marginLeft: "8px" }}>
                          Active Alarm
                        </span>
                      </div>
                    </div>
                    <span style={{ display: "flex", marginLeft: "rem" }}>
                      <div className="tabbox" style={{ marginRight: "2rem" }}>
                        <img
                          alt=""
                          className="tabicon"
                          src={require("../Images/search.png")}
                        ></img>
                        <input
                          type="search"
                          placeholder="Search"
                          style={{
                            border: "0",
                            height: "90%",
                            width: "225px",
                            background: "border-box",
                          }}
                          value={this.state.searchTerm}
                          onChange={(e) => this.handleSearch(e)}
                        />
                      </div>
                      <div
                        className="tabbox"
                        style={
                          this.state.showFilter
                            ? { color: "#004f68", fontWeight: "bold" }
                            : null
                        }
                        onClick={(e) => this.openFilterBox()}
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
                          get_filtered_alarms.length > 0 ? (
                            <div
                              className="downloadOptions"
                              style={{ marginTop: "6.5%" }}
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
                              {this.state.csvReport ? (
                                <CSVLink {...this.state.csvReport}>
                                  <div
                                    className="optionsBox"
                                    style={{
                                      color: "black",
                                      textTransform: null,
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
                          ) : (
                            <div className="downloadOptions">
                              No alarms present
                            </div>
                          )
                        ) : null}
                      </div>

                    </span>
                  </section>
                  {this.state.openFilterPopup ? (
                    <div
                      className="filterpopup"
                      style={{
                        marginRight: "28px",
                        paddingTop: "3%",
                        boxShadow: "none",
                      }}
                    >
                      <div style={{ display: "flex" }}>
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
                            style={{ marginLeft: "10%" }}
                          >
                            Severity
                          </div>
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              marginTop: "7%",
                              marginLeft: "5%",
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
                          style={{ marginLeft: "2%" }}
                        ></div>
                        <div>
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
                            {Object.keys(tableHeaders).map((header) => (
                              <label
                                key={header}
                                style={{
                                  margin: "5px 10px 0px 5px",
                                  fontSize: "14px",
                                }}
                              >
                                <input
                                  style={{ height: "11px", marginRight: "4px" }}
                                  type="checkbox"
                                  value={header}
                                  checked={checkedColumns.includes(header)}
                                  onChange={(e) => this.handleColumnHideCheck(e)}
                                />
                                {header}
                              </label>
                            ))}
                          </div>
                        </div>
                        <div
                          className="vertiline"
                          style={{ marginLeft: "2%" }}
                        ></div>
                        <div style={{ marginLeft: "1%" }}>
                          <div
                            className="filterpopupHeader"
                            style={{ marginLeft: "15%" }}
                          >
                            TypeID
                          </div>
                          <div>
                            <div
                              className="list-container"
                              style={{ display: "flex", flexWrap: "wrap" }}
                            >
                              {this.state.typeIDavailable.map((item, index) => (
                                <div key={index} style={{ width: "40%" }}>
                                  <input
                                    style={{ marginLeft: "4%", height: "10px" }}
                                    value={item}
                                    checked={this.state.checked.includes(item)}
                                    type="checkbox"
                                    onChange={(e) => this.handleCheck(e)}
                                  />
                                  <span
                                    style={{
                                      fontSize: "smaller",
                                      marginLeft: "10%",
                                    }}
                                  >
                                    {item}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="vertiline"></div>
                        <div style={{ marginLeft: "1%" }}>
                          <div
                            className="filterpopupHeader"
                            style={{ marginLeft: "15%" }}
                          >
                            Unique ID
                          </div>
                          <div className="select-box">
                            <div className="checkbox-scroll-box">
                              {capturingUniqueID &&
                                Object.keys(capturingUniqueID).map((option) => (
                                  <div key={option} style={{ display: "flex" }}>
                                    <input
                                      type="checkbox"
                                      value={option}
                                      checked={selectedOptions.includes(option)}
                                      onChange={(e) =>
                                        this.handleCheckboxChange(
                                          e.target.value
                                        )
                                      }
                                    />
                                    <label
                                      style={{
                                        marginTop: "7px",
                                        fontSize: "small",
                                      }}
                                    >
                                      {option}
                                    </label>
                                  </div>
                                ))}
                            </div>
                          </div>
                        </div>
                        <div className="vertiline"></div>
                        <div style={{ marginLeft: "1%" }}>
                          <div
                            className="filterpopupHeader"
                            style={{ marginLeft: "6%" }}
                          >
                            Timestamp
                          </div>
                          <div style={{ display: "flex", marginLeft: "" }}>
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
                                      const selectedDate = new Date(e);
                                      const formattedDate = selectedDate.toLocaleString('en-US', {
                                        weekday: 'short',
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        second: '2-digit',
                                        timeZone: 'UTC'
                                      });
                                      console.log(formattedDate);
                                      // You can use the formattedDate variable as needed, for example, updating state
                                      const updatedTimestampFilter = {
                                        ...this.state.timestamp_Filter,
                                        start_time: formattedDate
                                      };
                                      this.setState({ timestamp_Filter: updatedTimestampFilter });
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
                            <div style={{ marginLeft: "3%" }}>
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
                                      const selectedDate = new Date(e);
                                      const formattedDate = selectedDate.toLocaleString('en-US', {
                                        weekday: 'short',
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        second: '2-digit',
                                        timeZone: 'UTC'
                                      });
                                      console.log(formattedDate);
                                      // You can use the formattedDate variable as needed, for example, updating state
                                      const updatedTimestampFilter = {
                                        ...this.state.timestamp_Filter,
                                        stop_time: formattedDate
                                      };
                                      this.setState({ timestamp_Filter: updatedTimestampFilter });
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
                            <div className="applyResetBox">
                              <div
                                className="btn btn-primary mb3"
                                onClick={(e) => {
                                  this.filter_alarms();
                                }}
                              >
                                Apply
                              </div>
                              <div
                                className="btn btn-primary mb3"
                                style={{
                                  marginLeft: "3%",
                                  background: "#7b7c83de",
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

                  {this.state.get_filtered_alarms ? (
                    <div>
                      <div
                        style={{
                          paddingTop: "50px",
                          height: "425px",
                          overflowY: "auto",
                        }}
                      >
                        <table
                          className="user_table"
                          style={{ width: "100%", marginTop: "7px" }}
                        >
                          <thead id="panels" className="user_table_head">
                            <tr
                              style={{
                                backgroundColor: "#e5e8ff",
                                color: "black",
                              }}
                            >
                              {Object.keys(tableHeaders).map(
                                (header) =>
                                  tableHeaders[header] && (
                                    <th
                                      key={header}
                                      onClick={() => this.sortTable(header)}
                                      style={
                                        this.state.selectedthSort &&
                                          this.state.selectedthSort === header
                                          ? this.state.fixthHead
                                          : {
                                            cursor: "pointer",
                                            position: "static",
                                          }
                                      }
                                    >
                                      {header}
                                      <img
                                        alt=""
                                        style={{
                                          marginLeft: "8px",
                                          marginTop: "2px",
                                        }}
                                        src={
                                          this.state.selectedthSort ===
                                            header &&
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
                          <tbody
                            id="panels"
                            style={{
                              borderStyle: "hidden",
                              background: "white",
                            }}
                          >
                            {currentItems.map((item, index) => (
                              <tr key={index}>
                                {Object.keys(tableHeaders).map(
                                  (header) =>
                                    tableHeaders[header] && (
                                      <td
                                        key={header}
                                        className={
                                          header === "alarm-severity"
                                            ? "severity_color"
                                            : ""
                                        }
                                        style={{
                                          color:
                                            header !== "alarm-severity"
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
                                            header !== "alarm-severity"
                                              ? ""
                                              : "500",
                                          textAlign: "center",
                                        }}
                                      >
                                        {item[header] || item["state"][header]}
                                      </td>
                                    )
                                )}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <Pagination
                        activePage={activePage}
                        itemsCountPerPage={itemsPerPage}
                        totalItemsCount={get_filtered_alarms.length}
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
                    <div style={{ marginTop: "50px", marginLeft: "50px" }}>
                      "NO ALARM AVAILABLE"
                    </div>
                  )}

                  {this.state.is_fetching === true ? <Loading /> : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      </ThemeProvider>
    );
  }
}
export default GlobalFault;