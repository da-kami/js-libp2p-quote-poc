import {useEffect, useState} from 'react';
import Libp2p from "libp2p";
import pipe from "it-pipe";
import WebSockets from "libp2p-websockets";
import MPLEX from "libp2p-mplex";
import { NOISE } from "libp2p-noise";

const QUOTE_PROTOCOL = "/comit/xmr/btc/bid-quote/1.0.0";

export interface Quote {
    quote: string
}

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
                streamMuxer: [MPLEX]
            }
        })
        await node.start();

        return node;
    }

   public async quote(): Promise<Quote> {
        const { stream } = await this.libp2p.dialProtocol("/ip4/127.0.0.1/tcp/8765/ws/p2p/12D3KooWCdMKjesXMJz1SiZ7HgotrxuqhQJbP5sgBm2BwP1cqThi", QUOTE_PROTOCOL);

       return await pipe(
           // Source data
           [],
           // Write to the stream, and pass its output to the next function
           stream,
           // Sink function
           async function (source) {
               // For each chunk of data
               for await (const data of source) {
                   // Output the data
                   console.log('received data:', data.toString())
                   let quote = {
                       quote: data
                   }
                   return quote;
               }
           }
       )
   }
}

export default function useAsb() {
    let [asb, setAsb] = useState<Asb | null>(null);

    useEffect(() => {
        async function initAsb() {
            try {
                const asb = await Asb.build();
                setAsb(asb);
            } catch(e) {
                console.error(e);
            }
        }

        if (!asb) {
            initAsb();
        }
    }, [asb]);

    return asb;
}
