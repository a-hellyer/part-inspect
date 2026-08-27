"use client";

import { useCallback, useState } from "react";
import { addRejectAction, deleteRejectAction } from "@/app/actions/app";

type RejectCode = {
  id: string;
  code: string;
  description: string;
  color: string;
};

type ExistingReject = {
  id: string;
  x: number;
  y: number;
  notes: string | null;
  rejectCode: RejectCode;
};

type Props = {
  partUnitId: string;
  batchId: string;
  imageUrl: string;
  rejectCodes: RejectCode[];
  existingRejects: ExistingReject[];
  readOnly?: boolean;
};

export function InspectionCanvas({
  partUnitId,
  batchId,
  imageUrl,
  rejectCodes,
  existingRejects,
  readOnly = false,
}: Props) {
  const [selectedCodeId, setSelectedCodeId] = useState(rejectCodes[0]?.id ?? "");
  const [notes, setNotes] = useState("");
  const [rejects, setRejects] = useState(existingRejects);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleClick = useCallback(
    async (event: React.MouseEvent<HTMLDivElement>) => {
      if (readOnly || !selectedCodeId || pending) return;

      const rect = event.currentTarget.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;

      setPending(true);
      setMessage(null);

      const result = await addRejectAction({
        partUnitId,
        rejectCodeId: selectedCodeId,
        x,
        y,
        notes: notes || undefined,
      });

      if (result.error) {
        setMessage(result.error);
      } else {
        const code = rejectCodes.find((c) => c.id === selectedCodeId)!;
        setRejects((prev) => [
          ...prev,
          {
            id: `temp-${Date.now()}`,
            x,
            y,
            notes: notes || null,
            rejectCode: code,
          },
        ]);
        setNotes("");
        setMessage("Reject recorded");
        window.location.reload();
      }

      setPending(false);
    },
    [readOnly, selectedCodeId, pending, partUnitId, notes, rejectCodes],
  );

  const handleDelete = async (rejectId: string) => {
    if (readOnly || pending) return;
    setPending(true);
    await deleteRejectAction(rejectId, batchId);
    setRejects((prev) => prev.filter((r) => r.id !== rejectId));
    setPending(false);
    window.location.reload();
  };

  if (rejectCodes.length === 0) {
    return (
      <div className="rounded-xl border border-warning/20 bg-warning/10 p-4 text-sm text-warning">
        Add reject codes before recording rejects.
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
      <div className="space-y-5">
        <div>
          <p className="pi-label mb-2.5">Reject code</p>
          <div className="space-y-1.5">
            {rejectCodes.map((code) => (
              <button
                key={code.id}
                type="button"
                disabled={readOnly}
                onClick={() => setSelectedCodeId(code.id)}
                className={`flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left text-sm transition ${
                  selectedCodeId === code.id
                    ? "border-border-strong bg-white/[0.05]"
                    : "border-transparent bg-transparent hover:bg-white/[0.03]"
                }`}
              >
                <span
                  className="h-2.5 w-2.5 rounded-full ring-2 ring-white/10"
                  style={{ backgroundColor: code.color }}
                />
                <span>
                  <span className="pi-mono font-medium text-foreground">
                    {code.code}
                  </span>
                  <span className="block text-xs text-muted">
                    {code.description}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </div>

        {!readOnly && (
          <label className="block space-y-1.5">
            <span className="pi-label">Notes</span>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="pi-input resize-none"
              placeholder="Optional notes for next reject"
            />
          </label>
        )}

        {!readOnly && (
          <p className="text-xs leading-relaxed text-muted-dim">
            Click on the part image to mark a reject at that location.
          </p>
        )}

        {message && (
          <p className="rounded-lg border border-success/20 bg-success/10 px-3 py-2 text-sm text-success">
            {message}
          </p>
        )}
      </div>

      <div className="space-y-4">
        <div
          className={`relative overflow-hidden rounded-xl border border-border bg-[#0c0d0f] ${
            readOnly ? "cursor-default" : "cursor-crosshair"
          }`}
          onClick={handleClick}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt="Part for inspection"
            className="block w-full select-none"
            draggable={false}
          />
          {rejects.map((reject) => (
            <button
              key={reject.id}
              type="button"
              title={`${reject.rejectCode.code}: ${reject.rejectCode.description}${reject.notes ? ` — ${reject.notes}` : ""}`}
              onClick={(e) => {
                e.stopPropagation();
                if (!readOnly && !reject.id.startsWith("temp-")) {
                  handleDelete(reject.id);
                }
              }}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{
                left: `${reject.x * 100}%`,
                top: `${reject.y * 100}%`,
              }}
            >
              <span
                className="pi-mono flex h-7 w-7 items-center justify-center rounded-full border border-white/40 text-[9px] font-semibold text-white shadow-[0_0_0_3px_rgba(0,0,0,0.45)]"
                style={{ backgroundColor: reject.rejectCode.color }}
              >
                {reject.rejectCode.code.slice(0, 3)}
              </span>
            </button>
          ))}
        </div>

        {rejects.length > 0 && (
          <div className="pi-card p-4">
            <h3 className="pi-label mb-3">
              Rejects on this unit · {rejects.length}
            </h3>
            <ul className="space-y-1.5">
              {rejects.map((reject) => (
                <li
                  key={reject.id}
                  className="flex items-start gap-3 rounded-lg bg-white/[0.03] px-3 py-2.5 text-sm"
                >
                  <span
                    className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: reject.rejectCode.color }}
                  />
                  <div>
                    <p className="text-foreground">
                      <span className="pi-mono font-medium">
                        {reject.rejectCode.code}
                      </span>
                      <span className="text-muted">
                        {" "}
                        — {reject.rejectCode.description}
                      </span>
                    </p>
                    <p className="pi-mono mt-0.5 text-[11px] text-muted-dim">
                      {(reject.x * 100).toFixed(1)}%, {(reject.y * 100).toFixed(1)}%
                    </p>
                    {reject.notes && (
                      <p className="mt-1 text-xs text-muted">{reject.notes}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
            {!readOnly && (
              <p className="mt-3 text-xs text-muted-dim">
                Click a marker on the image to remove that reject.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
