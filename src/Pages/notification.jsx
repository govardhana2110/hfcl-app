import React from 'react';
import NewHeader from '../Components/header';
import NewLeftpanel from '../Components/leftPanel';
import Tooltip from '@mui/material/Tooltip';
import filter from '../Images/filter.png';
import 'bootstrap/dist/css/bootstrap.min.css';   
import search from '../Images/search.png'
import Loading from '../Components/loader';
import Pagination from "react-js-pagination";
import { PageItem as BootstrapPageItem } from 'react-bootstrap';
class NotificationPanel extends React.Component{
    constructor(props){
        super(props);
        this.state={
            activePage: 1,
            itemsPerPage: 5,
            serverIP:process.env.REACT_APP_CLIENT_IP,
            deviceID:null,
            view_response:null,
            fade_css:{opacity:'0.2',background:'#d6dde9'},
            getNotification:null,
            is_fetching:false,
            MessageRead:false,
            filteredNotification:[],
            hoveredRowIndex: null,
            typeFilter: '',
            readFilter: '',
            uniqueTypes: [], 
            uniqueReadOptions: ['All', "true", "false"], 
            isTypeDropdownOpen: false, 
            isReadDropdownOpen: false,
            checkedOptionsType:[],checkedOptionsRead:[],
            unreadCount:0,
        };
        this.fetch_notification=this.fetch_notification.bind(this);
    }
    componentDidMount(){
        const deviceID=sessionStorage.getItem('unique_id');
        this.setState({deviceID},()=>{
            console.log('inside')
            this.fetch_notification();
        })
    }

    fetch_notification(){
        this.setState({is_fetching:true})
        const {serverIP,deviceID}=this.state;
        fetch(`http://${serverIP}:5003/notification-management/notifications/${deviceID}`,
        {
            mode:'cors',
            headers:{'Access-Control-Allow-Origin':'http://localhost:3000',
            'username': sessionStorage.getItem('username'),
            'Authorization': 'Bearer ' + JSON.parse(sessionStorage.getItem('login_data')).data.access_token,  
                    },
        })
        .then(resp=>resp.json())
        .then(resp=>{
            this.setState({is_fetching:false})
            console.log(resp,'fetched notification')
            if(resp.status){
                alert('No notification')
            }
            else{
                this.setState({getNotification:resp,filteredNotification:resp}) 
                const uniqueTypes = Array.from(new Set(resp.map(notification => notification.type)));
                const totalCountReadFalse = resp.reduce((count, notification) => {
                    return count + (notification.read === false ? notification.occurrence : 0);
                }, 0);
                this.setState({ uniqueTypes });
                this.setState({unreadCount:totalCountReadFalse})
            }
            
            
        } )
    }

    handleViewContent(content) {
        alert(JSON.stringify(content, null, 2));
    }

    readNotification(content,type){
        const {serverIP,deviceID}=this.state;
        var dataobject={notif_type:type,content:content}
        console.log(dataobject)
        fetch(`http://${serverIP}:5003/notification-management/read-one/${deviceID}`, {                     
            method: 'POST', 
            mode: 'cors',  
            headers:{'Access-Control-Allow-Origin':'http://localhost:3000',  
                        'Accept':'application/json', 
                        'Content-Type':'application/json' ,
                        'username': sessionStorage.getItem('username'),
                        'Authorization': 'Bearer ' + JSON.parse(sessionStorage.getItem('login_data')).data.access_token
                    }, 
                        body: JSON.stringify(dataobject)                    
                })
            .then(resp=>resp.json())
            .then(resp=>{this.setState({view_response:resp})
                console.log(resp,'view_response');
                if(resp.status==='Notification has been read'){
                    this.setState({MessageRead:true})
                    this.fetch_notification();
                }        
                })
    }

    handlePageChange = (pageNumber) => {
        this.setState({ activePage: pageNumber });
    }

    handleDropdownToggle(header, event) {
    
        const isSelectInsideType = event.target.tagName.toLowerCase() === 'select';
    
        this.setState(prevState => {
            if (header === 'type' && !isSelectInsideType) {
                return { isTypeDropdownOpen: !prevState.isTypeDropdownOpen };
            } else if (header === 'read' && !isSelectInsideType) {
                return { isReadDropdownOpen: !prevState.isReadDropdownOpen };
            } else {
                this.sortNotifications(event,header);
            }
        });
    }  
    
