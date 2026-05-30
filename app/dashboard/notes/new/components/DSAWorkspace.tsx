"use client";

import { useCallback, useMemo } from "react";
import { Plus, Trash2 } from "lucide-react";
import { CodeEditor } from "@/components/CodeEditor";
import { SectionDivider } from "./SectionDivider";
import { InlineLabel } from "./InlineLabel";
import { InputField } from "./InputField";
import { Dropdown, DropdownOption } from "./Dropdown";
import { DSAData } from "@/types";
import { cn } from "@/lib/utils";

type DSAWorkspaceProps = {
  dsa: DSAData;
  updateDsa: (fields: Partial<DSAData>) => void;
  isSaving: boolean;
};

function DSAWorkspace({ dsa, updateDsa, isSaving }: DSAWorkspaceProps) {
  const setImplField = useCallback(
    (idx: number, field: keyof DSAData["implementations"][number], value: string) => {
      const next = [...dsa.implementations];
      next[idx] = { ...next[idx], [field]: value };
      updateDsa({ implementations: next });
    },
    [dsa.implementations, updateDsa]
  );

  const removeImplementation = useCallback(
    (idx: number) => {
      const next = [...dsa.implementations];
      next.splice(idx, 1);
      updateDsa({ implementations: next });
    },
    [dsa.implementations, updateDsa]
  );

  const addImplementation = useCallback(() => {
    updateDsa({
      implementations: [
        ...dsa.implementations,
        { language: "Java", code: "", timeComplexity: "", spaceComplexity: "" },
      ],
    });
  }, [dsa.implementations, updateDsa]);

  const difficultyOptions = useMemo(
    (): DropdownOption<DSAData["difficulty"]>[] => [
      { label: "Easy", value: "Easy" },
      { label: "Medium", value: "Medium" },
      { label: "Hard", value: "Hard" },
    ],
    []
  );

  const languageOptions = useMemo(
    (): DropdownOption<string>[] => [
      { label: "Java", value: "Java" },
      { label: "Python", value: "Python" },
      { label: "C++", value: "C++" },
    ],
    []
  );

  return (
    <div className="space-y-6">
      <div>
        <SectionDivider>Problem Details</SectionDivider>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <InlineLabel>Platform</InlineLabel>
            <InputField
              placeholder="LeetCode"
              value={dsa.platform}
              onChange={(e) => updateDsa({ platform: e.target.value })}
              disabled={isSaving}
            />
          </div>
          <div className="space-y-1.5">
            <InlineLabel>Difficulty</InlineLabel>
            <Dropdown
              ariaLabel="Difficulty"
              value={dsa.difficulty}
              onChange={(next) => updateDsa({ difficulty: next })}
              options={difficultyOptions}
            />
          </div>
          <div className="space-y-1.5">
            <InlineLabel>Pattern</InlineLabel>
            <InputField
              placeholder="Sliding Window"
              value={dsa.pattern}
              onChange={(e) => updateDsa({ pattern: e.target.value })}
              disabled={isSaving}
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <SectionDivider>Implementations</SectionDivider>
        <div className="space-y-4">
          {dsa.implementations.map((impl, idx) => (
            <div
              key={idx}
              className="rounded-lg border border-[#E6E8EB] bg-[#FFFFFF] dark:border-[#2D2D2D] dark:bg-[#1A1A1A] overflow-hidden shadow-sm"
            >
              <div className="flex items-center justify-between px-4 py-3 bg-[#F4F7F6]/50 dark:bg-[#111111]/40 border-b border-[#E6E8EB] dark:border-[#2D2D2D]">
                <div className="w-[120px]">
                  <Dropdown
                    ariaLabel="Language"
                    value={impl.language}
                    onChange={(next) => setImplField(idx, "language", next)}
                    options={languageOptions}
                  />
                </div>
                <button
                  onClick={() => removeImplementation(idx)}
                  disabled={isSaving}
                  className="p-1.5 rounded-full hover:bg-[#E6E8EB] dark:hover:bg-[#2D2D2D] text-[#687076] hover:text-red-500 dark:text-[#A0A0A0] dark:hover:text-red-400 transition-colors duration-100 disabled:opacity-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="p-4 bg-[#FFFFFF] dark:bg-[#1A1A1A]">
                <CodeEditor
                  language={impl.language}
                  value={impl.code}
                  onChange={(code) => setImplField(idx, "code", code)}
                />
              </div>
              <div className="grid grid-cols-2 border-t border-[#E6E8EB] dark:border-[#2D2D2D] bg-[#F4F7F6]/30 dark:bg-[#111111]/20">
                <div className="flex items-center gap-3 px-4 py-2.5 border-r border-[#E6E8EB] dark:border-[#2D2D2D]">
                  <span className="text-[10px] font-bold text-[#687076] uppercase tracking-wider dark:text-[#A0A0A0] shrink-0">
                    Time
                  </span>
                  <InputField
                    className="bg-transparent border-b border-[#E6E8EB]/60 text-sm font-mono text-[#1A1D1E] outline-none focus:border-[#687076]/40 pb-0.5 w-full placeholder:text-[#687076]/45 dark:border-[#2D2D2D]/60 dark:text-[#E4E6EB] dark:focus:border-[#A0A0A0]/40 transition-colors duration-100 dark:placeholder:text-[#A0A0A0]/35"
                    placeholder="O(n)"
                    value={impl.timeComplexity}
                    onChange={(e) => setImplField(idx, "timeComplexity", e.target.value)}
                    disabled={isSaving}
                  />
                </div>
                <div className="flex items-center gap-3 px-4 py-2.5">
                  <span className="text-[10px] font-bold text-[#687076] uppercase tracking-wider dark:text-[#A0A0A0] shrink-0">
                    Space
                  </span>
                  <InputField
                    className="bg-transparent border-b border-[#E6E8EB]/60 text-sm font-mono text-[#1A1D1E] outline-none focus:border-[#687076]/40 pb-0.5 w-full placeholder:text-[#687076]/45 dark:border-[#2D2D2D]/60 dark:text-[#E4E6EB] dark:focus:border-[#A0A0A0]/40 transition-colors duration-100 dark:placeholder:text-[#A0A0A0]/35"
                    placeholder="O(1)"
                    value={impl.spaceComplexity}
                    onChange={(e) => setImplField(idx, "spaceComplexity", e.target.value)}
                    disabled={isSaving}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={addImplementation}
          disabled={isSaving}
          className={cn(
            "flex items-center gap-1.5 px-3 h-8 rounded-full border border-[#E6E8EB] bg-[#FFFFFF] text-[11px] font-bold uppercase tracking-wide text-[#687076] hover:bg-[#F4F7F6] dark:border-[#2D2D2D] dark:bg-[#1A1A1A] dark:text-[#A0A0A0] dark:hover:bg-[#111111] transition-colors duration-100 disabled:opacity-50"
          )}
        >
          <Plus className="h-3 w-3" />
          Add Language
        </button>
      </div>

      <div className="space-y-3">
        <SectionDivider>Problem Statement</SectionDivider>
        <textarea
          value={dsa.problemStatement}
          onChange={(e) => updateDsa({ problemStatement: e.target.value })}
          placeholder="Describe the problem properties and core challenges..."
          className="w-full min-h-[140px] p-4 text-base font-medium bg-[#FFFFFF] dark:bg-[#1A1A1A] border border-[#E6E8EB] dark:border-[#2D2D2D] rounded-md outline-none resize-none dark:text-[#E4E6EB] placeholder:text-[#687076]/50 dark:placeholder:text-[#A0A0A0]/35 focus:border-[#687076]/40 dark:focus:border-[#A0A0A0]/40 transition-colors duration-100"
          disabled={isSaving}
        />
      </div>

      <div className="space-y-3">
        <SectionDivider>Notes</SectionDivider>
        <textarea
          value={dsa.notes}
          onChange={(e) => updateDsa({ notes: e.target.value })}
          placeholder="Analyze tricky edge cases, abstract complexity assumptions, or mathematical intuition models..."
          className="w-full min-h-[140px] p-4 text-base font-medium text-[#1A1D1E] bg-[#FFFFFF] dark:bg-[#1A1A1A] border border-[#E6E8EB] dark:border-[#2D2D2D] rounded-md outline-none resize-none dark:text-[#E4E6EB] placeholder:text-[#687076]/50 dark:placeholder:text-[#A0A0A0]/35 focus:border-[#687076]/40 dark:focus:border-[#A0A0A0]/40 transition-colors duration-100"
          disabled={isSaving}
        />
      </div>
    </div>
  );
}

export { DSAWorkspace };
