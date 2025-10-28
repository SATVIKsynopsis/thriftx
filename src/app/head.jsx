export default function Head() {
  return (
    <>
      {/* Resource hints to speed up fonts and storage fetches */}
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://firebasestorage.googleapis.com" crossOrigin />
      <meta name="robots" content="index,follow" />
    </>
  );
}