    sortNotifications = (e,column) => {
        const { sortColumn, sortDirection, filteredNotification } = this.state;
        let direction="asc"
        if (sortColumn === column && sortDirection === 'asc') {
          direction = 'desc';
          this.setState({sortOrder:'desc'})
      }
      else{
          this.setState({sortOrder:'asc'})
      }
        const sortedItems = filteredNotification.sort((a, b) => {
          console.log(a,b)
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
          filteredNotification: sortedItems,
          sortColumn: column,
          sortDirection: direction,
          selectedthSort: column
        });
           
    }

    handleCheckboxFoTypeFilter = (option) => {
        const updatedCheckedOptions = [...this.state.checkedOptionsType];
        const optionIndex = updatedCheckedOptions.indexOf(option);
        if (optionIndex === -1) {
          updatedCheckedOptions.push(option);
        } else {
          updatedCheckedOptions.splice(optionIndex, 1)
        }
        console.log(updatedCheckedOptions)
        this.setState({ checkedOptionsType: updatedCheckedOptions });
    };
    handleCheckboxFoReadFilter = (option) => {
    const updatedCheckedOptions = [...this.state.checkedOptionsRead];
    const optionIndex = updatedCheckedOptions.indexOf(option);
    if (optionIndex === -1) {
        updatedCheckedOptions.push(option);
    } else {
        updatedCheckedOptions.splice(optionIndex, 1)
    }
    console.log(updatedCheckedOptions)
    this.setState({ checkedOptionsRead: updatedCheckedOptions });
    };
    
    filterNotifications() {
        const { getNotification, checkedOptionsType, checkedOptionsRead } = this.state;
        let filteredNotifications = getNotification;
        if (checkedOptionsType.length > 0) {
            filteredNotifications = filteredNotifications.filter(notification => {
                return checkedOptionsType.includes(notification.type);
            });
        }
        if (checkedOptionsRead.length > 0) {
            filteredNotifications = filteredNotifications.filter(notification => {
                return checkedOptionsRead.includes(notification.read.toString());
            });
        }
    
        const totalCountReadFalse = filteredNotifications.reduce((count, notification) => {
            return count + (notification.read === false ? notification.occurrence : 0);
        }, 0);    
        this.setState({ filteredNotification: filteredNotifications ,unreadCount:totalCountReadFalse});
    }
    
    clearNotification(type) {
        if (type === 'type') {
            this.setState({ checkedOptionsType: [] }, () => this.filterNotifications());
        } else if (type === 'read') {
            this.setState({ checkedOptionsRead: [] }, () => this.filterNotifications());
        }
    }

    updateFilteredNotificationWithSearchTerm(searchTerm) {
        const { getNotification } = this.state;
    
        if (!searchTerm) {
            this.setState({ filteredNotification: getNotification });
        } else {
            const lowerCaseSearchTerm = searchTerm.toLowerCase();
            const filteredNotifications = getNotification.filter(notification => {
                for (const key in notification) {
                    if (typeof notification[key] === 'string' && notification[key].toLowerCase().includes(lowerCaseSearchTerm)) {
                        return true;
                    }
                }
                return false;
            });
            const totalCountReadFalse = filteredNotifications.reduce((count, notification) => {
                return count + (notification.read === false ? notification.occurrence : 0);
            }, 0);
    
            this.setState({ filteredNotification: filteredNotifications ,unreadCount:totalCountReadFalse});
        }
    }
    
    handleSearchInputChange = (event) => {
        const searchTerm = event.target.value;
        this.setState({ searchTerm }, () => {
            console.log(searchTerm)
        });
    };
    
