import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import add from "../Images/addNewTrigger.png";
import remove from "../Images/remove.png";
import info from "../Images/info.png";
import notify from "../utils";
import ConfirmationBox from "./confirmationBox";

const IsisConfiguration = ({
  interfaceData,
  mplsConfiguration,
  nextClicked,
  routerid,
  saveISISConfigVpn,
  savedISISConfig,
  isisData,
}) => {
  const [inputFields, setInputFields] = useState({
    instance: "",
    levelCapability: "",
    vrfName: "",
    networkEntityTitile: [""],
    selectedInterfaceISIS: [],
    existingInterfaces: [],
    changedInterfaces: [],
  });
  const [displayError, setDisplayError] = useState({
    entityError: false,
    instanceError: false,
  });
  const [deleteBox, setDeleteBox] = useState(false);
  const levelCapabilityList = ["level-1", "level-2-only", "level-1-2"];
  const savedisisdata = savedISISConfig;

  const renderInput = (label, name, required) => {
    return (
      <div className="isis-instance-labels">
        <div className="isis-config-module">
          <div
            style={{ display: "flex", flexDirection: "row" }}
            htmlFor="my-label"
          >
            {label}
            {required && <span style={{ color: "orangered" }}>*</span>}&nbsp;
            <div className="info-button">
              <img alt="" src={info} width={9} />
            </div>
            <span id="my-label" className="label-description">
              description
            </span>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <input
            type="text"
            value={inputFields[name]}
            onChange={(e) => handleInputChange(name, e.target.value)}
          />
          {name === "instance" &&
          displayError.instanceError &&
          (inputFields[name].length === 0 ||
            inputFields[name].length > 1965) ? (
            <span style={{ fontSize: "10px", color: "orangered" }}>
              min 1 and max 1965 charecters allowed
            </span>
          ) : name === "instance" ? (
            <span style={{ fontSize: "10px" }}>
              {inputFields[name].length}/1965
            </span>
          ) : null}
        </div>
      </div>
    );
  };

  useEffect(() => {
    if (isisData) {
      let interfaceArr = [];
      isisData["isis-instances"] && isisData["isis-instances"]["isis-instance"].map((item) => {
        setInputFields({
          instance: item["config"]["instance"],
          levelCapability: item["config"]["level-capability"],
          vrfName: item["config"]["vrf-name"],
          networkEntityTitile: item["network-entity-title"]["config"][
            "net"
          ].map((item) => item),
          selectedInterfaceISIS: [],
        });
      });
      isisData["interfaces"]["interface"].map((item) => {
        interfaceArr.push(item.name);
      });
      setInputFields((prev) => ({
        ...prev,
        selectedInterfaceISIS: [...interfaceArr],
        existingInterfaces: [...interfaceArr],
      }));
      console.log(interfaceArr);
    } else {
      setInputFields({
        instance: "",
        levelCapability: "",
        vrfName: "",
        networkEntityTitile: [""],
        selectedInterfaceISIS: [],
      });
    }
  }, [isisData]);

  const handleInputChange = (name, value) => {
    if (name === "instance") {
      setInputFields((prev) => ({
        ...prev,
        [name]: value.replace(/[?^' =,>|]/g, ""),
      }));
      !value.length || value.length > 1965
        ? setDisplayError((prev) => ({ ...prev, instanceError: true }))
        : setDisplayError((prev) => ({ ...prev, instanceError: false }));
    } else {
      setInputFields((prev) => ({ ...prev, [name]: value }));
    }
  };

  const addClick = (index) => {
    let tempArr = [...inputFields.networkEntityTitile];
    if (
      inputFields.networkEntityTitile[index].length &&
      !displayError.entityError
    ) {
      setDisplayError((prev) => ({ ...prev, entityError: false }));
      tempArr.push("");
      setInputFields((prev) => ({
        ...prev,
        networkEntityTitile: [...tempArr],
      }));
    } else {
      setDisplayError((prev) => ({ ...prev, entityError: true }));
    }
  };

  const removeClick = (index) => {
    let tempArr = [...inputFields.networkEntityTitile];
    tempArr.splice(index, 1);
    setInputFields((prev) => ({
      ...prev,
      networkEntityTitile: [...tempArr],
    }));
  };

  const handleEntityChange = (index, value) => {
    let tempArr = [...inputFields.networkEntityTitile];
    tempArr[index] = value.replace(/[?^' =,>|]/g, "");
    setInputFields((prev) => ({
      ...prev,
      networkEntityTitile: [...tempArr],
    }));
    !value.length || value.length > 1965
      ? setDisplayError((prev) => ({ ...prev, entityError: true }))
      : setDisplayError((prev) => ({ ...prev, entityError: false }));
  };
  const nextClick = () => {
    nextClicked && nextClicked(inputFields, true);
  };

  const saveISISConfig = (remove) => {
    const interfaces = inputFields.changedInterfaces;
    const isisConfig = {
      "ipi-isis:isis": {
        ...(remove && { "@nc:operation": "delete" }),

        "@xmlns:ipi-isis": "http://www.ipinfusion.com/yang/ocnos/ipi-isis",
      ...(interfaces  &&  { interfaces: {
          interface:
            interfaces.map((interfaceName) => ({
              ...(inputFields.existingInterfaces.includes(interfaceName) && {
                "@nc:operation": "delete",
              }),
              config: {
                name: interfaceName,
              },
              "interface-parameters": {
                config: {
                  "ipv4-instance-tag": inputFields.instance,
                },
              },
              name: interfaceName,
            })),
        }}),
        "isis-instances": {
          "isis-instance": [
            {
              config: {
                instance: inputFields.instance,
                "level-capability": inputFields.levelCapability,
                "vrf-name": inputFields.vrfName,
              },
              instance: inputFields.instance,
              "network-entity-title": {
                config: {
                  net: [...inputFields.networkEntityTitile],
                },
              },
            },
          ],
        },
      },
    };
    console.log(isisConfig, "saved data");
    saveISISConfigVpn && saveISISConfigVpn(isisConfig, routerid);
    notify(
      remove
        ? "Module will be deleted once the configuration is done"
        : "LDP configuration saved",
      remove ? "info" : "success"
    );
    remove && setDeleteBox(false)

  };

  const getConfigISISInterface = (configData) => {
    const res = [];
    for (let i of savedisisdata["ipi-isis:isis"]["interfaces"]["interface"]) {
      res.push(i.config.name);
    }
    return res;
  };

  const populateConfigData = () => {
    const data =
      savedisisdata["ipi-isis:isis"]["isis-instances"]["isis-instance"][0][
        "config"
      ];
    const networkData =
      savedisisdata["ipi-isis:isis"]["isis-instances"]["isis-instance"][0][
        "network-entity-title"
      ]["config"]["net"];
    setInputFields({
      ...inputFields,
      instance: data["instance"],
      levelCapability: data["level-capability"],
      vrfName: data["vrf-name"],
      networkEntityTitile: networkData,
      selectedInterfaceISIS: getConfigISISInterface(savedisisdata),
    });
  };

  const handleInterfaceISIS = (event, item) => {
    let selectedList = inputFields.selectedInterfaceISIS
      ? [...inputFields.selectedInterfaceISIS]
      : [];
    let existingList = inputFields.existingInterfaces
      ? [...inputFields.existingInterfaces]
      : [];
    let changedList = inputFields.changedInterfaces
      ? [...inputFields.changedInterfaces]
      : [];
    if (event.target.checked) {
      if (!existingList.includes(event.target.value)) {
        selectedList = selectedList
          ? [...selectedList, event.target.value]
          : [event.target.value];
        changedList = changedList
          ? [...changedList, event.target.value]
          : [event.target.value];
      }
    } else {
      if (!existingList.includes(event.target.value)) {
        selectedList = selectedList.filter(
          (name) => name !== event.target.value
        );
        changedList = changedList.filter((name) => name !== event.target.value);
      } else {
        changedList = changedList
          ? [...changedList, event.target.value]
          : [event.target.value];
        selectedList = selectedList.filter(
          (name) => name !== event.target.value
        );
      }
    }
    setInputFields((prev) => ({
      ...prev,
      selectedInterfaceISIS: [...selectedList],
      changedInterfaces: [...changedList],
      existingInterfaces: [...existingList],
    }));
  };
  const handleSelectLevelCapability = (e) => {
    setInputFields((prev) => ({ ...prev, levelCapability: e.target.value }));
  };
  const deleteIsisConfig = () => {
    setDeleteBox(true);
  };
  const deleteNo = () => {
    setDeleteBox(false);
  };

  return (
    <div
      style={{
        display: "flex",
        padding: "1rem",
        justifyContent: "space-between",
      }}
    >
      <div style={{ margin: "1%", width: "600px" }}>
        {savedisisdata && (
          <button
            className="btn btn-primary mb-3 bootstarapModificationButton"
            onClick={populateConfigData}
          >
            Use Last Saved Config
          </button>
        )}
        <div style={{ color: "#443b3b", fontWeight: "500" }}>
          Configure Instance:
        </div>
        <div style={{ margin: "1%" }}>
          {renderInput("Instance", "instance", false)}
          <div className="isis-instance-labels">
            <div className="isis-config-module">
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                }}
              >
                {" "}
                Level-Capability{" "}
                {/* <div className="info-button">
                    <img alt="" src={info} width={9} />
                  </div>
                  <span id="my-label" className="label-description">
                    description
                  </span> */}
              </div>
            </div>
            <select
              value={inputFields.levelCapability}
              onChange={(e) => handleSelectLevelCapability(e)}
            >
              <option value="" hidden>
                Select Level Capability
              </option>
              {levelCapabilityList &&
                levelCapabilityList.map((item, index) => (
                  <option value={item} key={index}>
                    {item}
                  </option>
                ))}
            </select>
          </div>
          {renderInput("VRF-Name", "vrfName", true)}
          <div className="isis-instance-labels">
            <div className="isis-config-module">Network-entity-title</div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              {inputFields.networkEntityTitile.map((item, index) => {
                return (
                  <div style={{ display: "flex", flexDirection: "row" }}>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <input
                        type="text"
                        value={item}
                        onChange={(e) =>
                          handleEntityChange(index, e.target.value)
                        }
                      />
                      {displayError.entityError &&
                      (inputFields.networkEntityTitile[index].length === 0 ||
                        inputFields.networkEntityTitile[index].length >
                          1965) ? (
                        <span style={{ fontSize: "10px", color: "orangered" }}>
                          min 1 and max 1965 charecters allowed
                        </span>
                      ) : index ===
                        inputFields.networkEntityTitile.length - 1 ? (
                        <span style={{ fontSize: "10px" }}>
                          {inputFields.networkEntityTitile[index].length}
                          /1965
                        </span>
                      ) : null}
                    </div>
                    &nbsp;&nbsp;
                    {index === inputFields.networkEntityTitile.length - 1 ? (
                      <>
                        {" "}
                        {inputFields.networkEntityTitile.length - 1 ? (
                          <>
                            {" "}
                            <img
                              src={remove}
                              alt=""
                              style={{
                                width: "20px",
                                height: "20px",
                                cursor: "pointer",
                                marginTop: "5px",
                              }}
                              onClick={() => removeClick(index)}
                            ></img>
                            &nbsp;
                          </>
                        ) : null}
                        <img
                          src={add}
                          alt=""
                          style={{
                            width: "20px",
                            height: "20px",
                            cursor: "pointer",
                            marginTop: "5px",
                          }}
                          onClick={() => addClick(index)}
                        ></img>
                      </>
                    ) : (
                      <img
                        src={remove}
                        alt=""
                        style={{
                          width: "20px",
                          height: "20px",
                          cursor: "pointer",
                          marginTop: "5px",
                        }}
                        onClick={() => removeClick(index)}
                      ></img>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        {!mplsConfiguration ? (
          <>
            <button
              className="btn btn-primary mb-3 bootstarapModificationButton"
              onClick={() => saveISISConfig( false)}
            >
              save
            </button>{" "}
            &nbsp;&nbsp;{" "}
            <button
              className="btn btn-danger mb-3 bootstarapModificationButton"
              onClick={() => deleteIsisConfig(routerid)}
            >
              Delete
            </button>
          </>
        ) : (
          <button
            className="btn btn-primary mb-3 bootstarapModificationButton"
            onClick={() => nextClick()}
          >
            Next
          </button>
        )}
      </div>
      <div>
        <div style={{ color: "#443b3b", fontWeight: "500" }}>
          Enable IS-IS Routing on interface:
        </div>
        <div className="interface-box">
          {interfaceData &&
            interfaceData.map((item, index) => (
              <label
                style={{ display: "flex" }}
                for="checkbox1"
                className="checkboxes"
              >
                <input
                  style={{ width: "fit-content" }}
                  type="checkbox"
                  id="checkbox1"
                  name="checkboxes"
                  value={item.name}
                  checked={inputFields.selectedInterfaceISIS.includes(
                    item.name
                  )}
                  onChange={(e) => handleInterfaceISIS(e, item)}
                />
                <div className="checkbox-label">{item.name}</div>
              </label>
            ))}
        </div>
      </div>
      {deleteBox && (
        <ConfirmationBox
          title={"Are you sure"}
          message={
            "Do you want to delete the total ISIS configuration module.?"
          }
          yesClick={() => saveISISConfig( true)}
          noClick={deleteNo}
        ></ConfirmationBox>
      )}
    </div>
  );
};
export default IsisConfiguration;
