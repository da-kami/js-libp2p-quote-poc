import React from "react";
import ReactDOM from "react-dom";
import useWebSocket, {ReadyState} from "react-use-websocket";


export const WebSocketDemo = () => {
    //Public API that will echo messages sent to it back to the client
    const socketUrl = 'ws://wfvgbnvdow2ja4wdodbvhh4ikdr6a7rjltbjsriebzlkxw4u4zwnflqd.onion:3030/api/rate/btc-xmr';
    // const socketUrl = 'ws://localhost:3030/api/rate/btc-xmr';

    const {
        lastJsonMessage,
        readyState,
    } = useWebSocket(socketUrl);

    const connectionStatus = {
        [ReadyState.CONNECTING]: 'Connecting',
        [ReadyState.OPEN]: 'Open',
        [ReadyState.CLOSING]: 'Closing',
        [ReadyState.CLOSED]: 'Closed',
        [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
    }[readyState];

    return (
        <div>
            <span>The WebSocket is currently {connectionStatus}</span>
            <br/>
            {lastJsonMessage ? <span>Last message: {JSON.stringify(lastJsonMessage)}</span> : null}
        </div>
    );
};

ReactDOM.render(
    <React.StrictMode>
        <h1>Subscribe to websockets</h1>
        <WebSocketDemo/>
    </React.StrictMode>,
    document.getElementById("root")
);
