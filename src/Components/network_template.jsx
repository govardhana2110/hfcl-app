import React from 'react';
import Loading from '../Components/loader';
import Tooltip from '@mui/material/Tooltip';
import swal from 'sweetalert2';
import close from "../Images/close.png";
import 'leaflet/dist/leaflet.css';
import 'react-dropdown/style.css';
import TemplateMapper from '../Components/templateMapper.jsx'
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import remove from '../Images/closeS.png';
import sortDown from "../Images/dropDown.png";
import sortUp from "../Images/arrow-up.png";
import Pagination from "react-js-pagination";
import { PageItem as BootstrapPageItem } from 'react-bootstrap';
import filterim from "../Images/filter.png";
import DatePicker from 'react-datepicker';
import { CSVLink } from "react-csv";
import jsPDF from "jspdf";
import "../css/network_template.css";


class TemplatePannel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {

      is_fetching: false, inventory: null,
      serverIP: process.env.REACT_APP_CLIENT_IP,
      device_id: null,
      sortDirection: "asc",
      selectedOptions: [],
      selectedunique: [],
      temp: null,
      selectedthSort: null, fixthHead: { color: '#297c97e3', cursor: 'pointer', position: 'static' },
      activePage: 1,
      openFilterPopup: false,
      Template:[],
      setFlag:false,
      openFilterTab: false,
      itemsPerPage: 5,
      isOpen:false,
      csvReport: null,
      csvReportHistory: null,
      errormsg: null, showConfigurationComparator: null, templateList: null, connectedDevices: null, compareMulti: false,
      validIPState: false, GoldenTemplateSelectDevice: false, TemplateName: null, TemplateList: null, checked: [], templateDetails: null, openTemplateList: false, selectedTemplateId: null, timestamp_Filter: { start_time: new Date(), stop_time: new Date() },
      openTemplateTab: false, TemplateJsonData: null, selectedFile: null, showFileDetails: false, templateUploadResponse: null, errormsgGoldTemp: null, errormsgBulkConfig: null,
      checkedDevices: [], selectedKeyType: null, device_type: null, toEditDeviceType: null,
      openSelectDeviceList: false,
      showBlockSites: {}, showBlockDevice: {}, generateReport: false, deviceId: null, firstRowFirstDropdown: '',

      jsonData: '', jsonData2: '', selectedKey: '', content: null,
      firstType: null, firstContent: null, secondType: null, secondContent: null,

