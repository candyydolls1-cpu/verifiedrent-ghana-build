export function BackgroundLogo() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-30 flex items-center justify-center overflow-hidden"
    >
      <img
        src="/verifiedrent-logo.png"
        alt=""
        className="vr-watermark-logo w-[560px] max-w-[85vw] object-contain opacity-[0.08] mix-blend-multiply"
      />
    </div>
  )
}
