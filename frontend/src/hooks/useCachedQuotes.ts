import { useState, useEffect } from "react";
import { Quote } from "@/types/quotes";

export const useCachedQuote = (): Quote => {
  const [quote, setQuote] = useState<string>("");
  const [author, setAuthor] = useState<string>("");

  useEffect(() => {
    const fetchQuote = async () => {
      try {
        const cached = localStorage.getItem("quoteOfDay");
        const timestamp = localStorage.getItem("quoteTimestamp");
        const oneHourMs = 60 * 60 * 1000;

        if (
          cached &&
          timestamp &&
          Date.now() - parseInt(timestamp) < oneHourMs
        ) {
          const data: Quote = JSON.parse(cached);
          setQuote(data.quote);
          setAuthor(data.author);
          return;
        }

        const res = await fetch("http://localhost:3000/quotes");
        if (!res.ok) throw new Error("Failed to fetch quote");

        const data: Quote = await res.json();

        localStorage.setItem("quoteOfDay", JSON.stringify(data));
        localStorage.setItem("quoteTimestamp", Date.now().toString());

        setQuote(data.quote);
        setAuthor(data.author);
      } catch (error) {
        console.error("Failed to fetch quote:", error);
        const cached = localStorage.getItem("quoteOfDay");
        if (cached) {
          const data: Quote = JSON.parse(cached);
          setQuote(data.quote);
          setAuthor(data.author);
        }
      }
    };

    fetchQuote();
  }, []);

  return { quote, author };
};
