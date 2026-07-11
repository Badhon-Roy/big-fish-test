const CommonButton = ({
  buttonText,
  className = "",
  onClick,
  ...props
}) => {
  return (
    <button
      onClick={onClick}
      className={`cursor-pointer px-6 py-3 active:scale-95 transition-all bg-[#00263C] rounded text-white shadow-lg shadow-[#00263C]/30 font-medium duration-300 ${className}`}
      {...props}
    >
      {buttonText}
    </button>
  );
};

export default CommonButton;
