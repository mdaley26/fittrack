"use client";

export function DeleteTemplateButton({
  templateId,
  templateName,
}: {
  templateId: string;
  templateName: string;
}) {
  async function handleDelete() {
    if (!confirm(`Delete template "${templateName}"?`)) return;
    await fetch(`/api/templates/${templateId}`, { method: "DELETE" });
    window.location.reload();
  }
  return (
    <button
      type="button"
      onClick={handleDelete}
      className="rounded-lg border border-slate-600 px-4 py-2 text-sm text-slate-400 hover:bg-slate-800 hover:text-slate-200"
    >
      Delete
    </button>
  );
}
