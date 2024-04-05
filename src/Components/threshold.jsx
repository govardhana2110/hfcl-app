import React, { useState, useEffect, useLayoutEffect } from 'react';
import "../css/threshold.css"
import { Tabs, Tab } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import Dropdown from "react-bootstrap/Dropdown";
import DropdownButton from "react-bootstrap/DropdownButton";
import addIcon from "../Images/add.png"
import notify from "../utils"
import Loading from './loader';
import Flatpickr from "react-flatpickr";
import 'flatpickr/dist/themes/material_green.css';
import deleteIcon from "../Images/garbage.png";
import add from "../Images/add_w.png"
const ThresholdPanel = ({ allDevices }) => {
    const serverIP = process.env.REACT_APP_CLIENT_IP;
    // states
    const [selectedTab, setSelectedTab] = useState(sessionStorage.getItem('selectedTab') || "component");
    const [metricsData, setMetricsData] = useState([]);
    const [selectedSlot, setSelectedSlot] = useState("slot-1");
    const [isLoading, setIsLoading] = useState(true);
    const [selectedDevices, setSelectedDevices] = useState([]);
    const [thresholdSize, setThresholdSize] = useState(0)
    const [thresholdData, setThresholdData] = useState([{ start_time: "", end_time: "", thresholds: {} }]);
    const [method, setMethod] = useState('POST');
    const [showDeviceList, setShowDeviceList] = useState(false)

    //variables
    const slotNumber = parseInt(selectedSlot.replace("slot-", "")) - 1;
    const { start_time, end_time, thresholds } = thresholdData[slotNumber];
    const startTime = start_time ? start_time : "";
    const endTime = end_time ? end_time : "";
    let headersArr1 = ["Component", "Monitoring Status", "Under", "Over"];
    let headersArr2 = ["Component", "Sub-Component", "Monitoring Status", "Under", "Over"];
    let headersArr = headersArr1;
    const componentSubComponent = { cpu: ["cpu", ["CPU-UTILIZATION"]], fan: ["rpm", ["FAN-1/1", "FAN-2/1", "FAN-3/1", "FAN-4/1"]], sensor: ["avg", ["TEMPERATURE-BCM Chip", "TEMPERATURE-Intel Core ID 0", "TEMPERATURE-Intel Core ID 2", "TEMPERATURE-Intel Core ID 4", "TEMPERATURE-Intel Core ID 6", "TEMPERATURE-Intel Core ID 8", "TEMPERATURE-Intel Core ID 10", "TEMPERATURE-Intel Core ID 12", "TEMPERATURE-Intel Core ID 14", "TEMPERATURE-TMP451 Local Sensor", "TEMPERATURE-TMP451 Remote Sensor", "TEMPERATURE-TMP75A Sensor-1", "TEMPERATURE-TMP75A Sensor-2", "TEMPERATURE-TMP75A Sensor-3"]], storage: ["utilized", ["HARD-DISK"]], ram: ["utilized", ["RAM"]] }


    const handleStartTimeChange = (selectedDates, dateString, instance) => {
        if (dateString) {
            const [hours, minutes] = dateString.split(":");
            const formattedTime = `${hours}:${minutes}`;

            setThresholdData((prev) => {
                return prev.map((obj, index) => {
                    if (index === slotNumber) {
                        // Create a new object with updated start time for the selected slot
                        return { ...obj, start_time: formattedTime };
                    } else {
                        return obj; // Return the unchanged object if the slot doesn't exist
                    }
                });
            });
        }
    };

    const handleEndTimeChange = (selectedDates, dateString, instance) => {
        if (dateString) {
            const [hours, minutes] = dateString.split(":");
            const formattedTime = `${hours}:${minutes}`;

            setThresholdData((prev) => {
                return prev.map((obj, index) => {
                    if (index === slotNumber) {
                        // Create a new object with updated start time for the selected slot
                        return { ...obj, end_time: formattedTime };
                    } else {
                        return obj; // Return the unchanged object if the slot doesn't exist
                    }
                });
            });
        }
    };

    const handleTabSelect = (selectedTab) => {
        setSelectedTab(selectedTab);
        sessionStorage.setItem('selectedTab', selectedTab);
    };
    const fetchResourceMetrics = async () => {
        setIsLoading(true);
        await fetch(
            `http://${serverIP}:5000/configuration-management/resource-metrics`,

            {
                method: "GET",
                mode: "cors",
                headers: {
                    "Access-Control-Allow-Origin": "http://localhost:3000",
                    Accept: "application/json",
                    "Content-Type": "application/json",
                    username: sessionStorage.getItem("username"),
                    Authorization: "Bearer " + JSON.parse(sessionStorage.getItem("login_data")).data.access_token,
                },
            }
        )
            .then((resp) => resp.json())
            .then((resp) => {
                setIsLoading(false);
                if (!resp.status) { setMetricsData({ ...resp }); setSelectedDevices(resp.devices) }
                else { alert("failed") }
            })
            .catch((err) => {
                if (err.response) {
                    alert(err.response.data.status);
                    console.log("Error Response Data:", err.response.data);
                    console.log("Error Response Status:", err.response.status);
                    console.log("Error Response Headers:", err.response.headers);
                }
            });
    };

    const fetchThreshold = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(
                `http://${serverIP}:5001/performance-management/thresholds`, {
                mode: "cors",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                    username: sessionStorage.getItem("username"),
                    Authorization: "Bearer " + JSON.parse(sessionStorage.getItem("login_data")).data.access_token,
                },
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const resp = await response.json();
            console.log(resp, "resposnse")
            if (resp.length > 0) {
                setThresholdData(resp);
                setMethod("PATCH");
                setThresholdSize(resp.length - 1)
            } else {
                setThresholdData([{ start_time: "", end_time: "", thresholds: {} }]);
                setMethod("POST");
                setThresholdSize(-1)

            }

        } catch (error) {
            console.error("Failed to fetch thresholds:", error);
            alert("Failed to fetch threshold data");
        }
        setIsLoading(false);
    };
    const handleSlotSelect = (slotName) => {
        setSelectedSlot(slotName);
    };

    const createNewSlot = () => {
        setThresholdData((prev) => [
            ...prev,
            {
                start_time: "",
                end_time: "",
                thresholds: {} // Initialize thresholds object as empty
            }
        ]);
        setSelectedSlot(`slot-${thresholdData.length + 1}`)
        notify("New slot added!", "success")
    };


    const handleToggleChange = (metricsKey, objKey, subKey) => {
        setMetricsData((prev) => {
            if (subKey) { return { ...prev, [metricsKey]: { ...prev[metricsKey], [objKey]: { ...prev[metricsKey][objKey], [subKey]: !prev[metricsKey][objKey][subKey] } } }; }
            else { return { ...prev, [metricsKey]: { ...prev[metricsKey], [objKey]: !prev[metricsKey][objKey] } }; }
        });
    };

    const Toggle = ({ toggled, func, label }) => {
        return (
            <div className="togglerIcon">
                <label>
                    <input type="checkbox" defaultChecked={toggled} onClick={func} />
                    <span />
                    <strong>{label}</strong>
                </label>
            </div>
        );
    }

    const toggleDeviceSelection = (device) => {
        const index = selectedDevices.indexOf(device);
        if (index === -1) {
            setSelectedDevices([...selectedDevices, device]);
        } else {
            const updatedDevices = [...selectedDevices];
            updatedDevices.splice(index, 1);
            setSelectedDevices(updatedDevices);
        }
    };

    const handleThresholdChange = (e, eventKey, key, subKey, item) => {
        let obj = thresholdData[slotNumber];
        let prev = { ...obj };
        if (eventKey !== "component") {
            if (!prev["thresholds"]) {
                prev["thresholds"] = {};
            }
            if (!prev["thresholds"][eventKey]) {
                prev["thresholds"][eventKey] = {};
            }
            if (!prev["thresholds"][eventKey][key]) {
                prev["thresholds"][eventKey][key] = {};
            }
            prev["thresholds"][eventKey][key][subKey] = parseInt(e.target.value);
            let updatedThresholdData = [...thresholdData];
            updatedThresholdData[0] = prev;
            setThresholdData((prev) => {
                return prev.map((obj, index) => {
                    if (index === slotNumber) {
                        return updatedThresholdData[0];
                    } else {
                    }
                });
            });


        } else {
            if (!prev["thresholds"]) {
                prev["thresholds"] = {};
            }
            if (!prev["thresholds"][eventKey]) {
                prev["thresholds"][eventKey] = {};
            }
            if (!prev["thresholds"][eventKey][key]) {
                prev["thresholds"][eventKey][key] = {}
            }
            if (item === "cpu") {
                prev["thresholds"][eventKey][key][subKey] = parseInt(e.target.value);
            } else {
                if (!prev["thresholds"][eventKey][key][item]) {
                    prev["thresholds"][eventKey][key][item] = {}
                }
                prev["thresholds"][eventKey][key][item][subKey] = parseInt(e.target.value);
            }
            let updatedThresholdData = [...thresholdData];
            updatedThresholdData[0] = prev;
            // Update the state
            setThresholdData((prev) => {
                return prev.map((obj, index) => {
                    if (index === slotNumber) {
                        return updatedThresholdData[0];
                    } else {
                        return obj;
                    }
                });
            });

        }
    }
    console.log(thresholdData,"===============thresholdData=======================")

    useEffect(() => {
        const storedTab = sessionStorage.getItem('selectedTab');
        console.log(storedTab, "useeffect")
        if (storedTab) {
            setSelectedTab(storedTab);
        } else {
            setSelectedTab('component');
        }
        fetchResourceMetrics();
        fetchThreshold();
    }, [])

    useEffect(() => {
        if (Object.keys(thresholdData[slotNumber]["thresholds"]).length === 0 && method === "PATCH" && method !== "DELETE") {
            setMethod("POST")
        } else if (Object.keys(thresholdData[slotNumber]["thresholds"]).length > 0 && method !== "PATCH" && method !== "DELETE") {
            setMethod("PATCH")
        }
    }, [selectedSlot])

    useEffect(() => {
        if (method === "DELETE" && slotNumber > thresholdSize) {
            if (slotNumber === 0) {
                setThresholdData([{ start_time: "", end_time: "", thresholds: {} }])
            } else {
                let arr = thresholdData.filter((obj, index) => index !== slotNumber)
                setThresholdData(arr)
                setSelectedSlot(`slot-${parseInt(selectedSlot.replace("slot-", "")) - 1}`)
                if (Object.keys(thresholdData[slotNumber - 1]["thresholds"]).length === 0 && method === "PATCH") {
                    setMethod("POST")
                } else if (Object.keys(thresholdData[slotNumber - 1]["thresholds"]).length > 0 && method !== "PATCH") {
                    setMethod("PATCH")
                }
            }

        } else if (method === "DELETE") {
            handleChangeSubmit()
        }
    }, [method])

    const createTable = (eventKey) => {

        let arr;
        if (!metricsData || !metricsData[eventKey]) { <div>Loading...</div> }
        if (metricsData[eventKey]) {
            if (typeof metricsData[eventKey] === "object") {
                arr = Object.keys(metricsData[eventKey]);
            }
        }
        eventKey === "interface" || eventKey === "qos_data" || eventKey === "component" ?
            headersArr = headersArr2 : headersArr = headersArr1
        return (
            <div className="provision-content">


                <div style={{ maxHeight: "350px", overflow: "auto", position: "relative" }}>


                    {metricsData && metricsData[eventKey] && thresholdData ?
                        <table className="user_table" style={{ margin: "0px", minHeight: "100%" }} >
                            <thead style={{ fontSize: "small", position: "sticky", top: "0", zIndex: "1" }} className="user_table_head">
                                <tr style={{ backgroundColor: "#e5e8ff", color: "black", }}>{headersArr.map((header, index) => (<th key={index}>{header}</th>))}</tr>
                            </thead>

                            <tbody style={{ fontSize: "14px" }} className="network_table_body">
                                {eventKey === "interface" || eventKey === "qos_data" ? (
                                    Object.keys(metricsData[eventKey]).map((obj) =>
                                        Object.keys(metricsData[eventKey][obj]).map((key) => {

                                            return (
                                                <tr key={`${obj}-${key}`}>
                                                    <td className="uppercase">{key}</td>
                                                    <td className="uppercase">{obj}</td>
                                                    <td><Toggle toggled={metricsData[eventKey][obj][key]} func={() => handleToggleChange(`${eventKey}`, `${obj}`, `${key}`)} /></td>
                                                    <td>
                                                        <input value={thresholdData && thresholdData[slotNumber]["thresholds"][eventKey]?.[key]?.under || ""} type='number' onChange={(e) => { handleThresholdChange(e, `${eventKey}`, `${key}`, "under") }} />
                                                    </td>
                                                    <td>
                                                        <input value={thresholdData && thresholdData[slotNumber]["thresholds"][eventKey]?.[key]?.over || ""} type='number' onChange={(e) => { handleThresholdChange(e, `${eventKey}`, `${key}`, "over") }} />
                                                    </td>
                                                </tr>
                                            )
                                        })))
                                    : eventKey === "component" ?
                                        Object.keys(componentSubComponent).map((objKey) => (
                                            Array.isArray(componentSubComponent[objKey][1]) && componentSubComponent[objKey][1].map((key, index) => (
                                                <tr key={`${objKey}-${index}`}>
                                                    <td className="uppercase">{objKey}</td>
                                                    <td className="uppercase">{key} - {`${componentSubComponent[objKey][0]}`}</td>
                                                    <td><Toggle toggled={metricsData[eventKey][objKey]} func={() => handleToggleChange(eventKey, objKey)} /></td>
                                                    <td>
                                                        <input type="number" value={objKey === "cpu" && thresholdData[slotNumber]["thresholds"]?.[eventKey]?.[key]?.under ? thresholdData[slotNumber]["thresholds"]?.[eventKey]?.[key]?.under : thresholdData[slotNumber]["thresholds"]?.[eventKey]?.[key]?.[`${componentSubComponent[objKey][0]}`]?.under || ""} onChange={(e) => handleThresholdChange(e, `${eventKey}`, `${key}`, "under", `${componentSubComponent[objKey][0]}`)} />
                                                    </td>
                                                    <td>
                                                        <input type="number" value={objKey === "cpu" && thresholdData[slotNumber]["thresholds"]?.[eventKey]?.[key]?.over ? thresholdData[slotNumber]["thresholds"]?.[eventKey]?.[key]?.over : thresholdData[slotNumber]["thresholds"]?.[eventKey]?.[key]?.[`${componentSubComponent[objKey][0]}`]?.over || ""} onChange={(e) => handleThresholdChange(e, `${eventKey}`, `${key}`, "over", `${componentSubComponent[objKey][0]}`)} />
                                                    </td>
                                                </tr>
                                            ))
                                        ))
                                        :
                                        (Object.keys(metricsData[eventKey]).map((key) => {
                                            const threshold = thresholdData[slotNumber]["thresholds"][eventKey]?.[key];
                                            return (
                                                <tr key={key}>
                                                    <td className="uppercase">{key}</td>
                                                    <td><Toggle toggled={metricsData[eventKey][key]} func={() => handleToggleChange(`${eventKey}`, `${key}`)} /></td>
                                                    <td>
                                                        {eventKey === "sla" ? <input value={threshold?.under || ""} type='number' onChange={(e) => { handleThresholdChange(e, `${eventKey}`, `${key}`, "under") }} /> : <input value={threshold?.under || ""} type="number" onChange={(e) => { handleThresholdChange(e, `${eventKey}`, `${key}`, "under") }} />}
                                                    </td>
                                                    <td>
                                                        {eventKey === "sla" ? <input value={threshold?.over || ""} type='number' onChange={(e) => { handleThresholdChange(e, `${eventKey}`, `${key}`, "over") }} /> : <input value={threshold?.over || ""} type="number" onChange={(e) => { handleThresholdChange(e, `${eventKey}`, `${key}`, "over") }} />}
                                                    </td>
                                                </tr>
                                            )
                                        }))
                                }
                            </tbody>
                        </table> : null}
                </div>
            </div>
        );
    };

    const handleChangeSubmit = async () => {
        setIsLoading(true)
        try {
            const data = { ...metricsData, devices: selectedDevices };
            await fetch(`http://${serverIP}:5000/configuration-management/resource-metrics`,
                {
                    method: "POST",
                    mode: "cors",
                    headers: {
                        "Access-Control-Allow-Origin": "http://localhost:3000",
                        Accept: "application/json",
                        "Content-Type": "application/json",
                        username: sessionStorage.getItem("username"),
                        Authorization: "Bearer " + JSON.parse(sessionStorage.getItem("login_data")).data.access_token,
                    },
                    body: JSON.stringify(data), // Convert data to JSON string before sending
                }).then((res) => {
                    fetchResourceMetrics();
                })

        } catch (e) {
            console.log("Error posting metricsdata:", e);
            notify("Could not update metrics data", "failure");
        }
        try {
            let postData = method === "DELETE" ? {
                start_time: thresholdData[slotNumber].start_time || "",
                end_time: thresholdData[slotNumber].end_time || "",
            } : thresholdData[slotNumber];

            await fetch(`http://${serverIP}:5001/performance-management/thresholds`
                , {
                    method,
                    mode: "cors",
                    headers: {
                        "Access-Control-Allow-Origin": "http://localhost:3000",
                        Accept: "application/json",
                        "Content-Type": "application/json",
                        username: sessionStorage.getItem("username"),
                        Authorization: "Bearer " + JSON.parse(sessionStorage.getItem("login_data")).data.access_token,
                    },
                    body: JSON.stringify(postData),
                }).then((res) => {
                        if (res.ok) {
                            fetchThreshold();
                            setSelectedSlot("slot-1")
                            setIsLoading(false)
                            notify("Updated MetricsData", "success")
                            notify("updated threshold", "success")
                        }else {
                            fetchThreshold();
                            setSelectedSlot("slot-1")
                            setIsLoading(false)
                            notify("Time slot already exists or is not Mentioned properly!", "failure");
                            console.error("Error posting thresholdData:");

                        }
                })
        } catch (e) {
           
            console.log("Error posting thresholdData:", e);
            notify("Could not update threshold data", "failure");
        }
    }
    return (isLoading || !thresholdData || !metricsData ? <Loading /> :
        <div style={{ display: "flex", flexDirection: "column", backgroundColor: 'white', borderRadius: '20px', paddingTop: isLoading ? "20%" : '4%', paddingLeft: isLoading ? "45%" : "" }}>
            <div style={{ marginBottom: '1rem' }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "2rem", justifyContent: "space-around", marginTop: "0", marginLeft: "1rem" }}>
                        <button onClick={createNewSlot} style={{ alignSelf: "center", color: "white", border: "none", borderRadius: "2px", backgroundColor: "#233b82", padding: "4px 8px" }}>
                            <img src={add} alt=""
                                style={{
                                    width: "20px",
                                    height: "20px",
                                    cursor: "pointer",
                                    marginBottom: "3px",
                                }}>
                            </img>
                        </button>
                        <DropdownButton
                            id="slot-dropdown"
                            title={selectedSlot ?
                                selectedSlot + thresholdData[slotNumber] && thresholdData[slotNumber].start_time && thresholdData[slotNumber].end_time ?
                                    `${thresholdData[slotNumber].start_time} - ${thresholdData[slotNumber].end_time}`
                                    : ""
                                : "Choose slot"}
                            drop="down"
                            className="custom-dropdown"
                            style={{ margin: "0" }}
                            onSelect={handleSlotSelect}
                        >
                            {thresholdData.map((slot, index) => (
                                <Dropdown.Item key={slot} eventKey={`slot-${index + 1}`} style={{ fontSize: "small" }}>
                                    {thresholdData[index] && thresholdData[index].start_time && thresholdData[index].end_time ?
                                        `slot-${index + 1}` + ` (${thresholdData[index].start_time} - ${thresholdData[index].end_time})`
                                        : (
                                            `slot-${index + 1}`
                                        )}
                                </Dropdown.Item>
                            ))}
                        </DropdownButton>
                        <img src={deleteIcon} alt='' width={20} height={20} onClick={() => { setMethod("DELETE"); }} style={{ cursor: "pointer" }} />
                    </div>
                    {slotNumber > thresholdSize ? (
                        <>
                            <form>
                                <Flatpickr
                                    options={{
                                        enableTime: true,
                                        noCalendar: true,
                                        dateFormat: 'H:i',
                                    }}
                                    placeholder='Start-time'
                                    value={startTime || ""}
                                    onChange={handleStartTimeChange}
                                />
                            </form>
                            <form>
                                <Flatpickr
                                    options={{
                                        enableTime: true,
                                        noCalendar: true,
                                        dateFormat: 'H:i',
                                    }}
                                    placeholder='End-time'
                                    value={endTime || ""}
                                    onChange={handleEndTimeChange}
                                />
                            </form>
                        </>
                    ) : null}
                    <div>
                        <button onClick={() => setShowDeviceList(!showDeviceList)} style={{ backgroundColor: "#233b82", cursor: "pointer", border: "none", borderRadius: "4px", color: "white", padding: ".2rem .5rem", marginRight: "3rem", fontSize: "smaller" }}>{!showDeviceList ? "Show Devicelist" : "Hide Devicelist"}</button>
                        <button style={{ backgroundColor: "#233b82", cursor: "pointer", marginRight: "3rem", border: "none", borderRadius: "4px", color: "white", padding: ".2rem .5rem", fontSize: "smaller" }} onClick={handleChangeSubmit}>Apply changes</button>
                    </div>
                </div>
            </div>
            <div style={{ display: "flex" }}>
                <div style={{ width: "70%" }}>
                    <Tabs defaultActiveKey={sessionStorage.getItem("selectedTab") || "component"} id="routing-tabs" onSelect={handleTabSelect}>
                        {metricsData && thresholdData && [...Object.keys(metricsData)].map((metricsKey) => metricsKey !== "timer" && metricsKey !== "devices" &&
                            <Tab eventKey={`${metricsKey}`} title={`${metricsKey}`.charAt(0).toUpperCase() + `${metricsKey}`.slice(1) + "_Params"} key={`${metricsKey}`}>
                                {createTable(`${metricsKey}`, metricsData, thresholdData)}
                            </Tab>
                        )}
                    </Tabs>
                </div>
                <div className="cardfour" style={{ display: showDeviceList ? "flex" : "none", width: "25%", background: "white", padding: "1%", marginLeft: "2rem" }} >
                    <div style={{ maxHeight: "450px", overflow: "auto", width: "100%" }}>
                        <table style={{ marginTop: "auto", fontSize: "smaller" }} className="user_table">
                            <thead className='user_table_head'>
                                <tr>
                                    <th>Device Name</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>Select All</td>
                                    <td><input type="checkbox" id="selectAll" name="selectAll" value="selectAll" checked={allDevices && selectedDevices.length === allDevices.length}
                                        onClick={() => {
                                            if (allDevices && selectedDevices.length === allDevices.length) {
                                                setSelectedDevices([]);
                                            } else {
                                                setSelectedDevices([...allDevices]);
                                            }
                                        }} /></td>
                                </tr>
                                {allDevices && allDevices.map((device, index) => (
                                    <tr key={index}>
                                        <td>{device}</td>
                                        <td>
                                            <div className="list-container">
                                                <input type="checkbox" id={device} name={device} value={device} checked={selectedDevices && selectedDevices.includes(device)}
                                                    onClick={() => toggleDeviceSelection(device)} />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>


        </div>
    )
};
export default ThresholdPanel;