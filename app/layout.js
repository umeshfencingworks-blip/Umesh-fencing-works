import "./globals.css";
import { UIProvider } from "@/context/UIContext";
import AppLayoutWrapper from "@/components/AppLayoutWrapper";
import { Baloo_Bhai_2, JetBrains_Mono } from "next/font/google";

const balooBhai2 = Baloo_Bhai_2({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-baloo",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-mono",
  display: "swap",
});

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata = {
  title: "Umesh Fencing Works — Chainlink, Barbed Wire & Concrete Poles Manufacturer",
  description:
    "Leading manufacturer and supplier of heavy-duty GI chain link wire mesh, high-tensile barbed wire, precast concrete poles, and solar fencing systems in Anantapur, Andhra Pradesh.",
  keywords: [
    "Umesh Fencing Works",
    "Chainlink Fencing Manufacturer",
    "Barbed Wire",
    "Precast Concrete Poles",
    "Solar Agricultural Fencing",
    "Bukkarayasamudram",
    "Anantapur Fencing",
    "Andhra Pradesh",
  ],
  icons: {
    icon: [
      { url: "/assets/umesh_logo.jpg" },
      { url: "/favicon.ico" },
    ],
    shortcut: "/assets/umesh_logo.jpg",
    apple: "/assets/umesh_logo.jpg",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${balooBhai2.variable} ${jetbrainsMono.variable}`}>
      <head>
        <link rel="icon" href="/assets/umesh_logo.jpg" type="image/jpeg" />
        <link rel="shortcut icon" href="/assets/umesh_logo.jpg" type="image/jpeg" />
        <link rel="apple-touch-icon" href="/assets/umesh_logo.jpg" />
      </head>
      <body className="font-sans antialiased">
        <UIProvider>
          <AppLayoutWrapper>{children}</AppLayoutWrapper>
        </UIProvider>
      </body>
    </html>
  );
}
