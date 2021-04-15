import React, { useEffect, useState } from "react";
import useAsb, { Quote } from "./useAsb";

function App() {
  const [status, setStatus] = useState<string | null>(null);
  const [quote, setQuote] = useState<Quote | null>(null);

  // TODO: handle dropped connection (retry)
  const asb = useAsb();

  useEffect(() => {
    const interval = setInterval(async () => {
      if (asb) {
        try {
          const quote = await asb.quote();
          console.log("received quote: " + JSON.stringify(quote));
          setQuote(quote);
          setStatus("Current quote is:");
        } catch (e) {
          setStatus("Error when fetching quote: " + e.toString());
        }
      } else {
        setStatus("ASB not initialized...");
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [asb, quote]);

  if (quote) {
    return (
      <div>
        <div>Status: {status}</div>
        <div>
          price {quote.price} quantity {quote.max_quantity}
        </div>
      </div>
    );
  } else {
    if (status) {
      return <div>Status: {status}</div>;
    }

    return <div>Setting up...</div>;
  }
}

export default App;
