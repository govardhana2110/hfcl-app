import React, { Component } from "react";
import { Tabs, Tab } from "react-bootstrap"; // Assuming you are using Bootstrap

class NHLFEEntry extends Component {
  render() {
    const { entry } = this.props;
    const renderedEntries = new Set();

  
    return (
      <div className="nhlfe-entry">
        <div><b>NHLFE Entry:</b> </div>
        {entry && Object.keys(entry).map((key) => {
          if (key !== 'state') {
            const entryValue = entry[key];
            const entryKey = `${key}:${entryValue}`;
  
            if (!renderedEntries.has(entryKey)) {
              renderedEntries.add(entryKey);
              return (
                <p key={entryKey}>
                  {entryKey}
                </p>
              );
            }
          }
          return null;
        })}
        
        {entry && Object.keys(entry["state"]).map((stateKey) => {
          const stateValue = entry["state"][stateKey];
          const stateEntryKey = `${stateKey}:${stateValue}`;
  
          if (!renderedEntries.has(stateEntryKey)) {
            renderedEntries.add(stateEntryKey);
            return (
              <p key={stateEntryKey}>
                {stateEntryKey}
              </p>
            );
          }
          return null;
        })}
      </div>
    );
  }
  
}

class IPv4FTNEntry extends Component {
  render() {
    const { entry } = this.props;
    const renderedEntries = new Set();
    console.log(entry.state,"hello");
    return (
      <div className="entry-container"> 
        <div><b>FEC-PREFIX ID : {entry['fec-prefix']}</b></div>
        {entry && Object.keys(entry.state).map((key) => {
          if (key !== 'state') {
            const entryValue = entry[key];
            const entryKey = `${key}:${entryValue}`;
  
            if (!renderedEntries.has(entryKey)) {
              renderedEntries.add(entryKey);
              return (
                <p key={entryKey}>
                  {entryKey}
                </p>
              );
            }
          }
          return null;
        })}
        <NHLFEEntry entry={entry?.["nhlfe-entry"]?.[0]} />
        {/* Add more details as needed */}
      </div>
    );
  }
}

class StaticLSPEntry extends Component {
  render() {
    const { entry } = this.props;

    return (
      <div className="entry-container">
        <p>FEC Prefix: {entry?.["fec-prefix"]}</p>
        <p>Nexthop IP Address: {entry?.["nexthop-ip-address"]}</p>
        <p>Out Interface Name: {entry?.["out-interface-name"]}</p>
        <p>Pushed Label: {entry?.["pushed-label"]}</p>
        {/* Add more details as needed */}
      </div>
    );
  }
}

class StaticILMEntry extends Component {
  render() {
    const { entry } = this.props;
    const renderedEntries = new Set();
  
    return (
    <div className="entry-container">
      <div className="nhlfe-entry">
        <div><b>IN-LABEL : {entry['in-label']}</b></div>
        {entry && Object.keys(entry).map((key) => {
          if (key !== 'state') {
            const entryValue = entry[key];
            const entryKey = `${key}:${entryValue}`;
  
            if (!renderedEntries.has(entryKey)) {
              renderedEntries.add(entryKey);
              return (
                <p key={entryKey}>
                  {entryKey}
                </p>
              );
            }
          }
          return null;
        })}
      
        {entry && Object.keys(entry["state"]).map((stateKey) => {
          const stateValue = entry["state"][stateKey];
          const stateEntryKey = `${stateKey}:${stateValue}`;
  
          if (!renderedEntries.has(stateEntryKey)) {
            renderedEntries.add(stateEntryKey);
            return (
              <p key={stateEntryKey}>
                {stateEntryKey}
              </p>
            );
          }
          return null;
        })}
      </div>
      </div>
    );
  }
  
}

class RoutingDetails extends Component {
  render() {
    const { data } = this.props;

    console.log("Data:", data);

    const hasData = data !== undefined && data !== null? Object.keys(data).some((key) => {
      const keyData = data[key];
      const isArrayNotEmpty = Array.isArray(keyData) && keyData.length > 0;
      const isObjectNotEmpty = typeof keyData === 'object' && keyData !== null && Object.keys(keyData).length > 0;

      return isArrayNotEmpty || isObjectNotEmpty;
    }):false

    console.log("Has Data:", hasData);

    return (
      <div className="routing-details">
        {hasData ? (
          <Tabs defaultActiveKey="global-ftn-table" id="routing-tabs">
            {data?.["global-ftn-table"]?.["ipv4-ftn-entry"]?.length > 0 && (
            <Tab eventKey="global-ftn-table" title="Global FTN Table">
              {data["global-ftn-table"]["ipv4-ftn-entry"].map((entry, index) => (
                <IPv4FTNEntry key={index} entry={entry} />
              ))}
            </Tab>
          )}

          {data?.["ilm-table"]?.["ip-ilm-entry"]?.length > 0 && (
            <Tab eventKey="ilm-table" title="ILM Table">
              {data["ilm-table"]["ip-ilm-entry"].map((entry, index) => (
                <StaticILMEntry key={index} entry={entry} />
              ))}
            </Tab>
          )}

          {data?.["static-lsps"]?.["ipv4-static-ftn-entries"]?.["ipv4-static-ftn-entry"]?.length > 0 && (
            <Tab eventKey="static-lsps" title="Static LSPs">
              {data["static-lsps"]["ipv4-static-ftn-entries"]["ipv4-static-ftn-entry"].map((entry, index) => (
                <StaticLSPEntry key={index} entry={entry} />
              ))}
            </Tab>
          )}
            
          </Tabs>
        ) : (
          <p><b>No data available.</b></p>
        )}
      </div>
    );
  }
}

export default RoutingDetails;