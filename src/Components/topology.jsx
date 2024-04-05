import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const NetworkTopology = ({ topologyData }) => {
  const d3Container = useRef(null);

  useEffect(() => {
    if (d3Container.current && topologyData) {
      const nodesMap = new Map();
      const links = [];

      // Process the topology data to create nodes and links
      Object.entries(topologyData).forEach(([_, routerData]) => {
        const routerId = routerData.bgp['router-id'];

        if (!nodesMap.has(routerId)) {
          nodesMap.set(routerId, { id: routerId });
        }

        routerData.bgp.peers.forEach(peer => {
          links.push({
            source: routerId,
            target: peer['remote-router-id'],
            localInterface: peer['local-interface-name'],
            remoteInterface: peer['remote-interface-name'],
            state: peer['connection-state']
          });

          if (!nodesMap.has(peer['remote-router-id'])) {
            nodesMap.set(peer['remote-router-id'], { id: peer['remote-router-id'] });
          }
        });
      });

      const nodes = Array.from(nodesMap.values());

      // Set up D3 visualization
      const svg = d3.select(d3Container.current);
      svg.selectAll('*').remove();

      const width = 800, height = 600;

      // Layout calculations (this should be adjusted based on your layout requirements)
      nodes.forEach((node, index) => {
        node.x = (width / (nodes.length + 1)) * (index + 1);
        node.y = height / 2;
      });

      // Draw links
      svg.selectAll(".link")
        .data(links)
        .enter().append("line")
        .attr("class", "link")
        .attr("x1", d => nodesMap.get(d.source).x)
        .attr("y1", d => nodesMap.get(d.source).y)
        .attr("x2", d => nodesMap.get(d.target).x)
        .attr("y2", d => nodesMap.get(d.target).y)
        .attr("stroke", d => d.state === "established" ? "green" : "blue");

      // Draw nodes
      svg.selectAll(".node")
        .data(nodes)
        .enter().append("circle")
        .attr("class", "node")
        .attr("cx", node => node.x)
        .attr("cy", node => node.y)
        .attr("r", 5)
        .attr("fill", "red");

      console.log(nodes)
    }
  }, [topologyData]);

  return <svg ref={d3Container} width={800} height={600} />;
}

export default NetworkTopology;
