import { useState, useRef } from "react";
import { koreanKeys } from "./utils/korean-keys";
import * as hangul from "hangul-js";

function App() {
  const [inputValue, setInputValue] = useState("");
  const [cursorPosition, setCursorPosition] = useState(0);
  const textareaRef = useRef(null);

  const handleKeyClick = (key) => {
    const before = inputValue.slice(0, cursorPosition);
    const after = inputValue.slice(cursorPosition);
    const newValue = before + key + after;
    setInputValue(newValue);
    setCursorPosition(cursorPosition + 1);

    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.selectionStart = cursorPosition + 1;
        textareaRef.current.selectionEnd = cursorPosition + 1;
        textareaRef.current.focus();
      }
    }, 0);
  };

  const handleBackspace = () => {
    if (cursorPosition === 0) return;

    const before = inputValue.slice(0, cursorPosition);
    const after = inputValue.slice(cursorPosition);

    const charBeforeCursor = before.slice(-1);
    const charDisassembled = hangul.disassemble(charBeforeCursor);

    let newBefore;
    if (charDisassembled.length > 1) {
      const beforeDisassembled = hangul.disassemble(before);
      const newBeforeDisassembled = beforeDisassembled.slice(0, -1);
      newBefore = hangul.assemble(newBeforeDisassembled);
    } else {
      newBefore = before.slice(0, -1);
    }

    const newValue = newBefore + after;
    setInputValue(newValue);
    const newPosition = newBefore.length;
    setCursorPosition(newPosition);
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.selectionStart = newPosition;
        textareaRef.current.selectionEnd = newPosition;
        textareaRef.current.focus();
      }
    }, 0);
  };

  const handleTextareaChange = (e) => {
    setInputValue(e.target.value);
    setCursorPosition(e.target.selectionStart);
  };

  const handleClick = (e) => {
    setCursorPosition(e.target.selectionStart);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      handleBackspace();
    }
  };

  const disassembledHanguel = hangul.disassemble(inputValue);
  const assembledHanguel = hangul.assemble(disassembledHanguel);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 overflow-hidden">
      <div>
        <textarea
          ref={textareaRef}
          value={assembledHanguel}
          onChange={handleTextareaChange}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          className="border border-gray-300 rounded p-2 w-full h-32 mb-4"
        />
        <div className="grid grid-cols-7 gap-2 mb-4">
          {koreanKeys.map((key) => (
            <div className="flex items-center justify-center" key={key}>
              <button
                className="bg-blue-500 text-white rounded p-2 w-full h-12 flex items-center justify-center"
                onClick={() => handleKeyClick(key)}
              >
                {key}
              </button>
            </div>
          ))}
          <button
            onClick={handleBackspace}
            className="bg-red-500 text-white rounded p-2 col-span-2"
          >
            Backspace
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
