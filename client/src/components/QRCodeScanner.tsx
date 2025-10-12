import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, Upload, Scan } from "lucide-react";
import { BrowserMultiFormatReader } from "@zxing/library";

interface QRCodeScannerProps {
  onScan: (numeroCarteira: string) => void;
  isLoading?: boolean;
}

export default function QRCodeScanner({ onScan, isLoading }: QRCodeScannerProps) {
  const [manualInput, setManualInput] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);

  const handleStartScan = async () => {
    setIsScanning(true);

    const codeReader = new BrowserMultiFormatReader();
    codeReaderRef.current = codeReader;

    try {
      const videoElement = videoRef.current!;
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      videoElement.srcObject = stream;
      await videoElement.play();

      const result = await codeReader.decodeFromVideoDevice(undefined, videoElement, (result, error) => {
        if (result) {
          onScan(result.getText());
          handleStopScan();
        }
      });
    } catch (err) {
      console.error("Erro ao acessar câmera:", err);
      setIsScanning(false);
    }
  };

  const handleStopScan = () => {
    setIsScanning(false);
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    codeReaderRef.current?.reset();
    codeReaderRef.current = null;
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualInput.trim()) {
      onScan(manualInput.trim());
      setManualInput("");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ler QR Code</CardTitle>
        <CardDescription>Escaneie o QR Code da carteira ou digite manualmente</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="aspect-square bg-muted rounded-lg flex flex-col items-center justify-center p-4 border-2 border-dashed border-border relative">
          <video
            ref={videoRef}
            className="w-full h-full object-cover rounded-lg"
            hidden={!isScanning}
          />
          {!isScanning && (
            <div className="text-center space-y-4 absolute inset-0 flex flex-col items-center justify-center">
              <Camera className="w-16 h-16 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Posicione o QR Code na câmera</p>
            </div>
          )}
          {isScanning && (
            <div className="text-center space-y-2 absolute inset-0 flex flex-col items-center justify-center">
              <Scan className="w-16 h-16 animate-pulse text-primary" />
              <p className="text-sm text-muted-foreground">Escaneando...</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button
            onClick={handleStartScan}
            disabled={isScanning || isLoading}
            className="w-full"
          >
            <Camera className="w-4 h-4" />
            <span>{isScanning || isLoading ? "Escaneando..." : "Câmera"}</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => console.log("Upload de arquivo")}
            className="w-full"
            disabled={isLoading}
          >
            <Upload className="w-4 h-4" />
            <span>Upload</span>
          </Button>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">Ou digite manualmente</span>
          </div>
        </div>

        <form onSubmit={handleManualSubmit} className="space-y-2">
          <label htmlFor="manual-code">Número da Carteira</label>
          <div className="flex gap-2">
            <input
              id="manual-code"
              placeholder="SP-2025-0001234"
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              className="font-mono flex-1"
              disabled={isLoading}
            />
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Buscando..." : "Buscar"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
