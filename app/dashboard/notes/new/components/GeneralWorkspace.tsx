"use client";

type GeneralWorkspaceProps = {
  content: string;
  onContentChange: (value: string) => void;
  isSaving: boolean;
};

function GeneralWorkspace({ content, onContentChange, isSaving }: GeneralWorkspaceProps) {
  return (
    <div className="space-y-3">
      <textarea
        value={content}
        onChange={(e) => onContentChange(e.target.value)}
        placeholder="Write your note..."
        className="w-full min-h-[400px] p-4 text-base font-medium text-[#1A1D1E] bg-[#FFFFFF] dark:bg-[#1A1A1A] border border-[#E6E8EB] dark:border-[#2D2D2D] rounded-md outline-none resize-none leading-relaxed dark:text-[#E4E6EB] placeholder:text-[#687076]/50 dark:placeholder:text-[#A0A0A0]/35 focus:border-[#687076]/40 dark:focus:border-[#A0A0A0]/40 transition-colors duration-100 disabled:opacity-50"
        disabled={isSaving}
      />
    </div>
  );
}

export { GeneralWorkspace };
export type { GeneralWorkspaceProps };
