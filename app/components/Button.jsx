import Image from "next/image";
import React from "react";

const Button = ({
  title,
  leftIcon,
  rightIcon,
  submitting = false,
  bgColor,
  textColor,
}) => (
  <button
    disabled={submitting}
    className={`flex items-center justify-center gap-3 px-4 py-2 sm:mx-4 sm:my-2
      ${textColor || 'text-white'} 
      ${submitting ? 'bg-black/50' : bgColor || 'bg-purple-600'} 
      rounded-md cursor-pointer text-sm font-medium max-md:w-full`}
  >
    {leftIcon && <Image src={leftIcon} width={14} height={14} alt="left icon" />}
    {title}
    {rightIcon && <Image src={rightIcon} width={14} height={14} alt="right icon" />}
  </button>
);

export default Button;
