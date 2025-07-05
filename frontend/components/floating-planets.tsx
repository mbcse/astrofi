"use client"

export function FloatingPlanets() {
  const planets = [
    { size: "w-8 h-8", color: "from-purple-400 to-purple-600", top: "10%", left: "5%", delay: "0s", duration: "20s" },
    { size: "w-6 h-6", color: "from-gold-400 to-gold-600", top: "20%", right: "10%", delay: "2s", duration: "25s" },
    { size: "w-4 h-4", color: "from-pink-400 to-pink-600", top: "60%", left: "8%", delay: "4s", duration: "30s" },
    { size: "w-10 h-10", color: "from-blue-400 to-blue-600", top: "70%", right: "5%", delay: "1s", duration: "35s" },
    { size: "w-5 h-5", color: "from-green-400 to-green-600", top: "40%", left: "3%", delay: "3s", duration: "28s" },
    { size: "w-7 h-7", color: "from-red-400 to-red-600", top: "80%", right: "15%", delay: "5s", duration: "22s" },
  ]

  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      {planets.map((planet, index) => (
        <div
          key={index}
          className={`absolute ${planet.size} bg-gradient-to-r ${planet.color} rounded-full opacity-20 animate-float-slow`}
          style={{
            top: planet.top,
            left: planet.left,
            right: planet.right,
            animationDelay: planet.delay,
            animationDuration: planet.duration,
          }}
        >
          <div className="absolute inset-1 bg-gradient-to-br from-white/30 to-transparent rounded-full"></div>
        </div>
      ))}
    </div>
  )
}
