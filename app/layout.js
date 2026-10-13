import "./globals.css";

export const metadata = {
  title: "Savory — Food, thoughtfully delivered",
  description: "A modern food ordering and live delivery tracking experience.",
};

export default function RootLayout({ children }) {
  return <html lang="en"><body>{children}</body></html>;
}
