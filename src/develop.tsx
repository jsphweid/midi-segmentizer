import * as React from "react";
import * as ReactDOM from "react-dom";

import { sample } from "./sample";
import Segmentizer from "./segmentizer";

function App() {
  const [data, setData] = React.useState<string>(sample);

  async function handleFileUpload(file: File) {
    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    setData(base64);
  }

  return (
    <>
      <input
        id="fileupload"
        type="file"
        onChange={(e) => handleFileUpload(e.target.files![0])}
      />
      {data && (
        <Segmentizer
          data={data}
          onSave={(res) => {
            alert(`Would save this: ${JSON.stringify(res)}`);
          }}
        />
      )}
    </>
  );
}

ReactDOM.render(<App />, document.getElementById("app"));
