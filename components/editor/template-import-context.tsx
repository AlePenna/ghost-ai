"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  type ReactNode,
  type RefObject,
} from "react";

import type { CanvasTemplate } from "@/components/editor/starter-templates";

type TemplateImporter = (template: CanvasTemplate) => void;

/**
 * Bridges the navbar (outside the Liveblocks room) and the canvas (inside it):
 * the canvas registers its importer here, and the templates modal calls it.
 */
const TemplateImportContext =
  createContext<RefObject<TemplateImporter | null> | null>(null);

export function TemplateImportProvider({
  importerRef,
  children,
}: {
  importerRef: RefObject<TemplateImporter | null>;
  children: ReactNode;
}) {
  return (
    <TemplateImportContext.Provider value={importerRef}>
      {children}
    </TemplateImportContext.Provider>
  );
}

/** Owner side: a ref holding the mounted canvas's importer, if any. */
export function useTemplateImporterRef() {
  return useRef<TemplateImporter | null>(null);
}

/** Canvas side: registers `importer` while mounted. No-op outside a provider. */
export function useRegisterTemplateImporter(importer: TemplateImporter) {
  const importerRef = useContext(TemplateImportContext);

  useEffect(() => {
    if (!importerRef) return;
    importerRef.current = importer;
    return () => {
      if (importerRef.current === importer) importerRef.current = null;
    };
  }, [importerRef, importer]);
}
