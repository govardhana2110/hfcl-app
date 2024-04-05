import React from "react";
import NewHeader from "../Components/header";
import NewLeftpanel from "../Components/leftPanel";
import sortDown from "../Images/dropDown.png";
import sortUp from "../Images/arrow-up.png";
import enabled from "../Images/power-on.png";
import disabled from "../Images/power-off.png";
import Pagination from "react-js-pagination";
import { PageItem as BootstrapPageItem } from "react-bootstrap";
import close from "../Images/close.png";
import { CSVLink } from "react-csv";
import jsPDF from "jspdf";
import swal from "sweetalert2";
import { Tooltip } from "antd";
import Loading from "../Components/loader";
import DatePicker from "react-datepicker";
import search from "../Images/search.png";
import backButton from "../Images/back.png";
import { ThemeProvider, createTheme } from "@mui/material/styles";

class SoftwarePanel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      sortColumn: null,
      sortDirection: null,
      selectedthSort: null,
      fixthHead: { color: "#297c97e3", cursor: "pointer" },
      selectedSoftwareTab: { background: "#004f68", color: "white" },
      watchDogData: [],
      filteredWatchDog: [],
      get_filtered_alarms: [],
      activePage: 1,
      itemsPerPage: 5,
      isEditing: false,
      intervalValue: 60,
      is_fetching: false,
      originalData: null,
      serverIP: process.env.REACT_APP_CLIENT_IP,
      device_id: null,
      mainContent: true,
      val: "abc",
      subHead: null,
      hold_alarms: null,
      pdfData: null,
      show_filter_popup: false,
      filter_by_key: null,
      showModuleContent: false,
      index: null,
      KeyYang: null,
      showWatchdog: false,
      UniqueId: null,
      moduleContent: null,
      showSecondAdd: false,
      selectedSeverityFilter: { backgroundColor: "#004f68c4", color: "white" },
      selectedRunningFilters: [],
      watchdogStatus: true,
      installing: false,
      progress: 0,
      showImages: true,
      openFilterPopup: false,
      processNameAvailable: [
        "nsm",
        "ripd",
        "ripngd",
        "ospfd",
        "ospf6d",
        "isisd",
        "hostpd",
        "ldpd",
        "rsvpd",
        "mribd",
        "pimd",
        "dvmrpd",
        "authd",
        "mstpd",
        "imi",
        "rmon",
        "onmd",
        "hsl",
        "oamd",
        "vlogd",
        "trilld",
        "ptpd",
        "synced",
        "vrrpd",
        "ndd",
        "ribd",
        "bgpd",
        "l2mribd",
        "lagd",
        "sflow",
        "udld",
        "cmld",
        "cmmd",
        "pcepd",
        "spbd",
      ],
      checked: [],
      timestamp_Filter: { start_time: new Date(), stop_time: new Date() },
      openFilterOptions: false,
      filteredWatchDog: [],
      showReportOptions: false,
      csvReport: null,
      showSoftware: false,
      softwareUpdateData: null,
      supportedYAangs: [
        [{ "system/sysup": "ipi-sys-update" }],
        [{ "/fault/watchdog": "ipi-watchdog" }],
      ],
      searchTerm: "",
    };
    this.handleClick = this.handleClick.bind(this);
  }
  componentDidMount() {
    document.addEventListener("click", this.handleDocumentClick);
  }
  fetchWatchdog() {
    this.setState({ is_fetching: true });
    let device_unique_id = sessionStorage.getItem("unique_id");
    fetch(
      `http://${this.state.serverIP}:5000/configuration-management/fault/watchdog/${device_unique_id}`,
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
        console.log(resp, "watchdog-response");
        this.setState({ getData: resp });
        this.setState({
          watchDogData:
            resp["ipi-watchdog:watchdog"]["software-modules"][
              "software-module"
            ],
          pdfData:
            resp["ipi-watchdog:watchdog"]["software-modules"][
              "software-module"
            ],
          is_fetching: false,
          filteredWatchDog:
            resp["ipi-watchdog:watchdog"]["software-modules"][
              "software-module"
            ],
        });
        this.updateCurrentItems(
          resp["ipi-watchdog:watchdog"]["software-modules"]["software-module"]
        );
        if (resp["ipi-watchdog:watchdog"].state["keepalive-interval"]) {
          this.setState({
            intervalValue:
              resp["ipi-watchdog:watchdog"].state["keepalive-interval"],
          });
        } else {
          this.setState({ intervalValue: 60 });
        }

        if (resp.status) {
          alert(resp.status);
          this.setState({ showModuleContent: false });
        }
        var WatchdogHeaders = [
          { label: "Process Name", key: "process_name" },
          { label: "Down Reason", key: "down_reason" },
          { label: "Process Status", key: "process_status" },
          { label: "Start Time", key: "start_time" },
        ];
        var WatchdData = [];
        for (let i = 0; i < this.state.watchDogData.length; i++) {
          let headerDict = {};
          headerDict = {
            process_name:
              this.state.watchDogData[i].process.state["process-name"],
            down_reason:
              this.state.watchDogData[i].process.state["down-reason"],
            process_status:
              this.state.watchDogData[i].process.state["process-status"],
            start_time: this.state.watchDogData[i].process.state["start-time"],
          };
          WatchdData.push(headerDict);
        }
        this.setState({ pdfData: WatchdData });
        this.setState({
          csvReport: {
            data: WatchdData,
            headers: WatchdogHeaders,
            filename: "WatchDogReport.csv",
          },
        });
        this.setState({ is_fetching: false });
      })
      .catch((err) => {
        if (err.response) {
          alert(err.response.data.status);
          console.log("Error Response Data:", err.response.data);
          console.log("Error Response Status:", err.response.status);
          console.log("Error Response Headers:", err.response.headers);
          this.setState({ is_fetching: false });
        }
      });
  }
  fetchStoredImages() {
    this.setState({ is_fetching: true });
    let device_unique_id = sessionStorage.getItem("unique_id");
    fetch(
      `http://${this.state.serverIP}:5000/configuration-management/system/sysup/${device_unique_id}`,
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
        console.log(resp, "available-images");
        if (resp["ipi-sys-update:system-update"]) {
          this.setState({
            softwareUpdateData: resp["ipi-sys-update:system-update"],
          });
          this.setState({
            imageList:
              resp["ipi-sys-update:system-update"].installers.installer,
          });
        }
        this.setState({ is_fetching: false });
      })
      .catch((err) => {
        if (err.response) {
          alert(err.response.data.status);
          console.log("Error Response Data:", err.response.data);
          console.log("Error Response Status:", err.response.status);
          console.log("Error Response Headers:", err.response.headers);
          this.setState({ is_fetching: false });
        }
      });
  }
  addReadonlyKeys(data) {
    // Loop through each object in the data array
    data.forEach((obj) => {
      // Initialize an array to hold the keys with string values
      const stringKeys = [];
      // Loop through each key-value pair in the current object
      if (obj != null) {
        Object.entries(obj).forEach(([key, value]) => {
          // If the value is a string, add the key to the stringKeys array
          if (typeof value === "string" && key !== "@xmlns") {
            var str = value;
            if (str.slice(-1) !== "w") {
              stringKeys.push(key);
            }
          } else if (value === null) {
            stringKeys.push(key);
          }
          // If the value is an object, recursively call the function on the nested object
          else if (typeof value === "object") {
            this.addReadonlyKeys([value]);
          }
        });
        // Add a "readonly" key to the current object with an array of the stringKeys
        obj["readonlyKeys"] = stringKeys;
      }
    });
    return data;
  }
  mapData(data1, data2) {
    if (typeof data1 !== typeof data2) {
      return data1;
    }
    if (Array.isArray(data1)) {
      if (data1.length > 1 && Array.isArray(data2) && data2.length === 1) {
        const newArray = [];
        for (let i = 0; i < data1.length; i++) {
          newArray.push(this.mapData(data1[i], data2[0]));
        }
        return newArray;
      } else {
        return data2.length > 0
          ? data2.map((item, index) => this.mapData(data1[0], item))
          : data1;
      }
    }
    if (typeof data1 === "object" && data1 !== null) {
      const keys = Object.keys(data1);
      return keys.reduce((acc, key) => {
        let newKey = key;
        if (key.endsWith("_LIST")) {
          newKey = key.slice(0, -5);
        }
        if (data2.hasOwnProperty(newKey)) {
          acc[key] = this.mapData(data1[key], data2[newKey]);
        } else {
          acc[key] = data1[key];
        }
        return acc;
      }, {});
    }
    return data2 !== null ? data2 : data1;
  }

  sortTable = (column) => {
    const { sortColumn, sortDirection, watchDogData } = this.state;
    let direction = "asc";

    if (sortColumn === column && sortDirection === "asc") {
      this.setState({ sortOrder: "desc" });
      direction = "desc";
    } else {
      this.setState({ sortOrder: "asc" });
    }

    const sortedItems = watchDogData.sort((a, b) => {
      if (column === "name") {
        var aValue = a[column];
        var bValue = b[column];
      } else {
        aValue = a.process.state[column];
        bValue = b.process.state[column];
      }
      if (aValue < bValue) {
        return direction === "asc" ? -1 : 1;
      }

      if (aValue > bValue) {
        return direction === "asc" ? 1 : -1;
      }

      return 0;
    });
    this.updateCurrentItems();

    this.setState({
      watchDogData: sortedItems,
      sortColumn: column,
      sortDirection: direction,
      selectedthSort: column,
    });
    var a = this.state.selectedthSort;
    console.log(a, "color");
  };
  clearAllfilter() {
    this.setState({ checked: [] });
    this.setState({ selectedRunningFilters: [] });
    this.setDefaultTime();
    this.setState({ filteredWatchDog: this.state.watchDogData });
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

  filterWatchdog() {
    const data = this.state.filteredWatchDog;
    const processStatusFilters = this.state.selectedRunningFilters;
    const processNameFilters = this.state.checked;
    const timestampFilter = this.state.timestamp_Filter;

    let filteredData = data;
    console.log(data, processNameFilters, processStatusFilters);

    if (processStatusFilters.length > 0) {
      filteredData = filteredData.filter((item) => {
        return processStatusFilters.includes(
          item.process.state["process-status"].toUpperCase()
        );
      });
    }

    if (processNameFilters.length > 0) {
      filteredData = filteredData.filter((item) => {
        return processNameFilters.includes(item.process.state["process-name"]);
      });
    }

    // if (timestampFilter.start_time && timestampFilter.stop_time) {
    //     filteredData = filteredData.filter((item) => {
    //       const timestamp = new Date(item.process.state["start-time"]);
    //      return timestamp >= new Date(timestampFilter.start_time) && timestamp <= new Date(timestampFilter.stop_time);
    //     });
    // }
    console.log(filteredData);
    // set filtered data in state
    this.setState({
      filteredWatchDog: filteredData,
      openFilterPopup: false,
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
  exportPDF = (id) => {
    const unit = "pt";
    const size = "A4"; // Use A1, A2, A3 or A4
    const orientation = "portrait"; // portrait or landscape

    const marginLeft = 40;
    const doc = new jsPDF(orientation, unit, size);

    doc.setFontSize(15);

    const title = "Watchdog Report";
    const headers = [
      ["Process Name", "Down Reason", "Process Status", "Start Time"],
    ];
    console.log(this.state.pdfData);
    var data = this.state.pdfData.map((elt) => [
      elt["process_name"],
      elt["down_reason"],
      elt["process_status"],
      elt["start_time"],
    ]);

    let content = {
      startY: 50,
      head: headers,
      body: data,
    };

    doc.text(title, marginLeft, 40);
    doc.autoTable(content);
    doc.save("WatchdogReport.pdf");
  };

  handleChange(e, id) {
    if (id === "source") {
      this.setState({ sourceValue: e.target.value });
    } else {
      this.setState({ urlValue: e.target.value });
    }
  }
  postData(item, key, bool, url) {
    let device_unique_id = sessionStorage.getItem("unique_id");
    var configBody = {};
    if (key === "sys-update-install") {
      configBody = {
        "@xmlns": "http://www.ipinfusion.com/yang/ocnos/ipi-sys-update",
        "installer-name": item,
        "ignore-feature-check": bool,
      };
    } else if (key === "sys-update-delete") {
      configBody = {
        "@xmlns": "http://www.ipinfusion.com/yang/ocnos/ipi-sys-update",
        "image-name": item,
      };
    } else if (
      key === "sys-update-uninstall" ||
      key === "sys-update-cancel-download"
    ) {
      console.log("called");
      configBody = {
        "@xmlns": "http://www.ipinfusion.com/yang/ocnos/ipi-sys-update",
      };
    } else if (key === "sys-update-get") {
      configBody = {
        "@xmlns": "http://www.ipinfusion.com/yang/ocnos/ipi-sys-update",
        "source-interface": bool,
        url: url,
      };
      this.setState({ showSecondAdd: true });
    }
    console.log(configBody);
    fetch(
      `http://${this.state.serverIP}:5000/configuration-management/rpc/${key}/${device_unique_id}`,
      {
        mode: "cors",
        method: "POST",
        headers: {
          "Access-Control-Allow-Origin": "http://localhost:3000",
          "Content-Type": "application/json",
          username: sessionStorage.getItem("username"),
        },
        body: JSON.stringify(configBody),
      }
    )
      .then((resp) => resp.json())
      .then((resp) => {
        this.setState({ postResponse: resp });
        console.log(resp, "post response");
        if (resp.status["rpc-reply"] && key === "sys-update-get") {
          swal.fire({
            title: "Image Downloading Started....",
            text: "SUCCESS",
            width: 300,
            height: 40,
            color: "green",
            icon: "success",
          });
          this.setState({ showDownloadImages: false, showImages: true });
        } else if (resp.status["rpc-reply"] && key === "sys-update-delete") {
          swal.fire({
            title: "Image Deleted Successfully",
            text: "SUCCESS",
            width: 300,
            height: 40,
            color: "green",
            icon: "success",
          });
        } else {
          swal.fire({
            title: resp.status.message,
            text: "Failure",
            width: 300,
            height: 40,
            color: "red",
            icon: "failure",
          });
        }
        this.fetchStoredImages();
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
  handleClick(item) {
    console.log(item);
    swal
      .fire({
        title: "Do you want to Ignore Feature Check?",
        text: "",
        width: 300,
        height: 40,
        color: "black",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes",
        cancelButtonText: "No",
      })
      .then((result) => {
        this.postData(item, "sys-update-install", true);
        if (result.isConfirmed) {
          this.setState({ installing: true });
          let interval = setInterval(() => {
            this.setState((prevState) => ({
              progress: prevState.progress + 10,
            }));
            if (this.state.progress >= 100) {
              clearInterval(interval);
              this.setState({ installing: false, progress: 0 });
            }
          }, 1000);
        } else {
          this.postData(item, "sys-update-install", false);
          this.setState({ installing: true });
          let interval = setInterval(() => {
            this.setState((prevState) => ({
              progress: prevState.progress + 10,
            }));
            if (this.state.progress >= 100) {
              clearInterval(interval);
              this.setState({ installing: false, progress: 0 });
            }
          }, 1000);
        }
      });
  }
  convertDateFormat(inputDateStr) {
    const inputDate = new Date(inputDateStr);
    return inputDate.toISOString(); // Returns date in ISO 8601 format
  }
  postWatchDog(item, value) {
    this.setState({ is_fetching: true });
    var device_unique_id = sessionStorage.getItem("unique_id");
    var temp = this.state.getData;
    var index;
    console.log(temp, "called");
    for (
      let i = 0;
      i <
      temp["ipi-watchdog:watchdog"]["software-modules"]["software-module"]
        .length;
      i++
    ) {
      if (
        temp["ipi-watchdog:watchdog"]["software-modules"]["software-module"][i]
          .name === value
      ) {
        index = i;
      }
    }
    var postData;
    if (item === "watchdog status") {
      if (
        temp["ipi-watchdog:watchdog"].state["watchdog-status"] === "enabled"
      ) {
        var toggler = [null];
      } else {
        toggler = {
          "@nc:operation": "delete",
        };
      }
      postData = {
        "ipi-watchdog:watchdog": { config: { "watchdog-disabled": toggler } },
      };
      var messageWatch = "Watchdog Status Changed";
    } else if (item === "time interval") {
      postData = {
        "ipi-watchdog:watchdog": { config: { "keepalive-interval": value } },
      };
      messageWatch = "Time Interval Changed";
    } else {
      if (
        temp["ipi-watchdog:watchdog"]["software-modules"]["software-module"][
          index
        ].state
      ) {
        if (
          JSON.stringify(
            temp["ipi-watchdog:watchdog"]["software-modules"][
              "software-module"
            ][index].state["module-watchdog-status-disabled"]
          ) === "[null]"
        ) {
          toggler = {
            name: value,
            "module-watchdog-status-disabled": { "@nc:operation": "delete" },
          };
        } else {
          toggler = { name: value, "module-watchdog-status-disabled": [null] };
        }
      } else {
        toggler = { name: value, "module-watchdog-status-disabled": [null] };
      }
      postData = {
        "ipi-watchdog:watchdog": {
          "software-modules": {
            "software-module": [{ name: value, config: toggler }],
          },
        },
      };
      messageWatch = `${value} Status Changed`;
    }
    console.log(postData, "watchdog post");
    fetch(
      `http://${this.state.serverIP}:5000/configuration-management/fault/watchdog/${device_unique_id}`,
      {
        mode: "cors",
        method: "POST",
        headers: {
          "Access-Control-Allow-Origin": "http://localhost:3000",
          "Content-Type": "application/json",
          username: sessionStorage.getItem("username"),
        },
        body: JSON.stringify(postData),
      }
    )
      .then((resp) => resp.json())
      .then((resp) => {
        this.setState({ postResponse: resp });
        console.log(resp, "post response");
        if (resp.status["rpc-reply"]) {
          swal.fire({
            title: messageWatch,
            text: "SUCCESS",
            width: 300,
            height: 40,
            color: "green",
            icon: "success",
          });
          this.setState({ is_fetching: false });
          this.fetchWatchdog();
        } else {
          swal.fire({
            title: resp.status.message,
            text: "Failure",
            width: 300,
            height: 40,
            color: "red",
            icon: "failure",
          });
          this.setState({ is_fetching: false });
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
  handleIntervalClick = () => {
    this.setState({ isEditing: true });
  };

  handleIntervalChange = (e) => {
    this.setState({ intervalValue: e.target.value });
  };

  handleIntervalBlur = () => {
    this.setState({ isEditing: false });
  };
  handleKeyDown = (e) => {
    if (e.key === "Enter") {
      this.postWatchDog("time interval", e.target.value); // Call the function when Enter key is pressed
    }
  };
  handleSoftwareTabSwitch(id) {
    if (id === "image") {
      this.setState({
        showImages: true,
        showDownloadImages: false,
        showSystemUpdateDetails: false,
      });
    } else if (id === "update") {
      this.setState({
        showImages: false,
        showDownloadImages: false,
        showSystemUpdateDetails: true,
      });
    } else if (id === "download") {
      this.setState({
        showImages: false,
        showDownloadImages: true,
        showSystemUpdateDetails: false,
      });
    }
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

  updateWithSearchTerm(searchTerm) {
    const { watchDogData } = this.state;
  
    if (searchTerm === "") {
      this.setState({ filteredWatchDog: watchDogData },()=> this.updateCurrentItems());
     
      return; // Exit early if search term is empty
    }
  
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
  
    const filteredTable = watchDogData.filter((notification) => {
      // Check each notification for matching values
      for (const key in notification) {
        const stateObject = notification[key].state;
        if (stateObject && typeof stateObject === "object") {
          // Check if any state value contains the search term
          const valuesArray = Object.values(stateObject);
          const hasMatchingValue = valuesArray.some(
            (value) =>
              typeof value === "string" &&
              value.toLowerCase().includes(lowerCaseSearchTerm)
          );
          if (hasMatchingValue) {
            return true; // Return true if a matching value is found
          }
        }
      }
      return false; // Return false if no matching value is found
    });
  
    this.setState({ filteredWatchDog: filteredTable }, () => {
      this.updateCurrentItems();
    });
  }
  handleSearchInputChange = (e) => {
    const searchTerm = e.target.value;
    console.log(searchTerm,"searcg==========")
    this.setState({ searchTerm }, () => {
      this.updateWithSearchTerm(searchTerm);
    });
  };

  handlePageChange = (pageNumber) => {
    this.setState({ activePage: pageNumber }, () => {
      this.updateCurrentItems();
    });
  };

 

  updateCurrentItems() {
    const { itemsPerPage, filteredWatchDog, activePage,searchTerm,watchDogData } = this.state;
  
    const totalItems = filteredWatchDog.length;
  
    let updatedActivePage = activePage;
    if (totalItems === 0) {
      updatedActivePage = 1; // Ensure the active page is at least 1 when there are no items
    } else {
      updatedActivePage = Math.min(activePage, Math.ceil(totalItems / itemsPerPage));
    }
  
    const indexOfLastItem = updatedActivePage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredWatchDog.slice(
      indexOfFirstItem,
      indexOfLastItem
    );
  
    console.log(currentItems, "current Items");
    this.setState({ currentItems, activePage: updatedActivePage });
    
  }

  toggleDarkMode = () => {
    console.log("innetw");
    this.setState((prevState) => ({ isDarkMode: !prevState.isDarkMode }));
  };
  render() {
    const { isDarkMode } = this.state;
    const lightTheme = createTheme({
      palette: {
        background: {
          // default: '#f4f7fe',
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
      isOpen,
      activePage,
      itemsPerPage,
      filteredWatchDog,
      showImages,
      showDownloadImages,
      showSystemUpdateDetails,
      currentItems,
      showWatchdog,
      showSoftware,
    } = this.state;
    const { installing, progress, searchTerm } = this.state;
    if (this.state.softwareUpdateData) {
      if (this.state.softwareUpdateData["system-update-details"]) {
        var softwareVersionDetails =
          this.state.softwareUpdateData["system-update-details"].state;
      }
    }
    return (
     
        <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
        <div style={{height:"100vh",overflow:"hidden"}}  className={isDarkMode ? 'dark-mode' : 'light-mode'}>
            <div style={{ backgroundColor: isDarkMode ? darkTheme.palette.background.default : lightTheme.palette.background.default }}>
            <div style={{display:'flex'}}>
            <NewLeftpanel page='software' darkMode={this.state.isDarkMode}/>
            <div style={{flex:'4',marginLeft:"18%"}}>
                <div  style={{backgroundColor: isDarkMode ? darkTheme.palette.background.default : lightTheme.palette.background.default}}>
                    <NewHeader header_name='Software Panel' path='Dashboard' darkMode={this.state.isDarkMode} toggleDarkMode={this.toggleDarkMode}/>
                </div>
                <div
                  className="mainContent"
                  style={{height:"80vh",overflow:"auto"}}
                >
                  {!showSoftware && !showWatchdog ? (
                    <div style={{ display: "flex" }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          flexDirection: "column",
                          alignItems: "center",
                          marginLeft: "50px",
                        }}
                      >
                        <div
                          className="configBoxes"
                          onClick={() => {
                            this.setState({
                              mainContent: false,
                              subHead: "Software Update",
                              showSoftware: true,
                            });
                            this.fetchStoredImages();
                          }}
                        >
                          <img
                            alt=""
                            className="configGear"
                            src={require("../Images/softwareupdate.png")}
                          ></img>
                        </div>
                        <div className="nameConfig">Software Update</div>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          flexDirection: "column",
                          alignItems: "center",
                          marginLeft: "50px",
                        }}
                      >
                        <div
                          className="configBoxes"
                          onClick={() => {
                            this.setState({
                              mainContent: false,
                              subHead: "Watchdog",
                              showWatchdog: true,
                            });
                            this.fetchWatchdog();
                          }}
                        >
                          <img
                            alt=""
                            className="configGear"
                            src={require("../Images/watchdog.png")}
                          ></img>
                        </div>
                        <div className="nameConfig">Watchdog</div>
                      </div>
                    </div>
                  ) : null}

                  {this.state.showWatchdog && this.state.getData ? (
                    <div style={{ marginBottom: "2%" }}>
                      <div style={{marginBottom: "0.5rem"}}
                        onClick={() => this.setState({ showWatchdog: false })}
                      >
                        <img src={backButton} alt="" width={20} />
                      </div>
                      <div className="watchdogsearch" style={{ display: "flex", marginBottom: "1%" ,justifyContent:"space-between"}}>
                        <div
                          className="tabbox1"
                        >
                          <img
                            alt=""
                            className="tabicon"
                            src={require("../Images/alarmList.png")}
                          ></img>
                          Watchdog Status
                          <div class="btn" style={{ marginTop: "-2.9%" }}>
                            <label style={{ cursor: "pointer" }}>
                              <input
                                className="inputWatch"
                                type="checkbox"
                                onClick={(e) =>
                                  this.postWatchDog("watchdog status")
                                }
                              />
                              {this.state.getData ? (
                                this.state.getData["ipi-watchdog:watchdog"][
                                  "software-modules"
                                ]["watchdog-status"] === "enabled" ? (
                                  <Tooltip title="Click to Disable">
                                    <div className="enabledButton">Enabled</div>
                                  </Tooltip>
                                ) : (
                                  <Tooltip title="Click to Enable">
                                    <div className="disabledButton">
                                      Disabled
                                    </div>
                                  </Tooltip>
                                )
                              ) : null}
                            </label>
                          </div>
                        </div>

                        <div style={{display:"flex",gap:"2%"}}>
                          <div
                            class="input-group"
                          >
                            <input
                              type="search"
                              class="form-control rounded"
                              placeholder="Search"
                              aria-label="Search"
                              aria-describedby="search-addon"
                              value={searchTerm}
                              onChange={(event) => {
                                this.handleSearchInputChange(event);
                              }}
                            />
                          </div>
                          <div
                            className="tabbox1"
                            onClick={(e) =>
                              this.setState((prevState) => ({
                                openFilterPopup: !prevState.openFilterPopup,
                              }))
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
                            className="tabbox1"
                            onClick={this.toggleDropdown}
                            ref={(ref) => (this.dropdownRef = ref)}
                          >
                            <img
                              alt=""
                              className="tabicon"
                              src={require("../Images/report.png")}
                            ></img>
                            Report
                            
                          </div>
                        </div>
                      </div>

                      {isOpen ? (
                        <div
                          className="downloadOptions"
                          style={{marginTop:"-1%",right:"3%"}}
                        >
                          <div
                            className="optionsBox"
                            onClick={(e) => {
                              this.setState({ showReportOptions: false });
                              this.exportPDF();
                            }}
                          >
                            <img
                              alt=""
                              className="tabicon"
                              src={require("../Images/pdf.png")}
                            ></img>
                            Watchdog PDF List
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
                                Watchdog CSV List
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
                              Watchdog CSV List
                            </div>
                          )}
                        </div>
                      ) : null}

                      {this.state.openFilterPopup ? (
                        <div
                          className="filterpopup"
                          style={{ marginBottom: "2%" }}
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
                                style={{ marginLeft: "15%" }}
                              >
                                Process Status
                              </div>
                              <div
                                style={{
                                  display: "flex",
                                  marginTop: "7%",
                                  marginLeft: "15%",
                                }}
                              >
                                <div
                                  className="severitybutton"
                                  style={
                                    this.state.selectedRunningFilters.includes(
                                      "RUNNING"
                                    )
                                      ? this.state.selectedSeverityFilter
                                      : null
                                  }
                                  onClick={(e) => {
                                    const filters = [
                                      ...this.state.selectedRunningFilters,
                                    ];
                                    const index = filters.indexOf("RUNNING");
                                    if (index !== -1) {
                                      filters.splice(index, 1);
                                    } else {
                                      filters.push("RUNNING");
                                    }
                                    this.setState({
                                      selectedRunningFilters: filters,
                                    });
                                  }}
                                >
                                  RUNNING
                                </div>
                                <div
                                  className="severitybutton"
                                  style={
                                    this.state.selectedRunningFilters.includes(
                                      "NOT RUNNING"
                                    )
                                      ? this.state.selectedSeverityFilter
                                      : null
                                  }
                                  onClick={(e) => {
                                    const filters = [
                                      ...this.state.selectedRunningFilters,
                                    ];
                                    const index =
                                      filters.indexOf("NOT RUNNING");
                                    if (index !== -1) {
                                      filters.splice(index, 1);
                                    } else {
                                      filters.push("NOT RUNNING");
                                    }
                                    this.setState({
                                      selectedRunningFilters: filters,
                                    });
                                  }}
                                >
                                  NOT RUNNING
                                </div>
                              </div>
                            </div>
                            <div
                              className="vertiline"
                              style={{ marginRight: "3%", marginLeft: "7%" }}
                            ></div>
                            <div style={{ width: "22%" }}>
                              <div className="filterpopupHeader">
                                Process Name
                              </div>
                              <div
                                style={{ height: "100px", overflowY: "scroll" }}
                              >
                                <div
                                  className="list-container"
                                  style={{
                                    display: "flex",
                                    flexWrap: "wrap",
                                    width: "100%",
                                  }}
                                >
                                  {this.state.processNameAvailable.map(
                                    (item, index) => (
                                      <div key={index} style={{ width: "50%" }}>
                                        <input
                                          style={{
                                            marginLeft: "",
                                            height: "10px",
                                          }}
                                          value={item}
                                          checked={this.state.checked.includes(
                                            item
                                          )}
                                          type="checkbox"
                                          onChange={(e) => this.handleCheck(e)}
                                        />
                                        <span
                                          style={{
                                            fontSize: "smaller",
                                            marginLeft: "",
                                          }}
                                        >
                                          {item}
                                        </span>
                                      </div>
                                    )
                                  )}
                                </div>
                              </div>
                            </div>
                            <div
                              className="vertiline"
                              style={{ marginRight: "3%", marginLeft: "4%" }}
                            ></div>
                            <div style={{ marginLeft: "-2%" }}>
                              <div className="filterpopupHeader">
                                Start-time
                              </div>
                              <div style={{ display: "flex" }}>
                                <div>
                                  <div style={{ fontSize: "small" }}>
                                    Select Begin Time:
                                  </div>
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
                                <div style={{ marginLeft: "3%" }}>
                                  <div style={{ fontSize: "small" }}>
                                    Select End Time:
                                  </div>
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
                                <div
                                  className="applyResetBox"
                                  style={{ marginRight: "47px" }}
                                >
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
                                  <div
                                    className="btn btn-primary mb3"
                                    style={{ marginLeft: "3%" }}
                                    onClick={(e) => {
                                      this.filterWatchdog();
                                    }}
                                  >
                                    Apply
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : null}

                      <div className="watchdogtablecontent" style={{ paddingBottom: "30px" }}>
                        <table className="user_table">
                          <thead id="panels" className="user_table_head">
                            <tr
                              style={{
                                backgroundColor: "#e5e8ff",
                                color: "black",
                              }}
                            >
                              <th>S No</th>
                              <th
                                onClick={() => this.sortTable("name")}
                                style={
                                  this.state.selectedthSort &&
                                  this.state.selectedthSort === "name"
                                    ? this.state.fixthHead
                                    : { cursor: "pointer" }
                                }
                              >
                                Process name
                                <img
                                  alt=""
                                  style={{
                                    marginLeft: "8px",
                                    marginTop: "3px",
                                  }}
                                  src={
                                    this.state.selectedthSort === "name" &&
                                    this.state.sortOrder === "asc"
                                      ? sortUp
                                      : sortDown
                                  }
                                  width={10}
                                />
                              </th>
                              <th
                                onClick={() => this.sortTable("down-reason")}
                                style={
                                  this.state.selectedthSort &&
                                  this.state.selectedthSort === "down-reason"
                                    ? this.state.fixthHead
                                    : { cursor: "pointer" }
                                }
                              >
                                Down reason
                                <img
                                  alt=""
                                  style={{
                                    marginLeft: "8px",
                                    marginTop: "3px",
                                  }}
                                  src={
                                    this.state.selectedthSort ===
                                      "down-reason" &&
                                    this.state.sortOrder === "asc"
                                      ? sortUp
                                      : sortDown
                                  }
                                  width={10}
                                />
                              </th>
                              <th
                                onClick={() => this.sortTable("process-status")}
                                style={
                                  this.state.selectedthSort &&
                                  this.state.selectedthSort === "process-status"
                                    ? this.state.fixthHead
                                    : { cursor: "pointer" }
                                }
                              >
                                Process Status
                                <img
                                  alt=""
                                  style={{
                                    marginLeft: "8px",
                                    marginTop: "3px",
                                  }}
                                  src={
                                    this.state.selectedthSort ===
                                      "process-status" &&
                                    this.state.sortOrder === "asc"
                                      ? sortUp
                                      : sortDown
                                  }
                                  width={10}
                                />
                              </th>
                              <th
                                onClick={() => this.sortTable("start-time")}
                                style={
                                  this.state.selectedthSort &&
                                  this.state.selectedthSort === "start-time"
                                    ? this.state.fixthHead
                                    : { cursor: "pointer" }
                                }
                              >
                                Start-time
                                <img
                                  alt=""
                                  style={{
                                    marginLeft: "8px",
                                    marginTop: "3px",
                                  }}
                                  src={
                                    this.state.selectedthSort ===
                                      "start-time" &&
                                    this.state.sortOrder === "asc"
                                      ? sortUp
                                      : sortDown
                                  }
                                  width={10}
                                />
                              </th>
                              <th style={{ width: "10px" }}></th>
                            </tr>
                          </thead>
                          {currentItems &&
                            currentItems.map((item, index) => (
                              <tbody key={index}>
                                <tr>
                                  <td>{index + 1}</td>
                                  <td>{item.name}</td>
                                  <td>{item.process.state["down-reason"]}</td>
                                  <td>
                                    {item.process.state["process-status"]}
                                  </td>
                                  <td>{item.process.state["start-time"]}</td>
                                  <Tooltip
                                    title={
                                      item.state &&
                                      JSON.stringify(
                                        item.state[
                                          "module-watchdog-status-disabled"
                                        ]
                                      ) === "[null]"
                                        ? "click to enable"
                                        : "click to disable"
                                    }
                                  >
                                    <td
                                      onClick={() =>
                                        this.postWatchDog(
                                          "componentPost",
                                          item.name,
                                          index
                                        )
                                      }
                                    >
                                      <img
                                        alt=""
                                        width={20}
                                        src={
                                          item.state &&
                                          JSON.stringify(
                                            item.state[
                                              "module-watchdog-status-disabled"
                                            ]
                                          ) === "[null]"
                                            ? disabled
                                            : enabled
                                        }
                                      />
                                    </td>
                                  </Tooltip>
                                </tr>
                              </tbody>
                            ))}
                        </table>
                        <div></div>
                        <Pagination
                          activePage={activePage}
                          itemsCountPerPage={itemsPerPage}
                          totalItemsCount={filteredWatchDog.length}
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
                    </div>
                  ) : null}

                  {this.state.showSoftware ? (
                    <div>
                      <div
                        onClick={() => this.setState({ showSoftware: false })}
                      >
                        <img src={backButton} alt="" width={20} />
                      </div>
                      <div className="mainSoftware" style={{display:"flex"}}
                        
                      >
                        <div
                          className="softwareTabs"
                          style={
                            showImages ? this.state.selectedSoftwareTab : null
                          }
                          onClick={() => this.handleSoftwareTabSwitch("image")}
                        >
                          <img
                            alt=""
                            className="tabicon1"
                            src={require("../Images/monitoring.png")}
                          ></img>
                          Locally Stored Images
                        </div>
                        <div
                          className="softwareTabs"
                          style={
                            showSystemUpdateDetails
                              ? this.state.selectedSoftwareTab
                              : null
                          }
                          onClick={() => this.handleSoftwareTabSwitch("update")}
                        >
                          <img
                            alt=""
                            className="tabicon1"
                            src={require("../Images/gear.png")}
                          ></img>
                          System Update Details
                        </div>
                        <div
                          className="softwareTabs"
                          style={
                            showDownloadImages
                              ? this.state.selectedSoftwareTab
                              : null
                          }
                          onClick={() =>
                            this.handleSoftwareTabSwitch("download")
                          }
                        >
                          <img
                            alt=""
                            className="tabicon1"
                            src={require("../Images/packaging.png")}
                          ></img>
                          Download Images
                        </div>
                        <div
                          className="softwareTabs"
                          // onClick={(e)=>this.postData('','sys-update-uninstall')}
                        >
                          <img
                            alt=""
                            className="tabicon1"
                            src={require("../Images/error.png")}
                          ></img>
                          System Update Uninstall
                        </div>
                      </div>

                      {showImages && this.state.imageList ? (
                        <div
                          className="imagesTable">
                          <table className="user_table">
                            <thead id="panels" className="user_table_head">
                              <tr
                                style={{
                                  backgroundColor: "#e5e8ff",
                                  color: "black",
                                }}
                              >
                                <th>Images</th>
                                <th></th>
                                <th></th>
                              </tr>
                            </thead>
                            <tbody>
                              {this.state.imageList.map((item, index) => (
                                <tr>
                                  <td>{item.name}</td>
                                  <td>
                                    <div
                                      className={
                                        installing ? "btn-progress" : "btn1"
                                      }
                                      onClick={() =>
                                        this.handleClick(item.name)
                                      }
                                    >
                                      {installing ? (
                                        <>
                                          <div
                                            className="install-progress"
                                            style={{ width: `${progress}%` }}
                                          ></div>
                                          <div className="install-text">
                                            {progress}%
                                          </div>
                                        </>
                                      ) : (
                                        "Install Now"
                                      )}
                                    </div>
                                  </td>
                                  <td>
                                    <div
                                      class="btndel"
                                      onClick={() =>
                                        this.postData(
                                          item.name,
                                          "sys-update-delete"
                                        )
                                      }
                                    >
                                      Delete
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : null}
                      {showSystemUpdateDetails && softwareVersionDetails ? (
                        <div className="system-update-details">
                          <div className="system-update-header">
                            System Update Details
                          </div>
                          <div style={{ margin: "10px", marginLeft: "20px" }}>
                            <div style={{ display: "flex" }}>
                              <div className="system-update-header-key">
                                Auto Rollback End Time:
                              </div>
                              <div>
                                {
                                  softwareVersionDetails["current-version"][
                                    "auto-rollback-end-time"
                                  ]
                                }
                              </div>
                            </div>
                            <div style={{ display: "flex" }}>
                              <div className="system-update-header-key">
                                Current Version:
                              </div>
                              <div>
                                {softwareVersionDetails["current-version"]
                                  .split(" ")
                                  .slice(1)
                                  .join(" ")}
                              </div>
                            </div>
                            <div style={{ display: "flex" }}>
                              <div className="system-update-header-key">
                                Last Upgraded Time:
                              </div>
                              <div>
                                {softwareVersionDetails["last-upgraded-time"]
                                  .split(" ")
                                  .slice(1)
                                  .join(" ")}
                              </div>
                            </div>
                            <div style={{ display: "flex" }}>
                              <div className="system-update-header-key">
                                Previous Version:
                              </div>
                              <div>
                                {softwareVersionDetails["previous-version"]
                                  .split(" ")
                                  .slice(1)
                                  .join(" ")}
                              </div>
                              /
                            </div>
                          </div>
                        </div>
                      ) : null}
                      {showDownloadImages ? (
                        <div className="system-update-details">
                          <div className="system-update-header">
                            System Update Get
                          </div>
                          <div style={{ margin: "10px" }}>
                            <div
                              style={{ marginLeft: "20px", display: "flex" }}
                            >
                              <div>
                                <div style={{ marginTop: "2%" }}>
                                  <div
                                    style={{ display: "flex", margin: "1%" }}
                                  >
                                    <div className="system-update-header-key">
                                      Source Interface:
                                    </div>
                                    <input
                                      type="text"
                                      className="isis-config-module-input"
                                      value={this.state.sourceValue}
                                      onChange={(e) =>
                                        this.handleChange(e, "source")
                                      }
                                    />
                                  </div>
                                  <div
                                    style={{ display: "flex", margin: "1%" }}
                                  >
                                    <div className="system-update-header-key">
                                      URL:
                                    </div>
                                    <input
                                      type="text"
                                      className="isis-config-module-input"
                                      value={this.state.urlValue}
                                      onChange={(e) =>
                                        this.handleChange(e, "url")
                                      }
                                    />
                                  </div>
                                </div>
                                {this.state.showSecondAdd ? (
                                  <div
                                    style={{
                                      display: "flex",
                                      justifyContent: "center",
                                      alignContent: "center",
                                      flexDirection: "column",
                                      width: "164%",
                                      height: "156px",
                                    }}
                                  >
                                    <div
                                      className="cancelRole"
                                      style={{ marginTop: "9%", width: "30%" }}
                                      onClick={(e) =>
                                        this.postData(
                                          "cancel",
                                          "sys-update-cancel-download"
                                        )
                                      }
                                    >
                                      Cancel Download
                                    </div>
                                  </div>
                                ) : (
                                  <div
                                    className="cancelRole"
                                    style={{ marginTop: "9%", width: "30%" }}
                                    onClick={(e) =>
                                      this.postData(
                                        "get",
                                        "sys-update-get",
                                        this.state.sourceValue,
                                        this.state.urlValue
                                      )
                                    }
                                  >
                                    Confirm
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                
            </div>
            </div>
            </div>
        </div>
    </div>
    </ThemeProvider>
    );
  }
}
export default SoftwarePanel;
