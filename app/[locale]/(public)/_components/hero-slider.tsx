"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

const SLIDES = [
  { src: "/slide-1.png", alt: "SNC Beauty Salon & Spa" },
  { src: "/slide-2.png", alt: "SNC Beauty Salon & Spa" },
  { src: "/slide-3.png", alt: "SNC Beauty Salon & Spa" },
  { src: "/slide-4.png", alt: "SNC Beauty Salon & Spa" },
  { src: "/slide-5.png", alt: "SNC Beauty Salon & Spa" },
  { src: "/slide-6.png", alt: "SNC Beauty Salon & Spa" },
  { src: "/slide-7.png", alt: "SNC Beauty Salon & Spa" },
  { src: "/slide-8.png", alt: "SNC Beauty Salon & Spa" },
];

const INTERVAL = 5000;

interface Props {
  title: string;
  intro: string;
  servicesLabel: string;
  subtitle: string;
  cta: string;
  ctaSecondary: string;
  bookingUrl: string;
  servicesHref: string;
}

export function HeroSlider({
  title,
  intro,
  servicesLabel,
  subtitle,
  cta,
  ctaSecondary,
  bookingUrl,
  servicesHref,
}: Props) {
  const [current, setCurrent] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function goTo(index: number) {
    setCurrent(index);
  }

  function startTimer() {
    timerRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % SLIDES.length);
    }, INTERVAL);
  }

  function resetTimer() {
    if (timerRef.current) clearInterval(timerRef.current);
    startTimer();
  }

  useEffect(() => {
    startTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section className="relative h-[90vh] min-h-[560px] max-h-[860px] overflow-hidden bg-neutral-900">
      {/* Slides */}
      {SLIDES.map((slide, i) => (
        <div
          key={slide.src}
          aria-hidden={i !== current}
          className="absolute inset-0 transition-opacity duration-1000"
          style={{ opacity: i === current ? 1 : 0 }}
        >
          <Image
            src={slide.src}
            alt={slide.alt}
            fill
            priority={i === 0}
            sizes="100vw"
            className="object-cover"
            style={{
              transform: i === current ? "scale(1)" : "scale(1.05)",
              transition: "transform 8s ease",
            }}
          />
        </div>
      ))}

      {/* Dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 z-10 px-8 sm:px-14 pb-16 sm:pb-20">
        {/* Eyebrow */}
        <p className="mb-4 text-[11px] font-semibold tracking-[0.22em] uppercase text-amber-300">
          Elevate Your Beauty &amp; Wellness
        </p>

        {/* Title */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight mb-4 max-w-2xl">
          {title}
        </h1>

        {/* Intro sentence */}
        <p className="text-xs sm:text-sm text-white/70 max-w-xl leading-relaxed mb-3 font-light">
          {intro}
        </p>

        {/* Services label + list */}
        <p className="text-sm sm:text-base text-white max-w-2xl leading-relaxed mb-9 font-bold">
          {servicesLabel}{" "}
          {subtitle}
        </p>

        {/* CTAs */}
        <div className="flex flex-wrap gap-4">
          <a
            href={bookingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-pink-600 text-white text-sm font-semibold rounded-full hover:bg-pink-500 active:scale-95 transition-all shadow-lg shadow-pink-900/40"
          >
            {cta}
            <ArrowRight className="h-4 w-4" />
          </a>
          <a
            href={servicesHref}
            className="inline-flex items-center gap-2 px-8 py-3.5 border border-white/30 text-white text-sm font-semibold rounded-full hover:border-white/60 hover:bg-white/10 transition-all"
          >
            {ctaSecondary}
          </a>
        </div>

        {/* Dot navigation */}
        <div className="flex gap-2 mt-10" role="tablist" aria-label="Slide navigation">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              role="tab"
              aria-selected={i === current}
              aria-label={`Slide ${i + 1}`}
              onClick={() => {
                goTo(i);
                resetTimer();
              }}
              className="h-[3px] rounded-full transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
              style={{
                width: i === current ? 32 : 16,
                background: i === current ? "#d4a84b" : "rgba(255,255,255,0.3)",
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
