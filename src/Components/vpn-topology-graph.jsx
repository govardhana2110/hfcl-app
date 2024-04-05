import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import routerIcon from '../Images/router-icon.png';
const TopologyGraph = ({ data }) => {
  const svgRef = useRef();

  useEffect(() => {
    d3.select(svgRef.current).selectAll('*').remove();
    const svg = d3.select(svgRef.current)
    .attr('width', 1600) // Increase width
    .attr('height', 1200); // Increase height


    const width = +svg.attr('width');
    const height = +svg.attr('height');

    const simulation = d3.forceSimulation()
    .force('link', d3.forceLink().id(d => d.id).distance(200)) // Increase link distance
    .force('charge', d3.forceManyBody().strength(-300)) // Adjust charge strength
    .force('center', d3.forceCenter(width / 2, height / 2));
  

    const nodes = Object.keys(data).map(key => ({ id: key, ...data[key] }));

    const links = nodes.reduce((acc, node) => {
      if (node.peers) {
        return [
          ...acc,
          ...node.peers
            .map(peer => ({
              source: node.id,
              target: peer["remote-unique-id"],
              interfaceName: peer['local-interface-name'],
              connection: node.id + "_" + peer["remote-unique-id"]
            }))
            .filter(link => {
              // Check for duplicates
              const isDuplicate = acc.some(existingLink => {
                return (
                  (existingLink.source === link.source &&
                    existingLink.target === link.target &&
                    existingLink.interfaceName === link.interfaceName) ||
                  (existingLink.source === link.target &&
                    existingLink.target === link.source &&
                    existingLink.interfaceName === link.interfaceName)
                );
              });
    
              return !isDuplicate;
            })
        ];
      }
      return acc;
    }, []);
    
    simulation.nodes(nodes);
    simulation.force('link').links(links);

  
    const initSimulation = d3.forceSimulation()
    .force('center', d3.forceCenter(width / 2, height / 2));

    initSimulation.nodes(nodes);
    for (let i = 0; i < 500; ++i) initSimulation.tick();
    initSimulation.stop();

    const node = svg.append('g')
      .attr('class', 'nodes')
      .selectAll('g')
      .data(nodes)
      .enter().append('g')
      .attr('transform', d => `translate(${d.x},${d.y})`)

    node.append('image')
      .attr('href', routerIcon) 
      .attr('x', -16)
      .attr('y', -16)
      .attr('width', 32)
      .attr('height', 32);

      const nodeLabels = node.append('text')
      .text(d => d.id)
      .attr('dy', '0.35em')
      .style('opacity', 1)
      .style('pointer-events', 'none'); // Prevent labels from blocking mouse events
  
  // Position the labels slightly away from the nodes
  nodeLabels.append('tspan').text(d => d.id);
  
    
    const localInterfaceNode = svg.append('g')
      .attr('class', 'local-interface-nodes')
      .selectAll('circle')
      .data(links)
      .enter().append('circle')
      .attr('r', 2.5)
      .attr('fill', 'red');

      localInterfaceNode.append('text') // Append text element for interface name
      .text(d => d.interfaceName)
      .attr('x', 5) // Adjust positioning as needed
      .attr('y', 5) // Adjust positioning as needed
      .style('font-size', '100px')
      .style('opacity', 1); 
      
    const remoteInterfaceNode = svg.append('g')
      .attr('class', 'remote-interface-nodes')
      .selectAll('circle')
      .data(links)
      .enter().append('circle')
      .attr('r', 2.5)
      .attr('fill', 'red');
    

    simulation.on('tick', () => {
      const updatedLinks = links.map(link => ({
          ...link,
          multipleConnections: hasMultipleLinks(link.connection, links),
      }));      
      const link = svg.selectAll('.link')
          .data(updatedLinks, d => d.connection);
      
      link.enter().append('path')
          .attr('class', 'link');
  
      link.merge(link)
          .attr('d', d => {      
              if (d.multipleConnections) {
                  const sourceX = d.source.x;
                  const sourceY = d.source.y;
                  const targetX = d.target.x;
                  const targetY = d.target.y;
            
                  const dx = targetX - sourceX;
                  const dy = targetY - sourceY;
                  const dr = Math.sqrt(dx * dx + dy * dy);
                  const drx = dr * 0.85; 
                  const dry = dr * 0.85; 
                  const sweepFlag = 1; 
            
                  return `M${sourceX},${sourceY}A${drx},${dry},0,0,${sweepFlag},${targetX},${targetY}`;
              } else {
                  return `M ${d.source.x} ${d.source.y} L ${d.target.x} ${d.target.y}`;
              }
          })
          .attr('stroke', d => d.multipleConnections ? 'green' : 'black')
          .attr('fill', 'none');
      
      
      localInterfaceNode
          .attr('cx', d => {
              if (d.multipleConnections) {
                  console.log("Inside if");
                  const ratio = 0.2; 
                  return d.source.x + (d.target.x - d.source.x) * ratio;
              } else {
                  const ratio = 0.2; 
                  return d.source.x + (d.target.x - d.source.x) * ratio;
              }
          })
          .attr('cy', d => {
              const ratio = 0.2; 
              return d.source.y + (d.target.y - d.source.y) * ratio;
          });
  
      remoteInterfaceNode
          .attr('cx', d => {
              const ratio = 0.8;
              return d.source.x + (d.target.x - d.source.x) * ratio;
          })
          .attr('cy', d => {
              const ratio = 0.8;
              return d.source.y + (d.target.y - d.source.y) * ratio;
          });
  
      node
          .attr('transform', d => `translate(${d.x},${d.y})`)
          .attr('cx', d => d.x)
          .attr('cy', d => d.y);
      
      // Update node label positions
      nodeLabels
          .attr('x', d => d.x)
          .attr('y', d => d.y)
          .style('opacity', 2); // Make labels visible
  });
  

    const hasMultipleLinks = (connection, links) => {
      let count = 0;
      for (const link of links) {
        if (link.connection === connection) {
          count++;
          if (count > 1) {
            return true;
          }
        }
      }
      return false;
    };
    


    return () => {
      simulation.stop();
    };
  }, [data]);

  return <svg ref={svgRef}></svg>;
};

export default TopologyGraph;
