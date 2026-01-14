import Link from "next/link"
import Image from "next/image"

const footerLinks = {
  book: [
    { label: "Search Flights", href: "#" },
    { label: "Manage Booking", href: "#" },
    { label: "Flight Status", href: "#" },
    { label: "Check-in Online", href: "#" },
  ],
  travel: [
    { label: "Destinations", href: "#" },
    { label: "Travel Classes", href: "#" },
    { label: "Baggage", href: "#" },
    { label: "Special Assistance", href: "#" },
  ],
  rewards: [
    { label: "Join Now", href: "#" },
    { label: "Earn Miles", href: "#" },
    { label: "Redeem Miles", href: "#" },
    { label: "Partner Airlines", href: "#" },
  ],
  company: [
    { label: "About Us", href: "#" },
    { label: "Careers", href: "#" },
    { label: "Press", href: "#" },
    { label: "Contact", href: "#" },
  ],
}

export function Footer() {
  return (
    <footer className="bg-card border-t border-border">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-3 mb-6">
              <Image src="/images/image.png" alt="Lightning Airways Logo" width={40} height={40} className="rounded" />
              <span className="text-lg font-bold text-foreground">Lightning Airways</span>
            </Link>
            <p className="text-muted-foreground text-sm">Travel at the speed of lightning.</p>
          </div>

          <div>
            <h3 className="text-foreground font-semibold mb-4">Book</h3>
            <ul className="space-y-3">
              {footerLinks.book.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground text-sm hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-foreground font-semibold mb-4">Travel Info</h3>
            <ul className="space-y-3">
              {footerLinks.travel.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground text-sm hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-foreground font-semibold mb-4">Lightning Rewards</h3>
            <ul className="space-y-3">
              {footerLinks.rewards.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground text-sm hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-foreground font-semibold mb-4">Company</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground text-sm hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-muted-foreground text-sm">© 2026 Lightning Airways. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="#" className="text-muted-foreground text-sm hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link href="#" className="text-muted-foreground text-sm hover:text-foreground transition-colors">
              Terms of Service
            </Link>
            <Link href="#" className="text-muted-foreground text-sm hover:text-foreground transition-colors">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
