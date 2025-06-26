import React from "react";
import { Link } from "react-router-dom";

interface LogoProps {
  className?: string;
}

const Logo = ({ className = "" }: LogoProps) => {
  return (
    <Link to="/" className={`block ${className}`}>
      <img
        src="https://fixturlaser.com/wp-content/uploads/2021/05/ACOEM-LOGO-WithoutBaseline-CMYK-Bicolor.png"
        alt="ACOEM Logo"
        className="h-10 w-auto"
      />
    </Link>
  );
};

export default Logo;
