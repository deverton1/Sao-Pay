// QRCodeDisplay.tsx

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Printer } from "lucide-react";
import { useEffect, useRef } from "react";
import QRCode from "qrcode";
import html2canvas from "html2canvas";

interface QRCodeDisplayProps {
 numeroCarteira: string;
 saldo: number;
 // Removidas as props onDownload e onPrint, pois as funções são tratadas internamente.
}

export default function QRCodeDisplay({ numeroCarteira, saldo }: QRCodeDisplayProps) {
 const canvasRef = useRef<HTMLCanvasElement>(null);
 const carteiraRef = useRef<HTMLDivElement>(null);

 // Gera o QR Code no canvas
 useEffect(() => {
  if (!canvasRef.current || !numeroCarteira) return;

  QRCode.toCanvas(canvasRef.current, numeroCarteira, { 
        width: 200, 
        margin: 2, 
        color: { 
            dark: "#1F2937", 
            light: "#ffffff" // Garante o fundo branco
        } 
    })
   .catch((error) => console.error("Erro ao gerar QR Code:", error));
 }, [numeroCarteira]);

 // Download da carteira completa
 const handleDownload = async () => {
  if (!carteiraRef.current) return;

  const canvas = await html2canvas(carteiraRef.current, { scale: 3 });
  const link = document.createElement("a");
  link.href = canvas.toDataURL("image/png");
  link.download = `Carteira-${numeroCarteira}.png`;
  link.click();
 };

 // Impressão da carteira completa
 const handlePrint = async () => {
  if (!carteiraRef.current || !canvasRef.current) return;

  const qrDataUrl = canvasRef.current.toDataURL("image/png");

  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  const html = `
  <html>
   <head>
    <title>Carteira ${numeroCarteira}</title>
    <style>
     @media print {
            body { 
              margin: 0; 
              display: flex; 
              justify-content: center; 
              align-items: center; 
              height: 100vh;
              background-color: white !important;
            }
          }
          body {
      margin: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: #f3f4f6;
     }
     .carteira {
      background: #1e293b;
      padding: 2rem;
      border-radius: 1rem;
      text-align: center;
      color: white;
      display: inline-block;
     }
     .numero-carteira {
      font-family: monospace;
      font-size: 1.5rem;
      font-weight: bold;
      color: #facc15;
      margin: 0.5rem 0;
     }
     .saldo {
      font-size: 2rem;
      font-weight: bold;
      color: #22c55e;
      margin-top: 0.25rem;
     }
     img.qr {
      margin-bottom: 1rem;
      width: 200px;
      height: 200px;
      border-radius: 0.5rem;
      background: white;
     }
    </style>
   </head>
   <body>
    <div class="carteira">
     <img class="qr" src="${qrDataUrl}" alt="QR Code" />
     <p>Número da Carteira</p>
     <p class="numero-carteira">${numeroCarteira}</p>
     <p>Saldo Inicial</p>
     <p class="saldo">R$ ${saldo.toFixed(2)}</p>
    </div>
   </body>
  </html>
 `;
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();
    // Atraso para garantir a renderização antes de imprimir
    setTimeout(() => {
        printWindow.print();
        printWindow.close();
    }, 250); 
 };


 if (!numeroCarteira) {
  // ... código de erro
 }

 return (
  <Card className="max-w-sm mx-auto shadow-lg">
   <CardHeader>
    <CardTitle className="text-center">Carteira Virtual</CardTitle>
   </CardHeader>
   <CardContent className="space-y-4">
    {/* Conteúdo da carteira */}
    <div
     ref={carteiraRef}
     className="carteira bg-gray-900 p-8 rounded-xl flex flex-col items-center shadow-lg"
     data-testid="qrcode-display"
    >
     <canvas
      ref={canvasRef}
      width={200}
      height={200}
      className="border-2 border-gray-300 mb-4 rounded-md"
     />
     <p className="text-sm text-gray-300">Número da Carteira</p>
     <p className="numero-carteira">{numeroCarteira}</p>
     <p className="text-sm text-gray-300 mt-2">Saldo Inicial</p>
     <p className="saldo">R$ {saldo.toFixed(2)}</p>
    </div>

    {/* Botões de ação, chamando as funções internas */}
    <div className="flex gap-2">
     <Button variant="outline" className="flex-1" onClick={handleDownload} data-testid="button-download-qr">
      <Download className="w-4 h-4 mr-2" /> Baixar
     </Button>
     <Button variant="outline" className="flex-1" onClick={handlePrint} data-testid="button-print-qr">
      <Printer className="w-4 h-4 mr-2" /> Imprimir
     </Button>
    </div>
   </CardContent>
  </Card>
 );
}