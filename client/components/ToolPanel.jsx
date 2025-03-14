import ReactMarkdown from "react-markdown";

function FunctionCallOutput({ output }) {
  console.log(output);
  return (
    <div className="flex flex-col gap-2">
      <div className="markdown-body p-2">
        <ReactMarkdown>{output}</ReactMarkdown>
      </div>
    </div>
  );
}

export default function ToolPanel({ apiOutput, isSessionActive }) {
  console.log(apiOutput);
  return (
    <section
      className="h-full w-full flex flex-col gap-4"
      style={{ overflow: "hidden" }}
    >
      <div className="h-full bg-gray-50 rounded-md p-4">
        <h2 className="text-lg font-bold">Code Sample Tool</h2>
        <div className="h-full w-full my-4 pb-10" style={{ overflow: "auto" }}>
          {isSessionActive ? (
            apiOutput ? (
              <FunctionCallOutput output={apiOutput.output} />
            ) : (
              <p>Ask for advice on a code sample...</p>
            )
          ) : (
            <p>Start the session to use this tool...</p>
          )}
        </div>
      </div>
    </section>
  );
}
