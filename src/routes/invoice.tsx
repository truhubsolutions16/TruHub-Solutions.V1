import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Trash2, Printer, Download } from "lucide-react";

const TITLE = "Invoice Generator — TruHub Solutions";
const DESC = "Generate and print professional invoices for TruHub Solutions clients.";
const SITE_URL = "https://truhubsolutions.lovable.app";

export const Route = createFileRoute("/invoice")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { name: "robots", content: "noindex,nofollow" },
      { property: "og:url", content: `${SITE_URL}/invoice` },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/invoice` }],
  }),
  component: InvoicePage,
});

type Item = { description: string; qty: number; rate: number };

function todayISO() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

function InvoicePage() {
  const [invoiceNo, setInvoiceNo] = useState(`TRU-${new Date().getFullYear()}-001`);
  const [issueDate, setIssueDate] = useState(todayISO());
  const [dueDate, setDueDate] = useState(todayISO());
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const [notes, setNotes] = useState("Thank you for your business. Payments due on receipt.");
  const [taxPct, setTaxPct] = useState(18);
  const [currency, setCurrency] = useState("₹");
  const [items, setItems] = useState<Item[]>([
    { description: "Website design & development", qty: 1, rate: 0 },
  ]);

  const subtotal = useMemo(
    () => items.reduce((s, i) => s + (Number(i.qty) || 0) * (Number(i.rate) || 0), 0),
    [items],
  );
  const tax = useMemo(() => (subtotal * (Number(taxPct) || 0)) / 100, [subtotal, taxPct]);
  const total = subtotal + tax;

  function updateItem(i: number, patch: Partial<Item>) {
    setItems((prev) => prev.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  }
  function addItem() {
    setItems((prev) => [...prev, { description: "", qty: 1, rate: 0 }]);
  }
  function removeItem(i: number) {
    setItems((prev) => prev.filter((_, idx) => idx !== i));
  }

  const fmt = (n: number) =>
    `${currency}${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="min-h-screen bg-background text-white">
      {/* Toolbar (hidden on print) */}
      <div className="print:hidden sticky top-0 z-20 border-b border-white/10 bg-background/80 backdrop-blur">
        <div className="container-x flex items-center justify-between py-4">
          <div className="font-display text-lg font-semibold">
            Invoice <span className="text-[#38BDF8]">Generator</span>
          </div>
          <div className="flex gap-2">
            <button onClick={() => window.print()} className="btn-primary btn-primary-hover">
              <Printer size={16} /> Print / Save PDF
            </button>
            <a href="/" className="btn-ghost btn-ghost-hover">
              <Download size={16} /> Done
            </a>
          </div>
        </div>
      </div>

      <div className="container-x grid gap-8 py-10 lg:grid-cols-[380px_1fr] print:block print:py-0">
        {/* Form */}
        <aside className="print:hidden space-y-4 rounded-2xl border border-white/10 bg-white/[0.02] p-5">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Invoice #"><input className="inp" value={invoiceNo} onChange={(e) => setInvoiceNo(e.target.value)} /></Field>
            <Field label="Currency"><input className="inp" value={currency} onChange={(e) => setCurrency(e.target.value)} /></Field>
            <Field label="Issue date"><input type="date" className="inp" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} /></Field>
            <Field label="Due date"><input type="date" className="inp" value={dueDate} onChange={(e) => setDueDate(e.target.value)} /></Field>
          </div>
          <Field label="Client name"><input className="inp" value={clientName} onChange={(e) => setClientName(e.target.value)} /></Field>
          <Field label="Client email"><input className="inp" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} /></Field>
          <Field label="Client address"><textarea className="inp min-h-[64px]" value={clientAddress} onChange={(e) => setClientAddress(e.target.value)} /></Field>

          <div className="border-t border-white/10 pt-3">
            <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/60">Line items</div>
            <div className="space-y-3">
              {items.map((it, i) => (
                <div key={i} className="rounded-lg border border-white/10 bg-white/[0.02] p-3 space-y-2">
                  <input className="inp" placeholder="Description" value={it.description} onChange={(e) => updateItem(i, { description: e.target.value })} />
                  <div className="grid grid-cols-3 gap-2">
                    <input className="inp" type="number" min={0} placeholder="Qty" value={it.qty} onChange={(e) => updateItem(i, { qty: Number(e.target.value) })} />
                    <input className="inp col-span-2" type="number" min={0} step="0.01" placeholder="Rate" value={it.rate} onChange={(e) => updateItem(i, { rate: Number(e.target.value) })} />
                  </div>
                  <button onClick={() => removeItem(i)} className="text-xs text-white/50 hover:text-red-400 inline-flex items-center gap-1">
                    <Trash2 size={12} /> Remove
                  </button>
                </div>
              ))}
              <button onClick={addItem} className="btn-ghost btn-ghost-hover w-full justify-center">
                <Plus size={14} /> Add item
              </button>
            </div>
          </div>

          <Field label="Tax %"><input type="number" min={0} className="inp" value={taxPct} onChange={(e) => setTaxPct(Number(e.target.value))} /></Field>
          <Field label="Notes"><textarea className="inp min-h-[80px]" value={notes} onChange={(e) => setNotes(e.target.value)} /></Field>
        </aside>

        {/* Preview */}
        <section id="invoice-preview" className="rounded-2xl bg-white p-10 text-slate-900 shadow-2xl print:rounded-none print:shadow-none print:p-8">
          <header className="flex items-start justify-between border-b border-slate-200 pb-6">
            <div className="flex items-center gap-3">
              <img src="/truhub-logo.webp" alt="TruHub" width={48} height={48} className="h-12 w-12 rounded-lg object-contain" />
              <div>
                <div className="text-xl font-bold">TruHub Solutions</div>
                <div className="text-xs text-slate-500">Build. Grow. Succeed.</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold tracking-tight">INVOICE</div>
              <div className="mt-1 text-xs text-slate-500">#{invoiceNo}</div>
            </div>
          </header>

          <div className="mt-6 grid grid-cols-2 gap-6 text-sm">
            <div>
              <div className="text-xs uppercase tracking-wider text-slate-500">Billed to</div>
              <div className="mt-1 font-semibold">{clientName || "—"}</div>
              <div className="text-slate-600">{clientEmail}</div>
              <div className="whitespace-pre-line text-slate-600">{clientAddress}</div>
            </div>
            <div className="text-right">
              <div className="text-xs uppercase tracking-wider text-slate-500">From</div>
              <div className="mt-1 font-semibold">TruHub Solutions</div>
              <div className="text-slate-600">truhub.solutions@gmail.com</div>
              <div className="text-slate-600">+91 7989367882</div>
              <div className="mt-3 grid grid-cols-2 gap-x-4 text-xs">
                <div className="text-slate-500">Issue date</div><div>{issueDate}</div>
                <div className="text-slate-500">Due date</div><div>{dueDate}</div>
              </div>
            </div>
          </div>

          <table className="mt-8 w-full text-sm">
            <thead>
              <tr className="border-b border-slate-300 text-left text-xs uppercase tracking-wider text-slate-500">
                <th className="py-2">Description</th>
                <th className="py-2 w-16 text-right">Qty</th>
                <th className="py-2 w-28 text-right">Rate</th>
                <th className="py-2 w-32 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it, i) => (
                <tr key={i} className="border-b border-slate-100">
                  <td className="py-3">{it.description || "—"}</td>
                  <td className="py-3 text-right">{it.qty}</td>
                  <td className="py-3 text-right">{fmt(it.rate)}</td>
                  <td className="py-3 text-right">{fmt(it.qty * it.rate)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-6 flex justify-end">
            <div className="w-full max-w-xs space-y-1 text-sm">
              <Row label="Subtotal" value={fmt(subtotal)} />
              <Row label={`Tax (${taxPct}%)`} value={fmt(tax)} />
              <div className="border-t border-slate-300 pt-2 mt-2 flex justify-between text-base font-bold">
                <span>Total</span><span>{fmt(total)}</span>
              </div>
            </div>
          </div>

          {notes && (
            <div className="mt-8 rounded-lg bg-slate-50 p-4 text-xs text-slate-600">
              <div className="mb-1 font-semibold uppercase tracking-wider text-slate-500">Notes</div>
              {notes}
            </div>
          )}

          <footer className="mt-8 border-t border-slate-200 pt-4 text-center text-xs text-slate-400">
            Thank you for choosing TruHub Solutions.
          </footer>
        </section>
      </div>

      <style>{`
        .inp { width:100%; background: rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.1); border-radius:8px; padding:8px 10px; color:white; font-size:13px; }
        .inp:focus { outline:none; border-color: #38BDF8; }
        @media print {
          body { background: white !important; }
          .print\\:hidden { display: none !important; }
          #invoice-preview { box-shadow: none !important; }
        }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-white/60">{label}</span>
      {children}
    </label>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-slate-600">
      <span>{label}</span><span className="text-slate-900">{value}</span>
    </div>
  );
}
