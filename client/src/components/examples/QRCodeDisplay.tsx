import QRCodeDisplay from "../QRCodeDisplay";

export default function QRCodeDisplayExample() {
  return (
    <div className="p-8">
      <QRCodeDisplay
        numeroCarteira="SP-2025-0001234"
        saldo={50.00}
        onDownload={() => console.log("Download QR Code")}
        onPrint={() => console.log("Imprimir QR Code")}
      />
    </div>
  );
}
