import React, { Component } from 'react';
import garbage from '../Images/garbage.png';
import swal from 'sweetalert2';
import { PageItem as BootstrapPageItem } from 'react-bootstrap';
import Pagination from 'react-js-pagination';
import sortDown from "../Images/dropDown.png";
import sortUp from "../Images/arrow-up.png";

class ListOfRules extends Component {
  constructor(props) {
    super(props);
    this.state = {
    serverIP: process.env.REACT_APP_CLIENT_IP,
    activePage: 1,
    itemsPerPage: 5,
    sortDirection: "asc",
    selectedthSort: null,

    //   getRules: {
    //     "test": {
    //       "actions": {
    //         "connect": {
    //           "unique_id": "bangalore-hsr-172.24.30.179-830-ocnos-csar"
    //         }
    //       },
    //       "triggers": {
    //         "operands": [
    //           {
    //             "component_parameter": {
    //               "component": "CPU",
    //               "operator": "<",
    //               "parameter": "cpu-utilization",
    //               "unique_ids": [
    //                 "bangalore-hsr-172.24.30.179-830-ocnos-csar"
    //               ],
    //               "value": "34"
    //             }
    //           },
    //           {
    //             "notification": {
    //               "notification": "fan-status-alarm",
    //               "unique_ids": [
    //                 "bangalore-hsr-172.24.30.179-830-ocnos-csar"
    //               ]
    //             }
    //           }
    //         ],
    //         "operator": "OR"
    //       },
        
    //     },
    //     "test2": {
    //       "actions": {
    //         "connect": {
    //           "unique_id": "bangalore-hsr-172.24.30.179-830-ocnos-csar"
    //         }
    //       },
    //       "triggers": {
    //         "operands": [
    //           {
    //             "notification": {
    //               "notification": "fan-status",
    //               "unique_ids": [
    //                 "bangalore-hsr-172.24.30.179-830-ocnos-csar"
    //               ]
    //             }
    //           },
    //           {
    //             "notification": {
    //               "notification": "fan-status-alarm",
    //               "unique_ids": [
    //                 "bangalore-hsr-172.24.30.179-830-ocnos-csar"
    //               ]
    //             }
    //           }
    //         ],
    //         "operator": "AND"
    //       }
    //     }
    //   },
      ruleVisibility: {},
      getRule:null,
      ruleLogs:null,
    };
    this.sortTable=this.sortTable.bind(this);
  }
  componentDidMount(){
    this.fetchRuleExecutionLogs();
    fetch(`http://${this.state.serverIP}:5007/rule-engine/rules`, {                     
      method: 'GET', 
      mode: 'cors',  
      headers:{'Access-Control-Allow-Origin':'http://localhost:3000',  
                'Accept':'application/json', 
                'Content-Type':'application/json',
                'username': sessionStorage.getItem('username'),
                //   'Authorization': 'Bearer ' + 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTY2Njc2NzE3NSwianRpIjoiODFkOTNiMGEtNDQwMS00ZDIyLWIzYmItOGM0NmZkZDBjODJiIiwidHlwZSI6ImFjY2VzcyIsInN1YiI6ImFkbWluXzEyMyIsIm5iZiI6MTY2Njc2NzE3NSwiZXhwIjoxNjY5MzU5MTc1fQ.bPHBU62WQd-2Z4cmDkEYaL-198KTSmp6w1A49i4U3a4',
            }, 
      })
      .then(resp=>resp.json())
      .then(resp=>{this.setState({getRules:resp})
      ;
      console.log(resp,'rule-response')
    })
  }
  fetchRuleExecutionLogs(){
    fetch(`http://${this.state.serverIP}:5007/rule-engine/rule-logs`, {                     
      method: 'GET', 
      mode: 'cors',  
      headers:{'Access-Control-Allow-Origin':'http://localhost:3000',  
                'Accept':'application/json', 
                'Content-Type':'application/json',
                'username': sessionStorage.getItem('username'),
                //   'Authorization': 'Bearer ' + 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTY2Njc2NzE3NSwianRpIjoiODFkOTNiMGEtNDQwMS00ZDIyLWIzYmItOGM0NmZkZDBjODJiIiwidHlwZSI6ImFjY2VzcyIsInN1YiI6ImFkbWluXzEyMyIsIm5iZiI6MTY2Njc2NzE3NSwiZXhwIjoxNjY5MzU5MTc1fQ.bPHBU62WQd-2Z4cmDkEYaL-198KTSmp6w1A49i4U3a4',
            }, 
      })
      .then(resp=>resp.json())
      .then(resp=>{this.setState({ruleLogs:resp})
      ;
      console.log(resp,'rule-logs')
    })
  }

