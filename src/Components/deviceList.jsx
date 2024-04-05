import React from "react";
import axios from "axios";
import TextField from "@mui/material/TextField";
import Loading from "../Components/loader";
import garbage from "../Images/garbage.png";
import swal from "sweetalert2";
import edit from "../Images/edit.png";
import Upload from "../Components/uploadFile";
import saveConfig from "../Images/save-guard.png";
import "leaflet/dist/leaflet.css";
import "react-dropdown/style.css";
import { PageItem as BootstrapPageItem, Tooltip } from "react-bootstrap";
import Pagination from "react-js-pagination";
import jsPDF from "jspdf";
import placeholder from "../Images/placeholder.png";
import "bootstrap/dist/css/bootstrap.min.css";
import filter from "../Images/filter.png";
import sortAsc from "../Images/sorting.png";
import sortDesc from "../Images/sorting_up.png";
import close from "../Images/closeS.png"
import { CSVLink } from "react-csv";
import enabled from "../Images/power-on.png";
import disabled from "../Images/power-off.png";
import AddNewDeviceForm from "./addNewDevice";
class DeviceListPanel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      getWhitelist:null,
      selectedInventoryType:"deviceList",
      isDarkMode: false,
      activePage: 1,
      itemsPerPage: 5,
      selectedDevicesToCompare: [],
      loggedInUserRole: "",
      showUploadCsv: false,
      selectedTabPanel: { background: "#e8ebf1", borderTopLeftRadius: "12px" },
      userRole: null,
      is_fetching: false,
      inventory: null,
      serverIP: process.env.REACT_APP_CLIENT_IP,
      device_id: null,
      hold_alarms: null,
      tab_disabled: true,
      get_alarms: null,
      show_filter_popup: false,
      filter_by_key: null,
      openEditWhitelist: false,
      openEditDevicelist: false,
      connection_state: { backgroundColor: "#b13939" },
      user_state_name: false,
      item_sites_name: null,
      item_cluster_name: null,
      fade_content: { opacity: "0.1" },
      deviceGet: [],
      selectedDeviceList: [],
      show_delete_confirmation_popup: false,
      to_delete_device_id: null,
      errormsgMail: null,
      connection_response: null,
      state_change: true,
      clusters: null,
      isToggled:false,
      sites: null,
      routerDetails: null,
      showSingle: true,
      showSingleWhiteListAdd: true,
      get_network_element_info: null,
      showAddDeviceTab: false,
      devicesForGet: [],
      deviceGetDelete: [],
      showDiscoveryTab: false,
      enter_cluster_name: "",
      enter_site_name: "",
      device_name: null,
      port: null,
      ip_add: null,
      errormsgPort: null,
      device_add_response: null,
      device_remove_response: null,
      username: "",
      password: "",
      isLoading: true,
      openDrop: null,
      set_flag: false,
      showThreshold: false,
      openAddWhitelist: false,
      selectedInterface: [],
      clickedCoords: null,
      showStats: false,
      showLspStats: false,
      errormsg: null,
      showConfigurationComparator: null,
      templateList: null,
      connectedDevices: null,
      compareMulti: false,
      validIPState: false,
      GoldenTemplateSelectDevice: false,
      TemplateName: null,
      TemplateList: null,
      checked: [],
      templateDetails: null,
      openTemplateList: false,
      selectedTemplateId: null,
      openTemplateTab: false,
      TemplateJsonData: null,
      selectedFile: null,
      showFileDetails: false,
      templateUploadResponse: null,
      errormsgGoldTemp: null,
      errormsgBulkConfig: null,
      checkedDevices: [],
      selectedKeyType: null,
      device_type: null,
      toEditDeviceType: null,     
      openSelectDeviceList: false,
      showBlockSites: {},
      showBlockDevice: {},
      generateReport: false,
      deviceId: null,
      jsonData: "",
      jsonData2: "",
      selectedKey: "",
      content: null,
      firstType: null,
      firstContent: null,
      secondType: null,
      secondContent: null,
      options: [
        "network-admin",
        "network-engineer",
        "network-operator",
        "network-user",
      ],
      errormsgIP: "*required",
      errormsgCluster: "*required",
      errormsgSite: "*required",
      errormsgIP_add: "*required",
      errormsgName: "*required",
      errormsgTemplateInput: null,
      showDeviceList: true,
      openFilters: {},
      filterOptions: {
        device_name: [],
        device_type: [],
        site_name: [],
        cluster_name: [],
        circle:[],
        ip_add: [],
        port: [],
        role: [],
        ConnectionStatus: [],
        username: [],
        circle:[],
      },
      checkedOptions: [],
      showTopologyTab: false,
      showGoldenTemplateTab:false,
      allDevices:null,
    };
    this.get_device_list = this.get_device_list.bind(this);
    this.redirect_main_page = this.redirect_main_page.bind(this);
    this.remove_device = this.remove_device.bind(this);
    this.openFilterTab = this.openFilterTab.bind(this);
  }

  componentDidMount() {
    sessionStorage.setItem("Connection", false);
    let role = sessionStorage.getItem("role_id");
    this.setState({ loggedInUserRole: role });
    console.log(role, "user role");
    if (role === "NETWORK-ADMIN") {
      this.setState({ user_state_name: false });
    } else {
      this.setState({ user_state_name: true });
    }
    this.get_device_list();
    this.getWhitelist();
  }

  handlePageChange = (pageNumber) => {
    this.setState({ activePage: pageNumber });
  };

  get_device_list() {
    fetch( `http://${this.state.serverIP}:5005/inventory-management/device-list`,
      {
        mode: "cors",
        method: "GET",
        headers: {
          "Access-Control-Allow-Origin": "http://localhost:3000",
          "Access-Control-Request-Headers": "http://localhost:3000",
          Accept: "application/json",
          username: sessionStorage.getItem("username"),
          "Content-Type": "application/json",
          Authorization:"Bearer " + JSON.parse(sessionStorage.getItem("login_data")).data.access_token,
        },
      }
    )
      .then((resp) => resp.json())
      .then((resp) => {
        this.setState({ isLoading: false, tab_disabled: false });
        this.setState({get_network_element_info: resp,clusters: resp.clusters,sites: resp.sites});
        var role = this.state.loggedInUserRole.toLowerCase();
        let filteredDeviceListWithRole;
        let openDrop = [];
        const { filterOptions } = this.state;
        var temp = [];
        var newList=[];
        for (let i = 0; i < resp.devices.length; i++) {
          openDrop.push(false);
          newList.push(resp.devices[i].unique_id)
          if (resp.devices[i].ConnectionStatus) {
            temp.push(resp.devices[i].unique_id);
          }
        }
        sessionStorage.setItem("connectedDeviceList", temp);
        this.setState({ openDrop: openDrop, connectedDevices: temp,allDevices:newList });
        console.log(resp.devices);
        if (role === "network-admin") {
          filteredDeviceListWithRole = resp.devices;
        } else if (role === "network-engineer") {
          filteredDeviceListWithRole = resp.devices.filter((device) => device.role !== "network-admin");
        } else if (role === "network-operator") {
          filteredDeviceListWithRole = resp.devices.filter((device) => device.role !== "network-admin" && device.role !== "network-engineer" );
        } else if (role === "network-user") {
          filteredDeviceListWithRole = resp.devices.filter((device) => device.role === "network-user");
        }

        if (filteredDeviceListWithRole.length > 0) {
          this.setState({ routerDetails: filteredDeviceListWithRole, staticDeviceList: filteredDeviceListWithRole }, 
            () => {
              const devices = this.state.routerDetails;
              ["device_name", "ip_add","device_type","role","port", "ConnectionStatus", "username","site_name","cluster_name",'circle' ].forEach((key) => {
                if (key === "ConnectionStatus") {
                  filterOptions[key] = [true, false];
                } else {
                  filterOptions[key] = Array.from( new Set(devices.map((device) => device[key])) );
                }
              });
            }
          );
          var devicelistheaders = [
            {
              label: "Device Name",
              key: "device_name",
            },
            { label: "IP", key: "ip_add" },
            { label: "Port", key: "port" },
            { label: "Device Type", key: "device_type" },
            { label: "Circle", key: "circle" },
            { label: "Site Name", key: "site_name" },
            { label: "Cluster Name", key: "cluster_name" },
            { label: "UserName", key: "username" },
            { label: "Role", key: "role" },


           
          ];
          var devices = [];
  
          for (let i = 0; i < this.state.routerDetails.length; i++) {
            let headerDict = {};
            headerDict = {
              device_name:this.state.routerDetails[i]["device_name"],
              ip_add: this.state.routerDetails[i]["ip_add"],
              port: this.state.routerDetails[i]["port"],
              device_type: this.state.routerDetails[i]["device_type"],
              site_name: this.state.routerDetails[i]["site_name"],
              cluster_name: this.state.routerDetails[i]["cluster_name"],
              circle:this.state.routerDetails[i]['circle'],
              username: this.state.routerDetails[i]["username"],
              role: this.state.routerDetails[i]["role"],

            
            };
            devices.push(headerDict);
          }
          this.setState({
            csvReport: {
              data: devices,
              headers: devicelistheaders,
              filename: "devicelist.csv",
            },
          });
        } else {
          this.setState({ clusters: null, sites: null });
        }
        this.setState({ filterOptions });
        const arrayString = JSON.stringify(resp.devices);
        const cluster = JSON.stringify(resp.clusters);
        sessionStorage.setItem("ListDevice", arrayString);
        sessionStorage.setItem("ClusterDevice", cluster);
        sessionStorage.setItem("clusterCount", resp.clusters.length);
        sessionStorage.setItem("deviceCount", resp.devices.length);
      })
      .catch((err) => {
        if (err.response) {
          // Handle responses with status codes like 403
          console.log("Error Response Data:", err.response.data);
          console.log("Error Response Status:", err.response.status);
          console.log("Error Response Headers:", err.response.headers);

          // Try to parse the response body as JSON
          err.response
            .json()
            .then((responseData) => {
              console.log("Error Response Message:", responseData.message);
              alert(responseData.message); // Show error message to the user
            })
            .catch((jsonError) => {
              console.error("Error parsing JSON response:", jsonError);
              alert("Error parsing JSON response.");
            });
        } else {
          // Handle network errors
          console.error("Network Error:", err.message); // Log the error for debugging
        }
      });
  }

  getWhitelist() {
    fetch(`http://${this.state.serverIP}:5005/inventory-management/whitelist`, {
      mode: "cors",
      method: "GET",
      headers: {
        "Access-Control-Allow-Origin": "http://localhost:3000",
        username: sessionStorage.getItem("username"),
        Authorization:
          "Bearer " +
          JSON.parse(sessionStorage.getItem("login_data")).data.access_token,
      },
    })
      .then((resp) => resp.json())
      .then((resp) => {
        console.log(resp)
        this.setState({ getWhitelist: resp, whitelist_for_filter:resp });
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

  exportNetworkListPDF = () => {
    const { get_network_element_info } = this.state;
    var currentTime = new Date().toLocaleString().replace(/:/g, "-");
    if (
      get_network_element_info &&
      get_network_element_info["clusters"].length > 0
    ) {
      const unit = "pt";
      const size = "A4";
      const orientation = "portrait";
      const marginLeft = 40;
      const doc = new jsPDF(orientation, unit, size);
      doc.setFontSize(15);
      const title = "Network Inventory Report";
      const subtitle1 = "Clusters";
      const subtitleFontSize1 = 12;
      const headers1 = [["Connected Devices", "Cluster name", "No.of Devices"]];
      var data1 = get_network_element_info.clusters.map((elt) => [
        elt["connected_devices"],
        elt["name"],
        elt["no_of_devices"],
      ]);

      let content1 = {
        startY: 70,
        head: headers1,
        body: data1,
      };
      const subtitle2 = "Sites";
      const subtitleFontSize2 = 12;
      const headers2 = [
        ["Cluster name", "Connected Devices", "Site name", "No.of Devices"],
      ];
      var data2 = get_network_element_info.sites.map((elt) => [
        elt["cluster_name"],
        elt["connected_devices"],
        elt["name"],
        elt["no_of_devices"],
      ]);

      doc.text(title, marginLeft, 40);
      doc.setFontSize(subtitleFontSize1);
      doc.text(subtitle1, marginLeft, 60);
      doc.setFontSize(15);
      doc.autoTable(content1);

      const table1Height = doc.lastAutoTable.finalY;
      const spacingBetweenTables = 30;
      const table2StartY = table1Height + spacingBetweenTables;

      let content2 = {
        startY: table2StartY,
        head: headers2,
        body: data2,
      };
      const subtitle3 = "Devices"; // Add your second subtitle here
      const subtitleFontSize3 = 12; // You can adjust the font size for the second subtitle
      const headers3 = [[ "Device name","Connection Status", "Cluster Name","Site name","IP Address","Port" ]];
      var data3 = get_network_element_info.devices.map((elt2) => [
        elt2["device_name"],
        elt2["ConnectionStatus"],
        elt2["cluster_name"],
        elt2["site_name"],
        elt2["ip_add"],
        elt2["port"].toString(),
      ]);

      doc.setFontSize(subtitleFontSize2);
      doc.text(subtitle2, marginLeft, doc.lastAutoTable.finalY + 20); // Add spacing below the second title
      doc.setFontSize(15); // Reset font size to the default (optional)
      doc.autoTable(content2);
      const table2Height = doc.lastAutoTable.finalY;
      const table3StartY = table2Height + spacingBetweenTables;

      let content3 = {
        startY: table3StartY, // Start the second table below the first one
        head: headers3,
        body: data3,
      };
      doc.setFontSize(subtitleFontSize3);
      doc.text(subtitle3, marginLeft, doc.lastAutoTable.finalY + 20); // Add spacing below the second title
      doc.setFontSize(15); // Reset font size to the default (optional)
      doc.autoTable(content3);
      doc.save(`Network-inventory-report ${currentTime}.pdf`);
    } else {
      alert("No data available");
    }
  };

  settoupdateDeviceList(e,id,ip,name,cluster,site,port,connectStatus,role) {
    this.setState({
      DEVICEID: id,
      toEditdeviceIP: ip,
      toEditdeviceName: name,
      toEditdevicePort: port,
      toEditdeviceCluster: cluster,
      toEditdeviceSite: site,
      toEditRole: role,
    });
    this.setState({ openEditDevicelist: true });
    e.stopPropagation();
  }

  updateDevicelist() {
    this.setState({ is_fetching: true, openEditDevicelist: false });
    var dict = {};
    var id = this.state.DEVICEID;
    dict["ip_add"] = this.state.toEditdeviceIP;
    dict["device_name"] = this.state.toEditdeviceName;
    dict["port"] = this.state.toEditdevicePort;
    dict["cluster_name"] = this.state.toEditdeviceCluster;
    dict["site_name"] = this.state.toEditdeviceSite;
    dict["username"] = this.state.toEditUserName;
    dict["password"] = this.state.toEditPassword;
    dict["role"] = this.state.userRole;
    console.log(dict, "toedit");
    fetch(`http://${this.state.serverIP}:5005/inventory-management/update-device/${id}`,
      {
        method: "PATCH",
        mode: "cors",
        headers: {
          "Access-Control-Allow-Origin": "http://localhost:3000",
          Accept: "application/json",
          "Content-Type": "application/json",
          username: sessionStorage.getItem("username"),
          Authorization: "Bearer " + JSON.parse(sessionStorage.getItem("login_data")).data.access_token,
        },
        body: JSON.stringify(dict),
      }
    )
      .then((resp) => resp.json())
      .then((resp) => {
        this.setState({ editdevicelistresp: resp, is_fetching: false });
        console.log(resp, "edit-device-list-resp");
        if (resp.status === "Device has been updated") {
          alert("device edited");
          this.get_device_list();
        }
        this.setState({
          openEditDevicelist: false,
          showUserVerificationTab1: false,
        });
      })
      .catch((err) => {
        this.setState({
          openEditDevicelist: false,
          showUserVerificationTab1: false,
        });
        if (err.response) {
          alert(err.response.data.status);
          console.log("Error Response Data:", err.response.data);
          console.log("Error Response Status:", err.response.status);
          console.log("Error Response Headers:", err.response.headers);
        }
        this.setState({ is_fetching: false });
      });
  }


  remove_device(e, id, name, connectionStatus) {
    this.setState({ show_delete_confirmation_popup: true });
      var device_id = id;
      this.setState({ item_sites_name: name });
      this.setState({ to_delete_device_id: device_id });
      e.stopPropagation();
  }

  remove_element_from_network() {
    this.setState({ show_delete_confirmation_popup: false });
    var temp_id = this.state.to_delete_device_id;
    console.log(temp_id);
    fetch(`http://${this.state.serverIP}:5005/inventory-management/remove-device/${temp_id}`,
      {
        method: "DELETE",
        mode: "cors",
        headers: {
          "Access-Control-Allow-Origin": "http://localhost:3000",
          Accept: "application/json",
          "Content-Type": "application/json",
          username: sessionStorage.getItem("username"),
          Authorization: "Bearer " +JSON.parse(sessionStorage.getItem("login_data")).data.access_token,
        },
        // body: JSON.stringify(dataobject)
      }
    )
      .then((resp) => resp.json())
      .then((resp) => {
        this.setState({ device_remove_response: resp.status });
        console.log(this.state.device_remove_response);
        console.log(resp);
        if (this.state.device_remove_response === "Device removed") {
          alert("Device removed from the network");
          this.get_device_list();
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
    this.setState({ to_delete_device_id: null });
  }

  redirect_main_page(id, name, status, coordinates) {
    if (status === true) {
      sessionStorage.setItem("Connection", true);
    }
    sessionStorage.setItem("unique_id", id);
    sessionStorage.setItem("status_lock", false);
    sessionStorage.setItem("device_name", name);
    sessionStorage.setItem("connection_status", status);
    sessionStorage.setItem("latitude", coordinates[0]);
    sessionStorage.setItem("longitude", coordinates[1]);
    this.setState({ user_state_name: true });
    window.location.href = `/dashboard/${sessionStorage.getItem("unique_id")}`;
    console.log(id);
  }
  
  validIP(ip) {
    let regexExp =
      /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/gi;
    console.log(regexExp.test(ip), "validation");
    this.setState({ validIPState: regexExp.test(ip) });
    return regexExp.test(ip);
  }

  containsOnlyLetters(input) {
    return /^[a-zA-Z\s]+$/.test(input);
  }

  containsOnlyNumbers(input) {
    // Check if the input contains only numeric characters
    return /^[0-9]+$/.test(input);
  }

  Reboot(e, id) {
    swal
      .fire({
        title: "",
        text: "Do You Want To Save Configurations?",
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: "Yes",
        cancelButtonText: "No",
        closeOnConfirm: true,
        closeOnCancel: true,
      })
      .then((result) => {
        if (result.isConfirmed) {
          var temp = {
            "sys-reload": {
              "save-config": "true",
              "@xmlns": "http://ipinfusion.com/ns/zebmcli",
            },
          };
        } else {
          temp = {
            "sys-reload": {
              "save-config": "false",
              "@xmlns": "http://ipinfusion.com/ns/zebmcli",
            },
          };
        }
        this.setState({ isLoading: true });
        console.log(temp);
        fetch(`http://${this.state.serverIP}:5000/configuration-management/bulk-software/sys-update-get/${id}`,
          {
            method: "POST",
            mode: "cors",
            headers: {
              "Access-Control-Allow-Origin": "http://localhost:3000",
              Accept: "application/json",
              "Content-Type": "application/json",
              username: sessionStorage.getItem("username"),
              Authorization: "Bearer " + JSON.parse(sessionStorage.getItem("login_data")).data.access_token,
            },
            body: JSON.stringify(temp),
          }
        )
          .then((resp) => resp.json())
          .then((resp) => {
            this.setState({ isLoading: false });
            console.log(resp);
            window.location.reload(true);
          })
          .catch((err) => {
            if (err.response) {
              alert(err.response.data.status);
              console.log("Error Response Data:", err.response.data);
              console.log("Error Response Status:", err.response.status);
              console.log("Error Response Headers:", err.response.headers);
            }
          });
      });
    e.stopPropagation();
  }
 
  openSaveConfiguration(e, id) {
    this.setState({ openSaveConfigPopup: true, saveConfigTemplateID: id });
    e.stopPropagation();
  }
 

  openDrop(e, index, leave) {
    let openDrop = [];
    for (let i = 0; i < this.state.routerDetails.length; i++) {
      openDrop.push(false);
    }
    if (leave === "leave") {
      this.setState({ openDrop: openDrop });
    } else {
      openDrop[index] = true;
      this.setState({ openDrop: openDrop });
    }
    e.stopPropagation();
  }
  
  confirmVerification(name, cname) {
    if (this.state.toEditdeviceName && this.state.toEditdevicePort) {
      this.updateDevicelist(name, cname);
    } else {
      this.setState({ errormsg: "*required" });
    }
  }

  openFilterTab(filterKey) {
    this.setState((prevState) => {
      const updatedOpenFilters = { ...prevState.openFilters };
      // Toggle the clicked filter key
      updatedOpenFilters[filterKey] = !updatedOpenFilters[filterKey];
      // Set all other keys to false
      for (const key in updatedOpenFilters) {
        if (key !== filterKey) {
          updatedOpenFilters[key] = false;
        }
      }
      return { openFilters: updatedOpenFilters };
    });
  }

  sortDeviceListTable = (e, key, sortOrder) => {
    const { routerDetails } = this.state;
    const sortedItems = routerDetails.slice(0); // Create a copy to avoid mutating the original data

    sortedItems.sort((a, b) => {
      const aValue = a[key];
      const bValue = b[key];

      if (sortOrder === "asc") {
        if (aValue < bValue) return -1;
        if (aValue > bValue) return 1;
      } else if (sortOrder === "desc") {
        if (aValue < bValue) return 1;
        if (aValue > bValue) return -1;
      }
      return 0;
    });
    this.setState({ routerDetails: sortedItems, sortColumn: key,sortDirection: sortOrder,selectedthSort: key});
  };

  handleCheckboxFoFilter = (option) => {
    const updatedCheckedOptions = [...this.state.checkedOptions];
    const optionIndex = updatedCheckedOptions.indexOf(option);
    if (optionIndex === -1) {
      updatedCheckedOptions.push(option);
    } else {
      updatedCheckedOptions.splice(optionIndex, 1);
    }
    this.setState({ checkedOptions: updatedCheckedOptions });
  };

  filterDeviceTable(option) {
    const { checkedOptions, staticDeviceList } = this.state;
    console.log(checkedOptions);
    var temp = this.state.routerDetails;
    if (option === "clear") {
      this.setState({ routerDetails: staticDeviceList });
    } else {
      if (checkedOptions.length === 0) {
        this.setState({ routerDetails: temp });
        return;
      }
      const filteredDevices = staticDeviceList.filter((device) => {
        return checkedOptions.includes(device[option]);
      });
      this.setState({ routerDetails: filteredDevices });
    }
  }

  downloadGroupedReport() {
    console.log("in");
    const { routerDetails } = this.state;
    var currentTime = new Date().toLocaleString().replace(/:/g, "-");
    const unit = "pt";
    const size = "A4"; // Use A1, A2, A3 or A4
    const orientation = "portrait"; // portrait or landscape
    const marginLeft = 40;
    const doc = new jsPDF(orientation, unit, size);
    doc.setFontSize(15);
    const title = "InventoryReport";
    const headers = [[ "Name", "IP", "Port","Type",'Circle',"Cluster","Site","Username","Role","Status", ]];
    var data = routerDetails.map((elt) => [elt.device_name,elt.ip_add,elt.port, elt.device_type,elt.site_name, elt.cluster_name,elt.username, elt.role, elt.ConnectionStatus ]);
    let content = {
      startY: 50,
      head: headers,
      body: data,
    };
    doc.text(title, marginLeft, 40);
    doc.autoTable(content);
    doc.save(`GroupedInventoryReport ${currentTime}.pdf`);
  }

  addToTemplateList() {
    var dict = {};
    dict["template_name"] = this.state.TemplateName;
    var unique_id = this.state.saveConfigTemplateID;
    if (this.state.TemplateName) {
      this.setState({is_fetching: true,errormsgTemplateInput: null,openSaveConfigPopup: false,});
      fetch( `http://${this.state.serverIP}:5000/configuration-management/save-config-as-template/${unique_id}`,
        {
          method: "POST",
          mode: "cors",
          headers: {
            "Access-Control-Allow-Origin": "http://localhost:3000",
            Accept: "application/json",
            "Content-Type": "application/json",
            username: sessionStorage.getItem("username"),
            Authorization:"Bearer " + JSON.parse(sessionStorage.getItem("login_data")).data.access_token,
          },
          body: JSON.stringify(dict),
        }
      )
        .then((resp) => resp.json())
        .then((resp) => {
          this.setState({ saveConfigTemplateResponse: resp });
          console.log(resp, "saveConfigTemplateResponse");
          this.setState({ is_fetching: false });
          if (resp.status) {
            alert(resp.status);
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
    } else {
      this.setState({ errormsgTemplateInput: "Please provide template name" });
    }
  }

  handleToggle = () => {
    this.setState(prevState => ({
        isToggled: !prevState.isToggled
    })); 
  }

  onFileChange = (e) => {
    const file = e.target.files[0]; // accesing file
    console.log(e.target.files);
    this.setState({ selectedFile: file }); // storing file
  };

  onFileUpload = () => {
    this.setState({is_fetching:true,showGoldenTemplateTab:false})
    if (this.state.selectedFile !== null) {
      const formData = new FormData();
      formData.append('file', this.state.selectedFile);
      console.log(...formData)
      axios.post(`http://${this.state.serverIP}:5000/configuration-management/upload-golden-template`, formData, {
        headers: {
          'Access-Control-Allow-Origin': 'http://localhost:3000',
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'username': sessionStorage.getItem('username'),
          'Authorization': 'Bearer ' + JSON.parse(sessionStorage.getItem('login_data')).data.access_token,
        }
      }).then(res => {
        console.log(res, 'golden template');
        const file_upload_response = res
        this.setState({ templateUploadResponse: file_upload_response ,is_fetching:false})
        if (res.data && res.data.status === "Golden template uploaded successfully") {
          swal.fire({
            title: 'Golden Template Updated',
            text: 'SUCCESS',
            width: 300,
            height: 40,
            color: 'green',
            icon: 'success',
          })
        }
        else {
          alert('FAILED')
        }
        this.setState({ popOpenGolden: false })
        this.fetchTemplateList()

      }).catch(err => {
        alert("Error");
        this.setState({ popOpenGolden: false })
      })
      this.setState({ showFileDetails: true })
    }
    else {
      this.setState({ errormsgGoldTemp: "*Please choose a file" })
    }
  };

  handleSearch = (e) => {
    var searchTerm=e.target.value;
    this.setState({searchTerm});
    this.updateWithSearchTerm(searchTerm );
  }

  updateWithSearchTerm(searchTerm) {
    const {staticDeviceList} = this.state;
    if (searchTerm === "") {
        this.setState({ routerDetails: staticDeviceList });
    } else {
      const arr=["device_name","device_type","ip_add","port","cluster_name","site_name","role","username","circle"]
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        const filteredTable = staticDeviceList.filter(user => {
            for (const key in user) {
              if(arr.includes(key) && typeof user[key] === 'string' && user[key].toLowerCase().includes(lowerCaseSearchTerm))
              {
                return true;
              }
            }
            return false;
        });
        this.setState({ routerDetails: filteredTable });
    }
  }
  
  toggleDropdown = () => {
    this.setState((prevState) => ({
      isOpen: !prevState.isOpen,
    }));
  };

  renderFilterTab(id){
   
  return ( <div className="filter-tab" style={{ display: this.state.openFilters[id] ? "block" : "none"}}>
        <div className="sortTab"  onClick={(e) =>this.sortDeviceListTable(e,id,"asc")}>                       
            <img src={sortAsc} alt="" width={15} />
            Sort By ASC
        </div>
        <div className="sortTab"  onClick={(e) =>this.sortDeviceListTable(e,id,"desc" )}>                                      
            <img src={sortDesc} alt="" width={15} />
            Sort By DESC
        </div>
        <div className="sortTabCheckBoxColumn">
          {this.state.filterOptions[id].map(
              (option, index) => (
              <div  key={index} style={{ display: "flex" }}>
                  <input type="checkbox" onClick={(e) => e.stopPropagation()}
                  checked={this.state.checkedOptions.includes( option )}
                  onChange={() => this.handleCheckboxFoFilter(option)}/>
                  <span style={{ margin: "5px" }}> {option.toString()}</span>   
              </div>
              )
          )}
        </div>
      
        <div
        style={{ display: "flex",justifyContent: "space-between"}}>
        <button  className="deviceOkFilterButton"  onClick={() => this.filterDeviceTable(id)}>
            Apply
        </button>
        <button className="deviceOkFilterButton"  onClick={() =>this.filterDeviceTable("clear")}>                                        
            Clear
        </button>
        </div>
    </div>)
  }

  handleAddNewDeviceModal = ()=>{
    this.setState({showAddDeviceTab:!this.state.showAddDeviceTab})
  }

  callAddDevice=(data) =>{
    console.log(data);
      fetch( `http://${this.state.serverIP}:5005/inventory-management/add-device`,
        {
          method: "POST",
          mode: "cors",
          headers: {
            "Access-Control-Allow-Origin": "http://localhost:3000",
            Accept: "application/json",
            "Content-Type": "application/json",
            username: sessionStorage.getItem("username"),
            Authorization: "Bearer" +JSON.parse(sessionStorage.getItem("login_data")).data.access_token,
          },
          body: JSON.stringify(data),
        }
      )
        .then((resp) => resp.json())
        .then((resp) => {
          this.setState({ device_add_response: resp.status });
          alert(resp.status);
          this.get_device_list();
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

  render() {   
    const {
      isOpen,
      toEditdevicePort,
      activePage,
      itemsPerPage,
      routerDetails,
      toEditUserName,
      toEditPassword,
      toEditdeviceName,
      device_name,
      ip_add,
      port,
      isToggled,
    } = this.state;

    const indexOfLastItem = activePage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const deviceTableHeaders=["device_name", "ip_add","port","device_type",'circle',"cluster_name","site_name","username","role", "ConnectionStatus" ]
    let currentItems;
    if (routerDetails !== null) {
      currentItems = routerDetails.slice(indexOfFirstItem, indexOfLastItem);
    }

    return (
        <div className="device" style={{marginTop:"-63px"}}>
            <div className="devicelistsearch">
                <div className='tabbox' style={{width:"200px"}}>
                    <img onClick={() => this.updateWithSearchTerm(this.state.searchTerm)} alt="" className='tabicon' src={require('../Images/search.png')}></img>
                    <input placeholder='Search' style={{ border: '0', height: '90%', width: '272px', background: "transparent" }} value={this.state.searchTerm} onChange={(e) => this.handleSearch(e)}></input>
                </div>
                
                <div onClick={this.toggleDropdown} ref={(ref) => (this.dropdownRef = ref)} className="tabbox" style={this.state.showReport ? { color: "#004f68", fontWeight: "bold" } : null}>
                    <img alt="" className="tabicon" src={require("../Images/report.png")} ></img>
                    Reports
                    {isOpen && routerDetails ? (
                        routerDetails.length > 0 ? (
                            <div className="downloadOptions" style={{ marginTop: "10.5%",marginLeft:"2%",width:"10%" }}>
                                <div className="optionsBox" onClick={(e) => { this.exportNetworkListPDF(); }}>
                                    <img alt="" className="tabicon" src={require("../Images/pdf.png")}  ></img>
                                    Network Report
                                </div>
                                <div className="optionsBox" onClick={(e) => { this.downloadGroupedReport(); }}>
                                    <img alt="" className="tabicon" src={require("../Images/pdf.png")}  ></img>
                                    Filtered Report 
                                </div>
                                {this.state.csvReport ? (
                                    <CSVLink {...this.state.csvReport}>
                                        <div className="optionsBox" style={{ color: "black", textTransform: null }}>
                                            <img alt="" className="tabicon" src={require("../Images/csv.png")}></img>CSV File
                                        </div>
                                    </CSVLink>
                                ) : (
                                    <div className="optionsBox" style={{ color: "black", textTransform: null }}>
                                        <img  alt="" className="tabicon" src={require("../Images/csv.png")}  ></img>CSV File
                                    </div>
                                )}
                              
                            </div>
                        ) : (
                            <div className="downloadOptions">  No Data </div>
                        )
                    ) : null}
                </div>
            </div>

            {currentItems?(
            <div style={{borderRadius:'20px',overflowX:"auto"}} >  
                <table className="user_table" style={{ width: "100%",marginTop:"4%"}}>
                    <thead   id="panels" className="user_table_head"
                    title="Click on the Parameters to view the sorting options">
                        <tr style={{ backgroundColor: "#e5e8ff",color: "black",textTransform:'uppercase'}}>
                          {deviceTableHeaders.map(header=>(
                            <th onClick={() => this.openFilterTab(header)}>{header==="ConnectionStatus"?"Status":header}
                                <a className="filtericoncenter"><img style={{ marginTop: "-1%" }} src={filter}  alt=""  width={12}/></a>
                                {this.renderFilterTab(header)}
                            </th>
                          ))}
                            {this.state.showDownloadOptions ? (
                            <div className="downloadReportOption">
                                <div  className="downloadReportOptionType" onClick={() => this.exportNetworkListPDF()}>Network Report </div>
                                <div  className="downloadReportOptionType" onClick={this.downloadGroupedReport}  >Filtered Report</div>
                            </div>
                            ) : null}
                        </tr>
                    </thead>
                    <tbody style={{ fontSize: "14px" }} className="network_table_body" >
                    {currentItems && currentItems.map((router, index) => (
                        <tr
                            key={router.unique_id}
                            onClick={() =>this.redirect_main_page( router.unique_id,  router.device_name, router.ConnectionStatus, router.coordinates )}>          
                            <td className="uppercase" >{router.device_name}</td>
                            <td>{router.ip_add}</td>
                            <td>{router.port}</td>
                            <td>{router.device_type}</td>
                            <td>{router.circle}</td>
                            <td>{router.cluster_name}</td>
                            <td>{router.site_name}</td>
                            <td>{router.username}</td>
                            <td>{router.role}</td>
                            <td><img src={router.ConnectionStatus?enabled:disabled} alt="" width={20}/></td>
                            <td onClick={(e) => this.openDrop(e, index, 0)} onMouseLeave={(e) =>  this.openDrop(e, index, "leave")}>
                            <div className="dropdown"  style={{ marginLeft: "15px" }} >
                                <img  width="3" src={require("../Images/dot.png")} alt="Menu" className="dropdown-trigger" />
                            {this.state.openDrop && this.state.openDrop[index] ? (
                                <div className="dropdown-content" style={{ display: "flex" }}>
                                    <div  className="dotContent"
                                        onClick={() => { window.open( `https://www.google.com/maps?q=${router.coordinates[0]},${router.coordinates[1]}`, "_blank");}}> 
                                        <img alt="" style={{ marginRight: "12%" }} width="15" src={placeholder}/>
                                        View In Map  
                                    </div>   
                                    <div className="dotContent"
                                        onClick={(e) => this.openSaveConfiguration(e,router.unique_id )}>
                                        <img alt=""  style={{ marginRight: "12%" }} width="15" src={saveConfig} />{" "}Save Template
                                    </div>
                                    <div className="dotContent"
                                        onClick={(e) => this.setState({showGoldenTemplateTab:true})}>
                                        <img alt=""  style={{ marginRight: "12%" }} width="15" src={saveConfig} />{" "}Golden Template
                                    </div>
                                    <div className="dotContent"
                                        onClick={(e) => router.ConnectionStatus ? this.Reboot(e, router.unique_id): e.preventDefault()}>
                                        <img alt=""  style={{ marginRight: "12%" }} width="15" src={require("../Images/reboot.png")} />{" "}Reboot
                                    </div>
                                    <div className="dotContent" onClick={(e) =>this.settoupdateDeviceList(e,
                                        router._id,
                                        router.ip_add,
                                        router.device_name,
                                        router.cluster_name,
                                        router.site_name,
                                        router.port,
                                        router.ConnectionStatus.toString(),
                                        router.role)}>
                                        <img alt=""style={{ marginRight: "12%" }}width="15"src={edit}></img>
                                        Edit
                                    </div>
                                    <div className="dotContent" onClick={(e) => this.remove_device(e,
                                        router._id,
                                        router["site_name"],
                                        router.ConnectionStatus.toString())}>
                                        <img alt="" style={{ marginRight: "12%" }} width="15" src={garbage}></img>
                                        Delete
                                    </div>
                                </div>
                            ) : null}
                            </div>
                            </td>
                        </tr>
                        ))}
                    </tbody>
                </table>

                <Pagination
                    activePage={activePage}
                    itemsCountPerPage={itemsPerPage}
                    totalItemsCount={routerDetails.length}
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
            ):null}

            <div className="RoundButton" onClick={()=>this.setState({showAddDeviceTab:true})}>
                <button className="fab_main_btn" style={{fontSize: "30px", fontWeight: "bold"}}>+</button>
            </div>
           
            {this.state.openEditDevicelist ? (
            <div className="popupSoft">
                <div className="popup-innerSoft">
                  <div style={{ display: "flex" }}>
                      <div className="new_device_header">Update Device Details</div>
                      <div className="close"style={{ position: "absolute", right: "30px" }}
                          onClick={(e) => this.setState({ openEditDevicelist: false,showUserVerificationTab1: false,})}
                      > &times;</div>
                  </div>
                  <div style={{ margin: "15px",display: "flex",flexDirection: "column",}}>
                      <div style={{ display: "flex" }}>
                      <div style={{ marginRight: "10px" }}>
                          <div style={{ marginTop: "20px" }}>
                          <TextField
                              placeholder="xxx.xxx.xxx.xxx"
                              type="ipadd"
                              id="standard-basic-2"
                              label="IP-Address*"
                              variant="standard"
                              value={this.state.toEditdeviceIP}
                              InputProps={{readOnly: true,style: { background: "#f2f2f2" }}}
                          />
                          </div>
                          <div style={{ marginTop: "20px" }}>
                          <TextField
                              InputProps={{readOnly: true,style: { background: "#f2f2f2" }}}
                              placeholder="cluster"
                              type="text"
                              id="standard-basic-2"
                              label="CLUSTER*"
                              variant="standard"
                              value={this.state.toEditdeviceCluster}
                              onChange={(event) => { var isValidCluster = this.containsOnlyLetters(event.target.value);
                              if (isValidCluster) {
                                  this.setState({toEditdeviceCluster: event.target.value,errormsgCluster: null,});
                              } else if (event.target.value.length === 0 ) 
                              {
                                  this.setState({toEditdeviceCluster: event.target.value,errormsgCluster: null, });
                              } else {
                                  this.setState({errormsgCluster: "Invalid Cluster name",});
                              }
                              }}
                          />
                          </div>
                          <div style={{ marginTop: "20px" }}>
                          <TextField
                              placeholder="site"
                              InputProps={{readOnly: true,style: { background: "#f2f2f2" }}}
                              type="text"
                              id="standard-basic-2"
                              label="SITE*"
                              variant="standard"
                              value={this.state.toEditdeviceSite}
                              onChange={(event) => {var isValidCluster =this.containsOnlyLetters(event.target.value);
                              if (isValidCluster) {
                                  this.setState({toEditdeviceSite: event.target.value,errormsgSite: null,});
                              } else if (event.target.value.length === 0 ) 
                              {
                                  this.setState({ toEditdeviceSite: event.target.value,errormsgSite: null,});
                              } else {
                                  this.setState({ errormsgSite: "Invalid Site name",});
                              }
                              }}
                          />
                          </div>
                          <div style={{ marginTop: "20px" }}>
                          <TextField
                              placeholder="Name"
                              type="text"
                              id="standard-basic-1"
                              label="Name*"
                              variant="standard"
                              value={this.state.toEditdeviceName}
                              onChange={(event) => {this.setState({toEditdeviceName: event.target.value,}); }}
                          />
                          <p style={{ color: "red", fontSize: "small" }}>{this.state.errormsg} </p>
                          </div>
                      </div>
                      <div style={{ marginLeft: "10px" }}>
                          <div style={{ marginTop: "20px" }}>
                          <TextField
                              placeholder="Port"
                              type="number"
                              id="standard-basic-3"
                              label="Port*"
                              variant="standard"
                              value={this.state.toEditdevicePort}
                              onChange={(event) => { var isValidPort = this.containsOnlyNumbers(event.target.value);
                              if (isValidPort) { 
                                  this.setState({toEditdevicePort: event.target.value,errormsgPort: null,});
                              } else if ( event.target.value.length === 0 ) 
                              { 
                                  this.setState({toEditdevicePort: event.target.value, errormsgPort: null,});
                              } else {
                                  this.setState({ errormsgPort: "Invalid Port number", });
                              }
                              }}
                          />
                          <p style={{ color: "red", fontSize: "small" }}>{this.state.errormsg}</p>
                          </div>
                          <div style={{ marginTop: "20px" }}>
                          <TextField
                              placeholder="Username"
                              type="text"
                              id="standard-basic-1"
                              label="Username*"
                              variant="standard"
                              value={this.state.toEditUserName}
                              onChange={(event) => {this.setState({ toEditUserName: event.target.value,});}}
                          />
                          </div>
                          <div style={{ marginTop: "20px" }}>
                          <TextField
                              placeholder="Password"
                              type="password"
                              id="standard-basic-1"
                              label="Password*"
                              variant="standard"
                              value={this.state.toEditPassword}
                              onChange={(event) => { this.setState({ toEditPassword: event.target.value, });}}
                          />
                          </div>
                          <select
                          style={{ marginTop: "20px", width: "195px" }}
                          className="intervalLabel"
                          value={this.state.userRole}
                          onChange={(event) => {this.setState({ userRole: event.target.value, });}}
                          >
                          <option value={null}>Select Role</option>
                          {this.state.options.map((option, index) => (
                              <option key={index} value={option}> {option} </option>
                          ))}
                          </select>
                      </div>
                      </div>
                      <div style={{  display: "flex", justifyContent: "center",}}>
                      <button className="add_user_button" style={{ marginLeft: "0px" }}
                          type="button"
                          disabled={toEditdevicePort && toEditUserName && toEditPassword &&toEditdeviceName? false: true}
                          onClick={() => this.confirmVerification( this.state.toEditdeviceCluster,this.state.toEditdeviceSite)} 
                      >
                          Confirm
                      </button>
                      </div>
                  </div>
                </div>
            </div>
            ) : null}

            {this.state.showAddDeviceTab ? (
           
            <AddNewDeviceForm
              addDevice={this.callAddDevice}
              getWhitelist={this.state.getWhitelist}
              handleModal = {this.handleAddNewDeviceModal}
            />
            ) : null}

            {this.state.openSaveConfigPopup ? (
            <div className="role_content"style={{ width: "20%",top: "36%", marginLeft: "32%",padding: "18px",}} >
              <div style={{ display: "flex" }}>
                <div className="new_device_header" style={{ textAlign: "center" }}> Save as Template </div>
                <div className="close"style={{ position: "absolute", right: "30px" }}onClick={(e) => this.setState({ openSaveConfigPopup: false }) }>&times;</div>
              </div>
              <div className="DialogInputs">
                <TextField
                  placeholder="Name"
                  type="text"
                  id="standard-basic-1"
                  label="Template name"
                  variant="standard"
                  value={this.state.TemplateName}
                  onChange={(event) => { this.setState({ TemplateName: event.target.value }); }}
                />
                <p style={{ fontSize: "small", color: "red" }}> {this.state.errormsgTemplateInput} </p>
              </div>
              <button className="add_user_button" onClick={() => this.addToTemplateList()} style={{ position: "relative",right: "46%", marginTop: "20px",}}>Confirm</button>
            </div>
            ) : null}

            {this.state.showGoldenTemplateTab ? (
              <div className="role_content"
                style={{ width: "30%",top: "36%",marginLeft: "32%",padding: "18px",display:"flex"}}>
                <div >
                  <div style={{color:"#086194",fontWeight:"700",padding:"2px",textAlign:"center"}} >Upload Golden Template</div>
                  <div style={{ position: "absolute", right: "27px" ,top:"13px"}} onClick={(e) =>this.setState({ showGoldenTemplateTab: false }) }><img src={close} alt="" width={10}/></div>
                  <div style={{ margin: '3px' }}>
                    <input style={{ marginLeft: "17px", marginTop: "2%" }} type="file" onChange={this.onFileChange} />
                    <button className='btn btn-primary mb-3' style={{ marginLeft: "39%", marginTop: "5%", fontSize: "small", borderRadius: "2px" }} onClick={this.onFileUpload}>upload</button>
                    <div className='filterpopupHeader' style={{ color: "red", marginLeft: "17px" }}>{this.state.errormsgBulkConfig}</div>
                  </div>
                </div>
              </div>
            ) : null}

            {this.state.isLoading === true ? <Loading /> : null}

            {this.state.show_delete_confirmation_popup ? (
            <div className="role_content" style={{width:"fit-content",padding:"1.5%"}}>
                <div className="module_head">
                    Do you want to remove the device?
                </div>
                <div className="delete_buttons">
                    <button className="btn btn-primary mb-3" onClick={() => this.remove_element_from_network()}> Apply</button>
                    <button className="btn btn-primary mb-3" style={{background:"red",border:"0"}} onClick={() =>this.setState({ show_delete_confirmation_popup: false,})}> Cancel </button>
                </div>
            </div>
            ) : null}
        </div>
    );
  }
}
export default DeviceListPanel;
