import { SectionData } from "igniteui-react-core";
import React, { useEffect, useState } from "react";
import notify from "../utils"
const AttachToVrf = ({ vrfAtachInterfaceData, vrfName,saveAttachToVrf }) => {
  const [vrfDataResponse, setVrfDataResponse] = useState([]);
  const [checkBoxData, setCheckBoxdata] = useState({
    existing: [],
    changed: [],
  });
  useEffect(() => {
    if (vrfAtachInterfaceData) {
      setVrfDataResponse(vrfAtachInterfaceData);
      vrfAtachInterfaceData.map((item) => {
        if (
          item["state"] &&
          item["state"]["vrf-name"] &&
          item["state"]["vrf-name"] !== "management" &&
          item["state"]["vrf-name"] !== "default"
        ) {
          setCheckBoxdata((prev) => ({
            ...prev,
            existing: [...prev.existing, item.name],
          }));
        }
      });
    }
  }, [vrfAtachInterfaceData]);
  const handleInterfaceCheckbox = (e, name) => {
    let vrfDataList = [];
    let changedList = checkBoxData.changed ? [...checkBoxData.changed] : [];
    if (e.target.checked) {
      let obj = {};
      vrfDataResponse.map((item) => {
        if (item.name === name) {
          obj = {
            "ipi-if-ip:ipv4": {
              config: {
                "primary-ip-addr":
                  item["ipi-if-ip:ipv4"] && item["ipi-if-ip:ipv4"]["config"]
                    ? item["ipi-if-ip:ipv4"]["config"]["primary-ip-addr"]
                    : item["ipi-if-ip:ipv4"]
                    ? item["ipi-if-ip:ipv4"]
                    : "not configured",
              },
            },
            name: item["name"],
            state: {
              name: item["name"],
              "oper-status": "up",
              "vrf-name": vrfName,
            },
          };
          changedList.push({
            name: item["name"],
            ipAddress:
              item["ipi-if-ip:ipv4"] && item["ipi-if-ip:ipv4"]["config"]
                ? item["ipi-if-ip:ipv4"]["config"]["primary-ip-addr"]
                : item["ipi-if-ip:ipv4"]
                ? item["ipi-if-ip:ipv4"]
                : "not configured",
          });
          setCheckBoxdata((prev) => ({
            ...prev,
            changed: [...changedList],
          }));
        } else {
          obj = { ...item };
        }
        vrfDataList.push(obj);
      });
    } else {
      let obj = {};
      vrfDataResponse.map((item) => {
        if (!checkBoxData.existing.includes(name)) {
          if (item.name === name) {
            obj = {
              "ipi-if-ip:ipv4": {
                config: {
                  "primary-ip-addr":
                    item["ipi-if-ip:ipv4"] && item["ipi-if-ip:ipv4"]["config"]
                      ? item["ipi-if-ip:ipv4"]["config"]["primary-ip-addr"]
                      : item["ipi-if-ip:ipv4"]
                      ? item["ipi-if-ip:ipv4"]
                      : "not configured",
                },
              },
              name: item["name"],
              state: {
                name: item["name"],
                "oper-status": "up",
              },
            };
            let removedChangeList = checkBoxData.changed.map(
              (item) => item.name !== name
            );
            setCheckBoxdata((prev) => ({
              ...prev,
              changed: [...removedChangeList],
            }));
          } else {
            obj = { ...item };
          }
        } else {
          if (item.name === name) {
            obj = {
              "ipi-if-ip:ipv4": {
                config: {
                  "primary-ip-addr":
                    item["ipi-if-ip:ipv4"] && item["ipi-if-ip:ipv4"]["config"]
                      ? item["ipi-if-ip:ipv4"]["config"]["primary-ip-addr"]
                      : item["ipi-if-ip:ipv4"]
                      ? item["ipi-if-ip:ipv4"]
                      : "not configured",
                },
              },
              name: item["name"],
              state: {
                name: item["name"],
                "oper-status": "up",
              },
            };
            let changedObj = {
              name: item["name"],
              ipAddress:
                item["ipi-if-ip:ipv4"] && item["ipi-if-ip:ipv4"]["config"]
                  ? item["ipi-if-ip:ipv4"]["config"]["primary-ip-addr"]
                  : item["ipi-if-ip:ipv4"]
                  ? item["ipi-if-ip:ipv4"]
                  : "not configured",
            };
            setCheckBoxdata((prev) => ({
              ...prev,
              changed: [...prev.changed, { ...changedObj }],
            }));
          } else {
            obj = { ...item };
          }
        }
        vrfDataList.push(obj);
      });
    }
    console.log(vrfDataList);
    setVrfDataResponse(vrfDataList);
  };
  const save_pe_ce_Config = () => {
    const formattedData = {
      "ipi-interface:interfaces": {
        "@xmlns:ipi-interface":
          "http://www.ipinfusion.com/yang/ocnos/ipi-interface",
        interface: checkBoxData.changed.map((interfaceObj) => ({
          ...(checkBoxData.existing.includes(interfaceObj.name) && {
            "@nc:operation": "delete",
          }),
          config: {
            name: interfaceObj.name,
            "vrf-name": vrfName,
          },
          "ipi-if-ip:ipv4": {
            "@xmlns:ipi-if-ip":
              "http://www.ipinfusion.com/yang/ocnos/ipi-if-ip",
            config: {
              "primary-ip-addr": interfaceObj.ipAddress,
            },
          },
          name: interfaceObj.name,
        })),
      },
    };
    console.log(formattedData,'VRF attach data');
    notify('ipi-interface data saved','success')
    saveAttachToVrf && saveAttachToVrf(formattedData)
  };
  return (
    <div className="configured-content-body">
      <p style={{ fontSize: "smaller" }}>
        PE: assign CE side interface and map vrf<br></br>
        Note: Configure interfaces for PE-CE connections<br></br>
        Note: use vrf name from vrf step
      </p>
      <div style={{ margin: "2%", maxHeight: "300px", overflowY: "scroll" }}>
        <table className="user_table">
          <thead className="user_table_head">
            <tr
              style={{
                backgroundColor: "#e5e8ff",
                color: "black",
              }}
            >
              <th>Interface</th>
              <th>Primary IP Address</th>
              <th>Attach to VRF</th>
            </tr>
          </thead>
          <tbody>
            {vrfDataResponse &&
              vrfDataResponse.map((item, index) => {
                return (
                  <tr className="trPerf" key={index}>
                    <td className="tdPerf">{item.name}</td>
                    <td className="tdPerf">
                      {item["ipi-if-ip:ipv4"] &&
                      item["ipi-if-ip:ipv4"]["config"]
                        ? item["ipi-if-ip:ipv4"]["config"]["primary-ip-addr"]
                        : item["ipi-if-ip:ipv4"]
                        ? item["ipi-if-ip:ipv4"]
                        : "not configured"}
                    </td>
                    <td className="tdPerf">
                      <input
                        type="checkbox"
                        // disabled={item["ipi-if-ip:ipv4"] &&item["ipi-if-ip:ipv4"]["config"] && item["ipi-if-ip:ipv4"]["config"]["primary-ip-addr"]?false:true}
                        checked={
                          item["state"] &&
                          item["state"]["vrf-name"] &&
                          item["state"]["vrf-name"] !== "management" &&
                          item["state"]["vrf-name"] !== "default"
                        }
                        onChange={(e) => handleInterfaceCheckbox(e, item.name)}
                      />
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
      <button
        className="btn btn-primary mb-3 bootstarapModificationButton"
        onClick={save_pe_ce_Config}
      >
        save
      </button>
    </div>
  );
};
export default AttachToVrf;
