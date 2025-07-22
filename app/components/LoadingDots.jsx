const LoadingDots = () => {
  return (
    <div className="flex items-end gap-2 h-6 max-w-[200px] mx-auto">
      <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce [animation-delay:0s]" />
      <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce [animation-delay:0.2s]" />
      <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce [animation-delay:0.4s]" />
    </div>
  );
};

export default LoadingDots;
