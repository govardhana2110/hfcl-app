import React from "react";
import TextField from "@mui/material/TextField";
import Loading from "../Components/loader";
import Tooltip from "@mui/material/Tooltip";
import garbage from "../Images/garbage.png";
import swal from "sweetalert2";
import edit from "../Images/edit.png";
import Upload from "../Components/uploadFile";
import "leaflet/dist/leaflet.css";
import "react-dropdown/style.css";
import axios from "axios";
import jsPDF from "jspdf";
import sortDown from "../Images/dropDown.png";
import sortUp from "../Images/arrow-up.png";
import Pagination from "react-js-pagination";
import close from "../Images/closeS.png";
import { CSVLink } from "react-csv";
import addButton from "../Images/addNewTrigger.png";
import { PageItem as BootstrapPageItem } from 'react-bootstrap';
import Map from "../Components/mapAdd.jsx";
import "bootstrap/dist/css/bootstrap.min.css";
import copy from "../Images/copy.png";
import mapIcon from "../Images/location.png"
import { selectAll } from "d3";
class WhitelistPanel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loggedInUserRole: "",
      showUploadCsv: false,
      selectedTabPanel: { background: "white", borderTopLeftRadius: "12px" },
      is_fetching: false,
      inventory: null,
      isOpen: false,
      serverIP: process.env.REACT_APP_CLIENT_IP,
      device_id: null,
      csvReport: null,
      csvReportHistory: null,
      showReportOptions: false,
      activePage: 1,
      itemsPerPage: 5,
      ipAddresses:[],
      currentItems:[],
      openFilterPopup:false,
      sortDirection: "asc",
      selectedthSort: null,
      selectAllChecked:false,
      filter:{
        _id: "",
        cluster_name: "",
        device_type: "",
        site_name: "",
        circle:"",

      },
      selectedOptions: [],
      selectedunique:[],
      fixthHead: { color: "#297c97e3", cursor: "pointer", position: "static" },
      severity: {
        critical: {
          color: "red",
          textAlign: "center",
          fontWeight: "700",
          fontSize: "large",
        },
        minor: {
          color: "orange",
          textAlign: "center",
          fontWeight: "700",
          fontSize: "large",
        },
        major: {
          color: "yellow",
          textAlign: "center",
          fontWeight: "700",
          fontSize: "large",
        },
        warning: {
          color: "#a98a19",
          textAlign: "center",
          fontWeight: "700",
          fontSize: "large",
        },
      },
      show_filter_popup: false,
      filter_by_key: null,
      openEditWhitelist: false,
      openEditDevicelist: false,
      connection_state: { backgroundColor: "#b13939" },
      showSingleWhiteListAdd: true,
      port: null,
      ip_add: null,
      errormsgPort: null,
      username: "",
      password: "",
      isLoading: true,
      openDrop: null,
      set_flag: false,
      openAddWhitelist: false,
      clickedCoords: null,
      errormsg: null,
      validIPState: false,
      whitelist_for_filter:null,
      templateUploadResponse: null,
      errormsgGoldTemp: null,
      errormsgBulkConfig: null,
      checkedDevices: [],
      selectedKeyType: null,
      device_type: null,
      device_type: null,
      generateReport: false,
      selectedKey: "",
      content: null,
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
      errormsgPort: "*required",
      errormsgTemplateInput: null,
      showDeviceList: true,
      openFilters: {},
      checkedOptions: [],
      checkedList: [],
      data: {},
      showAddTab:false,
      indianStates : [
        "Andhra Pradesh",
        "Arunachal Pradesh",
        "Assam",
        "Bihar",
        "Chhattisgarh",
        "Goa",
        "Gujarat",
        "Haryana",
        "Himachal Pradesh",
        "Jharkhand",
        "Karnataka",
        "Kerala",
        "Madhya Pradesh",
        "Maharashtra",
        "Manipur",
        "Meghalaya",
        "Mizoram",
        "Nagaland",
        "Odisha",
        "Punjab",
        "Rajasthan",
        "Sikkim",
        "Tamil Nadu",
        "Telangana",
        "Tripura",
        "Uttar Pradesh",
        "Uttarakhand",
        "West Bengal",
        "Andaman and Nicobar Islands",
        "Chandigarh",
        "Dadra and Nagar Haveli and Daman and Diu",
        "Delhi",
        "Lakshadweep",
        "Puducherry"
      ]
      
    };
    this.addToWhitelist = this.addToWhitelist.bind(this);
    this.sortTable=this.sortTable.bind(this);
    this.handleCheck=this.handleCheck.bind(this);
  }

  componentDidMount() {
    this.getWhitelist();
    let role = sessionStorage.getItem("role_id");
    this.setState({ loggedInUserRole: role });
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
        // console.log(resp)
        this.setState({ getWhitelist: resp, whitelist_for_filter:resp });
        var whitelistheaders = [
          {
            label: "ID",
            key: "_id",
          },
          { label: "Device Type", key: "device_type" },
          { label: "Cluster_name", key: "cluster_name" },
          { label: "site", key: "site_name" },
          { label: "circle", key: "circle" },
         
        ];
        var whiteList = [];

        for (let i = 0; i < this.state.getWhitelist.length; i++) {
          let headerDict = {};
          headerDict = {
            _id:
              this.state.getWhitelist[i]["_id"],
            device_type: this.state.getWhitelist[i]["device_type"],
            circle:this.state.getWhitelist[i]["circle"],
            cluster_name: this.state.getWhitelist[i]["cluster_name"],
            site_name: this.state.getWhitelist[i]["site_name"],
          
          };
          whiteList.push(headerDict);
        }
        this.setState({
          csvReport: {
            data: whiteList,
            headers: whitelistheaders,
            filename: "WhiteList.csv",
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

  validIP(ip) {
    let regexExp =
      /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/gi;
    console.log(regexExp.test(ip), "validation");
    this.setState({ validIPState: regexExp.test(ip) });
    return regexExp.test(ip);
  }
  addToWhitelist() {
    const { errormsgIP, errormsgCluster, errormsgSite, errormsgType } =
      this.state;
    console.log(errormsgIP, errormsgCluster, errormsgSite);
    if (
      errormsgType === null &&
      errormsgIP === null &&
      errormsgCluster === null &&
      errormsgSite === null
    ) {
      console.log("in");
      this.setState({ errormsg: null });
      var dict = {};
      dict["ip_add"] = this.state.deviceIP;
      dict["site_name"] = this.state.deviceSite;
      dict["cluster_name"] = this.state.deviceCluster;
      dict["coordinates"] = this.state.coordinates;
      dict["device_type"] = this.state.device_type;
      dict["circle"] =this.state.circle
      fetch(
        `http://${this.state.serverIP}:5005/inventory-management/add-device-whitelist`,
        {
          method: "POST",
          mode: "cors",
          headers: {
            "Access-Control-Allow-Origin": "http://localhost:3000",
            Accept: "application/json",
            "Content-Type": "application/json",
            username: sessionStorage.getItem("username"),
            Authorization:
              "Bearer " +
              JSON.parse(sessionStorage.getItem("login_data")).data
                .access_token,
          },
          body: JSON.stringify(dict),
        }
      )
        .then((resp) => resp.json())
        .then((resp) => {
          this.setState({ whitelistresponse: resp });
          alert(resp.status);
          this.getWhitelist();
        })
        .catch((err) => {
          if (err.response) {
            alert(err.response.data.status);
            console.log("Error Response Data:", err.response.data);
            console.log("Error Response Status:", err.response.status);
            console.log("Error Response Headers:", err.response.headers);
          }
        });
      this.setState({ openAddWhitelist: false });
    } else {
      this.setState({ errormsg: "Please fill all fields first" });
    }
  }
  containsOnlyLetters(input) {
    return /^[a-zA-Z\s]+$/.test(input);
  }
  containsOnlyNumbers(input) {
    // Check if the input contains only numeric characters
    return /^[0-9]+$/.test(input);
  }

  settoupdateWhitelist(id,circle, cluster, site, type, coordinates) {
    this.setState({
      ip_add: id,
      circle:circle,
      cluster_name: cluster,
      site_name: site,
      device_type: type,
      coordinates: coordinates,
    });
    this.setState({ openEditWhitelist: true });
  }
  updateWhitelist() {
    const{ip_add,cluster_name,site_name,circle,device_type,coordinates}=this.state;
    var dict = {};
    dict["ip_add"] = ip_add;
    dict["circle"] =circle;
    dict["cluster_name"] =cluster_name;
    dict["site_name"] = site_name;
    dict["device_type"] = device_type;
    dict["coordinates"] = coordinates;
    console.log(dict, "toedit");

    if (ip_add&&cluster_name&&site_name&&circle&&device_type&&coordinates
    ) {
      fetch(
        `http://${this.state.serverIP}:5005/inventory-management/update-device-whitelist/${ip_add}`,
        {
          method: "PATCH",
          mode: "cors",
          headers: {
            "Access-Control-Allow-Origin": "http://localhost:3000",
            Accept: "application/json",
            "Content-Type": "application/json",
            username: sessionStorage.getItem("username"),
            Authorization:
              "Bearer " +
              JSON.parse(sessionStorage.getItem("login_data")).data
                .access_token,
          },
          body: JSON.stringify(dict),
        }
      )
        .then((resp) => resp.json())
        .then((resp) => {
          this.setState({ editwhitelistresp: resp });
          console.log(resp, "editwhitelist");
          if (resp.status === "Whitelist has been updated") {
            alert("Whitelist has been updated");
            this.getWhitelist();
            this.get_device_list();
            this.setState({ displayErrorMessage: null, showMap: false });
          }
          this.setState({ openEditWhitelist: false });
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
      this.setState({ displayErrorMessage1: "Please Fill all the details" });
    }
  }
  remove_deviceWhitelist(id) {
    fetch(
      `http://${this.state.serverIP}:5005/inventory-management/remove-device-whitelist/${id}`,
      {
        method: "DELETE",
        mode: "cors",
        headers: {
          "Access-Control-Allow-Origin": "http://localhost:3000",
          Accept: "application/json",
          "Content-Type": "application/json",
          username: sessionStorage.getItem("username"),
          Authorization:
            "Bearer " +
            JSON.parse(sessionStorage.getItem("login_data")).data.access_token,
        },
        // body: JSON.stringify(dataobject)
      }
    )
      .then((resp) => resp.json())
      .then((resp) => {
        this.setState({ device_remove_responseWhitelist: resp.status });
        console.log(resp, "device_remove_responseWhitelist");
        if (
          this.state.device_remove_responseWhitelist ===
          "Device removed from whitelist"
        ) {
          alert("Device removed from the network");
          this.getWhitelist();
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

  setCoordinates = async (place) => {
    var updatedValue = place;
    const response = await axios.get(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        updatedValue
      )}`
    );
    if (response.data.length > 0) {
      const coordinates = [
        parseFloat(response.data[0].lat),
        parseFloat(response.data[0].lon),
      ];
      this.setState({
        default_coordinates: coordinates,
      });
      console.log(this.state.default_coordinates, updatedValue);
      this.setState({ showMap: true });
    }
  };

  handlePageChange = (pageNumber) => {
    this.setState({ activePage: pageNumber });
}

  toggleDropdown = () => {
    this.setState((prevState) => ({
      isOpen: !prevState.isOpen,
    }));
  };


  handleMapClick = (clickedCoords) => {
    this.setState({ clickedCoords });
    this.setState({
      coordinates: clickedCoords,
      coordinates: clickedCoords,
    });
    console.log(this.state.coordinates);
  };

  exportWhiteListPDF = () => {
    const { getWhitelist } = this.state;
    var currentTime = new Date().toLocaleString().replace(/:/g, "-");
    if (getWhitelist && getWhitelist.length > 0) {
      const unit = "pt";
      const size = "A4";
      const orientation = "portrait";
      const marginLeft = 40;
      const doc = new jsPDF(orientation, unit, size);
      doc.setFontSize(15);
      const title = "Whitelist for Network devices";
      const headers1 = [["IP", "Device-type", "Cluster name", "Site name"]];
      var data1 = getWhitelist.map((elt) => [
        elt["_id"],
        elt["device_type"],
        elt["cluster_name"],
        elt["site_name"],
      ]);

      let content1 = {
        startY: 70,
        head: headers1,
        body: data1,
      };

      doc.text(title, marginLeft, 40);
      doc.setFontSize(15);
      doc.autoTable(content1);

      doc.save(`Device-Whitelist ${currentTime}.pdf`);
    } else {
      alert("No data available");
    }
  };


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

    }
    
    ));
    
  };
  
  handleFilterChange = (columnName, value) => {
    this.setState((prevState) => ({
      filter: {
        ...prevState.filter,
        [columnName]: Array.isArray(value) ? value : [value], // Convert single-select value to an array for checkboxes
      },
    }));
  };

   
  applyFilter = () => {
    const {getWhitelist, filter } = this.state;
    const filteredLogs = getWhitelist.filter((log) => {
      return (
        (!filter._id || !filter._id.length || filter._id.includes(log._id?.toLowerCase())) &&
        (!filter.site_name || !filter.site_name.length || filter.site_name.includes(log.site_name?.toLowerCase())) &&
        (!filter.cluster_name || !filter.cluster_name.length || filter.cluster_name.includes(log.cluster_name?.toLowerCase())) &&
        (!filter.device_type || !filter.device_type.length || filter.device_type.includes(log.device_type?.toLowerCase())) 

      );
    }
      );
    

    this.setState({ getWhitelist:filteredLogs, openFilterPopup: false });
  };
  clearFilter = () => {
    // Clear the filter and show all logs
    this.setState({
      filter: Object.keys(this.state.filter).reduce((acc, key) => {
        return { ...acc, [key]: [] }; // Clear all filter values
      }, {}),
      getWhitelist: this.state.whitelist_for_filter,
      openFilterPopup: false,
    });
    console.log(this.state.getWhitelist)
  };

  sortTable = (column) => {
    const { sortColumn, sortDirection, getWhitelist } = this.state;
 
    let direction = "asc";
    if (sortColumn === column && sortDirection === "asc") {
      direction = "desc";
      this.setState({ sortOrder: "desc" });
    } else {
      this.setState({ sortOrder: "asc" });
    }

    const sortedItems = getWhitelist.sort((a, b) => {
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
      getWhitelist: sortedItems,
      sortColumn: column,
      sortDirection: direction,
      selectedthSort: column,
    });
  };

  handleSelectAll = (event) => {
    const { checked } = event.target;
    const { getWhitelist,selectAllChecked} = this.state;
    if (checked) {
      const checkedItems = getWhitelist.map(item => ({
        ip: item._id,
        cluster: item.cluster_name,
        site: item.site_name,
        device_type: item.device_type
      }));
      console.log(checkedItems,"itiri")

      this.setState({ checkedList: checkedItems,selectAllChecked:true});
    } else {
      this.setState({ checkedList: [],selectAllChecked:false,ipAddresses:[]});
    }
  };

  handleCheck = (event, item,ipAddresses) => {
    const { checkedList} = this.state;
    const { checked } = event.target;
    const newItem = this.createItemObject(item);
  
    const index = checkedList.findIndex(entry =>
      entry.ip === newItem.ip &&
      entry.cluster === newItem.cluster &&
      entry.site === newItem.site &&
      entry.device_type === newItem.device_type
    );
  
    if (checked && index === -1) {
      this.setState({ checkedList: [...checkedList, newItem],ipAddresses:[...ipAddresses,item._id]},()=>{console.log(ipAddresses,item._id,"ips")
    });
      
    } else if (!checked && index !== -1) {
      const updatedList = checkedList.filter((_, i) => i !== index);
      const ip = updatedList.map(obj => obj.ip);
      this.setState({ checkedList: updatedList,ipAddresses:ip,selectAllChecked:false});
    }
  };
  
  createItemObject = (item) => {
    return {
      ip: item._id,
      cluster: item.cluster_name,
      site: item.site_name,
      device_type: item.device_type
    };
  };
  
  areAllItemsChecked = () => {
    const { getWhitelist, checkedList } = this.state;
    if(getWhitelist)
    {
    return getWhitelist.length > 0 && getWhitelist.length === checkedList.length;
    }
  };
  

  handleDeviceNameChange = (ip, value) => {
    this.setState(prevState => ({
        data: {
            ...prevState.data,
            [ip]: {
                ...prevState.data[ip],
                name: value
            }
        }
    }));
  };

  handleDevicePortChange = (ip, value) => {
      this.setState(prevState => ({
          data: {
              ...prevState.data,
              [ip]: {
                  ...prevState.data[ip],
                  port: value
              }
          }
      }));
  };

  handleDeviceUsernameChange = (ip, value) => {
      this.setState(prevState => ({
          data: {
              ...prevState.data,
              [ip]: {
                  ...prevState.data[ip],
                  username: value
              }
          }
      }));
  };
  handleDevicePasswordChange = (ip, value) => {
    this.setState(prevState => ({
        data: {
            ...prevState.data,
            [ip]: {
                ...prevState.data[ip],
                password: value
            }
        }
    }));
  };
 

  copyValue = (field) => {
    const { data, checkedList } = this.state;
    const copiedValue = checkedList.length > 0 && data[checkedList[0].ip] ? data[checkedList[0].ip][field] : '';
    checkedList.forEach(device => {
        this.setState(prevState => ({
            data: {
                ...prevState.data,
                [device.ip]: {
                    ...prevState.data[device.ip],
                    [field]: copiedValue
                }
            }
        }));
    });
  };


  handleSave = () => {
    const { data, checkedList } = this.state;
    const newData = checkedList.map(device => ({
        ip: device.ip,
        cluster: device.cluster,
        site: device.site,
        device_type: device.device_type,
        name: data[device.ip]?.name || '',
        port: data[device.ip]?.port || '',
        username: data[device.ip]?.username || '',
        password: data[device.ip]?.password || ''

    }));
    console.log(newData);
  };

  handleSearch = (e) => {
    var searchTerm=e.target.value;
    this.setState({searchTerm});
    this.updateWithSearchTerm(searchTerm );
   
    console.log(searchTerm)
  }
  updateWithSearchTerm(searchTerm) {
  const { whitelist_for_filter} = this.state;
 
  if (searchTerm === "") {
      this.setState({ getWhitelist: whitelist_for_filter });
  } else {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      const filteredTable = whitelist_for_filter.filter(user => {
          for (const key in user) {
              if (
                  typeof user[key] === 'string' &&
                  user[key].toLowerCase().includes(lowerCaseSearchTerm)
              ) {
                  return true;
              }
          }
          return false;
                 });
      this.setState({ getWhitelist: filteredTable });
  }
  }
  render() {
    const {showAddTab,checkedList,data,indianStates}=this.state;
    const { activePage,selectedOptions,filter,ipAddresses,itemsPerPage,getWhitelist,selectAllChecked,
      ip_add,circle,site_name,cluster_name,coordinates,device_type,
      deviceIP,
      deviceCluster,
      deviceSite,
      whitelist_for_filter,
      isOpen,
    } = this.state;
    let currentItems;
    let tableHeaders;
    let uniqueOptions,nonFilterableColumns;
    const indexOfLastItem = activePage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    if(getWhitelist){
    currentItems = getWhitelist.slice(indexOfFirstItem, indexOfLastItem);
   
    }  if(getWhitelist)
    {
    nonFilterableColumns = ["coordinates"];
     tableHeaders = ["_id","cluster_name","device_type","site_name"];
    uniqueOptions = tableHeaders.reduce((options, header) => {
      if (!nonFilterableColumns.includes(header)) {
        options[header] = Array.from(new Set(whitelist_for_filter.map((log) => log[header]))).filter(Boolean);
      }
      return options; }, {});  
  
  }
    return (
      
      <div style={{backgroundColor:'white',borderRadius:'20px',paddingTop:'1%'}}>
        <div className="WhiteListtable networkContent" style={{marginTop:"-36px"}}>
        <div style={{ display: 'flex', position: "absolute", right: "3%" }}>
            <div className='tabbox' style={{width:"200px"}}>
                <img onClick={() => this.updateWithSearchTerm(this.state.searchTerm)} alt="" className='tabicon' src={require('../Images/search.png')}></img>
                <input placeholder='Search' style={{ border: '0', height: '90%', width: '272px', background: "transparent" }} value={this.state.searchTerm} onChange={(e) => this.handleSearch(e)}></input>
            </div>
            
            <div onClick={this.toggleDropdown} ref={(ref) => (this.dropdownRef = ref)} className="tabbox" style={this.state.showReport ? { color: "#004f68", fontWeight: "bold" } : null}>
                <img alt="" className="tabicon" src={require("../Images/report.png")} ></img>
                Reports
                {isOpen && getWhitelist ? (
                    getWhitelist.length > 0 ? (
                        <div className="downloadOptions" style={{ marginTop: "18.5%",width:"29%" }}>
                            <div className="optionsBox" onClick={(e) => { this.exportWhiteListPDF(); }}>
                                <img alt="" className="tabicon" src={require("../Images/pdf.png")}  ></img>
                                WhiteList  PDF
                            </div>
                            {this.state.csvReport ? (
                                <CSVLink {...this.state.csvReport}>
                                    <div className="optionsBox" style={{ color: "black", textTransform: null }}>
                                        <img alt="" className="tabicon" src={require("../Images/csv.png")}></img> WhiteList CSV
                                    </div>
                                </CSVLink>
                            ) : (
                                <div className="optionsBox" style={{ color: "black", textTransform: null }}>
                                    <img  alt="" className="tabicon" src={require("../Images/csv.png")}  ></img>  WhiteLlist CSV 
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="downloadOptions">  No Data </div>
                    )
                ) : null}
            </div>
            
            <div className='tabbox' onClick={(e) => this.setState(prevState => ({ openFilterPopup: !prevState.openFilterPopup }))}>
                <img alt="" className='tabicon' src={require('../Images/filter.png')}></img>Filter
            </div>

            <Tooltip title="add routers to device-list">
                <div style={{ marginRight: "18px" }} onClick={() => this.setState({ showAddTab: true })}>
                    <img src={addButton} alt="" width={20}/>
                </div>
            </Tooltip>
        </div>
        </div>
    
        {this.state.openFilterPopup && this.state.getWhitelist?(
                <div className="filter-popup" style={{marginTop:"3%"}}>
                  <h className="filtertext">Filter By :</h>
                  <img src={close} alt="" className='closeX' onClick={(e)=>this.setState({openFilterPopup:false})}/>
                  <div style={{ display: "flex", flexWrap: "wrap", marginLeft: '5%' }}>
                    {tableHeaders.map((header) => (
                      !nonFilterableColumns.includes(header) && (
                        <div key={header} style={{ margin: "5px" }}>
                          {uniqueOptions[header] && uniqueOptions[header].length > 0 ? (
                            <div style={{ alignItems: 'center' }}>
                              <label className='filterLabels' style={{fontSize:'small'}}>{header}:</label>
                              <div className="select-box">
                                  <div className="checkbox-scroll-box">
                                    {uniqueOptions[header].map((option) => (
                                      <div key={option} style={{display:'flex'}}>
                                        <input
                                          type="checkbox"
                                          value={option}
                                          checked={filter[header].includes(option)}
                                          onChange={(e) =>
                                            this.handleCheckboxChange(header, e.target.value)
                                          }
                                        />  
                                        <label style={{marginTop:'7px'}}>{String(option)}</label>
                                      </div>
                                    ))}
                                  </div>
                              </div>
                            </div>
                          ) : null}
                        </div>
                      )
                    ))}
                                  <div className="applyFilterbutton" style={{ display: 'flex', marginTop: '10%', marginBottom:'2%',height: '47px' }}>

                      <button onClick={this.applyFilter} className='apply-filter-btn'>Apply</button>
                      <button onClick={this.clearFilter} className='clear-filter-btn'>Clear</button>
                    </div>
                  </div>
                </div>
        ):null}

        {getWhitelist && !this.state.showUploadCsv ? (
          <><table className="user_table" style={{opacity:showAddTab?"0.1":null,marginTop:"7%"}}> 
            <thead id="panels" className="user_table_head">
              <tr style={{ backgroundColor: "#e5e8ff", color: "black",textTransform:"uppercase" }}>
                <th onClick={() => this.sortTable("_id")} style={this.state.selectedthSort && this.state.selectedthSort === "_id" ? this.state.fixthHead : ({ cursor: 'pointer', position: 'static' })}>IP<img alt="" style={{ marginLeft: '8px', marginTop: '2px' }} src={this.state.selectedthSort === "_id" && this.state.sortOrder === "asc" ? sortUp : sortDown} width={10} /></th>
                <th onClick={() => this.sortTable("device_type")} style={this.state.selectedthSort && this.state.selectedthSort === "devicetype" ? this.state.fixthHead : ({ cursor: 'pointer', position: 'static' })}>Device Type<img alt="" style={{ marginLeft: '8px', marginTop: '2px' }} src={this.state.selectedthSort === "device_type" && this.state.sortOrder === "asc" ? sortUp : sortDown} width={10} /></th>
                <th onClick={() => this.sortTable("circle")} style={this.state.selectedthSort && this.state.selectedthSort === "circle" ? this.state.fixthHead : ({ cursor: 'pointer', position: 'static' })}>Circle<img alt="" style={{ marginLeft: '8px', marginTop: '2px' }} src={this.state.selectedthSort === "circle" && this.state.sortOrder === "asc" ? sortUp : sortDown} width={10} /></th>
                <th onClick={() => this.sortTable("cluster_name")} style={this.state.selectedthSort && this.state.selectedthSort === "CLUSTER" ? this.state.fixthHead : ({ cursor: 'pointer', position: 'static' })}>CLUSTER<img alt="" style={{ marginLeft: '8px', marginTop: '0px' }} src={this.state.selectedthSort === "cluster_name" && this.state.sortOrder === "asc" ? sortUp : sortDown} width={10} /></th>
                <th onClick={() => this.sortTable("site_name")} style={this.state.selectedthSort && this.state.selectedthSort === "site_name" ? this.state.fixthHead : ({ cursor: 'pointer', position: 'static' })}>SITE<img alt="" style={{ marginLeft: '8px', marginTop: '0px' }} src={this.state.selectedthSort === "site_name" && this.state.sortOrder === "asc" ? sortUp : sortDown} width={10} /></th>
                <th>EDIT</th>
                <th>LOCATION</th>
                <th></th>
                <th style={{display:"contents"}}>select all<span><input type="checkbox" value="selectall" onChange= {(e)=>{this.handleSelectAll(e)}} /></span></th>
                  
              </tr>
            </thead>
            <tbody
              id="panels"
              style={{ borderStyle: "hidden", background: "white" }}
            >
              {currentItems.map((item) => (
                <tr>
                  <td>{item._id}</td>
                  <td style={{ textTransform: "uppercase" }}>
                    {item.device_type}
                  </td>
                  <td>{item.circle}</td>
                  <td>{item.cluster_name}</td>
                  <td>{item.site_name}</td>
                  <td
                    onClick={() => this.settoupdateWhitelist(
                      item._id,
                      item.circle,
                      item.cluster_name,
                      item.site_name,
                      item.device_type,
                      item.coordinates
                    )}
                  >
                    <img
                      style={{ cursor: "pointer" }}
                      src={edit}
                      alt=""
                      width="20" />
                  </td>
                  <td
                   onClick={() => {
                    window.open(
                      `https://www.google.com/maps?q=${item.coordinates[0]},${item.coordinates[1]}`,
                      "_blank"
                    );
                  }}
                  ><img src={mapIcon} alt="" width={20}/></td>
                  <Tooltip title="Remove" arrow>
                    <td onClick={(e) => this.remove_deviceWhitelist(item._id)}>
                      <img src={garbage} alt="" width="20" style={{ cursor: "pointer" }} />
                    </td>
                  </Tooltip>
                  <td>
                  <input 
                    type="checkbox" 
                    value={JSON.stringify({
                      _id: item._id,
                      cluster_name: item.cluster_name,
                      site_name: item.site_name,
                      device_type: item.device_type
                    })}
                    onChange={e => {this.handleCheck(e, item,ipAddresses)}}
                    checked={selectAllChecked || (ipAddresses.includes(item._id) && !selectAllChecked)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination
              activePage={activePage}
              itemsCountPerPage={itemsPerPage}
              totalItemsCount={getWhitelist.length}
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
              pageItem={BootstrapPageItem} />
            </>
        ) : null}

        <div
          className="RoundButton"
          onClick={() => this.setState({ openAddWhitelist: true })}
        >
          <button className="fab_main_btn" style={{fontSize: "30px", fontWeight: "bold"}}>+</button>
        </div>

        {this.state.openAddWhitelist ? (
          <div  className={!this.state.showMap ? "popupSoft centerCol" : "popupSoft increase" } style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}>
            <div className="popup-innerSoft" style={this.state.showMap ? { width: "61%" } : null}>
              <div style={{ display: "flex" }}>
                <div className="new_device_header"style={{ textAlign: "center" }}>Add Device to Whitelist </div>
                <div className="tabbox singleBulkTab" style={this.state.showSingleWhiteListAdd? { color: "#2189c9" }: null} onClick={(e) => {this.setState({ showSingleWhiteListAdd: true });}}>Single</div>
                <div className="tabbox singleBulkTab"
                  style={!this.state.showSingleWhiteListAdd ? { color: "#2189c9" } : null }
                  onClick={(e) => {this.setState({showSingleWhiteListAdd: false,inventory: "bulk-add-device-whitelist",});}}>
                  Bulk
                </div>
                <div className="close" onClick={(e) =>this.setState({ openAddWhitelist: false,showFileWhitelist: false,showMap: false,})} > &times;</div>
              </div>

              {this.state.showSingleWhiteListAdd ? (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <div style={{ color: "darkgoldenrod", fontSize: "11px" }}>
                    {this.state.displayErrorMessage
                      ? this.state.displayErrorMessage
                      : this.state.errormsg}
                  </div>
                  <div
                    style={
                      this.state.showMap
                        ? {
                            display: "flex",
                            width: "100%",
                            justifyContent: "center",
                          }
                        : { display: "flex" }
                    }
                  >
                    <div style={{display:"flex",flexDirection:"column",marginLeft:"15%"}}>
                      <div className="DialogInputs">
                        <TextField
                          placeholder="xxx.xxx.xxx.xxx"
                          type="ipadd"
                          id="standard-basic-2"
                          label="IP-Address*"
                          variant="standard"
                          value={this.state.deviceIP}
                          onChange={(event) => {
                            const inputValue = event.target.value;
                            const isValidIP = this.validIP(inputValue);

                            this.setState({
                              deviceIP: inputValue,
                              errormsgIP: inputValue
                                ? isValidIP
                                  ? null
                                  : "Invalid IP"
                                : "*required",
                            });
                          }}
                        />
                        <p style={{ color: "red", fontSize: "small" }}>
                          {this.state.errormsgIP}
                        </p>
                      </div>
                      <div className="DialogInputs">
                        <TextField
                          placeholder="cluster"
                          type="text"
                          id="standard-basic-2"
                          label="CLUSTER*"
                          variant="standard"
                          value={this.state.deviceCluster}
                          onChange={(event) => {
                            const inputValue = event.target.value;
                            const isValidCluster =
                              this.containsOnlyLetters(inputValue);

                            this.setState({
                              deviceCluster: inputValue,
                              errormsgCluster:
                                inputValue.trim() === ""
                                  ? "*required"
                                  : isValidCluster
                                  ? null
                                  : "Invalid Cluster name",
                            });
                          }}
                        />
                        <p style={{ color: "red", fontSize: "small" }}>
                          {this.state.errormsgCluster}
                        </p>
                      </div>
                      <div className="DialogInputs">
                        <TextField
                          placeholder="site"
                          type="text"
                          id="standard-basic-2"
                          label="SITE*"
                          variant="standard"
                          value={this.state.deviceSite}
                          onChange={(event) => {
                            const inputValue = event.target.value;
                            const isValidSite =
                              this.containsOnlyLetters(inputValue);

                            this.setState({
                              deviceSite: inputValue,
                              errormsgSite:
                                inputValue.trim() === ""
                                  ? "*required"
                                  : isValidSite
                                  ? null
                                  : "Invalid Site name",
                            });
                          }}
                        />
                        <p style={{ color: "red", fontSize: "small" }}>
                          {this.state.errormsgSite}
                        </p>
                      </div>

                      <div className="DialogInputs">
                        <TextField
                          placeholder="Coordinates"
                          type="text"
                          id="standard-basic-4"
                          label={!this.state.coordinates ? "Coordinates" : ""}
                          variant="standard"
                          value={this.state.coordinates}
                          disabled={this.state.showFile ? true : false}
                          onChange={(event) => {
                            const input = event.target.value;
                            if (/^[\d,.]+$/.test(input) || input === "") {
                              this.setState({
                                coordinates: input,
                                displayErrorMessage: null,
                              });
                            } else {
                              this.setState({
                                displayErrorMessage: "invalid coordinates",
                              });
                            }
                          }}
                        />
                      </div>
                      <div
                        onClick={() => {
                          this.state.deviceCluster
                            ? this.setCoordinates(this.state.deviceCluster)
                            : this.setCoordinates("india");
                        }}
                        style={{
                          fontSize: "xx-small",
                          color: "red",
                          cursor: "pointer",
                        }}
                      >
                        Click here to select Coordinates from Map
                      </div>

                      <select
                        style={{ width: "68%", marginTop: "3%" }}
                        disabled={this.state.showFile ? true : false}
                        className="intervalLabel"
                        value={this.state.device_type}
                        onChange={(event) => {
                          this.setState({
                            device_type: event.target.value,
                            errormsgType:
                              event.target.value.trim() === ""
                                ? "*required"
                                : null,
                          });
                        }}
                      >
                        <option value={null}>Select Device Type</option>
                        <option value="CSAR">CSAR</option>
                        <option value="DUAR">DUAR</option>
                        <option value="CUAR">CUAR</option>
                      </select>

                      <select style={{ width: "68%", marginTop: "3%" }}className="intervalLabel"value={this.state.device_type}
                        onChange={(event) => {this.setState({ circle: event.target.value,});}}
                      >
                        <option value={null}>Select Circle</option>
                        {indianStates.map(circle=>(
                          <option key={circle} value={circle}>{circle}</option>
                        ))}
                      </select>
                    </div>

                    {this.state.showMap ? (
                      <Map
                        location={
                          this.state.default_coordinates
                            ? this.state.default_coordinates
                            : [20.5937, 78.9629]
                        }
                        from="network"
                        onMapClick={this.handleMapClick}
                      />
                    ) : null}
                  </div>
                  <div>
                    <button
                      className="btn btn-primary mb-3"
                      disabled={
                        deviceIP &&
                        deviceCluster &&
                        deviceSite &&
                        coordinates &&
                        device_type
                          ? false
                          : true
                      }
                      onClick={() => {
                        this.addToWhitelist();
                      }}
                    >
                      Confirm
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <Upload inventory={this.state.inventory} />
                </div>
              )}
            </div>
          </div>
        ) : null}

        {this.state.openEditWhitelist ? (
          <div
            className={
              !this.state.showMap ? "popupSoft centerCol" : "popupSoft increase"
            }
            style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
          >
            <div
              className="popup-innerSoft"
              style={this.state.showMap ? { width: "61%" } : { width: "30%" }}
            >
              <div style={{ display: "flex" }}>
                <div className="new_device_header">Update in Whitelist</div>
                <div
                  className="close"
                  style={{ position: "absolute", right: "30px" }}
                  onClick={(e) =>
                    this.setState({ openEditWhitelist: false, showMap: false })
                  }
                >
                  &times;
                </div>
              </div>

              <div style={{ margin: "20px", marginLeft: "57px" }}>
                <div>
                    <TextField
                      placeholder="xxx.xxx.xxx.xxx"
                      disabled={true}
                      type="ipadd"
                      id="standard-basic-2"
                      label="IP-Address*"
                      variant="standard"
                      value={this.state.ip_add}
                    />
                     <TextField
                      placeholder="circle"
                      type="text"
                      id="standard-basic-2"
                      label="CIRCLE*"
                      variant="standard"
                      value={this.state.circle}
                      onChange={(event) => {
                        this.setState({circle: event.target.value})
                        
                      }}
                    />
                  <div >
                    <TextField
                      placeholder="cluster"
                      type="text"
                      id="standard-basic-2"
                      label="CLUSTER*"
                      variant="standard"
                      value={this.state.cluster_name}
                      onChange={(event) => {
                        var isValidCluster = this.containsOnlyLetters(
                          event.target.value
                        );
                        if (isValidCluster) {
                          this.setState({
                            cluster_name: event.target.value,
                            errormsgCluster: null,
                          });
                        } else if (event.target.value.length === 0) {
                          this.setState({
                            cluster_name: event.target.value,
                            errormsgCluster: null,
                          });
                        } else {
                          this.setState({
                            errormsgCluster: "Invalid Cluster name",
                          });
                        }
                      }}
                    />
                    <p style={{ color: "red", fontSize: "small" }}>
                      {this.state.cluster_name
                        ? null
                        : this.state.errormsgCluster}
                    </p>
                  </div>
                  <div className="">
                    <TextField
                      placeholder="site"
                      type="text"
                      id="standard-basic-2"
                      label="SITE*"
                      variant="standard"
                      value={this.state.site_name}
                      onChange={(event) => {
                        var isValidSite = this.containsOnlyLetters(
                          event.target.value
                        );
                        if (isValidSite) {
                          this.setState({
                            site_name: event.target.value,
                            errormsgSite: null,
                          });
                        } else if (event.target.value.length === 0) {
                          this.setState({
                            site_name: event.target.value,
                            errormsgSite: null,
                          });
                        } else {
                          this.setState({ errormsgSite: "Invalid Site name" });
                        }
                      }}
                    />
                    <p style={{ color: "red", fontSize: "small" }}>
                      {this.state.site_name
                        ? null
                        : this.state.errormsgSite}
                    </p>
                  </div>
                  <div className="">
                    <TextField
                      placeholder="Coordinates"
                      type="text"
                      id="standard-basic-4"
                      label={
                        !this.state.coordinates
                          ? "Coordinates (in lat,long)"
                          : ""
                      }
                      variant="standard"
                      value={this.state.coordinates}
                      disabled={this.state.showFile ? true : false}
                      onChange={(event) => {
                        const input = event.target.value;
                        if (/^[\d,.]+$/.test(input) || input === "") {
                          this.setState({
                            coordinates: input,
                            displayErrorMessage1: null,
                          });
                        } else {
                          this.setState({
                            displayErrorMessage1: "invalid coordinates",
                          });
                        }
                      }}
                    />
                    <div
                      onClick={() => {
                        this.state.cluster_name
                          ? this.setCoordinates(this.state.cluster_name)
                          : this.setCoordinates("india");
                      }}
                      style={{
                        fontSize: "xx-small",
                        color: "red",
                        cursor: "pointer",
                      }}
                    >
                      Click here to select Coordinates from Map
                    </div>
                  </div>
                  <select
                    style={{
                      width: "200px",
                      marginTop: "5%",
                      fontSize: "small",
                    }}
                    disabled={this.state.showFile ? true : false}
                    className="intervalLabel"
                    value={this.state.device_type}
                    onChange={(event) => {
                      this.setState({
                        device_type: event.target.value,
                        errormsgType:
                          event.target.value.trim() === "" ? "*required" : null,
                      });
                    }}
                  >
                    <option value={null}>Select Device Type To Change</option>
                    <option value="CSAR">CSAR</option>
                    <option value="DUAR">DUAR</option>
                    <option value="CUAR">CUAR</option>
                  </select>
                  <div style={{ color: "darkgoldenrod", fontSize: "12px" }}>
                    {this.state.displayErrorMessage1
                      ? this.state.displayErrorMessage1
                      : this.state.errormsg}
                  </div>
                  <div style={{ marginTop: "20px" }}>
                    <button
                      onClick={() => this.updateWhitelist()}
                      disabled={
                        ip_add &&
                        cluster_name &&
                        site_name &&
                        coordinates &&
                        device_type
                          ? false
                          : true
                      }
                      className="btn btn-primary mb-3"
                    >
                      Confirm
                    </button>
                  </div>
                </div>
                {this.state.showMap ? (
                  <Map
                    location={
                      this.state.default_coordinates
                        ? this.state.default_coordinates
                        : [20.5937, 78.9629]
                    }
                    from="network"
                    onMapClick={this.handleMapClick}
                  />
                ) : null}
              </div>
            </div>
          </div>
        ) : null}

        {showAddTab ? (
       

        <div className="PopUp" style={{top:"25%",left:"14%",opacity:"1",width:"73%"}}>
          <div style={{ color: "#344767", fontWeight: "600",fontSize:"17px",position:"fixed" }}>
            Add Routers To DeviceList:
            <span><img style={{marginLeft:"728px"}} src={close} alt="" width={10} onClick={()=>this.setState({showAddTab:false})}/></span>
          </div>
          <div style={{marginTop:"4%",maxHeight:"350px",overflow:"auto"}}>
            <table className="myTable" >
                  <thead style={{ fontSize: "medium" }}>
                      <tr>
                        <th>IP</th>
                        <th>Cluster</th>
                        <th>Site</th>
                        <th>Type</th>
                        <th>Name<span onClick={() => this.copyValue('name')}><img src={copy} alt="" width={15} /></span></th>
                        <th>Port<span onClick={() => this.copyValue('port')}><img src={copy} alt="" width={15} /></span></th>
                        <th>Username<span onClick={() => this.copyValue('username')}><img src={copy} alt="" width={15} /></span></th>
                        <th>Password<span onClick={() => this.copyValue('password')}><img src={copy} alt="" width={15} /></span></th>

                      </tr>
                  </thead>
                  <tbody style={{ fontSize: "14px" }}>
                      {checkedList.map(device => (
                          <tr key={device.ip}>
                              <td>{device.ip}</td>
                              <td>{device.cluster}</td>
                              <td>{device.site}</td>
                              <td>{device.device_type}</td>
                              <td><input className="isis-config-module-input" type="text" value={data[device.ip]?.name || ''} onChange={(e) => this.handleDeviceNameChange(device.ip, e.target.value)} /></td>
                              <td><input className="isis-config-module-input" type="text" value={data[device.ip]?.port || ''} onChange={(e) => this.handleDevicePortChange(device.ip, e.target.value)} /></td>
                              <td><input className="isis-config-module-input" type="text" value={data[device.ip]?.username || ''} onChange={(e) => this.handleDeviceUsernameChange(device.ip, e.target.value)} /></td>
                              <td><input className="isis-config-module-input" type="text" value={data[device.ip]?.password || ''} onChange={(e) => this.handleDevicePasswordChange(device.ip, e.target.value)} /></td>
                          </tr>
                      ))}
                  </tbody>
            </table>
          </div>
          <div style={{paddingBottom:"3%"}}><button className="btn btn-primary mb-3" onClick={this.handleSave} 
          // style={{position:"fixed",right:"15%",borderRadius:"3px"}}
          >Submit</button></div>
        </div>
        ) : null}
      </div>
      
    );
  }
}
export default WhitelistPanel;

