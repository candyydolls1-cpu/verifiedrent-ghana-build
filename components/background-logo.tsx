export function BackgroundLogo() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-30 flex items-center justify-center overflow-hidden"
    >
      <div className="vr-watermark-logo relative aspect-[3/2] w-[560px] max-w-[85vw] overflow-hidden rounded-[2rem] opacity-[0.12] shadow-2xl">
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,#ce1126_0%,#ce1126_33.33%,#fcd116_33.33%,#fcd116_66.66%,#006b3f_66.66%,#006b3f_100%)]" />
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[clamp(4rem,12vw,9rem)] leading-none text-black/80" aria-hidden="true">★</span>
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="grid size-[46%] place-items-center rounded-full bg-white/85 p-4 shadow-xl backdrop-blur-sm sm:p-7">
            <img src="/verifiedrent-logo.png" alt="" className="size-full object-contain" />
          </span>
        </span>
      </div>
    </div>
  )
}
