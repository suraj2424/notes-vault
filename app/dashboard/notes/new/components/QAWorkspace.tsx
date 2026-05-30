"use client";

import { useCallback } from "react";
import { Plus, X } from "lucide-react";
import { QAData } from "@/types";
import { SectionDivider } from "./SectionDivider";
import { cn } from "@/lib/utils";

type QAWorkspaceProps = {
  qa: QAData;
  setQa: React.Dispatch<React.SetStateAction<QAData>>;
  isSaving: boolean;
};

function QAWorkspace({ qa, setQa, isSaving }: QAWorkspaceProps) {
  const updateImportantPoint = useCallback(
    (idx: number, value: string) => {
      const next = [...qa.importantPoints];
      next[idx] = value;
      setQa({ ...qa, importantPoints: next });
    },
    [qa, setQa]
  );

  const insertImportantPoint = useCallback(() => {
    setQa({ ...qa, importantPoints: [...qa.importantPoints, ""] });
  }, [qa, setQa]);

  const removeImportantPoint = useCallback(
    (idx: number) => {
      const next = [...qa.importantPoints];
      next.splice(idx, 1);
      setQa({ ...qa, importantPoints: next });
    },
    [qa, setQa]
  );

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <SectionDivider>Detailed Answer</SectionDivider>
        <textarea
          value={qa.content}
          onChange={(e) => setQa({ ...qa, content: e.target.value })}
          placeholder="Document structural mechanics, architectural design tradeoffs, or precise operational definitions..."
          className="w-full min-h-[280px] p-4 text-base font-medium bg-[#FFFFFF] dark:bg-[#1A1A1A] border border-[#E6E8EB] dark:border-[#2D2D2D] rounded-md outline-none resize-none dark:text-[#E4E6EB] placeholder:text-[#687076]/50 dark:placeholder:text-[#A0A0A0]/35 focus:border-[#687076]/40 dark:focus:border-[#A0A0A0]/40 transition-colors duration-100 disabled:opacity-50"
          disabled={isSaving}
        />
      </div>

      <div className="space-y-3">
        <SectionDivider>Key Takeaways</SectionDivider>
        <div className="space-y-3">
          {qa.importantPoints.map((p, i) => (
            <div key={i} className="flex items-center gap-3 group">
              <div className="h-1.5 w-1.5 rounded-full bg-[#687076]/50 dark:bg-[#A0A0A0]/50 shrink-0" />
              <input
                value={p}
                onChange={(e) => updateImportantPoint(i, e.target.value)}
                className="flex-1 bg-transparent border-b border-[#E6E8EB] dark:border-[#2D2D2D] py-1 text-base font-medium outline-none focus:border-[#687076]/40 dark:focus:border-[#A0A0A0]/40 dark:text-[#E4E6EB] transition-colors duration-100 placeholder:text-[#687076]/40 dark:placeholder:text-[#A0A0A0]/30 disabled:opacity-50"
                placeholder="State critical architecture milestone or key takeaway concept..."
                disabled={isSaving}
              />
              <button
                onClick={() => removeImportantPoint(i)}
                disabled={isSaving}
                className="p-1 text-[#687076]/40 hover:text-red-500 dark:text-[#A0A0A0]/40 dark:hover:text-red-400 rounded-full transition-colors duration-100 opacity-100 md:opacity-0 md:group-hover:opacity-100 disabled:opacity-50"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
          <button
            onClick={insertImportantPoint}
            disabled={isSaving}
            className={cn(
              "flex items-center gap-1.5 mt-2 text-[11px] font-bold uppercase tracking-wide text-[#687076] hover:text-[#1A1D1E] dark:text-[#A0A0A0] dark:hover:text-[#E4E6EB] transition-colors duration-100 disabled:opacity-50"
            )}
          >
            <Plus className="h-3 w-3" />
            Add Point
          </button>
        </div>
      </div>
    </div>
  );
}

export { QAWorkspace };
export type { QAWorkspaceProps };
