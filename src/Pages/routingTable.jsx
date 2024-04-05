import React from 'react';
import NewHeader from '../Components/header';
import NewLeftpanel from '../Components/leftPanel';
import RoutingDetails from '../Components/forwardingTable';
class NotificationPanel extends React.Component{
    constructor(props){
        super(props);
        this.state={
            routingData:{
                "global-ftn-table": {
                    "ipv4-ftn-entry": [
                        {
                            "fec-prefix": "3.3.3.3/32",
                            "lsp-type": "primary",
                            "nhlfe-entry": [
                                {
                                    "administrative-status": "up",
                                    "out-interface": "ge1",
                                    "out-label": 1000,
                                    "state": {
                                        "administrative-status": "up",
                                        "is-stale": false,
                                        "label-op-code": "push",
                                        "nexthop-address": "12.12.12.2",
                                        "nhlfe-index": 2,
                                        "nhlfe-owner": "cli",
                                        "nhlfe-type": "primary",
                                        "oper-status": "up",
                                        "out-interface": "ge1",
                                        "out-label": 1000
                                    }
                                }
                            ],
                            "owner": "cli",
                            "state": {
                                "color": 0,
                                "fec-prefix": "3.3.3.3/32",
                                "ftn-index": 1,
                                "in-dscp-class-name": "be",
                                "is-entropy-label": false,
                                "is-primary": true,
                                "lsp-type": "primary",
                                "owner": "cli",
                                "protected-lsp-id": 0,
                                "qos-exp-bits": 0,
                                "qos-resource-id": 0,
                                "redirect-action-type": "redirect-lsp",
                                "route-distance": 0,
                                "tunnel-id": 0,
                                "tunnel-policy-name": "none"
                            },
                            "tunnel-id": 0
                        }
                    ]
                },
                "ilm-table": {
                    "ip-ilm-entry": [
                        {
                            "in-interface": "N/A",
                            "in-label": 2001,
                            "state": {
                                "fec-prefix": "0.0.0.0/0",
                                "ilm-index": 1,
                                "in-interface": "N/A",
                                "in-label": 2001,
                                "is-installed-in-fib": true,
                                "is-stale": false,
                                "is-stitched-to-ftn": false,
                                "label-op-code": "pop",
                                "owner": "cli"
                            }
                        }
                    ]
                },
                "static-lsps": {
                    "ipv4-static-ftn-entries": {
                        "ipv4-static-ftn-entry": [
                            {
                                "config": {
                                    "fec-prefix": "3.3.3.3/32",
                                    "nexthop-ip-address": "12.12.12.2",
                                    "out-interface-name": "ge1",
                                    "pushed-label": 1000
                                },
                                "fec-prefix": "3.3.3.3/32",
                                "nexthop-ip-address": "12.12.12.2",
                                "out-interface-name": "ge1",
                                "pushed-label": 1000,
                                "state": {
                                    "fec-prefix": "3.3.3.3/32",
                                    "nexthop-ip-address": "12.12.12.2",
                                    "out-interface-name": "ge1",
                                    "pushed-label": 1000
                                }
                            }
                        ]
                    },
                    "static-ilm-entries": {
                        "static-ilm-entry": [
                            {
                                "config": {
                                    "incoming-label": 2001
                                },
                                "incoming-label": 2001,
                                "pop": {
                                    "config": {
                                        "enable-pop-label": [
                                            null
                                        ]
                                    },
                                    "state": {
                                        "enable-pop-label": [
                                            null
                                        ]
                                    }
                                },
                                "state": {
                                    "incoming-label": 2001
                                }
                            }
                        ]
                    }
                }
            }
        };
        
    }
    
     
    render(){
        return(
            <div className='page' style={{height:'100%'}}>
                <div style={{display:'flex'}}>
                    <NewLeftpanel page='notification'/>
                    <div style={{flex:'4'}}>
                        <div className='head_cover'>
                            <NewHeader header_name='Notification Panel' path='Config'/>
                        </div>
                        <div className='mainContent' style={{marginLeft:'21%',marginTop:'123px',backgroundColor:'white',padding: '0.6%'}}>
                            <div>
                                <h1 style={{fontSize:'1.5rem'}}>Routing Details</h1>
                                <RoutingDetails data={this.state.routingData} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}
export default NotificationPanel;