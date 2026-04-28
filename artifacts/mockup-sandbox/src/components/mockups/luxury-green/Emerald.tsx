import { useState } from "react";
import { Plane, Search, LayoutDashboard, ListFilter, ArrowLeftRight, Users, ChevronDown, Star, Clock } from "lucide-react";

export function Emerald() {
  const [activeNav, setActiveNav] = useState("search");
  const [cabin, setCabin] = useState("Business");

  return (
    <div className="flex h-screen font-['Inter'] bg-white overflow-hidden">
      {/* Deep emerald sidebar */}
      <aside className="w-64 flex-shrink-0 flex flex-col" style={{ background: "linear-gradient(180deg, #022c22 0%, #064e3b 60%, #065f46 100%)" }}>
        {/* Logo */}
        <div className="h-20 flex items-center px-7 border-b border-emerald-800/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, #d4af37, #f5d76e)" }}>
              <Plane className="h-4 w-4 text-emerald-900 rotate-45" />
            </div>
            <div>
              <div className="text-white font-bold text-base tracking-wide" style={{ fontFamily: "'Playfair Display', serif" }}>AeroOps</div>
              <div className="text-emerald-400 text-xs tracking-widest uppercase">Premium</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="p-5 space-y-1 flex-1">
          {[
            { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
            { id: "search", icon: Search, label: "Flight Search" },
            { id: "orders", icon: ListFilter, label: "Orders" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveNav(item.id)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-full text-sm font-medium transition-all"
              style={activeNav === item.id
                ? { background: "linear-gradient(135deg, #d4af37, #f5d76e)", color: "#022c22" }
                : { color: "#6ee7b7" }
              }
            >
              <item.icon className="h-4 w-4 flex-shrink-0" />
              {item.label}
            </button>
          ))}
        </nav>

        {/* User */}
        <div className="p-5 border-t border-emerald-800/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: "linear-gradient(135deg, #d4af37, #f5d76e)", color: "#022c22" }}>JS</div>
            <div>
              <div className="text-white text-sm font-semibold">James S.</div>
              <div className="text-emerald-400 text-xs">Admin</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col overflow-hidden bg-gray-50">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-8">
          <div>
            <div className="text-lg font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>Flight Search</div>
            <div className="text-xs text-gray-400 tracking-wide uppercase">Duffel Live Inventory</div>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-4 py-1.5 rounded-full text-xs font-semibold border" style={{ borderColor: "#064e3b", color: "#064e3b", background: "#f0fdf4" }}>
              ● Live
            </div>
            <Star className="h-5 w-5 text-amber-400 fill-amber-400" />
          </div>
        </header>

        <div className="flex-1 overflow-auto p-8">
          {/* Search Card */}
          <div className="rounded-3xl bg-white shadow-lg border border-gray-100 p-7 mb-6">
            {/* Route row */}
            <div className="flex gap-3 mb-5 items-end">
              <div className="flex-1">
                <label className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2 block">From</label>
                <div className="flex items-center gap-2 px-4 py-3.5 rounded-full border-2 border-emerald-100 bg-emerald-50/50 focus-within:border-emerald-500 transition-colors">
                  <Plane className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                  <span className="font-semibold text-gray-800">LHR</span>
                  <span className="text-gray-400 text-sm">— London Heathrow</span>
                </div>
              </div>
              <button className="mb-0.5 w-10 h-10 rounded-full flex items-center justify-center border-2 border-gray-200 hover:border-emerald-500 transition-colors text-gray-400 hover:text-emerald-600 flex-shrink-0">
                <ArrowLeftRight className="h-4 w-4" />
              </button>
              <div className="flex-1">
                <label className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2 block">To</label>
                <div className="flex items-center gap-2 px-4 py-3.5 rounded-full border-2 border-emerald-100 bg-emerald-50/50 focus-within:border-emerald-500 transition-colors">
                  <Plane className="h-4 w-4 text-emerald-600 flex-shrink-0 rotate-45" />
                  <span className="font-semibold text-gray-800">JFK</span>
                  <span className="text-gray-400 text-sm">— New York Kennedy</span>
                </div>
              </div>
            </div>

            {/* Details row */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2 block">Departure</label>
                <div className="px-4 py-3.5 rounded-full border-2 border-gray-100 bg-white font-medium text-gray-800 text-sm">
                  May 12, 2026
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2 block">Passengers</label>
                <div className="flex items-center gap-2 px-4 py-3.5 rounded-full border-2 border-gray-100 bg-white">
                  <Users className="h-4 w-4 text-gray-400" />
                  <span className="font-medium text-gray-800 text-sm">2 Adults</span>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2 block">Cabin Class</label>
                <div className="flex items-center justify-between px-4 py-3.5 rounded-full border-2 border-gray-100 bg-white cursor-pointer">
                  <span className="font-medium text-gray-800 text-sm">{cabin}</span>
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="flex justify-end">
              <button className="flex items-center gap-2 px-8 py-3.5 rounded-full text-sm font-bold tracking-wide transition-all hover:shadow-lg hover:scale-105"
                style={{ background: "linear-gradient(135deg, #064e3b 0%, #047857 100%)", color: "white", boxShadow: "0 4px 24px rgba(6,78,59,0.3)" }}>
                <Search className="h-4 w-4" />
                Search Flights
              </button>
            </div>
          </div>

          {/* Results */}
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>12 offers found</h2>
              <span className="text-xs text-gray-400 uppercase tracking-widest">Sorted by price</span>
            </div>
            {[
              { airline: "BA", name: "British Airways", dep: "09:00", arr: "12:00", stops: "Direct", dur: "7h 00m", price: "£1,240", badge: "Best Value" },
              { airline: "AA", name: "American Airlines", dep: "11:30", arr: "14:45", stops: "Direct", dur: "7h 15m", price: "£1,380", badge: null },
              { airline: "VS", name: "Virgin Atlantic", dep: "15:00", arr: "18:20", stops: "Direct", dur: "7h 20m", price: "£1,420", badge: null },
            ].map((f, i) => (
              <div key={i} className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5 flex items-center gap-5 hover:shadow-md transition-all hover:border-emerald-200">
                <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm text-white flex-shrink-0"
                  style={{ background: "linear-gradient(135deg, #064e3b, #047857)" }}>
                  {f.airline}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-semibold text-gray-800 text-sm">{f.name}</span>
                    {f.badge && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold" style={{ background: "#f0fdf4", color: "#065f46" }}>
                        {f.badge}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    <span className="font-bold text-gray-900">{f.dep}</span>
                    <div className="flex items-center gap-1.5 text-xs">
                      <div className="h-px w-8 bg-gray-200" />
                      <Plane className="h-3 w-3 text-gray-300" />
                      <div className="h-px w-8 bg-gray-200" />
                    </div>
                    <span className="font-bold text-gray-900">{f.arr}</span>
                    <span className="text-gray-400">·</span>
                    <Clock className="h-3 w-3" />
                    <span>{f.dur}</span>
                    <span className="text-gray-400">·</span>
                    <span className="text-green-600 font-medium">{f.stops}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <span className="text-2xl font-bold" style={{ color: "#064e3b" }}>{f.price}</span>
                  <button className="px-5 py-2 rounded-full text-xs font-bold text-white transition-all hover:shadow-md"
                    style={{ background: "linear-gradient(135deg, #064e3b, #047857)" }}>
                    Select →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
