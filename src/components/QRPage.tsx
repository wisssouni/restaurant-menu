"use client";

import { useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Download, ExternalLink, Smartphone, Layers, Shield, Zap } from "lucide-react";

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
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">QR Code</h1>
        <p className="text-gray-500 mt-1 text-sm">One scan — instant menu. Place on every table.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">

        {/* QR card — takes 2 cols */}
        <div className="lg:col-span-2">
          <div className="card flex flex-col items-center gap-6">
            {/* QR code with decorative frame */}
            <div className="relative">
              <div className="absolute -inset-3 rounded-3xl bg-gradient-to-br from-orange-100 to-amber-50 -z-10" />
              <div
                ref={canvasRef}
                className="p-4 bg-white rounded-2xl shadow-md border border-gray-100"
              >
                <QRCodeCanvas
                  value={menuUrl}
                  size={180}
                  bgColor="#ffffff"
                  fgColor="#111827"
                  level="M"
                />
              </div>
            </div>

            <div className="text-center w-full">
              <p className="font-black text-gray-900 text-lg">{restaurantName}</p>
              <a
                href={menuUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-orange-500 hover:underline flex items-center justify-center gap-1 mt-1 break-all"
              >
                {menuUrl.replace(/^https?:\/\//, "")} <ExternalLink size={10} />
              </a>
            </div>

            <div className="flex flex-col gap-2.5 w-full">
              <button
                onClick={downloadQR}
                className="btn-orange flex items-center justify-center gap-2 w-full"
              >
                <Download size={15} />
                Download PNG
              </button>
              <a
                href={menuUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary flex items-center justify-center gap-2 w-full"
              >
                <ExternalLink size={15} />
                Preview menu
              </a>
            </div>
          </div>
        </div>

        {/* Right side — 3 cols */}
        <div className="lg:col-span-3 space-y-4">

          {/* Tips */}
          <div className="card">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">How to use</p>
            <div className="space-y-4">
              {[
                { icon: <Download size={16} />, title: "Download", desc: "Save the PNG file to your computer", color: "bg-blue-50 text-blue-500" },
                { icon: <Layers size={16} />, title: "Print", desc: "Print at minimum 5×5 cm for easy scanning", color: "bg-violet-50 text-violet-500" },
                { icon: <Shield size={16} />, title: "Protect", desc: "Laminate or use a table tent holder", color: "bg-emerald-50 text-emerald-500" },
                { icon: <Smartphone size={16} />, title: "Place", desc: "One QR works for all tables — same menu", color: "bg-orange-50 text-orange-500" },
              ].map((step, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className={`p-2 rounded-xl shrink-0 ${step.color}`}>{step.icon}</div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{step.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* URL card */}
          <div className="rounded-2xl bg-gray-900 text-white p-5">
            <div className="flex items-center gap-2 mb-2">
              <Zap size={14} className="text-orange-400" />
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Direct link</p>
            </div>
            <p className="text-xs text-gray-300 break-all leading-relaxed">{menuUrl}</p>
            <p className="text-xs text-gray-500 mt-3">
              Share directly on Instagram, WhatsApp, or Google Maps.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
