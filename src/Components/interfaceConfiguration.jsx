import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Swal from "sweetalert2";
import Loading from "../Components/loader";
import notify from '../utils';

const InterfaceConfiguration = ({ data, routerId,loading,saveConfiguration }) => {
  const [interfaceData, setInterfaceData] = useState({
    totalData: [],
    changedData: [],
  });
  const [invalidIp, setInvalidIp] = useState(false);
  const [fieldIndex, setFieldIndex] = useState();
  useEffect(() => {
    let tempArr = [];
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
    setInterfaceData((prev) => ({
      ...prev,
      totalData: [...tempArr],
    }));
  }, [data]);
  const validIp = (ip) => {
    let regexExp =
      /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/;
    setInvalidIp(regexExp.test(ip));
    return regexExp.test(ip);
  };
  const validateName = (name) => {
    const regex = /^(ge|xe)(\d{1,2})$/; // Regular expression for "ge" or "xe" followed by 1 or 2 digits
    const match = name.match(regex);
    return match;
  };
  const handleInterfaceIP = (e, name, index) => {
    if (validateName(name)) {
      validIp(e.target.value);
      setFieldIndex(index);
      let tempData = [...interfaceData.totalData];
      let changedTempData = [...interfaceData.changedData];
      tempData[index]["ipi-if-ip:ipv4"] = e.target.value;
      !changedTempData.includes(tempData[index]) &&
        changedTempData.push(tempData[index]);
      setInterfaceData((prev) => ({
        ...prev,
        totalData: [...tempData],
        changedData: [...changedTempData],
      }));
    }
  };
  const saveInterfaceConfig = () => {
    let arr = [];
    interfaceData.changedData &&
      interfaceData.changedData.map((item) => {
        let obj = {
          "ipi-if-ip:ipv4": {
            "@xmlns:ipi-if-ip": `http://www.ipinfusion.com/yang/ocnos/ipi-if-ip`,
            config: { "primary-ip-addr": item["ipi-if-ip:ipv4"] },
          },
          config: { name: item["name"] },
          name: item["name"],
        };
        arr.push(obj);
      });
    var dict = {
      "ipi-interface:interfaces": { 
        "@xmlns:ipi-interface": `http://www.ipinfusion.com/yang/ocnos/ipi-interface`,
        interface: arr
       },
    };
    console.log(dict, 'inteface data')
    saveConfiguration(dict,routerId)
    notify("Interafce configuration saved",'success');

    
    // fetch(
    //   `http://${process.env.REACT_APP_CLIENT_IP}:5000/configuration-management/configuration/interface/${routerid}`,
    //   {
    //     mode: "cors",
    //     method: "POST",
    //     headers: {
    //       "Access-Control-Allow-Origin": "http://localhost:3000",
    //       Accept: "application/json",
    //       "Content-Type": "application/json",
    //     },
    //     body: JSON.stringify(dict),
    //   }
    // )
    //   .then((resp) => resp.json())
    //   .then((resp) => {
    //     if (resp.status && resp.status["rpc-reply"]) {
    //       // Swal.fire({
    //       //   title: "Interface Configuration",
    //       //   text: "Configuration changes updated successfully",
    //       //   width: 300,
    //       //   height: 40,
    //       //   color: "green",
    //       //   icon: "success",
    //       // });
    //     } else {
    //       alert(resp.status.message, resp.status.status);
    //       // Swal.fire({
    //       //   title: resp.status.status,
    //       //   text: resp.status.message,
    //       //   width: 300,
    //       //   height: 40,
    //       //   color: "red",
    //       //   icon: "failure",
    //       // });
    //     }
    //   });
  };

  return (
    <div className="configured-content-body">
      <p style={{ fontSize: "smaller" }}>
        Edit the required interface to configure
      </p>
      <div className="BgpConfigRightTopHeader">Interface Configuration</div>
      <div style={{ margin: "2%", maxHeight: "250px", overflowY: "scroll" }}>
        <table className="user_table">
          <thead className="user_table_head">
            <tr style={{ backgroundColor: "#e5e8ff", color: "black" }}>
              <th>Interface</th>
              <th>Primary IP Address</th>
            </tr>
          </thead>

          <tbody>
            {interfaceData.totalData &&
              interfaceData.totalData.map((item, index) => (
                <tr className="trPerf" key={index}>
                  <td className="tdPerf">{item.name}</td>
                  <td className="tdPerf">
                    <input
                      type="text"
                      value={item["ipi-if-ip:ipv4"]}
                      onChange={(e) => handleInterfaceIP(e, item.name, index)}
                      disabled={!validateName(item.name)}
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
export default InterfaceConfiguration;
