import { Loader } from "lucide-react";

const LoaderComponent = ({
  text = "Loading...",
  size = 24,
  fullScreen = false,
}) => {
  return (
    <div
      className={
        fullScreen
          ? "fixed inset-0 z-[99999] flex items-center justify-center bg-white/70"
          : "flex items-center justify-center py-4"
      }
    >
      <div className="flex items-center">
        <Loader className="animate-spin text-blue-600" size={size} />
        <span className="ml-2 text-sm text-gray-600">{text}</span>
      </div>
    </div>
  );
};

export default LoaderComponent;
