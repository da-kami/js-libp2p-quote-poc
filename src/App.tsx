import React, {useEffect, useState} from 'react';
import useAsb, {Quote} from "./useAsb";

function App() {
  const [status, setStatus] = useState<string | null>(null);
  const [quote, setQuote] = useState<Quote | null>(null);

  const asb = useAsb();

  useEffect(() => {
    const interval = setInterval(async () => {
      if (asb) {
        const quote = await asb.quote();
        setQuote(quote);
      } else {
        setStatus("ASB not initialized...");
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [asb, quote]);

  if (quote) {
    return <div>Quote: {quote}</div>;
  } else {
    if (status) {
      return <div>Status: {status}</div>;
    }

    return <div>Neither status nor quote</div>;
  }
}

export default App;
