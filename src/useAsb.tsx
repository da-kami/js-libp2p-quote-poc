import { useEffect, useState } from "react";
import Libp2p from "libp2p";
import WebSockets from "libp2p-websockets";
import filters from "libp2p-websockets/src/filters";
import MPLEX from "libp2p-mplex";
import { NOISE } from "libp2p-noise";
import Multiaddr from "multiaddr";
import PeerId from "peer-id";
import wrap from "it-pb-rpc";

const QUOTE_PROTOCOL = "/comit/xmr/btc/bid-quote/1.0.0";
const ASB_MULTI_ADR = Multiaddr("/ip4/127.0.0.1/tcp/9940/ws");
const ASB_PEER_ID = PeerId.createFromB58String(
  "12D3KooWCdMKjesXMJz1SiZ7HgotrxuqhQJbP5sgBm2BwP1cqThi"
);

const transportKey = WebSockets.prototype[Symbol.toStringTag];

export interface Quote {
  price: number;
  max_quantity: number;
}

const jsonCodec = {
  encode: (msg) => {
    return Buffer.from(JSON.stringify(msg));
  },
  decode: (bytes) => {
    return JSON.parse(bytes.toString());
  },
};

export class Asb {
  public libp2p!: Libp2p;

  public static async build(): Promise<Asb> {
    let asb = new Asb();
    asb.libp2p = await asb.init();
    return asb;
  }

  async init(): Promise<Libp2p> {
    const node = await Libp2p.create({
      modules: {
        transport: [WebSockets],
        connEncryption: [NOISE],
        streamMuxer: [MPLEX],
      },
      config: {
        transport: {
          [transportKey]: {
            // Transport properties -- Libp2p upgrader is automatically added
            filter: filters.all,
          },
        },
      },
    });
    await node.start();
    node.peerStore.addressBook.add(ASB_PEER_ID, [ASB_MULTI_ADR]);

    return node;
  }

  public async quote(): Promise<Quote> {
    const { stream } = await this.libp2p.dialProtocol(
      ASB_PEER_ID,
      QUOTE_PROTOCOL
    );
    let quote = await wrap(stream).pb(jsonCodec).read();

    await stream.close();

    return quote;
  }
}

export default function useAsb() {
  let [asb, setAsb] = useState<Asb | null>(null);

  useEffect(() => {
    async function initAsb() {
      try {
        const asb = await Asb.build();
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
