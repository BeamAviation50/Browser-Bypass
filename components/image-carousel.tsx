"use client"

import { useEffect, useState } from "react"

interface CarouselImage {
  src: string
  alt: string
}

const CAROUSEL_IMAGES: CarouselImage[] = [
  {
    src: "/images/cityscape.png",
    alt: "Cityscape aerial view from aircraft window",
  },
  {
    src: "/images/turquoise.png",
    alt: "Turquoise water and islands view from aircraft",
  },
  {
    src: "/images/flightplan.png",
    alt: "Flight planning interface with map",
  },
  {
    src: "/images/tarmac.png",
    alt: "Lightning Airways aircraft on airport tarmac",
  },
]

export function ImageCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % CAROUSEL_IMAGES.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative w-full h-full overflow-hidden">
      {CAROUSEL_IMAGES.map((image, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1500 ease-in-out ${
            index === currentIndex ? "opacity-100" : "opacity-0"
          }`}
          style={{
            backgroundImage: `url('${image.src}')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            pointerEvents: "none",
          }}
        />
      ))}
    </div>
  )
}
