import React, {useEffect, useState} from "react";
import ReactDOM from "react-dom";
import {SSEProvider, useSSE} from "react-hooks-sse";


const useEventSource = (url) => {
    const [data, updateData] = useState(null);

    useEffect(() => {
        const source = new EventSource(url);

        source.onmessage = function logEvents(event) {
            console.log(event);
            updateData(JSON.parse(event.data));
        }
    }, [])

    return data;
}

const Rate = () => {
    const data = useEventSource("http://wfvgbnvdow2ja4wdodbvhh4ikdr6a7rjltbjsriebzlkxw4u4zwnflqd.onion:3030/api/rate/btc-xmr");
    // const data = useEventSource("http://159.196.146.253:3030/api/rate/btc-xmr");
    // const data = useEventSource("http://localhost:3030/api/rate/btc-xmr");
    return (
        <>
            {JSON.stringify(data)}
        </>
    );
};

ReactDOM.render(
  <React.StrictMode>
      {/*<SSEProvider endpoint="http://localhost:3030/api/rate/btc-xmr">*/}
          <h1>Subscribe & update to SSE event</h1>
          <Rate />
      {/*</SSEProvider>*/}
  </React.StrictMode>,
  document.getElementById("root")
);
