"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Calendar } from "@/components/ui/calendar"
import { Sparkles, Star, Clock, MessageCircle, Video, CalendarIcon, CreditCard } from "lucide-react"
import Link from "next/link"

const astrologerData = {
  1: {
    name: "Luna Starweaver",
    specialty: "Love & Relationships",
    rating: 4.9,
    reviews: 234,
    price: "50 ASTRO",
    tokenSymbol: "LUNA",
    tokenPrice: "$2.45",
    services: [
      {
        name: "Love Reading",
        duration: "30 min",
        price: "50 ASTRO",
        description: "Deep dive into your romantic potential",
      },
      {
        name: "Compatibility Analysis",
        duration: "45 min",
        price: "75 ASTRO",
        description: "Compare charts with your partner",
      },
      {
        name: "Relationship Forecast",
        duration: "60 min",
        price: "100 ASTRO",
        description: "Year-ahead relationship predictions",
      },
    ],
  },
}

export default function BookSessionPage({ params }: { params: { id: string } }) {
  const [selectedService, setSelectedService] = useState("")
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [selectedTime, setSelectedTime] = useState("")
  const [sessionType, setSessionType] = useState("chat")
  const [questions, setQuestions] = useState("")
  const [birthInfo, setBirthInfo] = useState({
    date: "",
    time: "",
    location: "",
  })

  const astrologer = astrologerData[params.id as keyof typeof astrologerData]

  if (!astrologer) {
    return <div>Astrologer not found</div>
  }

  const timeSlots = [
    "09:00",
    "09:30",
    "10:00",
    "10:30",
    "11:00",
    "11:30",
    "14:00",
    "14:30",
    "15:00",
    "15:30",
    "16:00",
    "16:30",
    "19:00",
    "19:30",
    "20:00",
    "20:30",
    "21:00",
    "21:30",
  ]

  const selectedServiceData = astrologer.services.find((s) => s.name === selectedService)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="flex items-center justify-between p-4 lg:p-6">
        <Link href="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-gold-400 rounded-full flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-bold text-white">AstroFi</span>
        </Link>
        <Link href="/astrologers" className="text-purple-200 hover:text-white transition-colors">
          ← Back to Astrologers
        </Link>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Astrologer Info */}
          <div className="lg:col-span-1">
            <Card className="bg-white/5 border-purple-400/20 backdrop-blur-sm sticky top-8">
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <Avatar className="w-24 h-24 mx-auto mb-4">
                    <AvatarFallback className="bg-gradient-to-r from-purple-400 to-pink-400 text-white text-3xl font-bold">
                      {astrologer.name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <h2 className="text-2xl font-bold text-white mb-2">{astrologer.name}</h2>
                  <Badge variant="secondary" className="bg-purple-600/20 text-purple-200 mb-2">
                    {astrologer.specialty}
                  </Badge>
                  <div className="flex items-center justify-center space-x-1 mb-4">
                    <Star className="w-4 h-4 text-gold-400 fill-current" />
                    <span className="text-gold-400 font-semibold">{astrologer.rating}</span>
                    <span className="text-white/60">({astrologer.reviews} reviews)</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-gold-500/10 to-gold-600/10 rounded-lg p-4 border border-gold-400/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gold-400 font-semibold">${astrologer.tokenSymbol}</span>
                      <span className="text-white text-lg font-bold">{astrologer.tokenPrice}</span>
                    </div>
                    <p className="text-purple-200 text-sm">Current token price</p>
                  </div>

                  {selectedServiceData && (
                    <div className="bg-white/5 rounded-lg p-4">
                      <h4 className="text-white font-semibold mb-2">Selected Service</h4>
                      <div className="space-y-2">
                        <p className="text-purple-200">{selectedServiceData.name}</p>
                        <div className="flex justify-between">
                          <span className="text-white/70">Duration:</span>
                          <span className="text-white">{selectedServiceData.duration}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/70">Price:</span>
                          <span className="text-gold-400 font-semibold">{selectedServiceData.price}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Booking Form */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="bg-white/5 border-purple-400/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Book Your Session</CardTitle>
                <CardDescription className="text-purple-200">
                  Choose your service and preferred time for your astrological consultation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Service Selection */}
                <div className="space-y-4">
                  <Label className="text-white text-lg font-semibold">Select Service</Label>
                  <div className="grid gap-4">
                    {astrologer.services.map((service, index) => (
                      <div
                        key={index}
                        className={`p-4 rounded-lg border cursor-pointer transition-all ${
                          selectedService === service.name
                            ? "border-purple-400 bg-purple-400/10"
                            : "border-purple-400/20 bg-white/5 hover:bg-white/10"
                        }`}
                        onClick={() => setSelectedService(service.name)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-white font-semibold">{service.name}</h4>
                            <p className="text-purple-200 text-sm mt-1">{service.description}</p>
                            <div className="flex items-center space-x-4 mt-2 text-sm">
                              <div className="flex items-center space-x-1">
                                <Clock className="w-4 h-4 text-purple-400" />
                                <span className="text-white/70">{service.duration}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-gold-400 font-bold">{service.price}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Session Type */}
                <div className="space-y-4">
                  <Label className="text-white text-lg font-semibold">Session Type</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div
                      className={`p-4 rounded-lg border cursor-pointer transition-all ${
                        sessionType === "chat"
                          ? "border-purple-400 bg-purple-400/10"
                          : "border-purple-400/20 bg-white/5 hover:bg-white/10"
                      }`}
                      onClick={() => setSessionType("chat")}
                    >
                      <div className="text-center">
                        <MessageCircle className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                        <h4 className="text-white font-semibold">Text Chat</h4>
                        <p className="text-purple-200 text-sm">Written consultation</p>
                      </div>
                    </div>
                    <div
                      className={`p-4 rounded-lg border cursor-pointer transition-all ${
                        sessionType === "video"
                          ? "border-purple-400 bg-purple-400/10"
                          : "border-purple-400/20 bg-white/5 hover:bg-white/10"
                      }`}
                      onClick={() => setSessionType("video")}
                    >
                      <div className="text-center">
                        <Video className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                        <h4 className="text-white font-semibold">Video Call</h4>
                        <p className="text-purple-200 text-sm">Face-to-face session</p>
                        <Badge className="bg-gold-600 text-white text-xs mt-1">+20 ASTRO</Badge>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Date & Time Selection */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <Label className="text-white text-lg font-semibold">Select Date</Label>
                    <div className="bg-white/5 rounded-lg p-4">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        disabled={(date) => date < new Date() || date.getDay() === 0}
                        className="text-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label className="text-white text-lg font-semibold">Available Times</Label>
                    <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto">
                      {timeSlots.map((time) => (
                        <button
                          key={time}
                          onClick={() => setSelectedTime(time)}
                          className={`p-2 rounded text-sm transition-all ${
                            selectedTime === time
                              ? "bg-purple-600 text-white"
                              : "bg-white/5 text-purple-200 hover:bg-white/10"
                          }`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Birth Information */}
                <div className="space-y-4">
                  <Label className="text-white text-lg font-semibold">Birth Information (Optional)</Label>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="birthDate" className="text-white">
                        Birth Date
                      </Label>
                      <Input
                        id="birthDate"
                        type="date"
                        value={birthInfo.date}
                        onChange={(e) => setBirthInfo({ ...birthInfo, date: e.target.value })}
                        className="bg-white/10 border-purple-400/30 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="birthTime" className="text-white">
                        Birth Time
                      </Label>
                      <Input
                        id="birthTime"
                        type="time"
                        value={birthInfo.time}
                        onChange={(e) => setBirthInfo({ ...birthInfo, time: e.target.value })}
                        className="bg-white/10 border-purple-400/30 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="birthLocation" className="text-white">
                        Birth Location
                      </Label>
                      <Input
                        id="birthLocation"
                        placeholder="City, Country"
                        value={birthInfo.location}
                        onChange={(e) => setBirthInfo({ ...birthInfo, location: e.target.value })}
                        className="bg-white/10 border-purple-400/30 text-white placeholder:text-white/50"
                      />
                    </div>
                  </div>
                </div>

                {/* Questions */}
                <div className="space-y-4">
                  <Label className="text-white text-lg font-semibold">Questions or Focus Areas</Label>
                  <Textarea
                    placeholder="What would you like to focus on in this session? Any specific questions?"
                    value={questions}
                    onChange={(e) => setQuestions(e.target.value)}
                    className="bg-white/10 border-purple-400/30 text-white placeholder:text-white/50"
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Payment Summary */}
            <Card className="bg-gradient-to-r from-purple-600/10 to-gold-600/10 border-purple-400/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <CreditCard className="w-5 h-5 mr-2" />
                  Payment Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-purple-200">Service:</span>
                    <span className="text-white">{selectedServiceData?.name || "Select a service"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-200">Duration:</span>
                    <span className="text-white">{selectedServiceData?.duration || "-"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-200">Session Type:</span>
                    <span className="text-white capitalize">{sessionType}</span>
                  </div>
                  {sessionType === "video" && (
                    <div className="flex justify-between">
                      <span className="text-purple-200">Video Call Fee:</span>
                      <span className="text-gold-400">+20 ASTRO</span>
                    </div>
                  )}
                  <div className="border-t border-purple-400/20 pt-3">
                    <div className="flex justify-between text-lg font-semibold">
                      <span className="text-white">Total:</span>
                      <span className="text-gold-400">
                        {selectedServiceData
                          ? `${Number.parseInt(selectedServiceData.price) + (sessionType === "video" ? 20 : 0)} ASTRO`
                          : "- ASTRO"}
                      </span>
                    </div>
                  </div>
                </div>

                <Button
                  className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white"
                  size="lg"
                  disabled={!selectedService || !selectedDate || !selectedTime}
                >
                  <CalendarIcon className="w-5 h-5 mr-2" />
                  Book Session
                </Button>

                <p className="text-purple-200 text-sm text-center">
                  You'll receive a confirmation email with session details and payment instructions.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
