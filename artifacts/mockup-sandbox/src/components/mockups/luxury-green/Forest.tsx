import { useState } from "react";
import { Plane, Search, LayoutDashboard, ListFilter, ArrowLeftRight, Users, ChevronDown, Clock, Zap } from "lucide-react";

export function Forest() {
  const [activeNav, setActiveNav] = useState("search");

  return (
    <div className="flex h-screen font-['Inter'] overflow-hidden" style={{ background: "linear-gradient(135deg, #052e16 0%, #14532d 40%, #166534 100%)" }}>
      {/* Glassmorphic sidebar */}
      <aside className="w-60 flex-shrink-0 flex flex-col m-3 rounded-3xl" style={{ background: "rgba(255,255,255,0.07)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.12)" }}>
        {/* Logo */}
        <div className="h-18 flex items-center px-6 pt-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.15)" }}>
              <Plane className="h-5 w-5 text-white rotate-45" />
            </div>
            <div>
              <div className="text-white font-black text-base tracking-tight">AeroOps</div>
              <div className="text-green-300 text-xs font-medium">Business Suite</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="px-3 flex-1 space-y-1 mt-2">
          {[
            { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
            { id: "search", icon: Search, label: "Flight Search" },
            { id: "orders", icon: ListFilter, label: "Orders" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveNav(item.id)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all"
              style={activeNav === item.id
                ? { background: "rgba(255,255,255,0.95)", color: "#14532d" }
                : { color: "rgba(255,255,255,0.65)" }
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </button>
          ))}
        </nav>

        {/* User */}
        <div className="p-4 mt-4">
          <div className="rounded-2xl p-3 flex items-center gap-3" style={{ background: "rgba(255,255,255,0.08)" }}>
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white text-xs font-bold">JS</div>
            <div>
              <div className="text-white text-sm font-semibold">James Smith</div>
              <div className="text-green-300 text-xs">Pro Plan</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col overflow-hidden p-3 pl-0">
        <div className="flex-1 rounded-3xl overflow-hidden flex flex-col" style={{ background: "#f8fffe" }}>
          {/* Top bar */}
          <header className="h-16 flex items-center justify-between px-8 border-b border-green-100">
            <div className="flex items-center gap-3">
              <h1 className="text-lg font-black text-gray-900">Flight Search</h1>
              <span className="px-3 py-1 rounded-full text-xs font-semibold" style={{ background: "#dcfce7", color: "#15803d" }}>
                <Zap className="inline h-3 w-3 mr-1" />Live
              </span>
            </div>
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ background: "linear-gradient(135deg, #16a34a, #15803d)" }}>JS</div>
          </header>

          <div className="flex-1 overflow-auto p-6">
            {/* Search form floating card */}
            <div className="rounded-3xl p-6 mb-6 shadow-xl" style={{ background: "linear-gradient(135deg, #166534 0%, #15803d 100%)" }}>
              <div className="text-white/60 text-xs uppercase tracking-widest font-semibold mb-4">Search Flights</div>

              <div className="flex gap-3 mb-4 items-end">
                <div className="flex-1">
                  <div className="text-white/70 text-xs mb-2 font-medium">From</div>
                  <div className="flex items-center gap-2 px-4 py-3.5 rounded-2xl" style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)" }}>
                    <Plane className="h-4 w-4 text-white/60" />
                    <span className="font-bold text-white">LHR</span>
                    <span className="text-white/50 text-sm">London</span>
                  </div>
                </div>
                <button className="mb-0.5 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.2)" }}>
                  <ArrowLeftRight className="h-4 w-4 text-white" />
                </button>
                <div className="flex-1">
                  <div className="text-white/70 text-xs mb-2 font-medium">To</div>
                  <div className="flex items-center gap-2 px-4 py-3.5 rounded-2xl" style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)" }}>
                    <Plane className="h-4 w-4 text-white/60 rotate-45" />
                    <span className="font-bold text-white">JFK</span>
                    <span className="text-white/50 text-sm">New York</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-5">
                {[
                  { label: "Date", value: "May 12, 2026" },
                  { label: "Passengers", value: "2 Adults" },
                  { label: "Cabin", value: "Business" },
                ].map((f) => (
                  <div key={f.label}>
                    <div className="text-white/70 text-xs mb-2 font-medium">{f.label}</div>
                    <div className="flex items-center justify-between px-4 py-3.5 rounded-2xl" style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)" }}>
                      <span className="text-white font-medium text-sm">{f.value}</span>
                      <ChevronDown className="h-4 w-4 text-white/40" />
                    </div>
                  </div>
                ))}
              </div>

              <button className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-sm tracking-wide transition-all hover:scale-[1.02]"
                style={{ background: "white", color: "#15803d", boxShadow: "0 8px 32px rgba(0,0,0,0.2)" }}>
                <Search className="h-4 w-4" />
                Search Flights
              </button>
            </div>

            {/* Results */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-black text-gray-900 text-sm">12 Results</h2>
                <span className="text-xs text-gray-400">Sorted by price ↑</span>
              </div>
              {[
                { airline: "BA", name: "British Airways", dep: "09:00", arr: "12:00", dur: "7h 00m", price: "£1,240", tag: "Cheapest" },
                { airline: "AA", name: "American Airlines", dep: "11:30", arr: "14:45", dur: "7h 15m", price: "£1,380", tag: null },
                { airline: "VS", name: "Virgin Atlantic", dep: "15:00", arr: "18:20", dur: "7h 20m", price: "£1,420", tag: null },
              ].map((f, i) => (
                <div key={i} className="rounded-2xl bg-white p-4 flex items-center gap-4 border border-gray-100 hover:border-green-300 hover:shadow-md transition-all">
                  <div className="w-11 h-11 rounded-2xl flex items-center justify-center font-black text-xs text-white flex-shrink-0"
                    style={{ background: "linear-gradient(135deg, #166534, #16a34a)" }}>
                    {f.airline}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-gray-800 text-sm">{f.name}</span>
                      {f.tag && <span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: "#dcfce7", color: "#15803d" }}>{f.tag}</span>}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span className="font-bold text-gray-900">{f.dep}</span>
                      <Clock className="h-3 w-3 text-gray-300" />
                      <span className="text-xs">{f.dur}</span>
                      <span className="font-bold text-gray-900">{f.arr}</span>
                      <span className="text-xs font-medium text-green-600">Direct</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-xl font-black" style={{ color: "#15803d" }}>{f.price}</span>
                    <button className="px-4 py-2 rounded-full text-xs font-bold text-white"
                      style={{ background: "linear-gradient(135deg, #166534, #16a34a)" }}>
                      Select
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
