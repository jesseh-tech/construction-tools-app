import Link from "next/link";

const tools = [
  { name: "Estimate", href: "/estimate", desc: "Build a cost estimate by CSI division.", live: true },
  { name: "Takeoff", href: "#", desc: "Quantity takeoffs.", live: false },
  { name: "Bid Leveling", href: "#", desc: "Compare and level bids.", live: false },
  { name: "Proposal", href: "#", desc: "Client proposals.", live: false },
  { name: "Change Orders", href: "#", desc: "Track change orders.", live: false },
  { name: "Daily Report", href: "#", desc: "Daily field reports.", live: false },
  { name: "Pay Application", href: "#", desc: "Payment applications.", live: false },
  { name: "Schedule of Values", href: "#", desc: "SOV management.", live: false },
  { name: "Submittals", href: "#", desc: "Track submittals.", live: false },
];

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-12">
      <header className="mb-10">
        <div className="mb-2 flex items-center gap-3">
          <span className="rounded-full bg-[#15212d] px-3 py-1 text-sm font-bold tracking-widest text-white">
            10 CENT
          </span>
          <span className="text-sm font-semibold tracking-widest text-[#f5a623]">
            CONSTRUCTION TOOLS
          </span>
        </div>
        <h1 className="text-3xl font-bold">Your construction toolkit</h1>
        <p className="mt-2 max-w-2xl text-gray-600">
          Pick a tool to get started. The assistant in the bottom-right corner can fill
          out any tool for you — just describe what you have.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((t) => {
          const card = (
            <div
              className={`flex h-full flex-col rounded-xl border border-gray-200 bg-white p-5 transition ${
                t.live ? "hover:border-[#15212d] hover:shadow-md" : "opacity-60"
              }`}
            >
              <div className="flex items-center gap-2">
                <h2 className="font-semibold">{t.name}</h2>
                {!t.live && (
                  <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                    Soon
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-gray-500">{t.desc}</p>
            </div>
          );
          return t.live ? (
            <Link key={t.name} href={t.href}>
              {card}
            </Link>
          ) : (
            <div key={t.name}>{card}</div>
          );
        })}
      </div>
    </main>
  );
}
