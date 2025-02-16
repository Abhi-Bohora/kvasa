const Description = ({ isDark }: { isDark: boolean }) => {
  return (
    <div
      className={`w-full max-w-2xl mx-auto mb-4 text-center ${
        isDark ? "text-gray-200" : "text-gray-700"
      }`}
    >
      <h1
        className={`text-xl sm:text-2xl font-bold mb-2 ${
          isDark ? "text-white" : "text-gray-900"
        }`}
      >
        Kvasa
      </h1>
      <p className="text-sm sm:text-base">
        Type Korean characters and click "Read" to hear the correct
        pronunciation. Perfect for korean learners 📖
      </p>
    </div>
  );
};

export default Description;
