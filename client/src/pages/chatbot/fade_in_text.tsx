

import { useMemo } from 'react';
import "../../styles/typing_animation.css";
import "../../styles/chatbot.css";

interface FadeInTextProps {
  text: string;
  delay?: number;
}

export default function FadeInText({ text, delay = 20 }: FadeInTextProps) {
  // 1) Turn literal "\n" into real newlines
  const normalisedText = useMemo(
    () => text.replace(/\\n/g, '\n'),
    [text]
  );

  // 2) Split and keep whitespace tokens
  const tokens = useMemo(
    () => normalisedText.split(/(\s+)/),
    [normalisedText]
  );

  return (
    <span className="fade_in_text">
      {tokens.map((token, index) => {
        // newline(s)
        if (token === '\n') {
          return <br key={index} />;
        }

        // multiple newlines (e.g. "\n\n")
        if (/^\n+$/.test(token)) {
          return (
            <span key={index}>
              {token.split('').map((_, i) => (
                <br key={i} />
              ))}
            </span>
          );
        }

        // plain whitespace (spaces / tabs)
        if (/^\s+$/.test(token)) {
          return <span key={index}>{token}</span>;
        }

        // everything else = actual “word” token
        const firstThree = token.slice(0, 3);
        const lastThree = token.slice(-3);

        // emphasis: **key**
        if (firstThree.includes("**") || lastThree.includes("**")) {
          const cleaned = token.replaceAll("**", "");
          return (
            <span key={index}>
              <span
                className="fade_in_word_bolded"
                style={{ animationDelay: `${index * (delay / 1000)}s` }}
              >
                {cleaned}
              </span>
            </span>
          );
        }

        // key noun: <<AV-123>>
        if (firstThree.includes("<<") || lastThree.includes(">>")) {
          const cleaned = token.replaceAll("<<", "").replaceAll(">>", "");
          return (
            <span key={index}>
              <span
                className="fade_in_word_key_noun"
                style={{ animationDelay: `${index * (delay / 1000)}s` }}
              >
                {cleaned}
              </span>
            </span>
          );
        }

        // normal word
        return (
          <span key={index}>
            <span
              className="fade_in_word_normal"
              style={{ animationDelay: `${index * (delay / 1000)}s` }}
            >
              {token}
            </span>
          </span>
        );
      })}
    </span>
  );
}
