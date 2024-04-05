import React, { Component } from "react";
import "../css/topology.css";
import remove from "../Images/closeS.png";
import active from "../Images/power-on.png";
import inactive from "../Images/power-off.png";
import ForceGraph2D from "react-force-graph-2d";
import refresh from "../Images/refresh.png";
import close from "../Images/closeS.png";
import Loading from "../Components/loader";
import { DropdownButton } from "react-bootstrap";
import Dropdown from "react-bootstrap/Dropdown";
import NetworkGraph from "./sampleD3";

class Topology extends Component {
  constructor(props) {
    super(props);

    this.state = {
      data: {
        nodes: [],
        links: [],
      },
      routerUniqueID: null,
      openConfigurationTab: false,
      serverIP: process.env.REACT_APP_CLIENT_IP,
      bgpDetails: null,
      showBgpConfiguration: true,
      showInterfaceConfiguration: false,
      interfaceList: null,
      selectedAfiSafi: {},
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
      changedNames: [],
      is_fetching: false,
      hoverMessage: null,
    };
  }

  componentDidMount() {
    // this.getBgpTopology();
    this.setupGraphData();
  }
  getBgpTopology() {
    this.setState({ routerUniqueID: null });
    fetch(
      `http://${this.state.serverIP}:5000/configuration-management/get-bgp-topology`,
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
        console.log(resp, "get-bgp-topology");
        this.setupGraphData(resp);
      });
  }
  handleRouterNodeClick = (nodeId) => {
    console.log(nodeId);
    this.setState({ routerUniqueID: nodeId });
    // const clickedNode = this.state.data.nodes.find((node) => node.id === nodeId);
    this.setState({ openConfigurationTab: true });
    this.fetchInterfaceStats(nodeId.id);
    this.fetchBgpDetails(nodeId.id);
  };
  fetchInterfaceStats(id) {
    fetch(
      `http://${this.state.serverIP}:5000/configuration-management/interface-ip/${id}`,
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
        console.log(resp, "interface-details-fetched");
        if (resp["ipi-interface:interfaces"]) {
          this.setState({
            interfaceList: resp["ipi-interface:interfaces"]["interface"],
          });
        } else {
          alert("API Failed");
        }
      });
  }
  fetchBgpDetails(id) {
    fetch(
      `http://${this.state.serverIP}:5000/configuration-management/configuration/bgp/${id}`,
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
        console.log(resp, "bgp-fetched");
        if (resp["ipi-bgp:bgp"] && resp["ipi-bgp:bgp"]["bgp-instance"]) {
          this.setState({
            bgpData: resp,
            bgpDetails: resp["ipi-bgp:bgp"]["bgp-instance"][0],
          });
        } else {
          alert("API Failed");
        }
      });
  }
  handleChange(e, id) {
    var temp = this.state.bgpDetails;
    temp["config"][id] = e.target.value;
    temp[id] = e.target.value;
    this.setState({ bgpDetails: temp });
  }
  handlePeerChange(e, id, index) {
    var temp = this.state.bgpDetails;
    if (id === "peer-address") {
      temp["peer"][index][id] = e.target.value;
      temp["peer"][index]["config"][id] = e.target.value;
    } else if (id === "peer-as") {
      temp["peer"][index]["config"][id] = e.target.value;
    }
    this.setState({ bgpDetails: temp });
  }
  interfaceList(data) {
    var dict = {};
    for (let i = 0; i < data.length; i++) {
      if (data[i]["name"].startsWith("ge")) {
        console.log(data[i].name);
        if (data[i]["ipi-if-ip:ipv4"] && data[i]["ipi-if-ip:ipv4"]["config"]) {
          dict[data[i].name] =
            data[i]["ipi-if-ip:ipv4"]["config"]["primary-ip-addr"];
        } else {
          dict[data[i].name] = "";
        }
      }
    }
    console.log(dict, "created");
  }

  removeStateAndRib(data) {
    if (!data || typeof data !== "object") {
      return data;
    }

    // Check if the object is an array
    if (Array.isArray(data)) {
      return data.map((item) => this.removeStateAndRib(item));
    }

    // Create a copy of the object without "state" and "rib" keys
    const newData = {};
    for (const key in data) {
      if (key !== "state" && key !== "rib" && key !== "peer-index") {
        newData[key] = this.removeStateAndRib(data[key]);
      }
    }

    return newData;
  }
  addAddressLocal() {
    var temp = this.state.bgpDetails;
    var namespace = { "ipi-bgp:bgp": { "bgp-instance": [] } };
    var dict = {
      afi: "",
      config: {
        afi: "",
        safi: "",
      },
      safi: "",
    };
    temp["address-family"].push(dict);
    namespace["ipi-bgp:bgp"]["bgp-instance"].push(temp);
    console.log(namespace);
    this.setState({ bgpData: namespace });
  }
  handleLocalAddressFamily(e, id, index) {
    var temp = this.state.bgpDetails;
    temp["address-family"][index][id] = e.target.value;
    temp["address-family"][index]["config"][id] = e.target.value;
    this.setState({ bgpDetails: temp });
  }
  handleRemoteAddressFamily(e, id, index) {
    const combinedValue = e.target.value;
    const [afi, safi] = combinedValue.split(",");
    console.log(combinedValue.split(","));
    this.setState((prevState) => {
      const updatedBgpDetails = { ...prevState.bgpDetails };
      updatedBgpDetails.peer[index]["address-family"][0]["afi"] = afi;
      updatedBgpDetails.peer[index]["address-family"][0]["config"]["afi"] = afi;
      updatedBgpDetails.peer[index]["address-family"][0]["safi"] = safi;
      updatedBgpDetails.peer[index]["address-family"][0]["config"]["safi"] =
        safi;
      return { bgpDetails: updatedBgpDetails };
    });
  }

  addAddressPeer() {
    var temp = this.state.bgpDetails;
    var namespace = { "ipi-bgp:bgp": { "bgp-instance": [] } };
    var dict = {
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
      config: {
        "peer-address": "",
        "peer-as": "100",
      },
      "peer-address": "",
    };
    temp.peer.push(dict);
    namespace["ipi-bgp:bgp"]["bgp-instance"].push(temp);
    console.log(namespace);
    this.setState({ bgpData: namespace });
  }
  removePeerInfo(data, index) {
    var temp = this.state.bgpDetails;
    data[index]["@nc:operation"] = "delete";
    this.setState({ bgpDetails: temp }, () => {
      console.log(this.state.bgpDetails);
      this.bgpConfiguration();
      data.splice(index, 1);
    });
  }
  bgpConfiguration() {
    this.setState({ is_fetching: true });
    var temp = this.state.bgpDetails;
    var dict = { "ipi-bgp:bgp": { "bgp-instance": [] } };
    dict["ipi-bgp:bgp"]["bgp-instance"].push(temp);
    console.log(dict);
    const a = this.removeStateAndRib(dict);
    console.log(JSON.stringify(a), "xvbshxgsakhxsgax");
    fetch(
      `http://${this.state.serverIP}:5000/configuration-management/configuration/bgp/${this.state.routerUniqueID}`,
      {
        mode: "cors",
        method: "POST",
        headers: {
          "Access-Control-Allow-Origin": "http://localhost:3000",
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(a),
      }
    )
      .then((resp) => resp.json())
      .then((resp) => {
        console.log(resp, "topology-response");
        this.setState({ is_fetching: false });
        if (resp.status && resp.status["rpc-reply"]) {
          alert("Success");
          this.fetchBgpDetails(this.state.routerUniqueID);
        } else {
          alert("Failure", resp.status.message);
        }
      });
  }

  toggleConfiguration(id) {
    if (id === "bgp") {
      this.setState({
        showBgpConfiguration: true,
        showInterfaceConfiguration: false,
      });
    } else {
      this.setState({
        showBgpConfiguration: false,
        showInterfaceConfiguration: true,
      });
    }
  }
  handleInterfaceIP(event, index) {
    var temp = this.state.interfaceList.slice(); // Create a shallow copy of the state
    var newIP = event.target.value;

    // Create a copy of the changed names array
    const changedNames = [...this.state.changedNames];

    if (!temp[index]["ipi-if-ip:ipv4"]) {
      temp[index]["ipi-if-ip:ipv4"] = {
        "@xmlns:ipi-if-ip": "http://www.ipinfusion.com/yang/ocnos/ipi-if-ip",
        config: {
          "primary-ip-addr": "",
        },
      };
    }

    temp[index]["ipi-if-ip:ipv4"]["config"]["primary-ip-addr"] = newIP;

    // Add the name of the changed interface to the array
    const interfaceName = temp[index].name;
    if (!changedNames.includes(interfaceName)) {
      changedNames.push(interfaceName);
    }

    console.log(changedNames, "changed-one");

    this.setState({
      interfaceList: temp,
      changedNames: changedNames,
    });
  }
  interfaceConfiguration() {
    this.setState({ is_fetching: true });
    const { changedNames, interfaceList } = this.state;
    var list = [];
    for (let i = 0; i < interfaceList.length; i++) {
      if (changedNames.includes(interfaceList[i].name)) {
        list.push(interfaceList[i]);
      }
    }
    var dict = { "ipi-interface:interfaces": { interface: list } };
    console.log(dict);

    fetch(
      `http://${this.state.serverIP}:5000/configuration-management/configuration/interface/${this.state.routerUniqueID}`,
      {
        mode: "cors",
        method: "POST",
        headers: {
          "Access-Control-Allow-Origin": "http://localhost:3000",
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dict),
      }
    )
      .then((resp) => resp.json())
      .then((resp) => {
        console.log(resp, "interface-response");
        this.setState({ is_fetching: false });
        if (resp.status && resp.status["rpc-reply"]) {
          alert("Success");
        } else {
          alert(resp.status.message, resp.status.status);
        }
      });
  }
  toggleActivate(data, index) {
    var temp = this.state.bgpDetails;
    console.log(data);
    data = JSON.parse(data);
    if (JSON.stringify(data["activate"]) === "[]") {
      data["activate"] = [null];
    } else {
      data["activate"] = [];
    }
    temp.peer[index]["address-family"][0]["config"] = data;
    console.log(temp);
    this.setState({ bgpDetails: temp });
  }

  refreshTopology() {
    this.setState({ is_fetching: true });
    fetch(
      `http://${this.state.serverIP}:5000/configuration-management/refresh-bgp-topology`,
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
        this.setState({ is_fetching: false });
        this.getBgpTopology();
        console.log(resp, "refresh-bgp-topology");
      });
  }

  setupGraphData(replicationCount = 1) {
    const bgpTopologyData = {
      "blr-hsr-172.24.30.146-830-ocnos-csar": {
        bgp: {
          "router-id": "3.3.3.3",
          "router-as": "100",
          peers: [
            {
              "local-interface-address": "192.168.100.2",
              "connection-state": "established",
              "remote-interface-address": "192.168.100.1",
              "remote-as": "100",
              "remote-router-id": "7.7.7.7",
              "up-time": "22:33:38",
              "remote-unique-id": "blr-hsr-172.24.30.209-830-ocnos-csar",
              "local-interface-name": "ge1",
              "remote-interface-name": "ge1",
            },
            {
              "local-interface-address": "192.168.100.4",
              "connection-state": "established",
              "remote-interface-address": "192.168.101.7",
              "remote-as": "100",
              "remote-router-id": "4.4.4.4",
              "up-time": "22:33:38",
              "remote-unique-id": "blr-hsr-172.24.30.206-830-ocnos-csar",
              "local-interface-name": "ge3",
              "remote-interface-name": "ge3",
            },
          ],
        },
      },
      "blr-hsr-172.24.30.206-830-ocnos-csar": {
        bgp: {
          "router-id": "4.4.4.4",
          "router-as": "200",
          peers: [
            {
              "local-interface-address": "192.168.101.2",
              "connection-state": "established",
              "remote-interface-address": "192.168.101.1",
              "remote-as": "100",
              "remote-router-id": "7.7.7.7",
              "up-time": "22:56:04",
              "remote-unique-id": "blr-hsr-172.24.30.209-830-ocnos-csar",
              "local-interface-name": "ge4",
              "remote-interface-name": "ge2",
            },
            {
              "local-interface-address": "192.168.101.7",
              "connection-state": "established",
              "remote-interface-address": "192.168.100.4",
              "remote-as": "100",
              "remote-router-id": "3.3.3.3",
              "up-time": "22:56:04",
              "remote-unique-id": "blr-hsr-172.24.30.146-830-ocnos-csar",
              "local-interface-name": "ge3",
              "remote-interface-name": "ge3",
            },
            {
              "local-interface-address": "192.168.102.6",
              "connection-state": "idle",
              "remote-interface-address": "192.168.102.7",
              "remote-as": "100",
              "remote-router-id": "3.3.3.3",
              "up-time": "22:33:38",
              "remote-unique-id": "blr-hsr-172.24.30.146-830-ocnos-csar",
              "local-interface-name": "xe3",
              "remote-interface-name": "xe3",
            },
          ],
        },
      },
      "blr-hsr-172.24.30.209-830-ocnos-csar": {
        bgp: {
          "router-id": "7.7.7.7",
          "router-as": "100",
          peers: [
            {
              "local-interface-address": "192.168.100.1",
              "connection-state": "established",
              "remote-interface-address": "192.168.100.2",
              "remote-as": "100",
              "remote-router-id": "3.3.3.3",
              "up-time": "22:33:42",
              "remote-unique-id": "blr-hsr-172.24.30.146-830-ocnos-csar",
              "local-interface-name": "ge1",
              "remote-interface-name": "ge1",
            },
            {
              "local-interface-address": "192.168.101.1",
              "connection-state": "established",
              "remote-interface-address": "192.168.101.2",
              "remote-as": "100",
              "remote-router-id": "4.4.4.4",
              "up-time": "22:56:04",
              "remote-unique-id": "blr-hsr-172.24.30.206-830-ocnos-csar",
              "local-interface-name": "ge2",
              "remote-interface-name": "ge4",
            },
          ],
        },
      },
    };

    const data = {
      nodes: [],
      links: [],
    };

    const addedLinks = new Set(); // To track added links

    // Create router nodes and interface nodes
    for (let replication = 1; replication <= replicationCount; replication++) {
      for (const ip in bgpTopologyData) {
        createRouterNode(ip, bgpTopologyData[ip]);
      }
    }

    console.log(data);
    this.setState({ data });

    function createRouterNode(ip, router) {
      const routerNode = {
        id: ip,
        svg: "https://symbols.getvecta.com/stencil_240/204_router.7b208c1133.svg",
        width: 60,
        height: 60,
        label: `ID:${router.bgp["router-id"]}\nAS: ${router.bgp["router-as"]}`,
        nodeType: "router",
      };
      data.nodes.push(routerNode);

      router.bgp.peers.forEach((peer) => {
        const remoteNode = bgpTopologyData[peer["remote-unique-id"]];
        if (
          remoteNode &&
          !addedLinks.has(`${ip}-${peer["remote-unique-id"]}`)
        ) {
          // Create intermediary nodes for local and remote interfaces on the link
          const localInterfaceNode = {
            id: `interface-${ip}-${peer["remote-unique-id"]}-local`,
            shape: "circle",
            label: peer["local-interface-name"],
            nodeType: "interface",
          };

          const remoteInterfaceNode = {
            id: `interface-${ip}-${peer["remote-unique-id"]}-remote`,
            shape: "circle",
            label: peer["remote-interface-name"],
            nodeType: "interface",
          };

          data.nodes.push(localInterfaceNode, remoteInterfaceNode);

          // Create links between router, local interface, and remote interface
          const linkBetweenRouterAndLocal = {
            source: ip,
            target: localInterfaceNode.id,
          };

          const linkBetweenLocalAndRemote = {
            source: localInterfaceNode.id,
            target: remoteInterfaceNode.id,
          };

          const linkBetweenRemoteAndRouter = {
            source: remoteInterfaceNode.id,
            target: peer["remote-unique-id"],
          };

          data.links.push(
            linkBetweenRouterAndLocal,
            linkBetweenLocalAndRemote,
            linkBetweenRemoteAndRouter
          );

          // Mark the link as added to avoid duplicates
          addedLinks.add(`${ip}-${peer["remote-unique-id"]}`);
          addedLinks.add(`${peer["remote-unique-id"]}-${ip}`);
        }
      });
    }
  }

  render() {
    const { bgpDetails, interfaceList } = this.state;
    const afiSafiList = [];
    if (bgpDetails && bgpDetails["address-family"]) {
      bgpDetails["address-family"].forEach((family) => {
        if (family && family.afi && family.safi) {
          afiSafiList.push({
            afi: family.afi,
            safi: family.safi,
          });
        }
      });
    }
    return (
      <div style={{ background: "rgb(244, 247, 254)" }}>
       
        <div>
          <button
            className="refreshTopology"
            style={{ top: "30%" }}
            onClick={() => this.refreshTopology()}
          >
            Refresh Topology
            <span style={{ marginLeft: "4px" }}>
              <img src={refresh} alt="" width={20} />
            </span>
          </button>
        </div >
        <div   style={{position:'absolute', top: "30%" }}> <DropdownButton
          id="network-dropdown"
          title={"Choose Topology Type"}
          // onSelect={this.handleSelectNetwork}
          drop="down"
          style={{ zIndex: 1000 }}
          className="custom-dropdown"
        >
          {/* {["site-to-site-vpn", "remote-access-vpn"].map((networkType, optionIndex) => (
                                            <Dropdown.Item key={optionIndex} eventKey={networkType}>
                                            {networkType}
                                            </Dropdown.Item>
                     
                     ))} */}
        </DropdownButton></div>
       
        {this.state.is_fetching === true ? <Loading /> : null}
        <div style={{ height: "800px" }}>
          <ForceGraph2D
            graphData={this.state.data}
            nodeAutoColorBy="group"
            // linkCurvature={0.2}
            nodeLabel={(node) => {
              const labelHTML = `<div class="custom-node-label">ID: ${node.id}<br/>Label: ${node.label}<br>nodeType: ${node.nodeType}</div>`;
              return labelHTML;
            }}
            nodeCanvasObject={(node, ctx, globalScale) => {
              const label = node.label || "";
              const fontSize = 12 / globalScale;
              ctx.font = `${fontSize}px Sans-Serif`;
              const textWidth = ctx.measureText(label).width;
              const radius = Math.sqrt(node.size || 1) + 4;
              const x = node.x - textWidth / 2;

              // Adjust the y position to place the label below the router
              const y = node.y + radius + fontSize + 4; // 4 is a padding

              // Draw node label
              ctx.fillStyle = "black";
              ctx.fillText(label, x, y);

              if (node.nodeType === "router") {
                // Draw router icon only for router nodes
                const img = new Image();
                img.src =
                  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTp81mWS19onK_qho3S4frbRJot-db5BFXuFd_QLD39AbxmApCT6dl9BuuScTi-3lL5gd4&usqp=CAU";
                const iconRadius = Math.sqrt(node.size || 1) + 10; // Adjust the size (10 in this example)

                ctx.drawImage(
                  img,
                  node.x - iconRadius,
                  node.y - iconRadius,
                  iconRadius * 2,
                  iconRadius * 2
                );
              } else {
                ctx.fillStyle = "grey"; // Adjust the color as needed
                ctx.beginPath();
                const circleRadius = Math.sqrt(node.size || 1) + 1; // Adjust the size (10 in this example)

                ctx.arc(node.x, node.y, circleRadius, 0, 2 * Math.PI);
                ctx.fill();
              }
            }}
            onNodeClick={this.handleRouterNodeClick}
          />
          {/* <NetworkGraph data={this.state.data}></NetworkGraph> */}
        </div>
        {this.state.openConfigurationTab ? (
          <div className="topologyConfigTab">
            <div className="bgpLeftPanel">
              <div
                className="bgpLeftPanelHeader"
                onClick={() => this.toggleConfiguration("bgp")}
              >
                BGP Configuration
              </div>
              <div
                className="bgpLeftPanelHeader"
                onClick={() => this.toggleConfiguration("interface")}
              >
                Interface Configuration
              </div>
            </div>
            <div className="bgpRightPanel">
              <img
                style={{ position: "absolute", right: "3%" }}
                onClick={() => this.setState({ openConfigurationTab: false })}
                src={close}
                alt=""
                width={10}
              />

              {this.state.showBgpConfiguration ? (
                <div>
                  <div style={{ margin: "2%" }}>
                    <div className="BgpConfigRightTopHeader">
                      Local BGP Options:
                    </div>
                    <div style={{ display: "flex" }}>
                      <div className="bgpConfigParameterLabel">Local AS:</div>
                      <div>
                        <input
                          value={
                            bgpDetails ? bgpDetails["config"]["bgp-as"] : null
                          }
                          onChange={(e) => this.handleChange(e, "bgp-as")}
                        />
                      </div>
                    </div>
                    <div style={{ display: "flex" }}>
                      <div className="bgpConfigParameterLabel">Router ID:</div>
                      <div>
                        <input
                          value={
                            bgpDetails
                              ? bgpDetails["config"]["router-id"]
                              : null
                          }
                          onChange={(e) => this.handleChange(e, "router-id")}
                        />
                      </div>
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
                        <tr
                          style={{ backgroundColor: "#e5e8ff", color: "black" }}
                        >
                          <th>AFI</th>
                          <th>SAFI</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bgpDetails && bgpDetails["address-family"]
                          ? bgpDetails["address-family"].map((item, index) => (
                              <tr className="trPerf" key={index}>
                                <td className="tdPerf">
                                  <select
                                    className="addressFamilyDropdown"
                                    value={item.config["afi"]}
                                    onChange={(e) =>
                                      this.handleLocalAddressFamily(
                                        e,
                                        "afi",
                                        index
                                      )
                                    }
                                  >
                                    {this.state.afiTypes.map((item) => (
                                      <option value={item} key={item}>
                                        {item}
                                      </option>
                                    ))}
                                  </select>
                                </td>
                                <td className="tdPerf">
                                  <select
                                    className="addressFamilyDropdown"
                                    value={item.config["safi"]}
                                    onChange={(e) =>
                                      this.handleLocalAddressFamily(
                                        e,
                                        "safi",
                                        index
                                      )
                                    }
                                  >
                                    {this.state.safiTypes.map((item) => (
                                      <option value={item} key={item}>
                                        {item}
                                      </option>
                                    ))}
                                  </select>
                                </td>
                              </tr>
                            ))
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
                        <tr
                          style={{ backgroundColor: "#e5e8ff", color: "black" }}
                        >
                          <th>Remote IP</th>
                          <th>Remote AS</th>
                          <th>Address Family</th>
                          <th>Activate</th>
                          <th>Remove</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bgpDetails && bgpDetails.peer
                          ? bgpDetails.peer.map((item, index) => (
                              <tr className="trPerf" key={index}>
                                <td
                                  className="tdPerf"
                                  style={{
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                  }}
                                >
                                  <input
                                    className="tableInput"
                                    type="text"
                                    value={item.config["peer-address"]}
                                    onChange={(e) =>
                                      this.handlePeerChange(
                                        e,
                                        "peer-address",
                                        index
                                      )
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
                                    value={`${item["address-family"][0]["afi"]},${item["address-family"][0]["safi"]}`}
                                    onChange={(e) =>
                                      this.handleRemoteAddressFamily(
                                        e,
                                        "combined",
                                        index
                                      )
                                    }
                                  >
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
                                </td>

                                <td className="tdPerf">
                                  <div
                                    style={{
                                      marginTop: "2%",
                                      display: "flex",
                                      alignItems: "center",
                                    }}
                                    onClick={() =>
                                      this.toggleActivate(
                                        JSON.stringify(
                                          item["address-family"][0]["config"]
                                        ),
                                        index
                                      )
                                    }
                                  >
                                    <img
                                      src={
                                        JSON.stringify(
                                          item["address-family"][0]["config"][
                                            "activate"
                                          ]
                                        ) === "[null]"
                                          ? active
                                          : inactive
                                      }
                                      alt=""
                                      width={20}
                                    />
                                  </div>
                                </td>
                                <td
                                  onClick={() =>
                                    this.removePeerInfo(bgpDetails.peer, index)
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
                  <div>
                    <buton
                      className="configureTopology"
                      onClick={() => this.bgpConfiguration()}
                    >
                      Apply
                    </buton>
                  </div>
                </div>
              ) : null}

              {this.state.showInterfaceConfiguration ? (
                <div style={{ margin: "2%" }}>
                  <div className="BgpConfigRightTopHeader">
                    Interface Configuration
                  </div>
                  <table className="user_table">
                    <thead className="user_table_head">
                      <tr
                        style={{ backgroundColor: "#e5e8ff", color: "black" }}
                      >
                        <th>Interface</th>
                        <th>Primary IP Address</th>
                      </tr>
                    </thead>
                    <tbody>
                      {interfaceList
                        ? interfaceList.map((item, index) => (
                            <tr className="trPerf" key={index}>
                              <td className="tdPerf">{item.name}</td>
                              <td className="tdPerf">
                                <input
                                  type="text"
                                  value={
                                    item["ipi-if-ip:ipv4"]
                                      ? item["ipi-if-ip:ipv4"]["config"][
                                          "primary-ip-addr"
                                        ]
                                      : "not configured"
                                  }
                                  onChange={(e) =>
                                    this.handleInterfaceIP(e, index)
                                  }
                                />
                              </td>
                            </tr>
                          ))
                        : null}
                    </tbody>
                  </table>
                  <div>
                    <buton
                      className="configureTopology"
                      onClick={() => this.interfaceConfiguration()}
                    >
                      Apply
                    </buton>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    );
  }
}

export default Topology;
