"use client";

import { useRef, useEffect, useState } from "react";
import { useReactToPrint } from "react-to-print";
import { formatCurrency, formatDate } from "@/lib/utils";

type Item = { description: string; quantity: number; unit: string; price: number };
type Client = { name: string; email?: string; address?: string; city?: string; province?: string };
type Bank = { bankName: string; accountName: string; accountNumber: string };

type Props = {
  businessName: string;
  businessAddress?: string;
  businessNpwp?: string;
  logoUrl?: string | null;
  client: Client;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  items: Item[];
  subtotal: number;
  discount: number;
  ppn: number;
  pph: number;
  total: number;
  bank?: Bank | null;
  notes?: string;
  terms?: string;
};

export default function InvoicePreview({
  businessName,
  businessAddress,
  businessNpwp,
  logoUrl,
  client,
  invoiceNumber,
  issueDate,
  dueDate,
  items,
  subtotal,
  discount,
  ppn,
  pph,
  total,
  bank,
  notes,
  terms,
}: Props) {
  const printRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [isAutoFit, setIsAutoFit] = useState(true);

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `Invoice-${invoiceNumber}`,
  });

  useEffect(() => {
    const updateScale = () => {
      if (isAutoFit && containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const targetWidth = 794; // A4 width in pixels at 96 DPI
        const newScale = Math.min((containerWidth - 48) / targetWidth, 1);
        setScale(newScale);
      }
    };

    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, [isAutoFit]);

  const handleZoomIn = () => {
    setIsAutoFit(false);
    setScale((prev) => Math.min(prev + 0.1, 2));
  };

  const handleZoomOut = () => {
    setIsAutoFit(false);
    setScale((prev) => Math.max(prev - 0.1, 0.3));
  };

  const handleToggleFit = () => {
    setIsAutoFit(true);
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full h-full" ref={containerRef}>
      <div className="w-full flex flex-wrap justify-between items-center sticky top-0 z-10 bg-slate-100/80 dark:bg-slate-950/80 backdrop-blur-sm py-2 gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">visibility</span>
            <h3 className="font-bold text-slate-700 dark:text-slate-300">Live Preview</h3>
          </div>
          
          <div className="flex items-center bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-1 shadow-sm">
            <button
              type="button"
              onClick={handleZoomOut}
              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
              title="Zoom Out"
            >
              <span className="material-symbols-outlined text-lg">zoom_out</span>
            </button>
            <span className="text-xs font-medium w-12 text-center text-slate-600 dark:text-slate-400">
              {Math.round(scale * 100)}%
            </span>
            <button
              type="button"
              onClick={handleZoomIn}
              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
              title="Zoom In"
            >
              <span className="material-symbols-outlined text-lg">zoom_in</span>
            </button>
            <div className="w-px h-4 bg-slate-200 dark:border-slate-800 mx-1" />
            <button
              type="button"
              onClick={handleToggleFit}
              className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded transition-colors ${
                isAutoFit
                  ? "bg-primary/10 text-primary"
                  : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              Fit
            </button>
          </div>
        </div>

        <button type="button" onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-bold text-sm hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
          <span className="material-symbols-outlined text-lg">picture_as_pdf</span>
          Print PDF
        </button>
      </div>

      <div 
        className="origin-top transition-transform duration-200"
        style={{ transform: `scale(${scale})` }}
      >
        <div
          ref={printRef}
          className="bg-white text-slate-900 p-[50px] flex flex-col shadow-2xl overflow-hidden"
          style={{ 
            width: "794px", 
            minHeight: "1123px",
            aspectRatio: "1 / 1.414"
          }}
        >
          <div className="flex justify-between items-start mb-12">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                {logoUrl ? (
                  <img src={logoUrl} alt="Logo" className="h-12 w-auto object-contain" />
                ) : (
                  <div className="size-12 bg-slate-900 text-white flex items-center justify-center rounded-xl">
                    <span className="material-symbols-outlined text-2xl">receipt_long</span>
                  </div>
                )}
                <span className="text-3xl font-black tracking-tighter">INVOI</span>
              </div>
              <div className="text-[13px] text-slate-500 leading-relaxed">
                <p className="font-bold text-slate-900 text-base mb-1">{businessName}</p>
                {businessAddress && <p className="max-w-[300px]">{businessAddress}</p>}
                {businessNpwp && <p className="mt-1">NPWP: <span className="text-slate-700 font-medium">{businessNpwp}</span></p>}
              </div>
            </div>
            <div className="text-right">
              <h1 className="text-5xl font-black text-primary tracking-tighter mb-4">INVOICE</h1>
              <div className="space-y-1">
                <p className="text-sm font-bold text-slate-900">NO. {invoiceNumber}</p>
                <p className="text-xs text-slate-500">Date: {formatDate(issueDate)}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-16 mb-12">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-3 border-b border-slate-100 pb-2">Billed To</p>
              <p className="text-lg font-extrabold text-slate-900 mb-1">{client.name}</p>
              <div className="text-[13px] text-slate-500 leading-relaxed whitespace-pre-line">
                {[client.address, client.city && client.province ? `${client.city}, ${client.province}` : client.city || client.province, client.email].filter(Boolean).join("\n")}
              </div>
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-3 border-b border-slate-100 pb-2">Payment Info</p>
              <div className="space-y-2">
                <p className="text-[13px] text-slate-500 flex justify-between">
                  <span>Due Date:</span>
                  <span className="font-bold text-slate-900">{formatDate(dueDate)}</span>
                </p>
                {bank && (
                  <div className="pt-2 space-y-1">
                    <p className="text-[13px] text-slate-500 flex justify-between">
                      <span>Bank:</span>
                      <span className="font-semibold text-slate-800">{bank.bankName}</span>
                    </p>
                    <p className="text-[13px] text-slate-500 flex justify-between">
                      <span>Account Name:</span>
                      <span className="font-semibold text-slate-800">{bank.accountName}</span>
                    </p>
                    <p className="text-[13px] text-slate-500 flex justify-between">
                      <span>Account No:</span>
                      <span className="font-bold text-slate-900">{bank.accountNumber}</span>
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex-1">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-slate-900">
                  <th className="text-left py-5 text-[11px] font-black uppercase tracking-widest">Description</th>
                  <th className="text-center py-5 text-[11px] font-black uppercase tracking-widest w-20">Qty</th>
                  <th className="text-right py-5 text-[11px] font-black uppercase tracking-widest w-32">Price</th>
                  <th className="text-right py-5 text-[11px] font-black uppercase tracking-widest w-32">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item, i) => (
                  <tr key={i}>
                    <td className="py-5 text-[14px] font-bold text-slate-800">{item.description}</td>
                    <td className="py-5 text-[14px] text-center text-slate-600">{item.quantity} {item.unit}</td>
                    <td className="py-5 text-[14px] text-right text-slate-600">{formatCurrency(item.price)}</td>
                    <td className="py-5 text-[14px] font-bold text-right text-slate-900">{formatCurrency(item.quantity * item.price)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-12 border-t-2 border-slate-100 pt-10 flex justify-between items-start">
            <div className="w-1/2 pr-12">
              {(notes || terms) && (
                <div className="space-y-4">
                  {notes && (
                    <div>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Notes</p>
                      <p className="text-[12px] text-slate-600 leading-relaxed">{notes}</p>
                    </div>
                  )}
                  {terms && (
                    <div>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Terms & Conditions</p>
                      <p className="text-[12px] text-slate-600 leading-relaxed">{terms}</p>
                    </div>
                  )}
                </div>
              )}
              {!notes && !terms && (
                <p className="text-[12px] text-slate-400 italic">Thank you for your business.</p>
              )}
            </div>
            <div className="w-[280px] space-y-3">
              <div className="flex justify-between text-[14px]">
                <span className="text-slate-500">Subtotal</span>
                <span className="font-bold text-slate-900">{formatCurrency(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-[14px]">
                  <span className="text-slate-500">Discount</span>
                  <span className="font-bold text-red-600">-{formatCurrency(discount)}</span>
                </div>
              )}
              {ppn > 0 && (
                <div className="flex justify-between text-[14px]">
                  <span className="text-slate-500">PPN</span>
                  <span className="font-bold text-slate-900">{formatCurrency(ppn)}</span>
                </div>
              )}
              {pph > 0 && (
                <div className="flex justify-between text-[14px]">
                  <span className="text-slate-500">PPh 23</span>
                  <span className="font-bold text-slate-900">-{formatCurrency(pph)}</span>
                </div>
              )}
              <div className="flex justify-between text-2xl border-t-2 border-slate-900 pt-4 mt-2">
                <span className="font-black tracking-tighter">TOTAL</span>
                <span className="font-black text-primary tracking-tighter">{formatCurrency(total)}</span>
              </div>
            </div>
          </div>
          
          <div className="mt-16 pt-8 border-t border-slate-100 text-center">
            <p className="text-[10px] text-slate-400 uppercase tracking-[0.3em]">Generated by INVOI</p>
          </div>
        </div>
      </div>
    </div>
  );
}
