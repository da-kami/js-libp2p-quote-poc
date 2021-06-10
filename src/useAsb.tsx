import { useEffect, useState } from "react";
import Libp2p from "libp2p";
import WebSockets from "libp2p-websockets";
import filters from "libp2p-websockets/src/filters";
import MPLEX from "libp2p-mplex";
import { NOISE } from "libp2p-noise";
import {Multiaddr} from "multiaddr";
import PeerId from "peer-id";
import wrap from "it-pb-rpc";

const QUOTE_PROTOCOL = '/comit/xmr/btc/bid-quote/1.0.0';

// Note: The multiaddr needs the ws protocl specifier to be processed correctly
const ASB_MULTI_ADR_TESTNET = '/dns4/pzbmpqsyi2j2za2fwmiognupwozjlcoajbd3cgboetql7ooah63zywqd.onion/tcp/9940/ws';
const ASB_PEER_ID_TESTNET =
    '12D3KooWCdMKjesXMJz1SiZ7HgotrxuqhQJbP5sgBm2BwP1cqThi';

export function getPeerId(): PeerId {
      return PeerId.createFromB58String(ASB_PEER_ID_TESTNET);
}

export function getMultiAddress(): Multiaddr {
      return new Multiaddr(ASB_MULTI_ADR_TESTNET);
}

const transportKey = WebSockets.prototype[Symbol.toStringTag];

export class Quote {
  price: number;
  max_quantity: number;
  timestamp: Date;

  constructor(price: number, max_quantity: number) {
    this.price = price
    this.max_quantity = max_quantity;
    this.timestamp = new Date();
  }
}

interface QuoteResponse {
  price: number;
  max_quantity: number;
}

const jsonCodec = {
  encode: msg => {
    return Buffer.from(JSON.stringify(msg));
  },
  decode: bytes => {
    return JSON.parse(bytes.toString());
  },
};

export class Asb {
  private constructor(private libp2p: Libp2p, private peerId: PeerId) {}

  public static async newInstance(): Promise<Asb> {
    let multiaddr = getMultiAddress();
    let peerId = getPeerId();

    const node = await Libp2p.create({
      modules: {
        transport: [WebSockets],
        connEncryption: [NOISE],
        streamMuxer: [MPLEX],
      },
      config: {
        transport: {
          [transportKey]: {
            // in order to allow IP-addresses as part of the multiaddress we set the filters to all
            filter: filters.all,
          },
        },
      },
    });

    await node.start();
    node.peerStore.addressBook.add(peerId, [multiaddr]);

    return new Asb(node, peerId);
  }

  public async quote(): Promise<Quote> {
    try {
      console.log("dialing...");
      const { stream } = await this.libp2p.dialProtocol(
          this.peerId,
          QUOTE_PROTOCOL
      );
      console.log("dialed");

      let quote: QuoteResponse = await wrap(stream).pb(jsonCodec).read();

      await stream.close();

      return new Quote(quote.price, quote.max_quantity);
    } catch (e) {
      if (e instanceof Error && e.message.includes('No transport available')) {
        // Since we have set the transport `filters` to `all` so we can use ip-addresses to connect,
        // we can run into the problem that we try to connect on a port that is not configured for
        // websockets if connecting on the websocket address fails. In this case we just log a warning.
        console.warn('skipping port that is not configured for websockets');
      } else {
        throw e;
      }
    }

    throw Error('All attempts to fetch a quote failed.');
  }
}

export default function useAsb() {
  let [asb, setAsb] = useState<Asb | null>(null);

  useEffect(() => {
    async function initAsb() {
      try {
        const asb = await Asb.newInstance();
        setAsb(asb);
      } catch (e) {
        console.error(e);
      }
    }

    if (!asb) {
      initAsb();
    }
  }, [asb]);

  return asb;
}
