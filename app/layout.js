import "./globals.css";

export const metadata = {
  title: { default: "COSENG Photography", template: "%s | COSENG Photography" },
  description: "Professional photography services across Newcastle & the North East. Book a session today.",
  icons: { icon: "/icon.png" },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
