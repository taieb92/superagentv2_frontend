"use client";
export function TemplateCanvasPlaceholder() {
  return (
    <div className="flex-[3] bg-zinc-100/50 border border-zinc-200 overflow-hidden shadow-inner flex flex-col relative group min-h-[600px]">
      <div className="absolute inset-0 flex items-center justify-center p-12 overflow-auto">
        {/* Simulated PDF Page */}
        <div className="w-full max-w-[600px] aspect-[1/1.414] bg-white shadow-lg border border-zinc-200 relative transition-transform duration-200">
          {/* Mock Content Lines */}
          <div className="p-12 space-y-8 opacity-20 select-none pointer-events-none">
            <div className="h-4 bg-zinc-900 w-1/2 mb-8" />
            <div className="space-y-4">
              <div className="h-2 bg-zinc-400 w-full" />
              <div className="h-2 bg-zinc-400 w-full" />
              <div className="h-2 bg-zinc-400 w-3/4" />
            </div>
            <div className="grid grid-cols-2 gap-8">
              <div className="h-20 bg-zinc-100 border border-zinc-300" />
              <div className="h-20 bg-zinc-100 border border-zinc-300" />
            </div>
            <div className="space-y-4 mt-8">
              <div className="h-2 bg-zinc-400 w-full" />
              <div className="h-2 bg-zinc-400 w-5/6" />
              <div className="h-2 bg-zinc-400 w-4/5" />
            </div>
          </div>
          {/* Simulated Field Box (Selected) */}
          <div className="absolute top-[180px] left-[48px] w-[240px] h-[36px] bg-[#0F766E]/10 border-2 border-[#0F766E] flex items-center justify-center cursor-pointer shadow-sm z-10">
            <span className="text-[10px] font-bold text-[#0F766E] uppercase tracking-wider bg-white px-1 absolute -top-2 left-2 px-2 shadow-sm">
              Buyer Name
            </span>
          </div>
          {/* Simulated Field Box (Other) */}
          <div className="absolute top-[180px] right-[48px] w-[240px] h-[36px] bg-zinc-50 border border-zinc-300 border-dashed flex items-center justify-center cursor-pointer hover:bg-zinc-100 transition-colors">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
              Seller Name
            </span>
          </div>
        </div>
      </div>
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-500 shadow-sm">
        Page 1 of 14
      </div>
    </div>
  );
}
