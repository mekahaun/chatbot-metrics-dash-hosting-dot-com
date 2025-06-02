const ErrorSection = ({ className = "" }) => {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <p className="text-red-500">Error loading data</p>
    </div>
  );
};

export default ErrorSection;
