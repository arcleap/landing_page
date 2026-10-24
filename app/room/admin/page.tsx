import type { Metadata } from "next";
import { headers } from "next/headers";
import type { ReactNode } from "react";
import { Confirm } from "@/components/room/Confirm";
import { Copy } from "@/components/room/Copy";
import { Gate } from "@/components/room/Gate";
import { LocalTime } from "@/components/room/LocalTime";
import { RoomShell } from "@/components/room/RoomShell";
import { isAdmin, videos } from "@/lib/room";
import { clock, summarize, timeline, type Status, type Summary } from "@/lib/room-activity";
import { activity, hasStore, listInvites, SHARED, type Activity, type Invite } from "@/lib/room-store";
import { createLink, deleteLink, enterAdmin, lockAdmin, setLinkOn } from "./actions";

export const metadata: Metadata = {
  title: "Activity — ArcLeap AI",
  robots: { index: false, follow: false, nocache: true },
  alternates: { canonical: null },
};

const STATUS: Record<Status, string> = {
  new: "Not opened",
  link: "Opened the link",
  room: "In the room",
  watched: "Watched",
};
const TIMELINE_LINES = 60;

// The address investors are sent, on whatever host this page is served from (arcleap.ai in production).
async function origin() {
  const h = await headers();
  const host = (h.get("x-forwarded-host") ?? h.get("host") ?? "arcleap.ai").replace(/^www\./, "");
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

export default async function AdminPage({ searchParams }: PageProps<"/room/admin">) {
  if (!(await isAdmin())) {
    return (
      <RoomShell aside="Locked">
        <div className="grid room-intro">
          <h1 className="room-title">Activity.</h1>
          <div className="room-side">
            <p className="room-body">Jin’s view of who has opened the room.</p>
            <Gate action={enterAdmin} />
          </div>
        </div>
      </RoomShell>
    );
  }

  const ready = hasStore();
  const invites = ready ? await listInvites() : [];
  const logs = ready ? await activity([...invites.map((invite) => invite.id), SHARED]) : new Map<string, Activity>();
  const list = videos();
  const base = await origin();
  const { new: fresh } = await searchParams;
  const made = invites.find((invite) => invite.id === fresh);
  const empty: Activity = { log: [], plays: [] };
  const opened = invites.filter((invite) => summarize(logs.get(invite.id) ?? empty, list).status !== "new").length;
  const shared = logs.get(SHARED) ?? empty;

  return (
    <RoomShell aside="Activity" lock={lockAdmin}>
      <div className="grid room-intro">
        <h1 className="room-title">Activity.</h1>
        <div className="room-side">
          <p className="room-body">
            One link and passcode per investor. The link only opens with its own passcode, so whoever watches is on
            that investor’s record.
          </p>
        </div>
      </div>

      {!ready ? (
        <p className="room-empty">
          Links need the database: add Upstash Redis to this project in Vercel (Storage), then redeploy.
        </p>
      ) : (
        <>
          <section className="act">
            <div className="sec-head" data-revealed="">
              <span className="sec-num">01</span>
              <span className="sec-name">Links</span>
              <span className="sec-aside">
                {invites.length} made · {opened} opened
              </span>
            </div>

            <form className="act-new" action={createLink}>
              <label className="act-field">
                <span className="gate-label">Investor</span>
                <input className="gate-input" name="name" required maxLength={80} autoComplete="off" />
              </label>
              <label className="act-field">
                <span className="gate-label">Firm</span>
                <input className="gate-input" name="firm" maxLength={80} autoComplete="off" />
              </label>
              <button className="button" type="submit">
                <span>Make a link</span>
                <span aria-hidden="true">→</span>
              </button>
            </form>

            {made ? <Made invite={made} base={base} /> : null}

            {invites.length ? (
              <ol className="act-list">
                {invites.map((invite) => (
                  <Row key={invite.id} invite={invite} base={base} activity={logs.get(invite.id) ?? empty} />
                ))}
              </ol>
            ) : (
              <p className="room-empty">No links yet.</p>
            )}
          </section>

          <section className="act">
            <div className="sec-head" data-revealed="">
              <span className="sec-num">02</span>
              <span className="sec-name">Shared passcode</span>
              <span className="sec-aside">Not tied to anyone</span>
            </div>
            <p className="act-note">Visits with the room’s own passcode, from anyone who has it. Yours aren’t counted.</p>
            <ol className="act-list">
              <Row name="Anyone with it" activity={shared} />
            </ol>
          </section>
        </>
      )}
    </RoomShell>
  );
}

const message = (invite: Invite, base: string) => `${base}/room/i/${invite.token}\nPasscode: ${invite.code}`;

// The link just made, ready to paste into an email.
function Made({ invite, base }: { invite: Invite; base: string }) {
  return (
    <div className="act-made" role="status">
      <p className="gate-label">New link for {invite.name}</p>
      <pre className="act-message">{message(invite, base)}</pre>
      <div className="act-actions">
        <Copy text={message(invite, base)} label="Copy link and passcode" />
      </div>
    </div>
  );
}

function Row({ invite, name, base = "", activity }: { invite?: Invite; name?: string; base?: string; activity: Activity }) {
  const list = videos();
  const summary = summarize(activity, list);
  const lines = timeline(activity, list);
  const off = Boolean(invite?.revoked);

  return (
    <li className="act-item" id={invite?.id} data-off={off ? "" : undefined}>
      <div className="act-head">
        <p className="act-who">
          <span className="act-name">{invite?.name ?? name}</span>
          {invite?.firm ? <span className="act-firm">{invite.firm}</span> : null}
        </p>
        <p className="act-status" data-status={off ? "off" : summary.status}>
          {off ? "Turned off" : STATUS[summary.status]}
        </p>
        <p className="act-last">{summary.last ? <LocalTime t={summary.last} /> : "—"}</p>
      </div>

      <Stats summary={summary} />

      {invite ? (
        <div className="act-actions">
          <Copy text={message(invite, base)} label="Copy link and passcode" />
          <Copy text={`${base}/room/i/${invite.token}`} label="Link" />
          <Copy text={invite.code} label="Passcode" />
          <form action={setLinkOn}>
            <input type="hidden" name="id" value={invite.id} />
            <input type="hidden" name="on" value={off ? "1" : "0"} />
            <button className="act-action" type="submit">
              {off ? "Turn on" : "Turn off"}
            </button>
          </form>
          <form action={deleteLink}>
            <input type="hidden" name="id" value={invite.id} />
            <Confirm label="Delete" question={`Delete ${invite.name}’s link and everything it logged?`} />
          </form>
        </div>
      ) : null}

      {lines.length ? (
        <details className="act-log">
          <summary>Timeline · {lines.length}</summary>
          <ol>
            {lines.slice(0, TIMELINE_LINES).map((line, n) => (
              <li key={n}>
                <span className="act-when">
                  <LocalTime t={line.t} />
                </span>
                <span className="act-what">{line.text}</span>
                <span className="act-where">
                  {[line.device ? `Browser ${line.device}` : null, line.ua, line.at].filter(Boolean).join(" · ")}
                </span>
              </li>
            ))}
          </ol>
          {lines.length > TIMELINE_LINES ? <p className="act-note">And {lines.length - TIMELINE_LINES} earlier.</p> : null}
        </details>
      ) : null}
    </li>
  );
}

function Stats({ summary }: { summary: Summary }) {
  const plays = (n: number) => `${n} ${n === 1 ? "play" : "plays"}`;
  const items: [string, ReactNode][] = [
    ["Visits", summary.visits],
    ...summary.videos.map((video): [string, ReactNode] => {
      if (video.watched < 1) return [video.title, `${plays(video.plays)}, nothing watched`];
      const reached = video.dur ? `${Math.min(100, Math.round((video.far / video.dur) * 100))}%` : clock(video.far);
      return [video.title, `${clock(video.watched)} watched · up to ${reached} · ${plays(video.plays)}`];
    }),
    ["Deck", summary.deck],
    ["PDF", summary.pdf],
    ["Browsers", summary.devices],
  ];
  if (summary.places.length) items.push(["Places", summary.places.join(" · ")]);
  if (summary.fails) items.push(["Wrong passcodes", summary.fails]);
  if (summary.first) items.push(["First in", <LocalTime key="first" t={summary.first} />]);

  return (
    <dl className="act-stats">
      {items.map(([term, value], n) => (
        <div key={n}>
          <dt>{term}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  );
}
