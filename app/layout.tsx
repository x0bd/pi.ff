import type { Metadata } from "next";
import "./globals.css";
import { Inter as FontSans } from "next/font/google";

const fontSans = FontSans({
	subsets: ["latin"],
	variable: "--font-sans",
});

export const metadata: Metadata = {
	title: "pi.ff",
	description: "web based ffmpeg wrapper",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body className={fontSans.className}>{children}</body>
		</html>
	);
}
