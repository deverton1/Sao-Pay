import QRCodeScanner from "../QRCodeScanner";

export default function QRCodeScannerExample() {
  return (
    <div className="max-w-md mx-auto p-8">
      <QRCodeScanner
        onScan={(numeroCarteira) => {
          console.log("QR Code escaneado:", numeroCarteira);
          alert(`Carteira detectada: ${numeroCarteira}`);
        }}
      />
    </div>
  );
}
