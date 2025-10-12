import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Printer } from "lucide-react";
import { useEffect, useRef } from "react";
import QRCode from "qrcode";

interface QRCodeDisplayProps {
  numeroCarteira: string;
  saldo: number;
  onDownload?: () => void;
  onPrint?: () => void;
}

export default function QRCodeDisplay({ numeroCarteira, saldo, onDownload, onPrint }: QRCodeDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !numeroCarteira) return;

    QRCode.toCanvas(canvasRef.current, numeroCarteira, { width: 200 })
      .catch((error) => console.error("Erro ao gerar QR Code:", error));
  }, [numeroCarteira]);

  if (!numeroCarteira) {
    return (
      <Card className="max-w-sm mx-auto">
        <CardHeader>
          <CardTitle className="text-center">Carteira Virtual</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center text-muted-foreground">
          Número da carteira inválido
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-sm mx-auto">
      <CardHeader>
        <CardTitle className="text-center">Carteira Virtual</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-white p-8 rounded-lg flex justify-center" data-testid="qrcode-display">
          <canvas
            ref={canvasRef}
            width={200}
            height={200}
            className="border-2 border-border"
          />
        </div>

        <div className="space-y-2 text-center">
          <p className="text-sm text-muted-foreground">Número da Carteira</p>
          <p className="font-mono font-semibold text-lg" data-testid="text-numero-carteira">
            {numeroCarteira}
          </p>
          <p className="text-sm text-muted-foreground">Saldo Inicial</p>
          <p className="text-2xl font-bold text-success" data-testid="text-saldo">
            R$ {saldo.toFixed(2)}
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={onDownload}
            data-testid="button-download-qr"
          >
            <Download className="w-4 h-4 mr-2" />
            Baixar
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            onClick={onPrint}
            data-testid="button-print-qr"
          >
            <Printer className="w-4 h-4 mr-2" />
            Imprimir
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
