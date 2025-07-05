'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Star, MapPin, Calendar, Clock, Globe } from 'lucide-react'

interface Planet {
  name: string
  longitude: number
  latitude: number
  speed: number
  is_retro: boolean
  sign: string
  sign_longitude: number
  house: number
  nakshatra: string
  nakshatra_longitude: number
}

interface House {
  id: number
  name: string
  longitude: number
  latitude: number
  sign: string
  sign_longitude: number
}

interface ChartData {
  planets: Planet[]
  houses: House[]
  ascendant: string
  nakshatra: {
    name: string
    longitude: number
    latitude: number
    pada: number
    ruler: string
  }
  birthDetails: {
    date: string
    time: string
    latitude: number
    longitude: number
    timezone: number
  }
}

interface ChartVisualizationProps {
  chartData: ChartData
  name: string
  birthPlace: string
  className?: string
}

const zodiacSigns = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
]

const planetSymbols: Record<string, string> = {
  'Sun': '☉',
  'Moon': '☽',
  'Mercury': '☿',
  'Venus': '♀',
  'Mars': '♂',
  'Jupiter': '♃',
  'Saturn': '♄',
  'Uranus': '♅',
  'Neptune': '♆',
  'Pluto': '♇',
  'Rahu': '☊',
  'Ketu': '☋',
  'Ascendant': 'Asc'
}

const planetColors: Record<string, string> = {
  'Sun': 'text-yellow-500',
  'Moon': 'text-blue-500',
  'Mercury': 'text-green-500',
  'Venus': 'text-pink-500',
  'Mars': 'text-red-500',
  'Jupiter': 'text-purple-500',
  'Saturn': 'text-gray-500',
  'Uranus': 'text-cyan-500',
  'Neptune': 'text-indigo-500',
  'Pluto': 'text-black-500',
  'Rahu': 'text-orange-500',
  'Ketu': 'text-orange-500',
  'Ascendant': 'text-white'
}

