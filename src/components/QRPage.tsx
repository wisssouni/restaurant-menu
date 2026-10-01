"use client";

import { useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Download, ExternalLink, Printer } from "lucide-react";

interface Props {
  restaurantName: string;
  menuUrl: string;
}

export default function QRPage({ restaurantName, menuUrl }: Props) {
  const canvasRef = useRef<HTMLDivElement>(null);

  function downloadQR() {
    const canvas = canvasRef.current?.querySelector("canvas");
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `${restaurantName.replace(/\s+/g, "-").toLowerCase()}-qr.png`;
    a.click();
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">QR Code</h1>
        <p className="text-sm text-gray-500 mt-1">Print and place on each table so customers can scan and view your menu.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-start">
        {/* QR Card */}
        <div className="card flex flex-col items-center gap-5">
          <div
            ref={canvasRef}
            className="p-5 bg-white rounded-2xl border-2 border-gray-100 shadow-inner"
          >
            <QRCodeCanvas
              value={menuUrl}
              size={200}
              bgColor="#ffffff"
              fgColor="#111827"
              level="M"
            />
          </div>
          <div className="text-center">
            <p className="font-bold text-gray-900">{restaurantName}</p>
            <a
              href={menuUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-orange-500 hover:underline flex items-center justify-center gap-1 mt-1"
            >
              {menuUrl.replace(/^https?:\/\//, "")} <ExternalLink size={11} />
            </a>
          </div>
          <div className="flex flex-col gap-2 w-full">
            <button onClick={downloadQR} className="btn-primary flex items-center justify-center gap-2">
              <Download size={16} />
              Download PNG
            </button>
            <a
              href={menuUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary flex items-center justify-center gap-2"
            >
              <ExternalLink size={16} />
              Preview menu
            </a>
          </div>
        </div>

        {/* Tips */}
        <div className="space-y-4">
          <div className="card">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-orange-100 rounded-xl">
                <Printer size={18} className="text-orange-500" />
              </div>
              <h2 className="font-bold text-gray-900">Printing tips</h2>
            </div>
            <ul className="space-y-2.5">
              {[
                "Download the PNG and print at least 5×5 cm so it's easy to scan",
                "Laminate it or use a table tent holder for durability",
                "One QR code works for all tables — same URL, same menu",
                "Test the scan with your phone before printing in bulk",
              ].map((tip, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-gray-600">
                  <span className="w-5 h-5 rounded-full bg-gray-100 text-gray-500 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>

          <div className="card bg-orange-50 border-orange-100">
            <p className="text-sm font-semibold text-orange-800 mb-1">Your menu URL</p>
            <p className="text-xs text-orange-600 break-all">{menuUrl}</p>
            <p className="text-xs text-orange-500 mt-2">
              Share this link directly with customers too — no QR needed.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
