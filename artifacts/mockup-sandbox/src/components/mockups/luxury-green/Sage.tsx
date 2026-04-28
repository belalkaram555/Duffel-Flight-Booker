import { useState } from "react";
import { Plane, Search, LayoutDashboard, ListFilter, ArrowRight, Users, Clock, Sparkles } from "lucide-react";

export function Sage() {
  const [activeNav, setActiveNav] = useState("search");

  return (
    <div className="flex h-screen font-['Inter'] overflow-hidden" style={{ background: "#f0fdf4" }}>
      {/* Sidebar — white with green accents */}
      <aside className="w-64 flex-shrink-0 flex flex-col bg-white border-r" style={{ borderColor: "#dcfce7" }}>
        {/* Logo */}
        <div className="h-20 flex items-center px-8 border-b" style={{ borderColor: "#dcfce7" }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "#dcfce7" }}>
              <Plane className="h-5 w-5 rotate-45" style={{ color: "#15803d" }} />
            </div>
            <span className="font-black text-gray-900 text-base tracking-tight">AeroOps</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="p-5 flex-1 space-y-1">
          {[
            { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
            { id: "search", icon: Search, label: "Flight Search" },
            { id: "orders", icon: ListFilter, label: "Orders" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveNav(item.id)}
              className="w-full flex items-center gap-3 px-5 py-3 rounded-full text-sm font-semibold transition-all"
              style={activeNav === item.id
                ? { background: "#15803d", color: "white" }
                : { color: "#6b7280" }
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </button>
          ))}
        </nav>

        {/* Plan badge */}
        <div className="p-5">
          <div className="rounded-2xl p-4 text-center" style={{ background: "linear-gradient(135deg, #f0fdf4, #dcfce7)" }}>
            <Sparkles className="h-5 w-5 mx-auto mb-1.5" style={{ color: "#15803d" }} />
            <div className="text-xs font-bold text-gray-700">Premium Plan</div>
            <div className="text-xs text-gray-400 mt-0.5">Unlimited searches</div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="h-16 bg-white/80 border-b flex items-center justify-between px-8 sticky top-0 z-10" style={{ borderColor: "#dcfce7", backdropFilter: "blur(10px)" }}>
          <div>
            <h1 className="font-black text-gray-900 text-lg">Flight Search</h1>
            <p className="text-xs" style={{ color: "#86efac" }}>Real-time inventory · Duffel API</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold" style={{ background: "#dcfce7", color: "#15803d" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block" />
              Live
            </div>
            <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600">JS</div>
          </div>
        </header>

        <div className="p-8 max-w-4xl mx-auto">
          {/* Search form */}
          <div className="bg-white rounded-3xl p-7 mb-8 shadow-sm" style={{ border: "1.5px solid #dcfce7" }}>
            {/* Route */}
            <div className="grid grid-cols-[1fr_auto_1fr] gap-4 mb-6 items-end">
              <div>
                <label className="text-xs font-bold uppercase tracking-widest mb-2.5 block" style={{ color: "#86efac" }}>Departure</label>
                <div className="flex items-center gap-3 px-5 py-4 rounded-full" style={{ border: "1.5px solid #bbf7d0", background: "#f0fdf4" }}>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "#dcfce7" }}>
                    <Plane className="h-3.5 w-3.5" style={{ color: "#15803d" }} />
                  </div>
                  <div>
                    <div className="font-black text-gray-900 text-base leading-none">LHR</div>
                    <div className="text-xs text-gray-400 mt-0.5">London Heathrow</div>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-center pb-1">
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "#dcfce7" }}>
                  <ArrowRight className="h-3.5 w-3.5" style={{ color: "#15803d" }} />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-widest mb-2.5 block" style={{ color: "#86efac" }}>Destination</label>
                <div className="flex items-center gap-3 px-5 py-4 rounded-full" style={{ border: "1.5px solid #bbf7d0", background: "#f0fdf4" }}>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "#dcfce7" }}>
                    <Plane className="h-3.5 w-3.5 rotate-45" style={{ color: "#15803d" }} />
                  </div>
                  <div>
                    <div className="font-black text-gray-900 text-base leading-none">JFK</div>
                    <div className="text-xs text-gray-400 mt-0.5">New York Kennedy</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              {[
                { label: "Date", value: "May 12, 2026", icon: null },
                { label: "Passengers", value: "2 Adults", icon: Users },
                { label: "Cabin", value: "Business", icon: null },
              ].map((f) => (
                <div key={f.label}>
                  <label className="text-xs font-bold uppercase tracking-widest mb-2.5 block" style={{ color: "#86efac" }}>{f.label}</label>
                  <div className="flex items-center gap-2 px-5 py-4 rounded-full bg-gray-50" style={{ border: "1.5px solid #f3f4f6" }}>
                    {f.icon && <f.icon className="h-4 w-4 text-gray-300" />}
                    <span className="font-semibold text-gray-700 text-sm">{f.value}</span>
                  </div>
                </div>
              ))}
            </div>

            <button className="w-full flex items-center justify-center gap-2 py-4 rounded-full font-bold text-sm text-white tracking-wide transition-all hover:shadow-lg hover:scale-[1.01]"
              style={{ background: "linear-gradient(135deg, #15803d 0%, #16a34a 100%)", boxShadow: "0 4px 20px rgba(21,128,61,0.25)" }}>
              <Search className="h-4 w-4" />
              Search Flights
            </button>
          </div>

          {/* Results */}
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-black text-gray-900">12 Flights Found</h2>
              <div className="flex gap-2">
                {["Price", "Duration", "Departure"].map((s) => (
                  <button key={s} className="px-3 py-1.5 rounded-full text-xs font-semibold transition-colors" style={s === "Price" ? { background: "#15803d", color: "white" } : { background: "white", color: "#6b7280", border: "1px solid #e5e7eb" }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              {[
                { airline: "BA", name: "British Airways", dep: "09:00", arr: "12:00", dur: "7h 00m", price: "£1,240", tag: "Best Value" },
                { airline: "AA", name: "American Airlines", dep: "11:30", arr: "14:45", dur: "7h 15m", price: "£1,380", tag: null },
                { airline: "VS", name: "Virgin Atlantic", dep: "15:00", arr: "18:20", dur: "7h 20m", price: "£1,420", tag: null },
              ].map((f, i) => (
                <div key={i} className="group bg-white rounded-2xl p-5 flex items-center gap-5 transition-all hover:shadow-md cursor-pointer"
                  style={{ border: "1.5px solid", borderColor: i === 0 ? "#86efac" : "#f3f4f6" }}>
                  <div className="w-12 h-12 rounded-full flex items-center justify-center font-black text-xs text-white flex-shrink-0"
                    style={{ background: "linear-gradient(135deg, #15803d, #16a34a)" }}>
                    {f.airline}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-gray-800">{f.name}</span>
                      {f.tag && <span className="px-2.5 py-0.5 rounded-full text-xs font-bold" style={{ background: "#dcfce7", color: "#15803d" }}>{f.tag}</span>}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-400">
                      <span className="text-gray-900 font-bold">{f.dep}</span>
                      <span>·</span>
                      <Clock className="h-3 w-3" />
                      <span className="text-xs">{f.dur}</span>
                      <span>·</span>
                      <span className="text-gray-900 font-bold">{f.arr}</span>
                      <span className="text-xs font-semibold" style={{ color: "#15803d" }}>Non-stop</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 flex-shrink-0">
                    <div className="text-right">
                      <div className="text-2xl font-black" style={{ color: "#15803d" }}>{f.price}</div>
                      <div className="text-xs text-gray-400">per person</div>
                    </div>
                    <button className="px-5 py-2.5 rounded-full text-xs font-bold text-white transition-all group-hover:scale-105"
                      style={{ background: "#15803d" }}>
                      Select →
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
