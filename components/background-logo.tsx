export function BackgroundLogo() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 flex items-center justify-center overflow-hidden"
    >
      <div className="vr-watermark-logo relative aspect-[3/2] h-[100vh] w-[200vw] min-w-[100vw] max-w-none overflow-hidden rounded-none opacity-[0.1] shadow-2xl sm:h-[100vh] sm:w-[180vw]">
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,#5c0715_0%,#5c0715_33.33%,#806200_33.33%,#806200_66.66%,#023820_66.66%,#023820_100%)]" /><div className="absolute inset-0 bg-[#030b18]/25" />
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
