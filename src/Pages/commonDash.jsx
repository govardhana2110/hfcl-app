import React from "react";
import NewHeader from "../Components/header";
import "../css/commonDash.css";
import GlobalAlarmPie from "../Components/globalAlarmPie";
import GlobalConnectionPie from "../Components/globalConnectionPie";
import GlobalUserPie from "../Components/globalUserPie";
import DeviceTable from "../Components/deviceTable";
import DeviceType from "../Components/deviceType";
import UserGraph from "../Components/userGraph";
import UserLog from "../Components/userLog";
import OpenStreetMap from "../Components/map";
import Loading from "../Components/loader";
import Tooltip from "@mui/material/Tooltip";
import ToggleIcon from "../Images/toggle-button.png";

class GlobalDashboard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      serverIP: process.env.REACT_APP_CLIENT_IP,
      get_user_list: null,
      timestamp_Filter: { start_time: new Date(), stop_time: new Date() },
      coordinates: null,
      isToggled: false,
      isToggledPie: false,
      connectedDevices:[],
      disconnectedDevices:[],
    };
  }
  componentDidMount() {
    this.fetchDeviceList()
    this.setState({ is_fetching: true });
    const storedArrayString = sessionStorage.getItem("ListDevice");
    const storedArray = JSON.parse(storedArrayString);
    const clusterList = sessionStorage.getItem("ClusterDevice");
    const storedArray1 = JSON.parse(clusterList);
    this.setState({ ListDevice: storedArray, clusters: storedArray1 });
    sessionStorage.setItem("Connection", false);
    var userID = sessionStorage.getItem("_id");
    var _id = {};
    _id["login_user_id"] = userID;
    var loginData = JSON.parse(sessionStorage.getItem("login_data"));
    console.log(loginData);
    fetch(
      `http://${this.state.serverIP}:5006/user-management/fetch-all-users`,
      {
        method: "POST",
        mode: "cors",
        headers: {
          "Access-Control-Allow-Origin": "http://localhost:3000",
          Accept: "application/json",
          "Content-Type": "application/json",
          username: sessionStorage.getItem("username"),
          Authorization: "Bearer " + loginData.data.access_token,
        },
        body: JSON.stringify(_id),
      }
    )
      .then((resp) => resp.json())
      .then((resp) => {
        console.log(resp);
        this.setState({ get_user_list: resp });
      })
      .catch((err) => {
        if (err.response) {
          alert(err.response.data.status);
          console.log("Error Response Data:", err.response.data);
          console.log("Error Response Status:", err.response.status);
          console.log("Error Response Headers:", err.response.headers);
        }
      });

    fetch(
      `http://${this.state.serverIP}:5000/configuration-management/global-dashboard`,
      {
        method: "GET",
        mode: "cors",
        headers: {
          "Access-Control-Allow-Origin": "http://localhost:3000",
          Accept: "application/json",
          "Content-Type": "application/json",
          username: sessionStorage.getItem("username"),
        },
      }
    )
      .then((resp) => resp.json())
      .then((resp) => {
        console.log(resp, "dashboard-stats");
        if (resp.status) {
          this.setState({ dashstats: [] });
          this.setState({ is_fetching: false });
        } else {
          this.setState({ dashstats: resp });
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

    this.setDefaultTime();
    this.fetchGlobalAlarms();
  }

  fetchDeviceList() {
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
        console.log(resp);
        this.setState({routerDetails:resp})
        const {connectedDevices , disconnectedDevices}=this.state;
        if(resp["devices"]){
          resp["devices"].map((device)=>{
            if(device.ConnectionStatus===true && !connectedDevices.includes(device.unique_id)){
              connectedDevices.push(device.unique_id)
            }
            
          })
        }
      })
      .catch((err) => {
        if (err.response) {
          err.response
            .json()
            .then((responseData) => {
              alert(responseData.message); // Show error message to the user
            })
            .catch((jsonError) => {
              alert("Error parsing JSON response.");
            });
        } else {
          console.error("Network Error:", err.message); // Log the error for debugging
        }
      });
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
  convertDateFormat(inputDateStr) {
    const inputDate = new Date(inputDateStr);
    return inputDate.toISOString(); // Returns date in ISO 8601 format
  }

  fetchGlobalAlarms() {
    const { timestamp_Filter } = this.state;
    console.log(timestamp_Filter, "time-duration");

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
        console.log(resp, "global-alarm-list");
        if (resp.status === "No faults present in the database") {
          this.setState({ globalFault: [] });
        } else {
          var list = [];
          for (let key in resp) {
            if (Array.isArray(resp[key])) {
              list = list.concat(resp[key]);
            }
          }
          this.setState({ globalFault: list });
          // this.countBasedOnSeverity();
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
        console.log(resp, "global-active-alarm-list");
        if (resp.status === "No faults present in the database") {
          this.setState({
            get_global_active_alarms: [],
          });
        } else {
          this.setState({ activeUniqueIds: resp });
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

  handleToggle = () => {
    this.setState((prevState) => ({
      isToggled: !prevState.isToggled,
    }));
  };

  handleTogglePie = () => {
    this.setState((prevState) => ({
      isToggledPie: !prevState.isToggledPie,
    }));
  };

  render() {
    const { get_global_active_alarms, globalFault, isToggled, isToggledPie ,connectedDevices ,routerDetails} =
      this.state;
console.log(this.state.dashstats);

    return (
      <div
        style={{ height: "100vh", overflow: "hidden" }}       >

        <div style={{ flex: "4", width: "100%" }}>

          <NewHeader
            header_name="Dashboard"
            path=""
            darkMode={this.state.isDarkMode}
            toggleDarkMode={this.toggleDarkMode}
          />

          <div className="main_dashboard" style={{ marginLeft: "1.5%",width:"97%", height: "80vh", overflow: "auto", paddingTop: "0.5%" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-around",
                width: "96vw",
                flexWrap: "wrap",
                gap: "1rem",
              }}
              className="cardDash-wrapper"
            >
              <div className="cardDash">
                <img
                  className="dashimg"
                  src={require("../Images/c1.png")}
                  alt=""
                  onClick={() => this.generateDynamicPDF()}
                ></img>
                <div style={{ marginLeft: "9%", marginRight: "9%" }}>
                  <div className="keyDash">Total Devices</div>
                  <div className="valueDash">
                    {sessionStorage.getItem("deviceCount")}
                  </div>
                </div>
              </div>
              <div className="cardDash">
                <img
                  className="dashimg"
                  src={require("../Images/c2.png")}
                  alt=""
                ></img>
                <div style={{ marginLeft: "9%", marginRight: "9%" }}>
                  <div className="keyDash">Total Clusters</div>
                  <div className="valueDash">
                    {sessionStorage.getItem("clusterCount")}
                  </div>
                </div>
              </div>
              <div className="cardDash">
                <img
                  className="dashimg"
                  src={require("../Images/c3.png")}
                  alt=""
                ></img>
                <div style={{ marginLeft: "9%", marginRight: "9%" }}>
                  <div className="keyDash">Total Users</div>
                  <div className="valueDash">
                    {this.state.get_user_list
                      ? this.state.get_user_list.length
                      : null}
                  </div>
                </div>
              </div>
              <div className="cardDash">
                <img
                  className="dashimg"
                  src={require("../Images/c4.png")}
                  alt=""
                />
                {globalFault && get_global_active_alarms ? (
                  <div style={{ marginLeft: "9%", marginRight: "9%" }}>
                    <div className="keyDash" style={{ width: "fit-content" }}>
                      {isToggled ? "History" : "Active"} alarms
                      <span style={{ marginLeft: "15px" }}>
                        <img
                          src={
                            isToggled
                              ? require("../Images/toggle_up.png")
                              : require("../Images/toggle-button.png")
                          }
                          alt=""
                          width={20}
                          onClick={this.handleToggle}
                        />
                      </span>
                    </div>
                    <div className="valueDash">
                      {isToggled
                        ? globalFault.length
                        : get_global_active_alarms.length}
                    </div>
                  </div>
                ) : null}
              </div>
              <div className="cardDash">
                <img
                  className="dashimg"
                  src={require("../Images/c5.png")}
                  alt=""
                ></img>
                <div style={{ marginLeft: "9%", marginRight: "9%" }}>
                  <div className="keyDash">Total License</div>
                  <div className="valueDash">1</div>
                </div>
              </div>
            </div>
            <div
              className="pieCard-wrapper"
            >
              <div className="pieCard">
                <div className="headpie">
                  {isToggledPie ? "History Alarms" : "Active Alarms"}
                </div>

                <img
                  src={
                    isToggledPie
                      ? require("../Images/toggle_up.png")
                      : require("../Images/toggle-button.png")
                  }
                  alt=""
                  width={20}
                  onClick={this.handleTogglePie}
                />

                {this.state.globalFault &&
                  this.state.get_global_active_alarms ? (
                  this.state.isToggledPie ? (
                    <GlobalAlarmPie
                      data={this.state.globalFault}
                    />
                  ) : (
                    <GlobalAlarmPie data={get_global_active_alarms} />
                  )
                ) : null}
              </div>
              <div className="pieCard">
                <div className="headpie">Connection Status</div>
                {this.state.is_fetching === true ? (
                  <Loading type="individual1" />
                ) : null}
                {routerDetails ? (
                  <GlobalConnectionPie
                    connectedCount={connectedDevices.length} totaldevices={routerDetails["devices"].length}
                  />
                ) : null}
              </div>
              <div className="pieCard">
                <div className="headpie">User Status</div>
                {this.state.get_user_list ? (
                  <GlobalUserPie
                    data={this.state.get_user_list}
                    labels={["Admin", "Engineer", "Operator", "Viewer"]}
                  />
                ) : null}
              </div>
              <div className="pieCard" >
                <div className="headpie">
                  Device Type Status
                </div>
                {this.state.is_fetching === true ? (
                  <Loading type="individual2" />
                ) : null}
                {routerDetails ? (
                  <DeviceType
                    chartId="deviceTypeChart"
                    data={routerDetails["devices"]}
                  />
                ) : null}
              </div>
            </div>
            <div id="table-container-dash" className="table-container-dash card" style={{ marginTop: "2%" }}>
              {this.state.dashstats ? (
                <DeviceTable data={this.state.dashstats} />
              ) : null}
            </div>
            <div className="map_div" style={{ display: "flex" }}>
              <div className="cardthree1">
                {this.state.clusters && this.state.ListDevice ? (
                  <OpenStreetMap
                    clusters={this.state.clusters}
                    listDevice={this.state.ListDevice}
                  />
                ) : null}
              </div>
              <div className="cardthree">
                <div className="headpie" style={{ marginBottom: "2%" }}>
                  Alarm vs Month Graph
                </div>
                {this.state.globalFault ? (
                  <UserGraph
                    chartId="alarmChart"
                    data={this.state.globalFault}
                  />
                ) : null}
              </div>
            </div>

            <div
              className='userlogCommonDash'
            >
              {this.state.get_user_list ? (
                <UserLog data={this.state.get_user_list} />
              ) : null}
            </div>
          </div>
        </div>
      </div>
    );
  }
}
export default GlobalDashboard;
