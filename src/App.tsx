import { useState } from "react";
import { koreanKeys } from "./utils/korean-keys";
import * as hangul from "hangul-js";

function App() {
  const [inputValue, setInputValue] = useState("");
  const handleKeyClick = (key) => {
    setInputValue((prevValue) => prevValue + key);
  };
  const diassembledHanguel = hangul.disassemble(inputValue);
  const assembledHanguel = hangul.assemble(diassembledHanguel);
  console.log(diassembledHanguel);
  console.log("-----");
  console.log(assembledHanguel);
  return (
    <div>
      <div>
        <textarea
          value={assembledHanguel}
          onChange={(e) => setInputValue(e.target.value)}
          className="border border-gray-300 rounded p-2 w-full h-32 mb-4"
        />
        <div className="grid grid-cols-7 gap-2 mb-4">
          {koreanKeys.map((key) => (
            <button
              key={key}
              className="bg-blue-500 text-white rounded p-2"
              onClick={() => {
                handleKeyClick(key);
              }}
            >
              {key}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
