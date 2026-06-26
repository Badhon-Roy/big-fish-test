"use client";

import { useCustomizerStore } from "./store";
import { JERSEY_DESIGNS } from "./types";
import { JerseySVG } from "./JerseySVG";
import { ShoppingCart } from "lucide-react";

export function SummaryPanel() {
  const state = useCustomizerStore((s) => s.state);
  const qty = useCustomizerStore((s) => s.qty);
  const setQty = useCustomizerStore((s) => s.setQty);
  const selectedDesign = useCustomizerStore((s) => s.selectedDesign);

  const calculatePrice = () => {
    let base = 49;
    if (qty >= 10 && qty < 50) base = 39;
    if (qty >= 50) base = 29;
    if (state.fabric === "Premium") base += 10;
    return base * qty;
  };

  const currentPattern =
    JERSEY_DESIGNS.find((d) => d.id === selectedDesign)?.pattern ?? "plain";

  const totalCollarZipPrice =
    state.collar &&
    (state.collarType === "Polo" || state.collarType === "Henley") &&
    state.zipper
      ? 5 * qty
      : 0;

  const totalPrice = calculatePrice() + totalCollarZipPrice;

  return (
    <div className="w-full md:w-72 bg-white border-l border-zinc-200 flex flex-col h-full shadow-2xl z-20">
      <div className="p-5 border-b border-zinc-200 flex-1 overflow-y-auto custom-scrollbar">
        <h2 className="text-lg font-bold text-zinc-900 mb-5">Order Summary</h2>

        {/* Live preview thumbnail */}
        <div className="w-24 h-24 mx-auto mb-4">
          <JerseySVG
            primary={state.primary}
            secondary={state.designColor || state.secondary}
            pattern={currentPattern}
            selected={false}
          />
        </div>
        <p className="text-center text-xs font-bold text-zinc-500 mb-5 capitalize">
          {JERSEY_DESIGNS.find((d) => d.id === selectedDesign)?.label} · {state.sleeve} Sleeve
        </p>

        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-zinc-500">Base Jersey</span>
            <span className="font-bold text-zinc-900">
              ${qty >= 10 ? (qty >= 50 ? "29" : "39") : "49"}
            </span>
          </div>
          {state.fabric === "Premium" && (
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">Premium Fabric</span>
              <span className="font-bold text-zinc-900">+$10</span>
            </div>
          )}
          {state.collar && (
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">Collar</span>
              <span className="font-bold text-zinc-900">Included</span>
            </div>
          )}
          {state.collar &&
            (state.collarType === "Polo" || state.collarType === "Henley") && (
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Closure</span>
                <span className="font-bold text-zinc-900">
                  {state.zipper ? "Zipper (+$5)" : "Button Placket"}
                </span>
              </div>
            )}

          <div className="border-t border-zinc-100 pt-4">
            <label className="text-xs font-bold text-zinc-500 mb-2 block uppercase tracking-wider">
              Quantity
            </label>
            <input
              type="number"
              min="1"
              value={qty}
              onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full border border-zinc-200 rounded-xl p-2.5 text-center font-bold focus:outline-red-500 text-lg"
            />
            <div className="text-[11px] text-green-600 mt-2 font-semibold text-center">
              {qty >= 50
                ? "🎉 50+ Bulk discount applied!"
                : qty >= 10
                ? `Team discount! Add ${50 - qty} more for bulk rate.`
                : `Add ${10 - qty} more for team discount.`}
            </div>
          </div>
        </div>
      </div>

      <div className="p-5 bg-zinc-50 border-t border-zinc-200">
        <div className="flex justify-between items-center mb-4">
          <span className="font-bold text-zinc-600">Total</span>
          <span className="text-3xl font-extrabold text-zinc-900">${totalPrice}</span>
        </div>
        <button className="w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] text-sm cursor-pointer">
          <ShoppingCart className="w-5 h-5" /> Proceed to Checkout
        </button>
      </div>
    </div>
  );
}

export default SummaryPanel;
