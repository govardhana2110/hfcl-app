import React, { useEffect } from "react";
import router from "../Images/roundRouter.ico";
import cloud from "../Images/cloud.ico";
import laptop from "../Images/laptop-round.ico";

import * as d3 from "d3";

const NetworkGraph = ({ data, routerClick }) => {
  const [graphData, setGraphData] = React.useState({
    nodes: [],
    connections: [],
  });

  const nodeDataFunction = () => {
    let tempArr = [];
    let tempConnections = [];
    let typeObj = [];
    Object.keys(data).map((key) => {
      if (!tempArr.includes(key)) tempArr.push(key);
      data[key][0].peers.map((item) => {
        let obj = {};
        if (item["type"] && item["ilmType"]["type"] !== "ilm") {
          obj = {
            source: key,
            target: item["remote-unique-id"],
            localInterFaceAddress: item["local-interface-address"],
            remoteIntefaceAddress: item["remote-interface-address"],
            localInterfaceName: item["local-interface-name"],
            remoteInterfaceName: item["remote-interface-name"],
            remoteIdentifier: item["remote-identifier"],
            upTime: item["up-time"],
            connectionState: item["connection-state"],
            remoteAs: item["remote-as"],
            remoteUniqueId: item["remote-unique-id"],
            remoteRouterId: item["remote-router-id"],
            type: { ...item["type"] },
          };
          typeObj[key] = {};
          typeObj[key]["type"] = item["type"];
          typeObj[key]["ilmType"] = {};
          if (!tempArr.includes(item["remote-unique-id"]))
            tempArr.push(item["remote-unique-id"]);
        } else {
          if (item["ilmType"] && item["ilmType"]["type"] === "ilm") {
            obj = {
              source: item["fec"],
              target: key,
              localInterFaceAddress: item["local-interface-address"],
              remoteIntefaceAddress: "",
              localInterfaceName: item["local-interface-name"],
              remoteInterfaceName: "",
              ilmType: { type: "ilm" },
            };
            typeObj[item["fec"]] = {};
            typeObj[item["fec"]]["ilmType"] = { type: "ilm" };
            typeObj[item["fec"]]["type"] = {};
          }
          if (!tempArr.includes(item["fec"])) tempArr.push(item["fec"]);
        }
        tempConnections.push(obj);
      });
    });
    const tempNodes = tempArr.map((item) => ({
      id: item,
      typeData: { ...typeObj[item] },
    }));
    setGraphData((prev) => ({ ...prev, nodes: [...tempNodes] }));
    uniqueConnections(tempConnections);
  };

  const uniqueConnections = (tempConnections) => {
    console.log(tempConnections);

    let uniqueConnectionsArr = [];
    for (let i = 0; i < tempConnections.length; i++) {
      let currentItem = tempConnections[i];
      let isDuplicate = false;
      for (let j = 0; j < uniqueConnectionsArr.length; j++) {
        let existingItem = uniqueConnectionsArr[j];
        if (
          (currentItem.source === existingItem.source &&
            currentItem.target === existingItem.target &&
            currentItem.localInterfaceName ===
              existingItem.localInterfaceName &&
            currentItem.remoteInterfaceName ===
              existingItem.remoteInterfaceName) ||
          (currentItem.source === existingItem.target &&
            currentItem.target === existingItem.source &&
            currentItem.localInterfaceName ===
              existingItem.remoteInterfaceName &&
            currentItem.remoteInterfaceName ===
              existingItem.localInterfaceName &&
            existingItem["type"]["name"] === currentItem["type"]["name"])
        ) {
          isDuplicate = true;
          break;
        }
      }
      if (!isDuplicate) {
        uniqueConnectionsArr.push(currentItem);
      }
    }

    checkMultiple(uniqueConnectionsArr);
  };

  const checkMultiple = (tempArr) => {
    const updatedData = tempArr.map((obj, index) => {
      const reverseConnection = tempArr.find(
        (otherObj) =>
          obj.source === otherObj.target && obj.target === otherObj.source
      );
      let curvature = 0.7;
      if (reverseConnection) {
        curvature = curvature + 0.7;
        return {
          ...obj,
          overlap: curvature,
          hasMultipleConnections: true,
        };
      }
      return obj;
    });
    console.log(updatedData);
    setGraphData((prev) => ({ ...prev, connections: [...updatedData] }));
  };

  React.useEffect(() => {
    nodeDataFunction();
  }, [data]);

  useEffect(() => {
    const width = 1300;
    const height = 400;
    d3.select("#graph-container").html("");
    const svg = d3
      .select("#graph-container")
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("backgroundColor", "white");
    const graph = {
      nodes: graphData.nodes.map((node) => ({
        id: node.id,
        details: node.id,
        typeData: node.typeData,
      })),

      links: graphData.connections.map((conn) => ({
        source: graphData.nodes.findIndex((node) => node.id === conn.source),
        target: graphData.nodes.findIndex((node) => node.id === conn.target),
        localInterface: conn.localInterfaceName,
        remoteInterface: conn.remoteInterfaceName,
        locIntefaceAdd: conn.localInterFaceAddress,
        remInterfaceAdd: conn.remoteIntefaceAddress,
        connectionState: conn.connectionState,
        remoteAs: conn.remoteAs,
        remoteRouterId: conn.remoteRouterId,
        remoteUniqueId: conn.remoteGroup,
        overlap: conn.overlap || 0,
        hasMultipleConnections: conn.hasMultipleConnections || false,
        type: { ...conn["type"] },
        ilmType: { ...conn["ilmType"] },
      })),
    };

    const color = d3.scaleOrdinal(d3.schemeCategory10);
    const simulation = d3
      .forceSimulation()
      .force(
        "link",
        d3
          .forceLink()
          .id((d) => d.index)
          .distance(
            graphData.nodes.length <= 5
              ? 200
              : graphData.nodes.length <= 10
              ? 100
              : 75
          )
      )
      .force("charge", d3.forceManyBody().strength(-500))
      .force("center", d3.forceCenter(width / 2, height / 2));

    const link = svg
      .append("g")
      .attr("class", "links")
      .selectAll("path")
      .data(graph.links)
      .enter()
      .append("path")
      .style("stroke", (d) =>
        d.type["name"] === "isis"
          ? "#169114"
          : d.type["name"] === "mp-bgp"
          ? "red"
          : d.type["name"] === "mpls"
          ? "#fcba03"
          : d.type["name"] === "ldp"
          ? "blue"
          : "#02211f"
      )
      .style("fill", "none")
      .attr("cursor", "pointer")
      .style("marker-start", (d, i) => `url(#marker-${i})`)
      .style("marker-end", (d, i) => `url(#marker-${i})`)
      .attr("stroke-width", 1.5);

    link
      .append("title")
      // .text(
      //   (d) =>
      //     `Link Type: Local: ${d.localInterface}, Remote: ${d.remoteInterface}, type: ${d.type["name"]}`
      // );
      .text((d) => {
        const typeDetails =
          d &&
          Object.keys(d)
            .map((key) => {
              if (
                key !== "source" &&
                key !== "target" &&
                key !== "ilmType" &&
                key !== "type" &&
                key !== "hasMultipleConnections" &&
                key !== "overlap" &&
                key !== "remoteUniquId"
              ) {
                return `${key}: ${d[key]}`;
              } else {
                return null; // Filter out unwanted keys
              }
            })
            .filter((item) => item !== null) // Remove null entries
            .join("\n");

        return typeDetails !== "" ? typeDetails : "";
      });

    const handler = d3.drag();
    const dragstarted = (event, d) => {
      event.sourceEvent.stopPropagation();
      if (!event.active) {
        simulation.alphaTarget(0.3).restart();
      }
      d.fx = d.x;
      d.fy = d.y;
    };
    const dragged = (event, d) => {
      d.fx = event.x;
      d.fy = event.y;
      d.fixed = true;
    };
    const dragended = (event, d) => {
      if (!event.active) {
        simulation.alphaTarget(0);
      }
      d.fx = null;
      d.fy = null;
    };

    const node = svg
      .append("g")
      .attr("class", "nodes")
      .selectAll("g")
      .data(graph.nodes)
      .enter()
      .append("g")
      .call(
        handler
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended)
      )
      .on(
        "click",
        (event, d) =>
          routerClick &&
          routerClick(event, d)
      );
    node
      .append("image")
      .attr("href", (d) =>
        d["typeData"] &&
        d["typeData"]["ilmType"] &&
        Object.keys(d["typeData"]["ilmType"]).length > 0
          ? laptop
          : router
      )
      .attr("x", -16)
      .attr("y", -16)
      .attr("width", 30)
      .attr("height", 30)
      .attr("backGround", "grey")
      .attr("cursor", "pointer");

    const dotRadius = 2.2;
    const localGroup = svg.append("g").attr("class", "dots");
    const remoteGroup = svg.append("g").attr("class", "dots");
    const localIntefaceNodes = localGroup
      .selectAll(".dot")
      .data(graph.links)
      .enter()
      .append("circle")
      .attr("class", "dot")
      .attr("r", dotRadius)
      .attr("cursor", "pointer")
      .style("fill", "red");

    const remoteInterfaceNodes = remoteGroup
      .selectAll(".dot")
      .data(graph.links)
      .enter()
      .append("circle")
      .attr("class", "dot")
      .attr("r", (d) =>
        d["ilmType"] && Object.keys(d["ilmType"]).length > 0 ? null : dotRadius
      )
      .attr("cursor", "pointer")
      .style("fill", "red");
    const tooltip = svg
      .append("g")
      .attr("class", "tooltip")
      .style("opacity", 0);

    tooltip
      .append("rect")
      .attr("width", 150)
      .attr("height", 60)
      .attr("rx", 10)
      .style("fill", "#0000004f")
      .style("stroke", "black");

    tooltip
      .append("text")
      .data(graph.nodes)
      .attr("x", 5)
      .attr("y", 10)
      .style("font-size", "10px");
    // .append('title').text((d) =>{  console.log(d)})

    const ticked = () => {
      link.attr("d", (d) => {
        if (d.source === d.target) {
          const x1 = d.source.x;
          const y1 = d.source.y;
          let x2 = d.target.x;
          let y2 = d.target.y;
          if (x1 === x2 && y1 === y2) {
            const dx = x2 - x1,
              dy = y2 - y1,
              dr = Math.sqrt(dx * dx + dy * dy);
            let drx = dr;
            let dry = dr;
            const xRotation = 0; // degrees
            const largeArc = 1; // needs to be 1
            const sweep = 1; // 1 or 0, Change sweep to change orientation of loop.
            drx = 20;
            dry = 20;
            x2 = x2 + 1;
            y2 = y2 + 1;
            // todo fix the path so it will be adjust to the arrow
            return (
              "M" +
              x1 +
              "," +
              y1 +
              "A" +
              drx +
              "," +
              dry +
              " " +
              xRotation +
              "," +
              largeArc +
              "," +
              sweep +
              " " +
              x2 +
              "," +
              y2
            );
          } else {
            const mid = [
              (d.source.x + d.target.x) / 2,
              (d.source.y + d.target.y) / 2,
            ];
            const distance = Math.sqrt(
              Math.pow(d.target.x - d.source.x, 2) +
                Math.pow(d.target.y - d.source.y, 2)
            );
            const slopeX = (d.target.x - d.source.x) / distance;
            const slopeY = (d.target.y - d.source.y) / distance;
            const curveSharpness = d.overlap * 10; // should be derived for the number of overlapping connections.
            mid[0] += curveSharpness * slopeY;
            mid[1] -= curveSharpness * slopeX;
          }
        } else {
          if (d.hasMultipleConnections) {
            const curveSharpness = d.overlap * 20;
            const sourceX = d.source.x;
            const sourceY = d.source.y;
            const targetX = d.target.x;
            const targetY = d.target.y;
            const midX = (sourceX + targetX) / 2;
            const midY = (sourceY + targetY) / 2;
            const dx = targetX - sourceX;
            const dy = targetY - sourceY;
            const normalLength = Math.sqrt(dx * dx + dy * dy);
            const normalX = dx / normalLength;
            const normalY = dy / normalLength;
            const curveX = midX + curveSharpness * normalY;
            const curveY = midY - curveSharpness * normalX;

            return curveX && curveY
              ? `M${sourceX},${sourceY} Q${curveX},${curveY} ${targetX},${targetY}`
              : `M ${d.source.x} ${d.source.y} L ${d.target.x} ${d.target.y}`;
          } else {
            return `M ${d.source.x} ${d.source.y} L ${d.target.x} ${d.target.y}`;
          }
        }
      });

      const dotDistance = 0.5; // Adjust this value to set the distance between dots

      // Update dot positions for both dots and dots1
      localIntefaceNodes
        .attr("cx", (d, i) => {
          if (d.hasMultipleConnections) {
            const length = link.nodes()[i].getTotalLength();
            const t = 4 / 20; // Use t parameter to get the point along the curve
            const point = link.nodes()[i].getPointAtLength(t * length);
            return (
              point.x +
              dotDistance *
                Math.cos(Math.atan2(point.y - d.target.y, point.x - d.target.x))
            );
          } else {
            const ratio = 0.8; // Place dot at the middle for straight lines
            return d.source.x + (d.target.x - d.source.x) * ratio;
          }
        })
        .attr("cy", (d, i) => {
          if (d.hasMultipleConnections) {
            const length = link.nodes()[i].getTotalLength();
            const t = 4 / 20; // Use t parameter to get the point along the curve
            const point = link.nodes()[i].getPointAtLength(t * length);
            return (
              point.y +
              dotDistance *
                Math.sin(Math.atan2(point.y - d.target.y, point.x - d.target.x))
            );
          } else {
            const ratio = 0.8; // Place dot at the middle for straight lines
            return d.source.y + (d.target.y - d.source.y) * ratio;
          }
        })
        .append("title")
        .text(
          (d) =>
            `Interface Name: ${d.localInterface}\nInterface Address:${d.locIntefaceAdd}`
        );

      remoteInterfaceNodes
        .attr("cx", (d, i) => {
          if (d.hasMultipleConnections) {
            const length = link.nodes()[i].getTotalLength();
            const t = 4 / 22; // Use t parameter to get the point along the curve
            const point = link.nodes()[i].getPointAtLength((1 - t) * length); // Use (1 - t) to get the other end
            return (
              point.x +
              dotDistance *
                Math.cos(Math.atan2(point.y - d.source.y, point.x - d.source.x))
            );
          } else {
            const ratio = 0.8; // Place dot at the middle for straight lines
            return d.target.x + (d.source.x - d.target.x) * ratio;
          }
        })
        .attr("cy", (d, i) => {
          if (d.hasMultipleConnections) {
            const length = link.nodes()[i].getTotalLength();
            const t = 4 / 22; // Use t parameter to get the point along the curve
            const point = link.nodes()[i].getPointAtLength((1 - t) * length); // Use (1 - t) to get the other end
            return (
              point.y +
              dotDistance *
                Math.sin(Math.atan2(point.y - d.source.y, point.x - d.source.x))
            );
          } else {
            const ratio = 0.8; // Place dot at the middle for straight lines
            return d.target.y + (d.source.y - d.target.y) * ratio;
          }
        })
        .append("title")
        .text(
          (d) =>
            `Interface Name: ${d.remoteInterface}\nInterface Address:${d.remInterfaceAdd}`
        );

      node
        .attr("transform", (d) => `translate(${d.x},${d.y})`)
        .append("title")

        .text((d) => {
          const typeData =
            d.typeData &&
            (d.typeData["ilmType"] || d.typeData["type"]) &&
            Object.keys(d.typeData["ilmType"]).length > 0
              ? d.typeData["ilmType"]
              : d.typeData["type"];
          const typeDetails =
            typeData &&
            Object.keys(typeData)
              .map((key) => `${key}: ${typeData[key]}`)
              .join("\n");
          return typeDetails
            ? `ID: ${d.details}\n${typeDetails}`
            : `ID: ${d.details}`;
        });
    };
    simulation.nodes(graph.nodes).on("tick", ticked);
    simulation.force("link").links(graph.links);
    const handleMouseOver = (d) => {
      tooltip
        .transition()
        .duration(200)
        .style("opacity", 0.9)
        .attr("transform", `translate(${d.x - 80},${d.y - 80})`); // Adjust positioning
      // .text((d) => `${d.id}`);

      tooltip.select("text").text(d.id);
    };
    const handleMouseOut = () => {
      tooltip.transition().duration(500).style("opacity", 0);
    };
  }, [graphData]);

  return (
    <div id="graph-container">
      {/* Render any additional components, such as legend or information panel */}
    </div>
  );
};

export default NetworkGraph;
