import { useEffect, useState, useRef } from "react";
import { useRealtime } from "./RealtimeContext";

const functionDescription = `
TODO
`;

const sessionUpdate = {
  type: "session.update",
  session: {
    tools: [
      /*
      {
        type: "function",
        name: "display_color_palette",
        description: functionDescription,
        parameters: {
          type: "object",
          strict: true,
          properties: {
            // TODO - how would you specify these function call arguments?
          },
          required: ["theme", "colors"],
        },
      },
      */
    ],
    tool_choice: "auto",
  },
};

function FunctionCallOutput({ functionCallOutput }) {
  const { theme, colors } = JSON.parse(functionCallOutput.arguments);

  const colorBoxes = colors.map((color) => (
    <div
      key={color}
      className="w-full h-16 rounded-md flex items-center justify-center border border-gray-200"
      style={{ backgroundColor: color }}
    >
      <p className="text-sm font-bold text-black bg-slate-100 rounded-md p-2 border border-black">
        {color}
      </p>
    </div>
  ));

  return (
    <div className="flex flex-col gap-2">
      <p>Theme: {theme}</p>
      {colorBoxes}
      <pre className="text-xs bg-gray-100 rounded-md p-2 overflow-x-auto">
        {JSON.stringify(functionCallOutput, null, 2)}
      </pre>
    </div>
  );
}

export default function ToolPanel() {
  const [functionAdded, setFunctionAdded] = useState(false);
  const [functionCallOutput, setFunctionCallOutput] = useState(null);
  const handledFunctionCalls = useRef({});

  const { sendClientEvent, isSessionActive, functionCalls } = useRealtime();

  useEffect(() => {
    functionCalls.forEach((functionCall) => {
      if (handledFunctionCalls.current[functionCall.response.id]) return;

      if (
        functionCall?.response?.output?.[0]?.name === "display_color_palette"
      ) {
        setFunctionCallOutput(functionCall.response.output[0]);
        setTimeout(() => {
          sendClientEvent({
            type: "response.create",
            response: {
              instructions: `
              ask for feedback about the color palette - don't repeat 
              the colors, just ask if they like the colors.
            `,
            },
          });
        }, 500);
        handledFunctionCalls.current[functionCall.response.id] = true;
      }
    });
  }, [functionCalls]);

  useEffect(() => {
    if (!isSessionActive) {
      setFunctionAdded(false);
    } else {
      setTimeout(() => {
        if (!functionAdded) {
          sendClientEvent(sessionUpdate);
          setFunctionAdded(true);
        }
      }, 500);
    }
  }, [isSessionActive]);

  return (
    <section className="h-full w-full flex flex-col gap-4">
      <div className="h-full bg-gray-50 rounded-md p-4">
        <h2 className="text-lg font-bold">Color Palette Tool</h2>
        {isSessionActive ? (
          functionCallOutput ? (
            <FunctionCallOutput functionCallOutput={functionCallOutput} />
          ) : (
            <p>Ask for advice on a color palette...</p>
          )
        ) : (
          <p>Start the session to use this tool...</p>
        )}
      </div>
    </section>
  );
}
