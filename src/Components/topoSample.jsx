import React, { useEffect, useState } from "react";
import "../css/topology.css";
import refresh from "../Images/refresh.png";
import close from "../Images/closeS.png";
import { DropdownButton, Tab, Tabs } from "react-bootstrap";
import Dropdown from "react-bootstrap/Dropdown";
import NetworkGraph from "./sampleD3";
import InterfaceConfiguration from "./interfaceConfiguration";
import IsisConfiguration from "./isisConfiguration";
import LdpConfiguration from "./ldpConfiguration";
import Swal from "sweetalert2";
import ConfigureBgp from "./configureBgp";
import BGPConfiguration from "./bgpConfiguration";
import EnableLabelSwitching from "./enableLabelSwitching";
import TopologyVpnCreation from "./l3VpnConfiguration";
import notify from "../utils";
import Loading from "./loader";

const Topology = () => {
  const [vpnDataSet, setVpnDataSet] = useState(null);
  const [selectedTopology, setSelectedTopology] = useState(null);
  const [openConfiguration, setOpenConfiguration] = useState(false);
  const [selectedRouter, setSelectedRouter] = useState();
  const [routerData, setRouterData] = useState({});
  const [bgpConfigurationData, setBgpConfigurationData] = useState(null);
  const [loadingFlag, setLoadingFlag] = useState({
    interfaceLoading: false,
    bgpLoading: false,
  });
  const [topologyData, setTopologyData] = useState({});
  const [labelSwitchingData, setLabelSwitchingData] = useState({});
  const [enabledLabelSwitchData, setEnabledLabelSwitchData] = useState({});
  const [labelSwitchResponse, setLabelSwitchResponse] = useState([]);
  const [vrfData, setVrfData] = useState({});
  const [isisData, setIsisData] = useState({});
  const [bgpPostTopology, setBgpPostTopology] = useState({});
  const [uniqueId, setUniqueId] = useState(null);
  const [navigationFlag, setNavigationFlag] = useState({
    next: false,
    previous: true,
  });
  const topologyType = ["MP-BGP", "ISIS", "LDP", "MPLS", "L3VPN"];
  const colorIndicator = ["MP-BGP", "ISIS", "LDP", "MPLS", "ILM"];
  const refreshTopologyHandler = () => {
    console.log("called");
    setLoadingFlag((prev) => ({ ...prev, interfaceLoading: true }));
    fetch(
      `http://${process.env.REACT_APP_CLIENT_IP}:5000/configuration-management/refresh-topology`,
      {
        mode: "cors",
        method: "GET",
        headers: {
          "Access-Control-Allow-Origin": "http://localhost:3000",
          "Content-Type": "application/json",
          username: sessionStorage.getItem("username"),
        },
      }
    )
      .then((resp) => resp.json())
      .then((resp) => {
        console.log(resp, "response");
        setLoadingFlag((prev) => ({ ...prev, interfaceLoading: false }));
        notify(resp.status,'success')
      })
      .catch((err) => {
        if (err.response) {
          notify('Failed to fetch data','error')
          alert(err.response.data.status);
          console.log("Error Response Data:", err.response.data);
          console.log("Error Response Status:", err.response.status);
          console.log("Error Response Headers:", err.response.headers);
        }
        setLoadingFlag((prev) => ({ ...prev, interfaceLoading: false }));
      });
  };
  const handleSelectTopology = (topologyType) => {
    setTopologyData({});
    setSelectedTopology(topologyType);
  };

  useEffect(() => {
    selectedTopology && getSelectedtopologyData(selectedTopology.toLowerCase());
  }, [selectedTopology]);

  const getSelectedtopologyData = (type) => {
    setLoadingFlag((prev) => ({ ...prev, interfaceLoading: true }));
    try {
      fetch(
        `http://${
          process.env.REACT_APP_CLIENT_IP
        }:5000/configuration-management/get-${
          type !== "mp-bgp" ? type : "bgp"
        }-topology`,
        {
          mode: "cors",
          method: "GET",
          headers: {
            "Access-Control-Allow-Origin": "http://localhost:3000",
          },
        }
      )
        .then((resp) => resp.json())
        .then((topologyResponse) => {
          ConfigureVpnData(
            type === "l3vpn"
              ? topologyResponse
              : { [type]: { ...topologyResponse } }
          );
          setLoadingFlag((prev) => ({ ...prev, interfaceLoading: false }));
        });
    } catch (err) {
      notify("Failed to fetch data", "error");
      setLoadingFlag((prev) => ({ ...prev, interfaceLoading: false }));
    }
  };
  const routerClickHandler = (event, data) => {
    if (!selectedTopology) {
      notify("Select topology to configure", "warning");
      return false;
    }
    if (
      !data.id ||
      (data.id && Object.keys(data["typeData"]["ilmType"]).length > 0)
    ) {
      notify("No data available for ILM/NUll routers", "info");
      return false;
    }
    setLoadingFlag((prev) => ({ ...prev, interfaceLoading: true }));
    try {
      fetch(
        `http://${process.env.REACT_APP_CLIENT_IP}:5000/configuration-management/interface-ip/${data.id}`,
        {
          mode: "cors",
          method: "GET",
          headers: {
            "Access-Control-Allow-Origin": "http://localhost:3000",
          },
        }
      )
        .then((resp) => resp.json())
        .then((resp) => {
          if (selectedTopology === "L3VPN") {
            getVrfData(data.id);
            getIsisData(data.id);
          }
          getLabelSwitchingData(data.id);
          setOpenConfiguration(true);
          if (resp && resp.status === "API failed") {
            Swal.fire({
              title: resp.status,
              text: resp.message,
              width: 300,
              height: 40,
              color: "red",
              icon: "failure",
            });
            setRouterData({});
            setLoadingFlag((prev) => ({ ...prev, interfaceLoading: false }));
          } else if (resp && resp.status !== "API failed") {
            setRouterData(resp);
            setSelectedRouter(data.id);
            getBgpDetails(data.id);
            setLoadingFlag((prev) => ({ ...prev, interfaceLoading: false }));
          } else {
            Swal.fire({
              title: "API failed",
              text: "Unable to fetch data for selected router",
              width: 300,
              height: 40,
              color: "red",
              icon: "failure",
            });
            setLoadingFlag((prev) => ({ ...prev, interfaceLoading: false }));
          }
        });
    } catch (err) {
      notify("Failed to fetch teh data", "warning");
      setLoadingFlag((prev) => ({ ...prev, interfaceLoading: false }));
    }
  };

  const getIsisData = (router) => {
    fetch(
      `http://${process.env.REACT_APP_CLIENT_IP}:5000/configuration-management/configuration/isis/${router}`,
      {
        mode: "cors",
        method: "GET",
        headers: {
          "Access-Control-Allow-Origin": "http://localhost:3000",
        },
      }
    )
      .then((resp) => resp.json())
      .then((resp) => {
        const isisResponse = resp["ipi-isis:isis"] ? resp["ipi-isis:isis"] : [];
        setIsisData({ ...isisResponse });
      });
  };

  const getBgpDetails = (selectedRouter) => {
    setLoadingFlag((prev) => ({ ...prev, bgpLoading: true }));

    fetch(
      `http://${process.env.REACT_APP_CLIENT_IP}:5000/configuration-management/configuration/bgp/${selectedRouter}`,
      {
        mode: "cors",
        method: "GET",
        headers: {
          "Access-Control-Allow-Origin": "http://localhost:3000",
        },
      }
    )
      .then((resp) => resp.json())
      .then((resp) => {
        if (
          resp["ipi-bgp:bgp"] &&
          resp["ipi-bgp:bgp"]["bgp-instances"]["bgp-instance"][0]
        ) {
          setBgpConfigurationData(
            resp["ipi-bgp:bgp"]["bgp-instances"]["bgp-instance"][0]
          );
          setLoadingFlag((prev) => ({ ...prev, bgpLoading: false }));
        } else {
          setLoadingFlag((prev) => ({ ...prev, bgpLoading: false }));
        }
      });
  };
  const getLabelSwitchingData = (router) => {
    fetch(
      `http://${process.env.REACT_APP_CLIENT_IP}:5000/configuration-management/configuration/mpls/${router}`,
      {
        mode: "cors",
        method: "GET",
        headers: {
          "Access-Control-Allow-Origin": "http://localhost:3000",
        },
      }
    )
      .then((resp) => resp.json())
      .then((resp) => {
        const labelSwitchingData = resp["ipi-mpls:mpls"]
          ? resp["ipi-mpls:mpls"]["interfaces"]["interface"]
          : [];
        setLabelSwitchResponse(labelSwitchingData);
      });
  };
  const getVrfData = (router) => {
    fetch(
      `http://${process.env.REACT_APP_CLIENT_IP}:5000/configuration-management/configuration/net-inst/${router}`,
      {
        mode: "cors",
        method: "GET",
        headers: {
          "Access-Control-Allow-Origin": "http://localhost:3000",
        },
      }
    )
      .then((resp) => resp.json())
      .then((resp) => {
        const vrfResponse = resp["ipi-network-instance:network-instances"]
          ? resp["ipi-network-instance:network-instances"]["network-instance"]
          : [];
        setVrfData(vrfResponse);
      });
  };
  const closeConfiguration = () => {
    setOpenConfiguration(false);
  };
  const handleSaveBGPConfig = (bgpData) => {
    let tempArr = [];
    var temp = bgpData["ipi-bgp:bgp"]["bgp-instances"]["bgp-instance"][0];
    const a = removeKeysRecursively(temp);
    var dict = {
      "ipi-bgp:bgp": {
        "@xmlns:ipi-bgp": "http://www.ipinfusion.com/yang/ocnos/ipi-bgp",
        "bgp-instances": {
          "bgp-instance": [],
        },
      },
    };
    dict["ipi-bgp:bgp"]["bgp-instances"]["bgp-instance"].push(a);
    console.log(dict);
    setBgpPostTopology({ bgp: dict });
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

  const nextClicked = (data, flag) => {
    setNavigationFlag({ next: flag, previous: !flag });
  };

  const prevClicked = (data, flag) => {
    setNavigationFlag({ next: !flag, previous: flag });
  };

  const saveLabelSwitching = (data, router, changedLabelSwitchData) => {
    setEnabledLabelSwitchData({ ...changedLabelSwitchData });
    setLabelSwitchingData(data["ipi-interface:interfaces"]["interface"]);
    let arr1 = data;
    let arr2 = routerData;
    arr1["ipi-interface:interfaces"]["interface"].forEach((item1) => {
      const isNotPresent = !arr2["ipi-interface:interfaces"]["interface"].some(
        (item2) => item2["name"] === item1["name"]
      );
      if (isNotPresent) {
        arr2["ipi-interface:interfaces"]["interface"].push(item1);
      }
    });

    setRouterData(arr2);
  };

  const saveLdp = (data) => {
    console.log(data);
  };

  const ConfigureVpnData = (vpnData) => {
    Object.keys(vpnData).map((key) => {
      if (key !== "devices" && key !== "ilm") {
        vpnData &&
          vpnData[key] &&
          Object.keys(vpnData[key]).map((router) => {
            if (key === "mpls" || key === "ldp") {
              vpnData[key][router] = [vpnData[key][router]];
            }
            vpnData[key][router].map((item) => {
              item.peers.map((peer) => {
                const typeInfo = {
                  name: key,
                  ...(selectedTopology === "L3VPN" && {
                    routerType: vpnData["devices"]["p"].includes(router)
                      ? "p"
                      : "pe",
                  }),
                };
                Object.keys(item).forEach((keyName) => {
                  if (keyName !== "peers") {
                    typeInfo[keyName] = item[keyName];
                  }
                });
                peer["type"] = typeInfo;
                peer["ilmType"] = "";
              });
            });
          });
      }
      if (key === "ilm") {
        Object.keys(vpnData[key]).map((router) => {
          vpnData[key][router][0]["ilmType"] = { type: key };
          vpnData[key][router][0]["type"] = "";
        });
      }
    });

    if (selectedTopology === "L3VPN") {
      setupTopologyVpn(vpnData);
    } else {
      selectedTopology &&
        setTopologyData(vpnData[selectedTopology.toLowerCase()]);
    }
  };

  const setupTopologyVpn = (data) => {
    var temp = {};
    Object.keys(data).map((type) => {
      if (type !== "devices" && type !== "ilm") {
        Object.keys(data[type]).map((routerId) => {
          if (temp.hasOwnProperty(routerId)) {
            temp[routerId][0]["peers"] = [
              ...temp[routerId][0]["peers"],
              ...data[type][routerId][0]["peers"],
            ];
          } else {
            temp[routerId] = data[type][routerId];
          }
        });
      }
      if (type === "ilm") {
        Object.keys(data[type]).map((routerId) => {
          if (temp.hasOwnProperty(routerId)) {
            temp[routerId][0]["peers"] = [
              ...temp[routerId][0]["peers"],
              ...data[type][routerId],
            ];
          } else {
            temp[routerId] = [];
            temp[routerId][0] = {};
            temp[routerId][0]["peers"] = [];
            temp[routerId][0]["peers"] = data[type][routerId];
          }
        });
        console.log();
      }
    });
    setTopologyData(temp);
  };

  const saveInterafceConfigBgp = (data, id) => {
    setUniqueId(id);
  };

  const saveBgpConfigData = (data) => {
    console.log(data, "bgp");
    setBgpPostTopology({ bgp: data });
  };

  const configureBgpTopology = () => {
    fetch(
      `http://${process.env.REACT_APP_CLIENT_IP}:5000/configuration-management/configuration/bgp/${uniqueId}`,
      {
        mode: "cors",
        method: "POST",
        headers: {
          "Access-Control-Allow-Origin": "http://localhost:3000",
          "Content-Type": "application/json",
          username: sessionStorage.getItem("username"),
        },
        body: JSON.stringify(bgpPostTopology["bgp"]),
      }
    )
      .then((resp) => resp.json())
      .then((resp) => {
        console.log(resp, "post-rib-response");
        if (resp.status["rpc-reply"]) {
          alert("success");
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
  };

  const finalDataToPost = (data) => {
    console.log(data);
  };

  return (
    <div
      style={{
        backgroundColor: "white",
        borderRadius: "20px",
        paddingTop: "3%",
      }}
    >
      <button
        onClick={(e) => {
          e.preventDefault();
          refreshTopologyHandler();
        }}
        className="refreshTopology"
        id="refreshTopology"
        style={{
          borderRadius: "3px",
          fontSize: "smaller",
          position: "fixed",
          top: "30%",
        }}
      >
        Refresh Topology
        <span style={{ marginLeft: "4px" }}>
          <img src={refresh} alt="" width={15} />
        </span>
      </button>

      <div style={{ position: "absolute", top: "30%" }}>
        <DropdownButton
          id="network-dropdown"
          title={selectedTopology || "Choose Topology Type"}
          drop="down"
          style={{ zIndex: 1000 }}
          className="custom-dropdown"
        >
          {topologyType.map((bgpType, optionIndex) => (
            <Dropdown.Item
              key={optionIndex}
              eventKey={bgpType}
              onClick={() => handleSelectTopology(bgpType)}
            >
              {bgpType}
            </Dropdown.Item>
          ))}
        </DropdownButton>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          position: "absolute",
          top: "38%",
          right: "3%",
          justifyContent: "spaceArround",
        }}
      >
        {colorIndicator.map((topology) => {
          return (
            <div style={{ display: "flex", fontSize: "smaller" }}>
              <div
                style={{
                  border: "0.5px solid",
                  height: "10px",
                  width: "12px",
                  marginTop: "10%",
                  color:
                    topology === "MP-BGP"
                      ? "red"
                      : topology === "ISIS"
                      ? "#169114"
                      : topology === "LDP"
                      ? "blue"
                      : topology === "ILM"
                      ? "#02211f"
                      : "#fcba03",
                  background:
                    topology === "MP-BGP"
                      ? "red"
                      : topology === "ISIS"
                      ? "#169114"
                      : topology === "LDP"
                      ? "blue"
                      : topology === "ILM"
                      ? "#02211f"
                      : "#fcba03",
                }}
              ></div>
              <div style={{ marginLeft: "4%" }}>
                {topology === "MP-BGP" ? "BGP" : topology}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ position: "absolute", top: "30%" }}>
        {selectedTopology && topologyData ? (
          <NetworkGraph
            data={topologyData}
            // data={graphData}
            routerClick={routerClickHandler}
          ></NetworkGraph>
        ) : null}
      </div>

      {openConfiguration && (
        <div className="topologyConfigTab">
          <div style={{ position: "absolute", width: "97%" }}>
            <img
              style={{ position: "absolute", right: "0" }}
              onClick={() => closeConfiguration()}
              src={close}
              alt=""
              width={10}
            />
            {selectedTopology === "L3VPN" ? (
              <TopologyVpnCreation
                routerData={routerData}
                selectedRouter={selectedRouter}
                labelSwitchResponse={labelSwitchResponse}
                bgpConfigurationData={bgpConfigurationData}
                labelSwitchData={labelSwitchingData}
                interfaceData={
                  routerData && routerData["ipi-interface:interfaces"]
                    ? routerData["ipi-interface:interfaces"]["interface"]
                    : []
                }
                isisData={isisData}
                vrfDataResponse={vrfData}
                postData={finalDataToPost}
              ></TopologyVpnCreation>
            ) : (
              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "right",
                    paddingRight: "1rem",
                  }}
                >
                  <button
                    className="btn btn-primary mb-3 bootstarapModificationButton"
                    onClick={configureBgpTopology}
                    style={{ position: "absolute", right: "5%" }}
                  >
                    configure
                  </button>
                </div>
                <Tabs
                  defaultActiveKey="interfaceConfiguration"
                  id="routing-tabs"
                >
                  <Tab
                    eventKey="interfaceConfiguration"
                    title={
                      selectedTopology === "LDP" || selectedTopology === "MPLS"
                        ? "Enable Label Switching"
                        : "Interface Configuration"
                    }
                  >
                    {selectedTopology === "LDP" ||
                    selectedTopology === "MPLS" ? (
                      <EnableLabelSwitching
                        data={routerData}
                        routerId={selectedRouter}
                        loading={loadingFlag.interfaceLoading}
                        saveLabelSwitching={saveLabelSwitching}
                        labelSwitchResponse={labelSwitchResponse}
                      ></EnableLabelSwitching>
                    ) : (
                      <InterfaceConfiguration
                        data={routerData}
                        routerId={selectedRouter}
                        loading={loadingFlag.interfaceLoading}
                        saveConfiguration={saveInterafceConfigBgp}
                      ></InterfaceConfiguration>
                    )}
                  </Tab>
                  <Tab
                    eventKey="topologyConfiguration"
                    title={
                      selectedTopology === "MP-BGP"
                        ? "BGP configuration"
                        : selectedTopology === "ISIS"
                        ? "ISIS Configuration"
                        : selectedTopology === "LDP"
                        ? "LDP Configuration"
                        : "MPLS Configuration"
                    }
                  >
                    {selectedTopology === "MP-BGP" ? (
                      bgpConfigurationData ? (
                        <ConfigureBgp
                          bgpConfData={bgpConfigurationData}
                          loading={loadingFlag.bgpLoading}
                          routertId={selectedRouter}
                          saveBgp={saveBgpConfigData}
                        ></ConfigureBgp>
                      ) : (
                        <BGPConfiguration
                          onSaveBGPConfig={(data) => handleSaveBGPConfig(data)}
                          bgpDetails={bgpConfigurationData}
                        />
                      )
                    ) : selectedTopology === "ISIS" ? (
                      <IsisConfiguration
                        interfaceData={
                          routerData && routerData["ipi-interface:interfaces"]
                            ? routerData["ipi-interface:interfaces"][
                                "interface"
                              ]
                            : []
                        }
                        routerid={selectedRouter}
                      ></IsisConfiguration>
                    ) : selectedTopology === "LDP" ? (
                      <LdpConfiguration
                        routerId={selectedRouter}
                        labelSwitchData={labelSwitchingData}
                        saveLdp={saveLdp}
                        enabledLabelSwitchData={enabledLabelSwitchData}
                      ></LdpConfiguration>
                    ) : (
                      <>
                        {navigationFlag.previous ? (
                          <IsisConfiguration
                            interfaceData={
                              routerData &&
                              routerData["ipi-interface:interfaces"]
                                ? routerData["ipi-interface:interfaces"][
                                    "interface"
                                  ]
                                : []
                            }
                            routerid={selectedRouter}
                            mplsConfiguration={true}
                            nextClicked={nextClicked}
                          ></IsisConfiguration>
                        ) : null}
                        {navigationFlag.next ? (
                          <LdpConfiguration
                            data={routerData}
                            routerId={selectedRouter}
                            mplsConfiguration={true}
                            prevClicked={prevClicked}
                            labelSwitchData={labelSwitchingData}
                            saveLdp={saveLdp}
                          ></LdpConfiguration>
                        ) : null}
                      </>
                    )}
                  </Tab>
                </Tabs>
              </div>
            )}
          </div>
        </div>
      )}
      {loadingFlag.interfaceLoading && <Loading></Loading>}
    </div>
  );
};
export default Topology;
