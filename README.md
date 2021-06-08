# js-libp2p websocket showcase for ASB quotes

This project showcases how to connect to the ASB via websockets over libp2p.
We are using an `onion` address to connect.

**You must use a browser that can resolve onion addresses (i.e. Tor Browser) for this demo, otherwise the websocket connection will fail.**

## Quickstart

Run: 

- `yarn install`
- `yarn start`

You will have to set up a hidden service for proxying localhost as onion address for Tor Browser (does not allow localhost)!
Once that is done you can open open the demo in Tor Browser using `[localhost-proxy-onion-address]:3000`.

You should see a raw ASB quote eventually.
