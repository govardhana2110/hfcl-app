import React, { Component } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import IndividualAlarm from '../Components/individualAlarms';
import { CircularProgressbarWithChildren } from 'react-circular-progressbar';

import "react-datepicker/dist/react-datepicker.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import sortDown from "../Images/dropDown.png";
import sortUp from "../Images/arrow-up.png";
import Pagination from "react-js-pagination";
import { PageItem as BootstrapPageItem } from 'react-bootstrap';
class NetworkUtilization extends Component {
  constructor(props) {
    super(props);
    this.state = {
      checked: [],
      activePage: 1,
      itemsPerPage: 5,
      sortDirection: "asc",
      selectedthSort: null,
      data: this.props.data
    };
    this.handleCheck = this.handleCheck.bind(this);

  }


  handleCheck = (event, item) => {
    console.log(event, item);
    if (event.target.checked) {
      this.setState({ checked: [...this.state.checked, item] });
    } else {
      this.setState({ checked: this.state.checked.filter(value => value !== item) });
    }
    console.log(this.state.checked)
  };
  handlePageChange = (pageNumber) => {
    this.setState({ activePage: pageNumber });
  }
  sortTable = (column) => {
    const { sortColumn, sortDirection, data } = this.state;
    console.log(column[0]);
    let direction = "asc";
    if (sortColumn === column && sortDirection === "asc") {
      direction = "desc";
      this.setState({ sortOrder: "desc" });
    } else {
      this.setState({ sortOrder: "asc" });
    }

    const sortedItems = data.sort((a, b) => {

      console.log(a[Object.keys(a)[0]].severity_count.critical);
      console.log(Object.keys(b)[0], "bb");
      let aValue;
      let bValue;
      let atime;
      let btime;

      if (column === "Device_Name") {

        aValue = Object.keys(a)[0].toString().toLowerCase();
        bValue = Object.keys(b)[0].toString().toLowerCase();

      }
      else if (column === "Type") {
        aValue = Object.keys(a)[0].slice(-4).toString().toLowerCase();
        bValue = Object.keys(b)[0].slice(-4).toString().toLowerCase();
      }
      else if (column === "Current_software_version") {

        aValue = a[Object.keys(a)[0]].system_info["software-version"].toString().toLowerCase();
        bValue = b[Object.keys(b)[0]].system_info["software-version"].toString().toLowerCase();
      }
      else if (column === "Utilisation") {
        aValue = a[Object.keys(a)[0]].component_info[2].cpu.state["cpu-utilization"].toString().toLowerCase();
        bValue = b[Object.keys(b)[0]].component_info[2].cpu.state["cpu-utilization"].toString().toLowerCase();


      }
      else if (column === "System_Uptime") {
        atime = a[Object.keys(a)[0]].system_info["system-uptime"].toString().toLowerCase();
        btime = b[Object.keys(b)[0]].system_info["system-uptime"].toString().toLowerCase();
       
        const apattern = atime.match(/(?:(\d+)\s*days?,?\s*)?(?:(\d+)\s*hours?,?\s*)?(?:(\d+)\s*min?,?\s*)?(?:(\d+)\s*sec)?/);
        let adays = apattern && apattern[1] ? parseInt(apattern[1]) : 0;
        let ahours = apattern && apattern[2] ? parseInt(apattern[2]) : 0;
        let aminutes = apattern && apattern[3] ? parseInt(apattern[3]) : 0;
        let aseconds = apattern && apattern[4] ? parseInt(apattern[4]) : 0;
        aValue = adays * 24 * 60 * 60 + ahours * 60 * 60 + aminutes * 60 + aseconds;
        aValue=aValue.toString();
        const bpattern = btime.match(/(?:(\d+)\s*days?,?\s*)?(?:(\d+)\s*hours?,?\s*)?(?:(\d+)\s*min?,?\s*)?(?:(\d+)\s*sec)?/);
        let bdays = bpattern && bpattern[1] ? parseInt(bpattern[1]) : 0;
        let bhours = bpattern && bpattern[2] ? parseInt(bpattern[2]) : 0;
        let bminutes = bpattern && bpattern[3] ? parseInt(bpattern[3]) : 0;
        let bseconds = bpattern && bpattern[4] ? parseInt(bpattern[4]) : 0;
        bValue = bdays * 24 * 60 * 60 + bhours * 60 * 60 + bminutes * 60 + bseconds;
        bValue=bValue.toString();

      console.log(bValue,"bvals")
        console.log(aValue,"avals");
        

        


      }
      else if (column === "Alarms") {
        aValue = a[Object.keys(a)[0]].severity_count.critical.toString()
        bValue = b[Object.keys(b)[0]].severity_count.critical.toString()
      }


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
    console.log("sort", sortedItems);

    this.setState({
      data: sortedItems,
      sortColumn: column,
      sortDirection: direction,
      selectedthSort: column,
    });
  };

  componentDidUpdate(prevProps) {
    if (this.props.values !== prevProps.values) {
      console.log("props.values updated:", this.props.values);
    }
  }

  render() {
    // const { data } = this.props;

    const { checked, activePage, itemsPerPage, data } = this.state;
    console.log(data, "data");
    let currentItems;
    const indexOfLastItem = activePage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    currentItems = data.slice(indexOfFirstItem, indexOfLastItem)


    return (
      <div>
        <div>
          <table className='user_table'>
            <thead className='user_table_head'>
              <tr style={{ backgroundColor: '#e5e8ff', color: 'black' }}>
                <th onClick={() => this.sortTable("Device_Name")} style={this.state.selectedthSort && this.state.selectedthSort === "Device_Name" ? this.state.fixthHead : ({ cursor: 'pointer', position: 'static' })}>Device Name<img alt="" style={{ marginLeft: '8px', marginTop: '3px' }} src={this.state.selectedthSort === "Device_Name" && this.state.sortOrder === "asc" ? sortUp : sortDown} width={10} /></th>
                <th onClick={() => this.sortTable("Type")} style={this.state.selectedthSort && this.state.selectedthSort === "Type" ? this.state.fixthHead : ({ cursor: 'pointer', position: 'static' })}>Type<img alt="" style={{ marginLeft: '8px', marginTop: '3px' }} src={this.state.selectedthSort === "Type" && this.state.sortOrder === "asc" ? sortUp : sortDown} width={10} /></th>
                <th onClick={() => this.sortTable("Utilisation")} style={this.state.selectedthSort && this.state.selectedthSort === "Utilisation" ? this.state.fixthHead : ({ cursor: 'pointer', position: 'static' })}>Utilisation<img alt="" style={{ marginLeft: '8px', marginTop: '3px' }} src={this.state.selectedthSort === "Utilisation" && this.state.sortOrder === "asc" ? sortUp : sortDown} width={10} /></th>
                <th onClick={() => this.sortTable("Current_software_version")} style={this.state.selectedthSort && this.state.selectedthSort === "Current_software_version" ? this.state.fixthHead : ({ cursor: 'pointer', position: 'static' })}>Current Software Version<img alt="" style={{ marginLeft: '8px', marginTop: '3px' }} src={this.state.selectedthSort === "Current_software_version" && this.state.sortOrder === "asc" ? sortUp : sortDown} width={10} /></th>
                <th onClick={() => this.sortTable("System_Uptime")} style={this.state.selectedthSort && this.state.selectedthSort === "System_Uptime" ? this.state.fixthHead : ({ cursor: 'pointer', position: 'static' })}>System Uptime<img alt="" style={{ marginLeft: '8px', marginTop: '3px' }} src={this.state.selectedthSort === "System_Uptime" && this.state.sortOrder === "asc" ? sortUp : sortDown} width={10} /></th>
                <th onClick={() => this.sortTable("Alarms")} style={this.state.selectedthSort && this.state.selectedthSort === "Alarms" ? this.state.fixthHead : ({ cursor: 'pointer', position: 'static' })}>Alarms<img alt="" style={{ marginLeft: '8px', marginTop: '3px' }} src={this.state.selectedthSort === "Alarms" && this.state.sortOrder === "asc" ? sortUp : sortDown} width={10} /></th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length > 0 && currentItems.map((item, index) => (
                <tr key={index}>
                  <td>{Object.keys(item)[0]}</td>
                  <td>
                    {Object.keys(item)[0].includes(
                      'csar'
                    )
                      ? 'CSAR'
                      : Object.keys(item)[0].includes(
                        'duar'
                      )
                        ? 'DUAR'
                        : 'CUAR'}
                  </td>
                  <td>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <div
                        style={{
                          height: '50px',
                          width: '50px',
                          marginRight: '4%',
                        }}
                      >
                        <CircularProgressbarWithChildren
                          value={parseFloat(
                            (
                              item[Object.keys(item)[0]].component_info[0].state
                                .memory.utilized /
                              item[Object.keys(item)[0]].component_info[0].state
                                .memory.available
                            ).toFixed(2)
                          ) * 100}
                        >
                          <div
                            style={{
                              fontSize: 20,
                              justifyContent: 'center',
                              display: 'flex',
                              alignItems: 'center',
                              flexDirection: 'column',
                            }}
                          >
                            <strong style={{ fontSize: '10px' }}>
                              {`${parseFloat(
                                (
                                  item[Object.keys(item)[0]].component_info[0].state
                                    .memory.utilized /
                                  item[Object.keys(item)[0]].component_info[0].state
                                    .memory.available
                                ).toFixed(2)
                              ) * 100}%`}
                            </strong>
                            <div
                              style={{
                                fontSize: '7px',
                                marginTop: '-10px',
                              }}
                            >
                              Hard-Disk
                            </div>
                          </div>
                        </CircularProgressbarWithChildren>
                      </div>
                      <div
                        style={{
                          height: '50px',
                          width: '50px',
                          marginLeft: '4%',
                          marginRight: '4%',
                        }}
                      >
                        <CircularProgressbarWithChildren
                          value={parseFloat(
                            (
                              item[Object.keys(item)[0]].component_info[1].state
                                .memory.utilized /
                              item[Object.keys(item)[0]].component_info[1].state
                                .memory.available
                            ).toFixed(2)
                          ) * 100}
                        >
                          <div
                            style={{
                              fontSize: 20,
                              justifyContent: 'center',
                              display: 'flex',
                              alignItems: 'center',
                              flexDirection: 'column',
                            }}
                          >
                            <strong style={{ fontSize: '10px' }}>
                              {`${Math.round(
                                (
                                  item[Object.keys(item)[0]].component_info[1].state.memory.utilized /
                                  item[Object.keys(item)[0]].component_info[1].state.memory.available
                                ) * 100
                              )}%`}
                            </strong>
                            <div
                              style={{
                                fontSize: '8px',
                                marginTop: '-10px',
                              }}
                            >
                              RAM
                            </div>
                          </div>
                        </CircularProgressbarWithChildren>
                      </div>
                      <div
                        style={{
                          height: '50px',
                          width: '50px',
                          marginLeft: '4%',
                        }}
                      >
                        <CircularProgressbarWithChildren
                          value={parseFloat(
                            item[Object.keys(item)[0]].component_info[2].cpu.state[
                            'cpu-utilization'
                            ]
                          )}
                        >
                          <div
                            style={{
                              fontSize: 20,
                              justifyContent: 'center',
                              display: 'flex',
                              alignItems: 'center',
                              flexDirection: 'column',
                            }}
                          >
                            <strong style={{ fontSize: '10px' }}>
                              {parseFloat(
                                item[Object.keys(item)[0]].component_info[2].cpu.state[
                                'cpu-utilization'
                                ]
                              ).toFixed(2)}
                              %
                            </strong>
                            <div
                              style={{
                                fontSize: '8px',
                                marginTop: '-10px',
                              }}
                            >
                              CPU
                            </div>
                          </div>
                        </CircularProgressbarWithChildren>
                      </div>
                    </div>
                  </td>
                  <td>
                    {item[Object.keys(item)[0]].system_info['software-version']}
                  </td>
                  <td>
                    {item[Object.keys(item)[0]].system_info['system-uptime']}
                  </td>
                  <td>
                    {item[Object.keys(item)[0]].severity_count.critical &&
                      item[Object.keys(item)[0]].severity_count.critical &&
                      item[Object.keys(item)[0]].severity_count.critical &&
                      item[Object.keys(item)[0]].severity_count.critical ? (
                      <div
                        style={{
                          height: '0',
                          marginTop: '-7%',
                        }}
                      >
                        <IndividualAlarm
                          chartId={`chart1${index}`}
                          critical={
                            item[Object.keys(item)[0]].severity_count.critical
                          }
                          major={item[Object.keys(item)[0]].severity_count.major}
                          minor={item[Object.keys(item)[0]].severity_count.minor}
                          warning={
                            item[Object.keys(item)[0]].severity_count.warning
                          }
                        />
                      </div>
                    ) : (
                      'No Alarms Available'
                    )}
                  </td>
                </tr>
              ))}
              {data.length === 0 ? (
                <tr>No Devices Connected</tr>
              ) : null}
            </tbody>
          </table>
        </div>
          <Pagination className="pagination"
            activePage={activePage}
            itemsCountPerPage={itemsPerPage}
            totalItemsCount={data.length}
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
    );
  }
}

export default NetworkUtilization;
