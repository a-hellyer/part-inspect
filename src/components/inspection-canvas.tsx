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
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        Add reject codes before recording rejects.
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      <div className="space-y-4">
        <div>
          <p className="mb-2 text-sm font-medium text-zinc-700">Reject code</p>
          <div className="space-y-2">
            {rejectCodes.map((code) => (
              <button
                key={code.id}
                type="button"
                disabled={readOnly}
                onClick={() => setSelectedCodeId(code.id)}
                className={`flex w-full items-center gap-3 rounded-lg border px-3 py-2 text-left text-sm transition ${
                  selectedCodeId === code.id
                    ? "border-zinc-900 bg-zinc-50"
                    : "border-zinc-200 hover:border-zinc-300"
                }`}
              >
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: code.color }}
                />
                <span>
                  <span className="font-medium">{code.code}</span>
                  <span className="block text-xs text-zinc-500">
                    {code.description}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </div>

        {!readOnly && (
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-zinc-700">Notes</span>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500"
              placeholder="Optional notes for next reject"
            />
          </label>
        )}

        {!readOnly && (
          <p className="text-xs text-zinc-500">
            Click on the part image to mark a reject at that location.
          </p>
        )}

        {message && (
          <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            {message}
          </p>
        )}
      </div>

      <div className="space-y-4">
        <div
          className={`relative overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100 ${
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
                className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white text-[10px] font-bold text-white shadow-md"
                style={{ backgroundColor: reject.rejectCode.color }}
              >
                {reject.rejectCode.code.slice(0, 3)}
              </span>
            </button>
          ))}
        </div>

        {rejects.length > 0 && (
          <div className="rounded-xl border border-zinc-200 bg-white p-4">
            <h3 className="mb-3 text-sm font-medium text-zinc-900">
              Rejects on this unit ({rejects.length})
            </h3>
            <ul className="space-y-2">
              {rejects.map((reject) => (
                <li
                  key={reject.id}
                  className="flex items-start gap-3 rounded-lg bg-zinc-50 px-3 py-2 text-sm"
                >
                  <span
                    className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: reject.rejectCode.color }}
                  />
                  <div>
                    <p className="font-medium text-zinc-900">
                      {reject.rejectCode.code} — {reject.rejectCode.description}
                    </p>
                    <p className="text-xs text-zinc-500">
                      Location: {(reject.x * 100).toFixed(1)}%,{" "}
                      {(reject.y * 100).toFixed(1)}%
                    </p>
                    {reject.notes && (
                      <p className="mt-1 text-xs text-zinc-600">{reject.notes}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
            {!readOnly && (
              <p className="mt-3 text-xs text-zinc-500">
                Click a marker on the image to remove that reject.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