// Square chart component
const SquareChart = ({ chartData }: { chartData: ChartData }) => {
  // Group planets by house
  const planetsByHouse: Record<number, Planet[]> = {}
  chartData.planets.forEach(planet => {
    if (!planetsByHouse[planet.house]) {
      planetsByHouse[planet.house] = []
    }
    planetsByHouse[planet.house].push(planet)
  })

  // House positions in the square chart (North Indian style)
  const housePositions = [
    { house: 4, row: 0, col: 0 }, { house: 3, row: 0, col: 1 }, { house: 2, row: 0, col: 2 }, { house: 1, row: 0, col: 3 },
    { house: 5, row: 1, col: 0 }, { house: 0, row: 1, col: 1 }, { house: 0, row: 1, col: 2 }, { house: 12, row: 1, col: 3 },
    { house: 6, row: 2, col: 0 }, { house: 0, row: 2, col: 1 }, { house: 0, row: 2, col: 2 }, { house: 11, row: 2, col: 3 },
    { house: 7, row: 3, col: 0 }, { house: 8, row: 3, col: 1 }, { house: 9, row: 3, col: 2 }, { house: 10, row: 3, col: 3 },
  ]

  const formatDegree = (longitude: number) => {
    const degreeInSign = longitude % 30
    return `${Math.floor(degreeInSign)}°`
  }

  const renderHouse = (houseNum: number, row: number, col: number) => {
    if (houseNum === 0) {
      return <div key={`${row}-${col}`} className="w-20 h-20 border border-gray-600"></div>
    }

    const planetsInHouse = planetsByHouse[houseNum] || []
    const isCorner = (row === 0 || row === 3) && (col === 0 || col === 3)
    
    return (
      <div 
        key={`${row}-${col}`} 
        className={`w-20 h-20 border border-gray-400 bg-white/5 backdrop-blur-sm relative flex flex-col items-center justify-center text-xs ${
          isCorner ? 'border-2 border-purple-400' : ''
        }`}
      >
        {/* House number */}
        <div className="absolute top-0 left-0 text-xs text-gray-400 font-bold p-1">
          {houseNum}
        </div>
        
        {/* Planets in this house */}
        <div className="flex flex-wrap items-center justify-center gap-1 mt-2">
          {planetsInHouse.map((planet, idx) => (
            <div key={idx} className="flex flex-col items-center">
              <span className={`text-lg ${planetColors[planet.name] || 'text-white'}`}>
                {planetSymbols[planet.name] || planet.name.substring(0, 2)}
              </span>
              <span className="text-xs text-gray-300">
                {formatDegree(planet.longitude)}
              </span>
              {planet.is_retro && (
                <span className="text-xs text-red-400">R</span>
              )}
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="text-center">
        <h3 className="text-white text-lg font-semibold mb-2">North Indian Style Chart</h3>
        <p className="text-purple-200 text-sm">Ascendant: {chartData.ascendant}</p>
      </div>
      
      <div className="grid grid-cols-4 gap-0 border-2 border-purple-400 bg-black/20 backdrop-blur-sm">
        {housePositions.map(({ house, row, col }) => renderHouse(house, row, col))}
      </div>
      
      <div className="text-center text-xs text-gray-400 max-w-md">
        <p>Houses are numbered 1-12. Planets are shown with their symbols and degrees.</p>
        <p>R = Retrograde motion</p>
      </div>
    </div>
  )
}

export function ChartVisualization({ chartData, name, birthPlace, className = '' }: ChartVisualizationProps) {
  console.log('ChartVisualization received chartData:', chartData);
  console.log('ChartVisualization chartData type:', typeof chartData);
  console.log('ChartVisualization chartData keys:', chartData ? Object.keys(chartData) : 'null');
  
  // Handle case where chartData might be undefined or null
  if (!chartData) {
    return (
      <div className={`space-y-6 ${className}`}>
        <Card className="bg-white/5 border-purple-400/20 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="text-center text-white">
              <p>Chart data is not available. Please try regenerating the chart.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatDegree = (longitude: number) => {
    const signIndex = Math.floor(longitude / 30)
    const degreeInSign = longitude % 30
    const sign = zodiacSigns[signIndex]
    return `${Math.floor(degreeInSign)}° ${sign}`
  }

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // Handle different possible birthDetails locations in the data structure
  const birthDetails = chartData.birthDetails || (chartData as any).metadata?.birthDetails || null;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Chart Header */}
      <Card className="bg-white/5 border-purple-400/20 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Star className="w-5 h-5 mr-2" />
            Natal Chart - {name}
          </CardTitle>
          <CardDescription className="text-purple-200">
            Your astrological birth chart
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            {birthDetails && (
              <>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-purple-400" />
                  <span className="text-white">{formatDate(birthDetails.date)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-purple-400" />
                  <span className="text-white">{formatTime(birthDetails.time)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-purple-400" />
                  <span className="text-white">{birthPlace}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Globe className="w-4 h-4 text-purple-400" />
                  <span className="text-white">
                    {birthDetails.latitude?.toFixed(2)}°, {birthDetails.longitude?.toFixed(2)}°
                  </span>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Visual Square Chart */}
      <Card className="bg-white/5 border-purple-400/20 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white">Birth Chart Visualization</CardTitle>
          <CardDescription className="text-purple-200">
            Traditional Vedic astrology chart with planetary positions
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <SquareChart chartData={chartData} />
        </CardContent>
      </Card>

      {/* Planetary Positions */}
      <Card className="bg-white/5 border-purple-400/20 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white">Planetary Positions</CardTitle>
          <CardDescription className="text-purple-200">
            Current positions of planets at birth
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {chartData.planets?.map((planet) => (
              <div key={planet.name} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-purple-400/20">
                <div className="flex items-center space-x-3">
                  <span className={`text-2xl ${planetColors[planet.name] || 'text-white'}`}>
                    {planetSymbols[planet.name] || '•'}
                  </span>
                  <div>
                    <div className="text-white font-medium">{planet.name}</div>
                    <div className="text-purple-200 text-sm">{planet.sign}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white text-sm">{formatDegree(planet.longitude)}</div>
                  <div className="text-purple-200 text-xs">
                    House {planet.house}
                    {planet.is_retro && <Badge variant="destructive" className="ml-1 text-xs">R</Badge>}
                  </div>
                </div>
              </div>
            )) || <div className="text-white">No planetary data available</div>}
          </div>
        </CardContent>
      </Card>

      {/* Houses */}
      <Card className="bg-white/5 border-purple-400/20 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white">House Positions</CardTitle>
          <CardDescription className="text-purple-200">
            Ascendant and house cusps
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 p-3 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-lg border border-purple-400/20">
            <div className="text-white font-medium">Ascendant (1st House)</div>
            <div className="text-purple-200 text-sm">{chartData.ascendant || 'Unknown'}</div>
          </div>
          
          {chartData.houses && chartData.houses.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {chartData.houses.slice(1, 13).map((house) => (
                <div key={house.id} className="p-3 bg-white/5 rounded-lg border border-purple-400/20">
                  <div className="text-white font-medium text-sm">House {house.id}</div>
                  <div className="text-purple-200 text-xs">{house.sign}</div>
                  <div className="text-purple-200 text-xs">{formatDegree(house.longitude)}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-white">No house data available</div>
          )}
        </CardContent>
      </Card>

      {/* Birth Star */}
      {chartData.nakshatra && (
        <Card className="bg-white/5 border-purple-400/20 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">Birth Star (Nakshatra)</CardTitle>
            <CardDescription className="text-purple-200">
              Your lunar mansion
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-gradient-to-r from-gold-600/20 to-yellow-600/20 rounded-lg border border-gold-400/20">
              <div className="text-gold-400 font-medium text-lg">{chartData.nakshatra.name}</div>
              <div className="text-gold-200 text-sm">Pada {chartData.nakshatra.pada}</div>
              <div className="text-gold-200 text-sm">Ruler: {chartData.nakshatra.ruler}</div>
              <div className="text-gold-200 text-sm">{formatDegree(chartData.nakshatra.longitude)}</div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default ChartVisualization 