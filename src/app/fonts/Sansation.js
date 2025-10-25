import localFont from "next/font/local";

export const sansation = localFont({
  src: [
    {
      path: "./Sansation/Sansation-Regular.ttf", 
      weight: "400",
      style: "normal",
    },
    {
      path: "./Sansation/Sansation-Bold.ttf",
      weight: "700",
      style: "normal",
    },
  ],
  display: "swap",
});
