"use client";

import React from "react";

const LoadingSpinner = ({
  size = "40px",
  color = "#f3f3f3",
  primaryColor = "#2563eb",
  text = "",
  textColor = "#6b7280",
  textSize = "1rem",
  height = "200px",
  inline = false,
}) => {
  return (
    <div
      className={`${
        inline ? "inline-flex" : "flex"
      } items-center justify-center w-full`}
      style={!inline ? { minHeight: height } : {}}
    >
      <div
        className="rounded-full animate-spin"
        style={{
          width: size,
          height: size,
          border: `3px solid ${color}`,
          borderTop: `3px solid ${primaryColor}`,
        }}
      />
      {text && (
        <span
          className="ml-4"
          style={{ color: textColor, fontSize: textSize }}
        >
          {text}
        </span>
      )}
    </div>
  );
};

export default LoadingSpinner;