      errormsgTemplateInput: null,
      filter: {
        template_name: "",
        unique_id: ""
      },
      showDeviceList: true, openFilters: {},
      filterOptions: {
        'device_name': [],
        'device_type': [],
        'site_name': [],
        'cluster_name': [],
        'ip_add': [],
        'port': [],
        'role': [],
        'status': [],
        'username': []
      },
      checkedOptions: [], showTopologyTab: false,
    };
    this.closeViewTemplatePopUp = this.closeViewTemplatePopUp.bind(this);
  }

  goldenTemplateData() {
    this.fetchTemplateList()
    this.setState({ openTemplateList: true })
  }
  componentDidMount() {
    this.fetchTemplateList();
    sessionStorage.setItem('Connection', false)
    let role = sessionStorage.getItem('role_id');
    this.setState({ loggedInUserRole: role });

  }

  handleCheck(event) {
    let updatedList = [...this.state.checked];
    if (event.target.checked) {
      updatedList = [...this.state.checked, event.target.value];
    } else {
      updatedList.splice(this.state.checked.indexOf(event.target.value), 1);
    }
    console.log(updatedList, 'selected device')
    this.setState({ checked: updatedList });
  }

  fetchTemplateList() {
    this.setState({ isLoading: true })
    fetch(`http://${this.state.serverIP}:5000/configuration-management/configuration-templates-list`,
      {
        mode: 'cors',
        method: 'GET',
        headers: {
          'Access-Control-Allow-Origin': 'http://localhost:3000',
          'username': sessionStorage.getItem('username'),
          'Authorization': 'Bearer ' + JSON.parse(sessionStorage.getItem('login_data')).data.access_token,
        },
      })
      .then(resp => resp.json())
      .then(resp => {
        if (Array.isArray(resp)) {
          this.setState({ TemplateList: resp, temp: resp, Template:resp, isLoading: false })
          var temp = []
          for (let i = 0; i < resp.length; i++) {
            temp.push(resp[i].template_name)
          }
          console.log(temp)
          this.setState({ templateList: temp})

        }
        var TemplateHeaders = [
          {
            label: "Template_name",
            key: "template_name",
          },
          { label: "Saved From", key: "unique_id" },
          { label: "Date Added", key: "date_added" },
          { label: "Date Modified", key: "date_modified" },
          { label: "Date Modified", key: "date_modified" },

          { label: "Added By", key: "added_by" },
          { label: "Last Modified By", key: "last_modified_by" },


         
        ];
        var Temps = [];

        for (let i = 0; i < this.state.TemplateList.length; i++) {
          let headerDict = {};
          headerDict = {
            template_name:
              this.state.TemplateList[i]["template_name"],
            unique_id: this.state.TemplateList[i]["unique_id"],
            date_added: this.state.TemplateList[i]["date_added"],
            date_modified: this.state.TemplateList[i]["date_modified"],
            added_by: this.state.TemplateList[i]["added_by"],

            last_modified_by: this.state.TemplateList[i]["last_modified_by"],

          
          };
          Temps.push(headerDict);
        }
        this.setState({
          csvReport: {
            data: Temps,
            headers: TemplateHeaders,
            filename: "TemplateList.csv",
          },
        });

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
 
  selectTemplateHandleChange(e) {
    console.log(e[0]._id)
    this.setState({ selectedTemplateId: e[0]._id })
  }

  configureMultipleDevices() {
    const{routerDetails}=this.props;
    var dict = {}
    dict['unique_ids'] = []
    dict['template_id'] = this.state.selectedTemplateId
    for (var i = 0; i < routerDetails.length; i++) {
      var data = routerDetails
      var selected = this.state.checked
      var element_dict = {}
      if (selected.includes(data[i].unique_id)) {
        element_dict["ip_add"] = data[i]["ip_add"]
        element_dict["password"] = data[i]["password"]
        element_dict["port"] = data[i]["port"]
        element_dict["username"] = data[i]["username"]
        element_dict["unique_id"] = data[i]["unique_id"]
        dict["unique_ids"].push(element_dict)
      }
    }
    console.log(JSON.stringify(dict), 'configureMultipleDevices')
    fetch(`http://${this.state.serverIP}:5000/configuration-management/initiate-bulk-configuration`, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Access-Control-Allow-Origin': 'http://localhost:3000',
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'username': sessionStorage.getItem('username'),
        'Authorization': 'Bearer ' + JSON.parse(sessionStorage.getItem('login_data')).data.access_token,
      },
      body: JSON.stringify(dict)
    })
      .then(resp => resp.json())
      .then(resp => {
        this.setState({ configureMultipleDevices: resp });
        console.log(resp, 'bulk-config-response')
        if (resp.status) {
          alert(resp.status)
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
    this.setState({ openSelectDeviceList: false })
  }

  viewTemplateDetails(id) {
    this.setState({ openTemplateTab: true, openSelectDeviceList: false, errormsgBulkConfig: null, TemplateJsonData: null, is_fetching: true })
    fetch(`http://${this.state.serverIP}:5000/configuration-management/configuration-templates-details/${id}`,
      {
        mode: 'cors',
        method: 'GET',
        headers: {
          'Access-Control-Allow-Origin': 'http://localhost:3000',
          'username': sessionStorage.getItem('username'),
          'Authorization': 'Bearer ' + JSON.parse(sessionStorage.getItem('login_data')).data.access_token,
        },
      })
      .then(resp => resp.json())
      .then(resp => {
        this.setState({ templateDetails: resp, is_fetching: false })
        console.log(resp, 'templateInfo')
        if (resp.status) { alert(resp.status) }
        this.setState({ TemplateJsonData: resp }, () => {
          this.setState({ viewOrEditTemplate: true });
        });
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

  closeViewTemplatePopUp = () => {
    this.setState({ viewOrEditTemplate: false }); // Reset showConfigDetails to false when closing the popup
  };

  bulkConfigTemplate(data) {
    console.log(data)
    this.setState({
      openSelectDeviceList: true, openTemplateTab: false, errormsgBulkConfig: null,
      selectedTemplateId: data._id
    }, () => {
      this.setState({ selectedTemplateDetails: data })
    })
  }

  onFileChange = (e) => {
    const file = e.target.files[0]; // accesing file
    console.log(e.target.files);
    this.setState({ selectedFile: file }); // storing file
  };

  onFileUpload = () => {
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
        this.setState({ templateUploadResponse: file_upload_response })
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

  deleteConfirmation(id) {
    this.setState({ errormsgBulkConfig: null })
    swal.fire({
      title: "",
      text: "Do you want to delete the selected template?",
      type: "warning",
      showCancelButton: true,
      confirmButtonColor: "#DD6B55",
      confirmButtonText: "Yes",
      cancelButtonText: "No",
      closeOnConfirm: true,
      closeOnCancel: true
    })
      .then((result) => {
        if (result.isConfirmed) {
          var dict = {}
          dict["template_id"] = id
          fetch(`http://${this.state.serverIP}:5000/configuration-management/delete-config-template/${id}`,
            {
              mode: 'cors',
              method: 'DELETE',
              headers: {
                'Access-Control-Allow-Origin': 'http://localhost:3000',
                'username': sessionStorage.getItem('username'),
                'Authorization': 'Bearer ' + JSON.parse(sessionStorage.getItem('login_data')).data.access_token,
              }, body: JSON.stringify(dict)
            })
            .then(resp => resp.json())
            .then(resp => {
              console.log(resp, 'hgh');
              if (resp.status === "Version deleted Successfully") {
                swal.fire({
                  title: 'Template deleted',
                  text: 'SUCCESS',
                  width: 300,
                  height: 40,
                  color: 'green',
                  icon: 'success',
                })
              }
              this.fetchTemplateList();
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
      });
  }

  handleCheckboxChange = (header, value) => {
    const { filter } = this.state;
    const isChecked = filter[header].includes(value);
    console.log(value,"value");
    console.log(isChecked,"check");

    this.setState((prevState) => ({
      filter: {
        ...prevState.filter,
        [header]: isChecked
          ? prevState.filter[header].filter((item) => item !== value) // Remove the value if it was already selected
          : [...prevState.filter[header], value], // Add the value if it was not selected
      },
    }));
  };

  exportTemplateListPdf = () => {
    const { TemplateList } = this.state;
    var currentTime = new Date().toLocaleString().replace(/:/g, "-");
    if (TemplateList && TemplateList.length > 0) {
      const unit = "pt";
      const size = "A4";
      const orientation = "portrait";
      const marginLeft = 40;
      const doc = new jsPDF(orientation, unit, size);
      doc.setFontSize(15);
      const title = "Template List";
      const headers1 = [["template_name","unique_id","date_added","date_modified","added_by","last_modified_by"]];
      var data1 = TemplateList.map((elt) => [
        elt["template_name"],
        elt["unique_id"],
        elt["date_added"],
        elt["date_modified"],
        elt["added_by"],
        elt["last_modified_by"],

      ]);

      let content1 = {
        startY: 70,
        head: headers1,
        body: data1,
      };

      doc.text(title, marginLeft, 40);
      doc.setFontSize(15);
      doc.autoTable(content1);

      doc.save(`Template List ${currentTime}.pdf`);
    } else {
      alert("No data available");
    }
  };

  applyFilter = () => {
    const { TemplateList, filter } = this.state;
    let filteredLogs;
  
    
     filteredLogs = TemplateList.filter((log) => {
      return (
        (!filter.template_name || !filter.template_name.length || filter.template_name.includes(log.template_name)) &&
        (!filter.unique_id || !filter.unique_id.length || filter.unique_id.includes(log.unique_id)) &&
        (!filter.cluster_name || !filter.cluster_name.length || filter.cluster_name.includes(log.cluster_name)) &&
        (!filter.device_type || !filter.device_type.length || filter.device_type.includes(log.device_type))

      );
    }
    );
  
    
    this.setState({ TemplateList: filteredLogs, openFilterPopup: false });
  };

  clearFilter = () => {
    // Clear the filter and show all logs
    this.setState({
      filter: Object.keys(this.state.filter).reduce((acc, key) => {
        return { ...acc, [key]: [] }; // Clear all filter values
      }, {}),
      TemplateList: this.state.Template,

      openFilterPopup: false,
    });
    
  };

  toggleDropdown = () => {
    this.setState((prevState) => ({
      isOpen: !prevState.isOpen,
    }));
  };
  
  getRouterType(uniqueid) {
    const segments = uniqueid.split('-');
    const routerType = segments[segments.length - 1];
    return routerType;
  }

  handlePageChange = (pageNumber) => {
    this.setState({ activePage: pageNumber });
  }
  sortTable = (column) => {
    const { sortColumn, sortDirection, TemplateList } = this.state;
    let direction = 'asc';
    if (sortColumn === column && sortDirection === 'asc') {
      direction = 'desc';
      this.setState({ sortOrder: 'desc' });
    } else {
      this.setState({ sortOrder: 'asc' });
    }
    if (column === 'Data Added' || column === 'Data Modified') {
      const sortedItems = TemplateList.sort((a, b) => {
        if (a[column] && b[column]) {
          const aTimestamp = new Date(a[column]);
          const bTimestamp = new Date(b[column]);
          return direction === 'asc' ? aTimestamp - bTimestamp : bTimestamp - aTimestamp;
        }
      });
    }
    else {
      const sortedItems = TemplateList.sort((a, b) => {

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
          return 0;
        }
      });
      this.setState({
        TemplateList: sortedItems,
        sortColumn: column,
        sortDirection: direction,
        selectedthSort: column
      });
    }
  }

  checkBulkConfigStatus(){
    fetch(`http://${this.state.serverIP}:5000/configuration-management/bulk-operation-status`, {
      method: 'GET',
      mode: 'cors',
      headers: {
        'Access-Control-Allow-Origin': 'http://localhost:3000',
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'username': sessionStorage.getItem('username'),
        'Authorization': 'Bearer ' + JSON.parse(sessionStorage.getItem('login_data')).data.access_token,
      },
    })
      .then(resp => resp.json())
      .then(resp => {
        console.log(resp,"config-status")
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

  render() {
    const {routerDetails}=this.props;
    const {
      configureMultipleDevices,selectedTemplateDetails, filter, isOpen, Template, TemplateList, activePage, itemsPerPage, openFilterTab }
      = this.state;
    let currentItems;
    let uniqueOptions, tableHeaders, nonFilterableColumns;
    const indexOfLastItem = activePage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    if (TemplateList) {
      currentItems = TemplateList.slice(indexOfFirstItem, indexOfLastItem);
     
    }
    if (TemplateList) {
      nonFilterableColumns = ["coordinates"];
      tableHeaders = ["template_name", "unique_id"];
      uniqueOptions = tableHeaders.reduce((options, header) => {
        if (!nonFilterableColumns.includes(header)) {
          options[header] = Array.from(new Set(Template.map((log) => log[header]))).filter(Boolean);
        }
        return options;
      }, {});
    }


    return (
      <div style={{ backgroundColor: 'white', borderRadius: '20px', padding: '2%', paddingTop: '4%',height:"80vh",overflowY:"auto" }}>
        <div className="networkmaincontent" style={{ display: 'flex' ,justifyContent:"space-between"}}>
          <div style={{ color: '#344767', fontWeight: '600'}}>Template List</div>

          <div
            className='uploadGoldenTemplateBox'
            style={{ marginLeft: '39%' }}
          >
            <div style={{ color: '#344767', fontWeight: '600' ,fontSize:"15px"}}
              onClick={(e) => {
                this.setState((prevState) => ({
                  popOpenGolden: !prevState.popOpenGolden
                }));
              }}
            ><img alt="" className='tabicon' src={require('../Images/upload_file.png')}></img>
              Upload Golden Template(XML/JSON)
            </div>
            {this.state.popOpenGolden ? (
              <div>
                <div style={{ marginLeft: "10%", marginTop: "4%" }} >
                  <input type="file" onChange={this.onFileChange} />
                  <button className='btn btn-primary mb-3' style={{ marginLeft: "32%", marginTop: "5%", fontSize: "small", borderRadius: "2px" }} onClick={this.onFileUpload}>upload</button>
                  <div className='filterpopupHeader' style={{ color: "red", marginLeft: "17px" }}>{this.state.errormsgBulkConfig}</div>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <div className="templateFilter">
          <div onClick={this.toggleDropdown} ref={(ref) => (this.dropdownRef = ref)}  className="tabbox"
            style={
              this.state.showReport
                ? { color: "#004f68", fontWeight: "bold" }
                : null
            }
          >
            <img alt="" className="tabicon" src={require("../Images/report.png")} ></img>Reports
            
          </div>
          <div className='filter'>
            <div className='tabbox'
              onClick={(e) => {
                this.setState({ openFilterPopup: true });
              }}><img alt="" className='tabicon' src={require('../Images/filter.png')}></img>
              Filter
            </div>
          </div>
        </div>
        {isOpen && TemplateList ? (
              TemplateList.length > 0 ? (
                <div
                  className="downloadOptions"
                  style={{ marginTop: "1.5%",position:"fixed",marginLeft:"79%" }}
                >
                  <div
                    className="optionsBox"
                    onClick={(e) => {
                      this.exportTemplateListPdf();
                    }}
                  >
                    <img
                      alt=""
                      className="tabicon"
                      src={require("../Images/pdf.png")}
                    ></img>
                    TemplateList  PDF
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
                        TemplateList CSV
                      </div>
                    </CSVLink>
                  ) : (
                    <div
                      className="optionsBox"
                      style={{ color: "black", textTransform: null }}
                    >
                      <img
                        alt=""
                        className="tabicon"
                        src={require("../Images/csv.png")}
                      ></img>
                      TemplateList CSV
                    </div>
                  )}
                </div>
              ) : (
                <div className="downloadOptions"
                style={{ marginTop: "1.5%",position:"fixed",marginLeft:"79%" }}
                >
                  No Data
                </div>
              )
            ) : null}

        {this.state.openFilterPopup && TemplateList ? (
          <div className="filter-popup templatefilterpopup">
            <h className="filtertext">Filter By :</h>
            <img src={close} alt="" className='closeX' onClick={(e) => this.setState({ openFilterPopup: false })} />
            <div style={{ display: "flex", flexWrap: "wrap", marginLeft: '5%' }}>
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
                                  checked={filter[header].includes(option)}
                                  onChange={(e) =>
                                    this.handleCheckboxChange(header, e.target.value)
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
              <div style={{marginLeft:'49%'}}> </div>
              
              
              <div className="applyFilterbutton" style={{ display: 'flex', marginTop: '10%', marginBottom:'2%',height: '47px' }}>
                <button onClick={this.applyFilter} className='apply-filter-btn'>Apply</button>
                <button onClick={this.clearFilter} className='clear-filter-btn'>Clear</button>
              </div>
            </div>
          </div>
        ) : null}
      

        {currentItems ? (
          <div className='table_scroll'>
            <table className='user_table tablemargin'>
              <thead id='panels' className='user_table_head'>
                <tr style={{ backgroundColor: '#e5e8ff', color: 'black' }}>
                  <th onClick={() => this.sortTable("template_name")} style={this.state.selectedthSort && this.state.selectedthSort === "template_name" ? this.state.fixthHead : ({ cursor: 'pointer', position: 'static' })}>Templates<img alt="" style={{ marginLeft: '8px', marginTop: '2px' }} src={this.state.selectedthSort === "template_name" && this.state.sortOrder === "asc" ? sortUp : sortDown} width={10} /></th>
                  <th onClick={() => this.sortTable("unique_id")} style={this.state.selectedthSort && this.state.selectedthSort === "unique_id" ? this.state.fixthHead : ({ cursor: 'pointer', position: 'static' })}>Saved From<img alt="" style={{ marginLeft: '8px', marginTop: '2px' }} src={this.state.selectedthSort === "unique_id" && this.state.sortOrder === "asc" ? sortUp : sortDown} width={10} /></th>
                  <th onClick={() => this.sortTable("date_added")} style={this.state.selectedthSort && this.state.selectedthSort === "date_added" ? this.state.fixthHead : ({ cursor: 'pointer', position: 'static' })}>Date Added<img alt="" style={{ marginLeft: '8px', marginTop: '2px' }} src={this.state.selectedthSort === "date_added" && this.state.sortOrder === "asc" ? sortUp : sortDown} width={10} /></th>
                  <th onClick={() => this.sortTable("date_modified")} style={this.state.selectedthSort && this.state.selectedthSort === "date_modified" ? this.state.fixthHead : ({ cursor: 'pointer', position: 'static' })}>Date Modified<img alt="" style={{ marginLeft: '8px', marginTop: '2px' }} src={this.state.selectedthSort === "date_modified" && this.state.sortOrder === "asc" ? sortUp : sortDown} width={10} /></th>
                  <th onClick={() => this.sortTable("added_by")} style={this.state.selectedthSort && this.state.selectedthSort === "added_by" ? this.state.fixthHead : ({ cursor: 'pointer', position: 'static' })}>Added By<img alt="" style={{ marginLeft: '8px', marginTop: '2px' }} src={this.state.selectedthSort === "added_by" && this.state.sortOrder === "asc" ? sortUp : sortDown} width={10} /></th>
                  <th onClick={() => this.sortTable("last_modified_by")} style={this.state.selectedthSort && this.state.selectedthSort === "last_modified_by" ? this.state.fixthHead : ({ cursor: 'pointer', position: 'static' })}>Modified By<img alt="" style={{ marginLeft: '8px', marginTop: '2px' }} src={this.state.selectedthSort === "last_modified_by" && this.state.sortOrder === "asc" ? sortUp : sortDown} width={10} /></th>
                  <th style={{ minWidth: "50px" }}>View</th>
                  <th style={{ minWidth: "50px" }}>Apply</th>
                  <th style={{ minWidth: "50px" }}>Delete</th>
                </tr>
              </thead>
              <tbody >
                {currentItems.map((item, index) => (
                  <tr>
                    <td>{item.template_name}</td>
                    <td>{item.unique_id}</td>
                    <td>{item.date_added}</td>
                    <td>{item.date_modified}</td>
                    <td>{item.added_by}</td>
                    <td>{item.last_modified_by}</td>
                    <td><Tooltip title="View or Edit Template"><img style={{ cursor: 'pointer' }} alt='' src={require('../Images/view.png')} width={20} onClick={() => this.viewTemplateDetails(item._id)}></img></Tooltip></td>
                    <td><Tooltip title="Apply Template">
                      <img style={{ cursor: 'pointer' }} alt="" src={require('../Images/check.png')} width={20} onClick={() => this.bulkConfigTemplate(item)} />
                    </Tooltip></td>
                    <td><Tooltip title="Delete Template"><img alt="" style={{ cursor: 'pointer' }} src={require('../Images/remove.png')} width={15} onClick={() => this.deleteConfirmation(item._id)} /></Tooltip></td>
                  </tr>
                ))}
                {this.state.TemplateList && this.state.TemplateList.length > 0 ? (null) : (
                  <div style={{ fontSize: "16px", fontWeight: "500", margin: "2em" }}>**Templates Not Found**</div>
                )
                }
              </tbody>
            </table>
            <Pagination
              activePage={activePage}
              itemsCountPerPage={itemsPerPage}
              totalItemsCount={TemplateList.length}
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
          </div>
        ) : null}

        {this.state.viewOrEditTemplate && this.state.TemplateJsonData ? (
          <div className="popup-template">
            <div className='popup-template-content'>
              <div style={{ textAlign: 'right', margin: '10px', cursor: 'pointer', position: 'fixed', marginLeft: '85%', zIndex: '1000' }} onClick={(e) => this.setState({ viewOrEditTemplate: false })}><img src={remove} alt='' width={10} /></div>
              <div style={{ marginTop: "2%" }}>
                <TemplateMapper data={this.state.TemplateJsonData} closeViewTemplatePopUp={this.closeViewTemplatePopUp} />
              </div>
            </div>
          </div>
        ) : null}

        {routerDetails && this.state.openSelectDeviceList ? (
          <div style={{ boxShadow: "inset 0 0 5px 2px rgb(233 229 229)"}}>
            <div style={{ color: '#344767', fontWeight: '600', marginTop: '2%', marginLeft: '1.5%' }}>
              Select Devices to Apply Configuration
              {selectedTemplateDetails ? (
                <p style={{ fontSize: '12px', color: 'rgb(17 96 155)' }}>
                  Configuration Template: {selectedTemplateDetails.template_name} ({selectedTemplateDetails.unique_id})
                </p>
              ) : null}
            </div>
            {configureMultipleDevices?(
              <button style={{position:"relative",bottom:"40px",left:"90%",borderRadius:"2px"}} className='btn btn-primary mb-3' onClick={()=>this.checkBulkConfigStatus()}>status</button>
            ):null}
            
            <div style={{height:"300px",overflow:"auto",marginTop:"-45px"}}>
              <table className='user_table' style={{ width: '95%' }}>
                <thead id='panels' className='user_table_head'>
                  <tr style={{ backgroundColor: '#e5e8ff', color: "black" }}>
                    <th>IP</th>
                    <th>CLUSTER</th>
                    <th>SITE</th>
                    <th>PORT</th>
                    <th>SELECT</th>
                    <th><img style={{ cursor: 'pointer' }} alt="" src={require('../Images/remove.png')} width={15} onClick={() => this.setState({ openSelectDeviceList: false })}></img></th>
                  </tr>
                </thead>
                {routerDetails.map(item => (
                  item.ConnectionStatus ? (
                    <tbody id='panels' key={item._id} style={{ borderStyle: 'hidden', background: 'white' }}>
                      <tr>
                        <td>{item.ip_add}</td>
                        <td>{item.cluster_name}</td>
                        <td>{item.site_name}</td>
                        <td>{item.port}</td>
                        <td style={{ textAlign: 'center' }}><div className='list-container'><input type="checkbox" value={item.unique_id}
                          checked={this.state.checked.includes(item.unique_id)} style={{ visibility: 'visible', opacity: '1', width: '20px', height: '20px' }}
                          onChange={(e) => { this.handleCheck(e); console.log(e.target.value) }} /></div></td>
                        <td></td>
                      </tr>
                    </tbody>
                  ) : null
                ))}
              </table>
              <button 
                style={{position:"relative",left:"94%",borderRadius:"2px"}}
                disabled={this.state.checked.length > 0 ? false : true} className="btn btn-primary mb-3" onClick={() => this.configureMultipleDevices()}>
                Apply
              </button>
            </div>
          </div>
        ) : null}
        {this.state.isLoading === true ? (<Loading />) : null}

      </div>
    )
  }
}
export default TemplatePannel;
