import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import arcleapMark from "@/design-assets/arcleap-logo-source.png";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Gate } from "@/components/room/Gate";
import { RoomVideo } from "@/components/room/RoomVideo";
import { footer } from "@/content/links";
import { hasDeck } from "@/lib/deck";
import { isUnlocked, videos } from "@/lib/room";
import { lock } from "./actions";

export const metadata: Metadata = {
  title: "Private room — ArcLeap AI",
  robots: { index: false, follow: false, nocache: true },
  alternates: { canonical: null },
};

export default async function RoomPage() {
  const unlocked = await isUnlocked();
  const list = unlocked ? videos() : [];

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
            {unlocked ? (
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
            <span className="sec-aside">{unlocked ? "Confidential" : "Locked"}</span>
          </div>

          {unlocked ? (
            <>
              <div className="grid room-intro">
                <h1 className="room-title">Demos.</h1>
                {hasDeck() ? (
                  // Plain links: these are route handlers, not pages.
                  <div className="room-side room-deck">
                    <a className="button" href="/room/deck">
                      <span>Deck</span>
                      <span aria-hidden="true">→</span>
                    </a>
                    <a className="text-link" href="/room/deck.pdf">
                      <span>PDF</span>
                      <span aria-hidden="true">↓</span>
                    </a>
                  </div>
                ) : null}
              </div>
              {list.length ? (
                <ol className="room-videos">
                  {list.map((video, i) => (
                    <RoomVideo key={video.id} video={video} index={i} />
                  ))}
                </ol>
              ) : (
                <p className="room-empty">Videos will appear here soon.</p>
              )}
            </>
          ) : (
            <div className="grid room-intro">
              <h1 className="room-title">Private.</h1>
              <div className="room-side">
                <p className="room-body">This page is locked.</p>
                <Gate />
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="container footer-bottom room-foot">
        <p>{footer.rights}</p>
        <a href={`mailto:${footer.email}`}>{footer.email}</a>
      </footer>
    </>
  );
}
