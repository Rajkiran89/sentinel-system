"use client";

import { useState } from 'react';

export default function Home() {
  const [amount, setAmount] = useState(500);
  const [userId, setUserId] = useState("user_01");
  const [status, setStatus] = useState<"idle" | "processing" | "approved" | "rejected">("idle");
  const [logs, setLogs] = useState<string[]>([]);

  const runSimulation = async () => {
    setStatus("processing");
    setLogs(["[Gateway] Sending Ingestion Request...", "[System] Waiting for AI Scoring..."]);
    
    try {
      const res = await fetch("http://localhost:8080/ingest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          user_id: userId, 
          amount: Number(amount), 
          location: "Web Dashboard"
        }),
      });

      if (!res.ok) throw new Error("Backend Error");

      const data = await res.json();
      
      // Note: We check data.is_fraud which comes from your Python service
      const isApproved = !data.is_fraud;
      
      setLogs(prev => [
        ...prev, 
        `[AI Service] Score: ${data.score}`, 
        `[Result] ${isApproved ? "APPROVED" : "BLOCKED: " + data.message}`
      ]);
      
      setStatus(isApproved ? "approved" : "rejected");
    } catch (err) {
      console.error(err);
      setLogs(prev => [...prev, "[Error] Connection Failed. Ensure Gateway (8080) and AI (8000) are running."]);
      setStatus("idle");
    }
  };

  return (
    <main className="min-h-screen bg-slate-900 text-white p-8 font-sans">
      <h1 className="text-3xl font-bold mb-8 text-blue-400">Sentinel | System Visualizer</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="bg-slate-800 p-6 rounded-xl border border-slate-700">
          <h2 className="text-xl mb-4 font-semibold">Transaction Simulator</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400">User ID</label>
              <input value={userId} onChange={e => setUserId(e.target.value)} className="w-full bg-slate-900 border border-slate-600 p-2 rounded mt-1 outline-none focus:border-blue-500"/>
            </div>
            <div>
              <label className="block text-sm text-slate-400">Amount ($)</label>
              <input type="number" value={amount} onChange={e => setAmount(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-600 p-2 rounded mt-1 outline-none focus:border-blue-500"/>
            </div>
            <button onClick={runSimulation} className="w-full bg-blue-600 hover:bg-blue-500 p-3 rounded font-bold transition-all disabled:opacity-50" disabled={status === "processing"}>
              {status === "processing" ? "Tracing..." : "Execute Fraud Check"}
            </button>
          </div>
        </section>

        <section className="bg-slate-800 p-6 rounded-xl border border-slate-700">
          <h2 className="text-xl mb-4 font-semibold">Live Architecture Trace</h2>
          <div className="flex flex-col items-center space-y-12 py-8">
            <Node name="Gateway (Go)" active={status === "processing"} success={status === "approved" || status === "rejected"} />
            <Node name="AI Engine (Py)" 
                  active={status === "processing"} 
                  failed={status === "rejected"} 
                  success={status === "approved"} />
          </div>
        </section>
      </div>

      <div className="mt-8 bg-black p-4 rounded-lg font-mono text-sm border border-slate-800 h-40 overflow-y-auto">
        {logs.map((log, i) => <div key={i} className="text-emerald-400">{log}</div>)}
      </div>
    </main>
  );
}

function Node({ name, active, success, failed }: any) {
  let color = "bg-slate-700 border-slate-500 text-slate-400";
  if (active) color = "bg-blue-900 border-blue-400 text-white animate-pulse";
  if (success) color = "bg-emerald-900 border-emerald-400 text-white";
  if (failed) color = "bg-red-900 border-red-500 text-white";

  return (
    <div className={`w-48 p-4 border-2 rounded-lg text-center font-bold transition-all duration-500 ${color}`}>
      {name}
    </div>
  );
}