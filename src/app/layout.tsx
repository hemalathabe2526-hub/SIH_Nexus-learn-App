import type { Metadata } from "next";
import "./globals.css";
import AiChatbotWidget from "../components/AiChatbotWidget";

export const metadata: Metadata = {
  title: "NEXUS LEARN — AI Smart Education & Personalized Learning Platform",
  description:
    "AI-powered personalized learning platform for School, College, UPSC, NEET, JEE & Skill Learners. Interactive 3D labs, voice AI, vernacular support, and digital twin analytics.",
  keywords: ["Smart Education", "Personalized Learning", "JEE", "NEET", "UPSC", "Coding", "3D Virtual Labs", "AI Tutor", "22 Indian Languages"],
  authors: [{ name: "NEXUS LEARN Team" }],
  openGraph: {
    title: "NEXUS LEARN — Next-Gen AI Learning Platform",
    description: "Personalized learning paths, 3D virtual labs, and AI struggle detection for all learners.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@100;200;300;400;500;600;700;800;900&family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        {children}
        <AiChatbotWidget />
      </body>
    </html>
  );
}
