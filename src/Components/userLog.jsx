import React, { Component } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import filter from '../Images/filter.png';
import sortDown from "../Images/dropDown.png";
import sortUp from "../Images/arrow-up.png";
import Pagination from "react-js-pagination";
import { PageItem as BootstrapPageItem } from 'react-bootstrap';
class FancyTable extends Component {
  constructor(props){
    super(props);
    this.state={
      userDetails:this.props.data,
      staticUserList:this.props.data,
      sortDirection: "asc",isOpen:false,
      selectedthSort:null,fixthHead:{color:'#297c97e3',cursor:'pointer',position:'static'},
      openFilters: {},
      activePage: 1,isOpenShelve:false,
            itemsPerPage: 5,
      filterOptions: {
        'role':[],
        'is_active': [],
        'username':[],
        "email":[],
        "date_added":[],
        "data_modified":[]
      },
      checkedOptions: [],
    }
    this.sortTable=this.sortTable.bind(this);
  }

  componentDidMount(){
    const { data } = this.props;
    this.setState({userDetails:data})
    const{filterOptions}=this.state;
    const devices = data; // Your original list of devices
    for (let i = 0; i < devices.length; i++) {
      if (!filterOptions['role'].includes(devices[i].role)) {
        filterOptions['role'].push(devices[i].role);
      }
      if (!filterOptions['is_active'].includes(devices[i].is_active)) {
        filterOptions['is_active'].push(devices[i].is_active);
      }
      if (!filterOptions['date_added'].includes(devices[i].date_added)) {
        filterOptions['date_added'].push(devices[i].date_added);
      }
      // if (!filterOptions['date_modified'].includes(devices[i].date_modified)) {
      //   filterOptions['date_modified'].push(devices[i].date_modified);
      // }
      
    }
    console.log(filterOptions,'filterptions') 
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
      console.log(updatedOpenFilters,'updatedOpenFilters')
      return { openFilters: updatedOpenFilters };
    });
  }
 
  sortDeviceListTable = (e, key, sortOrder) => {
    const { userDetails } = this.state;  
    const sortedItems = userDetails.slice(0); // Create a copy to avoid mutating the original data
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
    this.setState({
      userDetails: sortedItems,
      sortColumn: key,
      sortDirection: sortOrder,
      selectedthSort: key,
    });
  
  };
  handlePageChange = (pageNumber) => {
    this.setState({ activePage: pageNumber });
}
  

  filterDeviceTable(option) {
    const { checkedOptions ,staticUserList} = this.state;
    console.log(checkedOptions)
    var temp=this.state.userDetails;
    if(option==="clear"){
        this.setState({userDetails:staticUserList})
    }
    else{
      if (checkedOptions.length === 0) {
        this.setState({ routerDetails:temp});
        return;
      }
      const filteredDevices = staticUserList.filter((device) => {
        return checkedOptions.includes(device[option]);
      });
      this.setState({ userDetails:filteredDevices });
    } 
  }

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
  
  sortTable = (column) => {
    const { sortColumn, sortDirection, userDetails } = this.state;
    console.log(column);
    let direction = 'asc';
    if (sortColumn === column && sortDirection === 'asc') {
      direction = 'desc';
      this.setState({ sortOrder: 'desc' });
    } else {
      this.setState({ sortOrder: 'asc' });
    }
    if (column === 'date_added' || column === 'date_modified' || column === 'login_time' || column === 'logout_time') {
 
      const sortedItems = userDetails.sort((a, b) => {
        if (a[column] && b[column]) {
          const aTimestamp = new Date(a[column]);
          const bTimestamp = new Date(b[column]);
          return direction === 'asc' ? aTimestamp - bTimestamp : bTimestamp - aTimestamp;
        }
      });
      this.setState({
        userDetails: sortedItems,
        sortColumn: column,
        sortDirection: direction,
        selectedthSort: column
      });
    }
    else {      
      const sortedItems = userDetails.sort((a, b) => {  
          if (column === 'name')
          {
            const s=a["first_name"]+ " " +a["last_name"];
          const r=b["first_name"]+ " " +b["last_name"];
          console.log(s,"s");
          var aValue=s.toString().toLowerCase();
          var bValue =r.toString().toLowerCase();
          }  
        else
         {
            console.log(userDetails,"u");
          var aValue=a[column].toString().toLowerCase();
          var bValue =b[column].toString().toLowerCase();
          }
          console.log("a",aValue);
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
      });
      
      this.setState({
        userDetails: sortedItems,
        sortColumn: column,
        sortDirection: direction,
        selectedthSort: column
      });
    }
  }

  render() {
    const { data } = this.props;
    const {userDetails,activePage,itemsPerPage}=this.state;
    console.log(data,'props')
    const indexOfLastItem = activePage * itemsPerPage;
        const indexOfFirstItem = indexOfLastItem - itemsPerPage;
        

        const currentItems = userDetails.slice(indexOfFirstItem, indexOfLastItem);
 
    return (
      <div className="card user_card">
        <div className="card-header" style={{ color: 'rgb(52, 71, 103)', fontWeight: 'bold' }}>User Status</div>
        <div >
          <table className='userLogTable' >
            <thead className='user_table_head'> 
                <tr style={{backgroundColor:'#e5e8ff',color:'black'}}>
                <th onClick={() => this.sortTable("name")} style={this.state.selectedthSort && this.state.selectedthSort === "name" ? this.state.fixthHead : ({ cursor: 'pointer', position: 'static' })}>Name<img alt="" style={{ marginLeft: '8px', marginTop: '3px' }} src={this.state.selectedthSort === "name" && this.state.sortOrder === "asc" ? sortUp : sortDown} width={10} /></th>
                  <th onClick={() => this.sortTable("role")} style={this.state.selectedthSort && this.state.selectedthSort === "role" ? this.state.fixthHead : ({ cursor: 'pointer', position: 'static' })}>Role<img alt="" style={{ marginLeft: '8px', marginTop: '3px' }} src={this.state.selectedthSort === "role" && this.state.sortOrder === "asc" ? sortUp : sortDown} width={10} /></th>
                  <th onClick={() => this.sortTable("date_added")} style={this.state.selectedthSort && this.state.selectedthSort === "date_added" ? this.state.fixthHead : ({ cursor: 'pointer', position: 'static' })}>Date Added<img alt="" style={{ marginLeft: '8px', marginTop: '3px' }} src={this.state.selectedthSort === "date_added" && this.state.sortOrder === "asc" ? sortUp : sortDown} width={10} /></th>
                  <th onClick={() => this.sortTable("date_modified")} style={this.state.selectedthSort && this.state.selectedthSort === "date_modifed" ? this.state.fixthHead : ({ cursor: 'pointer', position: 'static' })}>Date Modified<img alt="" style={{ marginLeft: '8px', marginTop: '3px' }} src={this.state.selectedthSort === "date_modified" && this.state.sortOrder === "asc" ? sortUp : sortDown} width={10} /></th>
                  <th onClick={() => this.sortTable("email")} style={this.state.selectedthSort && this.state.selectedthSort === "email" ? this.state.fixthHead : ({ cursor: 'pointer', position: 'static' })}>Email<img alt="" style={{ marginLeft: '8px', marginTop: '3px' }} src={this.state.selectedthSort === "email" && this.state.sortOrder === "asc" ? sortUp : sortDown} width={10} /></th>
                  <th onClick={() => this.sortTable("is_active")} style={this.state.selectedthSort && this.state.selectedthSort === "is_active" ? this.state.fixthHead : ({ cursor: 'pointer', position: 'static' })}>Active Status<img alt="" style={{ marginLeft: '8px', marginTop: '3px' }} src={this.state.selectedthSort === "is_active" && this.state.sortOrder === "asc" ? sortUp : sortDown} width={10} /></th>
                  <th onClick={() => this.sortTable("login_time")} style={this.state.selectedthSort && this.state.selectedthSort === "login_time" ? this.state.fixthHead : ({ cursor: 'pointer', position: 'static' })}>Last Login Time<img alt="" style={{ marginLeft: '8px', marginTop: '3px' }} src={this.state.selectedthSort === "login_time" && this.state.sortOrder === "asc" ? sortUp : sortDown} width={10} /></th>
                  <th onClick={() => this.sortTable("logout_time")} style={this.state.selectedthSort && this.state.selectedthSort === "logout_time" ? this.state.fixthHead : ({ cursor: 'pointer', position: 'static' })}>Last Loggedout Time<img alt="" style={{ marginLeft: '8px', marginTop: '3px' }} src={this.state.selectedthSort === "logout_time" && this.state.sortOrder === "asc" ? sortUp : sortDown} width={10} /></th>
                </tr>
              </thead>
              <tbody>
                {currentItems && currentItems.map((item, index) => (
                  <tr key={index} style={{ fontSize: 'xx-small' }}>
                    <td>{item.first_name} {item.last_name}</td>
                    <td>{item.role}</td>
                    <td>{item.date_added}</td>
                    <td>{item.date_modified}</td>
                    <td>{item.email}</td>
                    <td>
                      {item.is_active === 'True' ? (
                        <div style={{ display: 'flex' }}>
                          <div className='blinking-circle-green'></div>
                          <div style={{ marginLeft: '10%', color: 'green' }}>Active</div>
                        </div>
                      ) : (
                        <div style={{ display: 'flex' }}>
                          <div className='blinking-circle-red1'></div>
                          <div style={{ marginLeft: '10%', color: 'red' }}>Inactive</div>
                        </div>
                      )}
                    </td>
                    <td>{item.login_time}</td>
                    <td>{item.logout_time}</td>
                  </tr>
                ))}
              </tbody>
          </table>
          <div style={{margin:"10px 0px 0px 10px"}}>
            <Pagination
              activePage={activePage}
              itemsCountPerPage={itemsPerPage}
              totalItemsCount={userDetails.length}
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
        
      </div>
    );
  }
}

export default FancyTable;
