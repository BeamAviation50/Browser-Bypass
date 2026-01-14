"use client"

export function NewsTicker() {
  return (
    <div className="w-full bg-red-600 py-3 overflow-hidden relative">
      <style>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-100%);
          }
        }
        .news-scroll {
          animation: scroll 20s linear infinite;
          white-space: nowrap;
          display: inline-block;
          padding-right: 50px;
          position: relative;
          z-index: 10;
        }
      `}</style>
      <div className="flex items-center gap-12">
        <span className="news-scroll text-white text-sm font-semibold">
          Breaking News: Lightning Airways plans to retire all A321s for transatlantic flights, to be replaced with
          Airbus A330NEOs
        </span>
        <span className="news-scroll text-white text-sm font-semibold">
          Breaking News: Lightning Airways plans to retire all A321s for transatlantic flights, to be replaced with
          Airbus A330NEOs
        </span>
      </div>
    </div>
  )
}
