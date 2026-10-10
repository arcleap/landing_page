import type { ReactNode } from "react";

// The Swiss frame every section opens with: a hairline rule, the number in the
// accent, the name as a mono label, and a running label on the right.
export function SectionHead({
  number,
  name,
  aside,
  id,
}: {
  number: string;
  name: string;
  aside: ReactNode;
  id?: string;
}) {
  return (
    <div className="sec-head" data-reveal>
      <span className="sec-num">{number}</span>
      <span className="sec-name" id={id}>{name}</span>
      <span className="sec-aside">{aside}</span>
    </div>
  );
}
