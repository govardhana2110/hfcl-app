import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Swal from "sweetalert2";
import Loading from "../Components/loader";
import enabled from "../Images/power-on.png";
import disabled from "../Images/power-off.png";
import add from "../Images/add_w.png";
import remove from "../Images/closeS.png";
import { TextField } from "@mui/material";
import notify from "../utils";
const EnableLabelSwitching = ({
  data,
  routerId,
  loading,
  saveLabelSwitching,
  labelSwitchResponse,
}) => {
  const [interfaceData, setInterfaceData] = useState({
    apiData: [],
    totalData: [],
    changedData: [],
    labelSwitchdata: [],
    enabeledLabeldata: [],
    enabeledLabelCopy: [],
  });
  const [invalidIp, setInvalidIp] = useState(false);
  const [fieldIndex, setFieldIndex] = useState();
  const [interfacePopUp, setInterfacePopUp] = useState(false);
  const [newInterafceName, setNewInterafceName] = useState();

  useEffect(() => {
    let tempArr = [];
    let labelData = [];
    data &&
      data["ipi-interface:interfaces"]?.interface.map((item) => {
        let obj = {};
        if (item["ipi-if-ip:ipv4"]) {
          obj["ipi-if-ip:ipv4"] =
            item["ipi-if-ip:ipv4"]["config"]["primary-ip-addr"];
          obj["name"] = item["name"];
          obj["state"] = item["state"]["oper-status"];
          tempArr.push(obj);
        } else {
          obj["ipi-if-ip:ipv4"] = "Not Configured";
          obj["name"] = item["name"];
          obj["state"] = item["state"]["oper-status"];
          tempArr.push(obj);
        }
      });
      labelSwitchResponse && labelSwitchResponse.map((item) => {
      labelData.push(item.name);
    });
    setInterfaceData((prev) => ({
      ...prev,
      totalData: [...tempArr],
      enabeledLabeldata: [...labelData],
      enabeledLabelCopy: [...labelData],
      apiData: [...labelData],
    }));
  }, [data, labelSwitchResponse]);
  const validIp = (ip) => {
    let regexExp =
      /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/;
    setInvalidIp(regexExp.test(ip));
    return regexExp.test(ip);
  };
  const validateName = (name) => {
    if (name) {
      const regex = /^(ge|xe)(\d{1,2})$/; // Regular expression for "ge" or "xe" followed by 1 or 2 digits
      const match = name.match(regex);
      return match;
    }
    return true;
  };
  const handleInterfaceIP = (e, name, index) => {
    validIp(e.target.value);
    setFieldIndex(index);
    let tempData = [...interfaceData.totalData];
    let changedTempData = [...interfaceData.changedData];
    tempData[index][name] = e.target.value;
    !changedTempData.includes(tempData[index]) &&
      changedTempData.push(tempData[index]);
    setInterfaceData((prev) => ({
      ...prev,
      totalData: [...tempData],
      changedData: [...changedTempData],
    }));
  };
  const removedIpFunction = (name) => {
    var ip = "";
    data["ipi-interface:interfaces"]?.interface.map((totalItem) => {
      if (totalItem["name"] === name) {
        ip = totalItem["ipi-if-ip:ipv4"]["config"]["primary-ip-addr"];
      }
    });
    return ip;
  };

  const saveInterfaceConfig = () => {
    let arr = [];
    var difference = interfaceData.enabeledLabeldata.filter(
      (item) => !interfaceData.enabeledLabelCopy.includes(item)
    );
    var availableDataNames = [];
    data &&
      data["ipi-interface:interfaces"]?.interface.map((item) => {
        if (item["ipi-if-ip:ipv4"]) {
          availableDataNames.push(item["name"]);
        }
      });
    interfaceData.changedData &&
      interfaceData.changedData.map((item) => {
        if (
          availableDataNames.includes(item["name"]) ||
          item["ipi-if-ip:ipv4"] !== ""
        ) {
          let obj = {
            "ipi-if-ip:ipv4": {
              ...(item["ipi-if-ip:ipv4"] === "" &&
                availableDataNames.includes(item["name"]) && {
                  "@nc:operation": "delete",
                }),
              "@xmlns:ipi-if-ip": `http://www.ipinfusion.com/yang/ocnos/${"ipi-if-ip"}`,
              config: {
                "primary-ip-addr": availableDataNames.includes(item["name"])
                  ? removedIpFunction(item["name"])
                  : item["ipi-if-ip:ipv4"],
              },
            },
            config: { name: item["name"] },
            name: item["name"],
          };
          arr.push(obj);
        }
      });
    let labelSwitchArr = [];
    [...interfaceData.labelSwitchdata, ...difference].map((item) => {
      let obj = {
        ...(interfaceData.enabeledLabeldata.includes(item) && {
          "@nc:operation": "delete",
        }),
        config: {
          name: item,
        },
        "label-switching": {
          config: {
            enable: [null],
          },
        },
        name: item,
      };
      labelSwitchArr.push(obj);
    });
    let labelSwitchDataObj = labelSwitchArr.length
      ? {
          "ipi-mpls:mpls": {
            "@xmlns:ipi-mpls": "http://www.ipinfusion.com/yang/ocnos/ipi-mpls",
            interfaces: {
              interface: [...labelSwitchArr],
            },
          },
        }
      : null;
    var dict = {
      "ipi-interface:interfaces": {
        "@xmlns:ipi-interface":
          "http://www.ipinfusion.com/yang/ocnos/ipi-interface",
        interface: arr,
      },
    };
    saveLabelSwitching &&
      saveLabelSwitching(
        dict,
        routerId,
        labelSwitchDataObj,
        interfaceData.totalData
      );
    notify("Interafce-Label-switching configuration saved", "success");
  };
  const handleEnableLabelSwitching = (name, index) => {
    if (
      interfaceData.changedData.length ||
      (interfaceData.totalData[index]["ipi-if-ip:ipv4"] !== "Not Configured" &&
        interfaceData.totalData[index]["ipi-if-ip:ipv4"] !== "")
    ) {
      let obj = {};
      let tempArr = [];
      let labelTempArr = [...interfaceData.labelSwitchdata];
      let enabledData = [...interfaceData.enabeledLabelCopy];
      interfaceData.changedData.map((item) => {
        if (item.name === name) {
          obj = {
            ...item,
            state: item.state === "up" ? "down" : "up",
          };
        } else {
          obj = { ...item };
        }
        tempArr.push(obj);
      });
      let tempData = [...interfaceData.totalData];
      tempData[index]["state"] =
        tempData[index]["state"] === "up" ? "down" : "up";
      if (
        labelTempArr.includes(name) &&
        !interfaceData.enabeledLabeldata.includes(name)
      ) {
        let itemIndex = labelTempArr.indexOf(name);
        labelTempArr.splice(itemIndex, 1);
      } else if (enabledData.includes(name)) {
        let enabledIndex = enabledData.indexOf(name);
        enabledData.splice(enabledIndex, 1);
      } else {
        labelTempArr.push(name);
        enabledData.push(name);
      }
      setInterfaceData((prev) => ({
        ...prev,
        totalData: [...tempData],
        changedData: [...tempArr],
        labelSwitchdata: [...labelTempArr],
        enabeledLabelCopy: [...enabledData],
      }));
    } else {
      notify("Please enter primary IP address", "warning");
    }
  };

  const addInterface = () => {
    let obj = {
      "ipi-if-ip:ipv4": "",
      name: newInterafceName,
      state: "down",
    };
    setInterfaceData((prev) => ({
      ...prev,
      totalData: [...prev.totalData, obj],
      changedData: [...prev.changedData, obj],
    }));
    setInterfacePopUp(false);
  };
  return (
    <div className="configured-content-body">
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <p style={{ fontSize: "smaller" }}>
          PE & P: configure interfaces with ip address <br></br>
          Note: Give IP to only PE-P, P-P interfaces(not PE-CE interfaces, thats
          last step)
        </p>
        <button
          className="btn btn-primary mb-3 bootstarapModificationButton"
          onClick={() => setInterfacePopUp(true)}
        >
          <img
            src={add}
            alt=""
            style={{
              width: "20px",
              height: "20px",
              cursor: "pointer",
              marginBottom: "3px",
            }}
          ></img>
        </button>
      </div>

      {interfacePopUp ? (
        <div
          className="role_content"
          style={{ width: "fit-content", display: "grid", padding: "2%" }}
        >
          <img
            onClick={() => setInterfacePopUp(false)}
            style={{
              position: "absolute",
              right: "4%",
              top: "7%",
              cursor: "pointer",
            }}
            src={remove}
            alt=""
            width={10}
          />
          <div style={{ display: "flex", marginTop: "3%" }}>
            <TextField
              placeholder={`Enter Interface Name`}
              type="text"
              label={`Enter Interface Name`}
              variant="standard"
              value={newInterafceName || ""}
              onChange={(e) => setNewInterafceName(e.target.value)}
            />
          </div>
          <button
            style={{ borderRadius: "3px", marginTop: "10%" }}
            className="btn btn-primary mb-3"
            onClick={addInterface}
          >
            Submit
          </button>
        </div>
      ) : null}

      <div
        style={{
          maxHeight: "250px",
          overflowY: "scroll",
        }}
      >
        <table className="user_table" style={{ marginTop: "0px" }}>
          <thead className="user_table_head">
            <tr style={{ backgroundColor: "#e5e8ff", color: "black" }}>
              <th>Interface</th>
              <th>Primary IP Address</th>
              <th>Enable Label Switching</th>
            </tr>
          </thead>

          <tbody>
            {interfaceData.totalData &&
              interfaceData.totalData.map((item, index) => (
                <tr className="trPerf" key={index}>
                  <td className="tdPerf">
                    {item.name ? (
                      item.name
                    ) : (
                      <input
                        value={interfaceData.totalData[index].name}
                        onChange={(e) => handleInterfaceIP(e, "name", index)}
                      ></input>
                    )}
                  </td>
                  <td className="tdPerf">
                    <input
                      type="text"
                      value={item["ipi-if-ip:ipv4"]}
                      onChange={(e) =>
                        handleInterfaceIP(e, "ipi-if-ip:ipv4", index)
                      }
                      disabled={
                        newInterafceName !== item.name &&
                        !validateName(item.name)
                      }
                    />
                    {/* {!invalidIp && fieldIndex === index && (
                      <p
                        style={{
                          color: "red",
                          fontSize: "small",
                        }}
                      >
                        Invalid IP
                      </p>
                    )} */}
                  </td>
                  <td>
                    <img
                      alt=""
                      width={20}
                      src={
                        interfaceData.labelSwitchdata.includes(
                          interfaceData.totalData[index].name
                        ) ||
                        (interfaceData.enabeledLabeldata.includes(
                          interfaceData.totalData[index].name
                        ) &&
                          interfaceData.enabeledLabelCopy.includes(
                            interfaceData.totalData[index].name
                          ))
                          ? enabled
                          : disabled
                      }
                      onClick={() =>
                        handleEnableLabelSwitching(item.name, index)
                      }
                    />
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      <button
        className="btn btn-primary mb-3 bootstarapModificationButton"
        onClick={() => saveInterfaceConfig()}
      >
        save
      </button>
      {loading && <Loading></Loading>}
    </div>
  );
};
export default EnableLabelSwitching;
