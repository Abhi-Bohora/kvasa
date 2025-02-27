import { useState, useRef, useEffect } from "react";
import { koreanKeys } from "./utils/korean-keys";
import * as hangul from "hangul-js";
import { MdKeyboardBackspace } from "react-icons/md";
import { FiSun, FiMoon } from "react-icons/fi";
import { FaPlay, FaStop } from "react-icons/fa";
import Description from "./components/description";
import { FaGithub } from "react-icons/fa";

const useTheme = () => {
  const [isDark, setIsDark] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    return savedTheme
      ? savedTheme === "dark"
      : window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    localStorage.setItem("theme", isDark ? "dark" : "light");
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  return [isDark, setIsDark] as const;
};

function App() {
  const [inputValue, setInputValue] = useState("");
  const [cursorPosition, setCursorPosition] = useState(0);
  const [isDark, setIsDark] = useTheme();
  const [isPlaying, setIsPlaying] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState<{
    start: number;
    end: number;
  } | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightIntervalRef = useRef<number | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const startTimeRef = useRef<number>(0);

  const startSpeaking = () => {
    if (!assembledHanguel) return;

    window.speechSynthesis.cancel();
    if (highlightIntervalRef.current) {
      clearInterval(highlightIntervalRef.current);
      highlightIntervalRef.current = null;
    }

    const utterance = new SpeechSynthesisUtterance(assembledHanguel);
    utterance.lang = "ko-KR";
    utterance.rate = 0.8;
    utteranceRef.current = utterance;

    utterance.onstart = () => {
      setIsPlaying(true);
      startTimeRef.current = Date.now();
    };

    utterance.onboundary = (event) => {
      const { charIndex, charLength } = event;
      setHighlightIndex({
        start: charIndex,
        end: charIndex + charLength,
      });
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setHighlightIndex(null);
      utteranceRef.current = null;
    };

    utterance.onerror = (event) => {
      console.error("Speech synthesis error:", event);
      setIsPlaying(false);
      setHighlightIndex(null);
      utteranceRef.current = null;
    };

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if (utteranceRef.current) {
      window.speechSynthesis.cancel();
      utteranceRef.current = null;
    }
    setIsPlaying(false);
    setHighlightIndex(null);
  };

  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, []);

  const handleKeyClick = (key: string) => {
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
    const fullDisassembled = hangul.disassemble(inputValue);

    let jamoIndex = 0;
    let charIndex = 0;
    
    while (charIndex < cursorPosition && jamoIndex < fullDisassembled.length) {
      const char = hangul.assemble(fullDisassembled.slice(jamoIndex));
      jamoIndex += hangul.disassemble(char.charAt(0)).length;
      charIndex += 1;
    }
    
    if (jamoIndex > 0) {
      const newDisassembled = [
        ...fullDisassembled.slice(0, jamoIndex - 1),
        ...fullDisassembled.slice(jamoIndex)
      ];
      
      const newValue = hangul.assemble(newDisassembled);
      const beforeDeletion = hangul.assemble(fullDisassembled.slice(0, jamoIndex - 1));
      const newPosition = beforeDeletion.length;
      
      setInputValue(newValue);
      setCursorPosition(newPosition);
      
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = newPosition;
          textareaRef.current.selectionEnd = newPosition;
          textareaRef.current.focus();
        }
      }, 0);
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    setCursorPosition(e.target.selectionStart || 0);
  };

  const handleClick = (e: React.MouseEvent<HTMLTextAreaElement>) => {
    setCursorPosition(e.currentTarget.selectionStart || 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      handleBackspace();
    }
  };

  const disassembledHanguel = hangul.disassemble(inputValue);
  const assembledHanguel = hangul.assemble(disassembledHanguel);

  const renderHighlightedText = () => {
    if (!highlightIndex || !isPlaying) {
      return assembledHanguel;
    }

    const before = assembledHanguel.slice(0, highlightIndex.start);
    const highlighted = assembledHanguel.slice(
      highlightIndex.start,
      highlightIndex.end
    );
    const after = assembledHanguel.slice(highlightIndex.end);

    return (
      <>
        {before}
        <span
          className={`highlight ${
            isDark ? "bg-blue-600 text-white" : "bg-blue-200 text-blue-900"
          }`}
        >
          {highlighted}
        </span>
        {after}
      </>
    );
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-200 ${
        isDark ? "bg-gray-900" : "bg-gray-50"
      }`}
    >
      <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 py-2 sm:py-4">
        <div className="flex justify-end mb-2 sm:mb-4">
          <button
            onClick={() => setIsDark(!isDark)}
            className={`p-1.5 sm:p-2 rounded-full ${
              isDark
                ? "bg-gray-700 hover:bg-gray-600 text-yellow-300"
                : "bg-gray-200 hover:bg-gray-300 text-gray-700"
            } transition-colors duration-200`}
          >
            {isDark ? <FiSun size={20} /> : <FiMoon size={20} />}
          </button>
          <div
            className={`p-1.5 sm:p-2 rounded-full cursor-pointer transition-colors duration-200 ${
              isDark
                ? "text-white hover:text-gray-300"
                : "text-gray-800 hover:text-gray-600"
            }`}
          >
            <FaGithub size={20} />
          </div>
        </div>
        <Description isDark={isDark} />
        <div className="w-full max-w-2xl mx-auto">
          <div className="mb-2 sm:mb-4">
            {isPlaying ? (
              <div
                className={`w-full h-24 sm:h-32 mb-2 sm:mb-4 p-2 sm:p-4 rounded-lg transition-colors duration-200 ${
                  isDark
                    ? "bg-gray-800 text-white border-gray-700"
                    : "bg-white text-gray-900 border-gray-300"
                } border overflow-auto whitespace-pre-wrap`}
              >
                {renderHighlightedText()}
              </div>
            ) : (
              <textarea
                ref={textareaRef}
                value={assembledHanguel}
                onChange={handleTextareaChange}
                onClick={handleClick}
                onKeyDown={handleKeyDown}
                className={`w-full h-24 sm:h-32 mb-2 sm:mb-4 p-2 sm:p-4 rounded-lg transition-colors duration-200 resize-none focus:ring-2 focus:ring-blue-500 outline-none text-base ${
                  isDark
                    ? "bg-gray-800 text-white border-gray-700 placeholder-gray-400"
                    : "bg-white text-gray-900 border-gray-300 placeholder-gray-500"
                } border`}
                placeholder="Type in Korean..."
              />
            )}
          </div>
          <div className="flex justify-center mb-2 sm:mb-4">
            <button
              onClick={isPlaying ? stopSpeaking : startSpeaking}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-colors duration-200 flex items-center gap-2 ${
                isDark
                  ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                  : "bg-indigo-500 hover:bg-indigo-600 text-white"
              }`}
            >
              {isPlaying ? (
                <>
                  <FaStop className="w-3 h-3 sm:w-4 sm:h-4" /> Stop
                </>
              ) : (
                <>
                  <FaPlay className="w-3 h-3 sm:w-4 sm:h-4" /> Read
                </>
              )}
            </button>
          </div>
          <div className="w-full grid grid-cols-5 sm:grid-cols-7 gap-0.5 sm:gap-2">
            {koreanKeys.map((key) => (
              <button
                key={key}
                onClick={() => handleKeyClick(key)}
                className={`h-8 sm:h-12 rounded transition-colors duration-200 flex items-center justify-center text-sm sm:text-base font-medium ${
                  isDark
                    ? "bg-gray-700 hover:bg-gray-600 text-white border border-gray-600"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-900 border border-gray-200"
                }`}
              >
                {key}
              </button>
            ))}
            <button
              onClick={handleBackspace}
              className={`col-span-2 h-8 sm:h-12 rounded transition-colors duration-200 flex items-center justify-center ${
                isDark
                  ? "bg-rose-600 hover:bg-rose-700 text-white"
                  : "bg-rose-500 hover:bg-rose-600 text-white"
              }`}
            >
              <MdKeyboardBackspace className="w-4 h-4 sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
