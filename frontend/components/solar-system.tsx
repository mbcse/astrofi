"use client"

import { useRef } from "react"

export function SolarSystem() {
  const containerRef = useRef<HTMLDivElement>(null)

  return (
    <div ref={containerRef} className="relative w-full h-full flex items-center justify-center">
      {/* Sun */}
      <div className="absolute w-24 h-24 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full shadow-2xl shadow-yellow-500/40 animate-pulse z-10">
        <div className="absolute inset-3 bg-gradient-to-r from-yellow-300 to-orange-400 rounded-full animate-spin-slow"></div>
        <div className="absolute inset-6 bg-gradient-to-r from-yellow-200 to-orange-300 rounded-full"></div>
      </div>

      {/* Orbital Rings */}
      {[120, 180, 240, 300, 360, 420, 480].map((size, index) => (
        <div
          key={index}
          className="absolute border border-white/5 rounded-full"
          style={{
            width: `${size}px`,
            height: `${size}px`,
            animation: `spin ${30 + index * 15}s linear infinite`,
          }}
        />
      ))}

      {/* Planets */}
      {[
        { size: 120, color: "from-gray-400 to-gray-600", speed: 30, planetSize: "w-4 h-4" },
        { size: 180, color: "from-orange-400 to-red-500", speed: 45, planetSize: "w-5 h-5" },
        { size: 240, color: "from-blue-400 to-blue-600", speed: 60, planetSize: "w-5 h-5" },
        { size: 300, color: "from-red-400 to-red-600", speed: 75, planetSize: "w-4 h-4" },
        { size: 360, color: "from-yellow-600 to-orange-700", speed: 90, planetSize: "w-7 h-7" },
        { size: 420, color: "from-blue-600 to-indigo-700", speed: 105, planetSize: "w-6 h-6" },
        { size: 480, color: "from-purple-500 to-indigo-600", speed: 120, planetSize: "w-5 h-5" },
      ].map((planet, index) => (
        <div
          key={index}
          className="absolute"
          style={{
            width: `${planet.size}px`,
            height: `${planet.size}px`,
            animation: `spin ${planet.speed}s linear infinite`,
          }}
        >
          <div
            className={`${planet.planetSize} bg-gradient-to-r ${planet.color} rounded-full shadow-lg absolute -top-2 left-1/2 transform -translate-x-1/2`}
          >
            <div className="absolute inset-0.5 bg-gradient-to-br from-white/30 to-transparent rounded-full"></div>
          </div>
        </div>
      ))}

      {/* Asteroid Belt */}
      <div className="absolute w-96 h-96 border border-dashed border-purple-400/10 rounded-full">
        {[...Array(20)].map((_, index) => (
          <div
            key={index}
            className="absolute w-1 h-1 bg-purple-400/40 rounded-full animate-pulse"
            style={{
              top: "50%",
              left: "50%",
              transform: `rotate(${index * 18}deg) translateX(192px) translateY(-50%)`,
              animationDelay: `${index * 0.3}s`,
            }}
          />
        ))}
      </div>

      {/* Outer Cosmic Ring */}
      <div className="absolute w-[600px] h-[600px] border border-white/5 rounded-full animate-reverse-spin opacity-50"></div>
    </div>
  )
}
