const bgpSchemaData = {
  "address-families": {
    "address-family": [
      {
        afi: "",
        config: { afi: "", safi: "" },
        safi: "",
        state: { afi: "", safi: "" },
      },
    ],
  },
  "address-family-vrfs": {
    "address-family-vrf": [
      {
        afi: "",
        config: { afi: "", safi: "", "vrf-name": "" },
        "route-redistribute-lists": {
          "route-redistribute-list": [
            {
              config: { "protocol-type": "" },
              "protocol-type": "",
              state: { "protocol-type": "" },
            },
          ],
        },
        safi: "",
        state: { afi: "", safi: "", "": "" },
        "vrf-name": "",
      },
    ],
  },
  "bgp-as": '',
  config: { "bgp-as": '', "router-id": "" },
  peers: {
    peer: [
      {
        "address-families": {
          "address-family": [
            {
              afi: "",
              config: { activate: [''], afi: "", safi: "" },
              "peer-index": {
                state: { mask: "", offset: '', "peer-index": '' },
              },
              safi: '',
              state: {
                activate: [''],
                "address-family-table-version": '',
                "advertisement-interval": '',
                afi: "",
                "calculated-hold-time": '',
                "calculated-keepalive": '',
                "community-count": '',
                count: '',
                counters: {
                  "as-path-count": '',
                  "keepalive-in-messages": '',
                  "keepalive-out-messages": '',
                  "open-messages-in": '',
                  "open-messages-out": '',
                  "packet-in-queue": '',
                  "packet-out-queue": '',
                  "received-packet-count": '',
                  "refresh-received-packet-count": '',
                  "refresh-sent-packet-count": '',
                  "sent-packet-count": '',
                },
                "flag-shut-down": "",
                "graceful-restart-time": '',
                "link-type": "",
                "peer-address-family-table-version": '',
                "router-id": "",
                safi: "",
                "send-prefix-count": '',
              },
            },
          ],
        },
        config: {
          "peer-address": "",
          "peer-as": "",
          "source-identifier": "",
        },
        "peer-address": "",
        state: {
          "bgp-peer-state": "",
          counters: {
            "notification-in": '',
            "notification-out": '',
            "update-message-in": '',
            "update-message-out": '',
          },
          "dynamically-configured": '',
          "peer-address": "",
          "peer-as": "",
          "peer-type": "",
          "source-identifier": "",
        },
      },
    ],
  },
  rib: {
    "address-family": [
      {
        afi: "",
        routes: {
          route: [
            {
              "network-address": "",
              "next-hop": [
                {
                  "next-hop-address": "",
                  state: {
                    "atomic-aggregate-route": '',
                    "bgp-as-path-4-byte-origin": "",
                    "bgp-as-path-string": [""],
                    "bgp-rx-path-id": '',
                    "bgp-tx-path-id": '',
                    "ecmp-multi-candidate-route": '',
                    "history-route": '',
                    "ibgp-metric-route": '',
                    "last-update-route": "'",
                    "med-flag-type-route": '',
                    "multi-installed-route": '',
                    "network-remote-address-route": "",
                    "next-hop-address": "'",
                    "nexthop-valid-route": '',
                    "originator-id-route": "",
                    "peer-network-weight": '',
                    "reflector-client-route": '',
                    "route-dampening-active": '',
                    "route-local-preference": '',
                    "route-type": "",
                    "selected-route": '',
                    "stale-route": '',
                    "valid-route": '',
                    "vrf-name": "",
                  },
                },
              ],
              "route-distinguisher": "",
              state: {
                "network-address": "",
                "route-distinguisher": "",
              },
            },
          ],
        },
        safi: "",
        state: { afi: "", safi: "" },
      },
      {
        afi: "",
        safi: "",
        state: { afi: "", safi: "" },
      },
    ],
  },
  state: {
    "bgp-as": '',
    "router-id": "",
    "router-run-time-ip-address": "",
    "scan-remain-time": '',
    "table-version": '',
    "total-prefixes": '',
    version: "",
  },
  afiTypes:["ipv4","ipv6","vpnv4", "vpnv6","rtfilter","l2vpn","link-state"],
  safiTypes:["unicast","multicast","labeled-unicast","l2vpn-vpls","evpn","link-state","vpn-unicast","rtfilter-unicast","flowspec","flowspec-mpls-vpn"]

}

export default bgpSchemaData;
