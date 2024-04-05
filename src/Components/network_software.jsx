import React from 'react';
import swal from 'sweetalert2';
import 'leaflet/dist/leaflet.css';
import 'react-dropdown/style.css';
import 'bootstrap/dist/css/bootstrap.min.css'; 
import Loading from "../Components/loader";
import 'react-toastify/dist/ReactToastify.css';
import notify from '../utils/index.js';
class SoftwarePanel extends React.Component{
    constructor(props){
        super(props);
        this.state={
          serverIP:process.env.REACT_APP_CLIENT_IP, 
          isLoading:false
        };

    }

    componentDidMount(){
        this.fetchImages();
    }
    
      fetchImages() {
        this.setState({isLoading:true})
        fetch(
          `http://${this.state.serverIP}:5000/configuration-management/software-images`,
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
            console.log(resp,"software-images");
            this.setState({isLoading:false})
            if (resp.status) {
              this.setState({ imageList: [] });
            } else {
              this.setState({ imageList: resp });
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
    
  
      handleCheckboxChange = (event, item) => {
        this.setState({ selectedDeviceList: this.state.imageList[item] });
        console.log(this.state.selectedDeviceList);
        const { checked } = event.target;
        // if (checked) {
        //   this.setState((prevState) => ({
        //     checkedDevices: [...prevState.checkedDevices, item],
        //   }));
        // }
        console.log(this.state.checkedDevices);
      };
     
      softwareInstall() {
        this.setState({ is_fetching: true });
        var dataDict = [];
        for (let i = 0; i < this.state.deviceGet.length; i++) {
          dataDict.push({
            unique_id: this.state.deviceGet[i],
            "source-interface": this.state.selectedInterface[i].interface, // Assuming the second element in the array is the interface name
            url: this.state.urlValue, // Using the interface name as the URL value
          });
        }
        const temp = {
          "sys-update-get": {
            devices: dataDict,
            "@xmlns": "http://www.ipinfusion.com/yang/ocnos/ipi-sys-update",
          },
        };
        console.log(temp);
        fetch(
          `http://${this.state.serverIP}:5000/configuration-management/bulk-software/sys-update-get`,
          {
            mode: "cors",
            method: "POST",
            headers: {
              "Access-Control-Allow-Origin": "http://localhost:3000",
              Accept: "application/json",
              "Content-Type": "application/json",
              username: sessionStorage.getItem("username"),
            },
            body: JSON.stringify(temp),
          }
        )
          .then((resp) => resp.json())
          .then((resp) => {
            console.log(resp, "postGet");
            this.setState({ is_fetching: true });
            for (let i = 0; i < resp.length; i++) {
              if (resp[i].status["rpc-reply"]) {
                alert(`${resp[i].unique_id} is added with the image selected`);
              } else if (resp[i].status.message) {
                alert(`${resp[i].unique_id}: ${resp[i].status.message}`);
              } else {
                alert(`${resp[i].unique_id}: ${resp[i].status}`);
              }
            }
            this.setState({ showAdd: false });
            this.setState({ showLoad: true });
            this.fetchImagesUntilNoTmpExists();
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
    
      fetchImagesUntilNoTmpExists() {
        const intervalId = setInterval(() => {
          this.fetchImages();
          let tmpExists = false;
          for (let key in this.state.imageList) {
            if (key.includes("tmp_")) {
              tmpExists = true;
              break; // Exit the loop early if a temporary image is found
            }
          }
          if (!tmpExists) {
            clearInterval(intervalId); // Stop the setInterval loop when no temporary image is found
            this.setState({ showLoad: false });
            this.setState({ is_fetching: false });
          }
        }, 3000);
        this.fetchImages();
      }
    
      handleCheckboxChangeGetDevice(e, item) {
        var devices = this.state.deviceGet;
        devices.push(item);
        this.setState({ deviceGet: devices });
        console.log(this.state.deviceGet);
      }
    
      handleCheckboxChangeDelete(e, item) {
        var devices = this.state.deviceGetDelete;
        devices.push(item);
        this.setState({ deviceGetDelete: devices });
        console.log(this.state.deviceGetDelete);
      }
    
      handleCheckboxChangeGetInterface(e, item) {
        const { selectedInterface } = this.state;
        const interfaceName = e.target.value;
        const index = selectedInterface.findIndex(
          (dataItem) => dataItem.device === item
        );
    
        if (index !== -1) {
          // If the device exists in selectedInterface, update the interface name
          const updatedData = [...selectedInterface];
          updatedData[index].interface = interfaceName;
          this.setState({ selectedInterface: updatedData });
        } else {
          // If the device does not exist in selectedInterface, add it with the interface name
          this.setState((prevState) => ({
            selectedInterface: [
              ...prevState.selectedInterface,
              { device: item, interface: interfaceName },
            ],
          }));
        }
      }
    
      handleCheckboxChangeGet(e, item) {
        this.setState({ urlValue: e.target.value });
      }
    
      DeleteImages() {
        this.setState({ is_fetching: true });
        var deviceSelected = [];
        for (let i = 0; i < this.state.deviceGetDelete.length; i++) {
          deviceSelected.push({
            unique_id: this.state.deviceGetDelete[i],
            "image-name": this.state.selectedImagename,
          });
        }
        var temp = {
          "sys-update-delete": {
            "@xmlns": "http://www.ipinfusion.com/yang/ocnos/ipi-sys-update",
            devices: deviceSelected,
          },
        };
        console.log(temp);
        swal
          .fire({
            title: "",
            text: "Are you Sure You Want to Delete Selected Images from Selected Devices?",
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
              fetch(
                `http://${this.state.serverIP}:5000/configuration-management/bulk-software/sys-update-delete`,
                {
                  mode: "cors",
                  method: "POST",
                  headers: {
                    "Access-Control-Allow-Origin": "http://localhost:3000",
                    "Content-Type": "application/json",
                    username: sessionStorage.getItem("username"),
                  },
                  body: JSON.stringify(temp),
                }
              )
                .then((resp) => resp.json())
                .then((resp) => {
                  alert("Images Deleted Succesfully");
                  this.setState({ is_fetching: false });
                  this.fetchImages();
                  console.log(resp, "postGetDelete");
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
          });
      }
    
      cancelDownload() {
        this.setState({ is_fetching: true });
        var dataDict = [];
        for (let i = 0; i < this.state.deviceGet.length; i++) {
          dataDict.push({
            unique_id: this.state.deviceGet[i],
          });
        }
        var temp = {
          "sys-update-cancel-download": {
            "@xmlns": "http://www.ipinfusion.com/yang/ocnos/ipi-sys-update",
            devices: dataDict,
          },
        };
        console.log(temp);
        fetch(
          `http://${this.state.serverIP}:5000/configuration-management/bulk-software/sys-update-cancel-download`,
          {
            mode: "cors",
            method: "POST",
            headers: {
              "Access-Control-Allow-Origin": "http://localhost:3000",
              "Content-Type": "application/json",
              username: sessionStorage.getItem("username"),
            },
            body: JSON.stringify(temp),
          }
        )
          .then((resp) => resp.json())
          .then((resp) => {
            alert("Image Download Cancelled");
            this.setState({ is_fetching: false, showLoad: false });
            console.log(resp, "postGetDownloadCancel");
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
    
      
    render(){	
        const{isLoading}=this.state;
        return(
            <div style={{backgroundColor: "white" ,borderRadius:'20px',paddingTop:'1%'}}>
                 <div
                      style={{
                        backgroundColor: "white",
                        borderRadius: "20px",
                        padding: "2%",
                        paddingTop: "4%",
                      }}
                    >
                      <div className="networkmaincontent" style={{ display: "flex", marginBottom: "2%" }}>
                        <div style={{ color: "#344767", fontWeight: "600" }}>
                          Software Installer
                        </div>
                      </div>
                      <div
                        className="tabbox2"
                        style={
                          this.state.showFilter
                            ? { color: "#004f68", fontWeight: "bold" }
                            : null
                        }
                        onClick={(e) =>
                          this.state.showAdd
                            ? this.setState({ showAdd: false })
                            : this.setState({ showAdd: true, deviceGet: [] })
                        }
                      >
                        <img
                          alt=""
                          className="tabicon1"
                          src={require("../Images/packaging.png")}
                        ></img>
                        Download Images
                      </div>
                      <div style={{ display: "flex", marginTop: "2%" }}>
                        <div
                          style={{
                            width: "300px",
                            height: "300px",
                            backgroundColor: "rgb(244, 247, 254)",
                            borderRadius: "20px",
                          }}
                        >
                          <div style={{ display: "flex", margin: "7%" }}>
                            <img
                              alt=""
                              className="tabicon1"
                              src={require("../Images/monitoring.png")}
                            ></img>
                            <div
                              style={{
                                fontSize: "small",
                                fontWeight: "bold",
                                marginTop: "4%",
                              }}
                            >
                              Select Locally Stored Image:
                            </div>
                          </div>
                          {isLoading?<Loading/>:null}
                          {this.state.imageList ? (
                            <form
                              style={{
                                margin: "9%",
                                maxHeight: "195px",
                                overflow: "hidden",
                              }}
                            >
                              {Object.keys(this.state.imageList).map((item) => (
                                <div style={{ display: "flex" ,fontSize:"smaller",justifyContent:"space-between"}}>
                                  <div style={{display:"contents",maxWidth:"50px"}}>
                                    <input style={{width:"fit-content"}}type="radio"id={`checkbox-${item}`}name="checkboxes"value={item}onChange={(e) => this.handleCheckboxChange(e, item)}/>
                                    <span style={{margin:"2%"}}>{item}</span>
                                  </div>
                                  <div>
                                    <img alt="" width={13} height={13}src={require("../Images/remove.png")}onClick={() => {this.setState({showDeletePop: true,selectedImagename: item,});}}/>
                                  </div>
                                </div>
                              ))}
                            </form>
                          ) : null}
                        </div>

                        <div
                          style={{
                            width: "71%",
                            height: "300px",
                            backgroundColor: "rgb(244, 247, 254)",
                            borderRadius: "20px",
                            marginLeft: "3%",
                          }}
                        >
                          <div style={{ display: "flex", margin: "3%" }}>
                            <img
                              alt=""
                              className="tabicon1"
                              src={require("../Images/gear.png")}
                            ></img>
                            <div
                              style={{
                                fontSize: "small",
                                fontWeight: "bold",
                                marginTop: "1%",
                              }}
                            >
                              {this.state.showDeletePop
                                ? "Select Devices from which the selected image to be deleted:"
                                : "Select Devices to which selected image to be installed:"}
                            </div>
                          </div>
                          {this.state.selectedDeviceList ? (
                            <form
                              style={{
                                display: "flow",
                                gridTemplateColumns: "repeat(3, 1fr)",
                                marginLeft: "3%",
                              }}
                            >
                              {this.state.selectedDeviceList.map((item) => (
                                <label
                                  key={item}
                                  style={{ display: "flex" }}
                                  htmlFor={`checkbox-${item}`}
                                  className="checkboxes"
                                >
                                  <input
                                    type="checkbox"
                                    id={`checkbox-${item}`}
                                    name="checkboxes"
                                    value={item}
                                    onChange={(e) =>
                                      this.handleCheckboxChangeDelete(e, item)
                                    }
                                  />
                                  <div
                                    style={{
                                      marginLeft: "1%",
                                      marginTop: "1.5%",
                                    }}
                                  >
                                    {item}
                                  </div>
                                </label>
                              ))}
                            </form>
                          ) : null}
                        </div>
                      </div>

                      {this.state.showDeletePop ? (
                        <div
                          className="confirmRole"
                          style={{ marginTop: "2%", marginLeft: "0" }}
                          onClick={() => this.DeleteImages()}
                        >
                          Delete Images From Selected
                        </div>
                      ) : (
                        <div
                          className="confirmRole"
                          style={{ marginTop: "2%", marginLeft: "0" }}
                          onClick={() => this.softwareInstall()}
                        >
                          Initiate Software Install
                        </div>
                      )}

                      {this.state.showAdd ? (
                        <div className="popupSoft">
                          <div
                            className="popup-innerSoft"
                            style={{ width: "48%", height: "400px" }}
                          >
                            <div>Bulk Software Download</div>
                            <button
                              className="close-buttonSoft"
                              onClick={(e) => this.setState({ showAdd: false })}
                            >
                              X
                            </button>
                            <div className="popup-contentSoft">
                              <div>
                                <div style={{ display: "flex" }}>
                                  <div style={{ marginLeft: "20px" }}>
                                    {this.state.showSecondAdd ? (
                                      <div
                                        className=""
                                        style={{
                                          width: "164%",
                                          height: "156px",
                                        }}
                                      >
                                        <div
                                          style={{
                                            display: "flex",
                                            justifyContent: "center",
                                            alignContent: "center",
                                            flexDirection: "column",
                                          }}
                                        >
                                          <div
                                            style={{ marginTop: "2%" }}
                                          ></div>
                                          <div
                                            className="cancelRole"
                                            style={{
                                              marginTop: "9%",
                                              width: "80%",
                                              marginLeft: "42%",
                                            }}
                                            onClick={(e) =>
                                              this.cancelDownload()
                                            }
                                          >
                                            Cancel Download
                                          </div>
                                        </div>
                                      </div>
                                    ) : (
                                      <div
                                        className=""
                                        style={{
                                          width: "164%",
                                          height: "200px",
                                        }}
                                      >
                                        <div
                                          style={{
                                            display: "flex",
                                            justifyContent: "center",
                                            alignContent: "center",
                                            flexDirection: "column",
                                          }}
                                        >
                                          <div style={{ marginTop: "2%" }}>
                                            <div className="input_field_flex">
                                              <p
                                                className="labelText"
                                                style={{ fontWeight: "bold" }}
                                              >
                                                URL:
                                              </p>
                                              <div
                                                className="input_shift"
                                                style={{ marginLeft: "8%" }}
                                              >
                                                <input
                                                  style={{ width: "70%" }}
                                                  value={this.state.urlValue}
                                                  onChange={(e) =>
                                                    this.handleCheckboxChangeGet(
                                                      e,
                                                      "url"
                                                    )
                                                  }
                                                />
                                              </div>
                                            </div>
                                            <div className="input_field_flex">
                                              <p
                                                className="labelText"
                                                style={{
                                                  fontWeight: "bold",
                                                  maxWidth: "500px",
                                                  marginTop: "20px",
                                                }}
                                              >
                                                Select Devices and Interface to
                                                Download the Image to:
                                              </p>
                                            </div>
                                            <div
                                              style={{
                                                marginTop: "10%",
                                                height: "100px",
                                                overflowY: "scroll",
                                                width: "79%",
                                              }}
                                            >
                                              {this.state.connectedDevices
                                                ? this.state.connectedDevices.map(
                                                    (item) => (
                                                      <div
                                                        style={{
                                                          display: "flex",
                                                          marginTop: "2%",
                                                        }}
                                                      >
                                                        <label
                                                          key={item}
                                                          style={{
                                                            display: "flex",
                                                          }}
                                                          htmlFor={`checkbox-${item}`}
                                                          className="checkboxes"
                                                        >
                                                          <input
                                                            type="checkbox"
                                                            id={`checkbox-${item}`}
                                                            name="checkboxes"
                                                            value={item}
                                                            onChange={(e) =>
                                                              this.handleCheckboxChangeGetDevice(
                                                                e,
                                                                item
                                                              )
                                                            }
                                                          />
                                                          <div
                                                            style={{
                                                              marginLeft: "1%",
                                                              marginTop: "1.5%",
                                                              width: "230px",
                                                            }}
                                                          >
                                                            {item}
                                                          </div>
                                                        </label>
                                                        <input
                                                          style={{
                                                            width: "40%",
                                                          }}
                                                          placeholder="Enter Interface"
                                                          onChange={(e) =>
                                                            this.handleCheckboxChangeGetInterface(
                                                              e,
                                                              item
                                                            )
                                                          }
                                                        />
                                                      </div>
                                                    )
                                                  )
                                                : null}
                                            </div>
                                          </div>
                                          <div
                                            className="cancelRole"
                                            style={{
                                              marginTop: "2%",
                                              width: "30%",
                                              marginLeft: "20%",
                                            }}
                                            onClick={(e) =>
                                              this.softwareInstall()
                                            }
                                          >
                                            Confirm
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : null}

                      {this.state.showLoad ? (
                        <div className="popupSoft">
                          <div
                            className="popup-innerSoft"
                            style={{ width: "200%", height: "203px" }}
                          >
                            <div style={{ marginLeft: "30%" }}>
                              Image is being Downloaded
                            </div>
                            <div
                              className="popup-contentSoft"
                              style={{ marginLeft: "32%" }}
                            >
                              Do you want to cancel it?
                            </div>
                            <div
                              className="cancelRole"
                              style={{ marginLeft: "27%" }}
                              onClick={() => this.cancelDownload()}
                            >
                              Cancel Download Now
                            </div>
                          </div>
                        </div>
                      ) : null}
                </div>
            </div>
        )
    }
}
export default SoftwarePanel;