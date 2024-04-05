import React, { useEffect, useState } from "react";
import { DropdownButton, Dropdown, Tab, Tabs } from "react-bootstrap";
import EnableLabelSwitching from "./enableLabelSwitching";
import IsisConfiguration from "./isisConfiguration";
import LdpConfiguration from "./ldpConfiguration";
import BGPConfiguration from "./bgpConfiguration";
import ConfigureBgp from "./configureBgp";
import AttachToVrf from "./attachToVrf";
import add from "../Images/add_w.png";
import notify from "../utils";
import remove from "../Images/remove.png";
import "bootstrap/dist/css/bootstrap.min.css";
import ConfirmationBox from "./confirmationBox";

const L3VPNConfiguration = ({
  routerType,
  routerData,
  selectedRouter,
  labelSwitchResponse,
  bgpConfigurationData,
  labelSwitchData,
  interfaceData,
  vrfDataResponse,
  isisData,
  postData,
}) => {
  const [vrfData, setVrfData] = useState([
    {
      vrf_instance_name: "",
      vrf_instance_type: "",
      vrf_name: "",
      rd_string: "",
      direction: "",
      rt_rd_string: "",
      readOnly: "",
    },
  ]);
  const [removedVrfData, setRemovedVrfData] = useState([]);
  const [dropDownValues, setDropdownValues] = useState({
    selectedIGPtype: "",
    selectedlabelSwitching: "",
  });

  const [enabledLabelSwitchData, setEnabledLabelSwitchData] = useState({});
  const [vrfAtachInterfaceData, setVrfAtachInterfaceData] = useState([]);
  const [changedVrfData, setChangedVrfData] = useState([]);
  const [deleteBox, setDeleteBox] = useState(false);

  const [finalData, setFinalData] = useState({});

  useEffect(() => {
    if (vrfDataResponse.length) {
      let vrfArr = [...vrfData];
      var itemIndex = 0;
      vrfDataResponse.map((item) => {
        if (
          item["instance-name"] !== "management" &&
          item["instance-name"] !== "default"
        ) {
          vrfArr[itemIndex]["vrf_instance_name"] = item["instance-name"];
          vrfArr[itemIndex]["vrf_instance_type"] = item["instance-type"];
          vrfArr[itemIndex]["vrf_name"] = item["instance-name"];
          vrfArr[itemIndex]["rd_string"] =
            item["ipi-vrf:vrf"]["ipi-bgp-vrf:bgp-vrf"]["config"]["rd-string"];
          vrfArr[itemIndex]["direction"] =
            item["ipi-vrf:vrf"]["ipi-bgp-vrf:bgp-vrf"]["route-targets"][
              "route-target"
            ][itemIndex]["config"]["direction"];
          vrfArr[itemIndex]["rt_rd_string"] =
            item["ipi-vrf:vrf"]["ipi-bgp-vrf:bgp-vrf"]["route-targets"][
              "route-target"
            ][itemIndex]["config"]["rt-rd-string"];
          vrfArr[itemIndex]["readOnly"] = true;
          itemIndex = itemIndex + 1;
        }
      });
      setVrfData([...vrfArr]);
    } else {
      setVrfData([
        {
          vrf_instance_name: "",
          vrf_instance_type: "",
          vrf_name: "",
          rd_string: "",
          direction: "",
          rt_rd_string: "",
        },
      ]);
    }
  }, [vrfDataResponse, interfaceData]);

  const renderInputField = (label, fieldName, index) => (
    <div className="isis-instance-labels">
      <div className="isis-config-module">{label}</div>
      <input
        type="text"
        value={vrfData[index][fieldName]}
        onChange={(e) => handleInputChange(fieldName, e.target.value, index)}
        disabled={
          (fieldName === "vrf_instance_name" ||
            fieldName === "vrf_instance_type" ||
            fieldName === "vrf_name") &&
          vrfData[index]["readOnly"]
        }
      />
    </div>
  );

  const handleInputChange = (name, value, index) => {
    let datList = [...vrfData];
    datList[index][name] = value;
    setVrfData([...datList]);
  };

  const saveLabelSwitching = (
    data,
    router,
    changedLabelData,
    interfaceTotalData
  ) => {
    console.log(interfaceTotalData, "Interface label switching data");
    setEnabledLabelSwitchData({ ...changedLabelData });
    setVrfAtachInterfaceData(interfaceTotalData);
    setFinalData((prev) => ({
      ...prev,
      enableLabelSwitch: { ...data },
      mplsData: { ...changedLabelData },
    }));
  };

  const handleIGPswitchingType = (value) => {
    setDropdownValues((prev) => ({ ...prev, selectedIGPtype: value }));
  };

  const saveISISConfig = (data) => {
    console.log(data);
    setFinalData((prev) => ({ ...prev, isisData: { ...data } }));
  };

  const handlelabelSwitchingType = (value) => {
    setDropdownValues((prev) => ({ ...prev, selectedlabelSwitching: value }));
  };

  const saveLabelSwitchingConfig = (data) => {
    console.log(data, "LDP data");
    setFinalData((prev) => ({ ...prev, ldp: { ...data } }));
  };

  const saveVrfConfig = (remove) => {
    let instanceArr = [];
    vrfData.map((item) => {
      let obj = {
        ...(remove && { "@nc:operation": "delete" }),
                config: {
          "instance-name": item.vrf_instance_name,
          "instance-type": item.vrf_instance_type,
        },
        "instance-name": item.vrf_instance_name,
        "instance-type": item.vrf_instance_type,
        "ipi-vrf:vrf": {
          "@xmlns:ipi-vrf": "http://www.ipinfusion.com/yang/ocnos/ipi-vrf",
          config: {
            "vrf-name": item.vrf_name,
          },
          "ipi-bgp-vrf:bgp-vrf": {
            "@xmlns:ipi-bgp-vrf":
              "http://www.ipinfusion.com/yang/ocnos/ipi-bgp-vrf",
            config: {
              "rd-string": item.rd_string,
            },
            "route-targets": {
              "route-target": [
                {
                  config: {
                    direction: item.direction,
                    "rt-rd-string": item.rt_rd_string,
                  },
                  "rt-rd-string": item.rt_rd_string,
                },
              ],
            },
          },
        },
      };
      instanceArr.push(obj);
    });
    removedVrfData &&
      removedVrfData.map((item) => {
        let obj = {
          "@nc:operation": "delete",
          config: {
            "instance-name": item.vrf_instance_name,
            "instance-type": item.vrf_instance_type,
          },
          "instance-name": item.vrf_instance_name,
          "instance-type": item.vrf_instance_type,
          "ipi-vrf:vrf": {
            "@xmlns:ipi-vrf": "http://www.ipinfusion.com/yang/ocnos/ipi-vrf",
            config: {
              "vrf-name": item.vrf_name,
            },
            "ipi-bgp-vrf:bgp-vrf": {
              "@xmlns:ipi-bgp-vrf":
                "http://www.ipinfusion.com/yang/ocnos/ipi-bgp-vrf",
              config: {
                "rd-string": item.rd_string,
              },
              "route-targets": {
                "route-target": [
                  {
                    config: {
                      direction: item.direction,
                      "rt-rd-string": item.rt_rd_string,
                    },
                    "rt-rd-string": item.rt_rd_string,
                  },
                ],
              },
            },
          },
        };
        instanceArr.push(obj);
      });
    const vrfConfig = {
      "ipi-network-instance:network-instances": {
        "@xmlns:ipi-network-instance":
          "http://www.ipinfusion.com/yang/ocnos/ipi-network-instance",
        "network-instance": [...instanceArr],
      },
    };
    console.log(vrfConfig, "vrfData");
    setFinalData((prev) => ({ ...prev, vrfConfig: { ...vrfConfig } }));
    notify(
      remove
        ? "Module will be deleted once the configuration is done"
        : "LDP configuration saved",
      remove ? "info" : "success"
    );
    remove && setDeleteBox(false)  };

  const handleSaveBGPConfig = (data) => {
    setFinalData((prev) => ({ ...prev, bgpData: { ...data } }));

  };

  const addInstance = () => {
    let tempArr = [...vrfData];
    tempArr.push({
      vrf_instance_name: "",
      vrf_instance_type: "",
      vrf_name: "",
      rd_string: "",
      direction: "",
      rt_rd_string: "",
      readOnly: false,
    });
    setVrfData([...tempArr]);
    notify("New instance added", "success");
  };

  const removeClick = (index) => {
    let vrfArr = [...vrfData];
    let removedVrf = removedVrfData ? [...removedVrfData] : [];
    vrfDataResponse.map((item) => {
      if (item["instance-name"] === vrfData[index]["vrf_instance_name"]) {
        removedVrf.push(vrfData[index]);
      }
    });
    setRemovedVrfData([...removedVrf]);
    setVrfData([...vrfArr]);

    vrfArr.splice(index, 1);
    setVrfData([...vrfArr]);
  };

  const saveAttachToVrf = (data) => {
    setFinalData((prev) => ({ ...prev, attachToVrfData: { ...data } }));
  };
  const configureL3vpn = () => {
    console.log(finalData);
    postData(finalData, routerType, selectedRouter);
    let dict = {};
  };

  const deleteLdpConfig = () => {
    setDeleteBox(true);
  };
  const deleteNo = () => {
    setDeleteBox(false);
  };
  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "right",
          paddingRight: routerType ? "1rem" : "3rem",
          marginBottom: "-3rem",
        }}
      >
        <button
          className="btn btn-primary mb-3 bootstarapModificationButton"
          onClick={configureL3vpn}
        >
          configure
        </button>
      </div>

      <Tabs defaultActiveKey="interfaceConfiguration" id="routing-tabs">
        <Tab eventKey="interfaceConfiguration" title={"Interface"}>
          {" "}
          <EnableLabelSwitching
            data={routerData}
            routerId={selectedRouter}
            saveLabelSwitching={saveLabelSwitching}
            labelSwitchResponse={labelSwitchResponse}
          ></EnableLabelSwitching>
        </Tab>
        <Tab eventKey="igp" title={"IGP Switching"}>
          <div className="configured-content-body">
            <p style={{ fontSize: "smaller" }}>
              PE & P: configure IGP switching (using ISIS/OSPF)<br></br>
              Note: Configure ISIS for PE-P connections<br></br>
              Note: Use all interfaces configured in the first step
            </p>
            <DropdownButton
              id="network-dropdown"
              title={dropDownValues.selectedIGPtype || "Choose Type"}
              onSelect={handleIGPswitchingType}
              drop="down"
              style={{ zIndex: 1000 }}
              className="custom-dropdown"
            >
              {["IS-IS", "OSPF"].map((protocol, optionIndex) => (
                <Dropdown.Item key={optionIndex} eventKey={protocol}>
                  {protocol}
                </Dropdown.Item>
              ))}
            </DropdownButton>
            {dropDownValues.selectedIGPtype === "IS-IS" && (
              <IsisConfiguration
                interfaceData={
                  vrfAtachInterfaceData.length
                    ? vrfAtachInterfaceData
                    : routerData && routerData["ipi-interface:interfaces"]
                    ? routerData["ipi-interface:interfaces"]["interface"]
                    : []
                }
                routerid={selectedRouter}
                isisData={isisData}
                saveISISConfigVpn={saveISISConfig}
              />
            )}
          </div>
        </Tab>
        <Tab eventKey="lsp" title={"Label Switching Protocol"}>
          {" "}
          <div className="configured-content-body">
            <p style={{ fontSize: "smaller" }}>
              PE/P: enable label switching protocol (using LDP/RSVP-TE)
              <br></br>
              Note: Configure LDP for PE-P connections<br></br>
              Note: use all interfaces configured in the first step except
              loopback<br></br>
              Note: use loopback addresses as router id and transport address
            </p>
            <DropdownButton
              id="network-dropdown"
              title={dropDownValues.selectedlabelSwitching || "Choose Type"}
              onSelect={handlelabelSwitchingType}
              drop="down"
              style={{ zIndex: 1000 }}
              className="custom-dropdown"
            >
              {["LDP", "RSVP-TE"].map((protocol, optionIndex) => (
                <Dropdown.Item key={optionIndex} eventKey={protocol}>
                  {protocol}
                </Dropdown.Item>
              ))}
            </DropdownButton>
            <LdpConfiguration
              routerId={selectedRouter}
              labelSwitchData={
                enabledLabelSwitchData["ipi-mpls:mpls"] &&
                enabledLabelSwitchData["ipi-mpls:mpls"].interfaces.interface
              }
              saveLdp={saveLabelSwitchingConfig}
              enabledLabelSwitchData={enabledLabelSwitchData}
            />
          </div>
        </Tab>
        <Tab
          eventKey="vrf"
          title={"VRF"}
          disabled={routerType && routerType === "P"}
        >
          {" "}
          <div className="configured-content-body">
            <p style={{ fontSize: "smaller" }}>
              PE: create vrf and configure vrf-rd and rt
            </p>
            <button
              style={{
                position: "relative",
                left: "94%",
                bottom: "50px",
              }}
              className="btn btn-primary mb-3 bootstarapModificationButton"
              onClick={() => addInstance()}
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
            {vrfData.map((_item, index) => {
              return (
                <div style={{ marginTop: "-37px" }}>
                  <div style={{ fontWeight: "500" }}>
                    Instance_{index}
                    {vrfData.length > 1 && (
                      <img
                        src={remove}
                        alt=""
                        style={{
                          width: "20px",
                          height: "20px",
                          cursor: "pointer",
                          marginBottom: "5px",
                          marginLeft: "10px",
                        }}
                        onClick={() => removeClick(index)}
                      ></img>
                    )}
                  </div>
                  <div>
                    {renderInputField(
                      `${
                        index === 0 ? "Instance Name" : `Instance Name${index}`
                      }`,
                      "vrf_instance_name",
                      index
                    )}
                    {renderInputField(
                      "Instance Type",
                      "vrf_instance_type",
                      index
                    )}
                    {renderInputField("VRF Name", "vrf_name", index)}
                    {renderInputField("RD String", "rd_string", index)}
                    {renderInputField("Direction", "direction", index)}
                    {renderInputField("RT RD String", "rt_rd_string", index)}
                    <br></br>
                    <br></br>
                  </div>
                </div>
              );
            })}
            <div style={{display:"flex",gap:"4px"}}>
            <button
              className="btn btn-primary mb-3 bootstarapModificationButton"
              style={{ position: "relatove", left: "41%" }}
              onClick={()=>saveVrfConfig(false)}
            >
              save
            </button>
            <button
                className="btn btn-danger mb-3 bootstarapModificationButton"
                onClick={() => deleteLdpConfig()}
              >
                Delete
              </button>
            </div>
            
          </div>
        </Tab>
        <Tab
          eventKey="bgp"
          title={"MP-BGP"}
          disabled={routerType && routerType === "P"}
        >
          {" "}
          <p style={{ fontSize: "smaller" }}>
            Note: Configure BGP for PE-PE connections<br></br>
            Note: Configuration is same as normal bgp with
            "route-redistribute-list" added<br></br>
            Note: use loopback addresses as router ids<br></br>
            Note: use vrf name from vrf step
          </p>
          {bgpConfigurationData ? (
            <ConfigureBgp
              bgpConfData={bgpConfigurationData}
              routertId={selectedRouter}
              saveBgp={handleSaveBGPConfig}
            ></ConfigureBgp>
          ) : (
            <BGPConfiguration
              onSaveBGPConfig={handleSaveBGPConfig}
              bgpDetails={bgpConfigurationData}
            />
          )}
        </Tab>
        <Tab
          eventKey="attachToVrf"
          title={"Attach to VRF"}
          disabled={routerType && routerType === "P"}
        >
          {" "}
          <AttachToVrf
            vrfAtachInterfaceData={
              vrfAtachInterfaceData.length
                ? vrfAtachInterfaceData
                : interfaceData
            }
            vrfName={vrfData.vrf_name}
            saveAttachToVrf={saveAttachToVrf}
          ></AttachToVrf>
        </Tab>
      </Tabs>
      {deleteBox && (
        <ConfirmationBox
          title={"Are you sure"}
          message={"Do you want to delete the total VRF configuration module.?"}
          yesClick={() => saveVrfConfig(true)}
          noClick={deleteNo}
        ></ConfirmationBox>
      )}
    </div>
  );
};
export default L3VPNConfiguration;
