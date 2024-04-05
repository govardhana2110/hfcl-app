import React, { useState, useEffect } from "react";
import Dropdown from "react-bootstrap/Dropdown";
import DropdownButton from "react-bootstrap/DropdownButton";
import Loading from "./loader";
import RoutingDetails from "../Components/forwardingTable";
import Button from "react-bootstrap/Button";
import Popup from "reactjs-popup";
import jsPDF from "jspdf";
import "jspdf-autotable";
import CustomTime from "./customTime";
import close from "../Images/closeS.png"
import { json } from "d3";

const LspRouting = (props) => {
  const { connectedDevices } = props;
  const[reportData , setReportData] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [reportDevices, setReportDevices] = useState([]);
  const [is_fetching, setIsfetching] = useState(false);
  const [loading, setLoading] = useState(true);
  const [routingData, setRoutingData] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
const fetchReportDevices = () =>{
  let temp = []
  Object.keys(routingData).map((key)=>{
    if(JSON.stringify(routingData[key])!='{}'){
      let obj={
        [key] : routingData[key]
      }
      temp.push(obj);
    }
  })
  setReportData(temp);
}
const fetchReportData = () => {
    var reportData = [];
if (reportDevices.length === 0) {
  alert("Please select at least one device to generate a report");
} else {
  Object.keys(routingData).map((key) => {
    reportDevices.map((item) => {
      if (key === item) {
        let obj = { [key]: routingData[key] };
        reportData.push(obj);
      }
    });
  });
  generatePDF(reportData);
}
  };

const generatePDF = (data) => {
    const doc = new jsPDF();
    const defaultReportName = "Routing_Details";
    

    data.forEach((device) => {
      const deviceName = Object.keys(device)[0];
      const deviceData = device[deviceName];
      // doc.addPage();
      doc.text(20, 10, `Device Name: ${deviceName}`);
      const tableStartY = doc.autoTable.previous.finalY + 10;
      // Process Global FTN Table - IPv4 Entries
      if (
        deviceData["global-ftn-table"] &&
        deviceData["global-ftn-table"]["ipv4-ftn-entry"]
      ) {
        generateTable(
          doc,
          "Global FTN Table (IPv4)",
          deviceData["global-ftn-table"]["ipv4-ftn-entry"],
          tableStartY
        );
      }

      // Process Global FTN Table - IPv6 Entries
      if (
        deviceData["global-ftn-table"] &&
        deviceData["global-ftn-table"]["ipv6-ftn-entry"]
      ) {
        generateTable(
          doc,
          "Global FTN Table (IPv6)",
          deviceData["global-ftn-table"]["ipv6-ftn-entry"],
          tableStartY
        );
      }

      // Process ILM Table Entries
      if (deviceData["ilm-table"] && deviceData["ilm-table"]["ip-ilm-entry"]) {
        generateTable(
          doc,
          "ILM Table",
          deviceData["ilm-table"]["ip-ilm-entry"],
          tableStartY
        );
      }
    });

    try {
      doc.save(`${defaultReportName}.pdf`);
    } catch (error) {
      console.error("Error saving PDF:", error);
    }
  };

  const generateTable = (doc, tableName, data) => {
    if (data && data.length > 0) {
        data.forEach((entry, index) => {
            doc.addPage();
            doc.text(20, 10, tableName);

            // Conditionally add subheading only for Global FTN Table
            if (
                tableName === "Global FTN Table (IPv4)" ||
                tableName === "Global FTN Table (IPv6)"
            ) {
                const subHeading = entry["fec-prefix"];
                doc.text(20, 20, `FEC-Prefix: ${subHeading}`);
            }

            const tableBody = [];
            console.log(entry, "req");
            if (tableName === "ILM Table") {
                Object.keys(entry.state).forEach((key) => {
                    const entryValue = entry.state[key];
                    const displayValue = entryValue || "NO DATA FOUND";
                    const rowData = [key, displayValue];
                    tableBody.push(rowData);
                });
            }

            if (
                tableName === "Global FTN Table (IPv4)" ||
                tableName === "Global FTN Table (IPv6)"
            ) {
                if (entry !== undefined && entry !== null) {
                    console.log(entry, "####")
                    if (entry["nhlfe-entry"] !== undefined && entry["nhlfe-entry"] !== null) {
                        entry["nhlfe-entry"].forEach((nhlfeEntry) => {
                            console.log(nhlfeEntry, "hmm");
                            if (nhlfeEntry.state !== undefined && nhlfeEntry.state !== null) {
                                Object.keys(nhlfeEntry.state).forEach((key) => {
                                    const entryValue = nhlfeEntry.state[key];
                                    const displayValue = entryValue || "NO DATA FOUND";
                                    const rowData = [key, displayValue];
                                    tableBody.push(rowData);
                                });
                            }
                        });
                    }
                }

                if (entry && entry.state) {
                    Object.keys(entry.state).forEach((key) => {
                        const entryValue = entry.state[key];
                        const displayValue = entryValue || "NO DATA FOUND";
                        const rowData = [key, displayValue];
                        tableBody.push(rowData);
                    });
                }
            }
            try {
                doc.autoTable({
                    head: [["Properties", "Value"]], // Specify headers separately using "head"
                    body: tableBody,
                    theme: "striped",
                    margin: { top: 40 },
                    drawCell: function (cell, opts) {
                        if (opts.column.index % 2 === 0) {
                            // Add border to separate key-value pairs
                            cell.lineWidth = 0.5;
                            cell.lineColor = "#000";
                            if (opts.row.index % 2 !== 0) {
                                // Add border between key-value pairs
                                cell.border = [0, 0, 0, 8];
                            }
                        }
                    },
                });
            } catch (error) {
                console.error("Error generating table:", error);
            }
        });
    }
};


  useEffect(() => {
    fetchLsp();
  }, []);

  const handleSelectedDevice = (device) => {
    setSelectedDevice(device);
    setIsfetching(true);
  };
  const handleSelectAll = (event) => {
    if (event.target.checked) {
      const allDevices = reportData.map(device => Object.keys(device)[0]);
      setReportDevices(allDevices);
    } else {
      setReportDevices([]);
    }
  };
  const handleReportDevices = (event, item) => {
    let updatedList = [...reportDevices];
    if (event.target.checked) {
      updatedList = [...reportDevices, item];
    } else {
      updatedList = updatedList.filter(device => device !== item);
    }
    setReportDevices(updatedList);
  };

  const fetchLsp = () => {
    fetch(
      `http://${process.env.REACT_APP_CLIENT_IP}:5000/configuration-management/lsp-collection`,
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
        body: JSON.stringify({ unique_id_list: [...connectedDevices] }),
      }
    )
      .then((resp) => resp.json())
      .then((resp) => {
        setRoutingData(resp);
        console.log(resp);

      setLoading(false);
        
      })
      .catch((error) => {
        console.error(error);
      });
  };
  return (
    <div>
      {loading ? (
        <Loading />
      ) : (
        <div className="test_class">
          <div  style={{display:"flex"}}>
            <DropdownButton
              id="device-dropdown"
              style={{ marginTop: "20px" }}
              title={selectedDevice ? ` ${selectedDevice}` : "Choose Devices"}
              drop="down"
              className="custom-dropdown"
            >
              {connectedDevices.map((device, index) => (
                <Dropdown.Item
                  key={index}
                  eventKey={device}
                  style={{ fontSize: "small" }}
                  onClick={() => handleSelectedDevice(device)}
                >
                  {device}
                </Dropdown.Item>
              ))}
            </DropdownButton>
            <button
              className="cancelRole lspGetReport"
              onClick={() => { setShowPopup(true); fetchReportDevices();}}
              >
              Get Report
            </button>
          </div>

          {showPopup && (
            <Popup
              open={showPopup}
              closeOnDocumentClick
              onClose={() => setShowPopup(false)}
              contentStyle={{
                width: "24%",
                height: "435px",
                borderRadius: "5px",
                marginTop: "10rem",
                fontSize:"smaller",
                textAlign:"left",
              }}
            >
              <div>
                <div style={{ margin: "4%", color: "#086194",fontSize: "large" }}>Select Devices</div>
                <img style={{position:"absolute",right:"5%",top:"4%",cursor:"pointer"}} onClick={() => {setShowPopup(false);setReportDevices([]);}}src={close} alt="" width={15}/>             
                <form className="deviceListForm">
                  <div key="selectAll" className="mb-3">
                    <label htmlFor="selectAllCheckbox">Select All</label>
                    <input
                      style={{ margin: "0px 10px", height: "12px" }}
                      type="checkbox"
                      id="selectAllCheckbox"
                      onChange={handleSelectAll}
                    />
                  </div>
                  {reportData.map((device, index) => (
                  <div key={index} className="mb-3">
                    {Object.keys(device).map((key) => (
                      <>
                        <label style={{ maxWidth: "220.5px" }} htmlFor={`deviceCheckbox-${index}`}>
                          {key}
                        </label>
                        <input
                          style={{ margin: "0px 10px", height: "12px" }}
                          type="checkbox"
                          id={`deviceCheckbox-${index}`}
                          value={device}
                          onChange={(e) => handleReportDevices(e, key)}
                          checked={reportDevices.includes(key)}
                        />
                      </>
                    ))}
                  </div>
                ))}
                </form>
                <button className="btn btn-primary mb-3" 
                disabled={reportData.length>=1?false:true}
                style={{position:"absolute",right:"34%"}} onClick={fetchReportData}>
                  Download
                </button>
              </div>
            </Popup>
          )}
          {selectedDevice && (
            <div style={{ marginLeft: "1%",height:"400px",overflow:"auto" }}>
              <RoutingDetails data={routingData[selectedDevice]} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
export default LspRouting;