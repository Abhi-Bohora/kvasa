const Description = ({ isDark }: { isDark: boolean }) => {
  return (
    <div className="w-full max-w-2xl mx-auto mb-8 text-center relative overflow-hidden">
      <div className="relative z-10 px-4 py-6 rounded-lg">
        <h1
          className={`text-4xl font-bold mb-4 animate-fadeIn bg-clip-text text-transparent bg-gradient-to-r ${
            isDark
              ? "from-blue-400 via-purple-400 to-blue-400"
              : "from-blue-600 via-purple-600 to-blue-600"
          }`}
        >
          Kvasa
        </h1>

        <p
          className={`text-sm sm:text-base max-w-md mx-auto animate-slideUp ${
            isDark ? "text-gray-300" : "text-gray-700"
          }`}
        >
          Type Korean characters and click "Read" to hear the correct
          pronunciation. Perfect for korean learners <span>📖</span>
        </p>
      </div>
    </div>
  );
};

export default Description;
