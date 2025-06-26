import React from "react";
import { Link } from "react-router-dom";

interface LogoProps {
  className?: string;
}

const Logo = ({ className = "" }: LogoProps) => {
  return (
    <Link to="/" className={`block ${className}`}>
      <img
        src="https://i.postimg.cc/pXxdtDJz/quiz-online-logo.png"
        alt="Newquiz.online Logo"
        className="h-10 w-auto"
      />
    </Link>
  );
};

export default Logo;
