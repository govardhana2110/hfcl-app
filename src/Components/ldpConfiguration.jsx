import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import notify from "../utils";
import ConfirmationBox from "./confirmationBox";
const LdpConfiguration = ({
  routerId,
  labelSwitchData,
  saveLdp,
  mplsConfiguration,
  prevClicked,
  enabledLabelSwitchData,
}) => {
  const [inputFields, setInputFields] = useState({
    ldpInstance: "",
    routerIdentifier: "",
    labelSpaceIdentifier: "",
    transportAddressIpv4: "",
  });
  const [deleteBox, setDeleteBox] = useState(false);

  const ldpInstanceList = ["ldp"];
  const labelSpaceList = ["0"];

  const renderInput = (label, name) => {
    return (
      <div className="isis-instance-labels">
        <div className="isis-config-module">{label}</div>
        <input
          type="text"
          value={inputFields[name]}
          onChange={(e) => handleInputChange(name, e.target.value)}
        />
      </div>
    );
  };

  const handleInputChange = (name, value) => {
    setInputFields((prev) => ({ ...prev, [name]: value }));
  };

  const clickPrev = () => {
    prevClicked && prevClicked(inputFields, true);
  };
  const saveLdpConfig = (remove) => {
    console.log(labelSwitchData, "ldp-comp");
    const ldpConfig = {
      "ipi-ldp:ldp": {
        ...(remove && { "@nc:operation": "delete" }),
        "@xmlns:ipi-ldp": "http://www.ipinfusion.com/yang/ocnos/ipi-ldp",
       ...(labelSwitchData && {interfaces: {
          interface:
            labelSwitchData.map((item) => ({
              config: {
                "enable-ldp-ipv4": [null],
                name: item.name,
              },
              name: item.name,
            })),
        }}),
        global: {
        
          config: {
            "ldp-instance": inputFields.ldpInstance,
            "router-identifier": inputFields.routerIdentifier,
          },
        },
        "transport-addresses": {
          "transport-address": [
            {
              config: {
                "label-space-identifier": inputFields.labelSpaceIdentifier,
                "transport-address-ipv4": inputFields.transportAddressIpv4,
              },
              "label-space-identifier": inputFields.labelSpaceIdentifier,
            },
          ],
        },
      },
    };

    saveLdp && saveLdp(ldpConfig, routerId);
    notify(
      remove
        ? "Module will be deleted once the configuration is done"
        : "LDP configuration saved",
      remove ? "info" : "success"
    );
    remove && setDeleteBox(false)
  };
  const dropDownChange = (e, name) => {
    setInputFields((prev) => ({ ...prev, [name]: e.target.value }));
  };
  const fetchLdpData = (routerId) => {
    fetch(
      `http://${process.env.REACT_APP_CLIENT_IP}:5000/configuration-management/configuration/ldp/${routerId}`,
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
        if (resp && resp["ipi-ldp:ldp"]) {
          setInputFields({
            ldpInstance:
              resp["ipi-ldp:ldp"]["global"]["config"]["ldp-instance"],
            routerIdentifier:
              resp["ipi-ldp:ldp"]["global"]["config"]["router-identifier"],
            labelSpaceIdentifier:
              resp["ipi-ldp:ldp"]["transport-addresses"][
                "transport-address"
              ][0]["config"]["label-space-identifier"],
            transportAddressIpv4:
              resp["ipi-ldp:ldp"]["transport-addresses"][
                "transport-address"
              ][0]["config"]["transport-address-ipv4"],
          });
        }
      });
  };
  useEffect(() => {
    routerId && fetchLdpData(routerId);
  }, [routerId]);
  const deleteLdpConfig = () => {
    setDeleteBox(true);
  };
  const deleteNo = () => {
    setDeleteBox(false);
  };

  return (
    <div style={{ display: "flex", fontSize: "small", marginLeft: "2%" }}>
      <div style={{ width: "80%" }}>
        <div style={{ color: "#443b3b", fontWeight: "500" }}>
          {" "}
          Configure LDP:
        </div>
        <div style={{ margin: "1%" }}>
          <div className="isis-instance-labels">
            <div className="isis-config-module">
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                }}
              >
                {" "}
                LDP-Instance{" "}
                {/* <div className="info-button">
                      <img alt="" src={info} width={9} />
                    </div> */}
                {/* <span id="my-label" className="label-description">
            description
          </span> */}
              </div>
            </div>
            <select
              value={inputFields.ldpInstance}
              onChange={(e) => dropDownChange(e, "ldpInstance")}
            >
              {" "}
              <option value="" hidden>
                Select LDP
              </option>
              {ldpInstanceList &&
                ldpInstanceList.map((item, index) => (
                  <option value={item} key={index}>
                    {item}
                  </option>
                ))}
            </select>
          </div>
          {renderInput("Router Identifier", "routerIdentifier")}
        </div>
        <div style={{ color: "#443b3b", fontWeight: "500" }}>
          Transport Addresses:
        </div>
        <div style={{ margin: "1%" }}>
          <div className="isis-instance-labels">
            <div className="isis-config-module">
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                }}
              >
                {" "}
                Label Space Identifier{" "}
                {/* <div className="info-button">
                      <img alt="" src={info} width={9} />
                    </div> */}
                {/* <span id="my-label" className="label-description">
            description
          </span> */}
              </div>
            </div>
            <select
              value={inputFields.labelSpaceIdentifier}
              onChange={(e) => dropDownChange(e, "labelSpaceIdentifier")}
            >
              {" "}
              <option value="" hidden>
                Select LDP
              </option>
              {labelSpaceList &&
                labelSpaceList.map((item, index) => (
                  <option value={item} key={index}>
                    {item}
                  </option>
                ))}
            </select>
          </div>{" "}
          {renderInput("Transport Address IPV4", "transportAddressIpv4")}
          {!mplsConfiguration ? (
            <>
              <button
                className="btn btn-primary mb-3 bootstarapModificationButton"
                onClick={() => saveLdpConfig(false)}
              >
                save
              </button>{" "}
              &nbsp;&nbsp;{" "}
              <button
                className="btn btn-danger mb-3 bootstarapModificationButton"
                onClick={() => deleteLdpConfig()}
              >
                Delete
              </button>
            </>
          ) : (
            <>
              <button
                className="btn btn-primary mb-3 bootstarapModificationButton"
                onClick={() => clickPrev()}
              >
                Previous
              </button>{" "}
              &nbsp;&nbsp;
              <button
                className="btn btn-primary mb-3 bootstarapModificationButton"
                //   onClick={() => this.saveISISConfig(router)}
              >
                save
              </button>
            </>
          )}
        </div>
      </div>
      <div style={{ position: "relative", right: "10%" }}>
        <div style={{ color: "#443b3b", fontWeight: "500" }}>
          Label switching enabled:
        </div>
        <div className="interface-box">
          {enabledLabelSwitchData &&
            enabledLabelSwitchData["ipi-mpls:mpls"] &&
            enabledLabelSwitchData["ipi-mpls:mpls"]["interfaces"][
              "interface"
            ].map((item) => {
              return (
                <label
                  style={{ display: "flex" }}
                  for="checkbox1"
                  className="checkboxes"
                >
                  {console.log(item)}

                  <input
                    style={{ width: "fit-content" }}
                    type="checkbox"
                    id="checkbox1"
                    name="checkboxes"
                    value={item.name}
                    checked={true}
                    disabled={true}
                    // onChange={(e) => handleInterfaceISIS(e, item)}
                  />
                  <div className="checkbox-label">{item.name}</div>
                </label>
              );
            })}
        </div>
      </div>
      {deleteBox && (
        <ConfirmationBox
          title={"Are you sure"}
          message={"Do you want to delete the total LDP configuration module.?"}
          yesClick={() => saveLdpConfig(true)}
          noClick={deleteNo}
        ></ConfirmationBox>
      )}
    </div>
  );
};
export default LdpConfiguration;
