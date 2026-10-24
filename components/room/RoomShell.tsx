import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import arcleapMark from "@/design-assets/arcleap-logo-source.png";
import { ThemeToggle } from "@/components/ThemeToggle";
import { footer } from "@/content/links";

// The frame around the room's pages: the site header (with Lock when `lock` is
// given), the section head, and the footer.
export function RoomShell({
  aside,
  lock,
  children,
}: {
  aside: string;
  lock?: () => Promise<void>;
  children: ReactNode;
}) {
  return (
    <>
      <header className="site-header">
        <div className="container nav-inner">
          <Link href="/" className="brand-link" aria-label="ArcLeap AI home">
            <span className="brand-mark" aria-hidden="true">
              <Image src={arcleapMark} alt="" fill sizes="42px" className="brand-mark-image" />
            </span>
            <span>ArcLeap AI</span>
          </Link>
          <div className="nav-links">
            {lock ? (
              <form action={lock}>
                <button className="room-lock" type="submit">Lock</button>
              </form>
            ) : null}
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main id="main-content" className="room">
        <div className="container">
          {/* Shown at once: the room has no scroll reveal. */}
          <div className="sec-head" data-revealed="">
            <span className="sec-num">00</span>
            <span className="sec-name">Private room</span>
            <span className="sec-aside">{aside}</span>
          </div>
          {children}
        </div>
      </main>

      <footer className="container footer-bottom room-foot">
        <p>{footer.rights}</p>
        <a href={`mailto:${footer.email}`}>{footer.email}</a>
      </footer>
    </>
  );
}
