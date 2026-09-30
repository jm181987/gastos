import './globals.css';

export const metadata = {
  title: 'Gestor de Gastos',
  description: 'Control mensual y anual de ingresos, gastos y KPIs',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
