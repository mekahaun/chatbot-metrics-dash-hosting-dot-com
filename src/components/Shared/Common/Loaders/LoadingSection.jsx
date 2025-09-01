const LoadingSection = ({
    size = "md",
    className = "",
    text = "Loading...",
  }) => {
    const sizeClass =
      {
        sm: "h-4 w-4",
        md: "h-8 w-8",
        lg: "h-12 w-12",
      }[size] || "h-8 w-8";
  
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div
          className={`animate-spin rounded-full h-${size} w-${size} border-t-2 border-b-2 border-blue-500 ${sizeClass}`}
        ></div>
        {text && <span className="ml-2 text-gray-600">{text}</span>}
      </div>
    );
  };

export default LoadingSection;
