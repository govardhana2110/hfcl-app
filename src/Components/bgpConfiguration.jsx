import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import enabled from "../Images/power-on.png";
import disabled from "../Images/power-off.png";
import remove from "../Images/remove.png";
import notify from "../utils";
class BGPConfiguration extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      serverIP: process.env.REACT_APP_CLIENT_IP,
      deviceID: null,
      bgpDetails: {
        "address-families": {
          "address-family": [
            {
              afi: "",
              safi: "",
              config: { afi: "", safi: "" },
            },
          ],
        },
        "address-family-vrfs": {
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
        },
        "bgp-as": "",
        config: { "bgp-as": "" },
        peers: {
          peer: [
            {
              "address-families": {
                "address-family": [
                  {
                    afi: "",
                    safi: "",
                    config: { afi: "", safi: "", activate: [] },
                  },
                ],
              },
              config: {
                "peer-address": "",
                "peer-as": "",
                "source-identifier": "",
              },
              "peer-address": "",
            },
          ],
        },
      },
      afiTypes: [
        "ipv4",
        "ipv6",
        "vpnv4",
        "vpnv6",
        "rtfilter",
        "l2vpn",
        "link-state",
      ],
      safiTypes: [
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
      ],
    };
  }

  saveBGPConfig() {
    var temp = this.state.bgpDetails;
    var dict = { "ipi-bgp:bgp": { 
      "@xmlns:ipi-bgp": "http://www.ipinfusion.com/yang/ocnos/ipi-bgp",
      "bgp-instances": { "bgp-instance": [] }
     } };
    dict["ipi-bgp:bgp"]["bgp-instances"]["bgp-instance"].push(temp);
    this.props.onSaveBGPConfig(dict);
    notify("BGP saved", "success");
  }

  handleChange = (e, id) => {
    const temp = { ...this.state.bgpDetails };
    temp.config[id] = e.target.value;
    if(id!=="router-id"){
      temp[id] = e.target.value;
    }
    this.setState({ bgpDetails: temp });
  };

  handleLocalAddressFamily = (e, id, index) => {
    const temp = { ...this.state.bgpDetails };

    if (!temp["address-families"]["address-family"]) {
      temp["address-families"]["address-family"] = [];
    }

    temp["address-families"]["address-family"][index][id] = e.target.value;

    if (!temp["address-families"]["address-family"][index]["config"]) {
      temp["address-families"]["address-family"][index]["config"] = {};
    }

    temp["address-families"]["address-family"][index]["config"][id] =
      e.target.value;
    this.setState({ bgpDetails: temp });
  };

  addAddressLocal = () => {
    const temp = { ...this.state.bgpDetails };

    if (!temp["address-families"]["address-family"]) {
      temp["address-families"]["address-family"] = [];
    }

    const afiTypes = this.state.afiTypes || [];
    const safiTypes = this.state.safiTypes || [];

    const newAddressFamily = {
      afi: "",
      config: {
        afi: "",
        safi: "",
      },
      safi: "",
    };

    temp["address-families"]["address-family"] = [
      ...temp["address-families"]["address-family"],
      newAddressFamily,
    ];

    this.setState({ bgpDetails: temp });
  };
  
  removelocalAddressInfo = (addressFamilyList, index) => {
    if (addressFamilyList && addressFamilyList[index]) {
      const updatedBgpDetails = { ...this.state.bgpDetails };
      // Assuming "address-families" is an array and "address-family" is to be removed
      const updatedAddressFamilies = [
        ...(updatedBgpDetails["address-families"]["address-family"] || []),
      ];
      updatedAddressFamilies.splice(index, 1);
      // Update the state with the modified "address-families"
      updatedBgpDetails["address-families"]["address-family"] =
        updatedAddressFamilies;
        this.setState({bgpDetails:updatedBgpDetails})
    }
  };

  handleAddressFamilyVrfChange = (e, id, index) => {
    const temp = { ...this.state.bgpDetails };
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
    this.setState({ bgpDetails: temp });
  };

  addAddressVrf = () => {
    const updatedBgpDetails = { ...this.state.bgpDetails };
    const newVrfAddress = {
      afi: "",
      safi: "",
      "vrf-name": "",
      config: { afi: "", safi: "", "vrf-name": "" },
    };
    updatedBgpDetails["address-family-vrfs"]["address-family-vrf"].push(
      newVrfAddress
    );
    this.setState({ bgpDetails: updatedBgpDetails });
    // this.setState((prevState) => {
    //   const updatedBgpDetails = { ...prevState.bgpDetails };
    //   // if (!updatedBgpDetails["address-family-vrfs"]["address-family-vrf"]) {
    //   //   updatedBgpDetails["address-family-vrfs"]["address-family-vrf"] = [];
    //   // }
    //   console.log("in set state");
    //   const newVrfAddress = {
    //     afi: "",
    //     safi: "",
    //     "vrf-name": "",
    //     config: { afi: "", safi: "", "vrf-name": "" },
    //   };
    //   console.log(
    //     updatedBgpDetails["address-family-vrfs"]["address-family-vrf"],
    //     newVrfAddress
    //   );
    //   updatedBgpDetails["address-family-vrfs"]["address-family-vrf"].push(
    //     newVrfAddress
    //   );
    //   return { bgpDetails: updatedBgpDetails };
    // });
  };

  removeVrfAddressInfo = (vrfList, index) => {
    if (vrfList && vrfList[index]) {
      const updatedBgpDetails = { ...this.state.bgpDetails };

      const updatedVrfList = [
        ...(updatedBgpDetails["address-family-vrfs"]["address-family-vrf"] ||
          []),
      ];
      updatedVrfList.splice(index, 1);
      updatedBgpDetails["address-family-vrfs"]["address-family-vrf"] =
        updatedVrfList;
      this.setState({ bgpDetails: updatedBgpDetails });
    }
  };

  handlePeerChange = (e, id, index) => {
    const temp = { ...this.state.bgpDetails };

    if (!temp.peers.peer) {
      temp.peers.peer = [];
    }

    if (!temp.peers.peer[index]) {
      temp.peers.peer[index] = {};
    }

    if (id === "peer-address") {
      temp.peers.peer[index][id] = e.target.value;

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
    temp.peers.peer[index]["config"]["source-identifier"] =
      temp["config"]["router-id"];
    this.setState({ bgpDetails: temp });
  };

  handleRemoteAddressFamily = (e, index) => {
    const combinedValue = e.target.value;
    const [afi, safi] = combinedValue.split(",");

    this.setState((prevState) => {
      const updatedBgpDetails = { ...prevState.bgpDetails };

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
        !updatedBgpDetails.peers.peer[index]["address-families"][
          "address-family"
        ]
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

      return { bgpDetails: updatedBgpDetails };
    });
  };

  addAddressPeer = () => {
    const temp = { ...this.state.bgpDetails };
    if (!temp.peers) {
      temp.peers = { peer: [] };
    }

    const newPeer = {
      "address-families": {
        "address-family": [
          {
            afi: "",
            config: {
              activate: [],
              afi: "",
              safi: "",
            },
            safi: "",
          },
        ],
      },
      config: {
        "peer-address": "",
        "peer-as": "",
        "source-identifier": "",
      },
      "peer-address": "",
    };

    temp.peers.peer.push(newPeer);
    this.setState({ bgpDetails: temp });
  };

  removePeerInfo = (index) => {
    this.setState((prevState) => {
      const updatedBgpDetails = { ...prevState.bgpDetails };

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

      return {
        bgpDetails: { ...updatedBgpDetails, peers: { peer: updatedPeerList } },
      };
    });
  };

  toggleActivate = (data, index) => {
    const temp = { ...this.state.bgpDetails };
    const parsedData = JSON.stringify(data.activate);
    if (parsedData === "[]") {
      temp.peers.peer[index]["address-families"]["address-family"][0][
        "config"
      ].activate = [null];
    } else {
      temp.peers.peer[index]["address-families"]["address-family"][0][
        "config"
      ].activate = [];
    }
    this.setState({ bgpDetails: temp });
  };

  renderDropdown = (item, index, type, family) => (
    <select
      className="addressFamilyDropdown"
      value={item.config[type]}
      onChange={(e) =>
        family === "local"
          ? this.handleLocalAddressFamily(e, type, index)
          : this.handleAddressFamilyVrfChange(e, type, index)
      }
    >
      <option value="" disabled>
        Select {type.toUpperCase()}
      </option>
      {this.state[type === "afi" ? "afiTypes" : "safiTypes"].map((option) => (
        <option value={option} key={option}>
          {option}
        </option>
      ))}
    </select>
  );

  render() {
    const { bgpDetails } = this.state;
    const afiSafiList = [];

    if (bgpDetails&&bgpDetails["address-families"]["address-family"]) {
      bgpDetails["address-families"]["address-family"].forEach((family) => {
        if (family && family.afi.length && family.safi.length) {
          let obj = {
            afi: family.afi,
            safi: family.safi,
          };
          const isDuplicate = afiSafiList.some(
            (item) => JSON.stringify(item) === JSON.stringify(obj)
          );
          if (!isDuplicate) {
            afiSafiList.push(obj);
          }
        }
      });
    }
    return (
      <div className="configured-content-body">
        <div style={{ margin: "2%" }}>
          <div className="BgpConfigRightTopHeader">Local BGP Options:</div>
          <div style={{ display: "flex", margin: "3px" }}>
            <div className="bgpConfigParameterLabel">Local AS:</div>
            <input
              className="isis-config-module-input"
              value={bgpDetails["config"]["bgp-as"]}
              onChange={(e) => this.handleChange(e, "bgp-as")}
            />
          </div>
          <div style={{ display: "flex", margin: "3px" }}>
            <div className="bgpConfigParameterLabel">Router ID:</div>
            <input
              className="isis-config-module-input"
              value={bgpDetails["config"]["router-id"]}
              onChange={(e) => this.handleChange(e, "router-id")}
            />
          </div>
        </div>

        <div style={{ margin: "2%" }}>
          <div className="BgpConfigRightTopHeader">
            Address Family:{" "}
            <span>
              <button
                className="addAddressButton"
                onClick={() => this.addAddressLocal()}
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
              {bgpDetails && bgpDetails["address-families"]["address-family"]
                ? bgpDetails["address-families"]["address-family"].map(
                    (item, index) => (
                      <tr className="trPerf" key={index}>
                        <td className="tdPerf">
                          {this.renderDropdown(item, index, "afi", "local")}
                        </td>
                        <td className="tdPerf">
                          {this.renderDropdown(item, index, "safi", "local")}
                        </td>
                        <td
                          onClick={() =>
                            this.removelocalAddressInfo(
                              bgpDetails["address-families"]["address-family"],
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

        {/* ADDRESS-FAMILY-VRF */}
        <div style={{ margin: "2%" }}>
          <div className="BgpConfigRightTopHeader">
            {" "}
            Address Family VRF:{" "}
            <span>
              <button
                className="addAddressButton"
                onClick={() => this.addAddressVrf()}
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
              {bgpDetails["address-family-vrfs"]["address-family-vrf"]
                ? bgpDetails["address-family-vrfs"]["address-family-vrf"].map(
                    (item, index) => (
                      <tr className="trPerf" key={index}>
                        <td className="tdPerf">
                          {this.renderDropdown(item, index, "afi", "vrf")}
                        </td>
                        <td className="tdPerf">
                          {this.renderDropdown(item, index, "safi", "vrf")}
                        </td>
                        <td className="tdPerf">
                          <input
                            className="tableInput"
                            type="text"
                            value={item.config["vrf-name"]}
                            onChange={(e) =>
                              this.handleAddressFamilyVrfChange(
                                e,
                                "vrf-name",
                                index
                              )
                            }
                          />
                        </td>
                        <td
                          onClick={() =>
                            this.removeVrfAddressInfo(
                              bgpDetails["address-family-vrfs"][
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
                onClick={() => this.addAddressPeer()}
              >
                +
              </button>
            </span>
          </div>
          <table className="user_table">
            <thead className="user_table_head">
              <tr style={{ backgroundColor: "#e5e8ff", color: "black" }}>
                <th>Remote IP</th>
                <th>Remote AS</th>
                <th>Address Family</th>
                <th>Activate</th>
                <th>Remove</th>
              </tr>
            </thead>
            <tbody>
              {bgpDetails && bgpDetails.peers.peer
                ? bgpDetails.peers.peer.map((item, index) => (
                    <tr className="trPerf" key={index}>
                      <td className="tdPerf">
                        <input
                          className="tableInput"
                          type="text"
                          value={item.config["peer-address"]}
                          onChange={(e) =>
                            this.handlePeerChange(e, "peer-address", index)
                          }
                        />
                      </td>
                      <td className="tdPerf">
                        <input
                          className="tableInput"
                          type="text"
                          value={item.config["peer-as"]}
                          onChange={(e) =>
                            this.handlePeerChange(e, "peer-as", index)
                          }
                        />
                      </td>
                      <td className="tdPerf">
                        <select
                          className="addressFamilyDropdown"
                          value={`${item["address-families"]["address-family"][0]["afi"]},${item["address-families"]["address-family"][0]["safi"]}`}
                          onChange={(e) =>
                            this.handleRemoteAddressFamily(e, index)
                          }
                        >
                          <option value="" hidden>
                            Select AFI/SAFI
                          </option>
                          {afiSafiList &&
                            afiSafiList.map((item, index) => {
                              return (
                                <option
                                  value={`${item.afi},${item.safi}`}
                                  key={index}
                                >{`${item.afi},${item.safi}`}</option>
                              );
                            })}
                        </select>
                        {/* <select className="addressFamilyDropdown">
                          <option value="" >Select AFI/SAFI</option>
                        </select> */}
                      </td>
                      <td
                        className="tdPerf"
                        onClick={() =>
                          this.toggleActivate(
                            item["address-families"]["address-family"][0][
                              "config"
                            ],
                            index
                          )
                        }
                      >
                        <img
                          src={
                            JSON.stringify(
                              item["address-families"]["address-family"][0][
                                "config"
                              ]["activate"]
                            ) === "[]"
                              ? disabled
                              : enabled
                          }
                          alt=""
                          width={20}
                        />
                      </td>
                      <td
                        onClick={() =>
                          this.removePeerInfo(bgpDetails.peers.peer, index)
                        }
                      >
                        <img src={remove} alt="" width={10} />
                      </td>
                    </tr>
                  ))
                : null}
            </tbody>
          </table>
        </div>
        <button
          className="configureTopology btn btn-primary mb-3"
          onClick={() => this.saveBGPConfig()}
        >
          save
        </button>
      </div>
    );
  }
}

export default BGPConfiguration;
