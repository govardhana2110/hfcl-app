import React, { useEffect, useState } from "react";
import "../css/topology.css";
import active from "../Images/power-on.png";
import inactive from "../Images/power-off.png";
import remove from "../Images/closeS.png";
import Loading from "../Components/loader";
import notify from "../utils";
import ConfirmationBox from "./confirmationBox";

const ConfigureBgp = ({ bgpConfData, loading, routertId, saveBgp }) => {
  const [bgpData, setBgpData] = useState({});
  const [afiSafiList, setAfiSafiList] = useState([]);
  const [validateIp, setValidateIp] = useState(false);
  const [fieldIndex, setFieldIndex] = useState();
  const [disableButton, setDisableButton] = useState(false);
  const [errorMessage, setErrorMessage] = useState({});
  const [deleteBox, setDeleteBox] = useState(false);

  const afiTypes = [
    "ipv4",
    "ipv6",
    "vpnv4",
    "vpnv6",
    "rtfilter",
    "l2vpn",
    "link-state",
  ];
  const safiTypes = [
    "unicast",
    "multicast",
    "labeled-unicast",
    "l2vpn-vpls",
    "evpn",
    "link-state",
    "vpn-unicast",
    "rtfilter-unicast",
    "flowspec",
    "flowspec-mpls-vpn",
  ];
  const ipTableHeaders = [
    "Remote IP",
    "Remote AS",
    "Address Family",
    "Activate",
    "Remove",
  ];
  useEffect(() => {
    setBgpData(bgpConfData);
  }, [bgpConfData]);

  const addAddressLocal = () => {
    let tempBgp = bgpData;
    var afiData = {
      afi: "",
      config: { afi: "", safi: "" },

      safi: "",
    };
    tempBgp["address-families"] &&
      tempBgp["address-families"]["address-family"].push(afiData);
    setBgpData({ ...tempBgp });
  };
  const addAddressVrf = () => {
    const addressVrf = {
      "address-family-vrf": [
        {
          afi: "",
          safi: "",
          "vrf-name": "",
          config: { afi: "", safi: "", "vrf-name": "" },
          "route-redistribute-lists": {
            "route-redistribute-list": [
              {
                config: {
                  "protocol-type": "connected",
                },
                "protocol-type": "connected",
              },
            ],
          },
        },
      ],
    };
    let tempBgp = bgpData;
    var vrfData = {
      afi: "",
      config: {
        afi: "",
        safi: "",
        "vrf-name": "",
      },
      "route-redistribute-lists": {
        "route-redistribute-list": [
          {
            config: { "protocol-type": "" },
            "protocol-type": "",
          },
        ],
        safi: "",

        "vrf-name": "",
      },
    };
    tempBgp["address-family-vrfs"]
      ? tempBgp["address-family-vrfs"]["address-family-vrf"].push(vrfData)
      : (tempBgp["address-family-vrfs"] = { ...addressVrf });
    setBgpData({ ...tempBgp });
  };
  const addAddressPeer = () => {
    setDisableButton(true);
    let tempData = bgpData;
    var peerData = {
      "address-families": {
        "address-family": [
          {
            afi: "",
            config: { activate: [], afi: "", safi: "" },
            "peer-index": {},
            safi: "",
          },
        ],
      },
      config: {
        "peer-address": "",
        "peer-as": "",
        "source-identifier": bgpData["config"]["router-id"],
      },
      "peer-address": "",
    };
    tempData["peers"] && tempData["peers"].peer.push(peerData);
    setBgpData({ ...tempData });
  };
  const renderDropdown = (item, index, type, family) => {
    return (
      <select
        className="addressFamilyDropdown"
        value={item.config[type]}
        onChange={(e) =>
          family === "local"
            ? handleLocalAddressFamily(e, type, index)
            : handleAddressFamilyVrfChange(e, type, index)
        }
      >
        <option value="" disabled>
          Select {type.toUpperCase()}
        </option>
        {(type === "afi" ? afiTypes : safiTypes).map((item) => (
          <option value={item} key={item}>
            {item}
          </option>
        ))}
      </select>
    );
  };

  const handleLocalAddressFamily = (e, id, index) => {
    const temp = { ...bgpData };

    if (!temp["address-families"]["address-family"]) {
      temp["address-families"]["address-family"] = [];
    }

    temp["address-families"]["address-family"][index][id] = e.target.value;

    if (!temp["address-families"]["address-family"][index]["config"]) {
      temp["address-families"]["address-family"][index]["config"] = {};
    }

    temp["address-families"]["address-family"][index]["config"][id] =
      e.target.value;
    setBgpData({ ...temp });
  };
  const handleAddressFamilyVrfChange = (e, id, index) => {
    const temp = { ...bgpData };
    if (!temp["address-family-vrfs"]["address-family-vrf"]) {
      temp["address-family-vrfs"]["address-family-vrf"] = [];
    }

    if (!temp["address-family-vrfs"]["address-family-vrf"][index]) {
      temp["address-family-vrfs"]["address-family-vrf"][index] = {};
    }

    temp["address-family-vrfs"]["address-family-vrf"][index][id] =
      e.target.value;

    if (!temp["address-family-vrfs"]["address-family-vrf"][index]["config"]) {
      temp["address-family-vrfs"]["address-family-vrf"][index]["config"] = {};
    }

    temp["address-family-vrfs"]["address-family-vrf"][index]["config"][id] =
      e.target.value;
    setBgpData({ ...temp });
  };
  const handleChange = (e, name) => {
    setFieldIndex(name);
    if (name === "bgp-as") {
      setBgpData((prev) => ({ ...prev, "bgp-as": e.target.value }));
    }
    setBgpData((prev) => ({
      ...prev,
      config: { ...prev.config, [name]: e.target.value },
    }));
  };
  const removelocalAddressInfo = (addressFamilyList, index) => {
    if (addressFamilyList && addressFamilyList[index]) {
      const updatedBgpDetails = { ...bgpData };
      // Assuming "address-families" is an array and "address-family" is to be removed
      const updatedAddressFamilies = [
        ...(updatedBgpDetails["address-families"]["address-family"] || []),
      ];
      updatedAddressFamilies.splice(index, 1);

      // Update the state with the modified "address-families"
      updatedBgpDetails["address-families"]["address-family"] =
        updatedAddressFamilies;

      setBgpData({ ...updatedBgpDetails });
    }
  };

  const removeVrfAddressInfo = (vrfList, index) => {
    if (vrfList && vrfList[index]) {
      const updatedBgpDetails = { ...bgpData };

      const updatedVrfList = [
        ...(updatedBgpDetails["address-family-vrfs"]["address-family-vrf"] ||
          []),
      ];
      updatedVrfList.splice(index, 1);

      updatedBgpDetails["address-family-vrfs"]["address-family-vrf"] =
        updatedVrfList;

      setBgpData({ ...updatedBgpDetails });
    }
  };
  const handlePeerChange = (e, id, index) => {
    const temp = { ...bgpData };

    if (!temp.peers.peer) {
      temp.peers.peer = [];
    }

    if (!temp.peers.peer[index]) {
      temp.peers.peer[index] = {};
    }

    if (id === "peer-address") {
      temp.peers.peer[index][id] = e.target.value;
      setFieldIndex(index);
      validIP(e.target.value, id);
      if (!temp.peers.peer[index]["config"]) {
        temp.peers.peer[index]["config"] = {};
      }

      temp.peers.peer[index]["config"][id] = e.target.value;
    } else if (id === "peer-as") {
      if (!temp.peers.peer[index]["config"]) {
        temp.peers.peer[index]["config"] = {};
      }

      temp.peers.peer[index]["config"][id] = e.target.value;
    }

    setBgpData({ ...temp });
    temp.peers.peer[index]["config"]["peer-address"] &&
    temp.peers.peer[index]["config"]["peer-as"]
      ? setDisableButton(false)
      : setDisableButton(true);
  };
  const removePeerInfo = (index) => {
    const updatedBgpDetails = { ...bgpData };
    if (
      updatedBgpDetails.peers &&
      updatedBgpDetails.peers.peer &&
      updatedBgpDetails.peers.peer[index]
    ) {
      updatedBgpDetails.peers.peer[index]["@nc:operation"] = "delete";
    }
    const updatedPeerList =
      updatedBgpDetails.peers && updatedBgpDetails.peers.peer
        ? [...updatedBgpDetails.peers.peer]
        : [];
    updatedPeerList.splice(index, 1);
    updatedBgpDetails.peers.peer = updatedPeerList;
    bgpConfiguration(updatedBgpDetails);
    setBgpData({ ...updatedBgpDetails });
    setDisableButton(false);
  };
  const handleRemoteAddressFamily = (e, index) => {
    const combinedValue = e.target.value;
    const [afi, safi] = combinedValue.split(",");
    const updatedBgpDetails = { ...bgpData };

    if (!updatedBgpDetails.peers.peer) {
      updatedBgpDetails.peers.peer = [];
    }

    if (!updatedBgpDetails.peers.peer[index]) {
      updatedBgpDetails.peers.peer[index] = {
        "address-family": [
          {
            config: {},
          },
        ],
      };
    } else if (
      updatedBgpDetails.peers.peer[index]["address-families"] &&
      !updatedBgpDetails.peers.peer[index]["address-families"]["address-family"]
    ) {
      updatedBgpDetails.peers.peer[index]["address-families"][
        "address-family"
      ] = [
        {
          config: {},
        },
      ];
    } else if (
      !updatedBgpDetails.peers.peer[index]["address-families"][
        "address-family"
      ][0]["config"]
    ) {
      updatedBgpDetails.peers.peer[index]["address-families"][
        "address-family"
      ][0]["config"] = {};
    }

    updatedBgpDetails.peers.peer[index]["address-families"][
      "address-family"
    ][0]["afi"] = afi;
    updatedBgpDetails.peers.peer[index]["address-families"][
      "address-family"
    ][0]["config"]["afi"] = afi;
    updatedBgpDetails.peers.peer[index]["address-families"][
      "address-family"
    ][0]["safi"] = safi;
    updatedBgpDetails.peers.peer[index]["address-families"][
      "address-family"
    ][0]["config"]["safi"] = safi;

    setBgpData({ ...updatedBgpDetails });
  };

  const toggleActivate = (data, index) => {
    const temp = { ...bgpData };
    const parsedData = JSON.stringify(data.activate);
    if (parsedData === "[]" || parsedData === `{"@nc:operation":"delete"}`) {
      temp.peers.peer[index]["address-families"]["address-family"][0][
        "config"
      ].activate = [null];
    } else {
      temp.peers.peer[index]["address-families"]["address-family"][0][
        "config"
      ].activate = { "@nc:operation": "delete" };
    }
    setBgpData({ ...temp });
  };

  const bgpConfiguration = (remove) => {
    let tempArr = [];
    if (errorMessage) {
      Object.keys(errorMessage).map((item) => {
        if (errorMessage[item] != "") {
          tempArr.push(errorMessage[item]);
        }
      });
      let str = tempArr.join(",");
      if (str.length) {
        alert(str);
        return false;
      }
    }
    var temp = bgpData;
    console.log(bgpData);
    const a = removeKeysRecursively(temp);
    var dict = {
      "ipi-bgp:bgp": {
        ...(remove && { "@nc:operation": "delete" }),
        "@xmlns:ipi-bgp": "http://www.ipinfusion.com/yang/ocnos/ipi-bgp",
        "bgp-instances": {
          "bgp-instance": [],
        },
      },
    };
    dict["ipi-bgp:bgp"]["bgp-instances"]["bgp-instance"].push(a);
    saveBgp && saveBgp(dict);
    notify(
      remove
        ? "Module will be deleted once the configuration is done"
        : "LDP configuration saved",
      remove ? "info" : "success"
    );
    remove && setDeleteBox(false);
  };
  const keysToRemove = ["rib", "state", "vrf-peers", "peer-index"];

  const removeKeysRecursively = (obj) => {
    if (Array.isArray(obj)) {
      return obj.map((item) => removeKeysRecursively(item));
    }

    if (typeof obj === "object" && obj !== null) {
      const newObj = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          if (keysToRemove.includes(key)) {
            delete newObj[key];
          } else {
            newObj[key] = removeKeysRecursively(obj[key]);
          }
        }
      }
      return newObj;
    }

    return obj;
  };
  const getAfiSafiList = () => {
    if (
      bgpData &&
      bgpData["address-families"] &&
      bgpData["address-families"]["address-family"]
    ) {
      let tempArr = [];
      bgpData["address-families"]["address-family"].map((item) => {
        let obj = {
          afi: item.afi,
          safi: item.safi,
        };
        const isDuplicate = tempArr.some(
          (dupItem) => JSON.stringify(dupItem) === JSON.stringify(obj)
        );
        if (!isDuplicate) {
          tempArr.push(obj);
        }
      });
      setAfiSafiList(tempArr);
    }
  };
  useEffect(() => {
    getAfiSafiList();
  }, [bgpData]);
  const validIP = (ip, name) => {
    let regexExp =
      /^(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    setValidateIp(regexExp.test(ip));
    !regexExp.test(ip)
      ? setErrorMessage((prev) => ({ ...prev, [name]: `invalid ${name}` }))
      : setErrorMessage((prev) => ({ ...prev, [name]: "" }));
    return regexExp.test(ip);
  };
  const deleteNo = () => {
    setDeleteBox(false);
  };

  const deleteBgpConfig = () => {
    setDeleteBox(true);
  };

  return (
    <div style={{ maxHeight: "410px", overflowY: "scroll" }}>
      <div style={{ margin: "2%" }}>
        <div className="BgpConfigRightTopHeader">Local BGP Options:</div>
        <div style={{ display: "flex", margin: "3px" }}>
          <div className="bgpConfigParameterLabel">Local AS:</div>
          <input
            className="isis-config-module-input"
            value={bgpData["config"] && bgpData["config"]["bgp-as"]}
            onChange={(e) => handleChange(e, "bgp-as")}
            type="number"
          />
        </div>
        <div style={{ display: "flex", margin: "3px" }}>
          <div className="bgpConfigParameterLabel">Router ID:</div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <input
              className="isis-config-module-input"
              value={bgpData["config"] && bgpData["config"]["router-id"]}
              onChange={(e) => handleChange(e, "router-id")}
            />
            {!validateIp && fieldIndex === "router-id" ? (
              <p style={{ margin: "0px", color: "red", fontSize: "smaller" }}>
                {errorMessage["router-id"]}
              </p>
            ) : null}
          </div>
        </div>
      </div>
      <div style={{ margin: "2%" }}>
        <div className="BgpConfigRightTopHeader">
          Address Family:{" "}
          <span>
            <button
              className="addAddressButton"
              onClick={() => addAddressLocal()}
            >
              +
            </button>
          </span>
        </div>
        <table className="user_table">
          <thead className="user_table_head">
            <tr style={{ backgroundColor: "#e5e8ff", color: "black" }}>
              <th>AFI</th>
              <th>SAFI</th>
              <th>Remove</th>
            </tr>
          </thead>
          <tbody>
            {" "}
            {bgpData &&
              bgpData["address-families"] &&
              bgpData["address-families"]["address-family"].map(
                (item, index) => {
                  return (
                    <tr className="trPerf" key={index}>
                      <td className="tdPerf">
                        {renderDropdown(item, index, "afi", "local")}
                      </td>
                      <td className="tdPerf">
                        {renderDropdown(item, index, "safi", "local")}
                      </td>
                      <td
                        onClick={() =>
                          removelocalAddressInfo(
                            bgpData["address-families"]["address-family"],
                            index
                          )
                        }
                      >
                        <img src={remove} alt="" width={10} />
                      </td>
                    </tr>
                  );
                }
              )}
          </tbody>
        </table>
      </div>
      <div style={{ margin: "2%" }}>
        <div className="BgpConfigRightTopHeader">
          {" "}
          Address Family VRF:{" "}
          <span>
            <button
              className="addAddressButton"
              onClick={() => addAddressVrf()}
            >
              +
            </button>
          </span>
        </div>
        <table className="user_table">
          <thead className="user_table_head">
            <tr style={{ backgroundColor: "#e5e8ff", color: "black" }}>
              <th>AFI</th>
              <th>SAFI</th>
              <th>VRF Name</th>
              <th>Remove</th>
            </tr>
          </thead>
          <tbody>
            {bgpData &&
            bgpData["address-family-vrfs"] &&
            bgpData["address-family-vrfs"]["address-family-vrf"]
              ? bgpData["address-family-vrfs"]["address-family-vrf"].map(
                  (item, index) => (
                    <tr className="trPerf" key={index}>
                      <td className="tdPerf">
                        {renderDropdown(item, index, "afi", "vrf")}
                      </td>
                      <td className="tdPerf">
                        {renderDropdown(item, index, "safi", "vrf")}
                      </td>
                      <td className="tdPerf">
                        <input
                          className="tableInput"
                          type="text"
                          value={item.config["vrf-name"]}
                          onChange={(e) =>
                            handleAddressFamilyVrfChange(e, "vrf-name", index)
                          }
                        />
                      </td>
                      <td
                        onClick={() =>
                          removeVrfAddressInfo(
                            bgpData["address-family-vrfs"][
                              "address-family-vrf"
                            ],
                            index
                          )
                        }
                      >
                        <img src={remove} alt="" width={10} />
                      </td>
                    </tr>
                  )
                )
              : null}
          </tbody>
        </table>
      </div>
      <div style={{ margin: "2%" }}>
        <div className="BgpConfigRightTopHeader">
          Peer Information:{" "}
          <span>
            <button
              className="addAddressButton"
              onClick={() => addAddressPeer()}
            >
              +
            </button>
          </span>
        </div>

        <table className="user_table">
          <thead className="user_table_head">
            <tr style={{ backgroundColor: "#e5e8ff", color: "black" }}>
              {ipTableHeaders.map((item) => {
                return <th>{item}</th>;
              })}
            </tr>
          </thead>
          <tbody>
            {bgpData &&
              bgpData["peers"] &&
              bgpData["peers"].peer.map((item, index) => {
                return (
                  <tr className="trPerf" key={index}>
                    <td className="tdPerf">
                      <input
                        className="tableInput"
                        type="text"
                        value={item["config"]["peer-address"]}
                        onChange={(e) =>
                          handlePeerChange(e, "peer-address", index)
                        }
                      />
                      {!validateIp && fieldIndex === index ? (
                        <p
                          style={{
                            margin: "0px",
                            color: "red",
                            fontSize: "smaller",
                          }}
                        >
                          {errorMessage["peer-address"]}
                        </p>
                      ) : null}
                    </td>
                    <td className="tdPerf">
                      <input
                        className="tableInput"
                        value={item["config"]["peer-as"]}
                        onChange={(e) => handlePeerChange(e, "peer-as", index)}
                        type="number"
                      />
                    </td>
                    <td className="tdPerf">
                      {item["address-families"] ? (
                        <select
                          className="addressFamilyDropdown"
                          value={`${item["address-families"]["address-family"][0]["afi"]},${item["address-families"]["address-family"][0]["safi"]}`}
                          onChange={(e) => handleRemoteAddressFamily(e, index)}
                        >
                          <option value="" hidden>
                            {" "}
                            Select AFI/SAFI
                          </option>
                          {afiSafiList &&
                            afiSafiList.map((item, index) => (
                              <option
                                value={`${item.afi},${item.safi}`}
                                key={index}
                              >
                                {`${item.afi},${item.safi}`}
                              </option>
                            ))}
                        </select>
                      ) : (
                        <select
                          className="addressFamilyDropdown"
                          onChange={(e) => handleRemoteAddressFamily(e, index)}
                        >
                          {" "}
                          <option value="" hidden>
                            {" "}
                            Select AFI/SAFI
                          </option>
                          {afiSafiList &&
                            afiSafiList.map((item, index) => (
                              <option
                                value={`${item.afi},${item.safi}`}
                                key={index}
                              >
                                {`${item.afi},${item.safi}`}
                              </option>
                            ))}
                        </select>
                      )}
                    </td>
                    <td className="tdPerf">
                      <div
                        style={{
                          marginTop: "2%",
                          display: "flex",
                          alignItems: "center",
                        }}
                        onClick={() =>
                          toggleActivate(
                            item["address-families"]["address-family"][0][
                              "config"
                            ],
                            index
                          )
                        }
                      >
                        {item["address-families"] ? (
                          <img
                            src={
                              JSON.stringify(
                                item["address-families"]["address-family"][0][
                                  "config"
                                ]["activate"]
                              ) === "[null]"
                                ? active
                                : inactive
                            }
                            alt=""
                            width={20}
                          />
                        ) : (
                          <img src={inactive} alt="" width={20} />
                        )}
                      </div>
                    </td>
                    <td onClick={() => removePeerInfo(index)}>
                      <img src={remove} alt="" width={10} />
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
      <div
        style={{
          display: "flex",
          gap: "8px",
          justifyContent: "end",
          paddingRight: "1.5rem",
        }}
      >
        <button
          className="btn btn-primary mb-3 bootstarapModificationButton"
          onClick={() => bgpConfiguration(false)}
          disabled={disableButton}
        >
          save
        </button>
        <button
          className="btn btn-danger mb-3 bootstarapModificationButton"
          onClick={() => deleteBgpConfig()}
        >
          Delete
        </button>
      </div>

      {loading && <Loading></Loading>}
      {deleteBox && (
        <ConfirmationBox
          title={"Are you sure"}
          message={"Do you want to delete the total BGP configuration module.?"}
          yesClick={() => bgpConfiguration(true)}
          noClick={deleteNo}
        ></ConfirmationBox>
      )}
    </div>
  );
};
export default ConfigureBgp;
