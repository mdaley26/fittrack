"use client";

import { useState } from "react";
import { CreateTemplateModal } from "./CreateTemplateModal";

type Template = {
  id: string;
  name: string;
  exercises: Array<{ exercise: { name: string } }>;
};

export function TemplatesList({ templates }: { templates: Template[] }) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setModalOpen(true)}
        className="rounded-lg bg-brand-600 px-4 py-2.5 font-medium text-white hover:bg-brand-500"
      >
        + Create template
      </button>
      <CreateTemplateModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
