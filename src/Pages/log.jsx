import React from 'react';
import { CSVLink } from "react-csv";
import jsPDF from "jspdf";
import "jspdf-autotable";
import sortDown from '../Images/dropDown.png'
import sortUp from '../Images/arrow-up.png';
import close from '../Images/close.png';
import Loading from '../Components/loader';
import Pagination from "react-js-pagination";
import { PageItem as BootstrapPageItem } from 'react-bootstrap';

class LogPanel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      is_fetching: false,
      sortDirection: "asc",
      sortColumn:null,
      serverIP: process.env.REACT_APP_CLIENT_IP,
      device_id: null,
      activePage: 1,
      itemsPerPage: 5,
      selectedLogType: 'configuration', // Default selected log type
      logs: [], // Array to store fetched logs
      csvReport:null,
      filteredLogs:[],isOpen:false,
      filter: {
        operation: "",
        unique_id: "",
        ip_address: "",
        request_time: "",
        username: "",
      },
      openFilterPopup:false,
      openDropdownHeader: {},
      fixthHead:{cursor:'pointer',fontSize:"small"},
    };
  }

  handleLogTypeChange = (logType) => {
    this.setState({ selectedLogType: logType }, () => {
      this.fetchLogs(logType); // Fetch logs when log type changes
      this.clearFilter()
    });
  };
  
  fetchLogs = (logType) => {
    this.setState({ is_fetching: true, filteredLogs: [], logs: [] }, () => {
      let port = 5000;
      if (logType === 'configuration') {
        port = 5000;
      } else if (logType === 'inventory') {
        port = 5005;
      } else if (logType === 'user') {
        port = 5006;
      } else if (logType === 'notification') {
        port = 5003;
      } else if (logType === 'performance') {
        port = 5001;
      } else if (logType === 'fault') {
        port = 5002;
      }
  
      fetch(`http://${this.state.serverIP}:${port}/${logType}-management/system-logs`, {
        mode: 'cors',
        method: 'GET',
        headers: {
          'Access-Control-Allow-Origin': 'http://localhost:3000',
          'username': sessionStorage.getItem('username'),
        },
      })
        .then((resp) => resp.json())
        .then((resp) => {
          console.log(resp, logType, 'logs');
          this.setState({ is_fetching: false });
          if(resp && Array.isArray(resp))
          {
            this.setState({ logs: resp, filteredLogs: resp }); 
          }
          else{
            this.setState({ logs: [], filteredLogs: [] }); 
          }
          
          var Logheaders = [
            { label: "Operation", key: "operation" },
            { label: "IP Address", key: "ip_address" },
            { label: "Unique ID", key: "unique_id" },
            { label: "Time Taken", key: "time_taken" },
            { label: "Username", key: "username" },
          ];
          this.setState({ pdfData: resp });
          this.setState({
            csvReport: {
              data: resp,
              headers: Logheaders,
              filename: 'LogReport.csv'
            }
          });
        })
        .catch((error) => {
          console.error('Error fetching logs:', error);
        });
    });
  };
  
  exportPDF = (id) => {
    var currentTime=new Date().toLocaleString().replace(/:/g, '-');
    const unit = "pt";
    const size = "A4"; // Use A1, A2, A3 or A4
    const orientation = "portrait"; // portrait or landscape
    const marginLeft = 40;
    const doc = new jsPDF(orientation, unit, size);
    doc.setFontSize(15);
    const title = "Log Report";
    const headers = [["operation","unique_id","time","username","ip_address","body",]];
    var data = this.state.filteredLogs.map(elt=> [elt.operation,elt.unique_id,elt.request_time,elt.username, elt.ip_address,JSON.stringify(elt.body, null, 2)]);
    let content = {
      startY: 50,
      head: headers,
      body: data
    };

    doc.text(title, marginLeft, 40);
    doc.autoTable(content);
    doc.save(`LogReport ${currentTime}.pdf`)
  }
  componentDidMount() {
    document.addEventListener('click', this.handleDocumentClick);
    this.fetchLogs(this.state.selectedLogType);
  }

  handleGlobalClick = (event) => {
    const target = event.target;
    if (!target.closest(".filter-popup")) {
      this.setState({ openDropdownHeader: null });
    }
  };
  handlePageChange = (pageNumber) => {
    this.setState({ activePage: pageNumber });
}
  
  handleFilterChange = (columnName, value) => {
    this.setState((prevState) => ({
      filter: {
        ...prevState.filter,
        [columnName]: Array.isArray(value) ? value : [value], // Convert single-select value to an array for checkboxes
      },
    }));
  };
  
  applyFilter = () => {
    const {logs, filter } = this.state;
    const filteredLogs = logs.filter((log) => {
      return (
        (!filter.operation || !filter.operation.length || filter.operation.includes(log.operation?.toLowerCase())) &&
        (!filter.unique_id || !filter.unique_id.length || filter.unique_id.includes(log.unique_id?.toLowerCase())) &&
        (!filter.ip_address || !filter.ip_address.length || filter.ip_address.includes(log.ip_address?.toLowerCase())) &&
        (!filter.request_time || !filter.request_time.length || filter.request_time.includes(log.request_time?.toLowerCase())) &&
        (!filter.username || !filter.username.length || filter.username.includes(log.username?.toLowerCase()))
      );
    });
    this.setState({ filteredLogs, openFilterPopup: false });
  };
  
  
  clearFilter = () => {
    // Clear the filter and show all logs
    this.setState({
      filter: Object.keys(this.state.filter).reduce((acc, key) => {
        return { ...acc, [key]: [] }; // Clear all filter values
      }, {}),
      filteredLogs: this.state.logs,
      openFilterPopup: false,
    });
  };
  handleCheckboxChange = (header, value) => {
    const { filter } = this.state;
    const isChecked = filter[header].includes(value);
  
    this.setState((prevState) => ({
      filter: {
        ...prevState.filter,
        [header]: isChecked
          ? prevState.filter[header].filter((item) => item !== value) // Remove the value if it was already selected
          : [...prevState.filter[header], value], // Add the value if it was not selected
      },
    }));
  };
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
    document.removeEventListener('click', this.handleDocumentClick);
  }
  sortLogTable = (e,column) => {
    const { sortColumn, sortDirection, filteredLogs } = this.state;
    let direction="asc"
    if (sortColumn === column && sortDirection === 'asc') {
      direction = 'desc';
      this.setState({sortOrder:'desc'})
  }
  else{
      this.setState({sortOrder:'asc'})
  }
    const sortedItems = filteredLogs.sort((a, b) => {
      if(a[column] && b[column]){
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
    });
    this.setState({
      filteredLogs: sortedItems,
      sortColumn: column,
      sortDirection: direction,
      selectedthSort: column
    });
       
  }
  render() {
    const { isOpen,logs, filter,activePage,itemsPerPage} = this.state;
    const {  filteredLogs } = this.state;
    let currentItems;
    const indexOfLastItem = activePage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    if(filteredLogs ){
    currentItems = filteredLogs.slice(indexOfFirstItem, indexOfLastItem);
    }
    const nonFilterableColumns = ["response_body",'request_body','response_status','time_taken'];
    const tableHeaders = ['operation','unique_id','ip_address','request_time','username','request_body','response_status','time_taken','response_body'];
    const uniqueOptions = tableHeaders.reduce((options, header) => {
      if (!nonFilterableColumns.includes(header)) {
        options[header] = Array.from(new Set(logs.map((log) => log[header]))).filter(Boolean);
      }
      return options;
    }, {});
    return (
      <div style={{margin:'1%',width:'98%'}}>
      {this.state.is_fetching===true?(
        <Loading/>
        ):null}
            <div>
              <div style={{display:'flex',justifyContent:"space-between"}}>
                <select
                  className='log-type-select'
                  value={this.state.selectedLogType}
                  onChange={(e) => this.handleLogTypeChange(e.target.value)}
                >
                  <option value="configuration">Configuration Management</option>
                  <option value="inventory">Inventory Management</option>
                  <option value="notification">Notification Management</option>
                  <option value="user">User Management</option>
                  <option value="performance">Performance Management</option>
                  <option value="fault">Fault Management</option>
                </select>;
                <div style={{display:'flex'}}><div className='tabbox'
                onClick={(e)=>this.setState(prevState => ({
                  openFilterPopup: !prevState.openFilterPopup
                }))
                }
                >
                <img alt="" className='tabicon' src={require('../Images/filter.png')}></img>Filter
                </div>
                <div className="tabbox" style={{marginRight:"0px"}}
                  onClick={this.toggleDropdown} ref={(ref) => (this.dropdownRef = ref)} >
                    <img alt="" className='tabicon' src={require('../Images/report.png')}></img>
                    Reports
                    
                    {isOpen?(
                        <div className='downloadOptions' style={{marginTop:'7%',marginLeft:'1%'}}>
                        <div className='optionsBox' onClick={(e)=>{ this.exportPDF()}}><img alt="" className='tabicon' src={require('../Images/pdf.png')}></img>Download Report PDF</div>
                        {this.state.csvReport?(
                        <CSVLink {...this.state.csvReport}><div className='optionsBox' style={{color:'black',textTransform:null}}><img alt="" className='tabicon' src={require('../Images/csv.png')}></img>Download Report CSV</div></CSVLink>
                        ):<div className='optionsBox' style={{color:'black',textTransform:null}}><img alt="" className='tabicon' src={require('../Images/csv.png')}></img>down</div>}
                    </div>
                    ):null}
                </div></div>
              </div>
              

              {this.state.openFilterPopup?(
                <div className="filter-popup">
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
                    <div style={{ display: 'flex', marginTop: '10%', height: '47px' }}>
                      <button onClick={this.applyFilter} className='apply-filter-btn'>Apply</button>
                      <button onClick={this.clearFilter} className='clear-filter-btn'>Clear</button>
                    </div>
                  </div>
                </div>
              ):null}


              <div style={{ marginTop: "10px" }}>
                {filteredLogs && filteredLogs.length > 0 ? (
                  <div style={{ height: "350px"}}>
                    <table className='user_table' style={{margin: "2px 0px 15px 0px"}}>
                      <thead className='user_table_head'> 
                        <tr style={{backgroundColor:'#e5e8ff',color:'black'}}>
                          {tableHeaders.map((header) => (
                            <th onClick={(e) => this.sortLogTable(e,header)} style={this.state.selectedthSort && this.state.selectedthSort===header?this.state.fixthHead:({cursor:'pointer',fontSize:"smaller"})} key={header}>
                              <div>{header}</div>
                              <img alt="" style={{marginLeft:'8px',marginTop:'3px'}} src={this.state.selectedthSort === header && this.state.sortOrder === "asc" ? sortUp : sortDown} width={10}/>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {currentItems.map((log) => (
                          <tr key={log.id}>
                            {tableHeaders.map((header) => (
                              <td key={header}>
                                {header === "request_body" || header === "response_body" ? (
                                  <button
                                    className="btndel"
                                    onClick={() => {
                                      alert(JSON.stringify(log[header], null, 2));
                                    }}
                                  >
                                    View
                                  </button>
                                ) : header === 'operation' ? (
                                  String(log[header])
                                ) : header !== 'response_body' ? (
                                  String(log[header])
                                ) : String(log[header].status)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                 
                  </div>
                     
                ) : (
                  <p>No logs found.</p>
                )}
                
              </div>
            </div>
            
        <Pagination
                     activePage={activePage}
                     itemsCountPerPage={itemsPerPage}
                     totalItemsCount={filteredLogs.length}
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
      
    );
  }
}

export default LogPanel;
