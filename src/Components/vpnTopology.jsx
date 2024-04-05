import React from 'react';
import TopologyGraph from './vpn-topology-graph'; 
import * as d3 from 'd3';
import NetworkGraph from './sampleD3';

class VpnTopology extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      serverIP: process.env.REACT_APP_CLIENT_IP,
      deviceID: null,
      topologyData: {
        "blr-hsr-172.24.30.138-830-ocnos-csar": {
            "peers": [
                {
                    "local-interface-address": "4.4.4.1",
                    "local-interface-name": "ge1",
                    "remote-identifier": "8.8.8.8",
                    "remote-interface-address": "4.4.4.2",
                    "remote-interface-name": "ge1",
                    "remote-unique-id": "blr-hsr-172.24.30.148-830-ocnos-csar",
                    "up-time": "1d04h34m"
                }
                ,{
                    "local-interface-address": "3.4.4.1",
                    "local-interface-name": "xe1",
                    "remote-identifier": "8.8.8.8",
                    "remote-interface-address": "3.4.4.2",
                    "remote-interface-name": "xe7",
                    "remote-unique-id": "blr-hsr-172.24.30.148-830-ocnos-csar",
                    "up-time": "1d04h34m"
                },
                {
                  "local-interface-address": "3.4.4.8",
                  "local-interface-name": "xe4",
                  "remote-identifier": "8.8.8.8",
                  "remote-interface-address": "3.4.4.9",
                  "remote-interface-name": "xe0",
                  "remote-unique-id": "blr-hsr-172.24.30.148-830-ocnos-csar",
                  "up-time": "1d04h34m"
              },
              {
                "local-interface-address": "3.4.4.8",
                "local-interface-name": "xe9",
                "remote-identifier": "8.8.8.8",
                "remote-interface-address": "3.4.4.9",
                "remote-interface-name": "xe10",
                "remote-unique-id": "blr-hsr-172.24.30.148-830-ocnos-csar",
                "up-time": "1d04h34m"
            },  {
              "local-interface-address": "3.4.4.8",
              "local-interface-name": "xe19",
              "remote-identifier": "8.8.8.8",
              "remote-interface-address": "3.4.4.9",
              "remote-interface-name": "xe110",
              "remote-unique-id": "blr-hsr-172.24.30.148-830-ocnos-csar",
              "up-time": "1d04h34m"
          }
            ]
        },
        "blr-hsr-172.24.30.146-830-ocnos-csar": {
            "peers": [
                {
                    "local-interface-address": "2.2.2.1",
                    "local-interface-name": "ge2",
                    "remote-identifier": "8.8.8.8",
                    "remote-interface-address": "2.2.2.2",
                    "remote-interface-name": "ge2",
                    "remote-unique-id": "blr-hsr-172.24.30.148-830-ocnos-csar",
                    "up-time": "1d04h46m"
                }
            ]
        },
        "blr-hsr-172.24.30.148-830-ocnos-csar": {
            "peers": [
                {
                    "local-interface-address": "2.2.2.2",
                    "local-interface-name": "ge2",
                    "remote-identifier": "7.7.7.7",
                    "remote-interface-address": "2.2.2.1",
                    "remote-interface-name": "ge2",
                    "remote-unique-id": "blr-hsr-172.24.30.146-830-ocnos-csar",
                    "up-time": "1d04h46m"
                },
                {
                    "local-interface-address": "4.4.4.2",
                    "local-interface-name": "ge1",
                    "remote-identifier": "9.9.9.9",
                    "remote-interface-address": "4.4.4.1",
                    "remote-interface-name": "ge1",
                    "remote-unique-id": "blr-hsr-172.24.30.138-830-ocnos-csar",
                    "up-time": "1d04h33m"
                }
            ]
        }
      },
    };
    this.fetchVpnTopology=this.fetchVpnTopology.bind(this);

  }

  componentDidMount() {
    this.fetchVpnTopology();
  }

  fetchVpnTopology() {
    console.log("called")
    fetch(`http://${this.state.serverIP}:5000/configuration-management/get-l3vpn-topology`, {
      mode: 'cors',
      method: 'GET',
      headers: {
        'Access-Control-Allow-Origin': 'http://localhost:3000',
      },
    })
      .then((resp) => resp.json())
      .then((topologyData) => {
        console.log(topologyData, 'topology-VPN');
        this.setState({ topologyData });
      });
  }

  render() {
    const { topologyData } = this.state;

    return (
      <div>
        <h2>Vpn Topology</h2>
        {/* {topologyData && <TopologyGraph data={topologyData} />} */}
        {/* <NetworkGraph data={topologyData}></NetworkGraph> */}
      </div>
    );
  }
}

export default VpnTopology;