  toggleRuleVisibility = (ruleName) => {
    this.setState((prevState) => ({
      ruleVisibility: {
        ...prevState.ruleVisibility,
        [ruleName]: !prevState.ruleVisibility[ruleName],
      },
    }));
  };

  deleteRule = (ruleName) => {
    const { getRules } = this.state;
    const updatedRules = { ...getRules };

    swal.fire({
        title: "This rule will be deleted permanently!",
        text: "Are you sure to proceed?",
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: "Remove the Rule!",
        cancelButtonText: "Cancel",
        closeOnConfirm: false,
        closeOnCancel: true,
      }).then((result) => {
        if (result.isConfirmed) {
            fetch(`http://${this.state.serverIP}:5007/rule-engine/delete-rule/${ruleName}`, {                     
                method: 'DELETE', 
                mode: 'cors',  
                headers:{'Access-Control-Allow-Origin':'http://localhost:3000',  
                        'Accept':'application/json', 
                        'Content-Type':'application/json'  ,
                        // 'username': sessionStorage.getItem('username'),
                        // 'Authorization': 'Bearer ' + this.state.loginData.access_token,
                    }, 
                })
                .then(resp=>resp.json())
                .then(resp=>{this.setState({delete_user_response:resp})
                ;
                if(resp.status==="Rule has been deleted"){
                    if (updatedRules.hasOwnProperty(ruleName)) {
                        delete updatedRules[ruleName];
                    
                        this.setState({
                          getRules: updatedRules,
                          ruleVisibility: {
                            ...this.state.ruleVisibility,
                            [ruleName]: undefined,
                          },
                        });
                      }
                }
                console.log(resp,'deleteruleresp')
            })
            .catch((err) => {
                if (err.response) {
                    alert(err.response.data.status)
                    console.log('Error Response Data:', err.response.data);
                    console.log('Error Response Status:', err.response.status);
                    console.log('Error Response Headers:', err.response.headers);
                }
            }); 
       

      
          swal.fire("Rule Removed!", "The rule is removed permanently!", "success");
        } else {
          swal.fire("Cancelled", "The deletion process is cancelled", "info");
        }
      });
      
  
    
  };
  
  renderRule(ruleName, rule) {
    const isRuleVisible = this.state.ruleVisibility[ruleName];
  
    return (
      <div key={ruleName} className="rule-container">
        <div className="rule-header">
          <h3 className='rule-name'>{ruleName}
             <span onClick={()=>this.deleteRule(ruleName)} style={{marginLeft:"20px", cursor:"pointer"}}><img src={garbage} alt=""  width= "18"/></span>
          </h3>
          <button onClick={() => this.toggleRuleVisibility(ruleName)} className='btn btn-primary mb-3'>
            {isRuleVisible ? 'Hide' : 'Show'}
          </button>
        </div>
        {isRuleVisible && (
          <>
            <p className="operator"><strong>Expression:</strong> {rule.expression}</p>
            <div className="triggers-container">
              <h4 className='header-text'>Triggers:</h4>
              <ul>
                    {Object.keys(rule.trigger_map).map((trigger, index) => (
                      <li key={trigger} className="action-item">
                        <strong>{trigger}:</strong>
                        <div className="trigger-value">
                            {Object.keys(rule.trigger_map[trigger]).map(key_comp=>(
                                <div style={{display:"flex"}}>
                                    <div className='component-key'>{key_comp}</div>
                                    <div>{rule.trigger_map[trigger][key_comp]}</div>
                                </div>
                            ))}
                        </div>
                      </li>
                    ))}
              </ul>
            </div>
            <div className="actions-container">
              <h4 className='header-text'>Actions:</h4>
              <ul>
                {Object.keys(rule.actions).map((action, index) => (
                  <li key={action} className="action-item">
                    <strong>{action}:</strong>
                    <div className="trigger-value">
                        {Object.keys(rule.actions[action]).map(key_comp=>(
                            <div style={{display:"flex"}}>
                                <div className='component-key'>{key_comp}</div>
                                <div>{rule.actions[action][key_comp]}</div>
                            </div>
                        ))}
                    </div>
                  </li>
                ))}
              </ul>
            </div>  
          </>
        )}
      </div>
    );
  }