    render(){
        const { filteredNotification,
            activePage,
            itemsPerPage,
            getNotification,
            hoveredRowIndex,
            uniqueTypes,
            uniqueReadOptions,
            isTypeDropdownOpen,
            isReadDropdownOpen,
            searchTerm,unreadCount
        } = this.state;
        const tableHeaders = ['eventTime','type','content','read','occurrence'];

        const indexOfLastItem = activePage * itemsPerPage;
        const indexOfFirstItem = indexOfLastItem - itemsPerPage;
        let currentItems;
        if(filteredNotification!== null){
           currentItems = filteredNotification.slice(indexOfFirstItem, indexOfLastItem);
        }

        return(
            <div className='page' style={{height:'100%'}}>
                <div style={{display:'flex'}}>
                    <NewLeftpanel page='notification'/>
                    <div style={{flex:'4'}}>
                        <div className='head_cover'><NewHeader header_name='Notification Panel' path='Config'/></div>
                        <div style={{marginLeft:'18%',marginTop:'9%'}}>
                            <div className='notifContent'>
                                <div style={{display:"flex",justifyContent:"space-between"}}>
                                    <div style={{display:"flex"}}>
                                        <div className='unreadCountKey'>Unread Notification:</div>
                                        <span className='unreadCountValue'>{unreadCount}</span>
                                    </div>
                                    <div class="input-group" style={{ width: "24%" }}>
                                        <input
                                            type="search"
                                            class="form-control rounded"
                                            placeholder="Search"
                                            aria-label="Search"
                                            aria-describedby="search-addon"
                                            value={searchTerm}
                                            onChange={this.handleSearchInputChange}
                                        />
                                        <span style={{ marginLeft: "2%" }} onClick={()=>this.updateFilteredNotificationWithSearchTerm(searchTerm)}><img src={search} alt='' width={15} /></span>
                                    </div>
                                </div>
                            
                                <div style={{ height: "380px"}}>
                                <table className='user_table'>
                                    <thead className='user_table_head'> 
                                        <tr style={{backgroundColor:'#e5e8ff',color:'black'}}>
                                            {tableHeaders.map((header) => (
                                                <th key={header} onClick={(event) => this.handleDropdownToggle(header,event)}>
                                                    {header === 'type' ? (
                                                        <>
                                                            {header}
                                                                <img style={{ marginTop: '-1%'  }}src={filter}alt=""width={12}/>                             
                                                            {isTypeDropdownOpen && (
                                                                <div className='dropdownFilter' style={{ position: 'absolute', top: '100%', left: 0 }}>
                                                                    <div className='sortTabCheckBoxColumn'>
                                                                        {uniqueTypes.map((option, index) => (
                                                                        <div key={index} style={{display:'flex'}}>
                                                                            <input type="checkbox" onClick={(e) => e.stopPropagation()} 
                                                                                checked={this.state.checkedOptionsType.includes(option)}
                                                                                onChange={() => this.handleCheckboxFoTypeFilter(option)}
                                                                                /><span style={{margin:'5px'}}>{option}</span>
                                                                        </div>
                                                                        ))}
                                                                    </div>
                                                                    <div style={{display:'flex',position:'relative',right:'-40%'}}>
                                                                        <button  className='deviceOkFilterButton'  onClick={()=>this.filterNotifications()}>Apply</button>
                                                                        <button  className='deviceOkFilterButton'  onClick={()=>this.clearNotification('type')}>Clear</button>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </>
                                                    ) : header === 'read' ? (
                                                        <>
                                                            {header}
                                                            <img style={{ marginTop: '-1%' }}src={filter}alt=""width={12}/>                             
                                                                {isReadDropdownOpen && (
                                                                <div className='dropdown' style={{ position: 'absolute', top: '100%', left: 0 }}>
                                                                    <div className='sortTabCheckBoxColumn'>
                                                                        {uniqueReadOptions.map((option, index) => (
                                                                        <div key={index} style={{display:'flex'}}>
                                                                            <input type="checkbox" onClick={(e) => e.stopPropagation()} 
                                                                                checked={this.state.checkedOptionsRead.includes(option)}
                                                                                onChange={() => this.handleCheckboxFoReadFilter(option)}
                                                                                /><span style={{margin:'5px'}}>{option}</span>
                                                                        </div>
                                                                        ))}
                                                                    </div>
                                                                    <div style={{display:'flex',position:'relative',right:'-40%'}}>
                                                                        <button  className='deviceOkFilterButton'  onClick={()=>this.filterNotifications('device_name')}>Apply</button>
                                                                        <button  className='deviceOkFilterButton'  onClick={()=>this.clearNotification('read')}>Clear</button>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <Tooltip title="sort">
                                                            {header}
                                                            <img style={{ marginTop: '-1%' }}src={filter}alt=""width={12}/>                             
                                                        </Tooltip>
                                                    )}  
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {getNotification && currentItems.map((notif, index) => (
                                            <tr key={notif.id}>
                                                {tableHeaders.map((header) => (
                                                    <td key={header}>
                                                        {header === "occurrence" && index === hoveredRowIndex ? (
                                                            index + 1
                                                        ) : header === "content" ? (
                                                            <button className="btndel" onClick={() => {this.handleViewContent(notif[header]);this.readNotification(notif[header],notif.type)}}>View</button>
                                                        ) : (
                                                            String(notif[header])
                                                        )}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                    </table>

                                    <Pagination
                                        activePage={activePage}
                                        itemsCountPerPage={itemsPerPage}
                                        totalItemsCount={filteredNotification.length}
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
                        {this.state.is_fetching===true?(<Loading/>):null}
                    </div>
                </div>
            </div>
        )
    }
}
export default NotificationPanel;