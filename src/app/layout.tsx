import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Calendario de Evaluaciones | Planificador Escolar",
  description: "Visualiza de forma clara e interactiva las próximas evaluaciones y controles académicos del curso. Organizado con colores distintivos por asignatura.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