  handlePageChange = (pageNumber) => {
    this.setState({ activePage: pageNumber });
  }

  sortTable = (column) => {
    const { sortColumn, sortDirection, ruleLogs } = this.state;
    console.log(column);
    let direction = "asc";
    if (sortColumn === column && sortDirection === "asc") {
      direction = "desc";
      this.setState({ sortOrder: "desc" });
    } else {
      this.setState({ sortOrder: "asc" });
    }

    const sortedItems = ruleLogs.sort((a, b) => {
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
    console.log("sort", sortedItems);

    this.setState({
      ruleLogs: sortedItems,
      sortColumn: column,
      sortDirection: direction,
      selectedthSort: column,
    });
  };

  render() {
    const { getRules ,ruleLogs, activePage, itemsPerPage} = this.state;
    const tableHeaders = ['rule','time','results'];

    const indexOfLastItem = activePage * itemsPerPage;
      const indexOfFirstItem = indexOfLastItem - itemsPerPage;
      let currentItems;
      if(ruleLogs!== null){
          currentItems = ruleLogs.slice(indexOfFirstItem, indexOfLastItem);
      }

    return (
        <div className="policy_maindiv">
            <div className="list-of-rules">
                <h2 style={{fontSize:"medium"}}>List Of Rules:</h2>
                {getRules && !getRules.status && Object.entries(getRules).map(([ruleName, rule]) => this.renderRule(ruleName, rule))}
            </div>
            <div className="rule-logs-section">
                <h2 style={{fontSize:"medium"}}>Executed Rule Logs:</h2>
                {currentItems ? (
                  <div style={{ height: "428px",margin:"4%"}}>
                    <table className='user_table'>
                        <thead className='user_table_head'> 
                        <tr style={{backgroundColor:'#e5e8ff',color:'black'}}>
                            <th onClick={() => this.sortTable("rule")} style={this.state.selectedthSort && this.state.selectedthSort === "rule" ? this.state.fixthHead : ({ cursor: 'pointer', position: 'static' })}>Rule<img alt="" style={{ marginLeft: '8px', marginTop: '3px' }} src={this.state.selectedthSort === "rule" && this.state.sortOrder === "asc" ? sortUp : sortDown} width={10} /></th>
                            <th onClick={() => this.sortTable("time")} style={this.state.selectedthSort && this.state.selectedthSort === "time" ? this.state.fixthHead : ({ cursor: 'pointer', position: 'static' })}>Time<img alt="" style={{ marginLeft: '8px', marginTop: '3px' }} src={this.state.selectedthSort === "time" && this.state.sortOrder === "asc" ? sortUp : sortDown} width={10} /></th>
                            <th>Results</th>
                        </tr>
                        </thead>
                        <tbody>
                        {currentItems && currentItems.map((log) => (
                            <tr key={log.id} style={{fontSize:"small"}}>
                            {tableHeaders.map((header) => (
                                <td key={header}>
                                    {header==="results"?(
                                        <button className="btndel"onClick={() => { alert(JSON.stringify(log[header], null, 2)); }}>View</button>   
                                    ):(
                                        log[header].toString()
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
                      totalItemsCount={ruleLogs.length}
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
                </div> ): null}
            </div>
        </div>
        
    );
  }
}
export default ListOfRules;